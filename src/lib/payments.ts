/**
 * Lemon Squeezy Checkout Helper
 * Checkout се создава server-side преку /api/create-checkout
 * за да не се изложи API клучот во browser-от.
 */

export const createLemonCheckout = async (postId: string, packageName: string): Promise<void> => {
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, packageName }),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Checkout failed (${response.status}): ${raw}`);
  }

  const data = JSON.parse(raw);
  const url = data.url || data.checkoutUrl;

  if (!url) throw new Error('No checkout URL in response');

  window.location.href = url;
};
