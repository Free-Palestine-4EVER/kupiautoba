import { NextRequest, NextResponse } from 'next/server';
import { Listing, FuelType, TransmissionType, BodyType } from '@/types';
import { mockListings } from '@/lib/mock-data';

function applyFilters(listings: Listing[], params: URLSearchParams): Listing[] {
  let filtered = [...listings];

  const make = params.get('make');
  if (make) {
    filtered = filtered.filter(
      (l) => l.make.toLowerCase() === make.toLowerCase()
    );
  }

  const model = params.get('model');
  if (model) {
    filtered = filtered.filter((l) =>
      l.model.toLowerCase().includes(model.toLowerCase())
    );
  }

  const yearFrom = params.get('yearFrom');
  if (yearFrom) {
    filtered = filtered.filter((l) => l.year >= parseInt(yearFrom, 10));
  }

  const yearTo = params.get('yearTo');
  if (yearTo) {
    filtered = filtered.filter((l) => l.year <= parseInt(yearTo, 10));
  }

  const priceFrom = params.get('priceFrom');
  if (priceFrom) {
    filtered = filtered.filter((l) => l.price >= parseInt(priceFrom, 10));
  }

  const priceTo = params.get('priceTo');
  if (priceTo) {
    filtered = filtered.filter((l) => l.price <= parseInt(priceTo, 10));
  }

  const mileageFrom = params.get('mileageFrom');
  if (mileageFrom) {
    filtered = filtered.filter((l) => l.mileage >= parseInt(mileageFrom, 10));
  }

  const mileageTo = params.get('mileageTo');
  if (mileageTo) {
    filtered = filtered.filter((l) => l.mileage <= parseInt(mileageTo, 10));
  }

  const fuel = params.get('fuel');
  if (fuel) {
    filtered = filtered.filter((l) => l.fuel === (fuel as FuelType));
  }

  const transmission = params.get('transmission');
  if (transmission) {
    filtered = filtered.filter(
      (l) => l.transmission === (transmission as TransmissionType)
    );
  }

  const body = params.get('body');
  if (body) {
    filtered = filtered.filter((l) => l.body === (body as BodyType));
  }

  const city = params.get('city');
  if (city) {
    filtered = filtered.filter(
      (l) => l.city.toLowerCase() === city.toLowerCase()
    );
  }

  return filtered;
}

function applySorting(listings: Listing[], sort: string | null): Listing[] {
  if (!sort) return listings;

  const sorted = [...listings];

  switch (sort) {
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'mileage-asc':
      return sorted.sort((a, b) => a.mileage - b.mileage);
    default:
      return sorted;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Apply filters
    let results = applyFilters(mockListings, searchParams);

    // Apply sorting
    const sort = searchParams.get('sort');
    results = applySorting(results, sort);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get('limit') || '12', 10))
    );
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedListings = results.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      listings: paginatedListings,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error('GET /api/listings error:', error);
    return NextResponse.json(
      { error: 'Greska prilikom ucitavanja oglasa.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['make', 'model', 'year', 'price'];
    const missingFields = requiredFields.filter(
      (field) => !body[field] && body[field] !== 0
    );

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Nedostaju obavezna polja: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate year is a reasonable number
    const year = parseInt(body.year, 10);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return NextResponse.json(
        { success: false, error: 'Neispravna godina proizvodnje.' },
        { status: 400 }
      );
    }

    // Validate price is a positive number
    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Cijena mora biti pozitivan broj.' },
        { status: 400 }
      );
    }

    // Placeholder response — does not actually save to Firestore yet
    return NextResponse.json(
      {
        success: true,
        id: `listing-${Date.now()}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/listings error:', error);
    return NextResponse.json(
      { success: false, error: 'Greska prilikom kreiranja oglasa.' },
      { status: 500 }
    );
  }
}
