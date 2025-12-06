export default function TermsPage() {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
          <div className="max-w-2xl mx-auto prose prose-invert">
              <h1 className="text-3xl font-bold mb-6">Kullanım Şartları</h1>
              <p className="text-gray-400 mb-4">Son güncelleme: Ocak 2025</p>
              
              <p className="text-gray-300">
                  Okuro platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
                  Amacımız kitap severler için güvenli ve saygılı bir ortam oluşturmaktır.
              </p>
              
              <h2 className="text-xl font-bold mt-8 mb-4 text-white">Kurallar</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                  <li>Nefret söylemi ve taciz yasaktır.</li>
                  <li>Sadece gerçek kitap incelemeleri ve yorumları paylaşılmalıdır.</li>
                  <li>Hesap güvenliğinizden siz sorumlusunuz.</li>
              </ul>
          </div>
      </div>
    );
  }