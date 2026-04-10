import { createHmac, timingSafeEqual } from 'crypto';
import admin from 'firebase-admin';

export const config = {
  api: { bodyParser: false },
};

// ─── Firebase Admin lazy singleton ───────────────────────────────────────────

let _db = null;

function getDb() {
  if (_db) return _db;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.error('[Webhook/FB] FIREBASE_SERVICE_ACCOUNT is not set');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(raw.replace(/\\n/g, '\n'));

    if (!serviceAccount.project_id) {
      console.error('[Webhook/FB] Service account missing project_id');
      return null;
    }

    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      console.log('[Webhook/FB] Admin SDK initialized:', serviceAccount.project_id);
    }

    _db = admin.firestore();
    return _db;
  } catch (err) {
    console.error('[Webhook/FB] Init failed:', err.message);
    return null;
  }
}

// ─── Raw body reader ─────────────────────────────────────────────────────────

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  // A. Method guard
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // B. Env guard
  const secret = process.env.LEMON_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Webhook] LEMON_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook misconfigured: missing secret' });
  }

  const db = getDb();
  if (!db) {
    console.error('[Webhook] Firestore unavailable — check FIREBASE_SERVICE_ACCOUNT');
    return res.status(500).json({ error: 'Webhook misconfigured: database unavailable' });
  }

  try {
    // C. Raw body + HMAC SHA256 verification
    const rawBody   = await readRawBody(req);
    const signature = req.headers['x-signature'] ?? '';

    const digest    = createHmac('sha256', secret).update(rawBody).digest('hex');
    const digestBuf = Buffer.from(digest, 'utf8');
    const sigBuf    = Buffer.from(signature, 'utf8');

    const sigValid =
      digestBuf.length === sigBuf.length &&
      timingSafeEqual(digestBuf, sigBuf);

    if (!sigValid) {
      console.warn('[Webhook] Rejected — signature mismatch');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // D. Parse verified payload
    const payload    = JSON.parse(rawBody.toString('utf8'));
    const eventName  = payload?.meta?.event_name ?? 'unknown';
    const customData = payload?.meta?.custom_data ?? {};
    const orderId    = payload?.data?.id ?? null;
    const postId     = customData.postId ?? null;
    const pkg        = customData.package ?? null;

    console.log(`[Webhook] Processing event: ${eventName}`, { orderId, postId, pkg });
    
    // E. order_created
    if (eventName === 'order_created') {
      const orderStatus = payload?.data?.attributes?.status;
      if (orderStatus !== 'paid') {
        console.log(`[Webhook] order_created ignored: status is ${orderStatus}`);
        return res.status(200).json({ received: true, processed: false, reason: 'order_not_paid' });
      }

      if (!postId) {
        console.warn('[Webhook] order_created failed: postId missing in custom_data');
        return res.status(200).json({ received: true, processed: false, reason: 'missing_post_id' });
      }

      const postRef  = db.collection('posts').doc(postId);
      const postSnap = await postRef.get();

      if (!postSnap.exists) {
        console.warn(`[Webhook] order_created failed: Post ${postId} not found in Firestore`);
        return res.status(200).json({ received: true, processed: false, reason: 'post_not_found' });
      }

      console.log(`[Webhook] found post: ${postId}`);

      // Idempotency
      const existing = postSnap.data();
      if (existing.paymentStatus === 'paid') {
        console.log(`[Webhook] order_created skipped: Post ${postId} already marked as paid`);
        return res.status(200).json({ received: true, processed: false, reason: 'already_processed' });
      }

      const now    = admin.firestore.FieldValue.serverTimestamp();
      const update = {
        paymentStatus: 'paid',
        status:        'Чека одобрување',
        orderId,
        paidAt:        now,
        updatedAt:     now,
      };

      if (pkg === 'Истакнат') {
        const featuredUntilMs  = Date.now() + 14 * 24 * 60 * 60 * 1000;
        update.isFeatured      = true;
        update.featuredUntil   = admin.firestore.Timestamp.fromMillis(featuredUntilMs);
      }

      await postRef.update(update);
      console.log(`[Webhook] order_created SUCCESS: Post ${postId} updated to status 'Чека одобрување'`);

      // Send confirmation email to user + admin notification
      try {
        const postData = existing;
        const appUrl = (process.env.VITE_APP_URL || 'https://vecenspomen.mk').replace(/\/$/, '');
        await fetch(`${appUrl}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
          },
          body: JSON.stringify({
            type: 'payment_confirmed',
            post: {
              id: postId,
              slug: postData.slug,
              fullName: postData.fullName,
              email: postData.email,
              type: postData.type,
              package: postData.package,
              city: postData.city,
            },
          }),
        });
        console.log(`[Webhook] Email notification triggered for post ${postId}`);
      } catch (emailErr) {
        console.warn('[Webhook] Email notification failed (non-critical):', emailErr.message);
      }

    // F. order_refunded
    } else if (eventName === 'order_refunded') {

      if (!postId) {
        console.warn('[Webhook] order_refunded — postId missing in custom_data');
        return res.status(200).json({ received: true, processed: false, reason: 'missing_post_id' });
      }

      const postRef  = db.collection('posts').doc(postId);
      const postSnap = await postRef.get();

      if (!postSnap.exists) {
        console.warn('[Webhook] order_refunded — post not found, skipping:', postId);
        return res.status(200).json({ received: true, processed: false, reason: 'post_not_found' });
      }

      const now = admin.firestore.FieldValue.serverTimestamp();
      await postRef.update({
        paymentStatus: 'refunded',
        isFeatured:    false,
        featuredUntil: null,
        refundAt:      now,
        updatedAt:     now,
      });
      console.log('[Webhook] Post refund processed:', postId);

    // G. Unknown events — 200 to prevent Lemon retries
    } else {
      console.log('[Webhook] Unknown event, ignoring:', eventName);
    }

    return res.status(200).json({ received: true, processed: true });

  } catch (err) {
    console.error('[Webhook] Unhandled error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
