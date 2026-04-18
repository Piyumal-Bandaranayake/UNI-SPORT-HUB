require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  await db.collection('exerciseschedules').updateMany(
    { status: 'ACCEPTED', sessionType: 'ONLINE' },
    { $set: { meetingLink: 'https://meet.google.com/qwe-asdf-zxc' } }
  );
  console.log('Updated db');
  mongoose.disconnect();
});
