import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function cleanup() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        const collections = ['subadmins', 'coaches'];
        const indicesToDrop = ['universityId_1', 'username_1', 'universityId', 'username'];

        for (const colName of collections) {
            console.log(`\n📂 Checking collection: ${colName}`);
            const collection = db.collection(colName);
            const indexes = await collection.listIndexes().toArray();
            
            for (const idx of indexes) {
                if (indicesToDrop.includes(idx.name)) {
                    console.log(`🗑️  Dropping legacy index "${idx.name}" from ${colName}...`);
                    await collection.dropIndex(idx.name);
                    console.log(`✅ Index "${idx.name}" dropped successfully.`);
                }
            }
        }

        console.log('\n✨ Database cleanup complete. You can now create multiple staff accounts.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
