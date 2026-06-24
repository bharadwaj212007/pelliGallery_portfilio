import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-luxury-black text-stone-400 border-t border-white/5 pt-20 pb-10 px-6 md:px-12 mt-auto font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* About column */}
        <div className="space-y-6 md:col-span-2 text-left">
          <Link to="/" className="flex flex-col items-start group">
            <span className="font-serif text-2xl tracking-[0.2em] text-white group-hover:text-gold transition-colors duration-300">
              PELLIPUSTHAKAM
            </span>
            <span className="text-[9px] tracking-[0.3em] text-gold -mt-1 uppercase font-semibold">
              Photography · Hyderabad
            </span>
          </Link>
          <p className="text-xs md:text-sm text-stone-500 leading-relaxed max-w-sm font-light">
            We believe in translating fleeting wedding moments into grand visual histories. Pellipusthakam specializes in cinematic films and emotional candid snaps across Hyderabad and beyond.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-stone-500 hover:text-gold hover:border-gold/50 transition-all duration-300 bg-white/5">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-stone-500 hover:text-gold hover:border-gold/50 transition-all duration-300 bg-white/5">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links column */}
        <div className="space-y-6 text-left">
          <h4 className="font-serif text-gold text-sm tracking-[0.2em] uppercase font-bold">Navigation</h4>
          <div className="flex flex-col space-y-3 text-xs uppercase tracking-widest">
            <Link to="/" className="hover:text-gold transition-colors duration-300">Home</Link>
            <Link to="/portfolio" className="hover:text-gold transition-colors duration-300">Portfolio</Link>
            <Link to="/services" className="hover:text-gold transition-colors duration-300">Packages</Link>
            <Link to="/admin/login" className="hover:text-gold text-[10px] text-stone-600 transition-colors duration-300 pt-2">Admin Entrance</Link>
          </div>
        </div>

        {/* Studio Contact details */}
        <div className="space-y-6 text-left">
          <h4 className="font-serif text-gold text-sm tracking-[0.2em] uppercase font-bold">The Studio</h4>
          <div className="space-y-4 text-xs font-light leading-relaxed">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              <span>Gachibowli, Hyderabad,<br />Telangana - 500032</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold shrink-0" />
              <a href="mailto:inquire@pellipusthakam.com" className="hover:text-gold transition-colors">inquire@pellipusthakam.com</a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 text-center text-[10px] text-stone-600 tracking-wider uppercase font-medium">
        <p>&copy; {new Date().getFullYear()} Pellipusthakam Photography. Hyderabad. All Rights Reserved.</p>
        <p className="mt-2 text-[9px] text-stone-700 font-light tracking-[0.15em] lowercase">Created with love in celebration of forever stories.</p>
      </div>
    </footer>
  );
};

export default Footer;
