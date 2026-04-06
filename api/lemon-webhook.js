/**
 * Vercel Serverless Function: Lemon Squeezy Webhook
 * Route: POST /api/lemon-webhook
 *
 * Zero-dependency, ESM export default, self-contained.
 * Uses ESM syntax because package.json has "type": "module".
 * With "type": "module", Node.js treats .js as ESM — module.exports
 * would throw ReferenceError. export default is the correct equivalent.
 * No TypeScript, no imports, no external modules.
 */
export default async (req, res) => {
  // ─── 1. METHOD VALIDATION ───────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // ─── 2. SIGNATURE EXTRACTION ──────────────────────────────────────────
    const signature = req.headers["x-signature"] || null;
    // TODO (Security): Verify HMAC-SHA256 signature using process.env.LEMON_WEBHOOK_SECRET
    // before processing payload in production. Example:
    //   import { createHmac } from 'crypto';
    //   const digest = createHmac('sha256', process.env.LEMON_WEBHOOK_SECRET)
    //                        .update(rawBody).digest('hex');
    //   if (digest !== signature) return res.status(401).json({ error: 'Invalid signature' });

    // ─── 3. PAYLOAD NORMALIZATION ─────────────────────────────────────────
    let body = req.body;
    if (typeof body !== "string") {
      body = JSON.stringify(body || {});
    }

    // ─── 4. SAFE LOGGING ──────────────────────────────────────────────────
    const parsed = (() => { try { return JSON.parse(body); } catch { return {}; } })();
    const eventName = parsed?.meta?.event_name || "UNKNOWN";
    const orderId   = parsed?.data?.id          || "UNKNOWN";
    const postId    = parsed?.meta?.custom_data?.postId || "UNKNOWN";

    console.log("[Lemon Webhook]", {
      event:     eventName,
      orderId:   orderId,
      postId:    postId,
      signature: signature ? "present" : "missing",
    });

    // ─── 5. TODO: FUTURE FIRESTORE INTEGRATION ────────────────────────────
    // Uncomment and implement when ready to activate premium features:
    //
    // if (eventName === "order_created") {
    //   const orderStatus = parsed?.data?.attributes?.status;
    //   if (orderStatus === "paid" && postId !== "UNKNOWN") {
    //     // Step 1: Extract custom_data.postId (already done above)
    //     // Step 2: Mark post as paid in Firestore
    //     //   await admin.firestore().doc(`posts/${postId}`).update({
    //     //     isPaid: true,
    //     //     orderId: orderId,
    //     //     paidAt: admin.firestore.FieldValue.serverTimestamp(),
    //     //   });
    //     // Step 3: Activate premium package if applicable
    //     //   const pkg = parsed?.meta?.custom_data?.package;
    //     //   if (pkg === "Истакнат") {
    //     //     await admin.firestore().doc(`posts/${postId}`).update({
    //     //       isFeatured: true,
    //     //       featuredUntil: <computed_date>,
    //     //     });
    //     //   }
    //   }
    // }
    //
    // if (eventName === "order_refunded") {
    //   if (postId !== "UNKNOWN") {
    //     // await admin.firestore().doc(`posts/${postId}`).update({ isPaid: false });
    //   }
    // }

    // ─── 6. SUCCESS RESPONSE ──────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });

  } catch (error) {
    // ─── 7. ERROR RESPONSE ────────────────────────────────────────────────
    console.error("[Lemon Webhook] Critical error:", error?.message || error);
    return res.status(500).json({
      error: "Webhook failed",
    });
  }
};
