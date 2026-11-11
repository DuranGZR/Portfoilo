"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useMessages } from 'next-intl';
import SectionReveal from '@/components/animations/SectionReveal';

interface TechItem {
  name: string;
  icon: string;
}

// Duran Gezer's real skills organized into 4 vertical columns matching Richard Miculob's layout
const TECH_COLUMNS: TechItem[][] = [
  // Column 1: AI, Data Science & ML Core
  [
    { name: 'Python', icon: '/images/skills/python.svg' },
    { name: 'NumPy', icon: '/images/skills/numpy.svg' },
    { name: 'Pandas', icon: '/images/skills/pandas.svg' },
    { name: 'Scikit-learn', icon: '/images/skills/scikitlearn.svg' },
    { name: 'TensorFlow', icon: '/images/skills/tensorflow.svg' },
  ],
  // Column 2: Deep Learning, Computer Vision & LLM
  [
    { name: 'PyTorch', icon: '/images/skills/pytorch.svg' },
    { name: 'OpenCV', icon: '/images/skills/opencv.svg' },
    { name: 'Ollama / LLaVA', icon: '/images/skills/ollama.svg' },
    { name: 'PostgreSQL', icon: '/images/skills/postgresql.svg' },
  ],
  // Column 3: Programming Languages
  [
    { name: 'Java', icon: '/images/skills/java.svg' },
    { name: 'C#', icon: '/images/skills/csharp.svg' },
    { name: 'C / C++', icon: '/images/skills/cplusplus.svg' },
    { name: 'SQL', icon: '/images/skills/sql.svg' },
    { name: 'Kotlin', icon: '/images/skills/kotlin.svg' },
  ],
  // Column 4: Backend & Modern Engineering Tools
  [
    { name: 'FastAPI', icon: '/images/skills/fastapi.svg' },
    { name: 'Docker', icon: '/images/skills/docker.svg' },
    { name: 'Git / GitHub', icon: '/images/skills/git.svg' },
    { name: 'Postman', icon: '/images/skills/postman.svg' },
  ],
];

export default function Skills() {
  const t = useTranslations('skills');
  const messages = useMessages() as any;
  const [activeBento, setActiveBento] = useState(0);

  // Dynamic Bento data from i18n messages
  const bento = messages?.skills?.bento || {};
  const techColumns = messages?.skills?.techColumns || TECH_COLUMNS;
  const allTechs: TechItem[] = techColumns.flat();

  const card1 = bento.card1 || {
    number: '01',
    category: 'YAPAY ZEKA &\nDERİN ÖĞRENME',
    title: 'Yapay Zeka, Bilgisayarlı Görü & Derin Öğrenme',
    image: '/images/gif/coding.gif',
    description:
      'Kameradan anlık görüntü analizi, derin öğrenme modelleri (YOLO, CNN), lokal LLM entegrasyonları (LLaVA) ve pgvector ile RAG mimarileri geliştirme.',
    tags: [
      'Python',
      'TensorFlow / Keras',
      'PyTorch',
      'Scikit-learn',
      'NumPy / Pandas',
      'OpenCV',
      'Computer Vision',
      'NLP',
      'Deep Learning',
      'Ollama / LLaVA',
      'pgvector',
    ],
  };

  const card2 = bento.card2 || {
    number: '02',
    category: 'BACKEND, SİSTEMLER &\nPROGRAMLAMA',
    title: 'Backend, Sistemler & Programlama Dilleri',
    image: '/images/gif/assistant.gif',
    description:
      'FastAPI ile yüksek hızlı mikroservisler, nesne yönelimli mimariler (Java, C#, C++), SQL veritabanları ve Docker ile yapay zekayı ürünleştiren güvenilir sistem çözümleri.',
    tags: [
      'FastAPI',
      'Java',
      'C#',
      'C / C++',
      'SQL',
      'PostgreSQL',
      'Docker',
      'Git & GitHub',
      'Feature Engineering',
      'Data Analysis',
      'Kotlin',
    ],
  };

  const renderBentoCard = (card: typeof card1) => (
    <div className="bg-[#141414] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line rounded-[20px] p-5 sm:p-7 flex flex-col justify-between h-full transition-all duration-400 hover:-translate-y-1 hover:border-white/20 portfolio-light:hover:border-paper-line-strong hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] portfolio-light:hover:shadow-paper relative group">
      <div>
        {/* Header: Number (Left) & Category (Right-aligned 2-3 lines) */}
        <div className="flex justify-between items-start mb-4 sm:mb-5">
          <span className="font-sans font-extralight text-3xl sm:text-5xl text-[#f3f5f9] portfolio-light:text-ink tracking-tighter leading-none select-none">
            {card.number}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#819fa7] portfolio-light:text-ink-accent uppercase text-right leading-tight max-w-[130px] whitespace-pre-line">
            {card.category}
          </span>
        </div>

        {/* Center Visual (GIF / Custom Image) */}
        <div className="skill-card-visual h-16 sm:h-20 mb-4 sm:mb-5 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity">
          <img
            src={card.image || card.gif || '/images/gif/coding.gif'}
            alt={card.title || 'Skills visual'}
            className="h-14 sm:h-16 object-contain select-none pointer-events-none"
            draggable={false}
          />
        </div>

        {card.title && (
          <h3 className="text-sm sm:text-base font-semibold text-white/95 portfolio-light:text-ink mb-2">
            {card.title}
          </h3>
        )}

        {/* Description */}
        <p className="text-[13px] sm:text-[13.5px] leading-[1.65] text-white/60 portfolio-light:text-ink-muted mb-5 sm:mb-6 font-sans">
          {card.description}
        </p>
      </div>

      {/* Tag Cloud */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t border-white/5 portfolio-light:border-paper-line mt-auto">
        {(card.tags || []).map((tag: string, idx: number) => (
          <span
            key={idx}
            className="font-mono text-[9.5px] sm:text-[10px] portfolio-light:text-[11px] sm:portfolio-light:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-white/[0.03] portfolio-light:bg-paper-tint border border-white/10 portfolio-light:border-paper-line text-white/70 portfolio-light:text-ink-accent hover:text-white portfolio-light:hover:text-ink hover:border-white/30 portfolio-light:hover:border-paper-line-strong transition-colors cursor-default"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <section
      id="skills"
      className="relative md:min-h-screen flex flex-col justify-center py-20 sm:py-24 md:py-28 lg:py-32 px-4 md:px-8 bg-[#0d0d0d] portfolio-light:bg-paper content-visibility-auto overflow-hidden"
    >
      {/* Background dark gradient */}
      <div className="portfolio-section-backdrop absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] w-full mx-auto md:my-auto">
        {/* Exact Richard Miculob Layout: Grid with Left (Headline + 4 Columns Tech Stack) and Right (2 Side-by-Side Bento Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-8 lg:gap-14 items-start">
          
          {/* Left Column (what-i-can-do-left) */}
          <SectionReveal delay={0} direction="left">
            <div className="flex flex-col">
              <div className="font-mono text-xs font-semibold tracking-[0.25em] text-[#819fa7] portfolio-light:text-ink-accent uppercase mb-2 sm:mb-3">
                {t('badge')}
              </div>
              <h2 className="text-2xl sm:text-5xl md:text-[54px] font-display font-extrabold text-[#f3f5f9] portfolio-light:text-ink tracking-tight leading-[1.08] mb-3 sm:mb-4">
                {t('title')}
              </h2>
              <p className="text-sm sm:text-[15px] leading-[1.7] text-white/60 portfolio-light:text-ink-muted max-w-[480px] mb-5 sm:mb-8">
                {t('subtitle')}
              </p>

              {/* MOBİL: 6 Sütunlu Kompakt Grid (18 İkon, Yüksekliği 130px'e İndirir) */}
              <div className="grid grid-cols-6 gap-2 sm:hidden pt-1 max-w-[320px]">
                {allTechs.map((tech) => (
                  <div
                    key={tech.name}
                    className="w-10 h-10 rounded-xl bg-[#141414] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line flex items-center justify-center relative group select-none"
                    title={tech.name}
                  >
                    <img
                      src={tech.icon}
                      alt={tech.name}
                      className="w-5 h-5 object-contain select-none pointer-events-none opacity-90"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* MASAÜSTÜ & TABLET: 4 Dikey Kolon (Richard Miculob Birebir Tasarımı) */}
              <div className="hidden sm:flex gap-3 sm:gap-4 items-start flex-wrap sm:flex-nowrap pt-2">
                {techColumns.map((column: TechItem[], colIdx: number) => (
                  <div key={colIdx} className="flex flex-col gap-3">
                    {column.map((tech: TechItem) => (
                      <div
                        key={tech.name}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#141414] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line flex items-center justify-center relative group transition-all duration-300 hover:border-white/40 portfolio-light:hover:border-paper-line-strong hover:-translate-y-1 hover:shadow-xl portfolio-light:hover:shadow-paper-elevated hover:z-50 cursor-default select-none"
                      >
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="w-6 h-6 sm:w-7 sm:h-7 object-contain select-none pointer-events-none opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                          draggable={false}
                        />

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-1.5 rounded-lg bg-[#181920] portfolio-light:bg-paper-raised border border-white/20 portfolio-light:border-paper-line-strong text-xs font-mono font-medium text-white portfolio-light:text-ink whitespace-nowrap opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50 shadow-[0_10px_25px_rgba(0,0,0,0.95)] portfolio-light:shadow-paper">
                          {tech.name}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#181920] portfolio-light:bg-paper-raised border-r border-b border-white/20 portfolio-light:border-paper-line-strong rotate-45" />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* Right Column: Bento Cards */}
          <SectionReveal delay={0.2} direction="right">
            {/* MOBİL: 01 / 02 Sekmeli Geçiş (Sayfa Yüksekliğini 800px Kısaltır) */}
            <div className="lg:hidden mt-6">
              <div className="flex justify-center mb-4">
                <div className="inline-flex p-1 rounded-xl bg-[#141414] portfolio-light:bg-paper-raised border border-white/10 portfolio-light:border-paper-line gap-1">
                  <button
                    onClick={() => setActiveBento(0)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      activeBento === 0
                        ? 'bg-white portfolio-light:paper-action text-black portfolio-light:text-paper-raised shadow-sm font-semibold'
                        : 'text-white/50 portfolio-light:text-ink-muted hover:text-white portfolio-light:hover:text-ink'
                    }`}
                  >
                    01 AI & Görü
                  </button>
                  <button
                    onClick={() => setActiveBento(1)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      activeBento === 1
                        ? 'bg-white portfolio-light:paper-action text-black portfolio-light:text-paper-raised shadow-sm font-semibold'
                        : 'text-white/50 portfolio-light:text-ink-muted hover:text-white portfolio-light:hover:text-ink'
                    }`}
                  >
                    02 Backend & Sistem
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeBento === 0 ? (
                  <motion.div
                    key="bento-0"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderBentoCard(card1)}
                  </motion.div>
                ) : (
                  <motion.div
                    key="bento-1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderBentoCard(card2)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MASAÜSTÜ: 2 Bento Kartı Yan Yana (Birebir Richard Miculob Düzeni) */}
            <div className="hidden lg:grid grid-cols-2 gap-5 lg:gap-6 items-stretch">
              {renderBentoCard(card1)}
              {renderBentoCard(card2)}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
