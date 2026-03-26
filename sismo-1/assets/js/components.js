/**
 * SISMO Reusable Components
 */

// ─── Inject shared styles once ───────────────────────────────────────────────
(function injectSharedStyles() {
    if (document.getElementById('sismo-shared-styles')) return;
    const s = document.createElement('style');
    s.id = 'sismo-shared-styles';
    s.textContent = `
        html, body { overflow-x: hidden; max-width: 100%; }

        /* ── Mobile Bottom Nav ───────────────────────────────── */
        .sismo-bottom-nav {
            display: none;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: 64px;
            background: #fff;
            border-top: 1px solid #dee2e6;
            z-index: 1040;
            box-shadow: 0 -2px 8px rgba(0,0,0,.12);
        }
        @media (max-width: 767.98px) {
            .sismo-bottom-nav { display: flex; }
        }
        .sismo-bnav-btn {
            flex: 1;
            border: none;
            background: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            font-size: 11px;
            color: #555;
            transition: color .15s, background .15s;
            padding: 0;
        }
        .sismo-bnav-btn i { font-size: 22px; }
        .sismo-bnav-btn.active   { color: #0d6efd; }
        .sismo-bnav-btn.active-danger { color: #dc3545; }

        /* ── Shared Slide Panel (mobile bottom) ─────────────── */
        .sismo-slide-panel {
            position: fixed;
            bottom: 64px; left: 0; right: 0;
            z-index: 1039;
            background: #fff;
            border-top: 2px solid #212529;
            box-shadow: 0 -4px 20px rgba(0,0,0,.22);
        }
        .sismo-slide-panel-header {
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            user-select: none;
        }
        .sismo-slide-panel-body {
            overflow: hidden;
            max-height: 55vh;
            opacity: 1;
            transition: max-height .35s cubic-bezier(.4,0,.2,1), opacity .3s ease;
        }
        .sismo-slide-panel-body.collapsed { max-height: 0 !important; opacity: 0; }
        .sismo-slide-panel-arrow { transition: transform .3s ease; }
        .sismo-slide-panel-arrow.collapsed { transform: rotate(180deg); }
    `;
    document.head.appendChild(s);
})();

// ─── Page Header ─────────────────────────────────────────────────────────────
/**
 * @param {string} badge      – small badge beside logo (page label)
 * @param {string} siteTitle  – bold text beside logo (home page only, e.g. "SISMO")
 * @param {string} rightHtml  – content for the right side
 * @param {string} containerClass
 */
function renderPageHeader({ badge = '', siteTitle = '', rightHtml = '', containerClass = 'container-fluid px-3 pt-3 pb-2 mb-2' } = {}) {
    const siteTitleEl = siteTitle
        ? `<span class="fw-bold ms-2" style="font-size:1.15rem;letter-spacing:.03em;">${siteTitle}</span>`
        : '';
    const badgeEl = badge
        ? `<span class="badge bg-secondary fs-6 ms-2">${badge}</span>`
        : '';
    const html = `
        <div class="${containerClass}">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <a href="home.html">
                        <img id="sismo-logo" src="assets/img/logo_label.png" alt="SISMO Logo" style="height: 30px;">
                    </a>
                    ${siteTitleEl}${badgeEl}
                </div>
                <div>${rightHtml}</div>
            </div>
            <hr class="mt-2 mb-0">
        </div>`;
    const target = document.getElementById('page-header');
    if (target) target.innerHTML = html;
}

// ─── Back Button HTML ─────────────────────────────────────────────────────────
/**
 * Returns HTML for a back button.
 * Desktop: shows full label + "(Esc)". Mobile: shorter label, no Esc hint.
 * @param {string} label       – desktop label e.g. "Back to Home"
 * @param {string} mobileLabel – mobile label e.g. "Home"
 * @param {string} href        – link target
 */
function backButtonHtml({ label = 'Back to Home', mobileLabel = 'Home', href = 'home.html' } = {}) {
    return `<a href="${href}" id="btnBack" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-left"></i>
        <span class="d-none d-md-inline">${label} (Esc)</span>
        <span class="d-inline d-md-none">${mobileLabel}</span>
    </a>`;
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
/**
 * Renders a mobile-only bottom nav into #mobile-bottom-nav-host.
 * @param {Array} buttons  – [{ icon, label, onclick, id?, cls? }]
 */
function renderMobileBottomNav(buttons) {
    const host = document.getElementById('mobile-bottom-nav-host');
    if (!host) return;
    // Use single-quoted onclick attr so inner double-quotes never break HTML
    const btns = buttons.map(b =>
        `<button class="sismo-bnav-btn ${b.cls || ''}" id="${b.id || ''}" onclick='${b.onclick}'>
            <i class="bi ${b.icon}"></i>
            <span>${b.label}</span>
        </button>`
    ).join('');
    host.innerHTML = `<nav class="sismo-bottom-nav d-md-none">${btns}</nav><div style="height:64px" class="d-md-none"></div>`;
}

// ─── Background Color + Auto Contrast ────────────────────────────────────────
/**
 * Applies a background color to <body> and automatically switches
 * text on the page to white whenever the color is perceived as dark
 * (relative luminance < 0.35, per WCAG formula).
 *
 * Elements made white when dark: body text, headings, labels, small/muted text,
 * page-header hr, bottom-nav labels, and Bootstrap text-secondary / text-muted.
 *
 * @param {string} hex – 6-digit hex color, e.g. "#1a2b3c"
 */
(function injectDarkBgStyles() {
    if (document.getElementById('sismo-darkbg-styles')) return;
    const s = document.createElement('style');
    s.id = 'sismo-darkbg-styles';
    // Containers that keep their own light background — text inside them must NOT be forced white.
    // Also excludes any element inside a Bootstrap bg-* utility container (bg-light, bg-white, bg-dark, etc.)
    // and the main POS container (which has its own CSS background: white) so those sections are
    // unaffected by the body background change.
    const _exc = ':not(.card *):not(.login-card *):not(.table *):not(.modal-content *):not(.offcanvas *):not(.dropdown-menu *):not(.sismo-slide-panel *):not(.sismo-bottom-nav *):not([class*="bg-"] *):not(.pos-container *)';
    s.textContent = `
        /* Only elements that sit directly on the dark body (outside any light-bg container) */
        body.sismo-dark-bg :is(h1,h2,h3,h4,h5,h6,p,label,small,
            .text-muted,.text-secondary,.text-dark,
            .form-label,.form-text,.fw-bold,.fw-semibold)${_exc},
        body.sismo-dark-bg span:not(.badge)${_exc},
        body.sismo-dark-bg button:not(.btn-primary):not(.btn-dark):not(.btn-success):not(.btn-danger):not(.btn-warning):not(.btn-info):not(.filter-btn.active)${_exc},
        body.sismo-dark-bg a.btn:not(.btn-primary):not(.btn-dark):not(.btn-success):not(.btn-danger):not(.btn-warning):not(.btn-info)${_exc} {
            color: #ffffff !important;
        }
        body.sismo-dark-bg button:not(.btn-primary):not(.btn-dark):not(.btn-success):not(.btn-danger):not(.btn-warning):not(.btn-info):not(.filter-btn.active)${_exc},
        body.sismo-dark-bg a.btn:not(.btn-primary):not(.btn-dark):not(.btn-success):not(.btn-danger):not(.btn-warning):not(.btn-info)${_exc} {
            border-color: rgba(255,255,255,0.55) !important;
        }
        body.sismo-dark-bg hr${_exc} { border-color: rgba(255,255,255,0.3) !important; }
        body.sismo-dark-bg .text-white-50${_exc} { color: rgba(255,255,255,0.6) !important; }
    `;
    document.head.appendChild(s);
})();

function _hexLuminance(hex) {
    // Strip leading #
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const toLinear = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function applyBgColor(hex) {
    document.body.style.backgroundColor = hex;
    const isDark = _hexLuminance(hex) < 0.35;
    document.body.classList.toggle('sismo-dark-bg', isDark);
    const logo = document.getElementById('sismo-logo');
    if (logo) logo.src = isDark
        ? 'assets/img/ogo_label_bgdark.png'
        : 'assets/img/logo_label.png';
}

// ─── Slide Panel Toggle Factory ───────────────────────────────────────────────
/**
 * Creates a toggle function for a shared slide panel.
 * Applies initial state immediately (no animation on load).
 * @param {string}  bodyId    – id of the panel body element
 * @param {string}  arrowId   – id of the chevron icon element
 * @param {string|null} navBtnId – id of the bottom nav button to sync (or null)
 * @param {boolean} startOpen – whether the panel starts open (default: false)
 * @returns {Function} toggle() – call to open/close the panel
 */
function makeSlidePanelToggle(bodyId, arrowId, navBtnId = null, startOpen = false) {
    let isOpen = startOpen;
    const body  = document.getElementById(bodyId);
    const arrow = document.getElementById(arrowId);

    // Set initial state without CSS transition firing
    body.style.transition  = 'none';
    arrow.style.transition = 'none';
    body.classList.toggle('collapsed', !isOpen);
    arrow.classList.toggle('collapsed', !isOpen);
    // Re-enable transitions after first frame
    requestAnimationFrame(() => {
        body.style.transition  = '';
        arrow.style.transition = '';
    });

    function toggle() {
        isOpen = !isOpen;
        body.classList.toggle('collapsed', !isOpen);
        arrow.classList.toggle('collapsed', !isOpen);
        if (navBtnId) {
            const btn = document.getElementById(navBtnId);
            if (btn) btn.classList.toggle('active', isOpen);
        }
    }
    toggle.isOpen = () => isOpen;
    return toggle;
}
