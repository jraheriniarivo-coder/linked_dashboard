export const CLOSING_SLIDE_DEFAULTS = {
  title: 'Merci',
  headline: 'Misaotra betsaka !',
  message: 'Aux conseillers, pour leur engagement.',
};
export function buildCoverArtworkSvgString(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 540" preserveAspectRatio="xMaxYMid slice" style="position:absolute;right:0;top:0;height:100%;width:420px;pointer-events:none;" aria-hidden="true">
    <defs>
      <linearGradient id="cg-bar-1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#00c4bc" stop-opacity="0.34" />
        <stop offset="100%" stop-color="#00c4bc" stop-opacity="0.04" />
      </linearGradient>
      <linearGradient id="cg-bar-2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#00d2c8" stop-opacity="0.58" />
        <stop offset="100%" stop-color="#00afa9" stop-opacity="0.08" />
      </linearGradient>
      <linearGradient id="cg-bar-3" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4ce6de" stop-opacity="0.88" />
        <stop offset="100%" stop-color="#00afa9" stop-opacity="0.14" />
      </linearGradient>
      <linearGradient id="cg-wave" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#00c2ba" stop-opacity="0" />
        <stop offset="55%" stop-color="#00e0d6" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#ffa900" stop-opacity="0.85" />
      </linearGradient>
    </defs>

    <!-- Subtle architectural radar rings anchored bottom-right -->
    <circle cx="385" cy="480" r="145" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1" />
    <circle cx="385" cy="480" r="235" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="4 6" />
    <circle cx="385" cy="480" r="325" fill="none" stroke="rgba(0,194,186,0.14)" stroke-width="1.2" />

    <!-- Soft diagonal structural grid lines -->
    <line x1="90" y1="540" x2="420" y2="210" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
    <line x1="170" y1="540" x2="420" y2="290" stroke="rgba(255,255,255,0.05)" stroke-width="1" />

    <!-- 5-day ascending geometric pillars (J1 -> J5) -->
    <rect x="132" y="348" width="38" height="122" rx="10" fill="url(#cg-bar-1)" stroke="rgba(0,194,186,0.22)" stroke-width="1" />
    <rect x="184" y="302" width="38" height="168" rx="10" fill="url(#cg-bar-1)" stroke="rgba(0,194,186,0.28)" stroke-width="1" />
    <rect x="236" y="250" width="38" height="220" rx="10" fill="url(#cg-bar-2)" stroke="rgba(0,210,200,0.35)" stroke-width="1" />
    <rect x="288" y="194" width="38" height="276" rx="10" fill="url(#cg-bar-2)" stroke="rgba(0,224,214,0.45)" stroke-width="1" />
    <rect x="340" y="132" width="38" height="338" rx="10" fill="url(#cg-bar-3)" stroke="rgba(255,255,255,0.45)" stroke-width="1.2" />

    <!-- Acoustic voice trajectory curve climbing across the 5 pillars -->
    <path d="M 78 395 C 145 390, 165 322, 203 310 C 242 298, 260 228, 307 205 C 335 190, 348 148, 359 112" fill="none" stroke="url(#cg-wave)" stroke-width="3" stroke-linecap="round" />
    <path d="M 96 422 C 165 415, 195 352, 245 330 C 288 310, 315 245, 368 190" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" stroke-dasharray="3 5" stroke-linecap="round" />

    <!-- Signal nodes along trajectory -->
    <circle cx="151" cy="348" r="4.5" fill="#00c2ba" />
    <circle cx="203" cy="302" r="5" fill="#00d6cc" />
    <circle cx="255" cy="250" r="5.5" fill="#8ff3ed" />
    <circle cx="307" cy="194" r="6" fill="#ffffff" />

    <!-- Summit beacon (Cyan + Connecteo Amber spark) -->
    <circle cx="359" cy="112" r="19" fill="none" stroke="rgba(255,169,0,0.38)" stroke-width="1.5" />
    <circle cx="359" cy="112" r="10" fill="#ffa900" stroke="#ffffff" stroke-width="2.5" />
  </svg>`;
}

export function buildClosingArtworkSvgString(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 540" preserveAspectRatio="xMaxYMid slice" style="position:absolute;right:0;top:0;height:100%;width:420px;pointer-events:none;" aria-hidden="true">
    <defs>
      <linearGradient id="cl-ribbon-1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00e0d6" stop-opacity="0.34" />
        <stop offset="100%" stop-color="#008c87" stop-opacity="0.04" />
      </linearGradient>
      <linearGradient id="cl-ribbon-2" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#00c2ba" stop-opacity="0.02" />
      </linearGradient>
    </defs>

    <!-- Harmonic concentric waves -->
    <circle cx="330" cy="270" r="95" fill="none" stroke="rgba(0,224,214,0.28)" stroke-width="1.5" />
    <circle cx="330" cy="270" r="155" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
    <circle cx="330" cy="270" r="215" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1" stroke-dasharray="5 7" />

    <!-- Flowing acoustic ribbons -->
    <path d="M 110 470 C 175 360, 255 340, 315 245 C 350 188, 375 120, 420 65 L 420 220 C 370 285, 310 340, 225 415 C 185 450, 155 495, 130 540 Z" fill="url(#cl-ribbon-1)" />
    <path d="M 185 540 C 225 435, 290 385, 345 305 C 380 255, 400 205, 420 155" fill="none" stroke="url(#cl-ribbon-2)" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 140 420 C 215 355, 265 295, 330 270 C 375 252, 398 208, 420 175" fill="none" stroke="rgba(0,224,214,0.62)" stroke-width="2" stroke-linecap="round" />

    <!-- Constellation dots -->
    <circle cx="330" cy="270" r="14" fill="#00c2ba" stroke="#ffffff" stroke-width="3" />
    <circle cx="330" cy="270" r="26" fill="none" stroke="rgba(0,194,186,0.45)" stroke-width="1.5" />
    <circle cx="238" cy="354" r="6" fill="#8ff3ed" />
    <circle cx="385" cy="136" r="7" fill="#ffa900" stroke="#ffffff" stroke-width="1.5" />
    <circle cx="176" cy="402" r="4.5" fill="rgba(255,255,255,0.55)" />
    <circle cx="288" cy="148" r="5" fill="rgba(255,255,255,0.35)" />
  </svg>`;
}

export function splitCoverTitle(rawTitle: string): { lead: string; main: string } {
  const trimmed = String(rawTitle || '').trim();
  const match = trimmed.match(/^(formation)\s+(.+)$/i);
  if (match) {
    return { lead: 'Formation', main: match[2] };
  }
  return { lead: '', main: trimmed || 'Rapport de formation' };
}
