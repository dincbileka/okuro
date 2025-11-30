import { SidebarLeft } from '@/components/SidebarLeft';
import { SidebarRight } from '@/components/SidebarRight';
import { Feed } from '@/components/Feed';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* SOL PANEL (Profil & Hedefler) - Mobilde gizli */}
        <div className="hidden md:block md:col-span-3 lg:col-span-3 sticky top-24 h-fit">
          <SidebarLeft />
        </div>

        {/* ORTA PANEL (Akış - Feed) */}
        <div className="md:col-span-9 lg:col-span-6">
          <Feed />
        </div>

        {/* SAĞ PANEL (Trendler) - Tablet/Mobilde gizli */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 h-fit">
          <SidebarRight />
        </div>

      </div>
    </div>
  );
}