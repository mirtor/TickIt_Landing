export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const repo = process.env.GITHUB_REPO;
    if (!repo) {
      return res.status(500).json({ error: "Server not configured" });
    }

    // Usa token si existe pero no es obligatorio para leer repo público
    const token = process.env.GITHUB_TOKEN;

    const url = new URL(`https://api.github.com/repos/${repo}/issues`);
    url.searchParams.set("state", "open");
    url.searchParams.set("labels", "feedback,approved");
    url.searchParams.set("per_page", "20");

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

    // Extraemos nombre y mensaje del body con un parse simple
    const parsed = (Array.isArray(issues) ? issues : []).map((i) => {
      const body = String(i.body || "");

      // Intento de lectura del formato que generamos
      const nameMatch = body.match(/\*\*Name:\*\*\s*(.+)/i);
      const name = nameMatch ? nameMatch[1].trim() : "";

      // Mensaje: tomamos líneas posteriores ignorando metadatos
      const lines = body.split("\n").map((l) => l.trim());
      const cleaned = lines.filter(
        (l) =>
          l &&
          !l.toLowerCase().startsWith("**name:**") &&
          !l.startsWith("— Sent from")
      );

      // Si el formato es el nuestro, la primera línea útil suele ser el mensaje
      // Unimos por seguridad
      const message = cleaned.join("\n").trim();

      return { name, message };
    }).filter((x) => x.name || x.message);

    // Cache suave
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(parsed);
  } catch {
    return res.status(500).json({ error: "Unexpected error" });
  }
}
