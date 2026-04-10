/**
 * Lemon Squeezy Checkout Helper
 * Checkout се создава server-side преку /api/create-checkout
 * за да не се изложи API клучот во browser-от.
 */

export const createLemonCheckout = async (postId: string, packageName: string): Promise<string> => {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  // Dev/mock fallback — ако нема серверски конфиг
  const hasConfig = import.meta.env.VITE_LEMON_STORE_ID && import.meta.env.VITE_LEMON_API_KEY;
  if (!hasConfig) {
    console.warn('Lemon Squeezy not configured. Simulating checkout for dev environment.');
    return `${baseUrl}/payment/success?postId=${postId}&mock=true`;
  }

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
