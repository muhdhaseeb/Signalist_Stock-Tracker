import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Error: MONGODB_URI environment variable is not set.');
  process.exit(2);
}

console.log('Testing MongoDB connection to', uri);

mongoose.connect(uri, { bufferCommands: false })
  .then((conn) => {
    console.log('✅ Connected to MongoDB');
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('✅ Connection closed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection error:', err.message || err);
    process.exit(1);
  });
