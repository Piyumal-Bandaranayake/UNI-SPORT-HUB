import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
