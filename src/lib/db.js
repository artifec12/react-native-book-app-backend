import mongoose from "mongoose";

const connection = {};

// Connect to MongoDB
export const dbConnect = async () => {
  if (connection.isConnected) {
    console.log("Database already connected");
    return;
  }

  try {
    const mongoURI = process.env.MONGODB_URI ?? "mongodb://localhost:27018/";

    const db = await mongoose.connect(mongoURI, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 3600000, // 1 hour
      socketTimeoutMS: 3600000, // 1 hour
    });

    connection.isConnected = db.connections[0].readyState === 1;
    console.log("Database connected successfully to", db.connections[0].name);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

// Disconnect from MongoDB
export const dbDisconnect = async () => {
  if (!connection.isConnected) return;

  try {
    await mongoose.disconnect();
    connection.isConnected = false;
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting from database:", error);
  }
};
