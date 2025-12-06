export default function PrivacyPage() {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
          <div className="max-w-2xl mx-auto prose prose-invert">
              <h1 className="text-3xl font-bold mb-6">Gizlilik Politikası</h1>
              <p className="text-gray-400 mb-4">Son güncelleme: Aralık 2025</p>
              <p className="text-gray-300 mb-4">Okuro'da gizliliğinize öncelik veriyoruz. Sadece hizmetimizi sağlamak (kitaplarınızı takip etmek ve profilinizi göstermek) için gerekli verileri topluyoruz.</p>
              
              <h2 className="text-xl font-bold mt-8 mb-4 text-white">Topladığımız Veriler</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                  <li>Hesap bilgileri (isim, e-posta, avatar)</li>
                  <li>Kullanıcı tarafından oluşturulan içerik (incelemeler, okuma listeleri)</li>
                  <li>Kullanım verileri (özelliklerle etkileşim)</li>
              </ul>
          </div>
      </div>
    );
  }