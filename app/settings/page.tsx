"use client";

import React, { useState, useEffect } from 'react';
import { 
  Save, User, MapPin, Globe, FileText, Loader2, 
  Settings, Bell, Shield, Palette, Trash2, Moon, Sun, Smartphone 
} from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'appearance'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Profil Form Verileri
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: ''
  });

  // Tema Ayarı (Şimdilik Local State, ileride Context yapılabilir)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          avatar_url: data.avatar_url || ''
        });
      }
      setLoading(false);
    };

    fetchProfile();
    
    // Tarayıcıdaki temayı kontrol et (Mock Logic)
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);

  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      alert("Profil başarıyla güncellendi! ✅");
      router.refresh(); 
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Not: Gerçek tema değişimi için layout.tsx'te class kontrolü gerekir.
    // Şimdilik sadece tercihi kaydediyoruz.
    if (newTheme === 'light') {
        document.documentElement.classList.remove('dark');
        // Light mode için body class'larını değiştirmek gerekebilir
        alert("Aydınlık mod tercihi kaydedildi (Tam aktif olması için Layout ayarı gerekir).");
    } else {
        document.documentElement.classList.add('dark');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  // --- SOL MENÜ BİLEŞENİ ---
  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === id 
            ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Ayarlar</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
            
            {/* SOL MENÜ */}
            <div className="w-full md:w-64 flex flex-col gap-2">
                <SidebarItem id="profile" icon={User} label="Profil Ayarları" />
                <SidebarItem id="appearance" icon={Palette} label="Görünüm" />
                <SidebarItem id="notifications" icon={Bell} label="Bildirimler" />
                <SidebarItem id="account" icon={Shield} label="Hesap & Güvenlik" />
            </div>

            {/* SAĞ İÇERİK ALANI */}
            <div className="flex-1 bg-gray-900 p-8 rounded-2xl border border-gray-800 min-h-[500px]">
                
                {/* --- 1. PROFİL AYARLARI --- */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold border-b border-gray-800 pb-4 mb-6">Profil Bilgileri</h2>
                        
                        <div className="flex items-center gap-6">
                            <img src={formData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.full_name}`} className="w-20 h-20 rounded-full border-2 border-gray-700" alt="Avatar" />
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Görünür İsim</label>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="w-full p-3 rounded-lg bg-gray-950 border border-gray-700 text-white" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Biyografi</label>
                            <textarea name="bio" rows={3} value={formData.bio} onChange={handleInputChange} className="w-full p-3 rounded-lg bg-gray-950 border border-gray-700 text-white" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Konum</label>
                                <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full p-3 rounded-lg bg-gray-950 border border-gray-700 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                                <input type="text" name="website" value={formData.website} onChange={handleInputChange} className="w-full p-3 rounded-lg bg-gray-950 border border-gray-700 text-white" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Kaydet
                            </button>
                        </div>
                    </form>
                )}

                {/* --- 2. GÖRÜNÜM AYARLARI --- */}
                {activeTab === 'appearance' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold border-b border-gray-800 pb-4 mb-6">Uygulama Teması</h2>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <button 
                                onClick={() => handleThemeChange('dark')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}
                            >
                                <Moon className="w-8 h-8 text-blue-400" />
                                <span className="font-medium">Karanlık</span>
                            </button>

                            <button 
                                onClick={() => handleThemeChange('light')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${theme === 'light' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}`}
                            >
                                <Sun className="w-8 h-8 text-yellow-400" />
                                <span className="font-medium">Aydınlık</span>
                            </button>

                            <button className="p-4 rounded-xl border-2 border-gray-700 opacity-50 cursor-not-allowed flex flex-col items-center gap-3">
                                <Smartphone className="w-8 h-8 text-gray-400" />
                                <span className="font-medium">Sistem</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- 3. BİLDİRİM AYARLARI --- */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold border-b border-gray-800 pb-4 mb-6">Bildirim Tercihleri</h2>
                        
                        <div className="space-y-4">
                            {['Biri beni takip ettiğinde', 'Yorumlarıma cevap geldiğinde', 'Haftalık bülten'].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-950 rounded-lg border border-gray-800">
                                    <span className="text-gray-300">{item}</span>
                                    <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- 4. HESAP AYARLARI --- */}
                {activeTab === 'account' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-xl font-bold border-b border-gray-800 pb-4 mb-6">Hesap Yönetimi</h2>
                        
                        <div className="p-4 border border-red-900/50 bg-red-900/10 rounded-xl">
                            <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" /> Hesabı Sil
                            </h3>
                            <p className="text-sm text-red-200/70 mb-4">
                                Hesabını silersen tüm kitapların, yorumların ve verilerin kalıcı olarak silinir. Bu işlem geri alınamaz.
                            </p>
                            <button 
                                onClick={() => alert("Bu özellik şu an devre dışı (Güvenlik nedeniyle).")}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition"
                            >
                                Hesabımı Kalıcı Olarak Sil
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
      </div>
    </div>
  );
}