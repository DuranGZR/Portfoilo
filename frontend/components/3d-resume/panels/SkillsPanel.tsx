"use client";

import { useTranslations } from 'next-intl';

interface SkillCard {
    title: string;
    description: string;
    tags: string[];
}

export default function SkillsPanel() {
    const t = useTranslations('skills');
    return (
        <div className="space-y-8">
            <p className="text-sm leading-7 text-white/65">{t('subtitle')}</p>
            {(['card1', 'card2'] as const).map(key => {
                const card = t.raw(`bento.${key}`) as SkillCard;
                return (
                    <section key={key} className="pt-6 border-t border-white/10">
                        <h3 className="text-base font-medium mb-3">{card.title}</h3>
                        <p className="text-sm text-white/65 leading-7 mb-4">{card.description}</p>
                        <ul className="flex flex-wrap gap-x-5 gap-y-2">
                            {card.tags.map(tag => <li key={tag} className="text-sm text-[#a8c2c9]">{tag}</li>)}
                        </ul>
                    </section>
                );
            })}
        </div>
    );
}
