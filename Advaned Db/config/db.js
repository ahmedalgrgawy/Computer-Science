import { MongoClient } from 'mongodb';

// Use local MongoDB connection URI
const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

export async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to local MongoDB');
        return client.db('library_db'); // Use or create 'library_db'
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

export { client }; // Export