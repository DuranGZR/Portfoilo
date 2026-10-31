'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import HolographicEffect from './HolographicEffect';
import { AboutPanel, EducationPanel, ExperiencePanel, SkillsPanel, ProjectsPanel } from './panels';

const islandConfig: Record<string, { color: string }> = {
    about: { color: '#819fa7' },
    education: { color: '#6b8a92' },
    experience: { color: '#5b7a82' },
    skills: { color: '#7aa3ab' },
    projects: { color: '#6d8f98' },
};

interface DetailPanelProps {
    islandId: string | null;
    onClose: () => void;
}

export default function DetailPanel({ islandId, onClose }: DetailPanelProps) {
    const t = useTranslations('resume3d');
    const config = islandId ? islandConfig[islandId] : null;

    useEffect(() => {
        if (!islandId) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [islandId, onClose]);

    const renderPanelContent = () => {
        if (!islandId || !config) return null;

        switch (islandId) {
            case 'about':
                return <AboutPanel color={config.color} />;
            case 'education':
                return <EducationPanel color={config.color} />;
            case 'experience':
                return <ExperiencePanel color={config.color} />;
            case 'skills':
                return <SkillsPanel color={config.color} />;
            case 'projects':
                return <ProjectsPanel color={config.color} />;
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {config && islandId && (
                <div
                    key={islandId}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                >
                    {/* GPU-only opacity backdrop (no backdrop-blur over live WebGL canvas) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute inset-0 bg-black/78"
                        style={{ willChange: 'opacity' }}
                    />

                    {/* GPU-composited modal card (transform + opacity only, zero layout thrashing) */}
                    <motion.div
                        className="relative z-10 w-full max-w-2xl"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={{ willChange: 'transform, opacity' }}
                    >
                        <HolographicEffect isActive={!!islandId} color={config.color}>
                            <div
                                className="overflow-hidden rounded-2xl"
                                style={{
                                    background: 'linear-gradient(180deg, #0e1013 0%, #090a0c 100%)',
                                    border: `1px solid ${config.color}38`,
                                    boxShadow: '0 25px 55px rgba(0, 0, 0, 0.85)',
                                }}
                            >
                                {/* Top accent line */}
                                <div
                                    className="h-[2px]"
                                    style={{
                                        background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                                    }}
                                />

                                {/* Header with close button */}
                                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06]">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-1 h-5 rounded-full"
                                            style={{ background: config.color }}
                                        />
                                        <h2 className="text-base sm:text-lg font-semibold text-white">
                                            {t(`${islandId}.title`)}
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/12 border border-white/10 text-white/60 hover:text-white transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Dynamic Panel Content */}
                                <div className="p-5 max-h-[72vh] overflow-y-auto overscroll-contain">
                                    {renderPanelContent()}
                                </div>

                                {/* Bottom accent */}
                                <div
                                    className="h-px"
                                    style={{
                                        background: `linear-gradient(90deg, transparent, ${config.color}30, transparent)`,
                                    }}
                                />
                            </div>
                        </HolographicEffect>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
