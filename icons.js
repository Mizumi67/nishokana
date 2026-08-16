// ===== Ikon SVG custom (pengganti emote) =====
// Data path ikon disimpan di sini supaya bisa dipakai ulang oleh script.js dan game.js
const ICONS = {
    "icon-sun": { viewBox: "0 0 24 24", inner: `<circle cx="12" cy="12" r="4"/> <line x1="12" y1="2" x2="12" y2="4.5"/> <line x1="12" y1="19.5" x2="12" y2="22"/> <line x1="2" y1="12" x2="4.5" y2="12"/> <line x1="19.5" y1="12" x2="22" y2="12"/> <line x1="4.9" y1="4.9" x2="6.6" y2="6.6"/> <line x1="17.4" y1="17.4" x2="19.1" y2="19.1"/> <line x1="4.9" y1="19.1" x2="6.6" y2="17.4"/> <line x1="17.4" y1="6.6" x2="19.1" y2="4.9"/>` },
    "icon-moon": { viewBox: "0 0 24 24", inner: `<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>` },
    "icon-spirit": { viewBox: "0 0 24 24", inner: `<path d="M12 3c1.5 2.2 2.2 3.9 2.2 5.4 0 .9-.3 1.6-.9 2.2.8-.2 1.4-.7 1.8-1.4.7 1.2 1 2.3 1 3.4 0 3-2.7 5.4-6.1 5.4S3.9 15.6 3.9 12.6c0-2.2 1.3-3.9 2.9-5.3-.1.5-.1.9-.1 1.3 0 .8.3 1.5.8 2-.2-3 .8-5.7 4.5-7.6Z"/>` },
    "icon-pin": { viewBox: "0 0 24 24", inner: `<path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/> <circle cx="12" cy="9.5" r="2.3"/>` },
    "icon-brush": { viewBox: "0 0 24 24", inner: `<path d="M4 20c2.5-.3 4.2-1 5.6-2.4L18 9.2a2.2 2.2 0 0 0-3.1-3.1L6.4 14.4C5 15.8 4.3 17.5 4 20Z"/> <path d="M14.5 5.1 18.9 9.5"/>` },
    "icon-replay": { viewBox: "0 0 24 24", inner: `<path d="M20 12a8 8 0 1 1-2.7-6"/> <polyline points="20 4 20 9 15 9"/>` },
    "icon-check": { viewBox: "0 0 24 24", inner: `<polyline points="4 12.5 9.5 18 20 6"/>` },
    "icon-pencil": { viewBox: "0 0 24 24", inner: `<path d="M4 20l1-4.5L15.5 5 19 8.5 8.5 19 4 20Z"/> <line x1="13" y1="7" x2="17" y2="11"/>` },
    "icon-bulb": { viewBox: "0 0 24 24", inner: `<path d="M9 18h6"/> <path d="M10 21h4"/> <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.2 2.2h4.8c.1-.9.6-1.7 1.2-2.2A6 6 0 0 0 12 3Z"/>` },
    "icon-trophy": { viewBox: "0 0 24 24", inner: `<path d="M7 4h10v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V4Z"/> <path d="M7 5H4v1a3 3 0 0 0 3 3"/> <path d="M17 5h3v1a3 3 0 0 1-3 3"/> <line x1="12" y1="12" x2="12" y2="16"/> <path d="M8 20h8"/> <path d="M9.5 16h5l.7 4h-6.4l.7-4Z"/>` },
    "icon-star": { viewBox: "0 0 24 24", inner: `<path d="M12 3.5l2.5 5.3 5.7.6-4.3 3.9 1.2 5.7-5.1-3-5.1 3 1.2-5.7-4.3-3.9 5.7-.6L12 3.5Z"/>` },
    "icon-thumbs-up": { viewBox: "0 0 24 24", inner: `<path d="M7 21H4V10h3v11Z"/> <path d="M7 10l4.5-6.5a1.8 1.8 0 0 1 3.2 1.4L13.5 10H19a2 2 0 0 1 2 2.4l-1.4 6A2 2 0 0 1 17.6 20H7"/>` },
    "icon-smile": { viewBox: "0 0 24 24", inner: `<circle cx="12" cy="12" r="9"/> <path d="M8.5 14c1 1.3 2.2 2 3.5 2s2.5-.7 3.5-2"/> <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none"/> <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none"/>` },
    "icon-meh": { viewBox: "0 0 24 24", inner: `<circle cx="12" cy="12" r="9"/> <line x1="8.5" y1="14.5" x2="15.5" y2="14.5"/> <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none"/> <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none"/>` },
    "icon-frown": { viewBox: "0 0 24 24", inner: `<circle cx="12" cy="12" r="9"/> <path d="M8.5 16c1-1.3 2.2-2 3.5-2s2.5.7 3.5 2"/> <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none"/> <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none"/>` },
    "icon-sad": { viewBox: "0 0 24 24", inner: `<circle cx="12" cy="12" r="9"/> <path d="M8.5 16.5c1-1.5 2.2-2.3 3.5-2.3s2.5.8 3.5 2.3"/> <circle cx="9" cy="10" r="0.9" fill="currentColor" stroke="none"/> <circle cx="15" cy="10" r="0.9" fill="currentColor" stroke="none"/> <path d="M15.3 12.5c.6.3 1 .9 1 1.6"/>` },
    "icon-medal": { viewBox: "0 0 24 24", inner: `<circle cx="12" cy="15" r="5.5"/> <path d="M9.5 10.2 7 3h3l2 5.4L14 3h3l-2.5 7.2"/>` },
};

// Menghasilkan markup <svg> inline untuk sebuah ikon.
// extraClass: class tambahan opsional (mis. 'icon-fill' untuk ikon solid/filled).
function iconSvg(iconId, extraClass) {
    const icon = ICONS[iconId];
    if (!icon) return '';
    const cls = extraClass ? `icon ${extraClass}` : 'icon';
    return `<svg class="${cls}" viewBox="${icon.viewBox}" aria-hidden="true">${icon.inner}</svg>`;
}
