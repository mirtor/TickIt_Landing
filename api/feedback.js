export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, message } = req.body || {};

    if (!name?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const repo = process.env.GITHUB_REPO; // "usuario/repo"
    const token = process.env.GITHUB_TOKEN;

    if (!repo || !token) {
      return res.status(500).json({ error: "Server not configured" });
    }

    const safeName = name.trim().slice(0, 60);
    const safeMsg = message.trim().slice(0, 280);

    // Creamos como "pending" para moderación
    const title = `💬 Feedback: ${safeName}`;

    const body = [
      `**Name:** ${safeName}`,
      ``,
      safeMsg,
      ``,
      `— Sent from TickIt landing`,
    ].join("\n");

    const labels = ["feedback", "pending"];

    const ghRes = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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
  } catch {
    return res.status(500).json({ error: "Unexpected error" });
  }
}
