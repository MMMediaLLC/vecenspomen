// api/create-checkout.js
// Server-side Lemon Squeezy checkout creation
// API клучот останува на серверот, не е видлив во browser

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { postId, packageName } = req.body;
  if (!postId || !packageName) {
    return res.status(400).json({ error: 'Missing postId or packageName' });
  }

  const storeId   = process.env.LEMON_STORE_ID;
  const apiKey    = process.env.LEMON_API_KEY;
  const baseUrl   = (process.env.VITE_APP_URL || 'https://vechen-spomen.mk').replace(/\/$/, '');

  const variantId = packageName === 'Истакнат'
    ? process.env.LEMON_FEATURED_VARIANT_ID
    : process.env.LEMON_BASIC_VARIANT_ID;

  if (!apiKey || !storeId || !variantId) {
    console.error('[Checkout] Missing Lemon Squeezy env vars');
    return res.status(500).json({ error: 'Checkout service not configured' });
  }

  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom_data: { postId, package: packageName }
            },
            product_options: {
              redirect_url: `${baseUrl}/payment/success?postId=${postId}`
            }
          },
          relationships: {
            store:   { data: { type: 'stores',   id: storeId.toString() } },
            variant: { data: { type: 'variants', id: variantId.toString() } }
          }
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Checkout] Lemon API error:', err);
      return res.status(502).json({ error: 'Failed to create checkout' });
    }

    const result = await response.json();
    return res.status(200).json({ url: result.data.attributes.url });

  } catch (err) {
    console.error('[Checkout] Unexpected error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
