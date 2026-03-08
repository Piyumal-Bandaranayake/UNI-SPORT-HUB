const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

const SportSchema = new mongoose.Schema({
    name: String,
    status: String
});

const Sport = mongoose.models.Sport || mongoose.model('Sport', SportSchema);

async function check() {
    await mongoose.connect(MONGODB_URI);
    const id = "69acda18fbda1492956829d1";
    console.log(`Checking for sport with ID ${id}...`);

    try {
        const sport = await Sport.findById(id);
        if (sport) {
            console.log(`FOUND: ${sport.name} [${sport.status}]`);
        } else {
            console.log("NOT FOUND");
            const all = await Sport.find({});
            console.log(`All sports count: ${all.length}`);
            all.forEach(s => console.log(`- ${s._id.toString()} : ${s.name}`));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }

    await mongoose.disconnect();
}

check();
