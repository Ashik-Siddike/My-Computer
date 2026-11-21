const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://mycomputer_admin:mycomputer2026@mycomputeradmin.uzb00xo.mongodb.net/my_computer?retryWrites=true&w=majority';

async function fix() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('my_computer');
    const res = await db.collection('sitecards').updateOne(
      { id: 'cat-card-gadgets' },
      { $set: { image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600&auto=format&fit=crop' } }
    );
    console.log('cat-card-gadgets update result: modifiedCount =', res.modifiedCount);
  } finally {
    await client.close();
  }
}

fix().catch(console.error);
