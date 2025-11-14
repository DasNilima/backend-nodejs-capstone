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


// Get all secondChanceItems --> Step 2: Implement the /api/secondchance/items GET endpoint
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        //Step 2: task 1 - insert code here - Connect to MongoDB
        const db = await connectToDatabase();
        //Step 2: task 2 - insert code here -  use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");
        //Step 2: task 3 - insert code here Fetch all secondChanceItems
        const secondChanceItems = await collection.find({}).toArray();
        //Step 2: task 4 - insert code here Return secondChanceItems
        return res.json(secondChanceItems);
    } catch (e) {
        logger.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item --> Step 3: Implement the /api/secondchance/items POST endpoint - Task 7: Upload the image to the images directory
router.post('/',  upload.single('file'), async(req, res,next) => {
    try {

        //Step 3: task 1 - insert code here - Task 1: Connect to MongoDB
        const db = await connectToDatabase();
        //Step 3: task 2 - insert code here - Task 2: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");
        //Step 3: task 3 - insert code here - Task 3: Create a new secondChanceItem from the request body
        let secondChanceItem = req.body;
        //Task 4: Get the last id, increment it by 1, and set it to the new secondChanceItem
        const lastItemQuery = await collection.find().sort({'id': -1}).limit(1);
await lastItemQuery.forEach(item => {
    secondChanceItem.id = (parseInt(item.id) + 1).toString();
});
        //Step 3: task 4 - insert code here - Task 5: Set the current date to the new item
        const date_added = Math.floor(new Date().getTime() / 1000);
        secondChanceItem.date_added = date_added
        //Task 6: Add the secondChanceItem to the database
        secondChanceItem = await collection.insertOne(secondChanceItem);
        //Step 3: task 5 - insert code here
        res.status(201).json(secondChanceItem.ops[0]);
    } catch (e) {
        next(e);
    }
});

// Get a single secondChanceItem by ID --> Step 4: Implement the /api/secondchance/items/:id endpoint

router.get('/:id', async (req, res, next) => {

    try {
        //Step 4: task 1 - insert code here -Task 1: Connect to MongoDB
        const db = await connectToDatabase();
        //Step 4: task 2 - insert code here - Task 2: Access the MongoDB collection
        const collection = db.collection("secondChanceItems");
        const id = req.params.id; 
        //Step 4: task 3 - insert code here - Find a specific secondChanceItem by ID
        const secondChanceItem = await collection.findOne({ id: id });
        //Step 4: task 4 - insert code here - Return the secondChanceItem as a JSON object. Return an error message if the item is not found.
        if (!secondChanceItem) {
        return res.status(404).send("secondChanceItem not found");
}

res.json(secondChanceItem);
    } catch (e) {
        next(e);
    }
});

// Update and existing item --> Step 5: Implement the /api/secondchance/items/:id UPDATE endpoint
router.put('/:id', async(req, res,next) => {
    try {
        //Step 5: task 1 - insert code here - Task 1: Connect to MongoDB
        const db = await connectToDatabase();
        //Step 5: task 2 - insert code here -Task 2: Use the collection() method to retrieve the secondChanceItems collection
        const collection = db.collection("secondChanceItems");
        //Step 5: task 3 - insert code here - Task 3: Check if the secondChanceItem exists and send an appropriate message if it doesn't exist
        const secondChanceItem = await collection.findOne({ id });
if (!secondChanceItem) {
        logger.error('secondChanceItem not found');
        return res.status(404).json({ error: "secondChanceItem not found" });
}
        //Step 5: task 4 - insert code here -Task 4: Update the item's specific attributes.
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
        //Step 5: task 5 - insert code here --> Task 5: Send confirmation
                if(updatepreloveItem) {
            res.json({"uploaded":"success"});
        } else {
            res.json({"uploaded":"failed"});
        }
    } catch (e) {
        next(e);
    }
});

// Delete an existing item -- Step 6: Implement the /api/secondchance/items/:id DELETE endpoint
router.delete('/:id', async(req, res,next) => {
    try {
        //Step 6: task 1 - insert code here - Task 1: Connect to MongoDB
        const db = await connectToDatabase();
        //Step 6: task 2 - insert code here - Task 2: Access the MongoDB collection
        const collection = db.collection("secondChanceItems");
        //Step 6: task 3 - insert code here - Task 3: Find a specific secondChanceItem by ID using the collection.fineOne() method and send an appropriate message if it doesn't exist
        const secondChanceItem = await collection.findOne({ id });
if (!secondChanceItem) {
    logger.error('secondChanceItem not found');
    return res.status(404).json({ error: "secondChanceItem not found" });
}
        //Step 6: task 4 - insert code here - Task 4: Delete the object and send an appropriate message
        await collection.deleteOne({ id });
        res.json({"deleted":"success"});
    } catch (e) {
        next(e);
    }
});

module.exports = router;
