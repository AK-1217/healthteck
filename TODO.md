# Healthtech Portal — UI/UX Polish Task List

## Phase 1 — Fix Bugs & Leftover Text
- [x] 1. Remove leftover "still the map is not visible" debug text from contact.html
- [x] 2. Remove broken Google Maps API placeholder script from index.html (SVG map is the primary renderer)

## Phase 2 — SEO & Metadata
- [x] 3. Add favicon (inline SVG leaf) to all HTML pages
- [x] 4. Add meta description + Open Graph tags to all HTML pages

## Phase 3 — Visual Polish
- [x] 5. Add scroll-to-top button (common.js + styles.css)
- [x] 6. Add subtle section reveal-on-scroll animation (common.js + styles.css)
- [x] 7. Add accessible focus-visible styles (styles.css)
- [x] 8. Improve empty state & search-card visual styling (styles.css)
- [x] 9. Header search box now searches navigation menu (dropdown of matching menu items, incl. sub-menu items)

## Phase 4 — Page-Specific Decorative Themes
- [x] 10. Login page — Amber/Gold theme with floating leaf particles (body class `login-page`)
- [x] 11. Register page — Blue/Cyan theme with floating droplet/plus particles (body class `register-page`)
- [x] 12. Profile page — Green/Gold theme with floating shield/star particles (body class `profile-page`)

## Phase 5 — Enhanced Scroll-Reveal Animation
- [x] 15. Expanded reveal-on-scroll to cover more elements (cards, sections)
- [x] 16. Added a smoother, more noticeable reveal (translate + scale) with staggered child card cascade
- [x] 17. Made the reveal reversible: scrolling down animates elements up into view; scrolling up animates them back down out of view
- [x] 18. Recommendations cards (Dravyas & Yogas) now animate the same way as Systems of Medicine cards (observed instead of instantly revealed)
- [x] 19. Recommendations cards now share the Systems of Medicine card border style (green top accent border)

## Phase 6 — Verification
- [ ] 13. Verify all pages render correctly in browser
- [ ] 14. Verify map still works (SVG fallback) and search still functions
