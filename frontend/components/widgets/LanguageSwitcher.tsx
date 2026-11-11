'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const pathname = usePathname();
    const nextLocale = locale === 'tr' ? 'en' : 'tr';
    const pathWithoutLocale = pathname.slice(locale.length + 1);

    return (
        <Link
            href={`/${nextLocale}${pathWithoutLocale}`}
            replace
            prefetch={false}
            aria-label={locale === 'tr' ? 'İngilizceye geç' : 'Switch to Turkish'}
            className="nav-control inline-flex min-h-11 items-center gap-1 rounded-lg px-2 font-mono text-xs text-[#f3f5f9] hover:bg-[#819fa7]/10 transition-colors"
        >
            <span className={locale === 'tr' ? 'font-semibold' : 'opacity-80'}>TR</span>
            <span aria-hidden="true" className="opacity-60">/</span>
            <span className={locale === 'en' ? 'font-semibold' : 'opacity-80'}>EN</span>
        </Link>
    );
}
