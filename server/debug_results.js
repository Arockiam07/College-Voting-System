const mongoose = require('mongoose');
const Election = require('./models/Election');
require('dotenv').config();

const checkAndFix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const elections = await Election.find({});
        console.log("Current Elections:");
        elections.forEach(e => {
            console.log(`- ${e.name}: Status=${e.status}, Published=${e.resultsPublished}`);
        });

        const res = await Election.updateMany(
            { status: 'closed' },
            { $set: { resultsPublished: true } }
        );
        console.log(`Updated ${res.modifiedCount} closed elections to Published.`);

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkAndFix();
