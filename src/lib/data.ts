import { MenuItem, Order, Table, DailyStats, PopularItem, TableStats } from './types';

// Sample Menu Data - Pakistani Restaurant Items with professional images
export const sampleMenuItems: MenuItem[] = [
    // Starters
    {
        id: 'starter-1',
        name: 'Chicken Samosa',
        description: 'Crispy pastry filled with spiced minced chicken and herbs',
        price: 250,
        image: '/images/samosa.png',
        categoryId: 'cat-starters',
        categoryName: 'Starters',
        isAvailable: true,
        isPopular: true,
        extras: [
            { id: 'extra-chutney', name: 'Extra Chutney', price: 50 },
            { id: 'extra-spicy', name: 'Extra Spicy', price: 0 }
        ]
    },
    {
        id: 'starter-2',
        name: 'Seekh Kebab',
        description: 'Grilled minced beef kebabs with aromatic spices',
        price: 450,
        image: '/images/seekh-kebab.png',
        categoryId: 'cat-starters',
        categoryName: 'Starters',
        isAvailable: true,
        extras: [
            { id: 'extra-naan', name: 'Extra Naan', price: 80 },
            { id: 'extra-raita', name: 'Raita', price: 60 }
        ]
    },
    {
        id: 'starter-3',
        name: 'Chicken Wings',
        description: 'Spicy fried chicken wings with special house sauce',
        price: 550,
        image: '/images/wings.png',
        categoryId: 'cat-starters',
        categoryName: 'Starters',
        isAvailable: true,
        isPopular: true
    },
    {
        id: 'starter-4',
        name: 'Pakora Platter',
        description: 'Assorted vegetable fritters with mint chutney',
        price: 350,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
        categoryId: 'cat-starters',
        categoryName: 'Starters',
        isAvailable: false
    },

    // Main Course
    {
        id: 'main-1',
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice layered with tender chicken and spices',
        price: 650,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
        categoryId: 'cat-main',
        categoryName: 'Main Course',
        isAvailable: true,
        isPopular: true,
        sizes: [
            { id: 'regular', name: 'Regular', priceModifier: 0 },
            { id: 'large', name: 'Family Size', priceModifier: 400 }
        ],
        extras: [
            { id: 'extra-raita', name: 'Raita', price: 80 },
            { id: 'extra-salad', name: 'Fresh Salad', price: 100 }
        ]
    },
    {
        id: 'main-2',
        name: 'Mutton Karahi',
        description: 'Traditional wok-cooked mutton with tomatoes and green chilies',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400&h=300&fit=crop',
        categoryId: 'cat-main',
        categoryName: 'Main Course',
        isAvailable: true,
        sizes: [
            { id: 'half', name: 'Half', priceModifier: 0 },
            { id: 'full', name: 'Full', priceModifier: 600 }
        ]
    },
    {
        id: 'main-3',
        name: 'Butter Chicken',
        description: 'Creamy tomato-based curry with tender chicken pieces',
        price: 750,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=300&fit=crop',
        categoryId: 'cat-main',
        categoryName: 'Main Course',
        isAvailable: true,
        isPopular: true
    },
    {
        id: 'main-4',
        name: 'Beef Nihari',
        description: 'Slow-cooked beef stew with traditional spices',
        price: 850,
        image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&h=300&fit=crop',
        categoryId: 'cat-main',
        categoryName: 'Main Course',
        isAvailable: true
    },
    {
        id: 'main-5',
        name: 'Chapli Kebab',
        description: 'Peshawar-style beef patties with signature spices',
        price: 550,
        image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop',
        categoryId: 'cat-main',
        categoryName: 'Main Course',
        isAvailable: true
    },

    // Drinks
    {
        id: 'drink-1',
        name: 'Mango Lassi',
        description: 'Refreshing yogurt drink blended with fresh mango',
        price: 200,
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop',
        categoryId: 'cat-drinks',
        categoryName: 'Drinks',
        isAvailable: true,
        isPopular: true
    },
    {
        id: 'drink-2',
        name: 'Mint Lemonade',
        description: 'Fresh lemon juice with mint leaves and soda',
        price: 180,
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
        categoryId: 'cat-drinks',
        categoryName: 'Drinks',
        isAvailable: true
    },
    {
        id: 'drink-3',
        name: 'Kashmiri Chai',
        description: 'Traditional pink tea with cardamom and nuts',
        price: 250,
        image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop',
        categoryId: 'cat-drinks',
        categoryName: 'Drinks',
        isAvailable: true
    },

    // Desserts
    {
        id: 'dessert-1',
        name: 'Gulab Jamun',
        description: 'Deep-fried milk dumplings soaked in rose syrup',
        price: 200,
        image: 'https://images.unsplash.com/photo-1666190053276-439cf1885921?w=400&h=300&fit=crop',
        categoryId: 'cat-desserts',
        categoryName: 'Desserts',
        isAvailable: true,
        isPopular: true
    },
    {
        id: 'dessert-2',
        name: 'Kheer',
        description: 'Creamy rice pudding with cardamom and nuts',
        price: 250,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
        categoryId: 'cat-desserts',
        categoryName: 'Desserts',
        isAvailable: true
    },
    {
        id: 'dessert-3',
        name: 'Rasmalai',
        description: 'Soft cheese patties in sweetened milk with saffron',
        price: 300,
        image: 'https://images.unsplash.com/photo-1605260800080-20c7b9ee8fce?w=400&h=300&fit=crop',
        categoryId: 'cat-desserts',
        categoryName: 'Desserts',
        isAvailable: true
    }
];

// Sample Tables
export const sampleTables: Table[] = Array.from({ length: 15 }, (_, i) => ({
    id: `table-${i + 1}`,
    name: `Table ${i + 1}`,
    seats: i < 5 ? 2 : i < 10 ? 4 : 6,
    isOccupied: false
}));

// Get unique categories
export const categories = [...new Set(sampleMenuItems.map(item => item.categoryName))];

// Sample Orders for Demo
export const sampleOrders: Order[] = [
    {
        id: 'order-001',
        tableId: 'table-5',
        items: [
            {
                id: 'cart-1',
                menuItem: sampleMenuItems[0],
                quantity: 2,
                selectedExtras: [],
            },
            {
                id: 'cart-2',
                menuItem: sampleMenuItems[4],
                quantity: 1,
                selectedExtras: [{ id: 'extra-raita', name: 'Raita', price: 80 }],
            }
        ],
        status: 'preparing',
        paymentMethod: 'Cash on Delivery',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
        subtotal: 1150,
        tax: 184,
        total: 1334
    },
    {
        id: 'order-002',
        tableId: 'table-12',
        items: [
            {
                id: 'cart-3',
                menuItem: sampleMenuItems[6],
                quantity: 1,
                selectedExtras: [],
            }
        ],
        status: 'pending',
        paymentMethod: 'JazzCash',
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
        subtotal: 750,
        tax: 120,
        total: 870
    }
];

// Sample Analytics Data
export const sampleDailyStats: DailyStats[] = [
    { date: '2024-12-22', orders: 45, revenue: 52000 },
    { date: '2024-12-23', orders: 52, revenue: 61000 },
    { date: '2024-12-24', orders: 38, revenue: 44000 },
    { date: '2024-12-25', orders: 67, revenue: 78000 },
    { date: '2024-12-26', orders: 71, revenue: 85000 },
    { date: '2024-12-27', orders: 82, revenue: 95000 },
    { date: '2024-12-28', orders: 56, revenue: 67000 }
];

export const samplePopularItems: PopularItem[] = [
    { menuItemId: 'main-1', name: 'Chicken Biryani', orderCount: 156 },
    { menuItemId: 'main-3', name: 'Butter Chicken', orderCount: 98 },
    { menuItemId: 'starter-3', name: 'Chicken Wings', orderCount: 87 },
    { menuItemId: 'drink-1', name: 'Mango Lassi', orderCount: 72 },
    { menuItemId: 'dessert-1', name: 'Gulab Jamun', orderCount: 65 }
];

export const sampleTableStats: TableStats[] = sampleTables.map((table, i) => ({
    tableId: table.id,
    orderCount: Math.floor(Math.random() * 30) + 5
}));
