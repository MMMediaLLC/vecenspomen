import { MemorialPost } from '../types';

type EmailType = 'approved' | 'rejected';

export async function sendStatusEmail(type: EmailType, post: MemorialPost): Promise<void> {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        post: {
          id: post.id,
          slug: post.slug,
          fullName: post.fullName,
          email: post.email,
          type: post.type,
          package: post.package,
          city: post.city,
        },
      }),
    });
  } catch (err) {
    // Email failure is non-critical — log and continue
    console.warn('[Email] Failed to send status email:', err);
  }
}
