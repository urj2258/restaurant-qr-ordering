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

// PATCH /api/local/orders/[id] - Update order
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = readDB();
    const updates = await request.json();

    const orderIndex = db.orders.findIndex((o: any) => o.id === id);
    if (orderIndex === -1) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    db.orders[orderIndex] = {
        ...db.orders[orderIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    writeDB(db);

    return NextResponse.json(db.orders[orderIndex]);
}

// DELETE /api/local/orders/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = readDB();

    db.orders = db.orders.filter((o: any) => o.id !== id);
    writeDB(db);

    return NextResponse.json({ success: true });
}
