const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const path = require('path');
const fs = require('fs');

// 1. Load Environment Variables from .env file
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../../.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim();
                process.env[key] = val;
            }
        });
    } catch (e) {
        console.error('Failed to read .env', e.message);
    }
}
loadEnv();

// 2. Initialize Firebase (Minimal for Node)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Helper to create random order
const TABLES = ['1', '2', '3', 'admin-test'];
const ITEMS = [
    { name: 'Zinger Burger', price: 550, id: 'item1' },
    { name: 'Club Sandwich', price: 450, id: 'item2' },
    { name: 'Chicken Karahi', price: 1200, id: 'item3' },
    { name: 'Mint Margarita', price: 250, id: 'item4' }
];

async function createRandomOrder(tableId) {
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let total = 0;

    for (let i = 0; i < itemCount; i++) {
        const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        items.push({
            id: `temp-${Date.now()}-${i}`,
            menuItem: item,
            quantity: 1,
            selectedExtras: [],
            specialInstructions: ''
        });
        total += item.price;
    }

    const order = {
        tableId: tableId,
        items: items,
        status: 'pending',
        paymentMethod: 'Cash on Delivery',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        total: total,
        subtotal: total
    };

    try {
        const docRef = await addDoc(collection(db, 'orders'), order);
        console.log(`[+] Order created for Table ${tableId} (ID: ${docRef.id.substring(0, 5)}...)`);
    } catch (e) {
        console.error('Failed to create order:', e);
    }
}

// 4. Run Simulation
async function runSimulation() {
    console.log('--- Starting Multi-Table Order Simulation ---');
    console.log('Press Ctrl+C to stop.\n');

    // Create an order every 3 seconds for different tables
    setInterval(() => {
        const randomTable = TABLES[Math.floor(Math.random() * TABLES.length)];
        createRandomOrder(randomTable);
    }, 3000);
}

runSimulation();
