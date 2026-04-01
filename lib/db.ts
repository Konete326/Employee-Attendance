import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * MongoDB Connection Troubleshooting:
 * 
 * If you get ECONNREFUSED errors:
 * 1. Check your internet connection
 * 2. Whitelist your IP in MongoDB Atlas: Network Access → IP Whitelist
 * 3. Ensure your cluster is active (not paused due to inactivity)
 * 4. Try using direct connection string instead of SRV:
 *    mongodb://user:pass@host1:27017,host2:27017/attendance?replicaSet=xxx
 * 
 * For local development, you can use:
 * MONGODB_URI=mongodb://localhost:27017/attendance
 */

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = {
    conn: null,
    promise: null,
  };
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4 (helps with some DNS issues)
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");
      return mongoose;
    }).catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
