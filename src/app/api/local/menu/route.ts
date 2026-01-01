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

// GET /api/local/menu
export async function GET() {
    const db = readDB();
    return NextResponse.json(db.menu);
}

// POST /api/local/menu - Add new item
export async function POST(request: NextRequest) {
    const db = readDB();
    const newItem = await request.json();
    newItem.id = `item-${Date.now()}`;
    db.menu.push(newItem);
    writeDB(db);
    return NextResponse.json(newItem, { status: 201 });
}
