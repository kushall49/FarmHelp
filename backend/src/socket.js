import { Server } from "socket.io";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Fallback mechanism when Redis is not running locally via Docker!
let redisServerAvailable = true;
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 2) {
      console.log("⚠️ Redis not detected locally! Using in-memory fallback for matching.");
      redisServerAvailable = false;
      return null; // Stop retrying
    }
    return Math.min(times * 50, 2000);
  }
});

// In-Memory Fallback if NO Redis available
const memoryProviders = new Map();
const providerSockets = new Map();
const farmerSockets = new Map();

export function initRealTimeSystem(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Provider updating their location
    socket.on("updateLocation", async (data) => {
      const { providerId, lat, lng } = data;
      
      if (redisServerAvailable) {
        try {
          await redis.geoadd("providers", lng, lat, providerId);
          await redis.set(`provider-socket:${providerId}`, socket.id);
        } catch(e) { }
      } else {
        memoryProviders.set(providerId, { lat, lng });
        providerSockets.set(providerId, socket.id);
      }
      
      socket.emit("locationUpdated", { success: true });
    });

    // Farmer requesting a service
    socket.on("requestService", async (data) => {
      const { farmerId, category, lat, lng } = data;
      console.log(`[Service Request] Farmer ${farmerId} needs ${category}`);
      
      // Store farmer socket
      if (!redisServerAvailable) {
        farmerSockets.set(farmerId, socket.id);
      }

      // 1. Create a JobRequest in Database
      let job;
      try {
        job = await prisma.jobRequest.create({
          data: {
            farmerId,
            categoryNeeded: category,
            pickupLat: lat,
            pickupLng: lng,
            status: "SEARCHING"
          }
        });
        socket.emit("jobCreated", job);
      } catch (e) {
        console.error("Database error creating job:", e);
        return;
      }

      // 2. Find nearby providers
      let nearbyProviderIds = [];
      if (redisServerAvailable) {
         try {
           nearbyProviderIds = await redis.geosearch("providers", "FROMLONLAT", lng, lat, "BYRADIUS", 10, "km");
         } catch(e) {}
      } else {
         // Fallback Match ALL active providers if Redis is missing
         nearbyProviderIds = Array.from(memoryProviders.keys());
      }

      console.log(`Found ${nearbyProviderIds.length} nearby providers.`);

      // 3. Broadcast the request to nearby providers
      for (const pId of nearbyProviderIds) {
        let pSocketId = redisServerAvailable ? await redis.get(`provider-socket:${pId}`).catch(()=>null) : providerSockets.get(pId);
        if (pSocketId) {
          io.to(pSocketId).emit("newJobRequest", job);
        }
      }
    });

    // Provider accepting a service request
    socket.on("acceptJob", async (data) => {
      const { jobId, providerId } = data;
      console.log(`[Job Accepted] Provider ${providerId} accepted Job ${jobId}`);

      try {
        const updatedJob = await prisma.jobRequest.update({
          where: { id: jobId },
          data: { providerId, status: "ACCEPTED", acceptedAt: new Date() }
        });

        // Notify the farmer
        const farmerSocketId = redisServerAvailable 
             ? await redis.get(`farmer-socket:${updatedJob.farmerId}`).catch(()=>null)
             : farmerSockets.get(updatedJob.farmerId);

        if (farmerSocketId) {
          io.to(farmerSocketId).emit("jobAccepted", updatedJob);
        }

        // Return to provider
        socket.emit("jobConfirmed", updatedJob);
      } catch (error) {
        socket.emit("jobError", { message: "Job may have been accepted by someone else." });
      }
    });

    socket.on("registerFarmer", async (data) => {
      const { farmerId } = data;
      if (redisServerAvailable) {
        await redis.set(`farmer-socket:${farmerId}`, socket.id).catch(()=>{});
      } else {
        farmerSockets.set(farmerId, socket.id);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
}
