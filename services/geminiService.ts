// Bu dosyanın adı geminiService kalsa da artık bizim kendi API'mizi kullanıyor
import { Book } from "../types";

export const searchBooksWithGemini = async (query: string): Promise<Book[]> => {
  if (!query) return [];

  try {
    // Bizim kendi yazdığımız API'ye istek atıyoruz
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      console.error("Arama hatası:", response.statusText);
      return [];
    }

    const data = await response.json();
    
    // API'den gelen veriyi (bizim formatımız) yeni tasarımın beklediği Book tipine çeviriyoruz
    return data.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      author: item.author,
      coverUrl: item.cover_url, // Bizde cover_url, yeni tasarımda coverUrl
      rating: 0, // Varsayılan
      pages: item.page_count || 0,
      description: item.description || ""
    }));

  } catch (error) {
    console.error("Arama servisi hatası:", error);
    return [];
  }
};