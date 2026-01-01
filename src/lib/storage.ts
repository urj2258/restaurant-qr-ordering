import { Order, MenuItem, Table, OrderStatus, CartItem } from './types';
import { db, storage } from './firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, getDocs, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const STORAGE_KEYS = {
    CART: 'restaurant_cart',
};

const isBrowser = typeof window !== 'undefined';

// --- ORDERS ---

export const fetchOrders = async (): Promise<Order[]> => {
    try {
        const querySnapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        return querySnapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...(docSnapshot.data() as Omit<Order, 'id'>)
        })) as Order[];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...(docSnapshot.data() as Omit<Order, 'id'>)
        })) as Order[];
        callback(orders);
    }, (error) => {
        console.error("Orders subscription error:", error);
    });
};

export const fetchOrder = async (id: string): Promise<Order | null> => {
    try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) } as Order;
        }
    } catch (error) {
        console.error('Error fetching order:', error);
    }
    return null;
};

export const createOrder = async (order: Omit<Order, 'id'>): Promise<Order | null> => {
    try {
        const docRef = await addDoc(collection(db, 'orders'), {
            ...order,
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || new Date().toISOString()
        });
        return { id: docRef.id, ...order } as Order;
    } catch (error) {
        console.error('Error creating order:', error);
        return null;
    }
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
        const docRef = doc(db, 'orders', orderId);
        await updateDoc(docRef, {
            status,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating status:', error);
        return false;
    }
};

// --- TABLES ---

export const fetchTables = async (): Promise<Table[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'tables'));
        return querySnapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...(docSnapshot.data() as Omit<Table, 'id'>)
        })) as Table[];
    } catch (error) {
        console.error('Error fetching tables:', error);
        return [];
    }
};

export const createTable = async (table: Omit<Table, 'id'>): Promise<Table | null> => {
    try {
        const docRef = await addDoc(collection(db, 'tables'), table);
        return { id: docRef.id, ...table } as Table;
    } catch (error) {
        console.error('Error creating table:', error);
        return null;
    }
};

export const deleteTable = async (id: string): Promise<boolean> => {
    try {
        await updateDoc(doc(db, 'tables', id), { isDeleted: true }); // Soft delete or actual delete? Let's do actual for now
        // await deleteDoc(doc(db, 'tables', id)); 
        // Note: For now we'll stick to Firestore's deleteDoc if we want hard delete
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'tables', id));
        return true;
    } catch (error) {
        console.error('Error deleting table:', error);
        return false;
    }
};

// --- MENU ---

export const fetchMenu = async (): Promise<MenuItem[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, 'menu'));
        return querySnapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...(docSnapshot.data() as Omit<MenuItem, 'id'>)
        })) as MenuItem[];
    } catch (error) {
        console.error('Error fetching menu:', error);
        return [];
    }
};

export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem | null> => {
    try {
        const docRef = await addDoc(collection(db, 'menu'), {
            ...item,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...item } as MenuItem;
    } catch (error) {
        console.error('Error creating menu item:', error);
        return null;
    }
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<boolean> => {
    try {
        const docRef = doc(db, 'menu', id);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating menu item:', error);
        return false;
    }
};

export const deleteMenuItem = async (id: string): Promise<boolean> => {
    try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'menu', id));
        return true;
    } catch (error) {
        console.error('Error deleting menu item:', error);
        return false;
    }
};

// Legacy support
export const getMenu = (): MenuItem[] => { return []; };
export const saveMenu = (): void => { };

// Cart (per table - uses localStorage)
export function getCart(tableNumber: string): CartItem[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(`${STORAGE_KEYS.CART}_${tableNumber}`);
    return data ? JSON.parse(data) : [];
}

export function saveCart(tableNumber: string, cart: CartItem[]): void {
    if (!isBrowser) return;
    localStorage.setItem(`${STORAGE_KEYS.CART}_${tableNumber}`, JSON.stringify(cart));
}

export function clearCart(tableNumber: string): void {
    if (!isBrowser) return;
    localStorage.removeItem(`${STORAGE_KEYS.CART}_${tableNumber}`);
}

// Generate unique ID
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format price in PKR
export function formatPrice(price: number): string {
    return `Rs. ${price.toLocaleString()}`;
}

// Calculate order totals
export function calculateOrderTotals(items: CartItem[]): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((sum, item) => {
        let itemPrice = item.menuItem.price;
        if (item.selectedSize) {
            itemPrice += item.selectedSize.priceModifier;
        }
        const extrasPrice = item.selectedExtras?.reduce((e, extra) => e + extra.price, 0) || 0;
        return sum + (itemPrice + extrasPrice) * item.quantity;
    }, 0);

    const tax = Math.round(subtotal * 0.16); // 16% GST
    const total = subtotal + tax;

    return { subtotal, tax, total };
}

// --- STORAGE ---

export const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
        const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
};

// Cross-tab sync listener
export function onStorageChange(callback: (key: string) => void): () => void {
    if (!isBrowser) return () => { };

    const handler = (e: StorageEvent) => {
        if (e.key && Object.values(STORAGE_KEYS).some(k => e.key?.startsWith(k))) {
            callback(e.key);
        }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
}
