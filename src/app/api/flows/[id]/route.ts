import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/flows/[id] - Obter um flow específico
export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop(); // Aqui pegamos o 'id' da URL

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching flow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flow' },
      { status: 500 }
    );
  }
}

// PUT /api/flows/[id] - Atualizar um flow
export async function PUT(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop(); // Aqui pegamos o 'id' da URL

  try {
    // Log the raw request body for debugging
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    // Parse the body only if it's not empty
    let body;
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.log('Parsed request body:', body);

    if (!body.data) {
      return NextResponse.json(
        { error: 'Missing data in request body' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating flow:', error);
    return NextResponse.json(
      { error: 'Failed to update flow', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/flows/[id] - Deletar um flow
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.pathname.split('/').pop(); // Aqui pegamos o 'id' da URL

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting flow:', error);
    return NextResponse.json(
      { error: 'Failed to delete flow' },
      { status: 500 }
    );
  }
}
