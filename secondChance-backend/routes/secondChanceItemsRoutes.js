const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
},
filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
},
});

const upload = multer({ storage: storage });


// Get all secondChanceItems --> Implement the /api/secondchance/items GET endpoint
router.get('/', async (req, res, next) => {
    try {
        //Connect to MongoDB
        const db = await connectToDatabase();
        // use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");
        // Fetch all secondChanceItems
        const secondChanceItems = await collection.find({}).toArray();
        // Return secondChanceItems
        res.json(secondChanceItems);
    } catch (e) {
        logger.error('oops something went wrong', e)
        next(e);
    }
});



// Add a new item
router.post('/', upload.single('file'), async(req, res,next) => {
    try {
        const db = await connectToDatabase(); //Connect to MongoDB
        const collection = db.collection("secondChanceItems"); //Use the collection() method to retrieve the secondChanceItems collection
        const lastItemQuery = await collection.find().sort({'id': -1}).limit(1); //Get the last id, increment it by 1, and set it to the new secondChanceItem
        let secondChanceItem = req.body; //Create a new secondChanceItem from the request body

        await lastItemQuery.forEach(item => {
            secondChanceItem.id = (parseInt(item.id) + 1).toString();
        });
        const date_added = Math.floor(new Date().getTime() / 1000); //Set the current date to the new item
        secondChanceItem.date_added = date_added

        secondChanceItem = await collection.insertOne(secondChanceItem); //Add the secondChanceItem to the database
        console.log(secondChanceItem);
        res.status(201).json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID --> Step 4: Implement the /api/secondchance/items/:id endpoint

router.get('/:id', async (req, res, next) => {

    try {
        // Connect to MongoDB
        const db = await connectToDatabase();
        //Access the MongoDB collection
        const collection = db.collection("secondChanceItems");
        const id = req.params.id; 
        //Find a specific secondChanceItem by ID
        const secondChanceItem = await collection.findOne({ id: id });
        // Return the secondChanceItem as a JSON object. Return an error message if the item is not found.
        if (!secondChanceItem) {
        return res.status(404).send("secondChanceItem not found");
}

res.json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});



// Update and existing item
router.put('/:id', async(req, res,next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems"); ////Use the collection() method to retrieve the secondChanceItems collection
        const id = req.params.id;
        const secondChanceItem = await collection.findOne({ id }); 
        //Check if the secondChanceItem exists and send an appropriate message if it doesn't exist
        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }
        //Update the item's specific attributes.
        secondChanceItem.category = req.body.category;
        secondChanceItem.condition = req.body.condition;
        secondChanceItem.age_days = req.body.age_days;
        secondChanceItem.description = req.body.description;
        secondChanceItem.age_years = Number((secondChanceItem.age_days/365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        const updatepreloveItem = await collection.findOneAndUpdate(
            { id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );


        if(updatepreloveItem) {
            res.json({"uploaded":"success"});
        } else {
            res.json({"uploaded":"failed"});
        }

    } catch (e) {
        next(e);
    }
});


// Delete an existing item
router.delete('/:id', async(req, res,next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const id = req.params.id;
        const secondChanceItem = await collection.findOne({ id }); //Find a specific secondChanceItem by ID using the collection.fineOne() method and send an appropriate message if it doesn't exist

        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }
        const updatepreloveItem = await collection.deleteOne({ id }); //Delete the object and send an appropriate message

        res.json({"deleted":"success"});
    } catch (e) {
        next(e);
    }
});

module.exports = router;
