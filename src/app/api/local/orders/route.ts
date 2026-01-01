import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'public', 'database.json');

function readDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { menu: [], tables: [], orders: [], users: [] };
    }
}

function writeDB(data: any) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// GET /api/local/orders
export async function GET() {
    const db = readDB();
    // Sort by createdAt descending
    const sortedOrders = db.orders.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sortedOrders);
}

// POST /api/local/orders - Create new order
export async function POST(request: NextRequest) {
    const db = readDB();
    const newOrder = await request.json();
    newOrder.id = `order-${Date.now()}`;
    newOrder.createdAt = new Date().toISOString();
    newOrder.updatedAt = new Date().toISOString();
    db.orders.push(newOrder);
    writeDB(db);
    return NextResponse.json(newOrder, { status: 201 });
}
