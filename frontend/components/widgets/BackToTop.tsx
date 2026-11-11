"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [placeOnRight, setPlaceOnRight] = useState(false);

    useEffect(() => {
        let ticking = false;

        const toggleVisibility = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                setIsVisible(window.scrollY > 500);
                ticking = false;
            });
        };

        const handleMascotCorner = (e: Event) => {
            const custom = e as CustomEvent<{ corner?: string }>;
            setPlaceOnRight(custom.detail?.corner === 'bottom-left');
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        window.addEventListener('mascot-corner-change', handleMascotCorner);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
            window.removeEventListener('mascot-corner-change', handleMascotCorner);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{
                        layout: { type: 'spring', stiffness: 220, damping: 24 },
                        duration: 0.25,
                    }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={scrollToTop}
                    className={`fixed bottom-6 ${
                        placeOnRight ? 'right-6' : 'left-6'
                    } z-40 w-11 h-11 rounded-full bg-[#14181d]/85 portfolio-light:bg-paper-raised border border-[#819fa7]/25 portfolio-light:border-paper-line-strong backdrop-blur-md flex items-center justify-center text-[#819fa7] portfolio-light:text-ink-accent hover:bg-[#819fa7]/20 portfolio-light:hover:bg-paper-selected hover:border-[#819fa7]/45 portfolio-light:hover:border-paper-line-strong transition-colors shadow-lg portfolio-light:shadow-paper`}
                    aria-label="Back to top"
                >
                    <ArrowUp className="w-5 h-5" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
