"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin"); // Giriş mi? Kayıt mı?
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "signup") {
        // --- KAYIT OLMA ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: "Kayıt başarılı! Şimdi giriş yapabilirsiniz." });
        setMode("signin");
      } else {
        // --- GİRİŞ YAPMA ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Başarılıysa ana sayfaya git
        router.push("/");
        router.refresh(); 
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        
        {/* Başlık */}
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-500">Okuro</h1>
        <p className="text-center text-gray-400 mb-8">
          {mode === "signin" ? "Kütüphanene Dön" : "Aramıza Katıl"}
        </p>

        {/* Hata/Başarı Mesajı Kutusu */}
        {message && (
          <div className={`mb-4 p-3 rounded text-sm text-center ${message.type === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-green-500/20 text-green-200 border border-green-500/50'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">E-Posta</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition"
              placeholder="ornek@mail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Şifre</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none transition"
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition disabled:opacity-50 shadow-lg shadow-blue-900/50"
          >
            {loading ? "İşleniyor..." : mode === "signin" ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400 border-t border-gray-700 pt-6">
          {mode === "signin" ? (
            <>
              Hesabın yok mu?{" "}
              <button onClick={() => { setMode("signup"); setMessage(null); }} className="text-blue-400 hover:text-blue-300 font-semibold ml-1 transition">
                Hemen Kayıt Ol
              </button>
            </>
          ) : (
            <>
              Zaten hesabın var mı?{" "}
              <button onClick={() => { setMode("signin"); setMessage(null); }} className="text-blue-400 hover:text-blue-300 font-semibold ml-1 transition">
                Giriş Yap
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}