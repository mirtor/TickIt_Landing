// Change this to your real app URL if needed:
const APP_URL = "https://apptasks-49a0a.web.app";

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

// -------- Language buttons  --------
const langBtns = document.querySelectorAll(".lang-btn");
langBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    if (lang === "en") {
      // Ajusta este archivo cuando lo traduzcamos
      window.location.href = "./index-en.html";
      return;
    }
    // ES: estamos aquí
    langBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});




// -------- Form  --------
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

    const name = form.querySelector("#name")?.value || "";
    const message = form.querySelector("#message")?.value || "";
    const visibility = form.querySelector("#visibility")?.value || "public";

    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, visibility }),
      });

      if (!r.ok) throw new Error("Bad response");

      form.reset();
      if (msgCount) msgCount.textContent = "0";

      alert("¡Gracias! Comentario enviado.");
    } catch {
      alert("No se pudo enviar. Inténtalo de nuevo.");
    }
  });
}


wireOpenAppLinks();
