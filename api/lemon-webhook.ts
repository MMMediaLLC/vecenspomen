import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleLemonWebhook } from '../src/lib/lemonWebhook';

/**
 * Vercel Serverless Function: Lemon Squeezy Webhook Receiver
 * Endpoint: POST /api/lemon-webhook
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Expected POST.' });
  }

  try {
    const payload = req.body;
    const signature = req.headers['x-signature'];

    /* 
     * SECURITY PREP: 
     * TODO: Implement full HMAC signature verification using process.env.LEMON_WEBHOOK_SECRET
     * To securely handle this in the future, you may need to disable the default Vercel bodyParser 
     * in the config object to read the raw buffer.
     */
    if (!signature) {
      console.warn('⚠️ Webhook received without X-Signature header.');
      // Proceeding without blocking as per current development phase instructions
    }

    const eventName = payload?.meta?.event_name || 'UNKNOWN_EVENT';
    const orderId = payload?.data?.id || 'UNKNOWN_ORDER';
    const postId = payload?.meta?.custom_data?.postId || 'UNKNOWN_POST';

    console.log(`[Webhook Received] Event: ${eventName} | Order: ${orderId} | PostId: ${postId}`);

    // Forward the safely parsed payload to our isolated business logic
    await handleLemonWebhook(payload);

    console.log(`[Webhook Success] Finished processing event: ${eventName} for PostId: ${postId}`);
    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('[Webhook Error] Critical failure during webhook processing:', error?.message || error);
    return res.status(500).json({ error: 'Internal Server Error during webhook processing.' });
  }
}
