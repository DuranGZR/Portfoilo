"use client";

import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

/**
 * GradientMesh - Animated gradient blobs for Hero background
 * Creates organic, fluid motion with overlapping gradients
 * Optimized: Pauses animations when scrolled out of viewport
 */
export default function GradientMesh() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // When not visible, render static blobs (no animation cost)
    const animationProps = isVisible
        ? undefined
        : { animate: undefined };

    return (
        <div ref={containerRef} className="hero-mesh absolute inset-0 overflow-hidden pointer-events-none">
            {/* Primary blob - top left */}
            <motion.div
                className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(145, 149, 151, 0.12) 0%, transparent 60%)',
                    willChange: isVisible ? 'transform' : 'auto',
                    transform: 'translateZ(0)',
                }}
                animate={isVisible ? {
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                } : undefined}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Secondary blob - bottom right */}
            <motion.div
                className="absolute -bottom-1/4 -right-1/4 w-[700px] h-[700px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(105, 108, 110, 0.1) 0%, transparent 60%)',
                    willChange: isVisible ? 'transform' : 'auto',
                    transform: 'translateZ(0)',
                }}
                animate={isVisible ? {
                    x: [0, -40, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.15, 1],
                } : undefined}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                }}
            />

            {/* Tertiary blob - center */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(145, 149, 151, 0.06) 0%, transparent 70%)',
                    willChange: isVisible ? 'transform, opacity' : 'auto',
                    transform: 'translateZ(0)',
                }}
                animate={isVisible ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                } : undefined}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            {/* Accent blob - floating */}
            <motion.div
                className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(145, 149, 151, 0.08) 0%, transparent 70%)',
                    willChange: isVisible ? 'transform' : 'auto',
                    transform: 'translateZ(0)',
                }}
                animate={isVisible ? {
                    x: [0, 80, 0],
                    y: [0, -60, 0],
                } : undefined}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}
