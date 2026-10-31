"""
AI Service - Groq Integration for Portfolio Assistant
Uses Groq API with primary model (qwen/qwen3.8-27b) and automatic fallbacks
"""
import json
from pathlib import Path
from typing import Dict, List, Optional

from groq import Groq

from app.config import settings


# In-memory session storage (for production, use Redis or database)
_sessions: Dict[str, List[Dict]] = {}

# Knowledge base cache
_knowledge_base: Optional[Dict] = None

# Groq client
_client: Optional[Groq] = None


def get_client() -> Groq:
    """Get or create Groq client."""
    global _client
    if _client is None:
        _client = Groq(api_key=settings.groq_api_key)
    return _client


def load_knowledge_base(force_reload: bool = False) -> Dict:
    """Load knowledge base from JSON file."""
    global _knowledge_base
    
    if _knowledge_base is not None and not force_reload:
        return _knowledge_base
    
    kb_path = Path(__file__).parent.parent / "data" / "knowledge_base.json"
    
    if kb_path.exists():
        with open(kb_path, "r", encoding="utf-8") as f:
            _knowledge_base = json.load(f)
    else:
        # Minimal fallback - JSON dosyası yoksa
        _knowledge_base = {
            "about": {"name": "Duran Gezer", "title": "AI/ML Engineer"},
            "skills": {"ai_systems_and_ml": [], "programming": [], "backend_and_frameworks": [], "database_and_devops": []},
            "projects": [],
            "certifications": [],
            "courses": [],
            "thinking": {"principles": [], "quote": ""},
            "roadmap": {},
            "contact": {"github": "https://github.com/DuranGZR"},
            "highlights": []
        }
    
    return _knowledge_base


def get_system_prompt() -> str:
    """Generate system prompt with knowledge base."""
    kb = load_knowledge_base()
    
    # Format projects with distinction between featured and foundational
    featured_projects_text = ""
    other_projects_text = ""
    
    for p in kb.get('projects', []):
        github_link = p.get('github', '')
        category = f" [{p.get('category')}]" if p.get('category') else ""
        item_text = f"- **{p['name']}** ({p.get('year', '')}){category}: {p['description']}\n"
        item_text += f"  Teknolojiler: {', '.join(p['tech'])}\n"
        if github_link:
            item_text += f"  GitHub: {github_link}\n"
        item_text += "\n"
        
        if p.get('featured', False):
            featured_projects_text += item_text
        else:
            other_projects_text += item_text
    
    # Format certifications
    certs_text = ""
    for c in kb.get('certifications', []):
        certs_text += f"- {c['title']} ({c['organization']}, {c['year']}): {c['description']}\n"
    
    # Format community activities
    community_text = ""
    for ca in kb.get('community_activities', []):
        community_text += f"- **{ca['title']}** - {ca['organization']} ({ca['period']})\n"
        community_text += f"  {ca['description']}\n"
        if ca.get('skills_gained'):
            community_text += f"  Kazanılan yetenekler: {', '.join(ca['skills_gained'])}\n"
        community_text += "\n"
    
    # Format skills
    skills = kb.get('skills', {})
    ai_skills = skills.get('ai_systems_and_ml', []) or skills.get('ai_ml', [])
    prog_skills = skills.get('programming', [])
    backend_skills = skills.get('backend_and_frameworks', []) or skills.get('frameworks', [])
    devops_skills = skills.get('database_and_devops', []) or skills.get('data', [])
    
    # Format thinking principles
    thinking = kb.get('thinking', {})
    principles_text = "\n".join([f"- {p}" for p in thinking.get('principles', [])])
    
    # Format roadmap
    roadmap = kb.get('roadmap', {})
    about = kb.get('about', {})
    
    return f"""Sen Duran Gezer'in resmi portfolyo asistanısın. SADECE Duran Gezer hakkında soruları yanıtlarsın.

# KRİTİK KURALLAR - MUTLAKA UYULMALI

## 1. KAPSAM SINIRI
SADECE şu konularda yanıt ver:
- Duran'ın güncel ve öne çıkan projeleri, yetenekleri, deneyimleri
- Duran'ın eğitimi, sertifikaları, topluluk çalışmaları ve kursları
- Duran'ın kariyer hedefleri ve mühendislik yol haritası
- Duran'ın mühendislik felsefesi ve problem çözme yaklaşımı
- Duran ile iletişim ve sosyal medya bilgileri
- Portfolyo sitesi hakkında sorular

## 2. REDDEDİLECEK KONULAR
Aşağıdaki konularda ASLA yanıt verme, kibarca ve net bir şekilde reddet:
- Küfür, hakaret, argo içeren mesajlar
- Politika, din, spor takımları
- Duran'ın özel hayatı, ilişkileri, maaş bilgisi
- Genel sohbet, felsefe, şakalar, espiriler
- Duran dışındaki konular (hava durumu, haberler, başka kişiler veya şirketler)
- Genel kod yazma, ödev çözme, çeviri veya metin yazma istekleri
- Her türlü uygunsuz veya alakasız içerik

## 3. REDDETME ŞEKLİ
Kapsam dışı mesajlara SADECE şu formatta yanıt ver:
"Bu konuda yardımcı olamıyorum 😊 Ben sadece Duran'ın projeleri, yetenekleri ve kariyer hedefleri hakkında bilgi verebilirim. Ne öğrenmek istersin?"

## 4. YANIT FORMATI VE STİLİ
- Türkçe sorulara Türkçe, İngilizce sorulara İngilizce yanıt ver.
- Kısa, öz ve akıcı tut (2-3 paragraf max).
- Her zaman 3. tekil şahıs kullan: "Duran şunu yapıyor...", "Onun projeleri..."
- ASLA 1. tekil şahıs kullanma ("Ben yaptım...", "Projelerim...").
- Proje başlıklarını ve öne çıkan terimleri her zaman Markdown bold formatında yaz: **Proje Adı (Yıl)**: Açıklama.
- Her yanıtın sonunda 1-2 ilgi çekici takip sorusu öner.

## 5. PROJELER HAKKINDA ÇOK ÖNEMLİ TALİMAT
- Duran'ın projeleri sorulduğunda ÖNCELİKLE ve MUTLAKA en güncel öne çıkan amiral gemisi projelerini (2025 - 2024) say:
  1. **AliağaAI — Akıllı Şehir Rehberi & RAG Asistanı (2025)** (FastAPI, pgvector HNSW, PostgreSQL Türkçe FTS, RRF, Groq Llama 3.3, React Native)
  2. **Rüya Yorumlayıcı (AI Dream Interpreter) (2025)** (Google Gemini 1.5 + Groq Llama 3 Failover, 3 aşamalı Chain-of-Thought, Sembol RAG, React Native)
  3. **KayıpQR — Gizlilik Odaklı Akıllı QR Etiket Platformu (2025)** (Next.js 15, FastAPI, Async SQLAlchemy, PostgreSQL Outbox)
  4. **WeDo — Ortak Fikir, Liste & Karar Uygulaması (2025)** (React Native, Expo, FastAPI, Native Share Intent)
  5. **Anlık Anlatım — Gerçek Zamanlı Görsel Anlama AI (2024)** (%100 yerel multimodal LLaVA 7B, WebSockets, OpenCV)
- Temel ML projeleri (Telegram Doğum Günü Botu, El Yazısı Rakam Tanıma, XOX Bot, Diyabet Tahmin Sistemi vb.) Duran'ın önceki temel alıştırmalarıdır. Genel proje sorularında yalnızca bu eski çalışmaları tek başına sıralama; daima güncel amiral gemisi projeleri öne çıkar.

# DURAN'IN PROFİLİ

**Temel Bilgiler:**
- İsim: {about.get('name', 'Duran Gezer')}
- Unvan: {about.get('title', 'Computer Engineer & AI Systems Developer')}
- Eğitim: {about.get('university', 'İnönü Üniversitesi')} - {about.get('year', '4. sınıf (2022-2026)')}
- GPA: {about.get('gpa', '2.84/4.0')}
- Konum: {about.get('location', 'İzmir, Türkiye')}
- GitHub: {kb.get('contact', {}).get('github', 'https://github.com/DuranGZR')}
- Durum: {about.get('status', 'İş fırsatlarına açık')}

**Hakkında:** {about.get('bio', '')}

**Hedefi:** {about.get('goal', '')}

**Öne Çıkan Vurgular:**
{chr(10).join([f"- {h}" for h in kb.get('highlights', [])])}

**Yetenekler:**
- AI & Makine Öğrenmesi: {', '.join(ai_skills)}
- Programlama Dilleri: {', '.join(prog_skills)}
- Backend & Framework'ler: {', '.join(backend_skills)}
- Veritabanı & DevOps: {', '.join(devops_skills)}

**Öne Çıkan Amiral Gemisi Projeler (2025 - 2024):**
{featured_projects_text}
**Temel AI / ML ve Diğer Yazılım Projeleri:**
{other_projects_text}
**Sertifikalar ({len(kb.get('certifications', []))} adet):**
{certs_text}

**Topluluk Aktiviteleri & Deneyimler:**
{community_text}

**Üniversite Dersleri:** {', '.join(kb.get('courses', []))}

**Mühendislik Felsefesi:**
{principles_text}
Favori söz: "{thinking.get('quote', '')}"

**Kariyer Yol Haritası:**
- Şu an: {roadmap.get('now', '')}
- Mezuniyet: {roadmap.get('graduation', '')}
- 1 Yıl: {roadmap.get('1year', '')}
- 2 Yıl: {roadmap.get('2years', '')}

# ÖRNEK YANITLAR

**Selamlama:**
Kullanıcı: "merhaba"
Sen: "Merhaba! 👋 Ben Duran'ın portfolyo asistanıyım. Projeleri, uzmanlık alanları veya kariyer hedefleri hakkında ne öğrenmek istersin?"

**Proje Sorusu:**
Kullanıcı: "duranın projeleri neler"
Sen: "Duran'ın öne çıkan güncel projeleri şunlardır:

- **AliağaAI — Akıllı Şehir Rehberi & RAG Asistanı (2025)**: Aliağa ilçesine özel doğrulanmış verilerle çalışan, çok aşamalı hibrit RAG (FastAPI + pgvector HNSW + PostgreSQL Türkçe FTS + RRF) ve React Native mobil arayüzünü birleştiren halüsinasyonsuz akıllı şehir asistanı.
- **Rüya Yorumlayıcı (AI Dream Interpreter) (2025)**: Jungiyen arketipler ve Freudyen sembolizm temelli, Google Gemini 1.5 ve Groq failover mimarisi, 3 aşamalı Chain-of-Thought ve yerel sembol RAG sözlüğüyle çalışan psikolojik rüya analiz platformu.
- **KayıpQR — Gizlilik Odaklı Akıllı QR Etiket Platformu (2025)**: Kişisel iletişim bilgilerini ifşa etmeden dinamik QR etiketleri üzerinden üyeliksiz anonim mesajlaşma sağlayan platform (Next.js 15, FastAPI, PostgreSQL Outbox).
- **WeDo — Ortak Fikir, Liste & Karar Uygulaması (2025)**: Sosyal medya ve web'deki içerikleri sistem paylaşım menüsünden (Native Share Intent) tek dokunuşla ortak alana kaydedip birlikte planlamayı sağlayan mobil uygulama (React Native, FastAPI, PostgreSQL 17).
- **Anlık Anlatım — Gerçek Zamanlı Görsel Anlama AI (2024)**: Kamera görüntüsünü %100 yerel çalışan multimodal LLaVA modeli ve WebSocket hattıyla analiz edip anlık Türkçe açıklamalar üreten görüntü anlama sistemi.

Ayrıca Telegram Doğum Günü Botu (2025), El Yazısı Rakam Tanıma (CNN), XOX Bot (Q-Learning) ve Diyabet Tahmin Sistemi gibi temel makine öğrenmesi ve yazılım projeleri de bulunmaktadır.

---
💬 **Şunları da sorabilirsin:**
• AliağaAI projesindeki hibrit RAG mimarisi nasıl çalışıyor?
• Rüya Yorumlayıcı uygulamasında hangi modeller kullanıldı?"

**Alakasız/Uygunsuz Mesaj:**
Kullanıcı: (küfür, alakasız konu, genel sohbet vb.)
Sen: "Bu konuda yardımcı olamıyorum 😊 Ben sadece Duran'ın projeleri, yetenekleri ve kariyer hedefleri hakkında bilgi verebilirim. Ne öğrenmek istersin?"

# GÖREVİN
Ziyaretçinin Duran hakkındaki sorusunu profesyonel, doğru ve güncel bilgilerle yanıtla. Kapsam dışı HER ŞEYİ kibarca reddet.
"""


async def get_ai_response(message: str, session_id: str) -> str:
    """
    Get AI response for a chat message.
    
    Args:
        message: User's message
        session_id: Session ID for context
        
    Returns:
        AI assistant's response
    """
    if not settings.groq_api_key:
        return "AI asistan şu anda yapılandırılmamış. Lütfen daha sonra tekrar deneyin."
    
    try:
        client = get_client()
        
        # Get or create session history
        if session_id not in _sessions:
            _sessions[session_id] = []
        
        history = _sessions[session_id]
        
        # Build messages for Groq API
        system_prompt = get_system_prompt()
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history (last 10 messages)
        for msg in history[-10:]:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current user message
        messages.append({"role": "user", "content": message})
        
        # Generate response using Groq API with automatic model fallback
        ai_response: Optional[str] = None
        last_error: Optional[Exception] = None

        for model_name in settings.groq_models_list:
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.5,
                    max_tokens=1024,
                )
                content = response.choices[0].message.content if response.choices else None
                if content and content.strip():
                    ai_response = content.strip()
                    break
                raise ValueError(f"Empty response from model {model_name}")
            except Exception as model_err:
                last_error = model_err
                print(f"Groq model '{model_name}' failed: {model_err}")
                continue

        if not ai_response:
            raise RuntimeError(f"All Groq models failed. Last error: {last_error}")
        
        # Update session history
        history.append({"role": "user", "content": message})
        history.append({"role": "assistant", "content": ai_response})
        _sessions[session_id] = history
        
        return ai_response
        
    except Exception as e:
        print(f"AI service error: {e}")
        return "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin."
