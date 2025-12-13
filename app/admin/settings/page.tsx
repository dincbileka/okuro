"use client";

import { useTranslation } from "@/lib/LanguageContext";
import { Settings, Globe, Database, Shield } from "lucide-react";

export default function AdminSettings() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t('admin.settings')}</h1>
        <p className="text-gray-400 mt-1">{t('admin.dashboardSubtitle')}</p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* General Settings */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Settings className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Genel Ayarlar</h2>
              <p className="text-sm text-gray-400">Site genel yapılandırması</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Bakım Modu</span>
              <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-300">Yeni Kayıtlar</span>
              <div className="w-12 h-6 bg-green-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Globe className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dil Ayarları</h2>
              <p className="text-sm text-gray-400">Desteklenen diller</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇹🇷</span>
                <span className="text-gray-300">Türkçe</span>
              </div>
              <span className="text-green-400 text-sm">Aktif</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇬🇧</span>
                <span className="text-gray-300">English</span>
              </div>
              <span className="text-green-400 text-sm">Aktif</span>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Database className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Veritabanı</h2>
              <p className="text-sm text-gray-400">Supabase bağlantı bilgileri</p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Sağlayıcı</span>
              <span className="text-white">Supabase</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Durum</span>
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Bağlı
              </span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Güvenlik</h2>
              <p className="text-sm text-gray-400">Erişim ve yetkilendirme</p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">Admin E-posta</span>
              <span className="text-white">dincbileka@gmail.com</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
              <span className="text-gray-400">RLS Politikaları</span>
              <span className="text-green-400">Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

