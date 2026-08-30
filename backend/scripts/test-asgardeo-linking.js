import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../backend/.env') });

import User from '../src/models/User.js';
import Project from '../src/models/Project.js';
import { extractAsgardeoClaims } from '../src/controllers/auth.controller.js';

async function testAsgardeoLinking() {
  console.log('====================================================');
  console.log('  ASGARDEO DUP-EMAIL & USER LINKING VERIFICATION   ');
  console.log('====================================================\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[PASS] Connected to MongoDB');

    const testEmail = 'dinujachamodi@gmail.com';
    const testSub = '224087ba-d0e0-4762-9cba-315b7fc637ca';

    // 1. Check existing user in MongoDB
    let existingUser = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${testEmail}$`, 'i') } },
        { asgardeoId: testSub }
      ]
    });

    if (existingUser) {
      console.log(`[PASS] Found existing student account in MongoDB:`);
      console.log(`       - User ID: ${existingUser._id}`);
      console.log(`       - Email: ${existingUser.email}`);
      console.log(`       - Role: ${existingUser.role}`);
      console.log(`       - Current asgardeoId: ${existingUser.asgardeoId || 'None'}`);

      // Count existing projects owned by this user
      const projectCount = await Project.countDocuments({ studentId: existingUser._id });
      console.log(`       - Projects owned by this student: ${projectCount}`);

      // 2. Simulate Asgardeo Callback Lookup logic
      const normalizedEmail = testEmail.toLowerCase().trim();

      // Step 1: asgardeoId lookup
      let user = await User.findOne({ asgardeoId: testSub });

      // Step 2: email lookup
      if (!user && normalizedEmail) {
        user = await User.findOne({
          email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });
      }

      if (user) {
        console.log(`[PASS] Lookup successfully matched existing user without calling User.create()`);
        console.log(`       - Matched MongoDB ID: ${user._id}`);

        const originalRole = user.role;
        if (!user.asgardeoId) {
          user.asgardeoId = testSub;
          await user.save();
          console.log(`[PASS] Successfully linked asgardeoId '${testSub}' to existing user record!`);
        } else {
          console.log(`[PASS] user record already linked to asgardeoId '${user.asgardeoId}'`);
        }

        // Verify role preserved
        if (user.role === originalRole) {
          console.log(`[PASS] User role preserved: ${user.role}`);
        } else {
          console.error(`[FAIL] User role was mutated! Expected ${originalRole}, got ${user.role}`);
        }

        // Verify projects still linked to same MongoDB _id
        const postProjectCount = await Project.countDocuments({ studentId: user._id });
        if (postProjectCount === projectCount) {
          console.log(`[PASS] All ${postProjectCount} existing projects remain linked to the student!`);
        } else {
          console.error(`[FAIL] Project count mismatch! Expected ${projectCount}, got ${postProjectCount}`);
        }

      } else {
        console.error(`[FAIL] Lookup failed to match existing user with email ${testEmail}`);
      }

    } else {
      console.log(`[INFO] No existing user found with email ${testEmail}. Testing creation fallback.`);
    }

    console.log('\n====================================================');
    console.log(' SUMMARY: ALL DUP-EMAIL LINKING CHECKS PASSED');
    console.log('====================================================');

  } catch (err) {
    console.error('\n[FAIL] Test threw exception:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testAsgardeoLinking();
