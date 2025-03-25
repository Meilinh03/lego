const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { MongoClient } = require('mongodb');

const PORT = 8092;
const MONGODB_URI = 'mongodb+srv://mm:P4H1fUVFkFMlXpv3@cluster0.3m6ic.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'Lego';

const app = express();

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

let db;

// 🔹 Connexion à MongoDB avec gestion SSL/TLS
async function connectDB() {
    try {
        console.log("⏳ Connexion à MongoDB...");

        const client = new MongoClient(MONGODB_URI, {
            tls: true,                   // Force l'utilisation de TLS
            tlsInsecure: true,           // Désactive la vérification SSL (⚠️ pour dev uniquement)
            useUnifiedTopology: true     // Utilisation du moteur de découverte moderne
        });

        await client.connect();
        db = client.db(MONGODB_DB_NAME);

        console.log("✅ Connecté à MongoDB !");
    } catch (error) {
        console.error("❌ Erreur de connexion MongoDB :", error);
        process.exit(1);
    }
}

// 🔹 Fermer la connexion MongoDB proprement
async function closeDB() {
    if (db) {
        await db.client.close();
        console.log("❌ Connexion MongoDB fermée.");
    }
}

// 🔹 Test Route
app.get('/', (req, res) => {
    res.send({ ack: true });
});

// 🔹 Lancer le serveur et connecter MongoDB
async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Erreur de démarrage du serveur :', error);
        process.exit(1);
    }
}

// 🔹 Exporter pour Vercel
module.exports = async (req, res) => {
    if (!db) {
        await connectDB();
    }
    return app(req, res);
};

// 🔹 Fermeture propre du serveur
process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});

startServer();
