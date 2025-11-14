const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

router.get('/', async (req, res, next) => {
    try {
         // Task 1: Connect to MongoDB using connectToDatabase database. Remember to use the await keyword and store the connection in `db`
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        // Initialize the query object
        let query = {};
        //Task 2: Add the name filter ,Use the following inside the if condition, Task 3: Add other filters and for each filter use the code

        if (req.query.name && req.query.name.trim() !== '') {
            query.name = { $regex: req.query.name, $options: "i" };
        }

        if (req.query.category && req.query.category.trim() !== '') {
            query.category = req.query.category;
        }

        if (req.query.condition && req.query.condition.trim() !== '') {
            query.condition = req.query.condition;
        }

        if (req.query.age_years && !isNaN(req.query.age_years)) {
            query.age_years = Number(req.query.age_years);
        }

        const results = await collection.find(query).toArray();
        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
