"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Car,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart,
} from "lucide-react";

const footerLinks = {
  oglasi: {
    title: "Oglasi",
    links: [
      { label: "Svi oglasi", href: "/oglasi" },
      { label: "Objavi oglas", href: "/objavi" },
      { label: "Uporedi vozila", href: "/uporedi" },
      { label: "Saloni", href: "/saloni" },
      { label: "VIN Provjera", href: "/vin-provjera" },
    ],
  },
  kompanija: {
    title: "Kompanija",
    links: [
      { label: "O nama", href: "/o-nama" },
      { label: "Kontakt", href: "/kontakt" },
      { label: "Postani salon", href: "/postani-salon" },
      { label: "Uslovi korištenja", href: "/uslovi-koristenja" },
      { label: "Politika privatnosti", href: "/politika-privatnosti" },
    ],
  },
  podrska: {
    title: "Podrška",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Prijava", href: "/prijava" },
      { label: "Registracija", href: "/registracija" },
    ],
  },
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative bg-navy-500 text-gray-300 overflow-hidden">
      {/* Subtle gradient overlay at the top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent-500/5 blur-3xl rounded-full" />

      {/* Main Footer Content */}
      <div className="relative container-custom pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 shadow-lg shadow-accent-500/20 group-hover:shadow-accent-500/40 transition-shadow duration-300">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-accent-400">Kupi</span>
                <span className="text-white">Auto</span>
                <span className="text-accent-400/70 text-sm font-medium">.ba</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Bosna i Hercegovina #1 auto oglasi. Pronadi, uporedi i kupi
              savrseni automobil na jednom mjestu.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-accent-400 flex-shrink-0" />
                <span>info@kupiauto.ba</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-accent-400 flex-shrink-0" />
                <span>+387 33 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-accent-400 flex-shrink-0" />
                <span>Sarajevo, Bosna i Hercegovina</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-accent-500/20 text-gray-400 hover:text-accent-400 border border-white/5 hover:border-accent-500/30 transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-accent-400 transition-colors duration-200 inline-flex items-center gap-1 group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-accent-500 transition-all duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="lg:col-span-2 md:col-span-2 lg:col-start-11 lg:col-end-13">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Pretplatite se za najnovije oglase i ponude.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Vasa e-mail adresa"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-xl shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 transition-all duration-300 active:scale-[0.98]"
              >
                {subscribed ? (
                  <span>Uspjesno ste se pretplatili!</span>
                ) : (
                  <>
                    <span>Pretplati se</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              &copy; {new Date().getFullYear()} KupiAuto.ba. Sva prava zadrzana.
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Napravljeno sa <Heart className="w-3 h-3 text-red-500 fill-red-500" /> u Bosni i Hercegovini
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
