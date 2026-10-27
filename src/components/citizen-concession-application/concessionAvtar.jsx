/**
 * Illustrated avatars for the concession categories.
 * Each one is a self-contained SVG clipped to a circle.
 * Use: const Avatar = AVATARS[categoryId]; <Avatar />
 */

const clip = (id) => (
  <defs>
    <clipPath id={id}>
      <circle cx="50" cy="50" r="50" />
    </clipPath>
  </defs>
);

/* 64x64 variant of clip, used by the Women and Ex-servicemen avatars */
const clip64 = (id) => (
  <defs>
    <clipPath id={id}>
      <circle cx="32" cy="32" r="32" />
    </clipPath>
  </defs>
);

/* Stroke helper for outline-only paths */
const S = (stroke, strokeWidth) => ({
  fill: "none",
  stroke,
  strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

/* Woman – friendly flat avatar with bob hair, orange top and blush */
export function WomenAvatar() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Woman avatar">
      {clip64("av-women")}
      <g clipPath="url(#av-women)">
        <rect width="64" height="64" fill="#FFE9DC" />
        {/* hair, back */}
        <path d="M32 6c-10 0-16 7-16 17v16c0 3 2 5 5 5h22c3 0 5-2 5-5V23c0-10-6-17-16-17z" fill="#2b2433" />
        {/* top */}
        <path d="M8 62c0-11 10-18 24-18s24 7 24 18z" fill="#ff8a3d" />
        {/* neck */}
        <rect x="28" y="38" width="8" height="9" rx="3" fill="#f0b08a" />
        {/* face */}
        <ellipse cx="32" cy="27" rx="10.5" ry="12" fill="#ffe2cc" />
        {/* fringe */}
        <path d="M21 26c7 0 12-4 14-9 2 4 5 7 8 9 0-9-4-14-11-14s-11 5-11 14z" fill="#2b2433" />
        {/* eyes */}
        {/* <circle cx="28" cy="29" r="1.4" fill="#2b2433" />
        <circle cx="36" cy="29" r="1.4" fill="#2b2433" /> */}
        {/* smile */}
        {/* <path d="M28.5 34q3.5 3 7 0" {...S("#d9506a", 1.8)} /> */}
        {/* blush */}
        {/* <circle cx="25" cy="33" r="2" fill="#ffb3b3" opacity=".6" />
        <circle cx="39" cy="33" r="2" fill="#ffb3b3" opacity=".6" /> */}
      </g>
    </svg>
  );
}

/* Person using a wheelchair – faceless flat style */
export function HandicappedAvatar() {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="Person using a wheelchair avatar">
      {clip("av-hc")}
      <g clipPath="url(#av-hc)">
        <rect width="100" height="100" fill="#CFE3FB" />
        {/* chair back, handle, seat */}
        <path d="M34 40 V64 H62 M34 40 H26" stroke="#37474F" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* torso + neck */}
        <path d="M44 41 L44 58" stroke="#2F6FE0" strokeWidth="15" strokeLinecap="round" />
        <rect x="41" y="30" width="6" height="8" fill="#D9A07A" />
        {/* head: plain, no features */}
        <circle cx="44" cy="23.5" r="9.5" fill="#EDB790" />
        <path d="M34.5 23 C33 10 55 10 53.5 23 C50 17 39 17 34.5 23Z" fill="#1E1512" />
        {/* legs */}
        <path d="M44 59 L66 59" stroke="#23345F" strokeWidth="8.5" strokeLinecap="round" />
        <path d="M66 59 L68 77" stroke="#23345F" strokeWidth="7.5" strokeLinecap="round" />
        <path d="M63 80.5 H75" stroke="#1E1512" strokeWidth="4.5" strokeLinecap="round" />
        {/* arm resting on the wheel rim */}
        <path d="M46 43 L58 57" stroke="#2F6FE0" strokeWidth="5.5" strokeLinecap="round" />
        <circle cx="60" cy="60" r="3" fill="#EDB790" />
        {/* wheel */}
        <circle cx="46" cy="72" r="17" fill="none" stroke="#37474F" strokeWidth="3.6" />
        <circle cx="46" cy="72" r="13" fill="none" stroke="#90A4AE" strokeWidth="1.3" />
        <g stroke="#90A4AE" strokeWidth="1.1">
          <path d="M46 59 V85 M33 72 H59 M36.8 62.8 L55.2 81.2 M55.2 62.8 L36.8 81.2" />
        </g>
        <circle cx="46" cy="72" r="3" fill="#37474F" />
      </g>
    </svg>
  );
}

/* Indian Army ex-serviceman – camo helmet, thick moustache, tricolour patches */
export function ExServicemenAvatar() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="Indian Army ex-serviceman avatar">
      {clip64("av-soldier")}
      <defs>
        <clipPath id="av-soldier-helm">
          <path d="M12 31c0-14 8-22 20-22s20 8 20 22z" />
        </clipPath>
      </defs>
      <g clipPath="url(#av-soldier)">
        <rect width="64" height="64" fill="#E8EFDC" />
        {/* uniform */}
        <path d="M3 63c0-11 8-16 17-17l12 6 12-6c9 1 17 6 17 17z" fill="#5d7a3e" />
        <path d="M8 56l6-5 5 4-4 8H6zM46 58l7-4 6 5-2 4H44z" fill="#3f5a2b" opacity=".75" />
        <path d="M26 54l8 4 6-5" fill="#8a9a5b" opacity=".6" />
        <path d="M24 47l8 9 8-9-3-2-5 5-5-5z" fill="#2f3d22" />
        <rect x="36" y="57" width="9" height="3.5" rx="1" fill="#3f5a2b" />
        <rect x="19" y="57" width="9" height="3.5" rx="1" fill="#3f5a2b" />
        {/* tricolour shoulder patch */}
        <rect x="6" y="52" width="11" height="8" rx="1" fill="#fff" />
        <rect x="6" y="52" width="11" height="2.7" fill="#ff9933" />
        <rect x="6" y="57.3" width="11" height="2.7" fill="#138808" />
        <circle cx="11.5" cy="56" r="1.3" fill="none" stroke="#1c3f94" strokeWidth=".7" />
        {/* neck, ears, face */}
        <rect x="27" y="42" width="10" height="8" rx="3" fill="#b97a4c" />
        <circle cx="18.5" cy="35" r="3.2" fill="#cf8a58" />
        <circle cx="45.5" cy="35" r="3.2" fill="#cf8a58" />
        <path d="M19 28h26v9c0 8-5 13-13 13s-13-5-13-13z" fill="#dc9a64" />
        <path d="M19 31v8c0 7 5 12 13 12s13-5 13-12v-8" {...S("#2f3d22", 1.6)} />
        {/* eyes, brows, nose */}
        <path d="M23.5 31.5l6-1.2M40.5 31.5l-6-1.2" {...S("#2a1b14", 1.8)} />
        <ellipse cx="26.5" cy="34.5" rx="2.3" ry="1.6" fill="#fff" />
        <ellipse cx="37.5" cy="34.5" rx="2.3" ry="1.6" fill="#fff" />
        <circle cx="26.7" cy="34.6" r="1.15" fill="#2a1b14" />
        <circle cx="37.3" cy="34.6" r="1.15" fill="#2a1b14" />
        <path d="M32 35.5v4.5l-1.8.8" {...S("#b97a4c", 1.3)} />
        {/* thick moustache + smile */}
        <path d="M21 42.5c3-4.5 8-4.8 11-2.2 3-2.6 8-2.3 11 2.2-3 2.2-7 1.8-11-.4-4 2.2-8 2.6-11 .4z" fill="#2a1b14" />
        <path d="M28.5 46.5q3.5 1.8 7 0" {...S("#8a4b36", 1.3)} />
        {/* camo helmet */}
        <g clipPath="url(#av-soldier-helm)">
          <rect x="10" y="7" width="44" height="26" fill="#5d7a3e" />
          <path d="M12 14l9-2 5 6-6 5-8-3z" fill="#3f5a2b" />
          <path d="M30 10l12 1 3 7-8 3-6-5z" fill="#8a9a5b" />
          <path d="M40 22l10-3 3 8-9 3z" fill="#3f5a2b" />
          <path d="M18 24l8-2 3 6-7 3z" fill="#b3a46a" opacity=".85" />
          <path d="M31 24l7 1-1 6-7-1z" fill="#3f5a2b" />
          <ellipse cx="25" cy="15" rx="9" ry="4" fill="#fff" opacity=".2" transform="rotate(-20 25 15)" />
        </g>
        <path d="M10 30c0-1.5 1-2.5 2.5-2.5h39c1.5 0 2.5 1 2.5 2.5v1.5c0 1.5-1 2.5-2.5 2.5h-39C11 34 10 33 10 31.5z" fill="#3a4f27" />
        {/* helmet flag badge */}
        <rect x="27" y="14.5" width="10" height="7" rx="1.3" fill="#fff" />
        <rect x="27" y="14.5" width="10" height="2.4" rx="1" fill="#ff9933" />
        <rect x="27" y="19.1" width="10" height="2.4" rx="1" fill="#138808" />
        <circle cx="32" cy="18" r="1.2" fill="none" stroke="#1c3f94" strokeWidth=".7" />
      </g>
    </svg>
  );
}

/* Educational institution – mortarboard over a green leaf */
export function EnvInstitutionAvatar() {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="Environmental educational institution avatar">
      {clip("av-inst")}
      <g clipPath="url(#av-inst)">
        <rect width="100" height="100" fill="#CFF3EE" />
        {/* leaf */}
        <path d="M24 90 C22 66 46 58 76 62 C76 82 58 94 24 90Z" fill="#2FB67C" />
        <path d="M27 87 C42 76 56 69 73 64" stroke="#FFFFFF" strokeWidth="1.8" opacity=".75" fill="none" strokeLinecap="round" />
        {/* mortarboard */}
        <path d="M32 40 V54 C32 62 68 62 68 54 V40Z" fill="#1C4A57" />
        <path d="M50 14 L87 29 L50 44 L13 29Z" fill="#12333D" />
        <path d="M50 14 L87 29 L50 29Z" fill="#FFFFFF" opacity=".12" />
        <path d="M82 31 V50" stroke="#F4B63F" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="82" cy="53" r="3" fill="#F4B63F" />
      </g>
    </svg>
  );
}

/* Housing society – buildings with a tree */
export function EnvSocietyAvatar() {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label="Environmental society avatar">
      {clip("av-society")}
      <g clipPath="url(#av-society)">
        <rect width="100" height="100" fill="#D5F5E3" />
        <circle cx="24" cy="22" r="8" fill="#FFD56B" />
        {/* buildings */}
        <rect x="14" y="38" width="30" height="50" rx="2" fill="#FFFFFF" />
        <rect x="44" y="52" width="22" height="36" rx="2" fill="#E6F0EE" />
        <g fill="#7FB7C9">
          <rect x="20" y="45" width="7" height="8" />
          <rect x="31" y="45" width="7" height="8" />
          <rect x="20" y="58" width="7" height="8" />
          <rect x="31" y="58" width="7" height="8" />
          <rect x="20" y="71" width="7" height="8" />
          <rect x="31" y="71" width="7" height="8" />
          <rect x="49" y="58" width="6" height="7" />
          <rect x="57" y="58" width="6" height="7" />
          <rect x="49" y="71" width="6" height="7" />
          <rect x="57" y="71" width="6" height="7" />
        </g>
        {/* tree */}
        <rect x="75" y="66" width="4" height="22" fill="#7A5230" />
        <circle cx="77" cy="57" r="13" fill="#2FB67C" />
        <circle cx="69" cy="64" r="8" fill="#3CCB8B" />
        <circle cx="85" cy="64" r="8" fill="#3CCB8B" />
        {/* ground */}
        <rect x="0" y="88" width="100" height="12" fill="#3E9B6B" />
      </g>
    </svg>
  );
}

export const AVATARS = {
  women: WomenAvatar,
  handicapped: HandicappedAvatar,
  "ex-servicemen": ExServicemenAvatar,
  "env-institution": EnvInstitutionAvatar,
  "env-society": EnvSocietyAvatar,
};