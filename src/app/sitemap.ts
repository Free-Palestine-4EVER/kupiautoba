import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.kupiauto.ba'

  const staticPages = [
    '', '/oglasi', '/objavi', '/saloni', '/postani-salon',
    '/prijava', '/registracija', '/uporedi', '/vin-provjera',
    '/faq', '/kontakt', '/o-nama', '/cjenovnik', '/blog', '/sigurnost',
    '/politika-privatnosti', '/uslovi-koristenja',
  ]

  return staticPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' : 'weekly' as const,
    priority: page === '' ? 1 : page === '/oglasi' ? 0.9 : 0.7,
  }))
}
