import React from 'react';
import { TrendingUp, UserPlus, ArrowRight } from 'lucide-react';
import { trendingBooks, suggestedUsers } from '../services/mockData';

export const SidebarRight = () => {
  return (
    <div className="space-y-6">
      
      {/* Trends */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-500" /> Trending This Week
        </h3>
        <div className="space-y-4">
          {trendingBooks.map((book, idx) => (
            <div key={book.id} className="flex items-center gap-3 group cursor-pointer">
              <div className="text-lg font-bold text-gray-600 w-4">{idx + 1}</div>
              <img src={book.coverUrl} alt={book.title} className="h-12 w-8 object-cover rounded shadow-sm group-hover:scale-110 transition-transform" />
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-400 transition">{book.title}</h4>
                <p className="text-xs text-gray-400 truncate">{book.author}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-xs font-semibold text-gray-400 hover:text-white flex items-center justify-center gap-1 transition">
          View All Trends <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Suggested Users */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-blue-500" /> Who to Follow
        </h3>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full border border-gray-600" />
                <div>
                  <h4 className="text-sm font-bold text-white">{user.name}</h4>
                  <p className="text-xs text-gray-400">{user.handle}</p>
                </div>
              </div>
              <button className="text-xs bg-white text-gray-900 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-gray-500 px-2 text-center leading-relaxed">
        &copy; 2025 Okuro Inc. <br/>
        Privacy • Terms • Cookies • <span className="hover:text-gray-300 cursor-pointer">About</span>
      </div>

    </div>
  );
};