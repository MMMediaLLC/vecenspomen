/**
 * Lemon Squeezy Checkout Helper
 * Checkout се создава server-side преку /api/create-checkout
 * за да не се изложи API клучот во browser-от.
 */

export const createLemonCheckout = async (postId: string, packageName: string): Promise<string> => {
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId, packageName }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create checkout session');
  }

  const { url } = await response.json();
  return url;
};
