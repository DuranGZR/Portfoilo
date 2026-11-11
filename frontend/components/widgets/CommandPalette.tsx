"use client";

import { useEffect, useState, createElement } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  Home, 
  FolderOpen, 
  Code, 
  Briefcase, 
  MessageSquare,
  User,
  Lightbulb,
  Brain,
  Github,
  Linkedin,
  Mail,
  Globe,
  ExternalLink
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  category: 'navigation' | 'social' | 'actions' | 'language';
  shortcut?: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const t = useTranslations('commandPalette');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setOpen(false);
    }
  };

  const switchLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setOpen(false);
  };

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'home',
      label: t('navigation.home'),
      icon: Home,
      action: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setOpen(false); },
      category: 'navigation'
    },
    {
      id: 'about',
      label: t('navigation.about'),
      icon: User,
      action: () => scrollToSection('about'),
      category: 'navigation'
    },
    {
      id: 'projects',
      label: t('navigation.projects'),
      icon: FolderOpen,
      action: () => scrollToSection('projects'),
      category: 'navigation'
    },
    {
      id: 'skills',
      label: t('navigation.skills'),
      icon: Code,
      action: () => scrollToSection('skills'),
      category: 'navigation'
    },
    {
      id: 'experience',
      label: t('navigation.experience'),
      icon: Briefcase,
      action: () => scrollToSection('experience'),
      category: 'navigation'
    },
    {
      id: 'thinking',
      label: t('navigation.thinking'),
      icon: Lightbulb,
      action: () => scrollToSection('thinking'),
      category: 'navigation'
    },
    {
      id: 'ai-assistant',
      label: t('navigation.aiAssistant'),
      icon: MessageSquare,
      action: () => scrollToSection('ai-assistant'),
      category: 'navigation'
    },
    // Language
    {
      id: 'lang-tr',
      label: '🇹🇷 Türkçe',
      icon: Globe,
      action: () => switchLanguage('tr'),
      category: 'language',
      shortcut: locale === 'tr' ? '✓' : undefined
    },
    {
      id: 'lang-en',
      label: '🇬🇧 English',
      icon: Globe,
      action: () => switchLanguage('en'),
      category: 'language',
      shortcut: locale === 'en' ? '✓' : undefined
    },
    // Social
    {
      id: 'github',
      label: 'GitHub',
      icon: Github,
      action: () => window.open('https://github.com/DuranGZR', '_blank'),
      category: 'social'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      action: () => window.open('https://linkedin.com/in/durangezer', '_blank'),
      category: 'social'
    },
    {
      id: 'email',
      label: t('social.email'),
      icon: Mail,
      action: () => window.location.href = 'mailto:durangzr@gmail.com',
      category: 'social'
    }
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  const navigationCommands = filteredCommands.filter(c => c.category === 'navigation');
  const languageCommands = filteredCommands.filter(c => c.category === 'language');
  const socialCommands = filteredCommands.filter(c => c.category === 'social');

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 portfolio-light:bg-paper-veil/38 backdrop-blur-sm z-[100]"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
          >
            <Command className="rounded-2xl border border-[#819fa7]/30 portfolio-light:border-paper-line-strong bg-[#0d0d0d]/95 portfolio-light:bg-paper-raised/95 backdrop-blur-xl shadow-2xl portfolio-light:shadow-paper-elevated overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[#819fa7]/20 portfolio-light:border-paper-line-strong">
                <Search className="w-5 h-5 text-[#819fa7] portfolio-light:text-ink-accent" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder={t('placeholder')}
                  className="flex-1 bg-transparent border-none outline-none text-[#f3f5f9] portfolio-light:text-ink placeholder:text-[#f3f5f9]/40 portfolio-light:placeholder:text-ink-muted text-base"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#819fa7] portfolio-light:text-ink-accent bg-[#819fa7]/10 portfolio-light:bg-paper-tint rounded border border-[#819fa7]/20 portfolio-light:border-paper-line-strong">
                  ESC
                </kbd>
              </div>

              {/* Command List */}
              <Command.List className="max-h-[400px] overflow-y-auto p-2">
                <Command.Empty className="py-12 text-center text-sm text-[#f3f5f9]/50 portfolio-light:text-ink-muted">
                  {t('noResults')}
                </Command.Empty>

                {/* Navigation Commands */}
                {navigationCommands.length > 0 && (
                  <Command.Group heading={t('categories.navigation')} className="px-2 py-2">
                    <div className="text-xs font-semibold text-[#819fa7] portfolio-light:text-ink-accent uppercase tracking-wider mb-2 px-2">
                      {t('categories.navigation')}
                    </div>
                    {navigationCommands.map((cmd) => (
                      <Command.Item
                        key={cmd.id}
                        onSelect={() => cmd.action()}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-[#819fa7]/10 portfolio-light:hover:bg-paper-tint transition-colors group data-[selected=true]:bg-[#819fa7]/15 portfolio-light:data-[selected=true]:bg-paper-selected"
                      >
                        {createElement(cmd.icon, { className: "w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent group-hover:text-[#f3f5f9] portfolio-light:group-hover:text-ink transition-colors" })}
                        <span className="text-sm text-[#f3f5f9] portfolio-light:text-ink group-hover:text-[#f3f5f9] portfolio-light:group-hover:text-ink font-medium">
                          {cmd.label}
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Language Commands */}
                {languageCommands.length > 0 && (
                  <Command.Group heading={t('categories.language')} className="px-2 py-2 mt-2">
                    <div className="text-xs font-semibold text-[#819fa7] portfolio-light:text-ink-accent uppercase tracking-wider mb-2 px-2">
                      {t('categories.language')}
                    </div>
                    {languageCommands.map((cmd) => (
                      <Command.Item
                        key={cmd.id}
                        onSelect={() => cmd.action()}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-[#819fa7]/10 portfolio-light:hover:bg-paper-tint transition-colors group data-[selected=true]:bg-[#819fa7]/15 portfolio-light:data-[selected=true]:bg-paper-selected"
                      >
                        {createElement(cmd.icon, { className: "w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent group-hover:text-[#f3f5f9] portfolio-light:group-hover:text-ink transition-colors" })}
                        <span className="text-sm text-[#f3f5f9] portfolio-light:text-ink group-hover:text-[#f3f5f9] portfolio-light:group-hover:text-ink font-medium flex-1">
                          {cmd.label}
                        </span>
                        {cmd.shortcut && (
                          <span className="text-[#819fa7] portfolio-light:text-ink-accent text-sm">{cmd.shortcut}</span>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Social Commands */}
                {socialCommands.length > 0 && (
                  <Command.Group heading={t('categories.social')} className="px-2 py-2 mt-2">
                    <div className="text-xs font-semibold text-[#819fa7] portfolio-light:text-ink-accent uppercase tracking-wider mb-2 px-2">
                      {t('categories.social')}
                    </div>
                    {socialCommands.map((cmd) => (
                      <Command.Item
                        key={cmd.id}
                        onSelect={() => cmd.action()}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-[#819fa7]/10 portfolio-light:hover:bg-paper-tint transition-colors group data-[selected=true]:bg-[#819fa7]/15 portfolio-light:data-[selected=true]:bg-paper-selected"
                      >
                        {createElement(cmd.icon, { className: "w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent group-hover:text-[#f3f5f9] portfolio-light:group-hover:text-ink transition-colors" })}
                        <span className="text-sm text-[#f3f5f9] portfolio-light:text-ink group-hover:text-[#f3f5f9] portfolio-light:group-hover:text-ink font-medium flex-1">
                          {cmd.label}
                        </span>
                        <ExternalLink className="w-3 h-3 text-[#819fa7]/50 portfolio-light:text-ink-accent" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#819fa7]/20 portfolio-light:border-paper-line-strong bg-[#1a1a1a]/50 portfolio-light:bg-paper-raised">
                <div className="flex items-center gap-4 text-xs text-[#f3f5f9]/50 portfolio-light:text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-[#819fa7]/10 portfolio-light:bg-paper-tint rounded border border-[#819fa7]/20 portfolio-light:border-paper-line-strong text-[#819fa7] portfolio-light:text-ink-accent">↑↓</kbd>
                    {t('footer.navigate')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-[#819fa7]/10 portfolio-light:bg-paper-tint rounded border border-[#819fa7]/20 portfolio-light:border-paper-line-strong text-[#819fa7] portfolio-light:text-ink-accent">↵</kbd>
                    {t('footer.select')}
                  </span>
                </div>
                <div className="text-xs text-[#f3f5f9]/50 portfolio-light:text-ink-muted">
                  <kbd className="px-1.5 py-0.5 bg-[#819fa7]/10 portfolio-light:bg-paper-tint rounded border border-[#819fa7]/20 portfolio-light:border-paper-line-strong text-[#819fa7] portfolio-light:text-ink-accent">⌘K</kbd>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
