'use client';

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Monitor, SkipForward } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

// Dynamic import for 3D components (no SSR)
const World3D = dynamic(() => import('@/components/3d-resume/World3D'), {
    ssr: false,
    loading: () => <LoadingScreen />,
});

function LoadingScreen() {
    const locale = useLocale();
    return (
        <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center gap-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
                <Loader2 className="w-12 h-12 text-[#819fa7]" />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#f3f5f9]/70 text-lg"
            >
                {locale === 'en' ? 'Loading 3D world...' : 'Dünya yükleniyor...'}
            </motion.p>
        </div>
    );
}

function MobileWarning() {
    const t = useTranslations('resume3d');
    const locale = useLocale();

    return (
        <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center gap-6 p-8 text-center md:hidden z-50">
            <Monitor className="w-16 h-16 text-[#819fa7]" />
            <h2 className="text-xl font-bold text-[#f3f5f9]">{t('mobileWarning')}</h2>
            <p className="text-[#f3f5f9]/60 max-w-sm">
                {t('mobileDescription')}
            </p>
            <Link
                href={`/${locale}`}
                className="mt-4 px-6 py-3 bg-[#819fa7] text-[#050505] rounded-lg font-medium hover:bg-[#819fa7]/90 transition-colors"
            >
                {t('backToSite')}
            </Link>
        </div>
    );
}

export default function Resume3DPage() {
    const t = useTranslations('resume3d');
    const locale = useLocale();
    const [selectedIsland, setSelectedIsland] = useState<string | null>(null);

    // Intro sequence state
    const [introComplete, setIntroComplete] = useState(false);
    const [skipIntro, setSkipIntro] = useState(false);
    const [showUI, setShowUI] = useState(false);

    // Check localStorage for skip preference
    useEffect(() => {
        const skipPref = localStorage.getItem('skipResumeIntro');
        if (skipPref === 'true') {
            setIntroComplete(true);
            setShowUI(true);
        }
    }, []);

    // Show UI after intro completes
    useEffect(() => {
        if (introComplete) {
            const timer = setTimeout(() => setShowUI(true), 250);
            return () => clearTimeout(timer);
        }
    }, [introComplete]);

    // Handle intro completion
    const handleIntroComplete = useCallback(() => {
        setIntroComplete(true);
    }, []);

    // Handle skip intro
    const handleSkipIntro = useCallback(() => {
        setSkipIntro(true);
        setIntroComplete(true);
    }, []);

    // Keyboard listener for ESC to skip
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !introComplete) {
                handleSkipIntro();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [introComplete, handleSkipIntro]);

    return (
        <div className="fixed inset-0 bg-[#050505] overflow-hidden">
            {/* Mobile Warning */}
            <MobileWarning />

            {/* Skip Intro Button (opaque GPU surface, no backdrop-blur over WebGL) */}
            <AnimatePresence>
                {!introComplete && (
                    <motion.button
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleSkipIntro}
                        className="fixed bottom-8 right-8 z-40 hidden md:flex items-center gap-2 px-4 py-2 bg-[#121519]/92 border border-[#819fa7]/25 rounded-lg text-[#f3f5f9]/70 hover:text-[#f3f5f9] hover:border-[#819fa7]/45 transition-colors"
                    >
                        <span className="text-sm">{locale === 'en' ? 'Skip' : 'Atla'}</span>
                        <SkipForward className="w-4 h-4" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Intro Overlay - Cinematic bars using GPU scaleY */}
            <AnimatePresence>
                {!introComplete && (
                    <>
                        <motion.div
                            initial={{ scaleY: 1 }}
                            exit={{ scaleY: 0 }}
                            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                            style={{ transformOrigin: 'top' }}
                            className="fixed top-0 left-0 right-0 h-[12%] bg-black z-30 pointer-events-none"
                        />
                        <motion.div
                            initial={{ scaleY: 1 }}
                            exit={{ scaleY: 0 }}
                            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                            style={{ transformOrigin: 'bottom' }}
                            className="fixed bottom-0 left-0 right-0 h-[12%] bg-black z-30 pointer-events-none"
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Back Button */}
            <AnimatePresence>
                {showUI && (
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-6 left-6 z-30 hidden md:block"
                    >
                        <Link
                            href={`/${locale}`}
                            className="flex items-center gap-2 px-4 py-2 bg-[#121519]/92 border border-[#819fa7]/22 rounded-lg text-[#f3f5f9]/85 hover:text-[#f3f5f9] hover:border-[#819fa7]/45 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">{t('backToSite')}</span>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions (hidden while a detail panel is open) */}
            <AnimatePresence>
                {showUI && !selectedIsland && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:block pointer-events-none"
                    >
                        <div className="px-6 py-3 bg-[#121519]/92 border border-[#819fa7]/22 rounded-full">
                            <p className="text-sm text-[#f3f5f9]/65">
                                {t('instructions')}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 3D World */}
            <Suspense fallback={<LoadingScreen />}>
                <World3D
                    selectedIsland={selectedIsland}
                    onIslandSelect={setSelectedIsland}
                    introComplete={introComplete}
                    skipIntro={skipIntro}
                    onIntroComplete={handleIntroComplete}
                />
            </Suspense>
        </div>
    );
}
