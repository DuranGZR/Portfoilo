"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock,
    Eye,
    EyeOff,
    Terminal,
    Save,
    LogOut,
    AlertCircle,
    Loader2,
    Monitor,
    ChevronDown,
    ChevronRight,
    Download,
    FileJson,
    RefreshCw,
    Trash2,
    Plus,
    Upload,
    Check
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
type Lang = "tr" | "en";

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const [lang, setLang] = useState<Lang>("tr");
    const [translations, setTranslations] = useState<any>({});
    const [rawJsonText, setRawJsonText] = useState("");
    const [rawJsonError, setRawJsonError] = useState("");
    const [activeTab, setActiveTab] = useState("hero");
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [saveMessage, setSaveMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem("admin_token");
        if (savedToken) {
            setToken(savedToken);
            setIsAuthenticated(true);
            fetchTranslations(savedToken, lang);
        }
    }, []);

    useEffect(() => {
        if (token) fetchTranslations(token, lang);
    }, [lang, token]);

    const fetchTranslations = async (authToken: string, language: Lang) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/translations/${language}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTranslations(data.content || {});
                setRawJsonText(JSON.stringify(data.content || {}, null, 2));
            } else if (res.status === 401) {
                handleLogout();
            }
        } catch (e) {
            console.error("Fetch translations error:", e);
        } finally {
            setLoading(false);
        }
    };

    const saveField = async (path: string, value: any) => {
        if (!token) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/translations/${lang}/field`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ path, value }),
            });
            if (!res.ok) throw new Error("Kayıt başarısız");

            // Update local state
            const keys = path.split(".");
            setTranslations((prev: any) => {
                const newData = JSON.parse(JSON.stringify(prev || {}));
                let current = newData;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
                return newData;
            });

            showMessage(`✓ '${path}' kaydedildi`);
        } catch (e: any) {
            showMessage("Hata: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const saveRawJson = async () => {
        if (!token) return;
        try {
            const parsed = JSON.parse(rawJsonText);
            setRawJsonError("");
            setSaving(true);
            const res = await fetch(`${API_URL}/translations/${lang}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(parsed),
            });
            if (!res.ok) throw new Error("Kayıt başarısız");
            setTranslations(parsed);
            showMessage("✓ Tüm JSON başarıyla kaydedildi");
        } catch (e: any) {
            setRawJsonError("Geçersiz JSON formatı: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const showMessage = (msg: string) => {
        setSaveMessage(msg);
        setTimeout(() => setSaveMessage(""), 3500);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError("");

        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                const data = await res.json();
                const authToken = data.token;
                setToken(authToken);
                localStorage.setItem("admin_token", authToken);
                setIsAuthenticated(true);
                fetchTranslations(authToken, lang);
            } else {
                setLoginError("Geçersiz admin şifresi");
            }
        } catch {
            setLoginError("Sunucuya bağlanılamadı");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        setToken(null);
        setIsAuthenticated(false);
        setPassword("");
        setTranslations({});
    };

    const handleDownloadJson = () => {
        const blob = new Blob([JSON.stringify(translations, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${lang}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleExpand = (key: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl p-8 shadow-2xl"
                >
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#819fa7] mb-4">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold font-display text-white tracking-tight">Admin CMS</h1>
                        <p className="text-xs text-white/50 mt-1.5 font-mono">
                            Portföy İçerik & Tasarım Yönetim Konsolu
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-mono text-white/60 uppercase tracking-wider">Admin Şifresi</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#819fa7]/60 pr-10 font-mono transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{loginError}</span>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loginLoading}
                            className="w-full py-3 bg-white text-black font-semibold rounded-xl text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                        >
                            {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Konsola Giriş Yap"}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    const TABS = [
        { id: "hero", label: "🏠 Hero (Giriş)" },
        { id: "about", label: "👤 Hakkımda" },
        { id: "projects", label: "🚀 Projeler" },
        { id: "skills", label: "💡 Yetenekler" },
        { id: "experience", label: "📚 Deneyim & Eğitim" },
        { id: "thinking", label: "🧠 Düşünce İlkeleri" },
        { id: "aiAssistant", label: "🤖 AI Asistan" },
        { id: "footer", label: "⚓ Alt Bilgi (Footer)" },
        { id: "navigation", label: "🧭 Menü / Nav" },
        { id: "contact", label: "📬 İletişim" },
        { id: "metadata", label: "🌐 SEO & Meta" },
        { id: "raw", label: "⚙️ Ham JSON (Tam Yedek)" },
    ];

    const sectionData = translations[activeTab] || {};

    // Single Field Editor
    const Field = ({ label, value, path, multiline = false }: { label: string; value: string; path: string; multiline?: boolean }) => {
        const [val, setVal] = useState(value || "");
        const [edited, setEdited] = useState(false);

        useEffect(() => {
            setVal(value || "");
            setEdited(false);
        }, [value]);

        return (
            <div className="space-y-1">
                <label className="text-[11px] font-mono text-white/50 uppercase tracking-wider">{label}</label>
                <div className="flex gap-2">
                    {multiline ? (
                        <textarea
                            value={val}
                            onChange={(e) => { setVal(e.target.value); setEdited(true); }}
                            rows={3}
                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#f3f5f9] focus:outline-none focus:border-[#819fa7]/60 resize-none font-sans leading-relaxed"
                        />
                    ) : (
                        <input
                            type="text"
                            value={val}
                            onChange={(e) => { setVal(e.target.value); setEdited(true); }}
                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#f3f5f9] focus:outline-none focus:border-[#819fa7]/60 font-sans"
                        />
                    )}
                    <button
                        onClick={() => { saveField(path, val); setEdited(false); }}
                        disabled={!edited || saving}
                        title="Kaydet"
                        className={`px-3.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
                            edited 
                                ? "bg-white text-black hover:bg-white/90 shadow-md font-medium" 
                                : "bg-white/5 text-white/20 cursor-not-allowed"
                        }`}
                    >
                        {saving && edited ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        );
    };

    // List of Strings Editor (for traits, tags, etc.)
    const ListEditor = ({ label, items, path }: { label: string; items: string[]; path: string }) => {
        const [list, setList] = useState<string[]>(Array.isArray(items) ? items : []);
        const [edited, setEdited] = useState(false);

        useEffect(() => {
            setList(Array.isArray(items) ? items : []);
            setEdited(false);
        }, [items]);

        const handleChange = (index: number, val: string) => {
            const next = [...list];
            next[index] = val;
            setList(next);
            setEdited(true);
        };

        const handleAdd = () => {
            setList([...list, ""]);
            setEdited(true);
        };

        const handleRemove = (index: number) => {
            setList(list.filter((_, i) => i !== index));
            setEdited(true);
        };

        return (
            <div className="space-y-2.5 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-white/60 uppercase tracking-wider font-semibold">{label}</label>
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="text-xs text-[#819fa7] hover:text-white font-medium transition-colors flex items-center gap-1 font-mono"
                    >
                        <Plus className="w-3.5 h-3.5" /> Yeni Madde Ekle
                    </button>
                </div>
                <div className="space-y-2">
                    {list.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <span className="text-xs font-mono text-white/30 w-5 text-right shrink-0">{idx + 1}.</span>
                            <input
                                type="text"
                                value={item}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#819fa7]/60 font-sans"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(idx)}
                                className="text-white/30 hover:text-red-400 p-1.5 transition-colors shrink-0"
                                title="Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {list.length === 0 && (
                        <p className="text-xs text-white/30 italic py-2">Henüz madde eklenmemiş.</p>
                    )}
                </div>
                <div className="pt-2 flex justify-end">
                    <button
                        onClick={() => { saveField(path, list.filter(s => s.trim().length > 0)); setEdited(false); }}
                        disabled={!edited || saving}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            edited 
                                ? "bg-white text-black hover:bg-white/90 shadow-md" 
                                : "bg-white/5 text-white/20 cursor-not-allowed"
                        }`}
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Listeyi Kaydet
                    </button>
                </div>
            </div>
        );
    };

    // Image Upload Field with preview and upload trigger
    const ImageUploadField = ({ label, value, path }: { label: string; value: string; path: string }) => {
        const [val, setVal] = useState(value || "");
        const [uploading, setUploading] = useState(false);
        const [uploadErr, setUploadErr] = useState("");
        const fileInputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            setVal(value || "");
        }, [value]);

        const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploading(true);
            setUploadErr("");
            try {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                if (data.success && data.url) {
                    setVal(data.url);
                    saveField(path, data.url);
                    showMessage("✓ Fotoğraf yüklendi ve kaydedildi");
                } else {
                    setUploadErr(data.message || "Yükleme başarısız");
                }
            } catch (err: any) {
                setUploadErr("Yükleme hatası: " + err.message);
            } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };

        return (
            <div className="space-y-2">
                <label className="text-[11px] font-mono text-white/50 uppercase tracking-wider">{label}</label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    {/* Preview thumbnail */}
                    {val && (
                        <div className="w-20 h-12 rounded-lg overflow-hidden border border-white/10 bg-[#141414] shrink-0 relative">
                            <img src={val} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1 flex gap-2 w-full">
                        <input
                            type="text"
                            value={val}
                            onChange={(e) => setVal(e.target.value)}
                            onBlur={() => { if (val !== value) saveField(path, val); }}
                            placeholder="/projects/... veya https://..."
                            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#819fa7]/60 font-sans"
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                            title="Bilgisayardan fotoğraf yükle"
                        >
                            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            Dosya Seç
                        </button>
                    </div>
                </div>
                {uploadErr && <p className="text-xs text-red-400">{uploadErr}</p>}
            </div>
        );
    };

    // Rich Project Item Accordion Editor
    const ProjectItemEditor = ({ itemKey, item, basePath }: { itemKey: string; item: any; basePath: string }) => {
        const isExpanded = expandedItems.has(itemKey);
        return (
            <div className="bg-white/[0.02] rounded-2xl border border-white/10 overflow-hidden">
                <button
                    onClick={() => toggleExpand(itemKey)}
                    className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {item.image && (
                            <img src={item.image} alt="" className="w-10 h-6 object-cover rounded border border-white/10 shrink-0 bg-[#161616]" />
                        )}
                        <div>
                            <span className="font-semibold text-white text-sm block">{item.title || itemKey}</span>
                            <span className="text-xs text-white/40 block">{item.category || itemKey} • {item.period || '2024'}</span>
                        </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/50" />}
                </button>
                {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                        <Field label="Proje Başlığı" value={item.title || ""} path={`${basePath}.${itemKey}.title`} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Kategori (örn: AI / RAG / Full-Stack)" value={item.category || ""} path={`${basePath}.${itemKey}.category`} />
                            <Field label="Dönem (örn: 2024)" value={item.period || ""} path={`${basePath}.${itemKey}.period`} />
                        </div>
                        <Field label="Galeri Özeti (Kısa Problem–Çözüm)" value={item.gallerySummary || ""} path={`${basePath}.${itemKey}.gallerySummary`} multiline />
                        <Field label="Proje Tanıtımı (Detay Sayfası)" value={item.tagline || ""} path={`${basePath}.${itemKey}.tagline`} multiline />
                        <Field label="Detaylı Genel Bakış (Proje Sayfasında Görünen Metin)" value={item.overview || ""} path={`${basePath}.${itemKey}.overview`} multiline />
                        
                        <ImageUploadField label="Proje Görseli (Dosya Seçip Yükleyebilirsiniz)" value={item.image || ""} path={`${basePath}.${itemKey}.image`} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="GitHub Repo URL" value={item.github || ""} path={`${basePath}.${itemKey}.github`} />
                            <Field label="Canlı Demo URL (Varsa)" value={item.demo || ""} path={`${basePath}.${itemKey}.demo`} />
                        </div>

                        {item.tags && Array.isArray(item.tags) && (
                            <ListEditor
                                label="Teknoloji Etiketleri (FastAPI, React Native...)"
                                items={item.tags}
                                path={`${basePath}.${itemKey}.tags`}
                            />
                        )}

                        {item.features && Array.isArray(item.features) && (
                            <ListEditor
                                label="Öne Çıkan Özellikler (Maddeler)"
                                items={item.features}
                                path={`${basePath}.${itemKey}.features`}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    };

    // 4 Columns Tech Stack Editor
    const TechColumnsEditor = ({ columns, basePath }: { columns: { name: string; icon: string }[][]; basePath: string }) => {
        const [cols, setCols] = useState(columns || []);
        const [edited, setEdited] = useState(false);

        useEffect(() => {
            setCols(columns || []);
            setEdited(false);
        }, [columns]);

        const handleNameChange = (colIdx: number, itemIdx: number, val: string) => {
            const next = JSON.parse(JSON.stringify(cols));
            next[colIdx][itemIdx].name = val;
            setCols(next);
            setEdited(true);
        };

        const handleIconChange = (colIdx: number, itemIdx: number, val: string) => {
            const next = JSON.parse(JSON.stringify(cols));
            next[colIdx][itemIdx].icon = val;
            setCols(next);
            setEdited(true);
        };

        const handleAddItem = (colIdx: number) => {
            const next = JSON.parse(JSON.stringify(cols));
            if (!next[colIdx]) next[colIdx] = [];
            next[colIdx].push({ name: "Yeni Teknoloji", icon: "/images/skills/python.svg" });
            setCols(next);
            setEdited(true);
        };

        const handleRemoveItem = (colIdx: number, itemIdx: number) => {
            const next = JSON.parse(JSON.stringify(cols));
            next[colIdx].splice(itemIdx, 1);
            setCols(next);
            setEdited(true);
        };

        const handleSaveAll = () => {
            saveField(basePath, cols);
            setEdited(false);
        };

        return (
            <div className="space-y-4 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-[#819fa7]">
                            🎯 4 Dikey Kolon Teknoloji İkonları (Richard Miculob Stili)
                        </h3>
                        <p className="text-xs text-white/40 mt-0.5">
                            Sol sütundaki 4 dikey teknoloji ikon grubunu buradan düzenleyebilir, yeni teknoloji ekleyip silebilirsin.
                        </p>
                    </div>
                    {edited && (
                        <button
                            type="button"
                            onClick={handleSaveAll}
                            className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
                        >
                            <Save className="w-3.5 h-3.5" /> Kolonları Kaydet
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cols.map((column, colIdx) => (
                        <div key={colIdx} className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/10 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                <span className="font-mono text-xs font-semibold text-[#819fa7]">Kolon 0{colIdx + 1}</span>
                                <button
                                    type="button"
                                    onClick={() => handleAddItem(colIdx)}
                                    className="text-[11px] font-mono text-[#819fa7] hover:text-white flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Ekle
                                </button>
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                                {column.map((tech, itemIdx) => (
                                    <div key={itemIdx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1">
                                                <img src={tech.icon} alt="" className="w-5 h-5 object-contain shrink-0" onError={(e: any) => { e.target.style.display = 'none'; }} />
                                                <input
                                                    type="text"
                                                    value={tech.name}
                                                    onChange={(e) => handleNameChange(colIdx, itemIdx, e.target.value)}
                                                    placeholder="Teknoloji Adı"
                                                    className="w-full bg-transparent text-xs text-white font-medium focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(colIdx, itemIdx)}
                                                className="text-white/30 hover:text-red-400 p-1 transition-colors shrink-0"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={tech.icon}
                                            onChange={(e) => handleIconChange(colIdx, itemIdx, e.target.value)}
                                            placeholder="/images/skills/...svg"
                                            className="w-full bg-white/5 border border-white/5 rounded px-2 py-1 text-[10.5px] font-mono text-white/50 focus:outline-none focus:text-white"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (activeTab === "raw") {
            return (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-white/50">
                            Ham JSON verisini doğrudan düzenleyebilir veya tam yedek alabilirsiniz.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDownloadJson}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" /> İndir ({lang}.json)
                            </button>
                        </div>
                    </div>
                    {rawJsonError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl">
                            {rawJsonError}
                        </div>
                    )}
                    <textarea
                        value={rawJsonText}
                        onChange={(e) => setRawJsonText(e.target.value)}
                        rows={24}
                        className="w-full bg-[#0d0d0e] border border-white/10 rounded-2xl p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:border-[#819fa7]/50 resize-y leading-relaxed"
                        spellCheck={false}
                    />
                    <button
                        onClick={saveRawJson}
                        disabled={saving}
                        className="px-6 py-2.5 bg-white text-black hover:bg-white/90 disabled:opacity-50 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 text-black" />}
                        Tüm JSON'u Kaydet
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case "hero":
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center gap-2">
                                🏠 Hero Başlık ve Metinleri
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Selamlama (Greeting)" value={sectionData.greeting || ""} path="hero.greeting" />
                                <Field label="İsim (Name)" value={sectionData.name || ""} path="hero.name" />
                            </div>
                            <Field label="Ünvan (Title - örn: Yapay Zeka Mühendisi)" value={sectionData.title || ""} path="hero.title" />
                            <Field label="Alt Başlık / Tanıtım Metni (Subtitle)" value={sectionData.subtitle || ""} path="hero.subtitle" multiline />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Konum (Location - örn: Türkiye)" value={sectionData.location || ""} path="hero.location" />
                                <Field label="Durum Rozeti (Status Badge - örn: Yeni Fırsatlara Açık)" value={sectionData.status || ""} path="hero.status" />
                            </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center gap-2">
                                🔘 Çağrı Butonları (Call To Action)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Birincil Buton (Primary CTA)" value={sectionData.cta?.primary || ""} path="hero.cta.primary" />
                                <Field label="İkincil Buton (Secondary CTA)" value={sectionData.cta?.secondary || ""} path="hero.cta.secondary" />
                            </div>
                            <Field label="Aşağı Kaydırma İpucu (Scroll Hint)" value={sectionData.scrollHint || ""} path="hero.scrollHint" />
                        </div>
                    </div>
                );

            case "about":
                return (
                    <div className="space-y-6">
                        {/* 1. Üst Başlık & Profil */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center gap-2">
                                📌 Üst Başlık & Profil
                            </h3>
                            <Field label="Rozet (Üst Etiket - örn: HAKKIMDA / ABOUT ME)" value={sectionData.badge || ""} path="about.badge" />
                            <Field label="Ana Başlık (Headline)" value={sectionData.headline || ""} path="about.headline" />
                            <Field label="Profil İsmi" value={sectionData.name || ""} path="about.name" />
                        </div>

                        {/* 2. Sayaçlar / İstatistikler */}
                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center gap-2">
                                📊 İstatistikler / Sayaçlar (Mavi Tik Yanındaki Rakamlar)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Projeler Etiketi" value={sectionData.stats?.projectsLabel || ""} path="about.stats.projectsLabel" />
                                <Field label="Projeler Değeri (örn: 20+)" value={sectionData.stats?.projectsValue || ""} path="about.stats.projectsValue" />
                                <Field label="Sertifikalar Etiketi" value={sectionData.stats?.certsLabel || ""} path="about.stats.certsLabel" />
                                <Field label="Listelenen Sertifika Sayısı (örn: 6)" value={sectionData.stats?.certsValue || ""} path="about.stats.certsValue" />
                                <Field label="Mezuniyet / Bölüm Etiketi" value={sectionData.stats?.gradLabel || ""} path="about.stats.gradLabel" />
                                <Field label="Mezuniyet Değeri (örn: 2027)" value={sectionData.stats?.gradValue || ""} path="about.stats.gradValue" />
                            </div>
                        </div>

                        {/* 3. Biyografi & CV */}
                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center gap-2">
                                📝 Biyografi & Özgeçmiş (CV) Linki
                            </h3>
                            <Field label="Hakkımda Biyografi (Bio Paragrafı)" value={sectionData.bio || ""} path="about.bio" multiline />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="CV Çağrı Metni (CTA)" value={sectionData.resumeCta || ""} path="about.resumeCta" />
                                <Field label="CV Link Metni" value={sectionData.resumeLink || ""} path="about.resumeLink" />
                            </div>
                        </div>

                        {/* 4. Şu Anda (Currently) */}
                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center gap-2">
                                ⚡ Şu Anda (Currently) 3'lü Şerit
                            </h3>
                            <Field label="Bölüm Başlığı (örn: ŞU ANDA / CURRENTLY)" value={sectionData.currently?.title || ""} path="about.currently.title" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Geliştiriyor - Başlık" value={sectionData.currently?.buildingLabel || ""} path="about.currently.buildingLabel" />
                                <Field label="Geliştiriyor - Açıklama" value={sectionData.currently?.buildingDesc || ""} path="about.currently.buildingDesc" />
                                <Field label="Keşfediyor - Başlık" value={sectionData.currently?.exploringLabel || ""} path="about.currently.exploringLabel" />
                                <Field label="Keşfediyor - Açıklama" value={sectionData.currently?.exploringDesc || ""} path="about.currently.exploringDesc" />
                                <Field label="Öğreniyor - Başlık" value={sectionData.currently?.learningLabel || ""} path="about.currently.learningLabel" />
                                <Field label="Öğreniyor - Açıklama" value={sectionData.currently?.learningDesc || ""} path="about.currently.learningDesc" />
                            </div>
                        </div>

                        {/* 5. 3D Dönen Özellik Kartları (Traits) */}
                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center gap-2">
                                🎴 Proje Kararı Kartları
                            </h3>
                            <Field label="Kart Üst Etiketi (örn: ÖZELLİK / TRAIT)" value={sectionData.traits?.label || ""} path="about.traits.label" />
                            <Field label="Sonraki Kart Erişilebilir Adı" value={sectionData.traits?.next || ""} path="about.traits.next" />
                            <ListEditor
                                label="Proje Kararları (Tıklandıkça değişir)"
                                items={sectionData.traits?.items || []}
                                path="about.traits.items"
                            />
                        </div>
                    </div>
                );

            case "projects":
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[#819fa7]">📌 Genel Galeri Başlıkları</h3>
                            <Field label="Rozet (Üst Etiket - örn: ÖNE ÇIKAN ÇALIŞMALAR)" value={sectionData.badge || ""} path="projects.badge" />
                            <Field label="Galeri Başlığı (örn: Proje Galerisi / Work Gallery)" value={sectionData.title || ""} path="projects.title" />
                            <Field label="Alt Başlık / Açıklama" value={sectionData.subtitle || ""} path="projects.subtitle" multiline />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Üst Buton Metni (örn: Tüm Projeleri Gör)" value={sectionData.viewMore || ""} path="projects.viewMore" />
                                <Field label="Proje Buton Metni (örn: Projeyi İncele)" value={sectionData.viewProject || ""} path="projects.viewProject" />
                            </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7]">📦 Öne Çıkan Projeler (Kartlar ve Detay Sayfaları)</h3>
                            <p className="text-xs text-white/40">
                                Her bir projenin başlığını, açıklamasını, etiketlerini ve görselini buradan düzenleyebilir; doğrudan bilgisayarından yeni fotoğraf yükleyebilirsin.
                            </p>
                            {sectionData.items && Object.entries(sectionData.items).map(([key, item]: [string, any]) => (
                                <ProjectItemEditor
                                    key={key}
                                    itemKey={key}
                                    item={item}
                                    basePath="projects.items"
                                />
                            ))}
                        </div>
                    </div>
                );

            case "skills":
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[#819fa7]">📌 Genel Başlıklar (Richard Miculob Bento Grid)</h3>
                            <Field label="Rozet (Üst Etiket - örn: YETENEKLER & UZMANLIKLAR)" value={sectionData.badge || ""} path="skills.badge" />
                            <Field label="Ana Başlık (örn: Neler Yapabilirim? / What I Can Do)" value={sectionData.title || ""} path="skills.title" />
                            <Field label="Alt Başlık / Açıklama" value={sectionData.subtitle || ""} path="skills.subtitle" multiline />
                        </div>

                        {/* Bento Card 1 */}
                        <div className="space-y-4 pt-3 border-t border-white/5 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center justify-between">
                                <span>🧠 Bento Kart 01: AI, Bilgisayarlı Görü & Derin Öğrenme</span>
                                <span className="font-mono text-xs text-white/40">01</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Kart Numarası" value={sectionData.bento?.card1?.number || "01"} path="skills.bento.card1.number" />
                                <Field label="Kategori Etiketi (Sağ Üst)" value={sectionData.bento?.card1?.category || ""} path="skills.bento.card1.category" />
                            </div>
                            <ImageUploadField
                                label="Kart 01 Görseli / GIF (Dosya Seçin veya Yol Girin)"
                                value={sectionData.bento?.card1?.image || sectionData.bento?.card1?.gif || "/images/gif/rag-flow-dark.gif"}
                                path="skills.bento.card1.image"
                            />
                            {[
                                ['lightImage', 'Açık Tema GIF'],
                                ['poster', 'Koyu Tema Sabit Görsel (Azaltılmış Hareket)'],
                                ['lightPoster', 'Açık Tema Sabit Görsel (Azaltılmış Hareket)'],
                            ].map(([field, label]) => (
                                <ImageUploadField key={field} label={label} value={sectionData.bento?.card1?.[field] || ""} path={`skills.bento.card1.${field}`} />
                            ))}
                            <Field label="Açıklama Paragrafı" value={sectionData.bento?.card1?.description || ""} path="skills.bento.card1.description" multiline />
                            <ListEditor
                                label="Yetenek Etiketleri (Python, TensorFlow, PyTorch...)"
                                items={sectionData.bento?.card1?.tags || []}
                                path="skills.bento.card1.tags"
                            />
                        </div>

                        {/* Bento Card 2 */}
                        <div className="space-y-4 pt-3 border-t border-white/5 bg-white/[0.02] p-4 rounded-2xl border border-white/10">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center justify-between">
                                <span>⚡ Bento Kart 02: Backend, Sistemler & Programlama</span>
                                <span className="font-mono text-xs text-white/40">02</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Kart Numarası" value={sectionData.bento?.card2?.number || "02"} path="skills.bento.card2.number" />
                                <Field label="Kategori Etiketi (Sağ Üst)" value={sectionData.bento?.card2?.category || ""} path="skills.bento.card2.category" />
                            </div>
                            <ImageUploadField
                                label="Kart 02 Görseli / GIF (Dosya Seçin veya Yol Girin)"
                                value={sectionData.bento?.card2?.image || sectionData.bento?.card2?.gif || "/images/gif/backend-flow-dark.gif"}
                                path="skills.bento.card2.image"
                            />
                            {[
                                ['lightImage', 'Açık Tema GIF'],
                                ['poster', 'Koyu Tema Sabit Görsel (Azaltılmış Hareket)'],
                                ['lightPoster', 'Açık Tema Sabit Görsel (Azaltılmış Hareket)'],
                            ].map(([field, label]) => (
                                <ImageUploadField key={field} label={label} value={sectionData.bento?.card2?.[field] || ""} path={`skills.bento.card2.${field}`} />
                            ))}
                            <Field label="Açıklama Paragrafı" value={sectionData.bento?.card2?.description || ""} path="skills.bento.card2.description" multiline />
                            <ListEditor
                                label="Yetenek Etiketleri (FastAPI, Java, C#, Docker...)"
                                items={sectionData.bento?.card2?.tags || []}
                                path="skills.bento.card2.tags"
                            />
                        </div>

                        {/* 4 Dikey Kolon Teknoloji İkonları */}
                        <TechColumnsEditor
                            columns={sectionData.techColumns || []}
                            basePath="skills.techColumns"
                        />
                    </div>
                );

            case "experience":
                return (
                    <div className="space-y-6">
                        {/* Başlıklar & Sekmeler */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[#819fa7]">📌 Genel Bölüm Başlıkları & Sekmeler</h3>
                            <Field label="Rozet (Badge)" value={sectionData.badge || ""} path="experience.badge" />
                            <Field label="Başlık" value={sectionData.title || ""} path="experience.title" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                <Field label="1. Sekme (Eğitim)" value={sectionData.categories?.education || ""} path="experience.categories.education" />
                                <Field label="2. Sekme (Topluluk)" value={sectionData.categories?.community || ""} path="experience.categories.community" />
                                <Field label="3. Sekme (Sertifikalar)" value={sectionData.categories?.certifications || ""} path="experience.categories.certifications" />
                            </div>
                        </div>

                        {/* Öne Çıkan Mühendislik Dersleri */}
                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7] flex items-center justify-between">
                                <span>🎓 Öne Çıkan 10 Mühendislik Dersi (Eğitim Sekmesi Pill'leri)</span>
                            </h3>
                            <Field label="Dersler Başlığı" value={sectionData.coursesTitle || ""} path="experience.coursesTitle" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                {sectionData.courses && Object.entries(sectionData.courses).map(([courseKey, courseItem]: [string, any]) => (
                                    <div key={courseKey} className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
                                        <Field 
                                            label={`Ders: ${courseKey}`} 
                                            value={courseItem.title || ""} 
                                            path={`experience.courses.${courseKey}.title`} 
                                        />
                                        <ListEditor
                                            label="Ders Konuları (Modalda Görünen Maddeler)"
                                            items={courseItem.topics || []}
                                            path={`experience.courses.${courseKey}.topics`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Geçmiş Öğeleri (Derece, Sertifikalar, Topluluk) */}
                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7]">
                                📜 Geçmiş Öğeleri (Dereceler, Sertifikalar, Topluluk Görevleri)
                            </h3>
                            <div className="space-y-3">
                                {sectionData.items && Object.entries(sectionData.items).map(([key, item]: [string, any]) => (
                                    <div key={key} className="bg-white/[0.02] rounded-xl border border-white/10 p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs text-[#819fa7] font-semibold">{key}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <Field label="Başlık" value={item.title || ""} path={`experience.items.${key}.title`} />
                                            <Field label="Kurum / Organizasyon" value={item.organization || ""} path={`experience.items.${key}.organization`} />
                                            <Field label="Dönem (örn: 2024)" value={item.period || ""} path={`experience.items.${key}.period`} />
                                        </div>
                                        <Field label="Açıklama" value={item.description || ""} path={`experience.items.${key}.description`} multiline />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "thinking":
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[#819fa7]">📌 Düşünce İlkeleri Başlıkları</h3>
                            <Field label="Rozet (Badge)" value={sectionData.badge || ""} path="thinking.badge" />
                            <Field label="Ana Başlık" value={sectionData.title || ""} path="thinking.title" />
                            <Field label="Alt Başlık" value={sectionData.subtitle || ""} path="thinking.subtitle" multiline />
                        </div>

                        <div className="space-y-4 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7]">
                                💡 6 Temel Mühendislik İlkesi (01 — 06)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sectionData.principles && Object.entries(sectionData.principles).map(([key, item]: [string, any], idx) => (
                                    <div key={key} className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-semibold text-[#819fa7]">0{idx + 1} // {key}</span>
                                        </div>
                                        <Field label="İlke Başlığı" value={item.title || ""} path={`thinking.principles.${key}.title`} />
                                        <Field label="İlke Açıklaması" value={item.description || ""} path={`thinking.principles.${key}.description`} multiline />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "aiAssistant":
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[#819fa7]">📌 AI Asistan Bölüm Başlıkları</h3>
                            <Field label="Rozet (Badge)" value={sectionData.badge || ""} path="aiAssistant.badge" />
                            <Field label="Ana Başlık" value={sectionData.title || ""} path="aiAssistant.title" />
                            <Field label="Alt Başlık" value={sectionData.subtitle || ""} path="aiAssistant.subtitle" multiline />
                        </div>

                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7]">💬 Konsol Başlıkları</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Konsol Başlığı" value={sectionData.chatHeader?.title || ""} path="aiAssistant.chatHeader.title" />
                                <Field label="Destekleyen Altyapı Metni" value={sectionData.chatHeader?.poweredBy || ""} path="aiAssistant.chatHeader.poweredBy" />
                            </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-[#819fa7]">⚡ 3 Temel Özellik (01, 02, 03 Şeridi)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
                                    <span className="font-mono text-xs font-semibold text-[#819fa7]">01 // Gerçek Zamanlı</span>
                                    <Field label="Başlık" value={sectionData.features?.realtime?.title || ""} path="aiAssistant.features.realtime.title" />
                                    <Field label="Açıklama" value={sectionData.features?.realtime?.desc || ""} path="aiAssistant.features.realtime.desc" multiline />
                                </div>
                                <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
                                    <span className="font-mono text-xs font-semibold text-[#819fa7]">02 // Bağlam Farkında</span>
                                    <Field label="Başlık" value={sectionData.features?.context?.title || ""} path="aiAssistant.features.context.title" />
                                    <Field label="Açıklama" value={sectionData.features?.context?.desc || ""} path="aiAssistant.features.context.desc" multiline />
                                </div>
                                <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
                                    <span className="font-mono text-xs font-semibold text-[#819fa7]">03 // Yeni projelerle güncelleniyor</span>
                                    <Field label="Başlık" value={sectionData.features?.learning?.title || ""} path="aiAssistant.features.learning.title" />
                                    <Field label="Açıklama" value={sectionData.features?.learning?.desc || ""} path="aiAssistant.features.learning.desc" multiline />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "footer":
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-[#819fa7]">⚓ Alt Bilgi (Footer) Alanları</h3>
                            <Field label="Slogan / Tanıtım Metni (Tagline)" value={sectionData.tagline || ""} path="footer.tagline" multiline />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Hızlı Bağlantılar Başlığı" value={sectionData.quickLinks || ""} path="footer.quickLinks" />
                                <Field label="İletişime Geç Başlığı" value={sectionData.getInTouch || ""} path="footer.getInTouch" />
                            </div>
                            <Field label="İletişime Geç Açıklaması" value={sectionData.getInTouchDesc || ""} path="footer.getInTouchDesc" multiline />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Field label="Mesaj Gönder Butonu" value={sectionData.sendMessage || ""} path="footer.sendMessage" />
                                <Field label="İnşa Edildi Metni (Built With)" value={sectionData.builtWith || ""} path="footer.builtWith" />
                            </div>
                        </div>
                    </div>
                );

            case "navigation":
                return (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#819fa7]">🧭 Menü Başlıkları</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Hakkımda" value={sectionData.about || ""} path="navigation.about" />
                            <Field label="Projeler" value={sectionData.projects || ""} path="navigation.projects" />
                            <Field label="Yetenekler" value={sectionData.skills || ""} path="navigation.skills" />
                            <Field label="Deneyim" value={sectionData.experience || ""} path="navigation.experience" />
                            <Field label="Mühendislik Düşüncesi" value={sectionData.thinking || ""} path="navigation.thinking" />
                            <Field label="3D CV" value={sectionData["3dresume"] || ""} path="navigation.3dresume" />
                        </div>
                    </div>
                );

            case "contact":
                return (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#819fa7]">📬 İletişim Formu Alanları</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Başlık" value={sectionData.title || ""} path="contact.title" />
                            <Field label="İsim Etiketi" value={sectionData.name || ""} path="contact.name" />
                            <Field label="E-posta Etiketi" value={sectionData.email || ""} path="contact.email" />
                            <Field label="Konu Etiketi" value={sectionData.subject || ""} path="contact.subject" />
                        </div>
                        <Field label="Mesaj Etiketi" value={sectionData.message || ""} path="contact.message" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Field label="Gönder Butonu" value={sectionData.send || ""} path="contact.send" />
                            <Field label="Gönderiliyor Metni" value={sectionData.sending || ""} path="contact.sending" />
                            <Field label="Başarı Mesajı" value={sectionData.success || ""} path="contact.success" />
                        </div>
                    </div>
                );

            case "metadata":
                return (
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-[#819fa7]">🌐 SEO Meta Etiketleri</h3>
                        <Field label="Site Başlığı (Tarayıcı Sekmesi / Browser Title)" value={translations.metadata?.title || ""} path="metadata.title" />
                        <Field label="Site Açıklaması (Google Arama Sonucu / Meta Description)" value={translations.metadata?.description || ""} path="metadata.description" multiline />
                    </div>
                );

            default:
                return (
                    <div className="space-y-3">
                        <p className="text-xs text-white/50 mb-4">Bu bölümün tüm alanları:</p>
                        {Object.entries(sectionData).map(([k, v]: [string, any]) => {
                            if (typeof v === "string") {
                                return <Field key={k} label={k} value={v} path={`${activeTab}.${k}`} />;
                            }
                            return null;
                        })}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-base font-bold font-display text-white flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-[#819fa7]" />
                            <span>Admin CMS</span>
                        </h1>
                        <div className="flex bg-white/[0.03] rounded-xl p-1 border border-white/10">
                            <button
                                onClick={() => setLang("tr")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    lang === "tr" 
                                        ? "bg-white text-black shadow-sm" 
                                        : "text-white/50 hover:text-white"
                                }`}
                            >
                                🇹🇷 Türkçe
                            </button>
                            <button
                                onClick={() => setLang("en")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                    lang === "en" 
                                        ? "bg-white text-black shadow-sm" 
                                        : "text-white/50 hover:text-white"
                                }`}
                            >
                                🇬🇧 English
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <AnimatePresence>
                            {saveMessage && (
                                <motion.span
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-white text-xs font-mono bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl shadow-sm"
                                >
                                    {saveMessage}
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <button
                            onClick={() => fetchTranslations(token || "", lang)}
                            title="Yenile"
                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 text-xs transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDownloadJson}
                            title="JSON İndir"
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 text-xs font-semibold transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">JSON İndir</span>
                        </button>
                        <a
                            href={`/${lang}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-white text-xs font-semibold transition-all"
                        >
                            <Monitor className="w-4 h-4 text-[#819fa7]" />
                            <span className="hidden sm:inline">Siteyi Gör ↗</span>
                        </a>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-2 text-red-400/80 hover:text-red-400 text-xs font-medium transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Çıkış</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
                {/* Tabs Sidebar */}
                <nav className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-24 space-y-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs font-medium transition-all ${
                                    activeTab === tab.id
                                        ? "bg-white/10 text-white border border-white/15 shadow-sm font-semibold"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-[#819fa7]" />}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Content Editor */}
                <main className="flex-1 min-w-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <Loader2 className="w-8 h-8 text-[#819fa7] animate-spin" />
                            <p className="text-xs text-white/40 font-mono">İçerikler yükleniyor...</p>
                        </div>
                    ) : (
                        <motion.div
                            key={`${lang}-${activeTab}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#111113] rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                <h2 className="text-base font-bold text-white flex items-center gap-2.5">
                                    <span>{TABS.find(t => t.id === activeTab)?.label}</span>
                                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-white/10 text-[#819fa7] border border-white/10 font-mono">
                                        {lang.toUpperCase()}
                                    </span>
                                </h2>
                                <span className="text-[11px] font-mono text-white/40 hidden sm:inline">
                                    Alanı düzenleyip sağdaki butona bastığında anında kaydedilir.
                                </span>
                            </div>
                            {renderContent()}
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    );
}
