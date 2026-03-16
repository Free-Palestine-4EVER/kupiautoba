export function formatPrice(price: number, currency: string = 'KM'): string {
  return `${price.toLocaleString('de-DE')} ${currency}`;
}

export function formatMileage(km: number): string {
  return `${km.toLocaleString('de-DE')} km`;
}

export function formatPower(kw: number): string {
  const hp = Math.round(kw * 1.36);
  return `${kw} kW (${hp} KS)`;
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'upravo sada';
  if (minutes < 60) return `prije ${minutes} min`;
  if (hours < 24) return `prije ${hours}h`;
  if (days < 7) return `prije ${days} dana`;
  if (days < 30) return `prije ${Math.floor(days / 7)} sedmica`;
  return `prije ${Math.floor(days / 30)} mjeseci`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[đ]/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getFuelLabel(fuel: string): string {
  const map: Record<string, string> = {
    benzin: 'Benzin',
    dizel: 'Dizel',
    plin: 'Plin',
    hibrid: 'Hibrid',
    elektricni: 'Električni',
    'benzin+plin': 'Benzin+Plin',
  };
  return map[fuel] || fuel;
}

export function getTransmissionLabel(t: string): string {
  const map: Record<string, string> = {
    manuelni: 'Manuelni',
    automatski: 'Automatski',
    poluautomatski: 'Poluautomatski',
  };
  return map[t] || t;
}

export function getBodyLabel(b: string): string {
  const map: Record<string, string> = {
    limuzina: 'Limuzina',
    karavan: 'Karavan',
    hatchback: 'Hatchback',
    SUV: 'SUV',
    coupe: 'Coupe',
    cabrio: 'Cabrio',
    kombi: 'Kombi',
    pickup: 'Pickup',
    monovolumen: 'Monovolumen',
  };
  return map[b] || b;
}
