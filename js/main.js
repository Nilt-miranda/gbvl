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

  // Conquistas: atualiza medalhas e campeonatos direto do Smoothcomp.
  // Se o Smoothcomp não responder, a página continua com os números escritos no HTML.
  const medals = document.querySelector("[data-smoothcomp]");
  if (medals) updateMedals(medals, medals.dataset.smoothcomp);
})();

async function updateMedals(root, clubId) {
  const base = `https://smoothcomp.com/pt_BR/academy/${clubId}`;
  const get = async (path) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`${base}/${path}`, {
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()).data;
    } finally {
      clearTimeout(timer);
    }
  };

  let totals, events;
  try {
    [totals, events] = await Promise.all([get("medals"), get("past-events?page=1")]);
  } catch (err) {
    console.info("Smoothcomp indisponível; mantendo os dados da página.", err);
    return;
  }
  if (!totals || !Array.isArray(events)) return;

  // Anel e totais
  const kinds = [
    ["gold", "ouro", "Ouro"],
    ["silver", "prata", "Prata"],
    ["bronze", "bronze", "Bronze"],
  ];
  const sum = kinds.reduce((n, [k]) => n + (totals[k] || 0), 0);
  if (sum > 0) {
    const C = 2 * Math.PI * 80; // circunferência do anel (r = 80)
    const GAP = 14; // espaço entre as cores (as pontas são arredondadas)
    let offset = 0;
    kinds.forEach(([k, pt]) => {
      const seg = ((totals[k] || 0) / sum) * C;
      const arc = root.querySelector(`.medals-ring .arc--${k}`);
      if (arc) {
        arc.setAttribute("stroke-dasharray", `${Math.max(seg - GAP, 0).toFixed(1)} ${C.toFixed(2)}`);
        arc.setAttribute("stroke-dashoffset", (-offset).toFixed(1));
        arc.style.display = seg > 0 ? "" : "none";
      }
      offset += seg;
      const stat = root.querySelector(`.medal-stat .medalha--${pt} b`);
      if (stat) stat.textContent = totals[k] || 0;
    });
    const count = root.querySelector(".medals-count strong");
    if (count) count.textContent = sum;
  }

  // Lista de campeonatos
  const list = root.querySelector(".events");
  if (list && events.length) {
    const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    list.replaceChildren(
      ...events.slice(0, 5).map((ev) => {
        const date = new Date(ev.start_date);
        const li = el("li", "event");

        const time = el("time");
        time.dateTime = ev.start_date.slice(0, 10);
        time.append(el("b", "", String(date.getUTCDate()).padStart(2, "0")), `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`);

        const info = el("div", "event-info");
        const wins = ev.wins ? ` · ${ev.wins} ${ev.wins === 1 ? "vitória" : "vitórias"}` : "";
        info.append(el("strong", "", prettyName(ev.title)), el("span", "", prettyName(ev.city) + wins));

        const meds = el("div", "event-medals");
        kinds.forEach(([k, pt, label]) => {
          const n = ev.medals && ev.medals[k];
          if (n) meds.append(medal(pt, label, n));
        });

        li.append(time, info, meds);
        return li;
      })
    );

    const latest = new Date(events[0].start_date);
    const MONTHS_FULL = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const updated = root.querySelector(".medals-updated");
    if (updated) {
      updated.textContent = `Dados do Smoothcomp · último campeonato em ${MONTHS_FULL[latest.getUTCMonth()]} de ${latest.getUTCFullYear()}`;
    }
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function medal(kind, label, n) {
    const span = el("span", `medalha medalha--${kind}`);
    span.title = label;
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS(svgNS, "use");
    use.setAttribute("href", "#medalha");
    svg.append(use);
    span.append(svg, el("b", "", n));
    return span;
  }
}

// Deixa os nomes do Smoothcomp no padrão do site ("BRASILEIRO COMPNET 2026" → "Brasileiro CompNet 2026")
function prettyName(text) {
  if (!text) return "";
  let s = text.trim();
  if (s === s.toUpperCase()) {
    const small = ["de", "da", "do", "das", "dos", "e", "em"];
    s = s
      .toLowerCase()
      .split(/\s+/)
      .map((w, i) => (i > 0 && small.includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(" ");
  }
  const fixes = [
    [/\bCompnet\b/gi, "CompNet"],
    [/\bSul Americano\b/gi, "Sul-Americano"],
    [/\bJiu Jitsu\b/gi, "Jiu-Jitsu"],
    [/\bSao Paulo\b/gi, "São Paulo"],
    [/\b(Cbjje|Cbjj|Fpjj|Ibjjf|Fjjam|Sp)\b/g, (m) => m.toUpperCase()],
  ];
  fixes.forEach(([re, rep]) => (s = s.replace(re, rep)));
  return s;
}
