import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/signalist';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  isConnected: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
  isConnected: false,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached.conn && cached.isConnected) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        cached.isConnected = true;
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn('MongoDB connection unavailable, using fallback store:', err.message);
        cached.promise = null;
        cached.isConnected = false;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch {
    cached.promise = null;
    return null;
  }
}
