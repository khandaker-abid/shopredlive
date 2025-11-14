import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(_req, { params }) {

  const { id } = await params
  try {
    const response = await fetch(`${BACKEND_URL}/product/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      throw new Error(`Backend error: ${response.status}`);
    }
    const product = await response.json();
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product from backend:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const data = await req.json();

    const response = await fetch(`${BACKEND_URL}/product/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `Backend error: ${response.status}`);
    }

    const updatedProduct = await response.json();
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const response = await fetch(`${BACKEND_URL}/product/${params.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `Backend error: ${response.status}`);
    }

    const deletedProduct = await response.json();
    return NextResponse.json(deletedProduct);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}


