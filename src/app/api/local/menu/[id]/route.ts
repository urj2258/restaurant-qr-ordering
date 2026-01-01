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

// PATCH /api/local/menu/[id] - Update menu item
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = readDB();
    const updates = await request.json();

    const itemIndex = db.menu.findIndex((m: any) => m.id === id);
    if (itemIndex === -1) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    db.menu[itemIndex] = { ...db.menu[itemIndex], ...updates };
    writeDB(db);

    return NextResponse.json(db.menu[itemIndex]);
}

// DELETE /api/local/menu/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const db = readDB();

    db.menu = db.menu.filter((m: any) => m.id !== id);
    writeDB(db);

    return NextResponse.json({ success: true });
}
