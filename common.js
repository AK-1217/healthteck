/**
 * common.js — Shared Healthtech Portal functionality
 * Injects the standard header, navigation menu, and footer into every page,
 * and powers the banner carousel, statistics counters, and news tabs.
 */

(function () {
    "use strict";

    // ---- Path helper: all pages live in the same root folder ----
    const ROOT = "./";

    // ---- Navigation menu definition ----
    const NAV_ITEMS = [
        { label: "Home", href: ROOT + "index.html", active: "index" },
        {
            label: "About Us",
            href: ROOT + "about.html",
            active: "about",
children: [
                { label: "About Portal", href: ROOT + "about.html" },
                { label: "Organisation", href: ROOT + "about.html#organisation" },
                { label: "Vision & Mission", href: ROOT + "about.html#vision" },
            ],
        },
        {
            label: "Systems of Medicine",
            href: ROOT + "ayurveda.html",
            active: "system",
children: [
                { label: "Ayurveda", href: ROOT + "ayurveda.html" },
                { label: "Yoga & Naturopathy", href: ROOT + "yoga.html" },
                { label: "Unani", href: ROOT + "unani.html" },
                { label: "Siddha", href: ROOT + "siddha.html" },
                { label: "Homoeopathy", href: ROOT + "homeopathy.html" },
            ],
        },
{ label: "Family Members", href: ROOT + "other-family.html", active: "other-family" },
        { label: "Drug & Formulation Search", href: ROOT + "index.html#search", active: "search" },
        { label: "History", href: ROOT + "history.html", active: "history" },
        { label: "Contact Us", href: ROOT + "contact.html", active: "contact" },
    ];

    // ---- Determine current page from filename ----
    const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const searchHashActive =
        currentFile === "index.html" &&
        window.location.hash.toLowerCase().indexOf("search") !== -1;
    function isActive(item) {
        if (item.active === "search") {
            return searchHashActive;
        }
        if (item.active === "index") {
            return currentFile === "index.html" && !searchHashActive;
        }
        if (item.children) {
            return item.children.some((c) => c.href && c.href.includes(currentFile));
        }
        return item.href && item.href.includes(currentFile) && item.active !== "search";
    }

    // ---- Build the header ----
    function buildHeader() {
        const header = document.createElement("header");
        header.className = "portal-header";

        // Utility bar
        const util = document.createElement("div");
        util.className = "utility-bar";
util.innerHTML =
            '<div class="wrap util-inner">' +
            '<span>Welcome to Healthtech</span>' +
            '<span class="util-links">' +
            '<a href="javascript:void(0)" id="skipLink">Skip to Main Content</a>' +
            '<a href="javascript:void(0)" id="fontUp">A+</a>' +
            '<a href="javascript:void(0)" id="fontDown">A-</a>' +
            "</span></div>";

        // Main header row
const mainRow = document.createElement("div");
        mainRow.className = "wrap header-main";
        mainRow.innerHTML =
            '<div class="brand">' +
            '<span class="logo">🌿</span>' +
            '<div class="brand-text">' +
            '<h1>Healthtech</h1>' +
            '<p>Traditional Systems of Medicine</p>' +
            "</div></div>" +
            '<form class="header-search" id="headerSearchForm" role="search">' +
            '<input type="search" id="headerSearchInput" placeholder="Search website..." aria-label="Search website" />' +
            '<button type="submit">Search</button>' +
            "</form>" +
            '<div class="header-actions">' +
            '<button type="button" class="menu-toggle" id="menuToggle" aria-label="Toggle navigation menu" aria-expanded="false">' +
            '<span class="menu-bar"></span><span class="menu-bar"></span><span class="menu-bar"></span>' +
            "</button>" +
            '<div class="profile-menu" id="profileMenu">' +
            '<button type="button" class="profile-btn" id="profileBtn" aria-haspopup="true" aria-expanded="false">' +
            '<span class="profile-avatar" id="profileAvatar">🔐</span>' +
            '<span class="profile-name" id="profileName">Login</span>' +
            '<span class="profile-caret">▾</span>' +
            "</button>" +
            '<ul class="profile-dropdown" id="profileDropdown">' +
            "</ul></div></div>";

        // Navigation
        const nav = document.createElement("nav");
        nav.className = "main-nav";
        nav.setAttribute("aria-label", "Main navigation");
        const ul = document.createElement("ul");
        nav.appendChild(ul);

        NAV_ITEMS.forEach((item) => {
            const li = document.createElement("li");
            if (isActive(item)) li.classList.add("active");

            const a = document.createElement("a");
            a.href = item.href;
            a.textContent = item.label;
            li.appendChild(a);

            if (item.children) {
                li.classList.add("has-dropdown");
                const sub = document.createElement("ul");
                sub.className = "dropdown";
                item.children.forEach((child) => {
                    const cLi = document.createElement("li");
                    const cA = document.createElement("a");
                    cA.href = child.href;
                    cA.textContent = child.label;
                    cLi.appendChild(cA);
                    sub.appendChild(cLi);
                });
                li.appendChild(sub);
            }
            ul.appendChild(li);
        });

        header.appendChild(util);
        header.appendChild(mainRow);
        header.appendChild(nav);

        // Insert at top of body
        document.body.insertBefore(header, document.body.firstChild);

        // Header search → lookup navigation menu items and show a dropdown
        const form = document.getElementById("headerSearchForm");
        const headerSearchInput = document.getElementById("headerSearchInput");

        // Build a flattened searchable index of every menu item (incl. sub-menu children)
        const menuItems = [];
        NAV_ITEMS.forEach((item) => {
            menuItems.push(item);
            (item.children || []).forEach((child) => menuItems.push(child));
        });

        function normalizeLabel(str) {
            return String(str || "")
                .toLowerCase()
                .replace(/[^\w\s]/g, "")
                .trim();
        }

        // Create the results dropdown element inside the header search box
        let resultsBox = document.getElementById("headerSearchResults");
        if (!resultsBox && form) {
            resultsBox = document.createElement("div");
            resultsBox.id = "headerSearchResults";
            resultsBox.className = "header-search-results";
            resultsBox.setAttribute("role", "listbox");
            resultsBox.style.display = "none";
            form.appendChild(resultsBox);
        }

        function renderSearchResults(queryTokens) {
            if (!resultsBox) return;
            if (!queryTokens.length) {
                resultsBox.innerHTML = "";
                resultsBox.style.display = "none";
                return;
            }

            // Collect matching items & auto-detect the direct top-level menu label
            const matches = [];
            let firstHit = null;
            let exactTopLevel = null;

menuItems.forEach((item) => {
                const label = normalizeLabel(item.label);
                const ok = queryTokens.every((t) => label.includes(t));
                if (!ok) return;
                const isTop = NAV_ITEMS.indexOf(item) !== -1;
                matches.push({ item: item, isTop: isTop });
                if (!firstHit) firstHit = item;
                if (isTop && !exactTopLevel) exactTopLevel = item;
            });

            // Also search recommendation card names (Dravyas & Formulations)
            const recommendationMatches = [];
            const allRecs = [
                { list: (typeof DRAVYAS !== "undefined" ? DRAVYAS : []), type: "Drug" },
                { list: (typeof FORMULATIONS !== "undefined" ? FORMULATIONS : []), type: "Formulation" },
            ];
            allRecs.forEach((group) => {
                group.list.forEach((rec) => {
                    const label = normalizeLabel(rec.name);
                    const ok = queryTokens.every((t) => label.includes(t));
                    if (!ok) return;
                    recommendationMatches.push({ rec: rec, type: group.type });
                    if (!firstHit) firstHit = { _rec: rec, _type: group.type };
                });
            });

            resultsBox.innerHTML = "";

            if (!matches.length && !recommendationMatches.length) {
                const empty = document.createElement("div");
                empty.className = "header-search-empty";
                empty.textContent = 'No matching pages.';
                resultsBox.appendChild(empty);
                resultsBox.style.display = "block";
                return;
            }

            matches.forEach((m) => {
                const entry = document.createElement("div");
                entry.className = "header-search-item" + (m.isTop ? " top" : " sub");
                entry.setAttribute("role", "option");
                const text = document.createElement("span");
                text.className = "hs-label";
                text.textContent = m.item.label;
                entry.appendChild(text);
                if (m.item.href) {
                    const hint = document.createElement("span");
                    hint.className = "hs-hint";
                    hint.textContent = m.item.href.replace(ROOT, "").replace(".html", "") || "home";
                    entry.appendChild(hint);
                }
                entry.addEventListener("click", () => {
                    window.location.href = m.item.href || ROOT + "index.html";
                });
                resultsBox.appendChild(entry);
            });

            recommendationMatches.forEach((m) => {
                const entry = document.createElement("div");
                entry.className = "header-search-item rec";
                entry.setAttribute("role", "option");
                const text = document.createElement("span");
                text.className = "hs-label";
                text.textContent = m.rec.name;
                entry.appendChild(text);
                const hint = document.createElement("span");
                hint.className = "hs-hint";
                hint.textContent = m.type;
                entry.appendChild(hint);
                entry.addEventListener("click", () => {
                    window.location.href = ROOT + "index.html#search?q=" + encodeURIComponent(m.rec.name);
                });
                resultsBox.appendChild(entry);
            });

            resultsBox.style.display = "block";

            // Store the current first hit for the submit handler
            resultsBox._firstHit = firstHit || exactTopLevel;
        }

        headerSearchInput.addEventListener("input", () => {
            const q = headerSearchInput.value.trim();
            const tokens = normalizeLabel(q).split(/\s+/).filter(Boolean);
            renderSearchResults(tokens);
        });

        // Hide dropdown when clicking elsewhere
        document.addEventListener("click", (e) => {
            if (form && !form.contains(e.target)) {
                if (resultsBox) resultsBox.style.display = "none";
            }
        });

        if (form && headerSearchInput) {
            form.addEventListener("submit", (e) => {
                e.preventDefault();
                const q = headerSearchInput.value.trim();
                const tokens = normalizeLabel(q).split(/\s+/).filter(Boolean);

                let target = null;
                if (resultsBox && resultsBox._firstHit) {
                    target = resultsBox._firstHit;
                } else if (tokens.length) {
                    // Try to match a menu item by label
                    const match = menuItems.find((item) => {
                        const label = normalizeLabel(item.label);
                        return tokens.every((t) => label.includes(t));
                    });
                    if (match) target = match;
                }

                if (target && target.href) {
                    window.location.href = target.href;
                } else {
                    // Fallback → go to homepage drug & formulation search
                    window.location.href = ROOT + "index.html#search?q=" + encodeURIComponent(q);
                }
            });
        }

        // Utility handlers
        const skip = document.getElementById("skipLink");
        if (skip) {
            skip.addEventListener("click", () => {
                const main = document.getElementById("main-content");
                if (main) {
                    main.setAttribute("tabindex", "-1");
                    main.focus();
                    main.scrollIntoView();
                }
            });
        }

        let baseSize = parseFloat(getComputedStyle(document.body).fontSize) || 16;
        const fontUp = document.getElementById("fontUp");
        const fontDown = document.getElementById("fontDown");
        if (fontUp) {
            fontUp.addEventListener("click", () => {
                if (baseSize < 22) {
                    baseSize += 1;
                    document.body.style.fontSize = baseSize + "px";
                }
            });
        }
        if (fontDown) {
            fontDown.addEventListener("click", () => {
                if (baseSize > 13) {
                    baseSize -= 1;
                    document.body.style.fontSize = baseSize + "px";
                }
            });
        }

        // ---- Profile dropdown ----
        const profileBtn = document.getElementById("profileBtn");
        const profileDropdown = document.getElementById("profileDropdown");
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                // When logged out, the button reads "Login" → go straight to login page
                if (!isLoggedIn()) {
                    window.location.href = "login.html";
                    return;
                }
                const isOpen = profileDropdown.classList.contains("open");
                profileDropdown.classList.toggle("open", !isOpen);
                profileBtn.setAttribute("aria-expanded", String(!isOpen));
            });
        }

        // ---- Mobile menu toggle ----
        const menuToggle = document.getElementById("menuToggle");
        const navEl = header.querySelector(".main-nav");
        if (menuToggle && navEl) {
            menuToggle.addEventListener("click", () => {
                const isOpen = navEl.classList.contains("mobile-open");
                navEl.classList.toggle("mobile-open", !isOpen);
                menuToggle.classList.toggle("open", !isOpen);
                menuToggle.setAttribute("aria-expanded", String(!isOpen));
            });
        }

        // ---- Mobile: close menu when a link is clicked, toggle submenus on tap ----
        if (navEl) {
            navEl.addEventListener("click", (e) => {
                const link = e.target.closest("a");
                const dropdownItem = e.target.closest("li.has-dropdown");
                // Toggle nested dropdown on tap for touch devices
                if (dropdownItem && window.matchMedia("(max-width: 900px)").matches) {
                    e.preventDefault();
                    const sub = dropdownItem.querySelector(".dropdown");
                    const isOpen = sub && sub.style.display === "block";
                    navEl.querySelectorAll(".dropdown").forEach((d) => (d.style.display = ""));
                    if (sub) sub.style.display = isOpen ? "" : "block";
                    return;
                }
                // Close the mobile menu after navigating
                if (link) {
                    navEl.classList.remove("mobile-open");
                    menuToggle.classList.remove("open");
                    menuToggle.setAttribute("aria-expanded", "false");
                }
            });
        }

        // ---- Close dropdowns when clicking outside ----
        document.addEventListener("click", (e) => {
            const pm = document.querySelector(".profile-menu");
            if (pm && !pm.contains(e.target)) {
                const dd = document.getElementById("profileDropdown");
                const btn = document.getElementById("profileBtn");
                if (dd) dd.classList.remove("open");
                if (btn) btn.setAttribute("aria-expanded", "false");
            }
        });

        // ---- Render profile dropdown based on login state ----
        renderProfileMenu();
    }

    // ---- Auth helpers (demo — localStorage based) ----
    const AUTH_KEY = "healthtech_user";

    function getCurrentUser() {
        try {
            const raw = localStorage.getItem(AUTH_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function isLoggedIn() {
        return !!getCurrentUser();
    }

    function renderProfileMenu() {
        const profileName = document.getElementById("profileName");
        const profileAvatar = document.getElementById("profileAvatar");
        const profileDropdown = document.getElementById("profileDropdown");
        if (!profileDropdown) return;

        const user = getCurrentUser();
        // Reflect login state on <body> so guest-only UI can be hidden
        document.body.classList.toggle("logged-in", !!user);

        if (user) {
            if (profileName) profileName.textContent = user.name || "User";
            if (profileAvatar) {
                profileAvatar.textContent = (user.name || "U").trim().charAt(0).toUpperCase();
            }
        } else {
            if (profileName) profileName.textContent = "Login";
            if (profileAvatar) profileAvatar.textContent = "🔐";
        }

        let itemsHtml;
        if (user) {
// Logged in → show Profile, Bookmarks, History, Logout
            itemsHtml =
                '<li><a href="profile.html">👤 My Profile</a></li>' +
                '<li><a href="bookmarks.html">⭐ My Bookmarks</a></li>' +
                '<li><a href="history.html">🕘 My History</a></li>' +
                '<li class="dropdown-divider"></li>' +
                '<li><a href="javascript:void(0)" id="logoutLink">🚪 Logout</a></li>';
        } else {
            // Logged out → show Login & Register (both on the combined login page)
            itemsHtml =
                '<li><a href="login.html">🔐 Login</a></li>' +
                '<li><a href="register.html">📝 Register</a></li>';
        }
        profileDropdown.innerHTML = itemsHtml;

        // Re-bind logout
        const logoutLink = document.getElementById("logoutLink");
        if (logoutLink) {
            logoutLink.addEventListener("click", (e) => {
                e.preventDefault();
                if (window.confirm("Log out of your Healthtech account?")) {
                    localStorage.removeItem(AUTH_KEY);
                    renderProfileMenu();
                    const dd = document.getElementById("profileDropdown");
                    if (dd) dd.classList.remove("open");
                    const btn = document.getElementById("profileBtn");
                    if (btn) btn.setAttribute("aria-expanded", "false");
                    document.dispatchEvent(new Event("HealthtechAuthChanged"));
                }
            });
        }
    }

    // ---- Emit auth-changed event after login/register (used by app.js to unlock search) ----
    function emitAuthChanged() {
        document.dispatchEvent(new Event("HealthtechAuthChanged"));
    }

    // ---- Login-required modal ----
    function buildAuthModal() {
        if (document.getElementById("authModalOverlay")) return;

        const overlay = document.createElement("div");
        overlay.className = "auth-modal-overlay";
        overlay.id = "authModalOverlay";
        overlay.innerHTML =
            '<div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">' +
            '<button type="button" class="auth-modal-close" id="authModalClose" aria-label="Close">✕</button>' +
            '<div class="auth-modal-icon">🔐</div>' +
            '<h3 id="authModalTitle">Login Required</h3>' +
            '<p id="authModalMsg">Please login to your Healthtech account to access this feature and view the data.</p>' +
            '<div class="auth-modal-actions">' +
            '<a href="login.html" class="btn-primary">Login Now</a>' +
            '<a href="register.html" class="btn-secondary">Create an Account</a>' +
            "</div></div>";

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeAuthModal();
        });
        const closeBtn = overlay.querySelector("#authModalClose");
        if (closeBtn) closeBtn.addEventListener("click", closeAuthModal);

        document.body.appendChild(overlay);
    }

    function openAuthModal(message) {
        buildAuthModal();
        const overlay = document.getElementById("authModalOverlay");
        const msg = document.getElementById("authModalMsg");
        if (overlay) overlay.classList.add("open");
        if (msg && message) msg.textContent = message;
    }

    function closeAuthModal() {
        const overlay = document.getElementById("authModalOverlay");
        if (overlay) overlay.classList.remove("open");
    }

    function requireLogin(message) {
        if (isLoggedIn()) return true;
        openAuthModal(message || "Please login to your Healthtech account to access this feature and view the data.");
        return false;
    }

// Expose helpers for login/register pages
    window.HealthtechAuth = {
        getCurrentUser: getCurrentUser,
        isLoggedIn: isLoggedIn,
        login: function (name, email, age, gender, height, weight) {
            localStorage.setItem(AUTH_KEY, JSON.stringify({
                name: name,
                email: email,
                age: age || null,
                gender: gender || null,
                height: height || null,
                weight: weight || null
            }));
            document.body.classList.add("logged-in");
        },
        logout: function () {
            localStorage.removeItem(AUTH_KEY);
            document.body.classList.remove("logged-in");
        },
        requireLogin: requireLogin,
        openAuthModal: openAuthModal,
        closeAuthModal: closeAuthModal,
    };

    // ---- Build the footer ----
    function buildFooter() {
        const footer = document.createElement("footer");
        footer.className = "portal-footer";
footer.innerHTML =
            '<div class="wrap footer-grid">' +
            '<div class="footer-col">' +
            '<h4>Healthtech</h4>' +
            '<p>An educational resource on traditional systems of medicine — Ayurveda, Yoga &amp; Naturopathy, Unani, Siddha and Homoeopathy.</p>' +
            "</div>" +
            '<div class="footer-col">' +
            "<h4>Quick Links</h4>" +
            '<ul>' +
            '<li><a href="' + ROOT + 'index.html">Home</a></li>' +
            '<li><a href="' + ROOT + 'about.html">About Us</a></li>' +
            '<li><a href="' + ROOT + 'ayurveda.html">Ayurveda</a></li>' +
            '<li><a href="' + ROOT + 'yoga.html">Yoga &amp; Naturopathy</a></li>' +
            '<li><a href="' + ROOT + 'contact.html">Contact Us</a></li>' +
            "</ul></div>" +
            '<div class="footer-col">' +
            "<h4>Systems</h4>" +
            '<ul>' +
            '<li><a href="' + ROOT + 'unani.html">Unani</a></li>' +
            '<li><a href="' + ROOT + 'siddha.html">Siddha</a></li>' +
'<li><a href="' + ROOT + 'homeopathy.html">Homoeopathy</a></li>' +
'<li><a href="' + ROOT + 'other-family.html">Family Members</a></li>' +
            '<li><a href="' + ROOT + 'index.html#search">Drug &amp; Formulation Search</a></li>' +
            "</ul></div>" +
            '<div class="footer-col">' +
            "<h4>Contact</h4>" +
            '<ul>' +
            '<li>Email: <a href="mailto:info@healthtech.com">info@healthtech.com</a></li>' +
            '<li>Helpline: 1800-111-607</li>' +
            '<li>Mon–Fri, 9:30 AM – 6:00 PM</li>' +
            "</ul></div></div>" +
            '<div class="footer-bottom"><div class="wrap">' +
            "© 2026 Healthtech. All rights reserved. | This is a demonstration portal for educational purposes." +
            "</div></div>";

        document.body.appendChild(footer);
    }

    // ---- Banner Carousel ----
    function initCarousel() {
        const slider = document.getElementById("bannerSlider");
        if (!slider) return;
        const slides = Array.prototype.slice.call(slider.children);
        let index = 0;
        let timer = null;

        function show(i) {
            slides.forEach((s, idx) => {
                s.classList.toggle("active", idx === i);
            });
        }

        function next() {
            index = (index + 1) % slides.length;
            show(index);
        }

        show(0);
        timer = setInterval(next, 5000);

        const prevBtn = document.getElementById("bannerPrev");
        const nextBtn = document.getElementById("bannerNext");
        if (prevBtn) prevBtn.addEventListener("click", () => { index = (index - 1 + slides.length) % slides.length; show(index); });
        if (nextBtn) nextBtn.addEventListener("click", () => { clearInterval(timer); next(); });
    }

// ---- News tabs ----
    function initNewsTabs() {
        const tabs = document.querySelectorAll(".news-tab");
        const panels = document.querySelectorAll(".news-panel");
        if (!tabs.length || !panels.length) return;

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                tabs.forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
                panels.forEach((p) => {
                    p.classList.toggle("active", p.id === tab.getAttribute("data-target"));
                    if (p.id === tab.getAttribute("data-target")) {
                        p.classList.add("revealed");
                    }
                });
            });
        });
    }

    // ---- Preserve query param to homepage search ----
    function handleSearchQuery() {
        if (currentFile !== "index.html") return;
        const hash = window.location.hash;
        if (hash && hash.indexOf("search") !== -1) {
            const qIdx = hash.indexOf("?q=");
            if (qIdx !== -1) {
const q = decodeURIComponent(hash.slice(qIdx + 3));
                try {
                    const input = document.getElementById("searchInput");
                    if (input) {
                        input.value = q;
                        // Trigger app.js's own input listener to run the search
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                    // Also trigger the header search input so the header bar
                    // filters the recommendation cards to match the query.
                    const headerSearchInput = document.getElementById("headerSearchInput");
                    if (headerSearchInput) {
                        headerSearchInput.value = q;
                        headerSearchInput.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                    const searchSec = document.getElementById("search");
                    if (searchSec) searchSec.scrollIntoView({ behavior: "smooth" });
                } catch (e) { /* ignore */ }
            }
        }
    }

    // ---- Scroll-to-top button ----
    function initScrollTop() {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "scrollTopBtn";
        btn.className = "scroll-top";
        btn.setAttribute("aria-label", "Scroll to top");
        btn.innerHTML = "&#8593;";
        btn.title = "Scroll to top";
        document.body.appendChild(btn);

        function toggle() {
            const show = window.scrollY > 400;
            btn.classList.toggle("visible", show);
        }

        btn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        window.addEventListener("scroll", toggle, { passive: true });
        toggle();
    }

    // ---- Reveal-on-scroll animation ----
    function initRevealOnScroll() {
const revealables = ".system-card, .stat-box, .item-card, .side-box, .news-panel, .search-card, .auth-card, .contact-form, .content-main, .intro, .state-details, .history-entry, .news-tabs, .results-header, .card-grid, .systems-grid, .search-block";
        const targets = document.querySelectorAll(revealables);
        if (!targets.length) return;
        if (!("IntersectionObserver" in window)) {
            targets.forEach((t) => t.classList.add("revealed"));
            return;
        }
const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Reversible animation:
                    //  - Scrolling down: element enters viewport → animate up into place.
                    //  - Scrolling up:   element leaves viewport → animate back down/hide.
                    entry.target.classList.toggle("revealed", entry.isIntersecting);
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
        );
        targets.forEach((t) => observer.observe(t));

        // Dynamically added cards (e.g. search results in app.js) should animate
        // in the same way as the initial cards. Instead of revealing them instantly,
        // register them with the same IntersectionObserver so they animate in when
        // scrolled into view and animate out when scrolled away.
        const mo = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
                m.addedNodes.forEach((n) => {
                    if (n.nodeType !== 1) return;
                    if (n.matches && n.matches(revealables)) observer.observe(n);
                    if (n.querySelectorAll) {
                        n.querySelectorAll(revealables).forEach((node) => observer.observe(node));
                    }
                });
            });
        });
        mo.observe(document.body, { childList: true, subtree: true });
    }

    // ---- Init ----
    document.addEventListener("DOMContentLoaded", () => {
        buildHeader();
        buildFooter();
initCarousel();
        initNewsTabs();
        handleSearchQuery();
        initScrollTop();
        initRevealOnScroll();
    });
})();
