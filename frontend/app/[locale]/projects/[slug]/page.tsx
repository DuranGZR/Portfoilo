import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, getMessages } from 'next-intl/server';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Github,
  CheckCircle2,
  Layers,
  Cpu,
  Calendar,
  Workflow,
  Sparkles,
} from 'lucide-react';

const SLUG_TO_KEY: Record<string, string> = {
  'aliaga-ai': 'aliagaAI',
  'ai-dream-interpreter': 'aiDreamInterpreter',
  'kayip-qr': 'kayipQR',
  wedo: 'weDo',
  'real-time-visual-understanding': 'visualAI',
  aliagaai: 'aliagaAI',
  kayipqr: 'kayipQR',
  'visual-ai': 'visualAI',
};

const ALL_SLUGS = [
  'aliaga-ai',
  'ai-dream-interpreter',
  'kayip-qr',
  'wedo',
  'real-time-visual-understanding',
];

export async function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const projectKey = SLUG_TO_KEY[slug];
  if (!projectKey) return { title: 'Project Not Found' };

  const messages = (await getMessages({ locale })) as any;
  const project = messages?.projects?.items?.[projectKey];

  return {
    title: project?.title ? `${project.title} | Duran Gezer` : 'Project',
    description: project?.tagline || 'Project Details',
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const projectKey = SLUG_TO_KEY[slug];

  if (!projectKey) {
    notFound();
  }

  const messages = (await getMessages({ locale })) as any;
  const t = await getTranslations({ locale, namespace: 'projects' });
  const items = messages?.projects?.items || {};
  const project = items[projectKey];

  if (!project) {
    notFound();
  }

  const features: string[] = project.features || [];
  const tags: string[] = project.tags || [];
  const architectureSteps: string[] = project.architectureSteps || [];
  const highlights: Array<{ label: string; value: string }> = project.highlights || [];

  // Previous and next projects
  const normalizedIdx = ALL_SLUGS.indexOf(
    ALL_SLUGS.find((s) => SLUG_TO_KEY[s] === projectKey) || slug
  );
  const safeIndex = normalizedIdx >= 0 ? normalizedIdx : 0;
  const prevSlug = ALL_SLUGS[(safeIndex - 1 + ALL_SLUGS.length) % ALL_SLUGS.length];
  const nextSlug = ALL_SLUGS[(safeIndex + 1) % ALL_SLUGS.length];
  const prevProject = items[SLUG_TO_KEY[prevSlug]];
  const nextProject = items[SLUG_TO_KEY[nextSlug]];

  return (
    <main data-portfolio-page className="portfolio-project min-h-screen bg-[#0d0d0d] portfolio-light:bg-paper text-[#f3f5f9] portfolio-light:text-ink pt-28 pb-24 px-4 sm:px-6 relative">
      {/* Background dark gradient */}
      <div className="portfolio-section-backdrop absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href={`/${locale}#projects`}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-white/50 portfolio-light:text-ink-muted hover:text-white portfolio-light:hover:text-ink uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToProjects')}
          </Link>
        </div>

        {/* Header Hero */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-[#819fa7]/10 portfolio-light:bg-paper-tint border border-[#819fa7]/25 portfolio-light:border-paper-line-strong text-[#9cc0ca] portfolio-light:text-ink-accent">
              {project.category || 'Engineering'}
            </span>
            <span className="font-mono text-xs text-white/45 portfolio-light:text-ink-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {project.period || '2025'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-[#f3f5f9] portfolio-light:text-ink leading-[1.12]">
            {project.title}
          </h1>

          <p className="text-base sm:text-lg text-white/70 portfolio-light:text-ink-muted max-w-3xl leading-relaxed">
            {project.tagline}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white portfolio-light:paper-action text-black portfolio-light:text-paper-raised font-semibold text-sm hover:bg-white/90 portfolio-light:hover:brightness-110 transition-all duration-200 shadow-lg portfolio-light:shadow-paper hover:shadow-white/10 portfolio-light:hover:shadow-paper"
              >
                <Github className="w-4 h-4" />
                {t('viewCode')}
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 portfolio-light:bg-paper-selected hover:bg-white/15 portfolio-light:hover:bg-paper-selected border border-white/15 portfolio-light:border-paper-line text-white portfolio-light:text-ink font-medium text-sm transition-all duration-200"
              >
                {t('liveDemo')}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Featured Showcase Banner (Full uncropped 16:10 display) */}
        <div className="project-cover-frame mb-8 rounded-2xl overflow-hidden border border-white/12 bg-[#101215] portfolio-light:bg-paper-raised shadow-[0_28px_70px_-15px_rgba(0,0,0,0.85)] portfolio-light:shadow-paper-elevated relative">
          <div className="relative w-full aspect-[16/10] flex items-center justify-center bg-[#0f1114] portfolio-light:bg-paper-raised">
            <img
              src={project.image || '/projects/aliagaai.png'}
              alt={project.title}
              className="w-full h-full object-contain select-none"
            />
          </div>
        </div>

        {/* Engineering Highlights Strip */}
        {highlights.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line flex flex-col justify-between gap-1.5"
              >
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#819fa7] portfolio-light:text-ink-accent">
                  {item.label}
                </span>
                <span className="text-sm sm:text-base font-display font-bold text-[#f3f5f9] portfolio-light:text-ink leading-snug">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left 2 Columns: Overview, Architecture Flow & Key Features */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Overview */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-white portfolio-light:text-ink font-display flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-[#819fa7] portfolio-light:text-ink-accent" />
                {t('overview')}
              </h2>
              <p className="text-sm sm:text-[15.5px] text-white/75 portfolio-light:text-ink-muted leading-[1.8] whitespace-pre-line">
                {project.overview || project.tagline}
              </p>
            </div>

            {/* 2. System Architecture & How It Works */}
            {architectureSteps.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line space-y-5">
                <h2 className="text-lg sm:text-xl font-bold text-white portfolio-light:text-ink font-display flex items-center gap-2.5">
                  <Workflow className="w-5 h-5 text-[#819fa7] portfolio-light:text-ink-accent" />
                  {t('architecture')}
                </h2>
                <div className="space-y-3">
                  {architectureSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl bg-[#111519]/80 portfolio-light:bg-paper-tint border border-white/[0.07] portfolio-light:border-paper-line"
                    >
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#819fa7]/15 portfolio-light:bg-paper-selected border border-[#819fa7]/30 portfolio-light:border-paper-line-strong text-[#a8cbd6] portfolio-light:text-ink-accent shrink-0 mt-0.5">
                        0{idx + 1}
                      </span>
                      <p className="text-sm text-white/80 portfolio-light:text-ink-muted leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Key Features */}
            {features.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-white portfolio-light:text-ink font-display flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 portfolio-light:text-emerald-700" />
                  {t('keyFeatures')}
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] portfolio-light:bg-paper-raised border border-white/[0.06] portfolio-light:border-paper-line"
                    >
                      <Sparkles className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent mt-0.5 shrink-0" />
                      <span className="text-sm text-white/80 portfolio-light:text-ink-muted leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Tech Stack & Repository Card */}
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {/* Tech Stack */}
            <div className="p-6 rounded-2xl bg-white/[0.03] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line space-y-4">
              <h3 className="text-xs font-mono font-semibold text-white/45 portfolio-light:text-ink-muted tracking-wider uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent" />
                {t('techStack')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.05] portfolio-light:bg-paper-tint border border-white/10 portfolio-light:border-paper-line text-xs font-medium text-white/85 portfolio-light:text-ink-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* GitHub Info Card */}
            {project.github && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a2327]/55 portfolio-light:from-paper-tint to-[#111518]/60 portfolio-light:to-paper-raised border border-[#819fa7]/25 portfolio-light:border-paper-line-strong space-y-3.5">
                <div className="font-mono text-xs text-[#9ac0cb] portfolio-light:text-ink-accent uppercase font-semibold tracking-wider">
                  {locale === 'tr' ? 'Kaynak Kod & Dokümantasyon' : 'Source Code & Docs'}
                </div>
                <p className="text-xs text-white/65 portfolio-light:text-ink-muted leading-relaxed">
                  {locale === 'tr'
                    ? 'Projenin tüm kaynak kodlarını, Docker kurulumunu, sistem mimarisi şemalarını ve API dokümantasyonunu GitHub deposunda inceleyebilirsiniz.'
                    : 'Explore the complete source code, Docker setup, system architecture diagrams, and API documentation in the GitHub repository.'}
                </p>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-white portfolio-light:text-ink hover:text-[#9cc0ca] portfolio-light:hover:text-ink-accent transition-colors pt-1"
                >
                  <Github className="w-4 h-4" />
                  <span>{locale === 'tr' ? "GitHub'da Aç" : 'Open on GitHub'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation: Next / Prev Projects with Titles */}
        <div className="pt-8 border-t border-white/10 portfolio-light:border-paper-line grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/${locale}/projects/${prevSlug}`}
            className="group p-4 rounded-xl bg-white/[0.02] portfolio-light:bg-paper-raised hover:bg-white/[0.05] portfolio-light:hover:bg-paper-tint border border-white/10 portfolio-light:border-paper-line transition-all flex items-center gap-3"
          >
            <ArrowLeft className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent group-hover:-translate-x-1 transition-transform shrink-0" />
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 portfolio-light:text-ink-muted">
                {locale === 'tr' ? 'Önceki Proje' : 'Previous Project'}
              </div>
              <div className="text-sm font-semibold text-white/85 portfolio-light:text-ink-muted group-hover:text-white portfolio-light:group-hover:text-ink truncate">
                {prevProject?.title || prevSlug}
              </div>
            </div>
          </Link>

          <Link
            href={`/${locale}/projects/${nextSlug}`}
            className="group p-4 rounded-xl bg-white/[0.02] portfolio-light:bg-paper-raised hover:bg-white/[0.05] portfolio-light:hover:bg-paper-tint border border-white/10 portfolio-light:border-paper-line transition-all flex items-center justify-end gap-3 text-right"
          >
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 portfolio-light:text-ink-muted">
                {locale === 'tr' ? 'Sonraki Proje' : 'Next Project'}
              </div>
              <div className="text-sm font-semibold text-white/85 portfolio-light:text-ink-muted group-hover:text-white portfolio-light:group-hover:text-ink truncate">
                {nextProject?.title || nextSlug}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        </div>
      </div>
    </main>
  );
}
