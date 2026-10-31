// Proje Verileri - Duran Gezer'in GitHub Projeleri (Türkçe)

export interface Project {
  id: string
  title: string
  status: 'completed' | 'in-progress' | 'planned'
  oneLiner: string

  problem: string
  constraints: string[]
  approach: string

  modelChoice: {
    name: string
    rationale: string
  }

  evaluation: {
    metrics: Array<{
      name: string
      value: string
    }>
    approach: string
  }

  outcome: string
  learnings: string[]

  techStack: string[]
  github?: string
  demo?: string

  thumbnail?: string
  tags: string[]
}

export const projects: Project[] = [
  {
    id: 'aliaga-ai',
    title: 'AliağaAI — Akıllı Şehir Rehberi & RAG Asistanı',
    status: 'completed',
    oneLiner: 'Aliağa ilçesine özel doğrulanmış verilerle çalışan, çok aşamalı hibrit RAG ve React Native mobil arayüzünü birleştiren akıllı şehir asistanı.',
    problem: 'Genel arama motorlarının ilçe bazlı yerel veriye (nöbetçi eczane, İZBAN saatleri, kesintiler, belediye duyuruları) ulaşmadaki dağınıklığını ve reklam odaklı yapısını çözmek.',
    constraints: [
      'Sıfır halüsinasyon ve doğrulanmış kaynak zorunluluğu',
      'Hızlı hibrit vektör arama (<500ms)',
      '9 izole asenkron veri botu ile güncel veri',
      'Mobil öncelikli arayüz (React Native)'
    ],
    approach: 'pgvector HNSW + PostgreSQL Türkçe Full-Text Search ve Reciprocal Rank Fusion (RRF) ile hibrit arama motoru. Groq Llama 3.3 ile doğrulanmış bağlam üzerinden kaynak atıflı ([S1], [S2]) yanıt üretimi.',
    modelChoice: {
      name: 'Groq Llama 3.3 + pgvector HNSW',
      rationale: 'Hızlı çıkarım süresi, Türkçe anlama yeteneği ve hibrit vektör erişimi sayesinde uydurma bilgi üretmeden net kaynak referanslı cevaplar.'
    },
    evaluation: {
      metrics: [
        { name: 'Halüsinasyon Oranı', value: '%0' },
        { name: 'Veri Botları', value: '9 İzole Bot' },
        { name: 'Sorgu Yanıtı', value: '<600ms' }
      ],
      approach: 'Doğrulanmış yerel veri kümeleri ve canlı belediye/ulaşım sorguları ile kapsamlı testler.'
    },
    outcome: 'Aliağa ilçesi sakinleri ve ziyaretçileri için 7/24 güncel, güvenilir ve tek ekranda şehir sinyallerini sunan akıllı asistan.',
    learnings: [
      'Hibrit RAG (vektör + FTS), salt vektör aramasına göre yerel aramalarda belirgin şekilde daha isabetli',
      'Reciprocal Rank Fusion (RRF), farklı arama skorlarını normalize etmede en dengeli yöntem',
      'Arka plan botlarında hata izolasyonu veri hattı sürekliliği için şart'
    ],
    techStack: ['Python 3.11+', 'FastAPI', 'React Native', 'Expo', 'PostgreSQL', 'pgvector (HNSW)', 'Groq Llama 3.3', 'APScheduler', 'Docker Compose', 'SlowAPI'],
    github: 'https://github.com/DuranGZR/AliagaAI',
    demo: undefined,
    tags: ['AI Systems', 'Hybrid RAG', 'Mobile', 'FastAPI', 'PostgreSQL']
  },

  {
    id: 'ai-dream-interpreter',
    title: 'Rüya Yorumlayıcı (AI Dream Interpreter)',
    status: 'completed',
    oneLiner: 'Jungiyen arketipler ve Freudyen sembolizm temelli, çoklu LLM yedekleme ve sembol RAG sözlüğüyle çalışan psikolojik rüya analiz platformu.',
    problem: 'Geleneksel kalıp rüya tabirlerinin bilimsel ve psikolojik temelden yoksun olması; yüzeysel ve genellemeci açıklamalar sunması.',
    constraints: [
      'Yüksek model erişilebilirliği (kota/hata durumunda kesinti olmamalı)',
      'Psikolojik derinlik ve Chain-of-Thought analizi',
      'Kullanıcı gizliliği ve veri güvenliği',
      'Zaman serisi ve içgörü takibi'
    ],
    approach: 'Google Gemini 1.5 Flash ile Groq Llama 3 arasında otomatik failover mimarisi. 3 aşamalı Chain-of-Thought (Dedektif -> Analist -> Sentez) ve yerel sembol RAG sözlüğü ile kişiselleştirilmiş içgörü.',
    modelChoice: {
      name: 'Google Gemini 1.5 + Groq Llama 3 (Failover)',
      rationale: 'Kesintisiz çalışma garantisi ve yüksek bağlam kapasitesi ile derin sembol analizi.'
    },
    evaluation: {
      metrics: [
        { name: 'Failover Süresi', value: '<300ms' },
        { name: 'Enerji Skoru', value: '0-100 Skala' },
        { name: 'Uptime', value: '%99.9' }
      ],
      approach: 'Farklı rüya metinleri ve duygu durumları üzerinde karşılaştırmalı analiz testleri.'
    },
    outcome: 'Kullanıcıların bilinçaltı örüntülerini, sembol frekanslarını ve zihinsel enerji seviyelerini takip edebildiği tam teşekküllü mobil farkındalık uygulaması.',
    learnings: [
      'Chain-of-Thought adımları, tek aşamalı prompt çıktısına göre analiz kalitesini katbekat artırıyor',
      'Çoklu LLM failover mimarisi prodüksiyon kararlılığı için kritik önemde'
    ],
    techStack: ['React Native', 'Expo SDK 54', 'TypeScript', 'Node.js', 'Express', 'Google Gemini 1.5', 'Groq Llama 3', 'Firebase Firestore', 'Firebase Auth', 'Docker Compose'],
    github: 'https://github.com/DuranGZR/Ai-Dream-Interpreter',
    demo: undefined,
    tags: ['Applied AI', 'Mobile', 'CoT & RAG', 'React Native', 'Firebase']
  },

  {
    id: 'kayip-qr',
    title: 'KayıpQR — Gizlilik Odaklı Akıllı QR Etiket Platformu',
    status: 'completed',
    oneLiner: 'Kişisel telefon numarası veya e-posta paylaşmadan dinamik QR etiketleri üzerinden üyeliksiz anonim mesajlaşma sağlayan platform.',
    problem: 'Değerli eşyalara telefon numarası yazmanın oluşturduğu gizlilik ve güvenlik riskleri.',
    constraints: [
      'Telefon/e-posta bilgilerinin asla dışarı sızmaması',
      'Bulan kişinin uygulama indirmeden ve üye olmadan mesaj atabilmesi',
      'Düşük sunucu kaynak tüketimi (Redis bağımlılığı olmadan)'
    ],
    approach: 'Next.js 15 ve FastAPI mimarisi. Redis yerine PostgreSQL tabanlı SQL Outbox deseniyle asenkron e-posta bildirimi; Argon2id parola güvenliği ve WebP görsel sıkıştırma.',
    modelChoice: {
      name: 'FastAPI + Next.js 15 + PostgreSQL',
      rationale: 'Yüksek performans, tip güvenliği ve minimal harici bağımlılıkla üretime hazır yalın mimari.'
    },
    evaluation: {
      metrics: [
        { name: 'Gizlilik İfşası', value: '%0' },
        { name: 'Baskı Şablonları', value: '8 Tema' },
        { name: 'Outbox Gecikmesi', value: '<2s' }
      ],
      approach: 'Güvenlik denetimleri, sayfalama ve rate limiting senaryoları ile kapsamlı testler.'
    },
    outcome: 'Eşya sahipleri ve bulanlar arasında güvenli, anonim köprü kuran uçtan uca QR etiket ve baskı platformu.',
    learnings: [
      'SQL Outbox deseni, küçük ve orta ölçekli projelerde ek Redis altyapı maliyetini tamamen ortadan kaldırıyor',
      'İmzasız tek kullanımlık oturum tokenları üyeliksiz akışlarda mükemmel UX sağlıyor'
    ],
    techStack: ['Next.js 15', 'TypeScript', 'FastAPI', 'Async SQLAlchemy', 'PostgreSQL', 'Alembic', 'Argon2id', 'Tailwind CSS', 'Resend Outbox', 'Docker'],
    github: 'https://github.com/DuranGZR/KayipQR',
    demo: undefined,
    tags: ['Full-Stack Web', 'Privacy & Security', 'FastAPI', 'Next.js', 'PostgreSQL']
  },

  {
    id: 'wedo',
    title: 'WeDo — Ortak Fikir, Liste & Karar Uygulaması',
    status: 'completed',
    oneLiner: 'Sosyal medya ve web içeriklerini sistem paylaşım menüsünden tek dokunuşla ortak alana kaydedip birlikte planlamayı sağlayan mobil uygulama.',
    problem: 'Sosyal medyada ve tarayıcı sekmelerinde kaybolan mekan, film, etkinlik ve alışveriş fikirlerinin ortak bir karara dönüşememesi.',
    constraints: [
      'iOS ve Android native Share Sheet yakalama zorunluluğu',
      'SSRF korumalı metadata ayrıştırma',
      'Gerçek zamanlı ortak alan senkronizasyonu'
    ],
    approach: 'Expo Share Intent ile sistem paylaşım menüsü entegrasyonu. oEmbed, OpenGraph ve JSON-LD ayrıştırıcıları ile otomatik önizleme kartı üretimi. FastAPI modüler monolit backend.',
    modelChoice: {
      name: 'FastAPI + React Native + PostgreSQL 17',
      rationale: 'Python ekosisteminin zengin web scraping ve metadata ayrıştırma araçları ile React Native mobil akışının uyumu.'
    },
    evaluation: {
      metrics: [
        { name: 'Metadata Yakalama', value: '<1s' },
        { name: 'Desteklenen Platformlar', value: 'Tüm Web' },
        { name: 'Paylaşım Hızı', value: 'Tek Dokunuş' }
      ],
      approach: 'YouTube, TikTok, Instagram ve çeşitli e-ticaret sitelerinden gelen bağlantılarla stres testleri.'
    },
    outcome: 'Çiftlerin ve arkadaş gruplarının fikirlerini kolayca ortak listelere dönüştürüp karar alabildikleri pratik mobil uygulama.',
    learnings: [
      'Native share sheet entegrasyonu mobil kullanıcı deneyimini radikal biçimde hızlandırıyor',
      'Metadata çekici servislerde SSRF ve boyut sınırları güvenlik için vazgeçilmez'
    ],
    techStack: ['React Native 0.81', 'Expo SDK 54', 'TypeScript', 'FastAPI', 'Python 3.13', 'PostgreSQL 17', 'SQLAlchemy 2', 'Zustand & TanStack Query', 'Docker Compose', 'Nginx'],
    github: 'https://github.com/DuranGZR/WeDo',
    demo: undefined,
    tags: ['Mobile', 'Backend Architecture', 'DevOps', 'FastAPI', 'React Native']
  },

  {
    id: 'visual-ai',
    title: 'Gerçek Zamanlı Görsel Anlama AI',
    status: 'completed',
    oneLiner: 'Kamera görüntüsünü anlık olarak analiz eden ve Türkçe açıklama üreten yapay zeka sistemi.',

    problem: 'Görme engelli bireyler veya anlık çevre analizi ihtiyacı olanlar için gerçek zamanlı görsel açıklama sistemi gerekiyor. Mevcut çözümler ya çok yavaş ya da Türkçe desteklemiyor.',

    constraints: [
      'Düşük gecikme süresi gereksinimi (<2 saniye)',
      'Türkçe dil desteği zorunluluğu',
      'Lokal çalışabilme (internet bağımsız, gizlilik)',
      'Farklı ışık koşullarında güvenilir çalışma'
    ],

    approach: 'Ollama üzerinde LLaVA vision-language modeli kullanarak gerçek zamanlı görüntü analizi. OpenCV ile kamera entegrasyonu sağlandı. Görüntü ön işleme ile model performansı optimize edildi.',

    modelChoice: {
      name: 'LLaVA (Ollama)',
      rationale: 'Lokal çalışabilme özelliği sayesinde internet bağımsızlığı ve gizlilik sağlıyor. Türkçe dil desteği mevcut. API maliyeti yok ve açık kaynak olması geliştirmeyi kolaylaştırıyor.'
    },

    evaluation: {
      metrics: [
        { name: 'Yanıt Süresi', value: '<2s' },
        { name: 'Doğruluk', value: '%85+' },
        { name: 'Dil Desteği', value: 'TR/EN' }
      ],
      approach: 'Farklı ortam ve nesnelerle manuel test yapıldı. 100+ farklı sahne üzerinde doğruluk ölçümü gerçekleştirildi.'
    },

    outcome: 'Başarıyla çalışan gerçek zamanlı görsel anlama sistemi geliştirildi. Sesli çıktı özelliği eklenebilir durumda. Görme engelli bireylere yardımcı olabilecek potansiyele sahip.',

    learnings: [
      'Vision-language modelleri hızla gelişiyor ve lokal kullanıma uygun hale geliyor',
      'Lokal LLM performansı birçok kullanım senaryosu için yeterli olabiliyor',
      'Prompt engineering, model çıktı kalitesini dramatik şekilde etkiliyor',
      'Türkçe için ek prompt optimizasyonu daha iyi sonuçlar veriyor'
    ],

    techStack: ['Python', 'Ollama', 'LLaVA', 'OpenCV'],

    github: 'https://github.com/DuranGZR/Real-Time-Visual-Understanding',
    demo: undefined,

    tags: ['AI', 'Computer Vision', 'LLM', 'Python']
  },

  {
    id: 'handwriting',
    title: 'El Yazısı Rakam Tanıma',
    status: 'completed',
    oneLiner: 'CNN kullanarak el yazısıyla yazılmış rakamları yüksek doğrulukla tanıyan derin öğrenme modeli.',

    problem: 'El yazısı dijitalleştirme ve otomatik form işleme için güvenilir rakam tanıma sistemi gerekiyor. Farklı el yazısı stillerini doğru tanımlayabilmeli.',

    constraints: [
      'Farklı el yazısı stillerini tanıyabilme',
      'Yüksek doğruluk oranı gereksinimi (%95+)',
      'Hızlı inference süresi (<50ms)',
      'MNIST veri seti ile uyumluluk'
    ],

    approach: 'Convolutional Neural Network (CNN) mimarisi ile görüntü sınıflandırma. Veri artırma (data augmentation) teknikleri ile modelin genelleme yeteneği güçlendirildi.',

    modelChoice: {
      name: 'CNN (TensorFlow/Keras)',
      rationale: 'Görüntü sınıflandırma için standart ve kanıtlanmış mimari. Basit ama güçlü performans. Eğitim ve deploy süreçleri iyi dokümante edilmiş.'
    },

    evaluation: {
      metrics: [
        { name: 'Test Doğruluğu', value: '%98+' },
        { name: 'Model Boyutu', value: '<5MB' },
        { name: 'Inference', value: '<50ms' }
      ],
      approach: 'MNIST test seti ve özel toplanmış el yazısı örnekleri üzerinde değerlendirme yapıldı.'
    },

    outcome: 'Yüksek doğrulukla çalışan rakam tanıma modeli geliştirildi. Kullanıcı dostu GUI arayüzü ile entegre edildi.',

    learnings: [
      'CNN temelleri, derin öğrenme için kritik bir başlangıç noktası',
      'Data augmentation, sınırlı veriyle bile genellemeyi önemli ölçüde artırıyor',
      'Basit problemler için basit çözümler genellikle en etkili oluyor',
      'Transfer learning her zaman gerekli değil, özellikle yeterli veri varsa'
    ],

    techStack: ['Python', 'TensorFlow', 'Keras', 'OpenCV', 'NumPy'],

    github: 'https://github.com/DuranGZR/El_Yazisi_Tahmin',
    demo: undefined,

    tags: ['Deep Learning', 'CNN', 'Image Classification']
  },

  {
    id: 'diabetes',
    title: 'Diyabet Tahmin Sistemi',
    status: 'completed',
    oneLiner: 'Makine öğrenmesi ile diyabet risk tahminlemesi yapan sınıflandırma modeli.',

    problem: 'Erken teşhis için diyabet risk faktörlerini analiz eden bir sistem gerekli. Sağlık verilerinden anlamlı tahminler üretebilmeli.',

    constraints: [
      'Sınırlı veri seti (Pima Indians Diabetes Dataset)',
      'Dengesiz sınıf dağılımı problemi',
      'Tıbbi alanda yüksek precision gereksinimi',
      'Yorumlanabilirlik önemli (kara kutu model yetersiz)'
    ],

    approach: 'Çeşitli ML algoritmalarının karşılaştırmalı analizi yapıldı. Kapsamlı feature engineering ve veri ön işleme uygulandı. Ensemble yöntemler ile en iyi sonuç elde edildi.',

    modelChoice: {
      name: 'Random Forest / XGBoost',
      rationale: 'Ensemble yöntemler daha iyi genelleme sağlıyor. Feature importance analizi ile hangi faktörlerin etkili olduğu yorumlanabiliyor.'
    },

    evaluation: {
      metrics: [
        { name: 'Accuracy', value: '%82' },
        { name: 'F1-Score', value: '0.78' },
        { name: 'AUC-ROC', value: '0.85' }
      ],
      approach: 'K-fold cross-validation ve confusion matrix analizi ile model performansı değerlendirildi.'
    },

    outcome: 'Tıbbi karar destek sistemi prototipi geliştirildi. Feature importance analizi ile en etkili risk faktörleri belirlendi.',

    learnings: [
      'Tıbbi verilerde precision çok kritik - yanlış pozitifler ciddi sonuçlar doğurabilir',
      'Feature engineering, ham veriden çok daha iyi sonuçlar alınmasını sağlıyor',
      'Ensemble yöntemler genellikle tek modellere göre daha güçlü',
      'Veri kalitesi, model karmaşıklığından daha önemli'
    ],

    techStack: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib'],

    github: 'https://github.com/DuranGZR/Diabetes_Prediction',
    demo: undefined,

    tags: ['Machine Learning', 'Classification', 'Healthcare']
  },

  {
    id: 'xox-bot',
    title: 'XOX Bot (Q-Learning AI)',
    status: 'completed',
    oneLiner: 'Pekiştirmeli öğrenme ile kendini eğiten ve optimal strateji geliştiren tic-tac-toe oyuncu yapay zekası.',

    problem: 'Klasik oyunlarda yapay zekanın strateji öğrenme ve optimal hamle bulma sürecini anlamak ve uygulamak.',

    constraints: [
      'Oyun kurallarına tam uyum',
      'Öğrenme hızı optimizasyonu',
      'Exploration vs exploitation dengesi',
      'Farklı rakip stratejilerine adaptasyon'
    ],

    approach: 'Q-Learning algoritması ile pekiştirmeli öğrenme uygulandı. Epsilon-greedy strateji ile keşif ve kullanım dengesi sağlandı.',

    modelChoice: {
      name: 'Q-Learning',
      rationale: 'Basit ama etkili bir pekiştirmeli öğrenme algoritması. Discrete state-action space için ideal. Öğrenme sürecini gözlemlemeye uygun.'
    },

    evaluation: {
      metrics: [
        { name: 'Kazanma Oranı', value: '%95+' },
        { name: 'Eğitim Süresi', value: '<1dk' },
        { name: 'Optimal Hamleler', value: '%90+' }
      ],
      approach: 'Random ve optimal rakiplere karşı binlerce oyun ile test edildi.'
    },

    outcome: 'Neredeyse yenilmez XOX oyuncusu geliştirildi. Reinforcement learning temellerini anlamak için mükemmel bir uygulama projesi oldu.',

    learnings: [
      'RL temelleri en iyi pratik uygulama ile öğreniliyor',
      'Hyperparameter tuning (learning rate, epsilon decay) sonucu dramatik etkiliyor',
      'Basit oyunlar RL algoritmaları için ideal test ortamı',
      'Convergence garantisi için dikkatli tasarım gerekiyor'
    ],

    techStack: ['Python', 'NumPy', 'Q-Learning'],

    github: 'https://github.com/DuranGZR/XOX_Bot',
    demo: undefined,

    tags: ['Reinforcement Learning', 'Q-Learning', 'Game AI']
  },

  {
    id: 'salary-prediction',
    title: 'Maaş Tahmin Modeli',
    status: 'completed',
    oneLiner: 'Kapsamlı feature engineering ve makine öğrenmesi ile çalışan maaş tahmini yapan regresyon modeli.',

    problem: 'İK ve işe alım süreçlerinde adil ve veri odaklı maaş belirleme için tahmin sistemi gerekiyor.',

    constraints: [
      'Çok sayıda kategorik değişken yönetimi',
      'Eksik verilerle başa çıkma stratejileri',
      'Non-linear ilişkilerin modellenmesi',
      'Outlier (aykırı değer) yönetimi'
    ],

    approach: 'Kapsamlı EDA (Exploratory Data Analysis) yapıldı. Feature engineering ile yeni özellikler türetildi. Farklı modeller karşılaştırıldı. Pipeline ile end-to-end çözüm geliştirildi.',

    modelChoice: {
      name: 'Gradient Boosting / Random Forest',
      rationale: 'Regresyon problemlerinde güçlü performans. Feature importance ile hangi faktörlerin maaşı etkilediği yorumlanabilir.'
    },

    evaluation: {
      metrics: [
        { name: 'R² Score', value: '0.85' },
        { name: 'MAE', value: '±%8' },
        { name: 'RMSE', value: 'Düşük' }
      ],
      approach: 'Train-test split ve cross-validation ile model performansı değerlendirildi.'
    },

    outcome: 'Maaş tahmini için kullanılabilir model geliştirildi. Maaşı en çok etkileyen faktörler (deneyim, pozisyon, sektör vb.) belirlendi.',

    learnings: [
      'Feature engineering, model performansını dramatik şekilde artırabiliyor',
      'Kategorik değişkenlerin encoding stratejisi çok önemli',
      'Domain knowledge (sektör bilgisi) feature engineering\'i yönlendirmeli',
      'Pipeline kullanımı temiz ve bakımı kolay kod sağlıyor'
    ],

    techStack: ['Python', 'Scikit-learn', 'Pandas', 'Feature Engineering'],

    github: 'https://github.com/DuranGZR/Salary_Prediction_with_Mahcine_Learning',
    demo: undefined,

    tags: ['Machine Learning', 'Regression', 'Feature Engineering']
  },

  {
    id: 'neuron',
    title: 'Basit Yapay Sinir Ağı',
    status: 'completed',
    oneLiner: 'Sıfırdan NumPy ile yazılmış, temel yapay nöron ve neural network implementasyonu.',

    problem: 'Yapay sinir ağlarının temel çalışma prensiplerini derinlemesine anlamak ve framework kullanmadan uygulamak.',

    constraints: [
      'Sadece NumPy kullanımı (TensorFlow/PyTorch yok)',
      'Matematiksel temelleri tam anlama',
      'Forward ve backward propagation implementasyonu',
      'Gradient descent optimizasyonu'
    ],

    approach: 'Perceptron ve basit multi-layer neural network sıfırdan kodlandı. Aktivasyon fonksiyonları, loss hesaplama ve backpropagation elle implemente edildi.',

    modelChoice: {
      name: 'Perceptron / MLP',
      rationale: 'En temel neural network yapısı. Öğrenim için ideal başlangıç noktası. Matematiği anlamak framework kullanmadan önce kritik.'
    },

    evaluation: {
      metrics: [
        { name: 'AND/OR Gates', value: '%100' },
        { name: 'XOR (MLP)', value: '%100' },
        { name: 'Öğrenim Değeri', value: 'Yüksek' }
      ],
      approach: 'Boolean logic gates (AND, OR, XOR) problemleri ile test edildi.'
    },

    outcome: 'Neural network temellerini derinlemesine anlama sağlandı. Framework kullanmadan önce bu bilgi kritik öneme sahip.',

    learnings: [
      'Backpropagation algoritması chain rule matematiğine dayanıyor',
      'Gradient descent\'in farklı varyantları (SGD, momentum) önemli farklar yaratıyor',
      'Aktivasyon fonksiyonları non-linearity sağlıyor ve kritik önemde',
      'Framework\'lerin arkasındaki matematiği anlamak debugging\'i kolaylaştırıyor'
    ],

    techStack: ['Python', 'NumPy', 'Mathematics'],

    github: 'https://github.com/DuranGZR/Simple-Artificial-Neuron',
    demo: undefined,

    tags: ['Neural Networks', 'Deep Learning Fundamentals', 'NumPy']
  },

  {
    id: 'telegram-birthday-bot',
    title: 'Telegram Doğum Günü Botu',
    status: 'completed',
    oneLiner: 'Doğum günlerini takip eden ve otomatik hatırlatma gönderen Telegram botu.',

    problem: 'Topluluklar ve gruplar için doğum günlerini manuel takip etmek zor. Otomatik hatırlatma sistemi ile kimsenin doğum günü unutulmasın.',

    constraints: [
      'Telegram Bot API entegrasyonu',
      'Thread-safe veritabanı yönetimi',
      'Zamanlama sistemi (her gün 09:00)',
      'Admin yetkilendirme sistemi',
      'Cloud deployment (Railway)'
    ],

    approach: 'python-telegram-bot kütüphanesi ile async bot geliştirildi. SQLite ile thread-safe veritabanı, APScheduler ile günlük hatırlatma sistemi kuruldu. Railway üzerinde 7/24 çalışacak şekilde deploy edildi.',

    modelChoice: {
      name: 'Python + Telegram Bot API',
      rationale: 'Async yapısı sayesinde yüksek performans. python-telegram-bot kütüphanesi güçlü ve iyi dokümante edilmiş. Railway ile kolay deployment.'
    },

    evaluation: {
      metrics: [
        { name: 'Uptime', value: '7/24' },
        { name: 'Hatırlatma Zamanı', value: '09:00' },
        { name: 'Komut Sayısı', value: '5+' }
      ],
      approach: 'Gerçek grup ortamında test edildi. Zamanlama ve hatırlatma sistemleri doğrulandı.'
    },

    outcome: 'Aktif olarak çalışan Telegram botu geliştirildi. Doğum günü ekleme/silme/listeleme, CSV ile toplu ekleme, otomatik hatırlatma ve istatistik özellikleri mevcut.',

    learnings: [
      'Telegram Bot API ve async programlama deneyimi kazandım',
      'APScheduler ile cron-job benzeri zamanlama sistemleri kurdum',
      'Thread-safe veritabanı yönetimini öğrendim',
      'Railway ile cloud deployment süreçlerini deneyimledim',
      'Environment variables ile güvenli config yönetimi'
    ],

    techStack: ['Python', 'Telegram Bot API', 'SQLite', 'APScheduler', 'Railway'],

    github: 'https://github.com/DuranGZR/Telegram_dogum_gunu_bot',
    demo: undefined,

    tags: ['Python', 'Bot Development', 'Automation', 'Cloud Deploy']
  },

  {
    id: 'bus-ticket',
    title: 'Otobüs Bilet Rezervasyon Sistemi',
    status: 'completed',
    oneLiner: 'Java ile geliştirilmiş otobüs seferi ve bilet yönetim sistemi.',

    problem: 'Otobüs firmalarında bilet satış ve koltuk rezervasyon süreçlerinin dijitalleştirilmesi gerekiyor.',

    constraints: [
      'Çoklu sefer ve otobüs yönetimi',
      'Koltuk seçimi ve rezervasyon işlemleri',
      'Veri yapılarının etkin kullanımı',
      'OOP ilkelerine uygun tasarım'
    ],

    approach: 'Java Swing ile graphical user interface geliştirildi. ArrayList, HashMap gibi veri yapıları ile veri yönetimi sağlandı. OOP tasarım kalıpları uygulandı.',

    modelChoice: {
      name: 'Java Swing',
      rationale: 'Java için standart GUI toolkit. Platform bağımsız çalışma. Veri yapıları ve OOP öğrenimi için uygun.'
    },

    evaluation: {
      metrics: [
        { name: 'Çalışan Özellikler', value: '%100' },
        { name: 'OOP Uyumu', value: 'Yüksek' },
        { name: 'Kod Kalitesi', value: 'İyi' }
      ],
      approach: 'Manuel test ile fonksiyonellik doğrulandı.'
    },

    outcome: 'Tam işlevsel bilet rezervasyon sistemi geliştirildi. Java ve OOP pratik uygulaması olarak değerli deneyim sağladı.',

    learnings: [
      'Java Swing ile GUI geliştirme temellerini öğrendim',
      'Veri yapılarının pratik kullanım alanlarını gördüm',
      'OOP tasarım kalıpları (MVC benzeri) kod organizasyonunu iyileştiriyor',
      'Event-driven programlama paradigmasını uyguladım'
    ],

    techStack: ['Java', 'Swing', 'OOP', 'Data Structures'],

    github: 'https://github.com/DuranGZR/A_Bus_Ticket_Reservation_System',
    demo: undefined,

    tags: ['Java', 'Desktop App', 'OOP', 'Data Structures']
  }
]

// Helper function to get project by ID
export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id)
}

// Helper function to get projects by status
export const getProjectsByStatus = (status: Project['status']): Project[] => {
  return projects.filter(project => project.status === status)
}

// Helper function to get all tags
export const getAllTags = (): string[] => {
  const allTags = projects.flatMap(project => project.tags)
  return Array.from(new Set(allTags)).sort()
}
