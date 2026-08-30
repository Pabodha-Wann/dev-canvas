import mongoose from 'mongoose';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import User from '../models/User.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dev-canvas');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Ensure sparse indexes for googleId and asgardeoId are in sync
    try {
      await User.syncIndexes();
    } catch (idxErr) {
      if (idxErr.code === 11000 || idxErr.message.includes('googleId_1')) {
        await mongoose.connection.collection('users').dropIndex('googleId_1').catch(() => {});
        await User.syncIndexes();
      }
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
