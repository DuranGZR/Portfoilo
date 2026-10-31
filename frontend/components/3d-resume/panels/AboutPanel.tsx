'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Sparkles, Brain, TrendingUp, Code, MapPin, Briefcase, FileText } from 'lucide-react';

interface AboutPanelProps {
    color: string;
}

export default function AboutPanel({ color }: AboutPanelProps) {
    const t = useTranslations('about');
    const locale = useLocale();
    const [imgError, setImgError] = useState(false);

    const cvHref =
        locale === 'en' ? '/cv/Duran_Gezer_CV_EN.pdf' : '/cv/Duran_Gezer_CV_TR.pdf';

    const highlights = [
        { key: 'projects', icon: Code },
        { key: 'thinking', icon: Brain },
        { key: 'learning', icon: TrendingUp },
        { key: 'practical', icon: Sparkles },
    ];

    return (
        <div className="space-y-5">
            {/* Profile Header */}
            <div className="flex items-center gap-4 sm:gap-5">
                {/* Real Profile Photo */}
                <div
                    className="w-20 h-20 rounded-2xl relative overflow-hidden shrink-0 bg-[#14181d] flex items-center justify-center"
                    style={{
                        border: `2px solid ${color}55`,
                        boxShadow: `0 0 24px ${color}25`,
                    }}
                >
                    {!imgError ? (
                        <img
                            src="/profilFoto.jpg"
                            alt="Duran Gezer"
                            onError={() => setImgError(true)}
                            decoding="async"
                            className="w-full h-full object-cover select-none"
                            draggable={false}
                        />
                    ) : (
                        <span className="font-display font-bold text-2xl text-[#819fa7]">
                            DG
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                        Duran Gezer
                    </h3>
                    <p className="text-sm font-medium mt-0.5" style={{ color }}>
                        Computer Engineer
                    </p>
                    <p className="text-xs text-white/45 mt-0.5">
                        AI Systems • Backend • DevOps
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-white/35" />
                        <span className="text-xs text-white/45">İzmir, Türkiye</span>
                    </div>
                </div>
            </div>

            {/* Bio */}
            <div className="p-4 rounded-xl bg-white/[0.025] border border-white/10">
                <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                    {t('bio')}
                </p>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((highlight) => {
                    const Icon = highlight.icon;
                    return (
                        <div
                            key={highlight.key}
                            className="p-3.5 rounded-xl bg-white/[0.025] border border-white/10 hover:border-white/20 transition-colors duration-200"
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `${color}18`, border: `1px solid ${color}25` }}
                                >
                                    <Icon className="w-4 h-4" style={{ color }} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white/90">
                                        {t(`highlights.items.${highlight.key}.title`)}
                                    </h4>
                                    <p className="text-xs text-white/45 mt-0.5 leading-relaxed">
                                        {t(`highlights.items.${highlight.key}.description`)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quote */}
            <div className="text-center py-1">
                <p className="text-white/35 italic text-xs sm:text-sm">&ldquo;{t('quote')}&rdquo;</p>
            </div>

            {/* Status & CV Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
                <div
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                >
                    <Briefcase className="w-3.5 h-3.5" style={{ color }} />
                    <span className="text-xs font-medium" style={{ color }}>
                        {t('status.available')}
                    </span>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-xs text-white/55">{t('status.graduating')}</span>
                </div>
                <a
                    href={cvHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-medium text-white/85 hover:text-white transition-colors"
                >
                    <FileText className="w-3.5 h-3.5" style={{ color }} />
                    <span>{locale === 'en' ? 'View CV (PDF)' : "CV'mi İncele (PDF)"}</span>
                </a>
            </div>
        </div>
    );
}
