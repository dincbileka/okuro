import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Pages Router'da query direkt req.query içinden gelir
  const { q } = req.query;
  
  // Query dizi gelirse ilk elemanı al, yoksa string olarak al
  const query = Array.isArray(q) ? q[0] : q;

  if (!query || query.length < 2) {
    return res.status(200).json({ results: [] });
  }

  // 1. SUPABASE ARAMASI
  const { data: localBooks } = await supabase
    .from('books')
    .select('*')
    .ilike('title', `%${query}%`)
    .limit(5);

  const localResults = localBooks || [];

  // Yeterince sonuç varsa Google'a gitme
  if (localResults.length >= 5) {
    return res.status(200).json({ results: localResults });
  }

  // 2. GOOGLE BOOKS API (Fallback)
  try {
    const googleRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&langRestrict=tr`
    );
    const googleData = await googleRes.json();

    if (googleData.items) {
      const googleBooksFormatted = googleData.items.map((item: any) => {
        const info = item.volumeInfo;
        return {
          id: `google_${item.id}`,
          title: info.title,
          author: info.authors ? info.authors[0] : 'Bilinmeyen Yazar',
          cover_url: info.imageLinks?.thumbnail || null,
          isbn: info.industryIdentifiers?.[0]?.identifier || null,
          source: 'google'
        };
      });

      // Sonuçları Birleştir
      const combinedResults = [...localResults, ...googleBooksFormatted];
      
      return res.status(200).json({ results: combinedResults });
    }
  } catch (error) {
    console.error("Google API hatası:", error);
  }

  // Hata durumunda sadece local dön
  return res.status(200).json({ results: localResults });
}