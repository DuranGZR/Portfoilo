'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Rocket, Github, ExternalLink, ArrowUpRight } from 'lucide-react';

interface ProjectsPanelProps {
    color: string;
}

const FEATURED_PROJECTS = [
    {
        key: 'aliagaAI',
        slug: 'aliaga-ai',
        image: '/projects/aliagaai.png',
        techs: ['Next.js', 'FastAPI', 'PostgreSQL', 'pgvector', 'RAG'],
        github: 'https://github.com/DuranGZR/AliagaAI',
    },
    {
        key: 'aiDreamInterpreter',
        slug: 'ai-dream-interpreter',
        image: '/projects/dream-interpreter.png',
        techs: ['React Native', 'Expo', 'TypeScript', 'FastAPI', 'Groq LLM'],
        github: 'https://github.com/DuranGZR/Ai-Dream-Interpreter',
    },
    {
        key: 'kayipQR',
        slug: 'kayip-qr',
        image: '/projects/kayipqr.png',
        techs: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Docker'],
        github: 'https://github.com/DuranGZR/KayipQR',
    },
    {
        key: 'weDo',
        slug: 'wedo',
        image: '/projects/wedo-card.png',
        techs: ['Jetpack Compose', 'Kotlin', 'FastAPI', 'WebSocket'],
        github: 'https://github.com/DuranGZR/WeDo',
    },
    {
        key: 'visualAI',
        slug: 'real-time-visual-understanding',
        image: '/projects/visual-ai.png',
        techs: ['Python', 'Ollama', 'LLaVA', 'OpenCV'],
        github: 'https://github.com/DuranGZR/Real-Time-Visual-Understanding',
    },
];

export default function ProjectsPanel({ color }: ProjectsPanelProps) {
    const t = useTranslations('projects');
    const t3d = useTranslations('resume3d.projects');
    const locale = useLocale();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                    <Rocket className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-white">{t3d('title')}</h3>
                    <p className="text-xs sm:text-sm text-white/45">{t3d('subtitle')}</p>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {FEATURED_PROJECTS.map((project) => (
                    <div
                        key={project.key}
                        className="rounded-xl bg-white/[0.025] border border-white/10 hover:border-white/25 transition-colors duration-200 group flex flex-col overflow-hidden"
                    >
                        {/* Project Showcase Thumbnail */}
                        <Link
                            href={`/${locale}/projects/${project.slug}`}
                            className="relative aspect-[16/10] w-full bg-[#0a0c0f] overflow-hidden border-b border-white/5 block"
                        >
                            <img
                                src={project.image}
                                alt={t(`items.${project.key}.title`)}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                        </Link>

                        <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                            <div>
                                {/* Title + Actions */}
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <Link
                                        href={`/${locale}/projects/${project.slug}`}
                                        className="text-sm font-semibold text-white/95 hover:text-white transition-colors line-clamp-1"
                                    >
                                        {t(`items.${project.key}.title`)}
                                    </Link>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="GitHub"
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-colors"
                                        >
                                            <Github className="w-3.5 h-3.5" />
                                        </a>
                                        <Link
                                            href={`/${locale}/projects/${project.slug}`}
                                            aria-label={locale === 'en' ? 'View project' : 'Projeyi incele'}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white transition-colors"
                                        >
                                            <ArrowUpRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                                    {t(`items.${project.key}.tagline`)}
                                </p>
                            </div>

                            {/* Tech tags */}
                            <div className="flex flex-wrap gap-1">
                                {project.techs.slice(0, 4).map((tech) => (
                                    <span
                                        key={tech}
                                        className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-white/[0.04] border border-white/5 text-white/60"
                                    >
                                        {tech}
                                    </span>
                                ))}
                                {project.techs.length > 4 && (
                                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-md bg-white/[0.04] text-white/40">
                                        +{project.techs.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View all link */}
            <div className="text-center pt-1">
                <a
                    href="https://github.com/DuranGZR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-white/80 transition-colors"
                >
                    <Github className="w-3.5 h-3.5" />
                    {locale === 'en'
                        ? 'Visit GitHub for all projects'
                        : "Tüm projeler için GitHub'ı ziyaret edin"}
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}
