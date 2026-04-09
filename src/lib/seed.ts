import { SEEDED_POSTS } from '../constants';
import { db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export const seedFirestore = async () => {
  const postsCollection = collection(db, 'posts');
  let addedCount = 0;
  let skippedCount = 0;

  for (const post of SEEDED_POSTS) {
    const docRef = doc(postsCollection, post.id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      await setDoc(docRef, post);
      addedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log(`Seeding complete. Added: ${addedCount}, Skipped (already exist): ${skippedCount}`);
};
