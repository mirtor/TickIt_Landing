export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, message, visibility } = req.body || {};

    if (!name?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!repo || !token) {
      return res.status(500).json({ error: "Server not configured" });
    }

    const title =
      visibility === "private"
        ? `🔒 Private feedback: ${name.trim().slice(0, 40)}`
        : `💬 Public suggestion: ${name.trim().slice(0, 40)}`;

    const body = [
      `**Name:** ${name.trim()}`,
      `**Visibility:** ${visibility || "public"}`,
      ``,
      message.trim(),
      ``,
      `— Sent from Tickit landing`,
    ].join("\n");

    const labels =
      visibility === "private"
        ? ["feedback", "private"]
        : ["feedback", "public"];


    const ghRes = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ title, body, labels }),
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      return res.status(500).json({ error: "GitHub error", details: errText });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Unexpected error" });
  }
}
