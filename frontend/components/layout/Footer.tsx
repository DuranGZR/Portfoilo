"use client";

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ArrowUpRight, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

const socialLinks = [
  { icon: Github, href: 'https://github.com/DuranGZR', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/durangezer', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:contact@durangezer.com', label: 'Email' }
];

const quickLinks = [
  { nameKey: 'about', href: '/#about' },
  { nameKey: 'projects', href: '/#projects' },
  { nameKey: 'skills', href: '/#skills' },
  { nameKey: 'experience', href: '/#experience' },
  { nameKey: 'thinking', href: '/#thinking' }
];


export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('navigation');
  const currentYear = new Date().getFullYear();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <footer className="relative bg-[#0d0d0d] portfolio-light:bg-paper border-t border-white/10 portfolio-light:border-paper-line">
        {/* Degrade arka plan (Diğer tüm bölümler ile birebir aynı) */}
        <div className="portfolio-section-backdrop absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] pointer-events-none" />

        <div className="relative z-10 max-w-[1100px] mx-auto px-4 md:px-6">
          
          {/* ===== MOBILE LAYOUT ===== */}
          <div className="md:hidden py-8">
            {/* Brand + Social Row */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-display font-bold text-[#f3f5f9] portfolio-light:text-ink">
                Duran Gezer
              </h3>
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="w-8 h-8 rounded-lg bg-[#141414] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line hover:border-white/25 portfolio-light:hover:border-paper-line-strong flex items-center justify-center text-[#819fa7] portfolio-light:text-ink-accent hover:text-white portfolio-light:hover:text-ink transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Tagline */}
            <p className="text-xs text-white/50 portfolio-light:text-ink-muted mb-4 leading-relaxed">
              {t('tagline')}
            </p>

            {/* Quick Links - Horizontal */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 pb-4 border-b border-white/10 portfolio-light:border-paper-line">
              {quickLinks.map((link) => (
                <a
                  key={link.nameKey}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="text-xs text-white/60 portfolio-light:text-ink-muted hover:text-white portfolio-light:hover:text-ink transition-colors"
                >
                  {tNav(link.nameKey)}
                </a>
              ))}
            </div>

            {/* Contact Button */}
            <a
              href="mailto:contact@durangezer.com"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-[#f3f5f9] portfolio-light:text-ink bg-[#141414] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line hover:border-white/25 portfolio-light:hover:border-paper-line-strong rounded-xl mb-4 transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-[#819fa7] portfolio-light:text-ink-accent" />
              {t('sendMessage')}
            </a>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-[10px] text-white/30 portfolio-light:text-ink-muted">
                © {currentYear} Duran Gezer • Next.js <Heart className="w-2.5 h-2.5 text-[#819fa7]/40 portfolio-light:text-ink-accent inline mx-0.5" />
              </p>
            </div>
          </div>

          {/* ===== DESKTOP LAYOUT ===== */}
          <div className="hidden md:block">
            {/* Main Footer Content */}
            <div className="py-16 grid grid-cols-12 gap-12">

              {/* Brand Section */}
              <div className="col-span-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-2xl font-display font-bold text-[#f3f5f9] portfolio-light:text-ink mb-4">
                    Duran Gezer
                  </h3>
                  <p className="text-sm text-white/60 portfolio-light:text-ink-muted leading-relaxed mb-6 max-w-sm">
                    {t('tagline')}
                  </p>

                  {/* Social Links */}
                  <div className="flex items-center gap-3">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={social.label}
                        href={social.href}
                        target={social.href.startsWith('http') ? '_blank' : undefined}
                        rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="group w-10 h-10 rounded-xl bg-[#141414] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line flex items-center justify-center text-[#819fa7] portfolio-light:text-ink-accent hover:text-white portfolio-light:hover:text-ink hover:border-white/30 portfolio-light:hover:border-paper-line-strong transition-all"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        aria-label={social.label}
                      >
                        <social.icon className="w-4 h-4" />
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Quick Links */}
              <div className="col-span-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h4 className="text-xs font-mono font-semibold text-[#819fa7] portfolio-light:text-ink-accent uppercase tracking-[0.2em] mb-5">
                    {t('quickLinks')}
                  </h4>
                  <ul className="space-y-3">
                    {quickLinks.map((link) => (
                      <li key={link.nameKey}>
                        <a
                          href={link.href}
                          onClick={(e) => handleClick(e, link.href)}
                          className="group flex items-center gap-2 text-sm text-white/60 portfolio-light:text-ink-muted hover:text-white portfolio-light:hover:text-ink transition-colors"
                        >
                          <span>{tNav(link.nameKey)}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#819fa7] portfolio-light:text-ink-accent" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Contact CTA */}
              <div className="col-span-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h4 className="text-xs font-mono font-semibold text-[#819fa7] portfolio-light:text-ink-accent uppercase tracking-[0.2em] mb-5">
                    {t('getInTouch')}
                  </h4>
                  <p className="text-sm text-white/60 portfolio-light:text-ink-muted mb-5 leading-relaxed">
                    {t('getInTouchDesc')}
                  </p>
                  <motion.a
                    href="mailto:contact@durangezer.com"
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#f3f5f9] portfolio-light:text-ink bg-[#141414] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line hover:border-white/30 portfolio-light:hover:border-paper-line-strong hover:bg-white/5 portfolio-light:hover:bg-paper-tint rounded-xl transition-all group"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent group-hover:text-white portfolio-light:group-hover:text-ink transition-colors" />
                    {t('sendMessage')}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#819fa7] portfolio-light:text-ink-accent" />
                  </motion.a>
                </motion.div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="py-6 border-t border-white/10 portfolio-light:border-paper-line flex flex-row items-center justify-between gap-4">
              <p className="text-xs text-white/40 portfolio-light:text-ink-muted flex items-center gap-1">
                © {currentYear} Duran Gezer. {t('builtWith')}
                <Heart className="w-3 h-3 text-[#819fa7]/50 portfolio-light:text-ink-accent inline mx-1" />
                Next.js
              </p>
              <p className="text-xs text-white/40 portfolio-light:text-ink-muted">
                {t('copyright')}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

