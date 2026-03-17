import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sigurna kupovina i prodaja | KupiAuto.ba',
  description:
    'Savjeti za sigurnu kupovinu i prodaju automobila. Naučite kako prepoznati prevare, zaštititi se i obaviti sigurnu transakciju na KupiAuto.ba.',
  openGraph: {
    title: 'Sigurna kupovina i prodaja | KupiAuto.ba',
    description:
      'Savjeti za sigurnu kupovinu i prodaju automobila. Prepoznajte prevare i zaštitite se.',
    siteName: 'KupiAuto.ba',
    locale: 'bs_BA',
    type: 'website',
  },
};

export default function SigurnostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
