import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | KupiAuto.ba',
  description:
    'Korisni savjeti za kupovinu i prodaju automobila, novosti iz auto industrije i vodiči za vlasnike vozila u Bosni i Hercegovini.',
  openGraph: {
    title: 'Blog | KupiAuto.ba',
    description:
      'Savjeti za kupovinu automobila, VIN provjere, održavanje i sve o auto tržištu u BiH.',
    siteName: 'KupiAuto.ba',
    locale: 'bs_BA',
    type: 'website',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
