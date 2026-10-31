'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Award, Calendar, Building, Users, Briefcase, CheckCircle } from 'lucide-react';

interface ExperiencePanelProps {
    color: string;
}

const COMMUNITY_ACTIVITIES = [
    { key: 'hsdDevOps', icon: Briefcase, isActive: true },
    { key: 'cyberSecurityOrg', icon: Users, isActive: false },
] as const;

const CERTIFICATIONS = [
    { key: 'machineLearning', icon: Award },
    { key: 'csharp', icon: Award },
    { key: 'cloudNight', icon: Award },
] as const;

export default function ExperiencePanel({ color }: ExperiencePanelProps) {
    const t = useTranslations('experience');
    const t3d = useTranslations('resume3d.experience');
    const locale = useLocale();

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                    <Users className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{t3d('title')}</h3>
                    <p className="text-xs sm:text-sm text-white/45">{t3d('subtitle')}</p>
                </div>
            </div>

            {/* Community Roles */}
            <div>
                <h4
                    className="text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-2"
                    style={{ color }}
                >
                    <Users className="w-4 h-4" />
                    {t('categories.community')}
                </h4>
                <div className="space-y-2.5">
                    {COMMUNITY_ACTIVITIES.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <div
                                key={item.key}
                                className="p-3.5 rounded-xl relative overflow-hidden transition-colors border"
                                style={{
                                    background: `linear-gradient(135deg, ${color}12 0%, transparent 100%)`,
                                    borderColor: `${color}38`,
                                }}
                            >
                                {/* Status badge */}
                                <div
                                    className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider flex items-center gap-1"
                                    style={{
                                        background: item.isActive ? `${color}28` : 'rgba(255,255,255,0.08)',
                                        color: item.isActive ? color : 'rgba(255,255,255,0.55)',
                                    }}
                                >
                                    {item.isActive ? (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                            {locale === 'en' ? 'Active' : 'Aktif'}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-3 h-3" />
                                            {locale === 'en' ? 'Completed' : 'Tamamlandı'}
                                        </>
                                    )}
                                </div>

                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${color}24, ${color}12)`,
                                            border: `1px solid ${color}30`,
                                        }}
                                    >
                                        <IconComponent className="w-5 h-5" style={{ color }} />
                                    </div>

                                    <div className="flex-1 min-w-0 pr-20">
                                        <h5 className="font-medium text-white text-sm">
                                            {t(`items.${item.key}.title`)}
                                        </h5>
                                        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1 text-[11px] text-white/55">
                                                <Building className="w-3 h-3" />
                                                {t(`items.${item.key}.organization`)}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-white/40 font-mono">
                                                <Calendar className="w-3 h-3" />
                                                {t(`items.${item.key}.period`)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Certifications */}
            <div>
                <h4
                    className="text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-2"
                    style={{ color }}
                >
                    <Award className="w-4 h-4" />
                    {t('categories.certifications')}
                </h4>
                <div className="space-y-2">
                    {CERTIFICATIONS.map((cert) => {
                        const IconComponent = cert.icon;
                        return (
                            <div
                                key={cert.key}
                                className="p-3 rounded-xl bg-white/[0.025] border border-white/10 hover:border-white/20 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <IconComponent className="w-4 h-4 text-white/65" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-medium text-white/90 text-sm">
                                            {t(`items.${cert.key}.title`)}
                                        </h5>
                                        <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1 text-[11px] text-white/50">
                                                <Building className="w-3 h-3" />
                                                {t(`items.${cert.key}.organization`)}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-white/40 font-mono">
                                                <Calendar className="w-3 h-3" />
                                                {t(`items.${cert.key}.period`)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
