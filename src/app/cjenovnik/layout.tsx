import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cjenovnik za salone | KupiAuto.ba',
  description:
    'Odaberite idealan paket za vaš auto salon na KupiAuto.ba. Start, Standard, Premium ili VIP — paketi od 49 KM mjesečno za maksimalnu vidljivost.',
  openGraph: {
    title: 'Cjenovnik za salone | KupiAuto.ba',
    description:
      'Odaberite idealan paket za vaš auto salon. Paketi od 49 KM mjesečno.',
    siteName: 'KupiAuto.ba',
    locale: 'bs_BA',
    type: 'website',
  },
};

export default function CjenovnikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
