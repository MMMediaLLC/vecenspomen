import { collection, doc, getDocs, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, isMock } from './firebase';
import { MemorialPost, PostStatus } from '../types';
import { SEEDED_POSTS } from '../constants';

let mockPosts = [...SEEDED_POSTS];

const postsCollection = isMock ? ({} as any) : collection(db, 'posts');

export const getPosts = async (): Promise<MemorialPost[]> => {
  if (isMock) return mockPosts;
  console.log('--- FIRESTORE READ ---');
  console.log('Querying collection: posts');
  console.log('Exact path: projects/[VITE_FIREBASE_PROJECT_ID]/databases/(default)/documents/posts');
  console.log('----------------------');
  try {
    const snapshot = await getDocs(postsCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        ...data,
        id: doc.id,
        // Normalize Firestore Timestamp → ISO string so date sorting works everywhere
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? new Date().toISOString(),
      } as MemorialPost;
    });
  } catch (err) {
    console.error('Firestore Read Error in getPosts:', err);
    throw err;
  }
};

export const addPost = async (post: MemorialPost): Promise<string> => {
  console.log('saving draft to Firestore...', post);
  const enrichedPost: any = {
    ...post,
    status: 'pending_payment',
    paymentStatus: 'unpaid',
    isFeatured: post.package === 'Истакнат' ? true : (post.isFeatured ?? false),
  };
  
  if (isMock) {
    enrichedPost.createdAt = new Date().toISOString();
    enrichedPost.id = 'mock-' + Date.now();
    mockPosts = [enrichedPost as MemorialPost, ...mockPosts];
    console.log('generated postId (mock):', enrichedPost.id);
    return enrichedPost.id;
  }
  
  enrichedPost.createdAt = serverTimestamp();
  delete enrichedPost.id; // Let Firestore auto-generate the document ID

  try {
    const docRef = await addDoc(postsCollection, enrichedPost);
    console.log('generated postId (Firestore):', docRef.id);
    return docRef.id;
  } catch (err) {
    console.error('Firestore save failed:', err);
    throw err;
  }
};

/**
 * Called by the Lemon Squeezy webhook / checkout success handler.
 * Marks the post as paid and moves it to 'Чека одобрување' for admin review.
 */
export const markPostPaid = async (id: string, orderId: string): Promise<void> => {
  const now = new Date().toISOString();
  const featuredUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  if (isMock) {
    mockPosts = mockPosts.map(p => {
      if (p.id !== id) return p;
      return {
        ...p,
        paymentStatus: 'paid' as const,
        paymentOrderId: orderId,
        paidAt: now,
        status: 'Чека одобрување' as const,
        ...(p.package === 'Истакнат' ? { isFeatured: true, featuredUntil } : {}),
      };
    });
    return;
  }

  const postRef = doc(postsCollection, id);
  const snap = await getDoc(postRef);
  if (!snap.exists()) throw new Error(`Post ${id} not found`);
  const post = snap.data() as MemorialPost;

  await updateDoc(postRef, {
    paymentStatus: 'paid',
    paymentOrderId: orderId,
    paidAt: now,
    status: 'Чека одобрување',
    ...(post.package === 'Истакнат' ? { isFeatured: true, featuredUntil } : {}),
  });
};

/**
 * Called when the user cancels or abandons the checkout.
 * Keeps the post in 'Во плаќање' so the user can retry.
 */
export const markPostPaymentCancelled = async (id: string): Promise<void> => {
  if (isMock) {
    mockPosts = mockPosts.map(p =>
      p.id === id ? { ...p, paymentStatus: 'cancelled' as const } : p
    );
    return;
  }
  const postRef = doc(postsCollection, id);
  await updateDoc(postRef, { paymentStatus: 'cancelled' });
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

export const getRelatedPosts = async (identifier: string): Promise<MemorialPost[]> => {
  if (isMock) {
    return mockPosts.filter(p => 
      (p.relatedToId === identifier || p.relatedToSlug === identifier) && 
      p.status === 'Објавено'
    );
  }
  
  // For Real Firestore, we query the whole collection and filter locally for simplicity 
  // (unless we want to add multiple queries, but given the scale, local filter is fine for now)
  const allPosts = await getPosts();
  return allPosts.filter(p => 
    (p.relatedToId === identifier || p.relatedToSlug === identifier) && 
    p.status === 'Објавено'
  );
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

