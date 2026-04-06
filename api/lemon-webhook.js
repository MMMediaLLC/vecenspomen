module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const signature = req.headers["x-signature"] || null;

    let body = req.body;
    if (typeof body !== "string") {
      body = JSON.stringify(body || {});
    }

    console.log("Lemon webhook received", {
      signature,
      body,
    });

    return res.status(200).json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      error: "Webhook failed",
    });
  }
};
