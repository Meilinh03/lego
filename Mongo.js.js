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

/* eslint-disable no-console, no-process-exit */
const dealabs = require('./websites/dealabs');
const { spawn } = require('child_process');
const { connectDB } = require('./database'); // Connexion à MongoDB
const vintedScraper = require('./websites/vinted'); // Import du scraper Vinted

async function sandbox(website = 'https://www.dealabs.com/groupe/lego') {
  try {
    // 1️⃣ Connexion à MongoDB
    const db = await connectDB();
    const dealsCollection = db.collection('deals'); // Collection des deals
    const salesCollection = db.collection('sales'); // Collection des ventes Vinted

    // 2️⃣ Scraping des deals depuis Dealabs
    console.log(`Scraping des deals depuis ${website}...`);
    const deals = await dealabs.scrape(website);

    // 3️⃣ Extraire les IDs LEGO des deals
    const legoIDs = deals.map(deal => {
      const match = deal.title.match(/\b\d{4,6}\b/); // Cherche un ID LEGO (4 à 6 chiffres)
      return match ? match[0] : null;
    }).filter(id => id !== null);

    console.log('IDs LEGO extraits:', legoIDs);

    // 4️⃣ Insertion des deals dans MongoDB
    console.log("Insertion des deals dans MongoDB...");
    const insertDeals = await dealsCollection.insertMany(deals);
    console.log(`${insertDeals.insertedCount} deals insérés`);

    // 5️⃣ Scraping des ventes Vinted et insertion dans MongoDB
    async function scrapeAndStoreVinted(ids) {
      let allSales = []; // Tableau pour stocker toutes les ventes récupérées
      for (const id of ids) {
        console.log(`Scraping des ventes Vinted pour l'ID LEGO: ${id}...`);

        try {
          // Exécuter le scraper Vinted pour cet ID et s'assurer que l'URL est absolue
          const sales = await vintedScraper.scrape(`https:/www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192336&search_text=${id}&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`);

          // Vérifier que les ventes ne sont pas nulles ou vides
          if (sales && sales.length > 0) {
            // Ajouter l'ID LEGO à chaque vente
            const salesWithLegoId = sales.map(sale => ({
              ...sale,
              legoSetId: id,
            }));

            // Ajouter les ventes dans le tableau global
            allSales = [...allSales, ...salesWithLegoId];

            console.log(`${sales.length} ventes récupérées pour le LEGO ${id}`);
          } else {
            console.log(` Aucune vente trouvée pour l'ID LEGO ${id}`);
          }
        } catch (error) {
          console.error(`Erreur lors du scraping de l'ID LEGO ${id}: ${error.message}`);
        }

        // Pause de 2 secondes entre les scrappings pour éviter une surcharge du site
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (allSales.length > 0) {
        // Insertion de toutes les ventes dans MongoDB en une seule opération
        console.log("Insertion des ventes Vinted dans MongoDB...");
        const insertSales = await salesCollection.insertMany(allSales);
        console.log(` ${insertSales.insertedCount} ventes insérées.`);
      }

      console.log('Tous les scrappings Vinted sont terminés.');
    }

    // Lancer le scraping et l'insertion des ventes Vinted
    await scrapeAndStoreVinted(legoIDs);

    // Fin du processus
    process.exit(0);

  } catch (e) {
    console.error('Erreur:', e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;
sandbox(eshop);





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




