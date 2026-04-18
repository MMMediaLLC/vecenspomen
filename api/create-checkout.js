// api/create-checkout.js
// Builds a direct Lemon Squeezy checkout URL with custom postId and packageType params.
// No API key needed — buy links are public, custom data is passed via query string.

const URL_BASIC    = process.env.LEMON_OSNOVEN_URL;
const URL_FEATURED = process.env.LEMON_ISTAKNAT_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { postId, packageName } = req.body;
  if (!postId || !packageName) {
    return res.status(400).json({ error: 'Missing postId or packageName' });
  }

  const isFeature =
    packageName === '\u0418\u0441\u0442\u0430\u043a\u043d\u0430\u0442' || // Истакнат (Cyrillic)
    packageName === 'Истакнат' ||
    packageName.toLowerCase() === 'istaknat';

  const baseCheckout = isFeature ? URL_FEATURED : URL_BASIC;
  const url = `${baseCheckout}&checkout[custom][postId]=${encodeURIComponent(postId)}&checkout[custom][packageType]=${encodeURIComponent(packageName)}`;

  return res.status(200).json({ url });
}
