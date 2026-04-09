import { markPostPaid, markPostPaymentCancelled } from './posts';

/**
 * Webhook helper for Lemon Squeezy integration.
 * This logic handles incoming webhooks locally or on a serverless function.
 */
export const handleLemonWebhook = async (event: any) => {
  const eventName = event.meta?.event_name;
  const customData = event.meta?.custom_data;
  
  if (!customData || !customData.postId) {
    console.warn('Webhook received but missing postId in custom_data');
    return;
  }

  const postId = customData.postId;
  
  try {
    if (eventName === 'order_created') {
      const orderId = event.data?.id;
      const status = event.data?.attributes?.status; // 'paid', 'failed' etc.

      if (status === 'paid') {
        await markPostPaid(postId, orderId);
        console.log(`Successfully verified and marked post ${postId} as paid.`);
      }
    } else if (eventName === 'order_refunded' || eventName === 'subscription_cancelled') {
      await markPostPaymentCancelled(postId);
      console.log(`Payment cancelled/refunded for post ${postId}.`);
    }
  } catch (err) {
    console.error(`Error processing webhook for post ${postId}:`, err);
    throw err;
  }
};
