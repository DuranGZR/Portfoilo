"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { AboutPanel, EducationPanel, ExperiencePanel, SkillsPanel, ProjectsPanel } from './panels';

const PANELS = {
    about: AboutPanel,
    education: EducationPanel,
    experience: ExperiencePanel,
    skills: SkillsPanel,
    projects: ProjectsPanel,
};

interface DetailPanelProps {
    islandId: string | null;
    onClose: () => void;
}

export default function DetailPanel({ islandId, onClose }: DetailPanelProps) {
    const t = useTranslations('resume3d');
    const locale = useLocale();
    const reduceMotion = useReducedMotion();
    const dialogRef = useRef<HTMLDivElement>(null);
    const Panel = islandId && Object.hasOwn(PANELS, islandId)
        ? PANELS[islandId as keyof typeof PANELS]
        : null;

    useEffect(() => {
        if (!Panel) return;
        const previousFocus = document.activeElement;
        const dialog = dialogRef.current;
        dialog?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
            }
            if (event.key !== 'Tab' || !dialog) return;
            const controls = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, [Panel, onClose]);

    return (
        <AnimatePresence>
            {Panel && islandId && (
                <div key={islandId} className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
                    <motion.div aria-hidden="true" className="absolute inset-0 bg-black/75" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} />
                    <motion.div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="resume-panel-title"
                        className="relative w-full max-w-3xl max-h-[86dvh] flex flex-col rounded-xl bg-[#101214] border border-white/10 text-[#f3f5f9] [overflow-wrap:anywhere] [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4"
                        onClick={event => event.stopPropagation()}
                        initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <header className="flex items-center justify-between gap-4 pl-6 pr-3 py-3 border-b border-white/10 shrink-0">
                            <h2 id="resume-panel-title" className="text-xl font-display font-medium">{t(`${islandId}.title`)}</h2>
                            <button type="button" onClick={onClose} aria-label={locale === 'tr' ? 'Pencereyi kapat' : 'Close panel'} className="size-11 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </header>
                        <div className="min-h-0 overflow-y-auto overscroll-contain p-6 sm:p-8"><Panel /></div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
