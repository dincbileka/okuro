"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useTranslation } from "@/lib/LanguageContext";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X,
  Save,
  Loader2,
  BookOpen,
  AlertTriangle
} from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  description: string | null;
  isbn: string | null;
  publisher: string | null;
  published_date: string | null;
  page_count: number | null;
  created_at: string;
}

export default function AdminBooks() {
  const { t, language } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    cover_url: "",
    description: "",
    isbn: "",
    publisher: "",
    published_date: "",
    page_count: ""
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBooks(data);
    }
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.isbn && book.isbn.includes(searchQuery))
  );

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      cover_url: "",
      description: "",
      isbn: "",
      publisher: "",
      published_date: "",
      page_count: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      cover_url: book.cover_url || "",
      description: book.description || "",
      isbn: book.isbn || "",
      publisher: book.publisher || "",
      published_date: book.published_date || "",
      page_count: book.page_count?.toString() || ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.author) {
      alert(t('admin.fillRequired'));
      return;
    }

    setSaving(true);

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        cover_url: formData.cover_url || null,
        description: formData.description || null,
        isbn: formData.isbn || null,
        publisher: formData.publisher || null,
        published_date: formData.published_date || null,
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        normalized_title: formData.title.toLowerCase()
      };

      if (editingBook) {
        // Update
        const { error } = await supabase
          .from("books")
          .update(bookData)
          .eq("id", editingBook.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from("books")
          .insert({
            ...bookData,
            id: `manual_${Date.now()}`
          });

        if (error) throw error;
      }

      await fetchBooks();
      setIsModalOpen(false);
      alert(editingBook ? t('admin.bookUpdated') : t('admin.bookAdded'));

    } catch (error: any) {
      console.error("Save error:", error);
      alert(t('common.error') + ": " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    try {
      // Önce user_books'tan sil
      await supabase
        .from("user_books")
        .delete()
        .eq("book_id", bookId);

      // Sonra kitabı sil
      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", bookId);

      if (error) throw error;

      setBooks(books.filter(b => b.id !== bookId));
      setDeleteConfirm(null);
      alert(t('admin.bookDeleted'));

    } catch (error: any) {
      console.error("Delete error:", error);
      alert(t('common.error') + ": " + error.message);
    }
  };

  const dateLocale = language === 'tr' ? 'tr-TR' : 'en-US';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('admin.bookManagement')}</h1>
          <p className="text-gray-400 mt-1">{books.length} {t('admin.booksTotal')}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
        >
          <Plus className="h-5 w-5" />
          {t('admin.addBook')}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={t('admin.searchBooks')}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
        />
      </div>

      {/* Books Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-medium">{t('admin.cover')}</th>
                <th className="text-left p-4 text-gray-400 font-medium">{t('admin.titleAuthor')}</th>
                <th className="text-left p-4 text-gray-400 font-medium hidden md:table-cell">ISBN</th>
                <th className="text-left p-4 text-gray-400 font-medium hidden lg:table-cell">{t('admin.addedDate')}</th>
                <th className="text-right p-4 text-gray-400 font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    {searchQuery ? t('admin.noSearchResults') : t('admin.noBooksYet')}
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td className="p-4">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-12 h-16 object-cover rounded shadow" />
                      ) : (
                        <div className="w-12 h-16 bg-gray-800 rounded flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium truncate max-w-xs">{book.title}</p>
                      <p className="text-gray-400 text-sm">{book.author}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-gray-500 text-sm">{book.isbn || "-"}</span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-gray-500 text-sm">
                        {new Date(book.created_at).toLocaleDateString(dateLocale)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(book)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                          title={t('common.edit')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(book.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div 
            className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editingBook ? t('admin.editBook') : t('admin.addBook')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.bookTitle')} *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder={t('admin.bookTitle')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.author')} *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder={t('admin.author')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.coverUrl')}</label>
                <input
                  type="text"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.description')}</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder={t('admin.description')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.publisher')}</label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">{t('admin.pageCount')}</label>
                  <input
                    type="number"
                    value={formData.page_count}
                    onChange={(e) => setFormData({ ...formData, page_count: e.target.value })}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white">{t('admin.confirmDelete')}</h2>
            </div>
            <p className="text-gray-400 mb-6">{t('admin.deleteBookWarning')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

