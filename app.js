const state = {
  data: null,
  search: "",
  scope: "alle",
  aufwand: "alle",
  minRating: 0,
  sort: "date",
};

const els = {
  metaBar: document.getElementById("metaBar"),
  searchInput: document.getElementById("searchInput"),
  scopeFilter: document.getElementById("scopeFilter"),
  aufwandFilter: document.getElementById("aufwandFilter"),
  ratingFilter: document.getElementById("ratingFilter"),
  sortSelect: document.getElementById("sortSelect"),
  resultCount: document.getElementById("resultCount"),
  cardList: document.getElementById("cardList"),
  emptyState: document.getElementById("emptyState"),
};

function stars(n) {
  const full = "★".repeat(n);
  const empty = "☆".repeat(5 - n);
  return full + empty;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

async function loadData() {
  const res = await fetch("data.json", { cache: "no-store" });
  state.data = await res.json();
  populateScopeOptions();
  renderMeta();
  render();
}

function populateScopeOptions() {
  const scopes = Array.from(new Set(state.data.entries.map((e) => e.scope))).sort();
  for (const s of scopes) {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    els.scopeFilter.appendChild(opt);
  }
}

function renderMeta() {
  const m = state.data.meta || {};
  els.metaBar.innerHTML = `
    <span>Letzte Recherche: <strong>${escapeHtml(m.lastRun || "–")}</strong></span>
    <span>Nächste ca.: <strong>${escapeHtml(m.nextRunApprox || "–")}</strong></span>
    <span>Runde: <strong>#${escapeHtml(String(m.cycle ?? "–"))}</strong></span>
  `;
}

function applyFiltersAndSort() {
  let entries = state.data.entries.slice();

  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    entries = entries.filter((e) =>
      [e.trend, e.luecke, e.kunde, ...(e.plan || []), ...(e.vorlagen || []).map((v) => v.titel + " " + v.text)]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  if (state.scope !== "alle") {
    entries = entries.filter((e) => e.scope === state.scope);
  }

  if (state.aufwand !== "alle") {
    entries = entries.filter((e) => e.aufwand === state.aufwand);
  }

  if (state.minRating > 0) {
    entries = entries.filter((e) => e.rating >= state.minRating);
  }

  entries.sort((a, b) => {
    if (state.sort === "rating") return b.rating - a.rating || b.dateAdded.localeCompare(a.dateAdded);
    if (state.sort === "date") return b.dateAdded.localeCompare(a.dateAdded) || b.rating - a.rating;
    if (state.sort === "az") return a.trend.localeCompare(b.trend, "de");
    return 0;
  });

  return entries;
}

function cardHtml(e) {
  const planItems = (e.plan || [])
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join("");

  const vorlagenItems = (e.vorlagen || [])
    .map(
      (v, i) => `
        <div class="vorlage">
          <div class="vorlageHead">
            <span class="vorlageTitel">${escapeHtml(v.titel)}</span>
            <button class="copyBtn" type="button" data-entry="${escapeHtml(e.id)}" data-vidx="${i}">Kopieren</button>
          </div>
          <div class="vorlageText">${escapeHtml(v.text)}</div>
        </div>`
    )
    .join("");

  const vorlagenBlock = (e.vorlagen || []).length
    ? `<div class="planLabel">📝 Vorlagen — fertig zum Kopieren</div><div class="vorlageList">${vorlagenItems}</div>`
    : "";

  const source = e.quelle
    ? `<a class="sourceLink" href="${escapeHtml(e.quelle)}" target="_blank" rel="noopener">Quelle ↗</a>`
    : "";

  return `
    <article class="card">
      <div class="cardHead">
        <h2 class="cardTitle">${escapeHtml(e.trend)}</h2>
        <span class="stars" title="${e.rating}/5">${stars(e.rating)}</span>
      </div>
      <div class="badgeRow">
        <span class="badge scope">${escapeHtml(e.scope)}</span>
        <span class="badge aufwand-${escapeHtml(e.aufwand)}">Aufwand: ${escapeHtml(e.aufwand)}</span>
        <span class="badge">Runde #${e.cycle} · ${escapeHtml(e.dateAdded)}</span>
      </div>

      <div class="gapBox">
        <div class="gapLabel">🎯 Konkrete Lücke</div>
        <div class="gapText">${escapeHtml(e.luecke)}</div>
      </div>

      <div class="miniField">
        <span class="miniLabel">Warum jetzt:</span> ${escapeHtml(e.warum)}
      </div>
      <div class="miniField">
        <span class="miniLabel">Kunde:</span> ${escapeHtml(e.kunde)}
      </div>

      <div class="planLabel">📋 Plan</div>
      <ol class="planList">${planItems}</ol>

      ${vorlagenBlock}

      <div class="metaRow">
        <span>⏱ ${escapeHtml(e.zeitDauerRessourcen)}</span>
      </div>
      ${source}
    </article>`;
}

function render() {
  const entries = applyFiltersAndSort();
  els.resultCount.textContent = `${entries.length} von ${state.data.entries.length} Trends`;
  els.cardList.innerHTML = entries.map(cardHtml).join("");
  els.emptyState.classList.toggle("hidden", entries.length > 0);
}

els.searchInput.addEventListener("input", (e) => {
  state.search = e.target.value;
  render();
});
els.scopeFilter.addEventListener("change", (e) => {
  state.scope = e.target.value;
  render();
});
els.aufwandFilter.addEventListener("change", (e) => {
  state.aufwand = e.target.value;
  render();
});
els.ratingFilter.addEventListener("change", (e) => {
  state.minRating = Number(e.target.value);
  render();
});
els.sortSelect.addEventListener("change", (e) => {
  state.sort = e.target.value;
  render();
});

els.cardList.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copyBtn");
  if (!btn) return;
  const entry = state.data.entries.find((x) => x.id === btn.dataset.entry);
  const vorlage = entry && entry.vorlagen && entry.vorlagen[Number(btn.dataset.vidx)];
  if (!vorlage) return;
  try {
    await navigator.clipboard.writeText(vorlage.text);
    const original = btn.textContent;
    btn.textContent = "Kopiert ✓";
    setTimeout(() => (btn.textContent = original), 1500);
  } catch {
    btn.textContent = "Fehler beim Kopieren";
  }
});

loadData();
