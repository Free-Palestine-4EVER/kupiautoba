import { NextRequest, NextResponse } from 'next/server';
import { mockListings } from '@/lib/mock-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = mockListings.find((l) => l.id === id);

    if (!listing) {
      return NextResponse.json(
        { error: 'Oglas nije pronadjen' },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('GET /api/listings/[id] error:', error);
    return NextResponse.json(
      { error: 'Greska prilikom ucitavanja oglasa.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = mockListings.find((l) => l.id === id);

    if (!listing) {
      return NextResponse.json(
        { error: 'Oglas nije pronadjen' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate year if provided
    if (body.year !== undefined) {
      const year = parseInt(body.year, 10);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        return NextResponse.json(
          { success: false, error: 'Neispravna godina proizvodnje.' },
          { status: 400 }
        );
      }
    }

    // Validate price if provided
    if (body.price !== undefined) {
      const price = parseFloat(body.price);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { success: false, error: 'Cijena mora biti pozitivan broj.' },
          { status: 400 }
        );
      }
    }

    // Placeholder — does not actually update in Firestore yet
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/listings/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Greska prilikom azuriranja oglasa.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = mockListings.find((l) => l.id === id);

    if (!listing) {
      return NextResponse.json(
        { error: 'Oglas nije pronadjen' },
        { status: 404 }
      );
    }

    // Placeholder — does not actually delete from Firestore yet
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/listings/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Greska prilikom brisanja oglasa.' },
      { status: 500 }
    );
  }
}
