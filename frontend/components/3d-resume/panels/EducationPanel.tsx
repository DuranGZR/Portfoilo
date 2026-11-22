"use client";

import { useTranslations } from 'next-intl';

const COURSES = ['dataStructures', 'oop', 'database', 'algorithms', 'ai', 'imageProcessing', 'computerNetworks', 'webProgramming', 'programmingLanguages', 'softwareEng'] as const;

export default function EducationPanel() {
    const t = useTranslations('experience');
    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-lg font-medium">{t('items.degree.title')}</h3>
                <p className="text-sm text-[#a8c2c9] mt-2">{t('items.degree.organization')}</p>
                <p className="text-xs text-white/50 mt-2">{t('items.degree.period')} · GPA: {t('items.degree.gpa')}</p>
                <p className="text-sm text-white/65 leading-7 mt-4">{t('items.degree.description')}</p>
            </section>
            <section className="pt-6 border-t border-white/10">
                <h3 className="text-base font-medium mb-4">{t('coursesTitle')}</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {COURSES.map(key => <li key={key} className="text-sm text-white/65 leading-6">{t(`courses.${key}.title`)}</li>)}
                </ul>
            </section>
        </div>
    );
}
