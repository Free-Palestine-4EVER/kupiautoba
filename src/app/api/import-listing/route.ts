import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_DOMAINS = ['olx.ba', 'autoplac.ba', 'autobum.ba'];

function getDomainFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');
    return hostname;
  } catch {
    return null;
  }
}

function generateMockListingFromUrl(url: string) {
  const domain = getDomainFromUrl(url)!;

  // Generate slightly different mock data based on the source domain
  const mockByDomain: Record<string, {
    make: string;
    model: string;
    year: number;
    mileage: number;
    fuel: string;
    transmission: string;
    price: number;
    description: string;
    photos: string[];
  }> = {
    'olx.ba': {
      make: 'Volkswagen',
      model: 'Golf 7',
      year: 2017,
      mileage: 135000,
      fuel: 'dizel',
      transmission: 'manuelni',
      price: 22500,
      description: 'Volkswagen Golf 7 1.6 TDI, uvezen iz Njemacke, uredno servisiran. Klima, tempomat, parking senzori. Registrovan do 06/2026.',
      photos: [
        'https://olx.ba/images/placeholder1.jpg',
        'https://olx.ba/images/placeholder2.jpg',
      ],
    },
    'autoplac.ba': {
      make: 'BMW',
      model: '320d',
      year: 2018,
      mileage: 112000,
      fuel: 'dizel',
      transmission: 'automatski',
      price: 35000,
      description: 'BMW 320d Sport Line, automatik, navigacija, LED svjetla, koža. Servisna knjiga, jedan vlasnik.',
      photos: [
        'https://autoplac.ba/images/placeholder1.jpg',
        'https://autoplac.ba/images/placeholder2.jpg',
      ],
    },
    'autobum.ba': {
      make: 'Audi',
      model: 'A3',
      year: 2019,
      mileage: 89000,
      fuel: 'benzin',
      transmission: 'automatski',
      price: 28900,
      description: 'Audi A3 Sportback 1.5 TFSI S-Tronic, virtual cockpit, MMI navigacija, bi-xenon. Garancija 12 mjeseci.',
      photos: [
        'https://autobum.ba/images/placeholder1.jpg',
        'https://autobum.ba/images/placeholder2.jpg',
      ],
    },
  };

  return mockByDomain[domain] || mockByDomain['olx.ba'];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL je obavezan.' },
        { status: 400 }
      );
    }

    const domain = getDomainFromUrl(url);

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Neispravan URL format.' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_DOMAINS.includes(domain)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nepodrzani sajt. Podrzani sajtovi: OLX.ba, AutoPlac.ba, AutoBum.ba',
        },
        { status: 400 }
      );
    }

    const data = generateMockListingFromUrl(url);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Import listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Greska prilikom obrade zahtjeva.' },
      { status: 500 }
    );
  }
}
