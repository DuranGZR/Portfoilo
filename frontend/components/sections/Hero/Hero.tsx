"use client";

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { ArrowRight, Sparkles, Github, Linkedin, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import GradientMesh from '@/components/effects/GradientMesh';
import ParticleNetwork from '@/components/effects/ParticleNetwork';
import { MASCOT_IDLE_EYES } from '@/components/widgets/Mascot/VisorPodMascot';
import { HERO_INTRO_READY } from './heroIntro';

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export default function Hero() {
  const t = useTranslations('hero');

  useEffect(() => {
    window.dispatchEvent(new Event(HERO_INTRO_READY));
  }, []);
  return (
    <section id="hero" className="relative min-h-[100svh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#0d0d0d]">
      <div className="hero-visor-opening" aria-hidden="true">
        <div className="hero-visor-eye-pair">
          <svg viewBox="25 43 59 20" fill="none" stroke="currentColor" strokeWidth="6.8" strokeLinecap="round">
            {MASCOT_IDLE_EYES.map((path) => <path key={path} d={path} />)}
          </svg>
        </div>
      </div>
      {/* Background gradient */}
      <div className="hero-background absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#0a0a0a] to-[#0d0d0d]" />

      {/* Animated Gradient Mesh */}
      <GradientMesh />

      {/* Full-screen Particle Network Background */}
      <div className="hero-network absolute inset-0 z-[5] hidden lg:block">
        <ParticleNetwork />
      </div>
      <div className="hero-impact" aria-hidden="true">
        <span className="hero-impact-ring" />
        {Array.from({ length: 10 }, (_, index) => <span key={index} className="hero-impact-spark" />)}
      </div>

      {/* Content - above particle network */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-20 pointer-events-none">
        <div className="flex flex-col items-center text-center">

          {/* Name — cinematic size */}
          <h1 className="hero-name relative text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold mb-4 leading-[0.95] tracking-tight">
            <span className="text-gradient drop-shadow-[0_0_40px_rgba(129,159,167,0.15)]">
              Duran Gezer
            </span>
            <span className="hero-title-light" aria-hidden="true">Duran Gezer</span>
          </h1>

          {/* Decorative separator */}
          <div className="hero-divider w-16 h-px bg-gradient-to-r from-transparent via-[#819fa7]/50 to-transparent my-6" />

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
              href="#ai-assistant"
              onClick={(e) => scrollToSection(e, '#ai-assistant')}
              className="btn-secondary group backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4 text-[#819fa7]" />
              {t('cta.secondary')}
            </motion.a>
          </div>

          {/* Social Links */}
          <div className="hero-socials flex gap-3 justify-center mt-8 pointer-events-auto">
            <a
              href="https://github.com/DuranGZR"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-[#1a1a1a]/50 border border-[#819fa7]/10 flex items-center justify-center text-[#819fa7]/70 hover:text-[#819fa7] hover:border-[#819fa7]/40 transition-all"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com/in/durangezer"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-[#1a1a1a]/50 border border-[#819fa7]/10 flex items-center justify-center text-[#819fa7]/70 hover:text-[#819fa7] hover:border-[#819fa7]/40 transition-all"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="mailto:contact@durangezer.com"
              className="w-10 h-10 rounded-xl bg-[#1a1a1a]/50 border border-[#819fa7]/10 flex items-center justify-center text-[#819fa7]/70 hover:text-[#819fa7] hover:border-[#819fa7]/40 transition-all"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          className="flex flex-col items-center text-[#5b6e74]"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-5 h-8 rounded-full border border-[#5b6e74]/50 flex items-start justify-center p-1.5 backdrop-blur-sm">
            <motion.div
              className="w-1 h-2 bg-[#819fa7] rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
