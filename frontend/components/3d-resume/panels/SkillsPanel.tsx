'use client';

import { useTranslations } from 'next-intl';
import { Brain, Code, Server, Wrench, Zap } from 'lucide-react';

interface SkillsPanelProps {
    color: string;
}

const SKILL_CATEGORIES = [
    {
        key: 'ml',
        icon: Brain,
        skills: [
            'Python',
            'PyTorch',
            'TensorFlow',
            'Scikit-learn',
            'OpenCV',
            'Ollama / LLaVA',
            'pgvector (RAG)',
            'NumPy & Pandas',
        ],
    },
    {
        key: 'backend',
        icon: Server,
        skills: [
            'FastAPI',
            'REST API',
            'WebSocket',
            'PostgreSQL',
            'Prisma',
            'SQLAlchemy',
        ],
    },
    {
        key: 'programming',
        icon: Code,
        skills: ['Python', 'Java', 'C#', 'C / C++', 'Kotlin', 'TypeScript', 'SQL'],
    },
    {
        key: 'devops',
        icon: Wrench,
        skills: [
            'Docker',
            'CI/CD',
            'GitHub Actions',
            'Linux',
            'Git & GitHub',
            'Postman',
        ],
    },
];

export default function SkillsPanel({ color }: SkillsPanelProps) {
    const t = useTranslations('skills');
    const t3d = useTranslations('resume3d.skills');

    const stats = [
        { value: '18+', label: t('stats.technologies') },
        { value: '20+', label: t('stats.projects') },
        { value: '9', label: t('stats.certs') },
        { value: '2026', label: t('stats.graduation') },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                    <Zap className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{t3d('title')}</h3>
                    <p className="text-xs sm:text-sm text-white/45">{t3d('subtitle')}</p>
                </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SKILL_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                        <div
                            key={category.key}
                            className="p-4 rounded-xl bg-white/[0.025] border border-white/10 hover:border-white/20 transition-colors duration-200"
                        >
                            {/* Category Header */}
                            <div className="flex items-center gap-2.5 mb-3">
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                                >
                                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                                </div>
                                <h4 className="text-sm font-medium text-white/90">
                                    {t(`categories.${category.key}`)}
                                </h4>
                            </div>

                            {/* Skills Chips */}
                            <div className="flex flex-wrap gap-1.5">
                                {category.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-white/[0.04] border border-white/5 text-white/70 hover:bg-white/[0.08] hover:text-white transition-colors cursor-default"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 pt-1">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="text-center p-2.5 rounded-xl bg-white/[0.025] border border-white/5"
                    >
                        <div className="text-lg font-bold" style={{ color }}>
                            {stat.value}
                        </div>
                        <div className="text-[10px] text-white/45 mt-0.5">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
