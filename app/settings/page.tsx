"use client";

import React, { useState, useEffect } from 'react';
import { Save, User, MapPin, Globe, FileText, Loader2 } from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: '',
    avatar_url: ''
  });

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
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
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
      console.error("Hata:", error);
      alert("Hata oluştu: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Ayarlar</h1>
        
        <form onSubmit={handleSave} className="space-y-8 bg-gray-900 p-8 rounded-2xl border border-gray-800">
             <div className="flex items-center gap-6">
                 <img src={formData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.full_name}`} className="w-20 h-20 rounded-full border-2 border-gray-700" alt="Avatar" />
                 <div>
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

             <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold w-full transition">
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
             </button>
        </form>
      </div>
    </div>
  );
}