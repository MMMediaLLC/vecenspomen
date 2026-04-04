import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MemorialPost } from '../types';
import { SubmitPost } from './SubmitPost';
import { updateMemorialPost } from '../lib/posts';
import { auth } from '../lib/firebase';

interface EditPostProps {
  posts: MemorialPost[];
}

export const EditPost: React.FC<EditPostProps> = ({ posts }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const postToEdit = posts.find((p) => p.id === id);

  if (!postToEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-stone-400">
        <p className="font-serif text-2xl text-stone-800 mb-2 italic">Објавата не е пронајдена</p>
        <button onClick={() => navigate('/admin')} className="text-stone-500 hover:text-stone-900 underline font-light">Врати се назад</button>
      </div>
    );
  }

  const handleComplete = async (updatedPost: MemorialPost) => {
    try {
      const adminEmail = auth.currentUser?.email || 'admin@vechen-spomen.mk';
      await updateMemorialPost(updatedPost.id, updatedPost, adminEmail);
      navigate('/admin');
      window.scrollTo(0, 0);
      window.location.reload(); // Quick refresh to sync App.tsx state from db since it doesn't wait
    } catch (err) {
      console.error("Error updating post:", err);
      // Fallback
      navigate('/admin');
    }
  };

  return <SubmitPost initialPost={postToEdit} isEditMode={true} onComplete={handleComplete} />;
};
