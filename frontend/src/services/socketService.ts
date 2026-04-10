import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/serviceConfig';

class SocketService {
  public socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });
    }
    return this.socket;
  }

  private ensureConnected() {
    if (!this.socket) this.connect();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ==========================================
  // EMIT: OPERATOR
  // ==========================================
  operatorGoOnline(operatorId: string, location: { coordinates: [number, number] }) {
    this.ensureConnected()?.emit('operator:goOnline', { operatorId, location });
  }

  operatorGoOffline(operatorId: string) {
    this.ensureConnected()?.emit('operator:goOffline', { operatorId });
  }

  operatorUpdateLocation(operatorId: string, location: { coordinates: [number, number] }, activeRequestId: string | null) {
    this.ensureConnected()?.emit('operator:updateLocation', { operatorId, location, activeRequestId });
  }

  operatorAcceptRequest(requestId: string, operatorId: string) {
    this.ensureConnected()?.emit('operator:acceptRequest', { requestId, operatorId });
  }

  operatorRejectRequest(requestId: string) {
    this.ensureConnected()?.emit('operator:rejectRequest', { requestId });
  }

  operatorVerifyOTP(requestId: string, enteredOtp: string) {
    this.ensureConnected()?.emit('operator:verifyOTP', { requestId, enteredOtp });
  }

  operatorMarkComplete(requestId: string) {
    this.ensureConnected()?.emit('operator:markComplete', { requestId });
  }

  // ==========================================
  // EMIT: FARMER
  // ==========================================
  farmerRequestService(farmerId: string, equipmentType: string, coordinates: [number, number]) {
    this.ensureConnected()?.emit('farmer:requestService', { farmerId, equipmentType, coordinates });
  }

  farmerCancelRequest(requestId: string) {
    this.ensureConnected()?.emit('farmer:cancelRequest', { requestId });
  }

  // ==========================================
  // LISTENERS
  // ==========================================
  registerListeners(callbacks: {
    onIncomingRequest?: (data: any) => void;
    onJobConfirmed?: (data: any) => void;
    onOtpVerified?: (data: any) => void;
    onJobCompleted?: (data: any) => void;
    onRequestAccepted?: (data: any) => void;
    onNoOperators?: (data: any) => void;
    onOperatorLocationUpdate?: (data: any) => void;
    onError?: (data: any) => void;
    onConnectError?: (err: any) => void;
  }) {
    if (!this.socket) return;

    // Clean up specific listeners instead of completely removing all
    const events = [
      'request:incoming',
      'operator:jobConfirmed',
      'request:otpVerified',
      'request:completed',
      'request:accepted',
      'request:noOperators',
      'operator:locationUpdate',
      'error',
      'connect_error'
    ];
    events.forEach(event => this.socket?.off(event));

    if (callbacks.onIncomingRequest) {
      this.socket.on('request:incoming', callbacks.onIncomingRequest);
    }
    if (callbacks.onJobConfirmed) {
      this.socket.on('operator:jobConfirmed', callbacks.onJobConfirmed);
    }
    if (callbacks.onOtpVerified) {
      this.socket.on('request:otpVerified', callbacks.onOtpVerified);
    }
    if (callbacks.onJobCompleted) {
      this.socket.on('request:completed', callbacks.onJobCompleted);
    }
    if (callbacks.onRequestAccepted) {
      this.socket.on('request:accepted', callbacks.onRequestAccepted);
    }
    if (callbacks.onNoOperators) {
      this.socket.on('request:noOperators', callbacks.onNoOperators);
    }
    if (callbacks.onOperatorLocationUpdate) {
      this.socket.on('operator:locationUpdate', callbacks.onOperatorLocationUpdate);
    }
    if (callbacks.onError) {
      this.socket.on('error', callbacks.onError);
    }
    if (callbacks.onConnectError) {
      this.socket.on('connect_error', callbacks.onConnectError);
    }
  }
}

const socketService = new SocketService();
export default socketService;