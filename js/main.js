/* =========================================================
   Gracie Barra Vila Leopoldina — scripts
   ========================================================= */

// Número do WhatsApp da academia (DDI + DDD + número, só dígitos).
// Todos os botões com [data-wa] usam este número.
const WHATSAPP = "5511970741081";

(function () {
  const body = document.body;
  const header = document.querySelector(".header");

  // Links de WhatsApp: monta a URL com a mensagem de cada botão
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const msg = el.dataset.wa || "Olá! Gostaria de agendar uma aula experimental.";
    el.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
    el.target = "_blank";
    el.rel = "noopener";
  });

  // Header fica sólido ao rolar (na home, que começa transparente)
  if (header && !header.classList.contains("header--solid")) {
    const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Menu mobile
  const toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open);
    });
    document.querySelectorAll(".nav a").forEach((a) =>
      a.addEventListener("click", () => {
        body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  // Abas de horários: abre no dia de hoje (domingo cai na segunda)
  const dayTabs = document.querySelectorAll("[data-day]");
  if (dayTabs.length) {
    const show = (day) => {
      dayTabs.forEach((t) => t.classList.toggle("is-active", t.dataset.day === day));
      document.querySelectorAll(".schedule-day").forEach((d) =>
        d.classList.toggle("is-active", d.id === `dia-${day}`)
      );
    };
    dayTabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.day)));
    const keys = ["seg", "seg", "ter", "qua", "qui", "sex", "sab"];
    show(keys[new Date().getDay()]);
  }

  // Abas de planos (GB Kids / GB Masculino / GB Feminino)
  const planTabs = document.querySelectorAll("[data-plan]");
  planTabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      planTabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      document.querySelectorAll(".plan-panel").forEach((p) =>
        p.classList.toggle("is-active", p.id === `plano-${tab.dataset.plan}`)
      );
    })
  );

  // Filtro de professores por modalidade
  const filters = document.querySelectorAll("[data-filter]");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => b.classList.toggle("is-active", b === btn));
      document.querySelectorAll(".teacher").forEach((t) => {
        t.hidden = f !== "todos" && !t.dataset.modalidades.split(" ").includes(f);
      });
    })
  );

  // Ano no rodapé
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
