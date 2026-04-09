/**
 * Lemon Squeezy Checkout Helper
 */

export const createLemonCheckout = async (postId: string, packageName: string): Promise<string> => {
  const storeId = import.meta.env.VITE_LEMON_STORE_ID;
  const apiKey = import.meta.env.VITE_LEMON_API_KEY;
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  let variantId = import.meta.env.VITE_LEMON_BASIC_VARIANT_ID;
  if (packageName === 'Истакнат') {
    variantId = import.meta.env.VITE_LEMON_FEATURED_VARIANT_ID;
  }

  // Fallback map if needed in mock/dev scenarios without API keys
  if (!apiKey || !storeId || !variantId) {
    console.warn("Lemon Squeezy credentials missing. Simulating checkout for dev environment.");
    return `${baseUrl}/payment/success?postId=${postId}&mock=true`;
  }

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
            custom_data: {
              postId: postId,
              package: packageName
            }
          },
          product_options: {
            redirect_url: `${baseUrl}/payment/success?postId=${postId}`
          }
        },
        relationships: {
          store: {
            data: { type: 'stores', id: storeId.toString() }
          },
          variant: {
            data: { type: 'variants', id: variantId.toString() }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Checkout Api Error", errText);
    throw new Error(`Failed to create Lemon Squeezy checkout session.`);
  }

  const result = await response.json();
  return result.data.attributes.url;
};
