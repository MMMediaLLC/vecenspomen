// api/check-reminders.js
// Cron job — се извршува секој ден во 09:00 UTC
// Проверува дали има потсетници за праќање (40 дена, 6 месеци, 1 година)

import admin from 'firebase-admin';

let _db = null;

function getDb() {
  if (_db) return _db;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const serviceAccount = JSON.parse(raw.replace(/\\n/g, '\n'));
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    _db = admin.firestore();
    return _db;
  } catch (err) {
    console.error('[Reminders] Firebase init failed:', err.message);
    return null;
  }
}

async function sendReminderEmail(post, reminderType) {
  const appUrl = (process.env.VITE_APP_URL || 'https://vechen-spomen.mk').replace(/\/$/, '');
  const response = await fetch(`${appUrl}/api/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
    },
    body: JSON.stringify({
      type: 'reminder',
      post: { ...post, reminderType },
    }),
  });
  if (!response.ok) {
    throw new Error(`send-email failed: ${await response.text()}`);
  }
}

// Проверува дали денешниот датум е во прозорецот за праќање на потсетникот
// Праќаме 2 дена пред точниот датум за да се стигне навреме
function isDue(scheduledDate) {
  const target = new Date(scheduledDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
  // Прати 2 дена пред (diffDays === 2) или на денот (diffDays === 0 или -1)
  return diffDays >= -1 && diffDays <= 2;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default async function handler(req, res) {
  // Верификација — само Vercel Cron може да го повика ова
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (!process.env.RESEND_API_KEY) {
    console.log('[Reminders] RESEND_API_KEY not set — skipping');
    return res.status(200).json({ skipped: true, reason: 'email_not_configured' });
  }

  const db = getDb();
  if (!db) {
    return res.status(500).json({ error: 'Database unavailable' });
  }

  try {
    // Само ТАЖНА ВЕСТ, Объавено, со dateOfDeath
    const snapshot = await db.collection('posts')
      .where('type', '==', 'ТАЖНА ВЕСТ')
      .where('status', '==', 'Објавено')
      .get();

    const results = [];

    for (const docSnap of snapshot.docs) {
      const post = { id: docSnap.id, ...docSnap.data() };
      if (!post.dateOfDeath || !post.email) continue;

      // Веќе пратени потсетници
      const remindersSent = post.remindersSent || [];

      const checks = [
        { type: '40_days',  scheduledDate: addDays(post.dateOfDeath, 38) },  // 2 дена пред 40-иот ден
        { type: '6_months', scheduledDate: addDays(post.dateOfDeath, 180) },
        { type: '1_year',   scheduledDate: addDays(post.dateOfDeath, 363) },
      ];

      for (const check of checks) {
        if (remindersSent.includes(check.type)) continue;
        if (!isDue(check.scheduledDate)) continue;

        try {
          await sendReminderEmail({
            id: post.id,
            slug: post.slug,
            fullName: post.fullName,
            email: post.email,
            dateOfDeath: post.dateOfDeath,
          }, check.type);

          // Означи го како пратен
          await docSnap.ref.update({
            remindersSent: admin.firestore.FieldValue.arrayUnion(check.type),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          results.push({ postId: post.id, fullName: post.fullName, reminderType: check.type, sent: true });
          console.log(`[Reminders] Sent ${check.type} for ${post.fullName} (${post.id})`);
        } catch (err) {
          console.error(`[Reminders] Failed for ${post.id} ${check.type}:`, err.message);
          results.push({ postId: post.id, reminderType: check.type, sent: false, error: err.message });
        }
      }
    }

    return res.status(200).json({ processed: snapshot.size, sent: results.filter(r => r.sent).length, results });
  } catch (err) {
    console.error('[Reminders] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
