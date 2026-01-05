
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
// Fallback to .env if .env.local doesn't exist or doesn't have the keys
dotenv.config();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
    { name: 'Special Karahi & Handi', displayOrder: 1 },
    { name: 'BBQ & Grill', displayOrder: 2 },
    { name: 'Rice & Biryani', displayOrder: 3 },
    { name: 'Tandoor (Breads)', displayOrder: 4 },
    { name: 'Sides & Salads', displayOrder: 5 },
    { name: 'Beverages', displayOrder: 6 },
    { name: 'Desserts', displayOrder: 7 }
];

const menuItems = [
    // Karahi & Handi
    {
        name: 'Chicken Karahi (Full)',
        description: 'Traditional wok-cooked chicken with fresh tomatoes, ginger, and green chilies.',
        price: 2200,
        image: 'https://images.unsplash.com/photo-1606756616429-06b2d2643764?q=80&w=800&auto=format&fit=crop', // Chicken curry placeholder
        categoryName: 'Special Karahi & Handi',
        isAvailable: true,
        isPopular: true,
        sizes: [
            { id: 'half', name: 'Half', priceModifier: -1000 },
            { id: 'full', name: 'Full', priceModifier: 0 }
        ]
    },
    {
        name: 'Mutton Handi',
        description: 'Slow-cooked tender mutton in a rich, creamy clay pot gravy.',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?q=80&w=800&auto=format&fit=crop', // Mutton placeholder
        categoryName: 'Special Karahi & Handi',
        isAvailable: true,
        sizes: [
            { id: 'half', name: 'Half', priceModifier: -1300 },
            { id: 'full', name: 'Full', priceModifier: 0 }
        ]
    },
    {
        name: 'Chicken White Karahi',
        description: 'Creamy and mild chicken curry cooked with cream, yogurt, and black pepper.',
        price: 2400,
        image: 'https://images.unsplash.com/photo-1604145952372-d599b5443fa5?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Special Karahi & Handi',
        isAvailable: true
    },
    {
        name: 'Peshawari Chapli Kabab',
        description: 'Famous Khyber style fried beef mince patties with spices and tomato slice.',
        price: 650,
        image: 'https://images.unsplash.com/photo-1596706037009-80e9bd207127?q=80&w=800&auto=format&fit=crop', // Kabab placeholder
        categoryName: 'Special Karahi & Handi',
        isAvailable: true,
        isPopular: true
    },

    // BBQ
    {
        name: 'Chicken Tikka (Leg)',
        description: 'Charcoal grilled chicken leg piece marinated in red spices.',
        price: 450,
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop',
        categoryName: 'BBQ & Grill',
        isAvailable: true,
        isPopular: true
    },
    {
        name: 'Chicken Malai Boti',
        description: 'Boneless chicken cubes marinated in fresh cream and mild herbs.',
        price: 850,
        image: 'https://images.unsplash.com/photo-1529193591184-b1d580690dd0?q=80&w=800&auto=format&fit=crop',
        categoryName: 'BBQ & Grill',
        isAvailable: true
    },
    {
        name: 'Seekh Kabab (4 pcs)',
        description: 'Juicy minced beef skewers grilled over charcoal.',
        price: 900,
        image: 'https://images.unsplash.com/photo-1549488344-933758b9f12d?q=80&w=800&auto=format&fit=crop',
        categoryName: 'BBQ & Grill',
        isAvailable: true
    },
    {
        name: 'Mutton Chops',
        description: 'Spiced mutton chops grilled to perfection.',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1544025162-d7669d0663db?q=80&w=800&auto=format&fit=crop',
        categoryName: 'BBQ & Grill',
        isAvailable: true
    },

    // Rice
    {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice layered with spiced chicken and potatoes.',
        price: 550,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Rice & Biryani',
        isAvailable: true,
        isPopular: true,
        sizes: [
            { id: 'single', name: 'Single', priceModifier: 0 },
            { id: 'double', name: 'Double', priceModifier: 450 }
        ],
        extras: [
            { name: 'Extra Raita', price: 50 },
            { name: 'Extra Salad', price: 80 }
        ]
    },
    {
        name: 'Kabuli Pulao',
        description: 'Traditional Afghani rice with sweet carrots, raisins, and tender beef.',
        price: 950,
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Rice & Biryani',
        isAvailable: true
    },
    {
        name: 'Chicken Fried Rice',
        description: 'Desi-Chinese style stir-fried rice with chicken and vegetables.',
        price: 650,
        image: 'https://images.unsplash.com/photo-1603133872878-684f10842619?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Rice & Biryani',
        isAvailable: true
    },

    // Tandoor
    {
        name: 'Roghni Naan',
        description: 'Soft tandoori bread topped with sesame seeds and butter.',
        price: 80,
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Tandoor (Breads)',
        isAvailable: true
    },
    {
        name: 'Garlic Naan',
        description: 'Naan infused with fresh minced garlic and coriander.',
        price: 100,
        image: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=800&auto=format&fit=crop', // Bread placeholder
        categoryName: 'Tandoor (Breads)',
        isAvailable: true
    },
    {
        name: 'Tandoori Roti',
        description: 'Whole wheat flatbread baked in clay oven.',
        price: 40,
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Tandoor (Breads)',
        isAvailable: true
    },

    // Sides
    {
        name: 'Fresh Salad',
        description: 'Sliced seasonal vegetables with lemon.',
        price: 150,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Sides & Salads',
        isAvailable: true
    },
    {
        name: 'Zeera Raita',
        description: 'Yogurt dip with roasted cumin seeds.',
        price: 100,
        image: 'https://images.unsplash.com/photo-1563507301-447a1bc1b433?q=80&w=800&auto=format&fit=crop', // Yogurt placeholder
        categoryName: 'Sides & Salads',
        isAvailable: true
    },

    // Beverages
    {
        name: 'Mint Lemonade',
        description: 'Refreshing blend of fresh mint, lemon, and ice.',
        price: 250,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Beverages',
        isAvailable: true
    },
    {
        name: 'Lassi (Sweet)',
        description: 'Traditional yogurt drink topped with malai.',
        price: 300,
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop', // Drink placeholder
        categoryName: 'Beverages',
        isAvailable: true
    },
    {
        name: 'Soft Drink (Can)',
        description: 'Coke, Sprite, Fanta',
        price: 150,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Beverages',
        isAvailable: true
    },
    {
        name: 'Mineral Water (Large)',
        description: 'Chilled mineral water bottle.',
        price: 120,
        image: 'https://images.unsplash.com/photo-1560706834-a71bd65ecf49?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Beverages',
        isAvailable: true
    },

    // Desserts
    {
        name: 'Gulab Jamun (2 pcs)',
        description: 'Hot milk-solid dumplings dipped in sugar syrup.',
        price: 200,
        image: 'https://images.unsplash.com/photo-1605197584547-c93aa1cd3d70?q=80&w=800&auto=format&fit=crop',
        categoryName: 'Desserts',
        isAvailable: true
    },
    {
        name: 'Kheer',
        description: 'Traditional rice pudding topped with nuts.',
        price: 350,
        image: 'https://images.unsplash.com/photo-1632734159628-7d848037dc0e?q=80&w=800&auto=format&fit=crop', // Kheer placeholder
        categoryName: 'Desserts',
        isAvailable: true
    }
];

async function seedMenu() {
    console.log('Clearing existing menu...');
    try {
        const snapshot = await getDocs(collection(db, 'menu'));
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        console.log('Menu cleared.');

        console.log('Seeding new items...');
        const addPromises = menuItems.map(item => {
            // Find category ID - for now we just use the string, 
            // but in a real relation we'd look up the category doc. 
            // The app currently uses denormalized categoryName.
            return addDoc(collection(db, 'menu'), {
                ...item,
                categoryId: item.categoryName.replace(/\s+/g, '-').toLowerCase(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });

        await Promise.all(addPromises);
        console.log(`Successfully added ${menuItems.length} items.`);
    } catch (error) {
        console.error('Error seeding menu:', error);
    }
}

seedMenu().then(() => {
    console.log("Done");
    process.exit(0);
});
