"use client";

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ExternalLink } from 'lucide-react';

const FEATURED_PROJECTS = [
    { key: 'aliagaAI', slug: 'aliaga-ai' },
    { key: 'aiDreamInterpreter', slug: 'ai-dream-interpreter' },
    { key: 'kayipQR', slug: 'kayip-qr' },
    { key: 'weDo', slug: 'wedo' },
    { key: 'askDocs', slug: 'askdocs' },
    { key: 'noktiq', slug: 'noktiq' },
];

interface ProjectContent {
    title: string;
    gallerySummary?: string;
    tagline: string;
    image: string;
    tags: string[];
    github?: string;
}

export default function ProjectsPanel() {
    const t = useTranslations('projects');
    const locale = useLocale();
    return (
        <div>
            <p className="text-sm text-white/65 leading-7 mb-3">{t('subtitle')}</p>
            <ul className="divide-y divide-white/10">
                {FEATURED_PROJECTS.map(({ key, slug }) => {
                    const project = t.raw(`items.${key}`) as ProjectContent;
                    return (
                        <li key={key} className="py-6 grid grid-cols-1 sm:grid-cols-[144px_minmax(0,1fr)] gap-4 sm:gap-6">
                            <Link href={`/${locale}/projects/${slug}`} className="self-start">
                                <img src={project.image} alt={project.title} loading="lazy" decoding="async" className="w-full aspect-[16/10] object-contain" />
                            </Link>
                            <div className="min-w-0">
                                <h3 className="text-base font-medium leading-relaxed">
                                    <Link href={`/${locale}/projects/${slug}`} className="hover:underline underline-offset-4">{project.title}</Link>
                                </h3>
                                <p className="text-sm leading-6 text-white/65 mt-2">{project.gallerySummary || project.tagline}</p>
                                <p className="text-xs leading-6 text-white/50 mt-3">{project.tags.join(' · ')}</p>
                                {project.github && (
                                    <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} — GitHub`} className="inline-flex items-center gap-2 text-xs text-[#a8c2c9] underline underline-offset-4 mt-3">
                                        GitHub <ExternalLink className="size-3" aria-hidden="true" />
                                    </a>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
