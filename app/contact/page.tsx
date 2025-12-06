export default function ContactPage() {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">İletişime Geç</h1>
          <p className="text-gray-400 mb-8">Bir hata mı buldun veya bir önerin mi var?</p>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">E-Posta</label>
              <input type="email" className="w-full p-3 rounded-lg bg-gray-900 border border-gray-800 focus:border-blue-500 focus:outline-none" placeholder="sen@ornek.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Mesajın</label>
              <textarea rows={5} className="w-full p-3 rounded-lg bg-gray-900 border border-gray-800 focus:border-blue-500 focus:outline-none" placeholder="Aklındakileri bize anlat..."></textarea>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">Mesajı Gönder</button>
          </form>
        </div>
      </div>
    );
  }