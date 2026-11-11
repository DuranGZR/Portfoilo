import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { fontVariables } from '@/lib/fonts';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import NoiseTexture from '@/components/effects/NoiseTexture';
import FloatingAIChat from '@/components/widgets/FloatingAIChat';
import CommandPalette from '@/components/widgets/CommandPalette';
import KonamiListener from '@/components/widgets/EasterEggs/KonamiListener';
import PageTransition from '@/components/transitions/PageTransition';
import WebVitalsInit from '@/components/layout/WebVitalsInit';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import '../globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://durangezer.dev';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    interactiveWidget: 'overlays-content',
};

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'metadata' });

    return {
        title: t('title'),
        description: t('description'),
        metadataBase: new URL(siteUrl),
        icons: {
            icon: '/favicon.png',
            apple: '/favicon.png',
        },
        openGraph: {
            type: 'website',
            locale: locale === 'tr' ? 'tr_TR' : 'en_US',
            url: siteUrl,
            title: t('title'),
            description: t('description'),
            siteName: 'Duran Gezer Portfolio',
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: t('title'),
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description'),
            images: ['/og-image.png'],
            creator: '@durangezer',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        alternates: {
            canonical: siteUrl,
            languages: {
                'en': `${siteUrl}/en`,
                'tr': `${siteUrl}/tr`,
            },
        },
        verification: {
            google: process.env.GOOGLE_SITE_VERIFICATION,
        },
    };
}

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!locales.some((supportedLocale) => supportedLocale === locale)) {
        notFound();
    }

    const messages = await getMessages({ locale });
    const heroTheme = (await cookies()).get('hero-theme')?.value === 'dark' ? 'dark' : 'light';

    // JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Duran Gezer',
        url: siteUrl,
        jobTitle: 'AI Engineer',
        description: 'AI Engineer building intelligent systems that solve real problems.',
        sameAs: [
            'https://github.com/durangezer',
            'https://linkedin.com/in/durangezer',
            'https://twitter.com/durangezer',
        ],
    };

    return (
        <html lang={locale} data-hero-theme={heroTheme} className={`scroll-smooth ${fontVariables}`} suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body className="bg-primary text-text-primary antialiased font-body" suppressHydrationWarning>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ConditionalLayout>
                        <NoiseTexture />
                        <Navigation heroTheme={heroTheme} />
                    </ConditionalLayout>
                    <PageTransition>
                        {children}
                    </PageTransition>
                    <ConditionalLayout>
                        <Footer />
                        <FloatingAIChat />
                        <CommandPalette />
                        <KonamiListener />
                    </ConditionalLayout>
                    <WebVitalsInit />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
