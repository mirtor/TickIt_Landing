export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const repo = process.env.GITHUB_REPO;
    if (!repo) {
      return res.status(500).json({ error: "Server not configured" });
    }

    const token = process.env.GITHUB_TOKEN;

    // limit por query ?limit=8
    const limitParam = parseInt(req.query?.limit, 10);
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 50)) : 8;

    const url = new URL(`https://api.github.com/repos/${repo}/issues`);
    url.searchParams.set("state", "open");
    url.searchParams.set("labels", "feedback"); // más robusto
    url.searchParams.set("per_page", "50");

    const ghRes = await fetch(url.toString(), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/vnd.github+json",
      },
    });

    if (!ghRes.ok) {
      const errText = await ghRes.text();
      return res.status(500).json({ error: "GitHub error", details: errText });
    }

    const issues = await ghRes.json();

    const approvedIssues = (Array.isArray(issues) ? issues : []).filter((i) => {
      const labels = Array.isArray(i.labels) ? i.labels : [];
      return labels.some((l) => String(l.name || "").toLowerCase() === "approved");
    });

    // ordena por más recientes
    approvedIssues.sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return db - da;
    });

    const parsed = approvedIssues.map((i) => {
      const body = String(i.body || "");
      const nameMatch = body.match(/\*\*Name:\*\*\s*(.+)/i);
      const name = nameMatch ? nameMatch[1].trim() : "";

      const lines = body.split("\n").map((l) => l.trim());
      const cleaned = lines.filter(
        (l) =>
          l &&
          !l.toLowerCase().startsWith("**name:**") &&
          !l.startsWith("— Sent from")
      );

      const message = cleaned.join("\n").trim();
      return { name, message };
    }).filter((x) => x.name || x.message);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(parsed.slice(0, limit));
  } catch {
    return res.status(500).json({ error: "Unexpected error" });
  }
}
