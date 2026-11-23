"use client";

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '@/components/widgets/LanguageSwitcher';

const navLinks = [
  { key: 'about', href: '#about' },
  { key: 'projects', href: '#projects' },
  { key: 'skills', href: '#skills' },
  { key: 'experience', href: '#experience' },
  { key: 'thinking', href: '#thinking' }
];

export default function Navigation({ heroTheme }: { heroTheme: 'light' | 'dark' }) {
  const t = useTranslations('navigation');
  const locale = useLocale();
  const pathname = usePathname();
  const isHome = pathname === `/${locale}`;
  const isProject = pathname.startsWith(`/${locale}/projects/`);
  const isPortfolio = isHome || isProject;
  const [theme, setTheme] = useState(heroTheme);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const themeTransitioning = useRef(false);
  const toggleTheme = () => {
    if (themeTransitioning.current) return;

    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const root = document.documentElement;
    const applyTheme = () => {
      root.dataset.heroTheme = nextTheme;
      document.cookie = `hero-theme=${nextTheme}; Path=/; Max-Age=31536000; SameSite=Lax`;
      setTheme(nextTheme);
    };

    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme();
      return;
    }

    themeTransitioning.current = true;
    root.setAttribute('data-theme-transitioning', '');
    const transition = document.startViewTransition(() => flushSync(applyTheme));
    const cleanup = () => {
      root.removeAttribute('data-theme-transitioning');
      themeTransitioning.current = false;
    };
    void transition.finished.then(cleanup, cleanup);
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setIsScrolled(scrollY > 50);

        const sections = navLinks.map(link => link.href.replace('#', ''));
        for (const section of [...sections].reverse()) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 200) {
              setActiveSection(section);
              break;
            }
          }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav
        data-scrolled={isScrolled || undefined}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-[#0d0d0d]/80 backdrop-blur-xl'
            : 'py-5 bg-transparent'
        } ${isPortfolio ? 'portfolio-nav' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-between md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {/* Left Side: Logo */}
          <motion.a
            href={isProject ? `/${locale}` : '#'}
            onClick={(e) => {
              if (isProject) return;
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="relative group md:justify-self-start"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="nav-logo text-xl font-display font-bold text-[#f3f5f9] group-hover:text-[#819fa7] transition-colors">
              DG
            </span>
          </motion.a>

          <div className="hidden md:flex items-center gap-0 lg:gap-1 xl:gap-2">
            {navLinks.map((link, index) => {
              const isActive = isHome && activeSection === link.href.slice(1);
              return (
                <motion.a
                  key={link.key}
                  href={isProject ? `/${locale}${link.href}` : link.href}
                  onClick={isProject ? undefined : (e) => handleClick(e, link.href)}
                  className={`nav-link relative px-1 lg:px-2 xl:px-4 whitespace-nowrap py-2 text-xs lg:text-sm font-medium transition-colors rounded-lg ${isActive
                    ? 'text-[#819fa7]'
                    : 'text-[#f3f5f9]/70 hover:text-[#f3f5f9]'
                    }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  {t(link.key)}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-[#819fa7]/10 portfolio-light:bg-paper-selected rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.a>
              );
            })}
          </div>

          <div className="flex items-center gap-1 lg:gap-5 md:justify-self-end">
            {/* 3D Resume Link */}
            <motion.a
              href="/3d-resume"
              className="nav-cv relative px-1.5 lg:px-2 xl:px-4 py-2 text-sm font-medium whitespace-nowrap text-[#819fa7] hover:text-[#819fa7] transition-colors rounded-lg hidden md:flex items-center gap-1 lg:gap-2 bg-[#819fa7]/5 border border-[#819fa7]/20 hover:border-[#819fa7]/40"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              whileHover={{ y: -2 }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3L2 8l10 5 10-5-10-5z" />
                <path d="M2 16l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              {t('3dresume')}
            </motion.a>

            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              {isPortfolio && (
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={locale === 'tr' ? 'Açık tema' : 'Light theme'}
                  aria-pressed={theme === 'light'}
                  className="nav-control flex size-11 items-center justify-center rounded-lg text-[#f3f5f9] hover:bg-[#819fa7]/10 transition-colors"
                >
                  {theme === 'light' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
                </button>
              )}
              <motion.button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="nav-control md:hidden flex size-11 items-center justify-center rounded-lg text-[#f3f5f9] hover:text-[#819fa7] transition-colors"
                whileTap={{ scale: 0.95 }}
                aria-label={locale === 'tr'
                  ? (isMobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç')
                  : (isMobileMenuOpen ? 'Close menu' : 'Open menu')}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu with stagger */}
      <motion.div
        id="mobile-navigation"
        inert={!isMobileMenuOpen}
        initial={{ opacity: 0, x: '100%' }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          x: isMobileMenuOpen ? 0 : '100%'
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 right-0 bottom-0 w-72 bg-[#0d0d0d]/98 portfolio-light:bg-paper-raised backdrop-blur-2xl border-l border-[#819fa7]/10 portfolio-light:border-paper-line z-40 md:hidden"
      >
        <div className="pt-24 px-6 flex flex-col gap-2">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.key}
              href={isProject ? `/${locale}${link.href}` : link.href}
              onClick={isProject ? undefined : (e) => handleClick(e, link.href)}
              className="text-lg font-medium text-[#f3f5f9]/80 portfolio-light:text-ink hover:text-[#819fa7] portfolio-light:hover:text-ink-accent transition-colors py-3 px-4 rounded-lg hover:bg-[#819fa7]/5 portfolio-light:hover:bg-paper-tint"
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: isMobileMenuOpen ? 1 : 0,
                x: isMobileMenuOpen ? 0 : 20
              }}
              transition={{ delay: isMobileMenuOpen ? index * 0.05 : 0 }}
            >
              {t(link.key)}
            </motion.a>
          ))}
        </div>
      </motion.div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 portfolio-light:bg-paper-veil/38 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </>
  );
}
