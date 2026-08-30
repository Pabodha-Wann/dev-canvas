import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { getUserByIdService } from '../src/services/user.service.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function testAsgardeoProfileClaims() {
    console.log('====================================================');
    console.log('   ASGARDEO OIDC PROFILE CLAIMS VERIFICATION TEST   ');
    console.log('====================================================\n');

    let passed = 0;
    let failed = 0;

    function report(desc, success, info = '') {
        if (success) {
            console.log(`[PASS] ${desc}`);
            passed++;
        } else {
            console.log(`[FAIL] ${desc} (${info})`);
            failed++;
        }
    }

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devcanvas';
        await mongoose.connect(mongoUri);

        // 1. Verify Schema fields
        const hasUsername = !!User.schema.path('username');
        const hasContactNumber = !!User.schema.path('contactNumber');
        report('User Schema contains username field', hasUsername);
        report('User Schema contains contactNumber field', hasContactNumber);

        // 2. Create Asgardeo user with all 4 profile fields
        const testSub = `asgardeo_claims_test_${Date.now()}`;
        const testEmail = `asgardeo_claims_${Date.now()}@devcanvas.test`;
        const testUsername = `asgardeo_user_${Date.now()}`;
        const testName = 'Johnathan Doe';
        const testMobile = '+1-555-019-2834';

        const createdUser = await User.create({
            asgardeoId: testSub,
            email: testEmail,
            username: testUsername,
            name: testName,
            contactNumber: testMobile,
            role: 'STUDENT',
            isNewUser: true
        });

        report('Created Asgardeo user record with 4 required claims', !!createdUser._id);

        // 3. Verify user.service getUserByIdService returns all 4 fields
        const fetched = await getUserByIdService(createdUser._id);
        const u = fetched.user;

        const hasAllFour = !!(u.username === testUsername && u.name === testName && u.email === testEmail && u.contactNumber === testMobile);
        report('getUserByIdService returns 1. Username, 2. Name, 3. Email, 4. Contact Number', hasAllFour, 
               `Username: ${u.username}, Name: ${u.name}, Email: ${u.email}, Contact: ${u.contactNumber}`);

        // Clean up test document
        await User.deleteOne({ _id: createdUser._id });
        report('Cleaned up test profile document', true);

    } catch (err) {
        report('Profile claims test execution', false, err.message);
    }

    console.log('\n====================================================');
    console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
}

testAsgardeoProfileClaims();
