import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import User from '../src/models/User.js';

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({ asgardeoId: { $exists: true } });
    console.log(`Found ${users.length} Asgardeo users in MongoDB:`);
    users.forEach(u => {
      console.log(JSON.stringify({
        id: u._id,
        asgardeoId: u.asgardeoId,
        username: u.username,
        name: u.name,
        email: u.email,
        contactNumber: u.contactNumber,
        role: u.role
      }, null, 2));
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
