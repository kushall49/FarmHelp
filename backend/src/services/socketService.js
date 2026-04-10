const Operator = require('../models/Operator');
const ServiceRequest = require('../models/ServiceRequest');

// Keep track of active requests and their searching state
const activeSearches = new Map();
// Keep track of which socket belongs to which operator/farmer (for disconnections)
const userSockets = new Map(); 

const initSocketService = (io) => {
  io.on('connection', (socket) => {
    console.log(`New socket connected: ${socket.id}`);

    // ==========================================
    // OPERATOR EVENTS
    // ==========================================

    socket.on('operator:goOnline', async ({ operatorId, location }) => {
      try {
        userSockets.set(socket.id, { type: 'operator', id: operatorId });
        await Operator.findByIdAndUpdate(operatorId, {
          isOnline: true,
          'location.coordinates': location.coordinates
        });
        socket.join(`operator_${operatorId}`); // Join a personal operator room
        console.log(`Operator ${operatorId} went online`);
      } catch (err) {
        console.error('Error in operator:goOnline', err);
      }
    });

    socket.on('operator:goOffline', async ({ operatorId }) => {
      try {
        await Operator.findByIdAndUpdate(operatorId, { isOnline: false });
        socket.leave(`operator_${operatorId}`);
        userSockets.delete(socket.id);
        console.log(`Operator ${operatorId} went offline`);
      } catch (err) {
        console.error('Error in operator:goOffline', err);
      }
    });

    socket.on('operator:updateLocation', async ({ operatorId, location, activeRequestId }) => {
      try {
        await Operator.findByIdAndUpdate(operatorId, {
          'location.coordinates': location.coordinates
        });
        
        // If they are on an active job, emit location directly to the farmer
        if (activeRequestId) {
          const request = await ServiceRequest.findById(activeRequestId);
          if (request && request.status !== 'COMPLETED' && request.status !== 'CANCELLED') {
            io.to(`farmer_${request.farmerId}`).emit('operator:locationUpdate', {
              operatorId,
              coordinates: location.coordinates
            });
          }
        }
      } catch (err) {
        console.error('Error in operator:updateLocation', err);
      }
    });

    socket.on('operator:acceptRequest', async ({ requestId, operatorId }) => {
      try {
        const searchCtx = activeSearches.get(requestId);
        if (searchCtx) {
          clearTimeout(searchCtx.timeout); // Stop the 20-second timer
          activeSearches.delete(requestId);
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 mins from now

        const request = await ServiceRequest.findByIdAndUpdate(requestId, {
          operatorId: operatorId,
          status: 'ACCEPTED',
          otp,
          otpExpiry
        }, { new: true }).populate('operatorId').populate('farmerId');

        if (!request) return;

        // Emit success to farmer (passing operator details and OTP)
        io.to(`farmer_${request.farmerId}`).emit('request:accepted', {
          request,
          otp // Send OTP to farmer
        });
        
        // Let the operator know they successfully accepted it
        socket.emit('operator:jobConfirmed', request);
      } catch (err) {
        console.error('Error in operator:acceptRequest', err);
      }
    });

    socket.on('operator:rejectRequest', ({ requestId }) => {
       // Trigger the next operator in the matching queue
       const searchCtx = activeSearches.get(requestId);
       if (searchCtx) {
         clearTimeout(searchCtx.timeout);
         pingNextOperator(requestId, io);
       }
    });

    socket.on('operator:verifyOTP', async ({ requestId, enteredOtp }) => {
      try {
        const request = await ServiceRequest.findById(requestId);
        if (!request) return;

        if (request.otp === enteredOtp && request.otpExpiry > new Date()) {
          request.status = 'OTP_VERIFIED';
          request.startTime = new Date();
          await request.save();

          io.to(`farmer_${request.farmerId}`).emit('request:otpVerified', request);
          socket.emit('request:otpVerified', request);
        } else {
          socket.emit('error', { message: 'Invalid or expired OTP' });
        }
      } catch (err) {
        console.error('Error in operator:verifyOTP', err);
      }
    });

    socket.on('operator:markComplete', async ({ requestId }) => {
      try {
        const request = await ServiceRequest.findByIdAndUpdate(requestId, {
          status: 'COMPLETED',
          endTime: new Date()
        }, { new: true });

        if (!request) return;

        io.to(`farmer_${request.farmerId}`).emit('request:completed', request);
        socket.emit('request:completed', request);
      } catch (err) {
        console.error('Error in operator:markComplete', err);
      }
    });

    // ==========================================
    // FARMER EVENTS
    // ==========================================

    socket.on('farmer:requestService', async (data) => {
      try {
        const { farmerId, equipmentType, coordinates } = data;
        
        // Farmer joins personal room to receive updates
        socket.join(`farmer_${farmerId}`);
        userSockets.set(socket.id, { type: 'farmer', id: farmerId });

        // Create initial request in DB
        const newRequest = await ServiceRequest.create({
          farmerId,
          equipmentType,
          status: 'SEARCHING',
          farmerLocation: { type: 'Point', coordinates }
        });

        // Query Operators within 10km (10000 meters)
        const operators = await Operator.find({
          isOnline: true,
          equipmentType: equipmentType,
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: coordinates },
              $maxDistance: 10000
            }
          }
        }).lean();

        if (operators.length === 0) {
          socket.emit('request:noOperators', { message: 'No operators found nearby' });
          await ServiceRequest.findByIdAndUpdate(newRequest._id, { status: 'CANCELLED' });
          return;
        }

        // Initialize state for sequential ping queue
        activeSearches.set(newRequest._id.toString(), {
          farmerSocketId: socket.id,
          request: newRequest,
          operatorQueue: operators,
          currentIndex: 0
        });

        // Start pinging the first operator
        pingNextOperator(newRequest._id.toString(), io);

      } catch (err) {
        console.error('Error in farmer:requestService', err);
      }
    });

    socket.on('farmer:cancelRequest', async ({ requestId }) => {
      try {
        const searchCtx = activeSearches.get(requestId);
        if (searchCtx) {
          clearTimeout(searchCtx.timeout);
          activeSearches.delete(requestId);
        }
        await ServiceRequest.findByIdAndUpdate(requestId, { status: 'CANCELLED' });
      } catch (err) {
        console.error('Error in farmer:cancelRequest', err);
      }
    });

    // ==========================================
    // DISCONNECT HANDLING
    // ==========================================
    socket.on('disconnect', async () => {
      const userData = userSockets.get(socket.id);
      if (userData && userData.type === 'operator') {
         console.log(`Auto-offline operator due to disconnect: ${userData.id}`);
         await Operator.findByIdAndUpdate(userData.id, { isOnline: false });
      }
      userSockets.delete(socket.id);
    });

  });
};

// ==========================================
// MATCHING ENGINE LOGIC (Helper)
// ==========================================
function pingNextOperator(requestId, io) {
  const searchCtx = activeSearches.get(requestId);
  if (!searchCtx) return;

  const { request, operatorQueue, currentIndex, farmerSocketId } = searchCtx;

  if (currentIndex >= operatorQueue.length) {
    // End of queue, no operators accepted
    io.to(farmerSocketId).emit('request:noOperators', { message: 'All nearby operators are busy.' });
    ServiceRequest.findByIdAndUpdate(requestId, { status: 'CANCELLED' }).exec();
    activeSearches.delete(requestId);
    return;
  }

  const targetOperator = operatorQueue[currentIndex];
  
  // Find the exact socket(s) for this operator
  io.to(`operator_${targetOperator._id}`).emit('request:incoming', {
    requestId: request._id,
    operatorId: targetOperator._id,
    farmerLocation: request.farmerLocation,
    equipmentType: request.equipmentType,
    distance: "calculating..." // You can add haversine distance here later
  });

  // Start 20 second timeout
  const timeoutId = setTimeout(() => {
    // If not accepted in 20 seconds, move to next
    pingNextOperator(requestId, io);
  }, 20000);

  // Update context for next iteration
  searchCtx.currentIndex += 1;
  searchCtx.timeout = timeoutId;
}

module.exports = { initSocketService };