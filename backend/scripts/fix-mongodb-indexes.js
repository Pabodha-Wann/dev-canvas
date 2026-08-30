import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function fixUserIndexes() {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devcanvas';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const collection = mongoose.connection.collection('users');
    const existingIndexes = await collection.indexes();
    console.log('Existing MongoDB User collection indexes:', existingIndexes);

    // Drop old googleId_1 index if present
    const hasGoogleIndex = existingIndexes.some(idx => idx.name === 'googleId_1');
    if (hasGoogleIndex) {
        console.log('Dropping legacy googleId_1 index from MongoDB...');
        try {
            await collection.dropIndex('googleId_1');
            console.log('Successfully dropped legacy googleId_1 index.');
        } catch (err) {
            console.warn('Warning dropping googleId_1 index:', err.message);
        }
    }

    // Sync schema indexes (will create googleId_1 and asgardeoId_1 as sparse & unique)
    console.log('Syncing sparse indexes with Mongoose User schema...');
    await User.syncIndexes();
    console.log('User schema indexes synced successfully.');

    const updatedIndexes = await collection.indexes();
    console.log('Updated MongoDB User collection indexes:', updatedIndexes);

    // Verification Test: Create two dummy Asgardeo users without googleId
    console.log('\nRunning Verification Test: Creating two distinct Asgardeo users without googleId...');
    
    const testUser1Email = `asgardeo_test_user1_${Date.now()}@devcanvas.test`;
    const testUser2Email = `asgardeo_test_user2_${Date.now()}@devcanvas.test`;
    const testSub1 = `asgardeo_sub_1_${Date.now()}`;
    const testSub2 = `asgardeo_sub_2_${Date.now()}`;

    try {
        const u1 = await User.create({
            asgardeoId: testSub1,
            email: testUser1Email,
            name: 'Test Asgardeo User 1',
            role: 'STUDENT',
            isNewUser: true
        });
        console.log('[PASS] Created first Asgardeo user:', u1._id);

        const u2 = await User.create({
            asgardeoId: testSub2,
            email: testUser2Email,
            name: 'Test Asgardeo User 2',
            role: 'STUDENT',
            isNewUser: true
        });
        console.log('[PASS] Created second Asgardeo user without googleId:', u2._id);

        // Clean up test documents
        await User.deleteOne({ _id: u1._id });
        await User.deleteOne({ _id: u2._id });
        console.log('[PASS] Cleaned up temporary test documents.');

        console.log('\n====================================================');
        console.log(' SUCCESS: MongoDB googleId_1 index migrated to sparse!');
        console.log(' Multiple Asgardeo users can now exist without conflict.');
        console.log('====================================================');
    } catch (err) {
        console.error('[FAIL] Verification test failed:', err);
        process.exit(1);
    }

    process.exit(0);
}

fixUserIndexes().catch(err => {
    console.error('Fatal error fixing MongoDB indexes:', err);
    process.exit(1);
});
