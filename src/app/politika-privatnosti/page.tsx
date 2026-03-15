'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

/* ──────────────────────────────
   Data
   ────────────────────────────── */

const sections = [
  {
    title: 'Uvod',
    content:
      'KupiAuto.ba (u daljem tekstu: "mi", "nas", "platforma") posvecenaprivate zastiti vasih licnih podataka. Ova politika privatnosti objasnjava kako prikupljamo, koristimo, pohranjujemo i stitimo vase podatke kada koristite nasu web stranicu i usluge. Koristenjem platforme KupiAuto.ba prihvatate prakse opisane u ovoj politici privatnosti. Preporucujemo da pazljivo procitate ovaj dokument kako biste razumjeli nase postupke u vezi sa vasim licnim podacima.',
  },
  {
    title: 'Podaci koje prikupljamo',
    content:
      'Prikupljamo razlicite vrste podataka kako bismo vam pruzili nase usluge. Licni podaci koje prikupljamo ukljucuju: ime i prezime, email adresu, broj telefona, adresu, grad i postanski broj. Takoder prikupljamo podatke o vasim vozilima koja oglasite, ukljucujuci marku, model, godinu proizvodnje, kilometrazu i fotografije. Automatski prikupljamo tehnicke podatke poput IP adrese, tipa pretrazivaca, operativnog sistema, vremena pristupa i stranica koje posjecujete na nasoj platformi.',
  },
  {
    title: 'Kako koristimo vase podatke',
    content:
      'Vase podatke koristimo za pruzanje i poboljsanje nasih usluga, ukljucujuci: kreiranje i upravljanje vasim korisnickim racunom, objavljivanje i prikazivanje vasih oglasa, omogucavanje komunikacije izmedu kupaca i prodavaca, slanje obavijesti o vasim oglasima i aktivnostima na platformi, personalizaciju vaseg iskustva na platformi, te analizu koristenja platforme radi poboljsanja nasih usluga. Vase podatke ne koristimo u svrhe koje nisu opisane u ovoj politici privatnosti bez vaseg prethodnog pristanka.',
  },
  {
    title: 'Kolacici',
    content:
      'Nasa web stranica koristi kolacice (cookies) i slicne tehnologije za poboljsanje vaseg iskustva. Kolacici su mali tekstualni fajlovi koji se pohranjuju na vasem uredaju. Koristimo neophodne kolacice za funkcionisanje platforme, analiticke kolacice za razumijevanje nacina koristenja stranice, funkcionalne kolacice za pamcenje vasih preferencija, te marketinske kolacice za prikazivanje relevantnih oglasa. Mozete upravljati postavkama kolacica putem vaseg pretrazivaca. Napominjemo da onemogucavanje nekih kolacica moze utjecati na funkcionalnost platforme.',
  },
  {
    title: 'Dijeljenje podataka',
    content:
      'Vase licne podatke ne prodajemo trecim stranama. Podatke mozemo dijeliti u sljedecim situacijama: sa drugim korisnicima platforme u okviru oglasa (npr. kontakt podaci na oglasu), sa pruzaocima usluga koji nam pomazu u radu platforme (hosting, analitika, placanje), sa nadleznim organima kada je to zakonom propisano, te u slucaju spajanja, akvizicije ili prodaje imovine kompanije. Svi nasi partneri i pruzaoci usluga obavezni su da postuju odgovarajuce standarde zastite podataka.',
  },
  {
    title: 'Vasa prava',
    content:
      'U skladu sa zakonima o zastiti licnih podataka, imate sljedeca prava: pravo pristupa vasim licnim podacima koje cuvamo, pravo na ispravku netacnih podataka, pravo na brisanje vasih podataka ("pravo na zaborav"), pravo na ogranicenje obrade vasih podataka, pravo na prenosivost podataka, te pravo na prigovor na obradu vasih podataka. Za ostvarivanje bilo kojeg od ovih prava, molimo vas da nas kontaktirate putem informacija navedenih u sekciji Kontakt.',
  },
  {
    title: 'Sigurnost podataka',
    content:
      'Primjenjujemo odgovarajuce tehnicke i organizacione mjere za zastitu vasih licnih podataka od neovlastenog pristupa, gubitka, unistenja ili promjene. To ukljucuje enkripciju podataka u prijenosu i pohrani, redovne sigurnosne provjere, ogranicen pristup podacima samo ovlastenom osoblju, te redovno azuriranje nasih sigurnosnih sistema. Medjutim, nijedan sistem prijenosa podataka putem interneta nije apsolutno siguran, te ne mozemo garantovati apsolutnu sigurnost vasih podataka.',
  },
  {
    title: 'Kontakt',
    content:
      'Ako imate pitanja ili zabrinutosti u vezi sa ovom politikom privatnosti ili obradom vasih licnih podataka, mozete nas kontaktirati na sljedece nacine: putem emaila na privacy@kupiauto.ba, postom na adresu KupiAuto.ba, Sarajevo, Bosna i Hercegovina, ili putem kontakt forme na nasoj web stranici. Trudimo se odgovoriti na sve upite u roku od 30 dana.',
  },
];

/* ──────────────────────────────
   Animations
   ────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05 },
  }),
};

/* ──────────────────────────────
   Component
   ────────────────────────────── */

export default function PolitikaPrivatnostiPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Header ────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-600 to-navy-700">
          <div className="absolute top-10 left-1/4 w-72 h-72 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="absolute bottom-10 right-1/3 w-64 h-64 rounded-full bg-accent-400/8 blur-3xl" />
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Pravni dokument
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Politika privatnosti
            </h1>
            <p className="text-white/60 text-sm">
              Posljednje azuriranje: mart 2026.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Content ───────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto"
          >
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
              <div className="divide-y divide-[var(--border)]">
                {sections.map((section, i) => (
                  <motion.div
                    key={section.title}
                    variants={fadeUp}
                    custom={i}
                    className="p-6 sm:p-8"
                  >
                    <h2 className="text-xl font-bold text-[var(--foreground)] mb-3">
                      {i + 1}. {section.title}
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                      {section.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <motion.p
              variants={fadeUp}
              custom={sections.length}
              className="text-center text-xs text-[var(--muted-foreground)] mt-8"
            >
              Ova politika privatnosti je posljednji put azurirana u martu 2026. godine.
              Zadrzavamo pravo izmjene ove politike u bilo kojem trenutku.
              O svim znacajnim promjenama bicete obavijesteni putem emaila ili obavijesti na platformi.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
