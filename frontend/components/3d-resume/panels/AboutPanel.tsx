"use client";

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FileText } from 'lucide-react';

export default function AboutPanel() {
    const t = useTranslations('about');
    const hero = useTranslations('hero');
    const locale = useLocale();
    const [imgError, setImgError] = useState(false);
    const cvHref = locale === 'en' ? '/cv/Duran_Gezer_CV_EN.pdf' : '/cv/Duran_Gezer_CV_TR.pdf';
    return (
        <div className="space-y-7">
            <div className="flex items-center gap-5">
                <div className="size-20 rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-white/10">
                    {!imgError ? <img src="/profilFoto.jpg" alt="Duran Gezer" onError={() => setImgError(true)} className="size-full object-cover" /> : <span className="text-xl">DG</span>}
                </div>
                <div>
                    <h3 className="text-2xl font-display font-medium">Duran Gezer</h3>
                    <p className="text-sm text-[#a8c2c9] mt-1">{hero('title')}</p>
                    <p className="text-xs text-white/50 mt-2">{hero('subtitle')} · {hero('location')}</p>
                </div>
            </div>
            <p className="text-sm text-white/65 leading-7">{t('bio')}</p>
            <dl className="grid grid-cols-3 gap-5 py-5 border-y border-white/10">
                {(['projects', 'certs', 'grad'] as const).map(key => (
                    <div key={key}>
                        <dt className="text-xs text-white/50 mb-2">{t(`stats.${key}Label`)}</dt>
                        <dd className="text-lg font-medium">{t(`stats.${key}Value`)}</dd>
                    </div>
                ))}
            </dl>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(['projects', 'thinking', 'learning', 'practical'] as const).map(key => (
                    <li key={key}>
                        <h4 className="text-sm font-medium">{t(`highlights.items.${key}.title`)}</h4>
                        <p className="text-sm text-white/65 leading-6 mt-2">{t(`highlights.items.${key}.description`)}</p>
                    </li>
                ))}
            </ul>
            <p className="text-sm text-white/50 leading-6">{t('quote')}</p>
            <div className="pt-5 border-t border-white/10 space-y-3">
                <p className="text-xs text-white/60">{t('status.available')} · {t('status.graduating')}</p>
                <a href={cvHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[#a8c2c9] underline underline-offset-4">
                    <FileText className="size-4" aria-hidden="true" />{locale === 'en' ? 'View CV (PDF)' : 'CV’mi incele (PDF)'}
                </a>
            </div>
        </div>
    );
}
