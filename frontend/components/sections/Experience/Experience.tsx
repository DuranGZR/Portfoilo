"use client";

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import {
  GraduationCap,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  X,
  Calendar,
  Building2,
  ChevronRight,
  Sparkles,
  Layers,
  Database,
  Cpu,
  Globe,
  Code2,
  Network,
  Eye,
  Box,
  Wrench,
  Terminal,
  Cloud,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import SectionReveal from '@/components/animations/SectionReveal';

interface DetailItem {
  key: string;
  isCourse?: boolean;
  category?: 'education' | 'certification' | 'community';
  icon?: any;
  tags?: string[];
  detailsTr: string[];
  detailsEn: string[];
}

// 10 Üniversite Dersi
const coursesData: DetailItem[] = [
  {
    key: "dataStructures",
    isCourse: true,
    category: 'education',
    icon: Layers,
    detailsTr: [
      "Array, Linked List, Stack, Queue veri yapıları",
      "Tree ve Graph yapıları",
      "Sorting ve Searching algoritmaları",
      "Big O notasyonu ve karmaşıklık analizi",
      "Recursive ve iterative problem çözme"
    ],
    detailsEn: [
      "Array, Linked List, Stack, Queue data structures",
      "Tree and Graph structures",
      "Sorting and Searching algorithms",
      "Big O notation and complexity analysis",
      "Recursive and iterative problem solving"
    ]
  },
  {
    key: "oop",
    isCourse: true,
    category: 'education',
    icon: Box,
    detailsTr: [
      "Sınıf ve nesne kavramları",
      "Inheritance, Polymorphism, Encapsulation",
      "Abstract class ve Interface",
      "Design patterns temelleri",
      "UML diyagramları"
    ],
    detailsEn: [
      "Class and object fundamentals",
      "Inheritance, Polymorphism, Encapsulation",
      "Abstract classes and Interfaces",
      "Design patterns fundamentals",
      "UML diagrams"
    ]
  },
  {
    key: "database",
    isCourse: true,
    category: 'education',
    icon: Database,
    detailsTr: [
      "İlişkisel veritabanı tasarımı",
      "SQL sorguları (SELECT, JOIN, GROUP BY)",
      "Normalizasyon (1NF, 2NF, 3NF)",
      "ER diyagramları",
      "Transaction ve ACID prensipleri"
    ],
    detailsEn: [
      "Relational database design",
      "SQL queries (SELECT, JOIN, GROUP BY)",
      "Normalization (1NF, 2NF, 3NF)",
      "ER diagrams",
      "Transaction and ACID principles"
    ]
  },
  {
    key: "algorithms",
    isCourse: true,
    category: 'education',
    icon: Cpu,
    detailsTr: [
      "Divide and Conquer stratejisi",
      "Dynamic Programming",
      "Greedy algoritmaları",
      "Graph algoritmaları (BFS, DFS, Dijkstra)",
      "Algoritma karmaşıklık analizi"
    ],
    detailsEn: [
      "Divide and Conquer strategy",
      "Dynamic Programming",
      "Greedy algorithms",
      "Graph algorithms (BFS, DFS, Dijkstra)",
      "Algorithm complexity analysis"
    ]
  },
  {
    key: "ai",
    isCourse: true,
    category: 'education',
    icon: Sparkles,
    detailsTr: [
      "Arama algoritmaları (A*, BFS, DFS)",
      "Oyun teorisi ve minimax",
      "Makine öğrenmesi temelleri",
      "Karar ağaçları",
      "Yapay sinir ağları giriş"
    ],
    detailsEn: [
      "Search algorithms (A*, BFS, DFS)",
      "Game theory and minimax",
      "Machine learning fundamentals",
      "Decision trees",
      "Introduction to neural networks"
    ]
  },
  {
    key: "imageProcessing",
    isCourse: true,
    category: 'education',
    icon: Eye,
    detailsTr: [
      "Görüntü filtreleme teknikleri",
      "Edge detection algoritmaları",
      "Histogram işlemleri",
      "Morfolojik operasyonlar",
      "Renk uzayları ve dönüşümleri"
    ],
    detailsEn: [
      "Image filtering techniques",
      "Edge detection algorithms",
      "Histogram processing",
      "Morphological operations",
      "Color spaces and transformations"
    ]
  },
  {
    key: "computerNetworks",
    isCourse: true,
    category: 'education',
    icon: Network,
    detailsTr: [
      "OSI ve TCP/IP modelleri",
      "IP adresleme ve subnetting",
      "Routing protokolleri",
      "Socket programlama",
      "Network güvenliği temelleri"
    ],
    detailsEn: [
      "OSI and TCP/IP models",
      "IP addressing and subnetting",
      "Routing protocols",
      "Socket programming",
      "Network security fundamentals"
    ]
  },
  {
    key: "webProgramming",
    isCourse: true,
    category: 'education',
    icon: Globe,
    detailsTr: [
      "HTML, CSS, JavaScript temelleri",
      "Backend geliştirme (PHP/Node.js)",
      "REST API tasarımı",
      "Veritabanı entegrasyonu",
      "Session ve authentication"
    ],
    detailsEn: [
      "HTML, CSS, JavaScript fundamentals",
      "Backend development (PHP/Node.js)",
      "REST API design",
      "Database integration",
      "Session and authentication"
    ]
  },
  {
    key: "programmingLanguages",
    isCourse: true,
    category: 'education',
    icon: Code2,
    detailsTr: [
      "Programlama paradigmaları",
      "Syntax ve semantik analiz",
      "Compiler ve interpreter farkları",
      "Memory yönetimi",
      "Fonksiyonel programlama kavramları"
    ],
    detailsEn: [
      "Programming paradigms",
      "Syntax and semantic analysis",
      "Compiler vs interpreter differences",
      "Memory management",
      "Functional programming concepts"
    ]
  },
  {
    key: "softwareEng",
    isCourse: true,
    category: 'education',
    icon: Wrench,
    detailsTr: [
      "Yazılım geliştirme yaşam döngüsü",
      "Agile ve Scrum metodolojileri",
      "Gereksinim analizi",
      "Test stratejileri",
      "Versiyon kontrol sistemleri"
    ],
    detailsEn: [
      "Software development lifecycle",
      "Agile and Scrum methodologies",
      "Requirements analysis",
      "Testing strategies",
      "Version control systems"
    ]
  }
];

// Lisans Derecesi
const degreeData: DetailItem = {
  key: "degree",
  category: 'education',
  icon: GraduationCap,
  detailsTr: [
    "Veri yapıları ve algoritmalar",
    "Nesne yönelimli programlama",
    "Veritabanı yönetim sistemleri",
    "Yapay zeka ve görüntü işleme",
    "Bilgisayar ağları",
    "Yazılım mühendisliği prensipleri"
  ],
  detailsEn: [
    "Data structures and algorithms",
    "Object-oriented programming",
    "Database management systems",
    "Artificial intelligence & computer vision",
    "Computer networks",
    "Software engineering principles"
  ]
};

// 6 Sertifika & Eğitim
const certificationsData: DetailItem[] = [
  {
    key: "mlCamp",
    category: 'certification',
    icon: Sparkles,
    detailsTr: [
      "End-to-end makine öğrenmesi pipeline'ı",
      "Feature engineering teknikleri",
      "Model seçimi ve değerlendirme",
      "Gerçek verilerle proje geliştirme",
      "Takım çalışması ve sunum"
    ],
    detailsEn: [
      "End-to-end machine learning pipeline",
      "Feature engineering techniques",
      "Model selection and evaluation",
      "Real-world project development",
      "Team collaboration and presentation"
    ]
  },
  {
    key: "featureEng",
    category: 'certification',
    icon: Cpu,
    detailsTr: [
      "Encoding teknikleri (Label, One-Hot, Target)",
      "Feature scaling ve normalization",
      "Missing value handling stratejileri",
      "Outlier detection ve treatment",
      "Feature extraction yöntemleri"
    ],
    detailsEn: [
      "Encoding techniques (Label, One-Hot, Target)",
      "Feature scaling and normalization",
      "Missing value handling strategies",
      "Outlier detection and treatment",
      "Feature extraction methods"
    ]
  },
  {
    key: "machineLearning",
    category: 'certification',
    icon: Terminal,
    detailsTr: [
      "Supervised learning algoritmaları",
      "Unsupervised learning teknikleri",
      "Model validation ve cross-validation",
      "Hyperparameter tuning",
      "Ensemble methods"
    ],
    detailsEn: [
      "Supervised learning algorithms",
      "Unsupervised learning techniques",
      "Model validation and cross-validation",
      "Hyperparameter tuning",
      "Ensemble methods"
    ]
  },
  {
    key: "pythonDS",
    category: 'certification',
    icon: Code2,
    detailsTr: [
      "NumPy ve Pandas ile veri manipülasyonu",
      "Matplotlib ve Seaborn ile görselleştirme",
      "Veri temizleme ve ön işleme",
      "Exploratory Data Analysis",
      "Python programlama best practices"
    ],
    detailsEn: [
      "Data manipulation with NumPy and Pandas",
      "Visualization with Matplotlib and Seaborn",
      "Data cleaning and preprocessing",
      "Exploratory Data Analysis",
      "Python programming best practices"
    ]
  },
  {
    key: "csharp",
    category: 'certification',
    icon: Box,
    detailsTr: [
      "C# syntax ve veri türleri",
      "OOP prensipleri (inheritance, polymorphism)",
      "Windows Forms ile GUI geliştirme",
      "Exception handling",
      "LINQ ve collections"
    ],
    detailsEn: [
      "C# syntax and data types",
      "OOP principles (inheritance, polymorphism)",
      "GUI development with Windows Forms",
      "Exception handling",
      "LINQ and collections"
    ]
  },
  {
    key: "cloudNight",
    category: 'certification',
    icon: Cloud,
    detailsTr: [
      "Cloud computing temelleri",
      "Huawei Cloud servisleri",
      "Sanal sunucu yönetimi",
      "Cloud storage ve networking",
      "DevOps pratikleri"
    ],
    detailsEn: [
      "Cloud computing fundamentals",
      "Huawei Cloud services",
      "Virtual server management",
      "Cloud storage and networking",
      "DevOps practices"
    ]
  }
];

// Topluluk Aktiviteleri & Roller
const communityData: DetailItem[] = [
  {
    key: "hsdDevOps",
    category: 'community',
    icon: ShieldCheck,
    tags: ["CI/CD Pipelines", "Docker", "GitHub Actions", "Linux Server", "DevOps"],
    detailsTr: [
      "CI/CD pipeline tasarımı ve implementasyonu",
      "Docker container yönetimi ve orchestration",
      "GitHub Actions ile otomasyon workflow'ları",
      "Linux sunucu yönetimi ve güvenliği",
      "DevOps kültürü ve best practice'leri uygulama",
      "Topluluk projelerinde teknik altyapı kurulumu"
    ],
    detailsEn: [
      "CI/CD pipeline design and implementation",
      "Docker container management and orchestration",
      "Automation workflows with GitHub Actions",
      "Linux server administration and security",
      "DevOps culture and best practices",
      "Technical infrastructure setup for community projects"
    ]
  },
  {
    key: "cyberSecurityOrg",
    category: 'community',
    icon: Users,
    tags: ["Liderlik", "15+ Ekip Yönetimi", "Etkinlik Planlama", "Eğitim", "Siber Güvenlik"],
    detailsTr: [
      "Topluluk etkinlikleri planlama ve yürütme",
      "Siber güvenlik eğitim programları organize etme",
      "15+ kişilik ekibi yönetme ve koordinasyon",
      "Sponsor ve paydaş ilişkileri yönetimi",
      "Siber güvenlik farkındalığı kampanyaları",
      "Liderlik ve iletişim becerilerini geliştirme"
    ],
    detailsEn: [
      "Planning and executing community events",
      "Organizing cybersecurity training programs",
      "Managing and coordinating 15+ team members",
      "Sponsor and stakeholder relations",
      "Cybersecurity awareness campaigns",
      "Leadership and organizational communication"
    ]
  }
];

// Modernized Modal Component (Monochrome, Zero Green, Portaled to document.body)
function DetailModal({
  item,
  onClose,
  t,
  locale
}: {
  item: DetailItem | null;
  onClose: () => void;
  t: (key: string) => string;
  locale: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!item) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {item && (() => {
        const prefix = item.isCourse ? 'courses' : 'items';
        const Icon = item.icon || BookOpen;
        const details = locale === 'tr' ? item.detailsTr : item.detailsEn;

        return (
          <div
            key={item.key}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop: hafif yarı-saydam katman (arkadaki kartlar ve başlıklar kaybolmaz) */}
            <motion.div
              className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Modal Window */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-lg bg-[#141414] border border-white/15 rounded-[22px] p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] max-h-[82dvh] overflow-y-auto overscroll-contain"
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", damping: 28, stiffness: 360 }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="mb-5 pr-8">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#819fa7] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-display font-bold text-[#f3f5f9] leading-snug">
                      {t(`${prefix}.${item.key}.title`)}
                    </h3>
                    {!item.isCourse && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-[#819fa7] font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {t(`${prefix}.${item.key}.organization`)}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-[11px] font-mono text-white/50 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t(`${prefix}.${item.key}.period`)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/70 mb-6 leading-relaxed font-sans bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                {t(`${prefix}.${item.key}.description`)}
              </p>

              {/* Learnings list */}
              {details && details.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono font-semibold text-[#819fa7] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-white/60" />
                    {t('modal.learned')}
                  </h4>
                  <ul className="space-y-2.5">
                    {details.map((detail, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-xs sm:text-[13px] text-white/80 leading-relaxed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#819fa7] mt-0.5 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        );
      })()}
    </AnimatePresence>,
    document.body
  );
}

export default function Experience() {
  const t = useTranslations('experience');
  const locale = useLocale();
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null);
  const [activeTab, setActiveTab] = useState<'education' | 'community' | 'certifications'>('education');
  const handleCloseModal = useCallback(() => setSelectedItem(null), []);

  const tabs = [
    {
      id: 'education' as const,
      label: t('categories.education'),
      shortLabel: locale === 'tr' ? 'Eğitim' : 'Education',
      icon: GraduationCap,
      count: '10 ' + (locale === 'tr' ? 'Ders' : 'Courses'),
      shortCount: '10'
    },
    {
      id: 'community' as const,
      label: t('categories.community'),
      shortLabel: locale === 'tr' ? 'Topluluk' : 'Community',
      icon: Users,
      count: '2 ' + (locale === 'tr' ? 'Rol' : 'Roles'),
      shortCount: '2'
    },
    {
      id: 'certifications' as const,
      label: t('categories.certifications'),
      shortLabel: locale === 'tr' ? 'Sertifikalar' : 'Certs',
      icon: Award,
      count: '6 ' + (locale === 'tr' ? 'Sertifika' : 'Certs'),
      shortCount: '6'
    },
  ];

  return (
    <section id="experience" className="relative md:min-h-screen flex flex-col justify-center py-20 sm:py-24 md:py-28 lg:py-32 px-4 md:px-6 bg-[#0d0d0d] content-visibility-auto">
      {/* Koyu degrade arka plan (Monokrom) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] w-full mx-auto md:my-auto">
        {/* Section Header */}
        <SectionReveal delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="font-mono text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-[#819fa7] uppercase mb-1.5 sm:mb-2">
              {t('badge')}
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-[52px] font-display font-extrabold text-[#f3f5f9] tracking-tight leading-[1.1] mb-2 sm:mb-3">
              {t('title')}
            </h2>
            <p className="text-xs sm:text-[15px] leading-relaxed sm:leading-[1.8] text-white/60">
              {t('subtitle')}
            </p>
          </div>
        </SectionReveal>

        {/* ========================================================
            SEGMENTED PILL TAB SWITCHER (Ferah, Sığan, Karışıklığı Önleyen)
           ======================================================== */}
        <SectionReveal delay={0.15}>
          <div className="flex justify-center mb-6 sm:mb-12">
            <div className="w-full max-w-sm sm:max-w-none sm:w-auto p-1 sm:p-1.5 rounded-2xl bg-[#141414] border border-white/10 grid grid-cols-3 sm:inline-flex gap-1 sm:gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-2 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 select-none ${
                      isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.02]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="experienceTab"
                        className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 shadow-md"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 relative z-10 ${isActive ? 'text-white' : 'text-[#819fa7]'}`} />
                    <span className="relative z-10 font-sans font-semibold hidden sm:inline">{tab.label}</span>
                    <span className="relative z-10 font-sans font-semibold sm:hidden truncate">{tab.shortLabel}</span>
                    <span className={`relative z-10 text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40'
                    }`}>
                      <span className="hidden sm:inline">{tab.count}</span>
                      <span className="sm:hidden">{tab.shortCount}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </SectionReveal>

        {/* ========================================================
            TAB CONTENT: Her alan kendi geniş, ferah sahnesinde
           ======================================================== */}
        <AnimatePresence mode="wait">
          
          {/* 1. EĞİTİM & MÜFREDAT */}
          {activeTab === 'education' && (
            <motion.div
              key="education"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col lg:flex-row items-start justify-between gap-6 sm:gap-8 lg:gap-12"
            >
              {/* Sol: Lisans Derecesi & Bilgiler */}
              <div className="flex-1 max-w-xl w-full">
                <div className="font-mono text-[11px] font-semibold text-[#819fa7] tracking-[0.2em] uppercase mb-1.5 sm:mb-2">
                  {t('categories.education')}
                </div>
                <h3 className="text-xl sm:text-3xl font-display font-bold text-[#f3f5f9] tracking-tight mb-2">
                  {t('items.degree.title')}
                </h3>

                {/* Kurum, Dönem ve GPA Rozeti (Tam Monokrom, Sıfır Yeşil) */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 my-2.5 sm:my-3 text-xs sm:text-sm">
                  <span className="font-semibold text-white/90 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#819fa7]" />
                    {t('items.degree.organization')}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="font-mono text-xs text-white/50">
                    {t('items.degree.period')}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="font-mono text-[11px] sm:text-xs font-semibold text-white/90 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/5 border border-white/15">
                    GPA: 2.84 / 4.0
                  </span>
                </div>

                <p className="text-sm sm:text-[15px] leading-relaxed sm:leading-[1.8] text-white/60 mt-2 sm:mt-3">
                  {t('items.degree.description')}
                </p>
              </div>

              {/* Sağ: 10 Üniversite Dersi (Çipler - Mobil 2 Sütun Grid) */}
              <div className="w-full lg:w-[480px] shrink-0 pt-2 sm:pt-0">
                <div className="font-mono text-[11px] font-semibold text-white/40 tracking-[0.15em] uppercase mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#819fa7]" />
                    {t('coursesTitle')}
                  </span>
                  <span className="text-[10px] text-white/30">10 {locale === 'tr' ? 'Ders' : 'Courses'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {coursesData.map((course) => {
                    const CourseIcon = course.icon || BookOpen;
                    return (
                      <button
                        key={course.key}
                        onClick={() => setSelectedItem(course)}
                        className="px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#141414] hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all text-left flex items-center justify-between gap-1.5 sm:gap-2.5 group/chip cursor-pointer w-full sm:w-auto"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <CourseIcon className="w-3.5 h-3.5 text-[#819fa7] group-hover/chip:text-white transition-colors shrink-0" />
                          <span className="text-[11.5px] sm:text-xs font-medium text-white/80 group-hover/chip:text-white truncate">
                            {t(`courses.${course.key}.title`)}
                          </span>
                        </div>
                        <ChevronRight className="w-3 h-3 text-white/20 group-hover/chip:text-white/70 group-hover/chip:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. TOPLULUK & LİDERLİK ROLLERİ (Editoryal, Kutusuz Açık Düzen) */}
          {activeTab === 'community' && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-10 lg:gap-14"
            >
              {communityData.map((role, idx) => {
                const RoleIcon = role.icon || Users;
                const isLive = idx === 0; // HSD DevOps aktif
                return (
                  <div
                    key={role.key}
                    className="flex flex-col justify-between p-4 sm:p-0 rounded-2xl sm:rounded-none bg-white/[0.02] sm:bg-transparent border border-white/5 sm:border-0"
                  >
                    <div>
                      {/* Üst Kategori Etiketi */}
                      <div className="font-mono text-[11px] font-semibold text-[#819fa7] tracking-[0.2em] uppercase mb-1.5 sm:mb-2">
                        {t(`items.${role.key}.organization`)}
                      </div>

                      {/* Başlık */}
                      <h3 className="text-xl sm:text-3xl font-display font-bold text-[#f3f5f9] tracking-tight mb-2">
                        {t(`items.${role.key}.title`)}
                      </h3>

                      {/* Kurum, Dönem ve Canlı Durum */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 my-2.5 sm:my-3 text-xs sm:text-sm">
                        <span className="font-semibold text-white/90 flex items-center gap-1.5">
                          <RoleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#819fa7]" />
                          {t(`items.${role.key}.organization`)}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="font-mono text-xs text-white/50 flex items-center">
                          {isLive && (
                            <span className="relative flex h-2 w-2 mr-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white/80" />
                            </span>
                          )}
                          {t(`items.${role.key}.period`)}
                        </span>
                      </div>

                      {/* Açıklama Metni (Ferah, geniş) */}
                      <p className="text-sm sm:text-[15px] leading-relaxed sm:leading-[1.8] text-white/60 my-2 sm:my-3">
                        {t(`items.${role.key}.description`)}
                      </p>

                      {/* Etiketler (Minimalist açık haplar) */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 my-3 sm:my-4">
                        {(role.tags || []).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="font-mono text-[11px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </motion.div>
          )}

          {/* 3. SERTİFİKALAR & BOOTCAMPLER (Editoryal Liste Düzeni - Kutusuz, Çizgili) */}
          {activeTab === 'certifications' && (
            <motion.div
              key="certifications"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="divide-y divide-white/10 border-y border-white/10"
            >
              {certificationsData.map((item, idx) => {
                const CertIcon = item.icon || Award;
                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedItem(item)}
                    className="py-3.5 sm:py-6 flex items-center justify-between gap-3 sm:gap-4 group cursor-pointer transition-all hover:bg-white/[0.02] px-1 sm:px-4 rounded-xl"
                  >
                    <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                      <span className="font-mono text-xs text-[#819fa7] font-semibold select-none w-5 sm:w-6 shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#819fa7] group-hover:text-white group-hover:border-white/20 transition-all">
                        <CertIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-lg font-semibold text-[#f3f5f9] group-hover:text-white transition-colors truncate">
                          {t(`items.${item.key}.title`)}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs sm:text-sm text-[#819fa7] font-medium truncate">
                            {t(`items.${item.key}.organization`)}
                          </p>
                          <span className="text-white/20 sm:hidden">•</span>
                          <span className="font-mono text-[11px] text-white/40 sm:hidden">
                            {t(`items.${item.key}.period`)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      <span className="font-mono text-xs text-white/40 hidden sm:inline">
                        {t(`items.${item.key}.period`)}
                      </span>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Modal Dialog (Tıklanan ders / sertifikanın detayları — body portal ile render edilir) */}
      <DetailModal
        item={selectedItem}
        onClose={handleCloseModal}
        t={t}
        locale={locale}
      />
    </section>
  );
}
