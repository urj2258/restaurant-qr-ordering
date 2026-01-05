
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkMenu() {
    console.log('Project ID:', firebaseConfig.projectId);
    try {
        const snapshot = await getDocs(collection(db, 'menu'));
        console.log(`Found ${snapshot.size} items in "menu" collection.`);
        if (snapshot.size > 0) {
            const categories = new Set();
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                // console.log(data);
                if (data.categoryName) categories.add(data.categoryName);
            });
            console.log('Categories found:', Array.from(categories));
        }
    } catch (error) {
        console.error('Error fetching menu:', error);
    }
}

checkMenu().then(() => process.exit(0));
