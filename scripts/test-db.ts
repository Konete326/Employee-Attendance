const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://wodotov595_db_user:wodotov595@cluster0.kgtmja3.mongodb.net/attendance?retryWrites=true&w=majority';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('URI:', uri.replace(/:([^:@]+)@/, ':****@')); // hide password
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    family: 4,
  });

  try {
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    
    const db = client.db('attendance');
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.log('\nPossible fixes:');
    console.log('1. Whitelist your IP in MongoDB Atlas Network Access');
    console.log('2. Check if cluster is active (not paused)');
    console.log('3. Use local MongoDB: mongodb://localhost:27017/attendance');
    console.log('4. Check internet connection/firewall');
  } finally {
    await client.close();
  }
}

testConnection();
