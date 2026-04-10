import React, { useState, useEffect, useMemo } from 'react';
import { MemorialPost, GuestbookEntry, PostStatus, ReminderIntent } from '../types';
import { MemorialTemplate } from '../components/MemorialTemplate';
import { 
  Check, X, AlertCircle, Clock, LayoutDashboard, CheckCircle,
  XCircle, ChevronRight, LogOut, MessageSquare, Trash2, Eye,
  Bell, Search, User as UserIcon, Calendar, Filter, Pencil, Archive, ExternalLink, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, isMock } from '../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { sendStatusEmail } from '../lib/email';

interface AdminDashboardProps {
  posts: MemorialPost[];
  onUpdateStatus: (id: string, status: PostStatus) => void;
  onUpdateGuestbookStatus: (postId: string, entryId: string, status: 'approved' | 'pending') => void;
  onDeleteGuestbookEntry: (postId: string, entryId: string) => void;
  onUpdatePost: (id: string, data: Partial<MemorialPost>) => void;
  onDeletePost: (id: string) => void;
}

type AdminTab = 'На чекање' | 'Објавени' | 'Книга на сочувство' | 'Потсетници';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  posts = [], 
  onUpdateStatus, 
  onUpdateGuestbookStatus,
  onDeleteGuestbookEntry,
  onUpdatePost,
  onDeletePost
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('На чекање');
  const [postToDelete, setPostToDelete] = useState<MemorialPost | null>(null);
  const [selectedPost, setSelectedPost] = useState<MemorialPost | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (isMock) {
      setUser({ email: 'admin@vechen-spomen.mk' } as User);
      setIsAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (isMock) {
      setUser({ email } as User);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError('Грешна е-пошта или лозинка.');
    }
  };

  const handleLogout = async () => {
    if (isMock) {
      setUser(null);
      return;
    }
    await signOut(auth);
  };





  // Helper: Format Date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('mk-MK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Helper: Calculate Reminders
  const allReminders = useMemo(() => {
    const reminders: Array<{
      id: string;
      fullName: string;
      type: string;
      date: Date;
      status: 'Предстоен' | 'Поминат';
    }> = [];

    posts.forEach(post => {
      if (!post.dateOfDeath) return;
      const dod = new Date(post.dateOfDeath);
      
      const periods = [
        { label: '40 дена', days: 40 },
        { label: '6 месеци', days: 182 },
        { label: '1 година', days: 365 }
      ];

      periods.forEach(p => {
        const reminderDate = new Date(dod);
        reminderDate.setDate(dod.getDate() + p.days);
        
        reminders.push({
          id: `${post.id}-${p.label}`,
          fullName: post.fullName,
          type: p.label,
          date: reminderDate,
          status: reminderDate > new Date() ? 'Предстоен' : 'Поминат'
        });
      });
    });

    return reminders.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [posts]);

  // Global Condolences Moderation
  const pendingCondolences = useMemo(() => {
    const list: Array<{ postId: string; postName: string; entry: GuestbookEntry }> = [];
    posts.forEach(post => {
      post.guestbookEntries?.forEach(entry => {
        if (entry.status === 'pending') {
          list.push({ postId: post.id, postName: post.fullName, entry });
        }
      });
    });
    return list.sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());
  }, [posts]);

  const approvedCondolences = useMemo(() => {
    const list: Array<{ postId: string; postName: string; entry: GuestbookEntry }> = [];
    posts.forEach(post => {
      post.guestbookEntries?.forEach(entry => {
        if (entry.status === 'approved') {
          list.push({ postId: post.id, postName: post.fullName, entry });
        }
      });
    });
    return list.sort((a, b) => new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime());
  }, [posts]);

  // Filtered Logic for Posts
  const filteredPosts = useMemo(() => {
    const list = posts.filter(p => {
      const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.city.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === 'На чекање') return (p.status === 'Во проверка' || p.status === 'Чека одобрување' || p.status === 'pending_payment') && matchesSearch;
      if (activeTab === 'Објавени') return p.status === 'Објавено' && matchesSearch;
      return false;
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, activeTab, searchQuery]);

  const stats = {
    pending: posts.filter(p => p.status === 'Во проверка' || p.status === 'Чека одобрување' || p.status === 'pending_payment').length,
    published: posts.filter(p => p.status === 'Објавено').length,
    condolences: pendingCondolences.length,
    reminders: allReminders.filter(r => r.status === 'Предстоен').length
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-400 gap-4">
        <Clock className="animate-spin" size={32} />
        <p className="font-serif uppercase tracking-widest text-[10px] font-black">Вчитување на системот...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4 font-sans">
        <div className="bg-white p-12 border border-stone-200 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-700">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-stone-900 mb-2">Админ Панел</h2>
            <p className="text-[10px] font-black first-letter:uppercase uppercase tracking-[0.3em] text-stone-400">Вечен Спомен Македонија</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 block">Е-пошта</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-stone-100 bg-stone-50 focus:bg-white focus:border-stone-900 focus:outline-none transition-all placeholder:text-stone-300"
                placeholder="admin@vechen-spomen.mk"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 block">Лозинка</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-stone-100 bg-stone-50 focus:bg-white focus:border-stone-900 focus:outline-none transition-all"
                required
              />
            </div>
            {loginError && <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider bg-red-50 p-3 border border-red-100">{loginError}</p>}
            <button
              type="submit"
              className="w-full py-4 bg-stone-900 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-stone-800 transition-all shadow-xl active:scale-[0.98]"
            >
              Најава во систем
            </button>
            {isMock && (
              <p className="text-[9px] text-stone-400 text-center mt-6 border-t border-stone-100 pt-6 uppercase tracking-widest">
                Системот е во тест режим. Внесете било која е-пошта.
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  const renderStatCard = (label: string, value: number, icon: any, colorClass: string) => (
    <div className="bg-white p-8 border border-stone-200 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
      <div className={`absolute -right-2 -bottom-2 ${colorClass} opacity-[0.03] group-hover:scale-110 transition-transform`}>
        {React.createElement(icon, { size: 100 })}
      </div>
      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{label}</span>
        <span className={`text-4xl font-serif ${colorClass} font-bold`}>{value}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-stone-100 min-h-screen font-sans text-stone-900 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-white border-r border-stone-200 flex flex-col pt-12 shrink-0 z-20">
        <div className="px-8 mb-16">
          <h2 className="text-xl font-serif font-black tracking-tighter">ВЕЧЕН СПОМЕН</h2>
            <div className={`flex items-center gap-2 mt-2 ${isMock ? 'text-amber-500' : 'text-green-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isMock ? 'bg-amber-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'}`} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                {isMock ? 'Тест Режим (Mock)' : 'Систем во живо'}
              </span>
            </div>
        </div>

        <nav className="space-y-1 px-4 flex-grow">
          {[
            { id: 'На чекање', icon: Clock, count: stats.pending },
            { id: 'Објавени', icon: CheckCircle, count: stats.published },
            { id: 'Книга на сочувство', icon: MessageSquare, count: stats.condolences },
            { id: 'Потсетници', icon: Bell, count: stats.reminders },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as AdminTab); setSelectedPost(null); }}
              className={`w-full flex items-center justify-between px-6 py-4 transition-all group ${
                activeTab === item.id 
                ? 'bg-stone-900 text-white shadow-xl translate-x-2' 
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-4">
                {React.createElement(item.icon, { size: 16, className: activeTab === item.id ? 'text-white' : 'text-stone-300' })}
                <span className="text-[10px] font-black uppercase tracking-widest">{item.id}</span>
              </div>
              {item.count > 0 && (
                <span className={`text-[9px] font-black px-2 pb-0.5 rounded-full ${
                  activeTab === item.id ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-500 group-hover:bg-stone-200'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-stone-100 mt-auto">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white text-[10px] font-black ring-4 ring-stone-100">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-stone-900 truncate uppercase tracking-tighter">{user.email}</p>
              <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Системски уредник</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-1 py-4 text-[10px] font-black text-stone-400 hover:text-red-600 transition-all uppercase tracking-widest"
          >
            <LogOut size={14} /> Одјава
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col p-6 md:p-12 overflow-hidden relative">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-2 tracking-tight">{activeTab}</h1>
            <p className="text-stone-400 text-xs font-light uppercase tracking-[0.1em]">Проверка и управување со меморијални објави</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto animate-in fade-in slide-in-from-top-2 duration-700 delay-200">
            {renderStatCard('Чекаат', stats.pending, Clock, 'text-amber-500')}
            {renderStatCard('Јавни', stats.published, Eye, 'text-stone-900')}
            {renderStatCard('Сочувства', stats.condolences, MessageSquare, 'text-blue-500')}
            {renderStatCard('Предстојни', stats.reminders, Bell, 'text-red-400')}
          </div>
        </header>

        {/* Tab Search/Filter Bar */}
        {(activeTab === 'На чекање' || activeTab === 'Објавени') && (
          <div className="mb-8 relative max-w-md animate-in fade-in duration-700">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
            <input 
              type="text" 
              placeholder="Пребарајте име или град..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 focus:border-stone-900 focus:outline-none transition-all text-xs font-medium placeholder:text-stone-300 shadow-sm"
            />
          </div>
        )}

        {/* Content Lists */}
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 pb-24">
          
          {/* TAB: PENDING REVIEW */}
          {activeTab === 'На чекање' && (
            <div className="grid grid-cols-1 gap-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-stone-200 py-32 rounded-sm text-center animate-in fade-in duration-500">
                  <Clock className="mx-auto text-stone-100 mb-6" size={64} />
                  <p className="font-serif text-xl text-stone-400">Нема нови објави за проверка.</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div 
                    key={post.id} 
                    className="bg-white p-6 border border-stone-200 flex flex-col lg:flex-row items-center gap-8 group hover:shadow-xl hover:border-stone-900/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="relative shrink-0 flex items-center justify-center pt-2">
                       <img 
                        src={post.photoUrl} 
                        className="w-20 h-24 object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700 shadow-lg ring-4 ring-stone-50" 
                        alt="" 
                        onClick={() => setPreviewPhoto(post.photoUrl)}
                      />
                      {post.package === 'Истакнат' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-stone-900 rounded-full ring-2 ring-white shadow-md animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex-grow text-center lg:text-left space-y-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2">
                        <h4 className="font-serif text-2xl text-stone-900 font-black truncate">{post.fullName}</h4>
                        <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-0.5 border border-stone-100">{post.type}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                          post.package === 'Истакнат' ? 'border-stone-900 text-stone-900 bg-stone-50' : 'border-stone-200 text-stone-400'
                        }`}>{post.package}</span>
                        {post.status === 'pending_payment' && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 flex items-center gap-1">
                            <Clock size={10} /> Неплатено
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-stone-300">Град</span>
                          {post.city}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-stone-300">Погреб</span>
                          {formatDate(post.dateOfFuneral)}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-stone-300">Време</span>
                          {post.timeOfFuneral || '—'}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] text-stone-300">Поднесено на</span>
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                        className="p-4 bg-stone-50 text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all border border-stone-100"
                        title="Уреди"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => window.open(post.slug ? `/spomen/${post.slug}` : `/objava/${post.id}`, '_blank')}
                        className="p-4 bg-stone-50 text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all border border-stone-100"
                        title="Преглед на објава"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button
                        onClick={() => { onUpdateStatus(post.id, 'Објавено'); sendStatusEmail('approved', post); }}
                        className="px-6 py-4 bg-stone-900 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-stone-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                      >
                        <Check size={16} /> Одобри
                      </button>
                      <button
                        onClick={() => { onUpdateStatus(post.id, 'Одбиено'); sendStatusEmail('rejected', post); }}
                        className="p-4 bg-white text-stone-200 hover:text-red-500 hover:border-red-100 transition-all border border-stone-100"
                        title="Одбиј"
                      >
                        <X size={18} />
                      </button>
                      <button 
                        onClick={() => setPostToDelete(post)}
                        className="p-4 bg-white text-stone-200 hover:text-red-500 hover:border-red-100 transition-all border border-stone-100"
                        title="Избриши целосно"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: PUBLISHED */}
          {activeTab === 'Објавени' && (
            <div className="grid grid-cols-1 gap-3">
               {filteredPosts.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-stone-100 py-32 rounded-sm text-center">
                  <CheckCircle className="mx-auto text-stone-50 mb-6" size={64} />
                  <p className="font-serif text-xl text-stone-300">Нема објавени меморијали во овој град.</p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div key={post.id} className="bg-white p-5 border border-stone-100 flex items-center gap-6 hover:border-stone-200 transition-all animate-in fade-in">
                    <img src={post.photoUrl} className="w-12 h-16 object-cover rounded shadow-sm opacity-60" alt="" />
                    <div className="flex-grow">
                      <h4 className="font-serif text-lg text-stone-700">{post.fullName}</h4>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] uppercase font-black tracking-widest text-stone-300">{post.type} • {post.city}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                        className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                        title="Уреди"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => window.open(post.slug ? `/spomen/${post.slug}` : `/objava/${post.id}`, '_blank')}
                        className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                        title="Јавен преглед"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        onClick={() => onUpdateStatus(post.id, 'Во проверка')}
                        className="p-2 text-stone-400 hover:text-amber-600 transition-colors"
                        title="Тргни од објава (Архивирај)"
                      >
                        <Archive size={16} />
                      </button>
                      <button
                        onClick={() => setPostToDelete(post)}
                        className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                        title="Избриши целосно"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: GUESTBOOK MODERATION */}
          {activeTab === 'Книга на сочувство' && (
            <div className="space-y-12 max-w-4xl mx-auto">

              {/* PENDING SECTION */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  На чекање за одобрување ({pendingCondolences.length})
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {pendingCondolences.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-stone-100 py-20 rounded-sm text-center">
                      <MessageSquare className="mx-auto text-stone-100 mb-4" size={48} />
                      <p className="font-serif text-lg text-stone-300">Нема нови пораки за проверка.</p>
                    </div>
                  ) : (
                    pendingCondolences.map(({ postId, postName, entry }) => (
                      <div key={entry.id} className="bg-white p-8 border border-amber-100 shadow-sm space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-start border-b border-stone-50 pb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 font-serif text-lg">
                              {entry.senderName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-stone-900">{entry.senderName}</h4>
                              <p className="text-[9px] uppercase font-black tracking-widest text-stone-400">До заминатиот: <span className="text-stone-900 font-serif capitalize">{postName}</span></p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{formatDate(entry.createdAt)}</span>
                        </div>
                        <p className="text-stone-700 font-serif text-lg leading-relaxed bg-amber-50/30 p-6 border-l-2 border-amber-200">
                          {`\u201e${entry.text}\u201c`}
                        </p>
                        <div className="flex gap-4 pt-2">
                          <button
                            onClick={() => onUpdateGuestbookStatus(postId, entry.id, 'approved')}
                            className="px-6 py-3 bg-stone-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all flex items-center gap-2 shadow-lg"
                          >
                            <Check size={14} /> Одобри порака
                          </button>
                          <button
                            onClick={() => onDeleteGuestbookEntry(postId, entry.id)}
                            className="px-6 py-3 border border-stone-100 text-stone-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Отстрани
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* APPROVED SECTION */}
              {approvedCondolences.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Одобрени пораки — јавно видливи ({approvedCondolences.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {approvedCondolences.map(({ postId, postName, entry }) => (
                      <div key={entry.id} className="bg-white p-5 border border-stone-100 flex items-start gap-5 group hover:border-stone-200 transition-all animate-in fade-in">
                        <div className="w-9 h-9 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 font-serif text-base shrink-0 mt-0.5">
                          {entry.senderName.charAt(0)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <span className="text-sm font-bold text-stone-800">{entry.senderName}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">{`\u2192 ${postName}`}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">{formatDate(entry.createdAt)}</span>
                          </div>
                          <p className="text-stone-500 font-serif text-sm leading-relaxed line-clamp-2">{`\u201e${entry.text}\u201c`}</p>
                        </div>
                        <button
                          onClick={() => onDeleteGuestbookEntry(postId, entry.id)}
                          className="shrink-0 p-2 text-stone-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-sm opacity-0 group-hover:opacity-100"
                          title="Отстрани порака"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: REMINDERS */}
          {activeTab === 'Потсетници' && (
            <div className="bg-white border border-stone-200 overflow-hidden shadow-sm animate-in fade-in duration-700">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Починато лице</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Тип на помен</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Планиран датум</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Статус</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-stone-400">Акција</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {allReminders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-24 text-center text-stone-300 font-serif text-lg">Нема пронајдено активни потсетници.</td>
                    </tr>
                  ) : (
                    allReminders.map(r => (
                      <tr key={r.id} className="hover:bg-stone-50 transition-colors group">
                        <td className="px-8 py-6 font-serif text-stone-900 font-bold">{r.fullName}</td>
                        <td className="px-8 py-6">
                           <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
                            {r.type}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-[11px] font-medium text-stone-600">
                          {r.date.toLocaleDateString('mk-MK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                            r.status === 'Предстоен' ? 'text-amber-600 animate-pulse' : 'text-stone-300'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'Предстоен' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-stone-200'}`} />
                            {r.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <button 
                            onClick={() => alert('Функционалноста за распоредување се подготвува...')}
                            className="text-[10px] font-black uppercase tracking-tighter text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1"
                          >
                            <Calendar size={12} /> Распореди објава
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* SIDE PREVIEW PANEL (Modal Overlay style) */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div 
              className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-500" 
              onClick={() => setSelectedPost(null)}
            />
            <div className="relative w-full max-w-4xl bg-stone-50 h-full shadow-2xl overflow-y-auto custom-scrollbar border-l border-stone-200 flex flex-col animate-in slide-in-from-right-full duration-700 ease-out">
              
              {/* Header inside Panel */}
              <div className="p-8 bg-white border-b border-stone-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-3xl font-serif text-stone-900 font-bold">Целосен Преглед</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Модераторска контрола на содржината</p>
                  </div>
                </div>
                 <div className="flex items-center gap-4">
                  <button 
                    onClick={() => navigate(`/admin/posts/${selectedPost.id}/edit`)}
                    className="px-6 py-4 bg-white border border-stone-200 text-stone-600 font-black uppercase tracking-widest text-[10px] hover:bg-stone-50 transition-all flex items-center gap-2"
                  >
                    Редактирај содржина
                  </button>
                  
                  <button 
                    onClick={() => onUpdateStatus(selectedPost.id, 'Објавено')}
                    className="px-8 py-4 bg-stone-900 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-stone-800 transition-all flex items-center gap-3 shadow-lg"
                  >
                    <CheckCircle size={14} /> Одобри и објави
                  </button>

                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="w-12 h-12 flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all border border-stone-100"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Preview Body */}
              <div className="p-12 overflow-x-hidden">
                <div className="max-w-3xl mx-auto space-y-12 pb-24">
                  
                  {/* Private Details Box */}
                  <div className="bg-white p-8 border border-stone-200 shadow-sm space-y-8">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 border-b border-stone-50 pb-4">Контакт и Пакет</h4>
                     <div className="grid grid-cols-2 gap-8 text-[11px]">
                        <div>
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest mb-1">Испраќач</p>
                          <p className="font-bold text-stone-900">{selectedPost.senderName}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest mb-1">Пакет на објава</p>
                          <p className={`font-black uppercase tracking-widest ${selectedPost.package === 'Вечен спомен' ? 'text-amber-500' : 'text-stone-900'}`}>
                            {selectedPost.package}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest mb-1">Е-пошта</p>
                          <p className="text-stone-600 truncate">{selectedPost.email}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-stone-300 uppercase tracking-widest mb-1">Телефон за контакт</p>
                          <p className="text-stone-600">{selectedPost.phone}</p>
                        </div>
                     </div>
                  </div>

                  {/* Actual Memorial Card Rendering OR Edit Form */}
                   <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 mb-8 flex items-center gap-4">
                      <div className="flex-grow h-[1px] bg-stone-200" />
                      Визуелен Приказ на Јавна Објава
                      <div className="flex-grow h-[1px] bg-stone-200" />
                    </h4>
                    
                    <div className="bg-white p-2 border border-stone-100 shadow-2xl">
                      <MemorialTemplate post={selectedPost} isPreview />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Photo Lightbox */}
        {previewPhoto && (
          <div 
            className="fixed inset-0 bg-stone-950/98 z-[100] flex items-center justify-center p-8 backdrop-blur-3xl animate-in fade-in duration-500"
            onClick={() => setPreviewPhoto(null)}
          >
            <img 
              src={previewPhoto} 
              className="max-w-4xl max-h-[95vh] object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] border-[12px] border-white ring-1 ring-stone-900/50 animate-in zoom-in-95 duration-500" 
              alt="Full Preview" 
            />
            <button className="absolute top-12 right-12 text-white/40 hover:text-white transition-all uppercase tracking-widest text-[10px] font-black flex items-center gap-2">
              <X size={40} /> Затвори
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {postToDelete && (
          <div className="fixed inset-0 bg-stone-900/60 z-[100] flex items-center justify-center p-8 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-10 border border-stone-200 max-w-lg w-full shadow-2xl animate-in slide-in-from-bottom-8">
              <h3 className="font-serif text-3xl text-stone-900 mb-4 flex items-center gap-3">
                <AlertCircle className="text-red-500" size={32} />
                Избриши објава
              </h3>
              <p className="text-stone-600 mb-8 leading-relaxed">
                Дали сте сигурни дека сакате целосно да ја избришете објавата за <strong className="text-stone-900">{postToDelete.fullName}</strong>? Оваа акција е неповратно отстранување од базата на податоци.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setPostToDelete(null)}
                  className="px-6 py-3 border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors uppercase tracking-widest text-[10px] font-bold"
                >
                  Откажи
                </button>
                <button 
                  onClick={() => {
                    onDeletePost(postToDelete.id);
                    setPostToDelete(null);
                  }}
                  className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors uppercase tracking-widest text-[10px] font-bold flex items-center gap-2 shadow-lg"
                >
                  <Trash2 size={16} /> Потврди бришење
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};
