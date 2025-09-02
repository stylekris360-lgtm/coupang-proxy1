import crypto from "crypto";

export default async function handler(req, res) {
  const { keyword, limit = 10 } = req.query;

  // 환경변수에서 키 불러오기
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;

  const method = "GET";
  const path = `/v2/providers/affiliate_open_api/apis/openapi/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;

  const datetime = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const message = `${datetime}\n${method}\n${path}\n`;

  const signature = crypto
    .createHmac("sha256", secretKey)
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
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
