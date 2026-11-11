import localFont from 'next/font/local';

export const displayFont = localFont({
    src: './fonts/outfit.woff2',
    weight: '100 900',
    variable: '--font-display',
    display: 'swap',
});

export const bodyFont = localFont({
    src: './fonts/sora.woff2',
    weight: '100 800',
    variable: '--font-body',
    display: 'swap',
});

export const monoFont = localFont({
    src: './fonts/jetbrainsmono.woff2',
    weight: '100 800',
    variable: '--font-mono',
    display: 'swap',
});

export const fontVariables = `${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`;
