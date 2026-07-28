// Browser-based assessment history and expandable saved-result cards.

function saveResult(result) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
    history.unshift(result);

    localStorage.setItem(
        STORAGE_KEYS.HISTORY,
        JSON.stringify(history.slice(0, 20))
    );
}
function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getStoredResultDetails(item) {
    const insights = buildInsights(item.categoryScores);
    const strengths = Array.isArray(item.strengths) && item.strengths.length
        ? item.strengths
        : insights.strengths;
    const priorities = Array.isArray(item.priorities) && item.priorities.length
        ? item.priorities
        : insights.priorities;
    const drills = Array.isArray(item.drills) && item.drills.length
        ? item.drills
        : priorities.map(priority => ({
            category: priority.category,
            ...drillLibrary[priority.category]
        }));
    const explanation = item.explanation || createExplanation(item.rating, item.categoryScores);
    const diagnostics = item.diagnostics || (
        `This saved assessment used ${item.engineVersion || "an earlier PickleRate engine"}. ` +
        `${item.contradictionCount || 0} possible contradictions and ` +
        `${item.gatedAnswerCount || 0} gated advanced answers were recorded.`
    );

    return { strengths, priorities, drills, explanation, diagnostics };
}

function createHistoryCategoryMarkup(categoryScores) {
    return Object.entries(categoryScores)
        .sort((a, b) => b[1] - a[1])
        .map(([category, score]) => {
            const percentage = Math.max(5, Math.round(((score - 1) / 4) * 100));
            return `
                <div>
                    <div class="category-row-heading">
                        <span>${escapeHtml(categoryNames[category])}</span>
                        <span class="category-score">${score.toFixed(1)} / 5</span>
                    </div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        })
        .join("");
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]");
    const statsContainer = document.getElementById("historyStats");
    const listContainer = document.getElementById("historyList");

    statsContainer.innerHTML = "";
    listContainer.innerHTML = "";

    if (history.length === 0) {
        statsContainer.innerHTML = "";
        listContainer.innerHTML = `
            <div class="empty-state">
                No completed assessments have been saved on this device yet.
            </div>
        `;
        return;
    }

    const latest = history[0];
    const best = Math.max(...history.map(item => item.rating));
    const oldest = history[history.length - 1];
    const change = latest.rating - oldest.rating;

    const stats = [
        { label: "Latest rating", value: latest.rating.toFixed(2) },
        { label: "Best rating", value: best.toFixed(2) },
        {
            label: "Change",
            value: `${change >= 0 ? "+" : ""}${change.toFixed(2)}`
        }
    ];

    stats.forEach(stat => {
        const card = document.createElement("article");
        card.className = "stat-card";
        card.innerHTML = `
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        `;
        statsContainer.appendChild(card);
    });

    history.forEach((item, index) => {
        const date = new Date(item.date);
        const strongest = Object.entries(item.categoryScores)
            .sort((a, b) => b[1] - a[1])[0];
        const details = getStoredResultDetails(item);
        const detailId = `history-details-${index}`;

        const strengthsMarkup = details.strengths
            .map(strength => `<li>${escapeHtml(strength.text)}</li>`)
            .join("");
        const prioritiesMarkup = details.priorities
            .map(priority => `<li>${escapeHtml(priority.text)}</li>`)
            .join("");
        const drillsMarkup = details.drills
            .map(drill => `
                <article class="history-mini-card">
                    <span class="drill-time">${escapeHtml(drill.time)}</span>
                    <h5>${escapeHtml(drill.title)}</h5>
                    <p>${escapeHtml(drill.description)}</p>
                </article>
            `)
            .join("");

        const card = document.createElement("article");
        card.className = "history-card";
        card.innerHTML = `
            <button
                type="button"
                class="history-card-toggle"
                aria-expanded="false"
                aria-controls="${detailId}"
            >
                <div class="history-header">
                    <div>
                        <div class="history-rating">${item.rating.toFixed(2)}</div>
                        <div class="history-date">
                            ${date.toLocaleDateString("en-ZA", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                            })}
                        </div>
                    </div>
                    <div class="muted">${item.confidence}% confidence</div>
                </div>
                <p>
                    ${escapeHtml(item.level)}. Likely range:
                    ${escapeHtml(item.range.lower)}–${escapeHtml(item.range.upper)}.
                    Strongest category: ${escapeHtml(categoryNames[strongest[0]])}.
                </p>
                <div class="history-card-prompt">
                    <span>View full result, strengths, priorities and drills</span>
                    <span class="history-chevron" aria-hidden="true">⌄</span>
                </div>
            </button>

            <div id="${detailId}" class="history-details">
                <section class="history-detail-section">
                    <h4>Skill breakdown</h4>
                    <div class="history-category-list">
                        ${createHistoryCategoryMarkup(item.categoryScores)}
                    </div>
                </section>

                <div class="history-detail-grid">
                    <section class="history-detail-section">
                        <h4>Strongest areas</h4>
                        <ul class="insight-list strength-list">${strengthsMarkup}</ul>
                    </section>

                    <section class="history-detail-section">
                        <h4>Development priorities</h4>
                        <ul class="insight-list priority-list">${prioritiesMarkup}</ul>
                    </section>
                </div>

                <section class="history-detail-section">
                    <h4>What this result means</h4>
                    <p>${escapeHtml(details.explanation)}</p>
                </section>

                <section class="history-detail-section">
                    <h4>Recommended drills</h4>
                    <div class="history-drill-grid">${drillsMarkup}</div>
                </section>

                <section class="history-detail-section">
                    <h4>Assessment quality checks</h4>
                    <p>${escapeHtml(details.diagnostics)}</p>
                </section>
            </div>
        `;

        const toggle = card.querySelector(".history-card-toggle");
        toggle.addEventListener("click", () => {
            const expanded = card.classList.toggle("expanded");
            toggle.setAttribute("aria-expanded", String(expanded));
            const prompt = toggle.querySelector(".history-card-prompt span:first-child");
            prompt.textContent = expanded
                ? "Hide full result"
                : "View full result, strengths, priorities and drills";
        });

        listContainer.appendChild(card);
    });
}
