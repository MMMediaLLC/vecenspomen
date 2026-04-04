import { collection, doc, getDocs, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, isMock } from './firebase';
import { MemorialPost, PostStatus } from '../types';
import { SEEDED_POSTS } from '../constants';

let mockPosts = [...SEEDED_POSTS];

const postsCollection = isMock ? ({} as any) : collection(db, 'posts');

export const getPosts = async (): Promise<MemorialPost[]> => {
  if (isMock) return mockPosts;
  const snapshot = await getDocs(postsCollection);
  return snapshot.docs.map(doc => ({ ...(doc.data() as object), id: doc.id } as MemorialPost));
};

export const addPost = async (post: MemorialPost): Promise<void> => {
  if (isMock) {
    mockPosts = [post, ...mockPosts];
    return;
  }
  const docRef = doc(postsCollection, post.id);
  await setDoc(docRef, post);
};

export const updatePostStatus = async (id: string, status: PostStatus): Promise<void> => {
  if (isMock) {
    mockPosts = mockPosts.map(p => p.id === id ? { ...p, status } : p);
    return;
  }
  const docRef = doc(postsCollection, id);
  await updateDoc(docRef, { status });
};

export const updatePost = async (id: string, data: Partial<MemorialPost>): Promise<void> => {
  if (isMock) {
    mockPosts = mockPosts.map(p => p.id === id ? { ...p, ...data } : p);
    return;
  }
  const docRef = doc(postsCollection, id);
  await updateDoc(docRef, data);
};

export const updateMemorialPost = async (id: string, data: Partial<MemorialPost>, adminEmail?: string | null): Promise<void> => {
  if (isMock) {
    mockPosts = mockPosts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...data,
          updatedAt: new Date().toISOString(),
          lastEditedBy: adminEmail || 'Admin',
        };
      }
      return p;
    });
    return;
  }
  
  const docRef = doc(postsCollection, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    lastEditedBy: adminEmail || 'Admin',
  });
};

export const deleteMemorialPost = async (id: string): Promise<void> => {
  if (isMock) {
    mockPosts = mockPosts.filter(p => p.id !== id);
    return;
  }
  const docRef = doc(postsCollection, id);
  await deleteDoc(docRef);
};

export const getPostById = async (id: string): Promise<MemorialPost | null> => {
  if (isMock) {
    return mockPosts.find(p => p.id === id) || null;
  }
  const snap = await getDoc(doc(postsCollection, id));
  return snap.exists() ? { ...snap.data(), id: snap.id } as MemorialPost : null;
};

export const getPostBySlug = async (slug: string): Promise<MemorialPost | null> => {
  if (isMock) {
    return mockPosts.find(p => p.slug === slug) || null;
  }
  const snapshot = await getDocs(postsCollection);
  const docSnap = snapshot.docs.find(d => (d.data() as any).slug === slug);
  return docSnap ? { ...(docSnap.data() as object), id: docSnap.id } as MemorialPost : null;
};

export const addGuestbookEntry = async (postId: string, entry: MemorialPost['guestbookEntries'][0]): Promise<void> => {
  if (isMock) {
    mockPosts = mockPosts.map(p => 
      p.id === postId 
        ? { ...p, guestbookEntries: [...(p.guestbookEntries || []), entry] } 
        : p
    );
    return;
  }
  const post = await getPostById(postId);
  if (post) {
    const updatedEntries = [...(post.guestbookEntries || []), entry];
    await updateDoc(doc(postsCollection, postId), { guestbookEntries: updatedEntries });
  }
};

export const updateGuestbookEntryStatus = async (postId: string, entryId: string, status: 'approved' | 'pending'): Promise<void> => {
  if (isMock) {
    mockPosts = mockPosts.map(p => 
      p.id === postId 
        ? { 
            ...p, 
            guestbookEntries: p.guestbookEntries?.map(e => e.id === entryId ? { ...e, status } : e) 
          } 
        : p
    );
    return;
  }
  const post = await getPostById(postId);
  if (post && post.guestbookEntries) {
    const updatedEntries = post.guestbookEntries.map(e => e.id === entryId ? { ...e, status } : e);
    await updateDoc(doc(postsCollection, postId), { guestbookEntries: updatedEntries });
  }
};

export const deleteGuestbookEntry = async (postId: string, entryId: string): Promise<void> => {
  if (isMock) {
    mockPosts = mockPosts.map(p =>
      p.id === postId
        ? { ...p, guestbookEntries: p.guestbookEntries?.filter(e => e.id !== entryId) }
        : p
    );
    return;
  }
  const post = await getPostById(postId);
  if (post && post.guestbookEntries) {
    const updatedEntries = post.guestbookEntries.filter(e => e.id !== entryId);
    await updateDoc(doc(postsCollection, postId), { guestbookEntries: updatedEntries });
  }
};
