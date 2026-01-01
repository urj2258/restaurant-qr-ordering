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

// GET /api/local/tables
export async function GET() {
    const db = readDB();
    return NextResponse.json(db.tables);
}

// POST /api/local/tables - Add new table
export async function POST(request: NextRequest) {
    const db = readDB();
    const newTable = await request.json();
    newTable.id = `table-${Date.now()}`;
    db.tables.push(newTable);
    writeDB(db);
    return NextResponse.json(newTable, { status: 201 });
}
