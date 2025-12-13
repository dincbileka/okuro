-- =============================================
-- OKURO - Sosyal Özellikler Veritabanı Şeması
-- =============================================

-- 1. Arkadaşlık Tablosu
-- İki kullanıcı arasındaki arkadaşlık ilişkisini ve istekleri tutar
CREATE TABLE friendships (
  id SERIAL PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, addressee_id)
);

-- 2. Kitap Önerileri Tablosu
-- Kullanıcıların birbirine gönderdiği kitap önerilerini tutar
CREATE TABLE book_recommendations (
  id SERIAL PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id, book_id)
);

-- 3. Bildirimler Tablosu
-- Tüm bildirimleri merkezi olarak tutar
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('friend_request', 'friend_accepted', 'book_recommendation', 'book_rated')),
  title TEXT NOT NULL,
  message TEXT,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler (Performans için)
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_recommendations_receiver ON book_recommendations(receiver_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- RLS Politikaları
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Friendships Politikaları
CREATE POLICY "Kullanıcılar kendi arkadaşlıklarını görebilir" 
  ON friendships FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Kullanıcılar arkadaşlık isteği gönderebilir" 
  ON friendships FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Kullanıcılar kendi arkadaşlıklarını güncelleyebilir" 
  ON friendships FOR UPDATE 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Kullanıcılar kendi arkadaşlıklarını silebilir" 
  ON friendships FOR DELETE 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Book Recommendations Politikaları
CREATE POLICY "Kullanıcılar aldıkları/gönderdikleri önerileri görebilir" 
  ON book_recommendations FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Kullanıcılar öneri gönderebilir" 
  ON book_recommendations FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Kullanıcılar aldıkları önerileri güncelleyebilir" 
  ON book_recommendations FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Notifications Politikaları
CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Sistem bildirim oluşturabilir" 
  ON notifications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Kullanıcılar kendi bildirimlerini güncelleyebilir" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi bildirimlerini silebilir" 
  ON notifications FOR DELETE 
  USING (auth.uid() = user_id);

