import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/products`);
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    const products = await response.json();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products from backend:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.description || typeof data.price === 'undefined' || data.price === null) {
      return NextResponse.json({ error: 'Name, description, and price are required' }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL}/newProduct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product: data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create product');
    }

    const newProduct = await response.json();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}


