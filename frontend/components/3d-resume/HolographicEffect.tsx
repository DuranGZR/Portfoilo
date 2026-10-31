'use client';

import React from 'react';

interface HolographicEffectProps {
    children: React.ReactNode;
    isActive: boolean;
    color?: string;
}

/**
 * Lightweight GPU-friendly holographic frame (zero SVG turbulence, zero CPU filter/repaint loops).
 */
export default function HolographicEffect({
    children,
    color = '#819fa7',
}: HolographicEffectProps) {
    return (
        <div className="relative rounded-2xl">
            {children}

            {/* Subtle static holographic inner rim */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                    boxShadow: `inset 0 0 24px ${color}12, inset 0 1px 0 ${color}24`,
                }}
            />
        </div>
    );
}
