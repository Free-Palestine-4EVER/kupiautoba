'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

/* ──────────────────────────────
   Data
   ────────────────────────────── */

const sections = [
  {
    title: 'Opsti uslovi',
    content:
      'Dobrodosli na KupiAuto.ba. Ovi uslovi koristenja (u daljem tekstu: "Uslovi") regulisu vas pristup i koristenje web stranice KupiAuto.ba i svih povezanih usluga (u daljem tekstu: "Platforma"). Koristenjem Platforme prihvatate ove Uslove u cijelosti. Ako se ne slazete sa bilo kojim dijelom ovih Uslova, molimo vas da ne koristite Platformu. KupiAuto.ba zadrzava pravo da u bilo kojem trenutku izmijeni ove Uslove, a nastavak koristenja Platforme nakon izmjena smatrace se prihvatanjem novih Uslova.',
  },
  {
    title: 'Registracija i korisnicki racun',
    content:
      'Za koristenje odredjenih funkcija Platforme potrebno je kreirati korisnicki racun. Prilikom registracije obavezni ste pruziti tacne, potpune i azurne informacije. Odgovorni ste za cuvanje povjerljivosti vasih pristupnih podataka i za sve aktivnosti koje se odvijaju putem vaseg racuna. U slucaju neovlastenog pristupa vasem racunu, obavezni ste odmah obavijestiti KupiAuto.ba. Zadrzavamo pravo da suspendujemo ili ukinemo vas racun u slucaju krsenja ovih Uslova, bez prethodne najave.',
  },
  {
    title: 'Objavljivanje oglasa',
    content:
      'Korisnici mogu objavljivati oglase za prodaju vozila na Platformi. Objavljivanjem oglasa garantujete da: ste vlasnik vozila ili imate ovlastenje za prodaju, sve informacije u oglasu su tacne i potpune, fotografije prikazuju stvarno stanje vozila, cijena je realna i odrazava stvarnu namjeru prodaje. KupiAuto.ba ne preuzima odgovornost za tacnost informacija u oglasima. Zadrzavamo pravo da uklonimo oglase koji krse ove Uslove ili koji su na drugi nacin neprikladni, bez prethodne najave i bez obaveze povrata sredstava.',
  },
  {
    title: 'Zabranjen sadrzaj',
    content:
      'Na Platformi je strogo zabranjeno objavljivanje sljedeceg sadrzaja: lazni ili obmanjujuci oglasi, oglasi za ukradena vozila ili vozila sa neregulisanom dokumentacijom, sadrzaj koji krsi autorska prava ili prava intelektualne svojine trecih lica, uvredljiv, diskriminirajuci ili nezakonit sadrzaj, spam ili nezeljena komercijalna komunikacija, sadrzaj koji sadrzi viruse ili maliciozni softver, te bilo koji sadrzaj koji krsi vazece zakone Bosne i Hercegovine. Krsenje ovih pravila moze rezultirati trajnim uklanjanjem vaseg racuna.',
  },
  {
    title: 'Odgovornost',
    content:
      'KupiAuto.ba djeluje iskljucivo kao posrednik koji omogucava povezivanje kupaca i prodavaca vozila. Ne ucestvujemo u transakcijama izmedu korisnika i ne preuzimamo odgovornost za: kvalitet, sigurnost ili zakonitost oglasenih vozila, tacnost oglasa ili sposobnost prodavaca da prodaju vozila, sposobnost kupaca da plate za vozila, te bilo kakve sporove izmedu korisnika. Platforma se pruza "takva kakva je" bez bilo kakvih garancija, izricitih ili impliciranih. Koristenje Platforme je na vasu vlastitu odgovornost.',
  },
  {
    title: 'Intelektualna svojina',
    content:
      'Sav sadrzaj na Platformi, ukljucujuci ali ne ogranicavajuci se na logotip, dizajn, tekstove, grafiku, softver i kod, zastiteni su autorskim pravima i drugim pravima intelektualne svojine koja pripadaju KupiAuto.ba ili nasim davaocima licence. Zabranjeno je kopiranje, modifikovanje, distribuiranje ili bilo koje drugo koristenje naseg sadrzaja bez prethodnog pisanog odobrenja. Sadrzaj koji korisnici objave na Platformi ostaje njihovo vlasnistvo, ali nam dajete neekskluzivnu licencu za koristenje tog sadrzaja u svrhu pruzanja nasih usluga.',
  },
  {
    title: 'Promjene uslova',
    content:
      'KupiAuto.ba zadrzava pravo da u bilo kojem trenutku izmijeni ove Uslove koristenja. O znacajnim promjenama bicete obavijesteni putem emaila ili obavijesti na Platformi najmanje 15 dana prije stupanja na snagu novih Uslova. Nastavak koristenja Platforme nakon stupanja na snagu izmijenjenih Uslova smatrace se vasim prihvatanjem istih. Ako se ne slazete sa novim Uslovima, imate pravo da prestanete koristiti Platformu i zatrazite brisanje vaseg racuna.',
  },
  {
    title: 'Rjesavanje sporova',
    content:
      'U slucaju spora koji proizlazi iz koristenja Platforme ili ovih Uslova, strane ce nastojati da spor rijese sporazumno u roku od 30 dana od pisanog obavijestenja o sporu. Ukoliko sporazumno rjesenje nije moguce, spor ce se rjesavati pred nadleznim sudom u Sarajevu, Bosna i Hercegovina. Na ove Uslove i sve sporove koji proizlaze iz njih primjenjuju se zakoni Bosne i Hercegovine. Korisnici takodjer imaju pravo da podnesu prigovor nadleznom tijelu za zastitu potrosaca.',
  },
  {
    title: 'Kontakt',
    content:
      'Za sva pitanja, prijedloge ili prigovore u vezi sa ovim Uslovima koristenja, mozete nas kontaktirati putem emaila na legal@kupiauto.ba, postom na adresu KupiAuto.ba, Sarajevo, Bosna i Hercegovina, ili putem kontakt forme na nasoj web stranici. Nas tim za podrsku ce odgovoriti na vas upit u najkracem mogucemu roku, a najkasnije u roku od 15 radnih dana od prijema vaseg upita.',
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

export default function UsloviKoristenjaPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Header ────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-600 to-navy-700">
          <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-64 h-64 rounded-full bg-accent-400/8 blur-3xl" />
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <FileText className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Pravni dokument
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Uslovi koristenja
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
              Ovi uslovi koristenja su posljednji put azurirani u martu 2026. godine.
              Koristenjem platforme KupiAuto.ba prihvatate ove uslove u cijelosti.
              Za sva pitanja obratite nam se na legal@kupiauto.ba.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
