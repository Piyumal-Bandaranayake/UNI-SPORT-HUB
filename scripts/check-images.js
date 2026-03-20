import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
    // Dynamic import to ensure env is loaded first
    const dbConnect = (await import('../src/lib/mongodb.js')).default;
    const Sport = (await import('../src/models/Sport.js')).default;

    await dbConnect();
    const sports = await Sport.find({});
    sports.forEach(s => {
        console.log(`Sport: ${s.name}, Has Image: ${!!s.image}, Image Length: ${s.image?.length || 0}`);
        if (s.image && !s.image.startsWith('data:image')) {
            console.log(`  WARNING: Image for ${s.name} does not start with data:image!`);
        }
    });
    process.exit(0);
}

check().catch(err => {
    console.error(err);
    process.exit(1);
});
