export default function AboutPage() {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 text-white text-3xl font-bold rounded-xl flex items-center justify-center mx-auto mb-6">O</div>
          <h1 className="text-4xl font-bold mb-6">Kitap Severler Tarafından Yapıldı</h1>
          <p className="text-lg text-gray-400 leading-relaxed mb-8">
            Okuro basit bir fikirle başladı: Okumak, yalnız yapılan bir eylem olmak zorunda değil.
            Sessiz, düşünceli ve diğer sosyal ağların gürültüsünden uzak, Pazar sabahı huzurunda bir yer istedik.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
             <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
                <h3 className="font-bold text-white mb-2">Takip Et</h3>
                <p className="text-sm text-gray-500">Okuduğun her şeyin güzel bir kütüphanesini tut.</p>
             </div>
             <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
                <h3 className="font-bold text-white mb-2">Bağlan</h3>
                <p className="text-sm text-gray-500">Seninle aynı garip kitapları seven insanları bul.</p>
             </div>
             <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
                <h3 className="font-bold text-white mb-2">Keşfet</h3>
                <p className="text-sm text-gray-500">Algoritmalarla değil, zevkine göre öneriler al.</p>
             </div>
          </div>
        </div>
      </div>
    );
  }