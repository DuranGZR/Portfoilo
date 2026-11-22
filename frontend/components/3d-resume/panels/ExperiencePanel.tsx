"use client";

import { useTranslations } from 'next-intl';

const COMMUNITY_ACTIVITIES = ['hsdDevOps', 'cyberSecurityOrg'] as const;
const CERTIFICATIONS = ['mlCamp', 'featureEng', 'machineLearning', 'pythonDS', 'csharp', 'cloudNight'] as const;

export default function ExperiencePanel() {
    const t = useTranslations('experience');
    return (
        <div className="space-y-8">
            <section>
                <h3 className="text-base font-medium mb-2">{t('categories.community')}</h3>
                <ul className="divide-y divide-white/10">
                    {COMMUNITY_ACTIVITIES.map(key => (
                        <li key={key} className="py-5">
                            <h4 className="text-sm font-medium leading-6">{t(`items.${key}.title`)}</h4>
                            <p className="text-xs text-[#a8c2c9] mt-2">{t(`items.${key}.organization`)} · {t(`items.${key}.period`)}</p>
                            <p className="text-sm text-white/65 leading-7 mt-3">{t(`items.${key}.description`)}</p>
                        </li>
                    ))}
                </ul>
            </section>
            <section className="pt-6 border-t border-white/10">
                <h3 className="text-base font-medium mb-2">{t('categories.certifications')}</h3>
                <ul className="divide-y divide-white/10">
                    {CERTIFICATIONS.map(key => (
                        <li key={key} className="py-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                            <div>
                                <h4 className="text-sm font-medium">{t(`items.${key}.title`)}</h4>
                                <p className="text-xs text-white/50 mt-2">{t(`items.${key}.organization`)}</p>
                            </div>
                            <span className="text-xs text-white/50">{t(`items.${key}.period`)}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
