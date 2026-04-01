const { MongoClient } = require('mongodb');

// Load env vars
require('dotenv').config({ path: '.env' });

const uri = process.env.MONGODB_URI;

console.log('\n========================================');
console.log('MongoDB Connection Test - ' + new Date().toISOString());
console.log('========================================\n');

if (!uri) {
  console.error('❌ MONGODB_URI not found in environment!');
  process.exit(1);
}

// Show URI (with hidden password)
const sanitizedUri = uri.replace(/:([^:@]+)@/, ':****@');
console.log('URI:', sanitizedUri);

// Extract database name
const dbNameMatch = uri.match(/\/([^/?]+)(\?|$)/);
const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
console.log('Database name from URI:', dbName);

async function testConnection() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // IPv4 only
  });

  try {
    console.log('\n⏳ Connecting to MongoDB...');
    await client.connect();
    console.log('✅ MongoDB connection successful!\n');
    
    const db = client.db('attendance');
    
    // Test: List collections
    console.log('📁 Testing: List collections...');
    const collections = await db.listCollections().toArray();
    console.log('   Collections found:', collections.length > 0 ? collections.map((c: any) => c.name).join(', ') : 'None (database may be empty)');
    
    // Test: Insert test document
    console.log('\n📝 Testing: Insert document...');
    const testCollection = db.collection('test_connection');
    const testDoc = { 
      message: 'Test from diagnostic script', 
      timestamp: new Date(),
      ip: '0.0.0.0'
    };
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('   ✅ Insert successful! ID:', insertResult.insertedId);
    
    // Test: Read the document back
    console.log('\n📖 Testing: Read document...');
    const readDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('   ✅ Read successful! Found:', readDoc?.message);
    
    // Test: Delete the test document
    console.log('\n🗑️ Testing: Delete document...');
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('   ✅ Delete successful!');
    
    console.log('\n========================================');
    console.log('✅ ALL TESTS PASSED!');
    console.log('========================================\n');
    
  } catch (err: any) {
    console.error('\n❌ Connection/Test failed:', err.message);
    console.error('\nStack:', err.stack);
    console.log('\nPossible fixes:');
    console.log('1. Whitelist your IP in MongoDB Atlas (Network Access)');
    console.log('2. Check username/password in connection string');
    console.log('3. Verify replicaSet name is correct');
    console.log('4. Check internet connection/firewall');
    console.log('5. Ensure cluster is active (not paused)\n');
    process.exit(1);
  } finally {
    await client.close();
    console.log('Connection closed.\n');
  }
}

testConnection();
