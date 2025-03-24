//const { MongoClient } = require('mongodb');

import { MongoClient } from 'mongodb';
const dealabs = from './websites/dealabs.js';


const MONGODB_URI = 'mongodb+srv://mm:<db_password>@cluster0.3m6ic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'lego';

const getSiteName = (url) => {
  if (url.includes('dealabs.com')) return 'dealabs';
  return null;
};

// Connect to MongoDB client
const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = client.db(MONGODB_DB_NAME);

// Insert deals and sales into the database
const deals = [];

// Inserting the deals into the 'deals' collection
const collection = db.collection('deals');
const result = await collection.insertMany(deals);

console.log('Deals inserted:', result);

// Method 1: Find all best discount deals
const findBestDiscountDeals = async () => {
    const bestDiscountDeals = await collection.find().sort({ discount: -1 }).toArray();
    console.log('Best discount deals:', bestDiscountDeals);
};

// Method 2: Find all most commented deals
const findMostCommentedDeals = async () => {
    const mostCommentedDeals = await collection.find().sort({ comments: -1 }).toArray();
    console.log('Most commented deals:', mostCommentedDeals);
};

// Method 3: Find all deals sorted by price
const findDealsSortedByPrice = async () => {
    const dealsSortedByPrice = await collection.find().sort({ price: 1 }).toArray();
    console.log('Deals sorted by price:', dealsSortedByPrice);
};

// Method 4: Find all deals sorted by date
const findDealsSortedByDate = async () => {
    const dealsSortedByDate = await collection.find().sort({ createdAt: -1 }).toArray();
    console.log('Deals sorted by date:', dealsSortedByDate);
};

// Method 5: Find all sales for a given Lego set id
const findSalesByLegoSetId = async (legoSetId) => {
    const salesCollection = db.collection('sales');
    const sales = await salesCollection.find({ legoSetId }).toArray();
    console.log(`Sales for Lego set ${legoSetId}:`, sales);
};

// Method 6: Find all sales scraped less than 3 weeks ago
const findSalesLessThanThreeWeeksOld = async () => {
    const salesCollection = db.collection('sales');
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21); // 21 days ago

    const sales = await salesCollection.find({ createdAt: { $gte: threeWeeksAgo } }).toArray();
    console.log('Sales scraped less than 3 weeks ago:', sales);
};

await findBestDiscountDeals();
await findMostCommentedDeals();
await findDealsSortedByPrice();
await findDealsSortedByDate();

const legoSetId = '42156';
await findSalesByLegoSetId(legoSetId);
await findSalesLessThanThreeWeeksOld();


await client.close();




