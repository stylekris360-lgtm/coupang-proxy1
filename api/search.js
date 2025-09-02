import { createHmac } from "crypto";

export default async function handler(req, res) {
  const { keyword, limit = 10 } = req.query;

  const accessKey = process.env.Coupang_ACCESS_KEY;
  const secretKey = process.env.Coupang_SECRET_KEY;

  if (!accessKey || !secretKey) {
    return res.status(500).json({ error: "Missing API keys" });
  }

  const method = "GET";
  const path = `/v2/providers/affiliate_open_api/apis/openapi/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
  const datetime = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  // ✅ Message: datetime + method + path (쿼리까지 포함)
  const message = `${datetime}\n${method}\n${path}\n`;

  const signature = createHmac("sha256", secretKey)
    .update(message)
    .digest("hex");

  const authorization = `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;

  try {
    const response = await fetch(`https://api-gateway.coupang.com${path}`, {
      method,
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
}
