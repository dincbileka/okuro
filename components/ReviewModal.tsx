"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/lib/LanguageContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBookId: number; 
  initialRating: number | null;
  initialNotes: string | null;
  bookTitle: string;
  onReviewSaved: (newRating: number | null, newNotes: string | null) => void;
}

const StarRating = ({ rating, onRatingChange }: { rating: number | null, onRatingChange: (r: number) => void }) => {
    return (
        <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star === rating ? 0 : star)}
                    className={`text-3xl transition-colors ${
                        star <= (rating || 0)
                            ? "text-yellow-400 hover:text-yellow-300"
                            : "text-gray-600 hover:text-gray-500"
                    }`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};


export default function ReviewModal({
  isOpen,
  onClose,
  userBookId,
  initialRating,
  initialNotes,
  bookTitle,
  onReviewSaved,
}: ReviewModalProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(initialRating);
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);

  // 1. Modal açıldığında/veriler değiştiğinde değerleri yeniden yükle
  useEffect(() => {
    // Bu hook her renderda (her açılışta) çalışarak state'i günceller
    setRating(initialRating);
    setNotes(initialNotes);
  }, [initialRating, initialNotes]);

  // 2. ESC tuşu dinleyicisi için temizleme (Cleanup) yap
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    // Dinleyiciyi ekle
    document.addEventListener('keydown', handleEsc);

    return () => {
        // Modül kapanırken dinleyiciyi KALDIR (Hook hatasını önleyen en kritik kısım)
        document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);


  // Modal kapalıysa gösterme (Koşullu render)
  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("user_books")
        .update({
          rating: rating === 0 ? null : rating,
          notes: notes,
        })
        .eq("id", userBookId);

      if (error) throw error;

      alert(t('reviewModal.saved'));
      onReviewSaved(rating === 0 ? null : rating, notes);

    } catch (error: any) {
      console.error("Review save error:", error);
      alert(t('reviewModal.saveError') + ": " + error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => onReviewSaved(rating, notes)}>
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative border border-gray-700 max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()} // Dışarıya tıklayınca kapanmasın
      >
        
        {/* Başlık ve Kapat Butonu */}
        <div className="flex justify-between items-start border-b border-gray-700 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-white">
                {t('reviewModal.title')}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl leading-none">
                &times;
            </button>
        </div>
        
        {/* Kitap Bilgisi */}
        <p className="text-lg text-blue-400 mb-6 font-semibold truncate">
            {bookTitle}
        </p>

        {/* Puanlama Alanı */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            {t('reviewModal.ratingLabel')}
          </label>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>

        {/* Not Alanı */}
        <div className="mb-8">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-400 mb-2">
            {t('reviewModal.notesLabel')}
          </label>
          <textarea
            id="notes"
            rows={6}
            value={notes || ""}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 transition resize-y"
            placeholder={t('reviewModal.notesPlaceholder')}
          />
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-colors flex items-center gap-2
              ${loading ? "bg-blue-600/50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/50"}
            `}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('reviewModal.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}