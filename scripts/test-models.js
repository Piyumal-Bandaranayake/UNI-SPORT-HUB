const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: ".env.local" });

async function run() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        fs.writeFileSync('models2.txt', data.models.map(m => m.name).join('\n'), 'utf8');
        console.log("Done");
    } catch (e) {
        console.error(e);
    }
}
run();
