import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Pochinati } from './pages/Pochinati';
import { Prices } from './pages/Prices';
import { SinglePost } from './pages/SinglePost';
import { SubmitPost } from './pages/SubmitPost';
import { AdminDashboard } from './pages/AdminDashboard';
import { MemorialPost } from './types';
import { getPosts, addPost as firebaseAddPost, updatePostStatus as firebaseUpdateStatus, updatePost as firebaseUpdatePost, deleteGuestbookEntry as firebaseDeleteGuestbookEntry, deleteMemorialPost } from './lib/posts';
import { SEEDED_POSTS } from './constants';
import { Loader2 } from 'lucide-react';
import { EditPost } from './pages/EditPost';
import { KakoRaboti } from './pages/KakoRaboti';
import { PolitikaNaPrivatnost } from './pages/PolitikaNaPrivatnost';
import { Uslovi } from './pages/Uslovi';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentCancel } from './pages/PaymentCancel';

const AppRoutes = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<MemorialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const liveData = await getPosts();
        
        // Ensure SEEDED_POSTS are always included as examples
        const examples = SEEDED_POSTS.map(p => ({ ...p, status: 'Објавено' as const }));
        
        const combined = [...liveData];
        examples.forEach(example => {
          if (!combined.find(p => p.id === example.id)) {
            combined.push(example);
          }
        });

        // Sort: Real posts first (by date), then examples if needed
        combined.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

        setPosts(combined);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts(SEEDED_POSTS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const addPost = async (newPost: MemorialPost): Promise<string | void> => {
    // Optimistic UI update
    setPosts(prev => [newPost, ...prev]);
    // Save to Firebase and return real doc ID
    try {
      const realId = await firebaseAddPost(newPost);
      if (realId && typeof realId === 'string') {
        // Optionally update the optimistic post with real ID later if needed
        return realId;
      }
    } catch (err) {
      console.error("Failed to add post tracking:", err);
      throw err;
    }
  };

  const updatePostStatus = async (id: string, status: MemorialPost['status']) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    try {
      await firebaseUpdateStatus(id, status);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const updatePost = async (id: string, data: Partial<MemorialPost>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    try {
      await firebaseUpdatePost(id, data);
    } catch (err) {
      console.error("Failed to update post:", err);
    }
  };

  const updateGuestbookStatus = async (postId: string, entryId: string, status: 'approved' | 'pending') => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          guestbookEntries: p.guestbookEntries?.map(e => e.id === entryId ? { ...e, status } : e)
        };
      }
      return p;
    }));
    try {
      await import('./lib/posts').then(m => m.updateGuestbookEntryStatus(postId, entryId, status));
    } catch (err) {
      console.error("Failed to update guestbook status:", err);
    }
  };

  const deleteGuestbookEntry = async (postId: string, entryId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          guestbookEntries: p.guestbookEntries?.filter(e => e.id !== entryId)
        };
      }
      return p;
    }));
    try {
      await firebaseDeleteGuestbookEntry(postId, entryId);
    } catch (err) {
      console.error("Failed to delete guestbook entry:", err);
    }
  };

  const deletePost = async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    try {
      await deleteMemorialPost(id);
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const publishedPosts = posts.filter(p => p.status === 'Објавено');

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-stone-400">
          <Loader2 className="animate-spin w-10 h-10 mb-4" />
          <p className="font-serif">Вчитување на објавите...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home posts={publishedPosts} />} />
        <Route path="/pochinati" element={<Pochinati posts={publishedPosts} />} />
        <Route path="/pochinati/:city" element={<Pochinati posts={publishedPosts} />} />
        <Route path="/pomen" element={<Pochinati posts={publishedPosts} />} />
        <Route path="/pomen/:subtype" element={<Pochinati posts={publishedPosts} />} />
        <Route path="/sochuvstvo" element={<Pochinati posts={publishedPosts} />} />
        <Route path="/posleden-pozdrav" element={<Pochinati posts={publishedPosts} />} />
        <Route path="/ceni" element={<Prices />} />
        <Route path="/kako-raboti" element={<KakoRaboti />} />
        <Route path="/politika-na-privatnost" element={<PolitikaNaPrivatnost />} />
        <Route path="/uslovi" element={<Uslovi />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/objavi" element={
          <SubmitPost
            onComplete={async (post) => {
              await addPost(post);
            }}
          />
        } />
        <Route path="/objava/:id" element={<SinglePost />} />
        <Route path="/spomen/:slug" element={<SinglePost />} />
        <Route path="/admin/posts/:id/edit" element={<EditPost posts={posts} />} />
        <Route path="/admin" element={
        <AdminDashboard 
            posts={posts} 
            onUpdateStatus={updatePostStatus} 
            onUpdateGuestbookStatus={updateGuestbookStatus}
            onDeleteGuestbookEntry={deleteGuestbookEntry}
            onUpdatePost={updatePost}
            onDeletePost={deletePost}
          />
        } />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
