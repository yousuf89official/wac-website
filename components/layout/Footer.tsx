import React from 'react';
import { motion } from 'framer-motion';
import { useGlobalContent } from '@/hooks/useContent';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  const { data, isLoading } = useGlobalContent();

  if (isLoading || !data) return null;

  const { navLinks, brand, socialLinks } = data;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-background py-[var(--section-padding)] overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-destructive p-[2px]">
                <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center font-black text-white text-xl">
                  W
                </div>
              </div>
              <span className="text-white font-black text-xl tracking-tighter">
                {brand?.name}
              </span>
            </div>
            <p className="text-gray-500 text-lg max-w-md mb-8 leading-relaxed">
              {brand?.tagline}
            </p>

            {/* Digital Footprint */}
            <div className="mb-8">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Digital Footprint</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks && socialLinks.length > 0 ? (
                  socialLinks.map((link: any) => (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -2, color: '#00f0ff' }}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:border-[#00f0ff]/30 transition-all duration-300"
                    >
                      {link.platform}
                    </motion.a>
                  ))
                ) : (
                  ['LinkedIn', 'X (Twitter)', 'Instagram'].map((platform) => (
                    <motion.a
                      key={platform}
                      href="#"
                      whileHover={{ y: -2, color: '#00f0ff' }}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:border-[#00f0ff]/30 transition-all duration-300"
                    >
                      {platform}
                    </motion.a>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">Navigation</h4>
            <ul className="flex flex-col gap-4">
              {navLinks?.map((link: any) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    className="text-gray-500 hover:text-primary text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-8">Contact</h4>
            <ul className="flex flex-col gap-4">
              <li className="text-gray-500 text-sm">
                <span className="block text-white font-semibold mb-1">Email Us</span>
                <a href={`mailto:${brand?.defaultEmail}`} className="hover:text-primary transition-colors">
                  {brand?.defaultEmail}
                </a>
              </li>
              <li className="text-gray-500 text-sm">
                <span className="block text-white font-semibold mb-1">Office</span>
                Melbourne, Australia
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-600 text-xs font-medium uppercase tracking-widest">
            &copy; {currentYear} {brand?.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-8">
            <a href="#" className="text-gray-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
              Terms of Service
            </a>
            {onAdminClick && (
              <button
                onClick={onAdminClick}
                className="px-3 py-1 rounded bg-red-500/10 text-red-500/50 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Access
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
