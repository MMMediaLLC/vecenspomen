import { collection, doc, getDocs, getDoc, updateDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { MemorialPost, PostStatus } from '../types';

const postsCollection = collection(db, 'posts');

export const getPosts = async (): Promise<MemorialPost[]> => {
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
  const enrichedPost: any = {
    ...post,
    status: 'pending_payment',
    paymentStatus: 'unpaid',
    isFeatured: post.package === 'Истакнат' ? true : (post.isFeatured ?? false),
    createdAt: serverTimestamp(),
  };
  delete enrichedPost.id;

  try {
    const docRef = await addDoc(postsCollection, enrichedPost);
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
  const postRef = doc(postsCollection, id);
  await updateDoc(postRef, { paymentStatus: 'cancelled' });
};

export const updatePostStatus = async (id: string, status: PostStatus): Promise<void> => {
  const docRef = doc(postsCollection, id);
  await updateDoc(docRef, { status });
};

export const uploadOgImage = async (postId: string, blob: Blob): Promise<string> => {
  const storageRef = ref(storage, `og-images/${postId}.png`);
  await uploadBytes(storageRef, blob, { contentType: 'image/png' });
  const url = await getDownloadURL(storageRef);
  await updateDoc(doc(postsCollection, postId), { ogImageUrl: url });
  return url;
};

export const updatePost = async (id: string, data: Partial<MemorialPost>): Promise<void> => {
  const docRef = doc(postsCollection, id);
  await updateDoc(docRef, data);
};

export const updateMemorialPost = async (id: string, data: Partial<MemorialPost>, adminEmail?: string | null): Promise<void> => {
  const docRef = doc(postsCollection, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
    lastEditedBy: adminEmail || 'Admin',
  });
};

export const deleteMemorialPost = async (id: string): Promise<void> => {
  const docRef = doc(postsCollection, id);
  await deleteDoc(docRef);
};

export const getPostById = async (id: string): Promise<MemorialPost | null> => {
  const snap = await getDoc(doc(postsCollection, id));
  return snap.exists() ? { ...snap.data(), id: snap.id } as MemorialPost : null;
};

export const getPostBySlug = async (slug: string): Promise<MemorialPost | null> => {
  const snapshot = await getDocs(postsCollection);
  const docSnap = snapshot.docs.find(d => (d.data() as any).slug === slug);
  return docSnap ? { ...(docSnap.data() as object), id: docSnap.id } as MemorialPost : null;
};

export const getRelatedPosts = async (identifier: string): Promise<MemorialPost[]> => {
  const allPosts = await getPosts();
  return allPosts.filter(p => 
    (p.relatedToId === identifier || p.relatedToSlug === identifier) && 
    p.status === 'Објавено'
  );
};

export const addGuestbookEntry = async (postId: string, entry: MemorialPost['guestbookEntries'][0]): Promise<void> => {
  const post = await getPostById(postId);
  if (post) {
    const updatedEntries = [...(post.guestbookEntries || []), entry];
    await updateDoc(doc(postsCollection, postId), { guestbookEntries: updatedEntries });
  }
};

export const updateGuestbookEntryStatus = async (postId: string, entryId: string, status: 'approved' | 'pending'): Promise<void> => {
  const post = await getPostById(postId);
  if (post && post.guestbookEntries) {
    const updatedEntries = post.guestbookEntries.map(e => e.id === entryId ? { ...e, status } : e);
    await updateDoc(doc(postsCollection, postId), { guestbookEntries: updatedEntries });
  }
};

export const deleteGuestbookEntry = async (postId: string, entryId: string): Promise<void> => {
  const post = await getPostById(postId);
  if (post && post.guestbookEntries) {
    const updatedEntries = post.guestbookEntries.filter(e => e.id !== entryId);
    await updateDoc(doc(postsCollection, postId), { guestbookEntries: updatedEntries });
  }
};

