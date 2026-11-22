import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, getMessages } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ExternalLink, Github } from 'lucide-react';

const SLUG_TO_KEY: Record<string, string> = {
  'aliaga-ai': 'aliagaAI',
  'ai-dream-interpreter': 'aiDreamInterpreter',
  'kayip-qr': 'kayipQR',
  wedo: 'weDo',
  askdocs: 'askDocs',
  noktiq: 'noktiq',
  aliagaai: 'aliagaAI',
  kayipqr: 'kayipQR',
};

const ALL_SLUGS = [
  'aliaga-ai',
  'ai-dream-interpreter',
  'kayip-qr',
  'wedo',
  'askdocs',
  'noktiq',
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
    <main data-portfolio-page className="portfolio-project min-h-screen bg-[#0d0d0d] portfolio-light:bg-paper text-[#f3f5f9] portfolio-light:text-ink pt-28 pb-24 px-4 sm:px-6 [overflow-wrap:anywhere]">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/${locale}#projects`}
          className="inline-flex items-center gap-2 text-sm text-white/60 portfolio-light:text-ink-muted hover:text-white portfolio-light:hover:text-ink mb-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {t('backToProjects')}
        </Link>

        <header className="mb-10 sm:mb-12">
          <p className="text-sm text-[#9cc0ca] portfolio-light:text-ink-accent mb-4">
            {project.category || 'Engineering'}
            <span className="text-white/45 portfolio-light:text-ink-muted"> · {project.period || '2025'}</span>
          </p>
          <h1 className="text-3xl sm:text-5xl font-display font-semibold tracking-tight leading-[1.15] max-w-4xl">
            {project.title}
          </h1>
          <p className="text-base sm:text-lg text-white/70 portfolio-light:text-ink-muted max-w-3xl leading-relaxed mt-5">
            {project.tagline}
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-7">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 decoration-white/30 portfolio-light:decoration-ink/30 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                <Github className="w-4 h-4" aria-hidden="true" />
                {t('viewCode')}
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 decoration-white/30 portfolio-light:decoration-ink/30 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                {t('liveDemo')}
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </header>

        <figure className="mb-10 sm:mb-12">
          <img
            src={project.image || '/projects/aliagaai.png'}
            alt={project.title}
            className="w-full h-auto max-h-[720px] object-contain select-none"
          />
        </figure>

        {highlights.length > 0 && (
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 py-7 border-y border-white/10 portfolio-light:border-paper-line mb-12 sm:mb-16">
            {highlights.map((item, idx) => (
              <div key={idx}>
                <dt className="text-xs text-white/50 portfolio-light:text-ink-muted mb-2 normal-case">{item.label}</dt>
                <dd className="text-sm sm:text-base font-medium leading-relaxed">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,0.85fr)] gap-12 lg:gap-16 mb-16">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="project-overview">
              <h2 id="project-overview" className="text-xl sm:text-2xl font-display font-medium mb-5">{t('overview')}</h2>
              <p className="text-[15px] sm:text-base text-white/70 portfolio-light:text-ink-muted leading-[1.85] whitespace-pre-line">
                {project.overview || project.tagline}
              </p>
            </section>

            {architectureSteps.length > 0 && (
              <section aria-labelledby="project-architecture" className="pt-8 border-t border-white/10 portfolio-light:border-paper-line">
                <h2 id="project-architecture" className="text-xl sm:text-2xl font-display font-medium mb-3">{t('architecture')}</h2>
                <ol className="divide-y divide-white/10 portfolio-light:divide-paper-line">
                  {architectureSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-4 sm:gap-6 py-5">
                      <span className="text-xs font-mono tabular-nums text-[#9cc0ca] portfolio-light:text-ink-accent shrink-0 pt-1" aria-hidden="true">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm sm:text-[15px] text-white/70 portfolio-light:text-ink-muted leading-[1.8]">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {features.length > 0 && (
              <section aria-labelledby="project-features" className="pt-8 border-t border-white/10 portfolio-light:border-paper-line">
                <h2 id="project-features" className="text-xl sm:text-2xl font-display font-medium mb-5">{t('keyFeatures')}</h2>
                <ul className="list-disc pl-5 space-y-3 marker:text-[#819fa7]">
                  {features.map((feature, idx) => (
                    <li key={idx} className="pl-1 text-sm sm:text-[15px] text-white/70 portfolio-light:text-ink-muted leading-[1.8]">{feature}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start space-y-8 border-t lg:border-t-0 border-white/10 portfolio-light:border-paper-line pt-8 lg:pt-0">
            <section aria-labelledby="project-technologies">
              <h2 id="project-technologies" className="text-base font-medium mb-4">{t('techStack')}</h2>
              <ul className="space-y-2">
                {tags.map((tag, idx) => (
                  <li key={idx} className="text-sm leading-relaxed text-white/60 portfolio-light:text-ink-muted">{tag}</li>
                ))}
              </ul>
            </section>
            {project.github && (
              <section aria-labelledby="project-repository" className="pt-6 border-t border-white/10 portfolio-light:border-paper-line">
                <h2 id="project-repository" className="text-base font-medium mb-3">{locale === 'tr' ? 'Kaynak kod & dokümantasyon' : 'Source code & documentation'}</h2>
                <p className="text-sm text-white/60 portfolio-light:text-ink-muted leading-relaxed mb-4">
                  {locale === 'tr'
                    ? 'Kurulum adımları, kullanım örnekleri ve teknik dokümantasyon GitHub deposunda.'
                    : 'Setup instructions, usage examples, and technical documentation are in the GitHub repository.'}
                </p>
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm underline underline-offset-4 decoration-white/30 portfolio-light:decoration-ink/30 hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                  {locale === 'tr' ? "GitHub’da incele" : 'Explore on GitHub'}
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </section>
            )}
          </aside>
        </div>

        <nav aria-label={locale === 'tr' ? 'Diğer projeler' : 'More projects'} className="pt-8 border-t border-white/10 portfolio-light:border-paper-line grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Link href={`/${locale}/projects/${prevSlug}`} className="group flex items-start gap-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
            <ArrowLeft className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent shrink-0 mt-1" aria-hidden="true" />
            <span>
              <span className="block text-xs text-white/45 portfolio-light:text-ink-muted mb-2">{locale === 'tr' ? 'Önceki proje' : 'Previous project'}</span>
              <span className="text-sm leading-relaxed group-hover:underline underline-offset-4">{prevProject?.title || prevSlug}</span>
            </span>
          </Link>
          <Link href={`/${locale}/projects/${nextSlug}`} className="group flex items-start sm:justify-end gap-3 py-2 sm:text-right focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
            <span>
              <span className="block text-xs text-white/45 portfolio-light:text-ink-muted mb-2">{locale === 'tr' ? 'Sonraki proje' : 'Next project'}</span>
              <span className="text-sm leading-relaxed group-hover:underline underline-offset-4">{nextProject?.title || nextSlug}</span>
            </span>
            <ArrowRight className="w-4 h-4 text-[#819fa7] portfolio-light:text-ink-accent shrink-0 mt-1" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </main>
  );
}
