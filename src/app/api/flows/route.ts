import { NextResponse } from 'next/server';

const API_URL = 'https://api.xbase.app/api/flows';

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch flows' }, { status: 500 });
  }
}

// POST /api/flows - Criar um novo flow
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating flow:', error);
    return NextResponse.json({ error: 'Failed to create flow' }, { status: 500 });
  }
}