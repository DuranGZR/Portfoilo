'use client';

import { useTranslations } from 'next-intl';
import { GraduationCap, Award, BookOpen, Calendar } from 'lucide-react';

interface EducationPanelProps {
    color: string;
}

const CERTIFICATIONS = ['mlCamp', 'featureEng', 'pythonDS'] as const;

const COURSES = [
    'dataStructures',
    'oop',
    'database',
    'algorithms',
    'ai',
    'imageProcessing',
    'computerNetworks',
    'webProgramming',
    'programmingLanguages',
    'softwareEng',
] as const;

export default function EducationPanel({ color }: EducationPanelProps) {
    const t = useTranslations('experience');

    return (
        <div className="space-y-5">
            {/* University - Featured Card */}
            <div
                className="p-5 rounded-2xl relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${color}16 0%, ${color}05 100%)`,
                    border: `1px solid ${color}32`,
                }}
            >
                <div className="relative flex items-start gap-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${color}22`, border: `1px solid ${color}38` }}
                    >
                        <GraduationCap className="w-6 h-6" style={{ color }} />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white">
                            {t('items.degree.title')}
                        </h3>
                        <p className="text-white/65 text-sm mt-0.5">
                            {t('items.degree.organization')}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2.5">
                            <div className="flex items-center gap-1.5 text-xs text-white/45">
                                <Calendar className="w-3 h-3" />
                                {t('items.degree.period')}
                            </div>
                            <div
                                className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium"
                                style={{ background: `${color}22`, color }}
                            >
                                GPA: 2.84 / 4.0
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certifications Timeline */}
            <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2.5 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5" style={{ color }} />
                    {t('categories.certifications')}
                </h4>

                <div className="space-y-2">
                    {CERTIFICATIONS.map((certKey) => (
                        <div
                            key={certKey}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.025] border border-white/10 hover:border-white/20 transition-colors"
                        >
                            <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: color }}
                            />
                            <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-white/90 truncate">
                                    {t(`items.${certKey}.title`)}
                                </h5>
                                <p className="text-xs text-white/45">
                                    {t(`items.${certKey}.organization`)} • {t(`items.${certKey}.period`)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Courses Grid */}
            <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2.5 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" style={{ color }} />
                    {t('coursesTitle')}
                </h4>

                <div className="flex flex-wrap gap-1.5">
                    {COURSES.map((course) => (
                        <span
                            key={course}
                            className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.03] border border-white/10 text-white/65 hover:border-white/20 hover:text-white transition-colors cursor-default"
                        >
                            {t(`courses.${course}.title`)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
