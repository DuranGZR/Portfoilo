"use client";

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { ArrowRight, FileText, Github, Linkedin, Mail } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { HERO_INTRO_READY } from './heroIntro';
import AsciiCloth from './AsciiCloth';

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const cvHref = locale === 'en' ? '/cv/Duran_Gezer_CV_EN.pdf' : '/cv/Duran_Gezer_CV_TR.pdf';

  useEffect(() => {
    window.dispatchEvent(new Event(HERO_INTRO_READY));
  }, []);
  return (
    <section id="hero" className="relative min-h-svh md:min-h-screen flex items-center justify-center overflow-hidden bg-[#0d0d0d]">
      <AsciiCloth />
      <div className="hero-visor-opening" aria-hidden="true">
        <div className="hero-visor-eye-pair">
          <pre data-opening-eyes>{[
            '    .:====:.          .:====:.    ',
            '  .+########+.      .+########+.  ',
            ' :###*====*###:    :###*====*###: ',
            ' +##+.    .+##+    +##+.    .+##+ ',
            ' *##:      :##*    *##:      :##* ',
            ' .+:.      .:+.    .+:.      .:+. ',
          ].join('\n')}</pre>
        </div>
      </div>
      <div className="hero-impact" aria-hidden="true">
        <span className="hero-impact-ring" />
        {Array.from({ length: 10 }, (_, index) => <span key={index} className="hero-impact-spark" />)}
      </div>

      {/* Hero content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-20 pointer-events-none">
        <div className="flex flex-col items-center text-center">

          {/* Name — cinematic size */}
          <h1 className="hero-name relative text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold mb-4 leading-[0.95] tracking-tight">
            Duran Gezer
          </h1>

          {/* Decorative separator */}
          <div className="hero-divider w-16 h-px bg-[#819fa7]/30 my-6" />

          {/* Title */}
          <p className="hero-role relative text-lg sm:text-xl md:text-2xl font-display font-medium mb-5 text-[#819fa7]">
            <span className="hero-ink">{t('title')}</span>
            <span className="hero-pen" aria-hidden="true" />
          </p>

          {/* Focus Areas */}
          <p className="hero-description relative text-xs sm:text-[13px] md:text-sm text-[#f3f5f9]/50 max-w-xl mx-auto mb-10 leading-relaxed">
            <span className="hero-ink">{t('subtitle')}</span>
            <span className="hero-pen" aria-hidden="true" />
          </p>

          {/* CTAs */}
          <div className="hero-actions flex flex-row gap-4 justify-center flex-wrap pointer-events-auto">
            <motion.a
              href="#projects"
              onClick={(e) => scrollToSection(e, '#projects')}
              className="btn-primary group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('cta.primary')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>

            <motion.a
              href={cvHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary group backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FileText className="w-4 h-4 text-[#819fa7]" />
              {t('cta.secondary')}
            </motion.a>
          </div>

          {/* Social Links */}
          <div className="hero-socials flex gap-3 justify-center mt-8 pointer-events-auto">
            <a
              href="https://github.com/DuranGZR"
              aria-label={t('socialLinks.github')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-[#1a1a1a]/50 border border-[#819fa7]/10 flex items-center justify-center text-[#819fa7]/70 hover:text-[#819fa7] hover:border-[#819fa7]/40 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#819fa7]"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="https://linkedin.com/in/durangzr"
              aria-label={t('socialLinks.linkedin')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-[#1a1a1a]/50 border border-[#819fa7]/10 flex items-center justify-center text-[#819fa7]/70 hover:text-[#819fa7] hover:border-[#819fa7]/40 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#819fa7]"
            >
              <Linkedin className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="mailto:contact@durangezer.com"
              aria-label={t('socialLinks.email')}
              className="w-10 h-10 rounded-xl bg-[#1a1a1a]/50 border border-[#819fa7]/10 flex items-center justify-center text-[#819fa7]/70 hover:text-[#819fa7] hover:border-[#819fa7]/40 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#819fa7]"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center text-[#5b6e74]">
          <div className="w-5 h-8 rounded-full border border-[#5b6e74]/50 flex items-start justify-center p-1.5 backdrop-blur-sm">
            <div className="w-1 h-2 bg-[#819fa7] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
