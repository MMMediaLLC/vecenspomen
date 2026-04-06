import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleLemonWebhook } from '../src/lib/lemonWebhook';

/**
 * Vercel Serverless Function: Lemon Squeezy Webhook Receiver
 * Route: /api/lemon-webhook
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Vercel parses application/json automatically into req.body
    const rawBody = req.body;
    const signature = req.headers['x-signature'];

    console.log("Lemon webhook received", {
      signature: signature ? 'present' : 'missing',
      event: rawBody?.meta?.event_name,
      order: rawBody?.data?.id
    });

    if (!signature) {
      console.warn('⚠️ Webhook received without X-Signature header.');
      // Do not block MVP test
    }

    await handleLemonWebhook(rawBody);

    return res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Webhook failed" });
  }
}
