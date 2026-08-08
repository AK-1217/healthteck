/**
* Healthtech Suggester — Application Logic
 * Search & recommendation engine over the traditional medicine knowledge base.
 */

(function () {
    "use strict";

    // ---- DOM references ----
    const searchInput = document.getElementById("searchInput");
    const bookFilter = document.getElementById("bookFilter");
    const familyMemberFilter = document.getElementById("familyMemberFilter");
    const showDrugs = document.getElementById("showDrugs");
    const showFormulations = document.getElementById("showFormulations");
    const quickTags = document.getElementById("quickTags");
    const resultsHeader = document.getElementById("resultsHeader");
    const resultsCount = document.getElementById("resultsCount");
    const drugGroup = document.getElementById("drugResults");
    const formGroup = document.getElementById("formulationResults");
const drugCards = document.getElementById("drugCards");
    const formulationCards = document.getElementById("formulationCards");
    const emptyState = document.getElementById("emptyState");
    const searchClear = document.getElementById("searchClear");
    const searchBtn = document.getElementById("searchBtn");

    // ---- Login gating for the search block ----
    const searchLoginNotice = document.getElementById("searchLoginNotice");
    const searchCardEl = document.querySelector(".search-card");
    let loginPrompted = false;

    function isSearchAllowed() {
        // If the auth library hasn't loaded yet (app.js runs before common.js),
        // assume the user is a guest and gate the search.
        if (!window.HealthtechAuth) return false;
        return window.HealthtechAuth.isLoggedIn();
    }

    function showSearchLoginNotice() {
        if (searchLoginNotice) searchLoginNotice.hidden = false;
        const resultsEl = document.getElementById("results");
        if (resultsEl) resultsEl.style.display = "none";
        if (searchCardEl) {
            searchCardEl.style.opacity = "0.6";
            searchCardEl.style.pointerEvents = "none";
        }
    }

    function hideSearchLoginNotice() {
        if (searchLoginNotice) searchLoginNotice.hidden = true;
        const resultsEl = document.getElementById("results");
        if (resultsEl) resultsEl.style.display = "";
        if (searchCardEl) {
            searchCardEl.style.opacity = "";
            searchCardEl.style.pointerEvents = "";
        }
    }

    function gateSearch() {
        if (isSearchAllowed()) return true;
        if (!loginPrompted) {
            loginPrompted = true;
            if (window.HealthtechAuth && window.HealthtechAuth.requireLogin) {
                window.HealthtechAuth.requireLogin(
                    "Please login to your Healthtech account to search Ayurvedic drugs & formulations by symptom and view the data."
                );
            }
        }
        return false;
    }

    // ---- Book filter dropdown options are now defined statically in HTML ----

// ---- Populate quick tags (specialties) ----
    const quickTagsList = ["Shalakya", "Kaya Chikitsa", "Bhoot Vidya", "Prasuti Tantra", "Graha Chikitsa"];

    quickTagsList.forEach((label) => {
        const tag = document.createElement("span");
        tag.className = "quick-tag";
        tag.textContent = label;
        tag.addEventListener("click", () => {
            searchInput.value = label;
            if (!gateSearch()) {
                showSearchLoginNotice();
                return;
            }
            hideSearchLoginNotice();
            runSearch();
        });
        quickTags.appendChild(tag);
    });

    // ---- Normalize a string for matching ----
    function normalize(str) {
        return String(str || "")
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .trim();
    }

    // ---- Tokenize and construct a searchable blob for an item ----
    function blobForItem(item) {
        const parts = [];
        parts.push(item.name);
        if (item.sanskrit) parts.push(item.sanskrit);
        if (item.latin) parts.push(item.latin);
        if (item.description) parts.push(item.description);
        if (item.taste) parts.push(item.taste.join(" "));
        if (item.virya) parts.push(item.virya);
        if (item.book) parts.push(item.book.join(" "));
        if (item.ingredients) parts.push(item.ingredients.join(" "));
        if (item.karmas) parts.push(item.karmas.join(" "));
        if (item.diseases) {
            item.diseases.forEach((dId) => {
                const d = getDisease(dId);
                if (d) parts.push(d.name + " " + d.meaning);
            });
        }
        return normalize(parts.join(" "));
    }

    // ---- Does item match the query? ----
    function matchesQuery(item, tokens) {
        const blob = blobForItem(item);
        return tokens.every((token) => blob.includes(token));
    }

    // ---- Does item match the selected book? ----
    function matchesBook(item, book) {
        if (book === "all") return true;
        return (item.book || []).some((b) => b === book);
    }

    // ---- Search history: store each successful medicine search with date & time ----
    const HISTORY_KEY = "healthtech_search_history";

    function recordSearchHistory(query, medicines) {
        if (!query.trim()) return;
        // Only record when there's an actual search being performed (results shown)
        const now = new Date();
        const entry = {
            query: query,
            medicines: medicines, // matched names
            date: now.toLocaleDateString("en-IN"),
            time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            timestamp: now.getTime(),
        };
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            let history = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(history)) history = [];
            history.unshift(entry);
            // Keep latest 50 entries
            history = history.slice(0, 50);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (e) { /* ignore storage errors */ }
    }

// ---- Bookmarks: per-user star-toggle storage (localStorage) ----
    const BOOKMARK_KEY_PREFIX = "healthtech_bookmarks_";

    function bookmarkKey() {
        const user =
            (window.HealthtechAuth && window.HealthtechAuth.getCurrentUser()) || null;
        const id = (user && user.email) || "guest";
        return BOOKMARK_KEY_PREFIX + id;
    }

    function getBookmarks() {
        try {
            const raw = localStorage.getItem(bookmarkKey());
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch (e) {
            return [];
        }
    }

    function saveBookmarks(list) {
        try {
            localStorage.setItem(bookmarkKey(), JSON.stringify(list));
        } catch (e) { /* ignore storage errors */ }
    }

    function isBookmarked(id) {
        return getBookmarks().some((b) => b.id === id);
    }

    function toggleBookmark(item, type) {
        const list = getBookmarks();
        const idx = list.findIndex((b) => b.id === item.id);
        if (idx !== -1) {
            list.splice(idx, 1); // unselect the star → remove bookmark
        } else {
            list.unshift({
                id: item.id,
                type: type,
                name: item.name,
                book: item.book || [],
                description: item.description || "",
            });
        }
        saveBookmarks(list);
        // Let other pages (e.g. bookmarks.html) refresh if open
        document.dispatchEvent(new CustomEvent("HealthtechBookmarksChanged", {
            detail: { id: item.id },
        }));
        return idx === -1; // true = now bookmarked
    }

// ---- Number of cards to show initially before the "More" option ----
    const CARD_LIMIT = 6;

    // ---- Render a group of cards with a "More"/"Less" toggle ----
    function renderGroup(container, items, type) {
        container.innerHTML = "";

        if (!items || items.length === 0) return;

        const hasMore = items.length > CARD_LIMIT;

items.forEach((item, index) => {
            const card = buildCard(item, type);
            // Animate the card in with a slight stagger based on its index.
            card.style.animationDelay = Math.min(index * 0.07, 0.7) + "s";
            card.classList.add("result-anim");
            if (hasMore && index >= CARD_LIMIT) {
                card.classList.add("more-card");
                card.style.display = "none";
            }
            container.appendChild(card);
        });

        if (hasMore) {
            const wrap = document.createElement("div");
            wrap.className = "more-wrap";

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "more-btn";
            btn.textContent = "More (" + (items.length - CARD_LIMIT) + ")";

            const hiddenCards = Array.from(container.querySelectorAll(".more-card"));

            function collapse() {
                hiddenCards.forEach((c) => (c.style.display = "none"));
                btn.textContent = "More (" + (items.length - CARD_LIMIT) + ")";
                btn.classList.remove("less-mode");
            }

            function expand() {
                hiddenCards.forEach((c) => (c.style.display = ""));
                btn.textContent = "Less";
                btn.classList.add("less-mode");
            }

            btn.addEventListener("click", () =>
                btn.classList.contains("less-mode") ? collapse() : expand()
            );

            wrap.appendChild(btn);
            container.appendChild(wrap);
        }
    }

    // ---- Build a card DOM node ----
    function buildCard(item, type) {
        const card = document.createElement("div");
        card.className = "item-card";

        // Star / bookmark toggle button
        const starBtn = document.createElement("button");
        starBtn.type = "button";
        starBtn.className = "bookmark-btn";
        starBtn.setAttribute("aria-label", "Save " + item.name + " to bookmarks");
        starBtn.innerHTML = "&#9733;";
        if (isBookmarked(item.id)) starBtn.classList.add("active");
        starBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!window.HealthtechAuth || !window.HealthtechAuth.isLoggedIn()) {
                if (window.HealthtechAuth && window.HealthtechAuth.requireLogin) {
                    window.HealthtechAuth.requireLogin(
                        "Please login to save Ayurvedic drugs & formulations to your bookmarks."
                    );
                }
                return;
            }
            const nowBookmarked = toggleBookmark(item, type);
            starBtn.classList.toggle("active", nowBookmarked);
        });
        card.appendChild(starBtn);

        const title = document.createElement("h4");
        title.textContent = item.name;
        card.appendChild(title);

        (item.book || []).forEach((b) => {
            const bookEl = document.createElement("span");
            bookEl.className = "book";
            bookEl.textContent = "\uD83D\uDCD6 " + b;
            card.appendChild(bookEl);
        });

        const desc = document.createElement("p");
        desc.className = "desc";
        desc.textContent = item.description;
        card.appendChild(desc);

        // Karma tags
        if (item.karmas && item.karmas.length) {
            const karmaWrap = document.createElement("div");
            item.karmas.forEach((kId) => {
                const k = getKarma(kId);
                if (k) {
                    const t = document.createElement("span");
                    t.className = "tag";
                    t.textContent = k.name;
                    karmaWrap.appendChild(t);
                }
            });
            card.appendChild(karmaWrap);
        }

        // Meta info
        const meta = document.createElement("div");
        meta.className = "meta";

        // Ingredients for formulations
        if (type === "formulation" && item.ingredients && item.ingredients.length) {
            const ing = document.createElement("div");
            ing.innerHTML = "<strong>Ingredients:</strong> " + item.ingredients.join(", ");
            meta.appendChild(ing);
        }

        // Taste & potency for dravyas
        if (type === "drug") {
            if (item.taste && item.taste.length) {
                const rasa = document.createElement("div");
                rasa.innerHTML = "<strong>Rasa:</strong> " + item.taste.join(", ");
                meta.appendChild(rasa);
            }
            if (item.virya) {
                const virya = document.createElement("div");
                virya.innerHTML = "<strong>Virya:</strong> " + item.virya;
                meta.appendChild(virya);
            }
            if (item.latin) {
                const latin = document.createElement("div");
                latin.innerHTML = "<em>" + item.latin + "</em>";
                meta.appendChild(latin);
            }
        }

        // Indications (diseases)
        if (item.diseases && item.diseases.length) {
            const ind = document.createElement("div");
            const names = item.diseases
                .map((dId) => {
                    const d = getDisease(dId);
                    return d ? d.name : dId;
                })
                .join(", ");
            ind.innerHTML = "<strong>Indicated in:</strong> " + names;
            meta.appendChild(ind);
        }

        card.appendChild(meta);
        return card;
    }

// ---- Main search (used by the embedded "Healthtech Suggester" bar) ----
    // Renders all recommendations (no filtering) since the embedded search bar
    // is intentionally NOT connected to the Recommendations cards.
    function runSearch() {
        const wantDrugs = showDrugs.checked;
        const wantForms = showFormulations.checked;

        let drugHits = wantDrugs ? DRAVYAS.slice() : [];
        let formHits = wantForms ? FORMULATIONS.slice() : [];

        const total = drugHits.length + formHits.length;
        resultsCount.textContent = total + (total === 1 ? " result" : " results");

        renderGroup(drugCards, drugHits, "drug");
        renderGroup(formulationCards, formHits, "formulation");

        drugGroup.style.display = wantDrugs && drugHits.length ? "" : "none";
        formGroup.style.display = wantForms && formHits.length ? "" : "none";
        emptyState.hidden = total > 0;
    }

    // ---- Filter the Recommendations/Dravyas/Yogas cards by a query ----
    // Used ONLY by the header (top) search bar.
    function runSearchUsingQuery(query) {
        const wantDrugs = showDrugs.checked;
        const wantForms = showFormulations.checked;

        const q = normalize(query);
        const tokens = q.split(/\s+/).filter(Boolean);

        let drugHits = wantDrugs ? DRAVYAS.slice() : [];
        let formHits = wantForms ? FORMULATIONS.slice() : [];

        if (tokens.length) {
            drugHits = drugHits.filter((item) =>
                tokens.every((t) => normalize(item.name).includes(t))
            );
            formHits = formHits.filter((item) =>
                tokens.every((t) => normalize(item.name).includes(t))
            );
        }

        const total = drugHits.length + formHits.length;
        resultsCount.textContent = total + (total === 1 ? " result" : " results");

        renderGroup(drugCards, drugHits, "drug");
        renderGroup(formulationCards, formHits, "formulation");

        drugGroup.style.display = wantDrugs && drugHits.length ? "" : "none";
        formGroup.style.display = wantForms && formHits.length ? "" : "none";
        emptyState.hidden = total > 0;
    }

    // ---- Build a snippet of the query context (optional header note) ----
    function updateHeaderNote() {
        // Currently count badge is enough; kept for extensibility.
    }

// ---- Toggle clear button visibility based on input value ----
    function updateClearButton() {
        if (searchClear) {
            searchClear.hidden = searchInput.value.trim().length === 0;
        }
    }

// ---- Event listeners (login-gated) ----
    // NOTE: The embedded "Healthtech Suggester" search bar is intentionally NOT
    // connected to the Recommendations cards. Only the header (top) search bar
    // filters the Recommendations / Dravyas / Yogas cards.
    searchInput.addEventListener("input", () => {
        updateClearButton();
        // Recommendations remain unaffected by this embedded search bar.
    });

    // ---- Search CTA button (not connected to Recommendations) ----
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            // Placeholder — does not affect Recommendations.
        });
    }

    // ---- Clear button (not connected to Recommendations) ----
    if (searchClear) {
        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            updateClearButton();
            // Recommendations remain unaffected.
        });
    }

// Ensure clear button state is correct on initial load
    updateClearButton();

    // ---- Connect the header (top) search bar to the Recommendations cards ----
    // The header search input is injected by common.js, which runs AFTER app.js.
    // So we wait until DOMContentLoaded (and the header build) before wiring it up.
    function connectHeaderSearch() {
        const headerSearchInput = document.getElementById("headerSearchInput");
        if (!headerSearchInput) return;
        headerSearchInput.addEventListener("input", () => {
            const val = headerSearchInput.value.trim();
            if (!isSearchAllowed()) {
                showSearchLoginNotice();
                return;
            }
            hideSearchLoginNotice();
            runSearchUsingQuery(val);
        });
    }

    // Try to connect once the DOM (and header) is ready.
    function initHeaderSearch() {
        connectHeaderSearch();
        // If the header wasn't built yet (rare timing), retry after a tick.
        if (!document.getElementById("headerSearchInput")) {
            setTimeout(connectHeaderSearch, 50);
        }
    }

bookFilter.addEventListener("change", () => {
        if (!gateSearch()) {
            showSearchLoginNotice();
            return;
        }
        hideSearchLoginNotice();
        runSearch();
    });
    familyMemberFilter.addEventListener("change", () => {
        if (!gateSearch()) {
            showSearchLoginNotice();
            return;
        }
        hideSearchLoginNotice();
        runSearch();
    });
// Show toggles are intentionally NOT connected to the Recommendations.
    // They do not affect the static cards.
    showDrugs.addEventListener("change", () => {
        // Static Recommendations remain unaffected.
    });
    showFormulations.addEventListener("change", () => {
        // Static Recommendations remain unaffected.
    });

    // ---- Initial render (login-gated) ----
    // app.js executes before common.js, so wait until the DOM is ready and
    // HealthtechAuth is available before deciding whether to show results.
    function initialGate() {
        if (!isSearchAllowed()) {
            showSearchLoginNotice();
            return;
        }
        hideSearchLoginNotice();
        runSearch();
    }

if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            initialGate();
            initHeaderSearch();
        });
    } else {
        initialGate();
        setTimeout(initHeaderSearch, 0);
    }

    // ---- Re-enable the search UI after the user logs in ----
    document.addEventListener("HealthtechAuthChanged", function () {
        if (isSearchAllowed()) {
            hideSearchLoginNotice();
            runSearch();
        }
    });
})();

