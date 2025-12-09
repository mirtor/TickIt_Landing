// Change this to your real app URL if needed:
const APP_URL = "https://apptasks-49a0a.web.app";

// ---------------- Open app links ----------------
function wireOpenAppLinks() {
  const ids = [
    "openAppTop",
    "openAppHero",
    "openAppHow",
    "openAppBottom",
    "openAppFooter",
  ];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(APP_URL, "_blank", "noopener,noreferrer");
    });
  });
}

wireOpenAppLinks();

// ---------------- Language buttons ----------------
// -------- Language buttons  --------
const langBtns = document.querySelectorAll(".lang-btn");

function getLangTarget(lang) {
  const path = window.location.pathname.toLowerCase();

  // Estamos en páginas de privacidad
  if (path.includes("/pages/privacy")) {
    return lang === "en" ? "/pages/privacy-en.html" : "/pages/privacy.html";
  }

  // Resto de páginas (home)
  return lang === "en" ? "/index-en.html" : "/index.html";
}

langBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    if (!lang) return;

    const target = getLangTarget(lang);

    // Evita recarga innecesaria
    if (window.location.pathname === target) return;

    window.location.href = target;
  });
});


// ---------------- Comments form ----------------
const form = document.getElementById("commentForm");
const msg = document.getElementById("message");
const msgCount = document.getElementById("msgCount");

if (msg && msgCount) {
  msg.addEventListener("input", () => {
    msgCount.textContent = String(msg.value.length);
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector("#name")?.value?.trim() || "";
    const message = form.querySelector("#message")?.value?.trim() || "";

    if (!name || !message) {
      alert("Completa nombre y comentario.");
      return;
    }

    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "Bad response");

      form.reset();
      if (msgCount) msgCount.textContent = "0";

      alert("¡Gracias! Tu comentario quedó pendiente de revisión.");
    } catch {
      alert("No se pudo enviar. Inténtalo de nuevo.");
    }
  });
}

// ---------------- Load approved comments ----------------
async function loadApprovedComments() {
  const list = document.getElementById("commentsList");
  if (!list) return;

  try {
    const r = await fetch("/api/comments");
    if (!r.ok) throw new Error("Bad response");
    const items = await r.json();

    list.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "comment-empty muted";
      empty.textContent = "Aún no hay comentarios aprobados.";
      list.appendChild(empty);
      return;
    }

    items.forEach((c) => {
      const card = document.createElement("div");
      card.className = "comment-card";

      const name = document.createElement("div");
      name.className = "comment-card__name";
      name.textContent = c.name || "Anónimo";

      const text = document.createElement("p");
      text.className = "comment-card__text";
      text.textContent = c.message || "";

      card.appendChild(name);
      card.appendChild(text);
      list.appendChild(card);
    });
  } catch {
    // Silencioso para no ensuciar UX
  }
}

loadApprovedComments();
