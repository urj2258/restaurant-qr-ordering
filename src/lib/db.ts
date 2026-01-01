import fs from 'fs';
import path from 'path';
import { Order, Table } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Update Schema definition (keep orders)
interface Schema {
    orders: Order[];
    tables: Table[];
}

// ... existing file setup code ...

// Update initial file creation to include tables
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ orders: [], tables: [] }, null, 2));
}

function writeDb(data: Schema) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function readDb(): Schema {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        // Ensure tables array exists for existing files
        if (!parsed.tables) parsed.tables = [];
        return parsed;
    } catch {
        return { orders: [], tables: [] };
    }
}

// ... writeDb function remains same ...

export const db = {
    // ... existing order methods ...
    getOrders: () => {
        const data = readDb();
        return data.orders;
    },

    getOrder: (id: string) => {
        const data = readDb();
        return data.orders.find(o => o.id === id);
    },

    addOrder: (order: Order) => {
        const data = readDb();
        data.orders.push(order);
        writeDb(data);
        return order;
    },

    updateOrder: (id: string, updates: Partial<Order>) => {
        const data = readDb();
        const index = data.orders.findIndex(o => o.id === id);
        if (index === -1) return null;

        data.orders[index] = { ...data.orders[index], ...updates };
        writeDb(data);
        return data.orders[index];
    },

    // Table Methods
    getTables: () => {
        const data = readDb();
        return data.tables;
    },

    addTable: (table: Table) => {
        const data = readDb();
        data.tables.push(table);
        writeDb(data);
        return table;
    },

    deleteTable: (id: string) => {
        const data = readDb();
        const initialLength = data.tables.length;
        data.tables = data.tables.filter(t => t.id !== id);
        if (data.tables.length !== initialLength) {
            writeDb(data);
            return true;
        }
        return false;
    }
};
