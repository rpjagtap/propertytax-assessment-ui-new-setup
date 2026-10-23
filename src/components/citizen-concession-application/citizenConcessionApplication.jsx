import { useState, useEffect } from "react";

/* Put the blank affidavit PDFs in /public/docs (or point to your server/API) */
const affidavitUrl = (s) => s.affidavit || `/docs/${s.id}-affidavit.pdf`;
const MAX_MB = 2;

/* ---------- Concession data (edit labels / fields / routes here) ---------- */
const MAX_FILES = 5;
const D = {
  aadhaar: { mr: "आधार कार्ड", en: "Aadhaar Card" },
  pan: { mr: "पॅन कार्ड", en: "PAN Card" },
  affidavit: { mr: "स्वयंघोषित प्रतिज्ञापत्र", en: "Self-declaration affidavit", blank: true },
};
const SCHEMES = [
  { id: "women", mr: "महिला सवलत", en: "Women Concession", note: "Property in a woman's name", c1: "#ff7aa8", c2: "#e4457a",
    docs: [D.aadhaar, D.pan, D.affidavit] },
  { id: "handicapped", mr: "दिव्यांग सवलत", en: "Handicapped Concession", note: "For owners with disability", c1: "#5fb7ff", c2: "#2f6fe4",
    docs: [D.aadhaar, { mr: "दिव्यांग प्रमाणपत्र (UDID)", en: "Disability certificate" }, D.affidavit] },
  { id: "exserviceman", mr: "माजी सैनिक", en: "Ex-servicemen", note: "Retired defence personnel", c1: "#8bd36b", c2: "#3c9a4a",
    docs: [D.aadhaar, { mr: "डिस्चार्ज बुक / ओळखपत्र", en: "Discharge book / ID card" }, D.affidavit] },
  { id: "edu", mr: "पर्यावरणपूरक शैक्षणिक संस्था सवलत", en: "Eco-friendly Educational Institute", note: "Schools and colleges", c1: "#ffc15a", c2: "#f08a1c",
    docs: [{ mr: "मान्यता प्रमाणपत्र", en: "Recognition certificate" }, { mr: "पर्यावरण लेखापरीक्षण अहवाल", en: "Eco-audit report" }, D.affidavit] },
  { id: "society", mr: "पर्यावरणपूरक सोसायटी", en: "Environmental Society", note: "Housing societies", c1: "#4fd9c4", c2: "#0e9f8e",
    docs: [{ mr: "सोसायटी नोंदणी प्रमाणपत्र", en: "Society registration certificate" }, { mr: "कंपोस्ट / रेनवॉटर पुरावा", en: "Compost / rainwater proof" }, D.affidavit] },
];

/* Sample property record. Replace with data fetched from your API for the logged-in / searched property. */
const SAMPLE_PROPERTY = { code: "1999999999.00", owner: "Sample Owner Name", address: "Chinchwad 1", zone: "वाकड", area: "800.0", ratable: "23952.0", useType: "निवासी", mobile: "", email: "" };

/* ---------- Illustrated icons (one recognisable figure per concession) ---------- */
const S = (c, w = 5) => ({ fill: "none", stroke: c, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" });
const ICONS = {
  // Home block: house with a discount tag
  concession: (<>
    <path d="M5 31L32 9l27 22z" fill="#2a58c9" />
    <rect x="11" y="31" width="42" height="27" rx="2" fill="#ffe2a8" />
    <rect x="25" y="42" width="12" height="16" rx="1.500" fill="#8a5a3c" />
    <circle cx="48" cy="18" r="11.500" fill="#e63946" stroke="#fff" strokeWidth="2.200" />
    <path d="M43.500 22.500l9-9" {...S("#fff", 2)} />
    <circle cx="44.500" cy="14.500" r="1.900" fill="#fff" /><circle cx="51.500" cy="21.500" r="1.900" fill="#fff" />
  </>),
  // Faceless lady silhouette: only outline, hairstyle and neckline
  women: (<>
    {/* back hair */}
    <path d="M32 4c-12 0-18 9-18 21v21c0 5 3 8 8 8h20c5 0 8-3 8-8V25c0-12-6-21-18-21z" fill="#2b1d3a" />
    {/* shoulders / top */}
    <path d="M8 63c0-11 8-17 19-18h10c11 1 19 7 19 18z" fill="#e4457a" />
    {/* neck + scoop neckline */}
    <rect x="28" y="37" width="8" height="10" rx="3" fill="#f6c4a0" />
    <path d="M24 46q8 11 16 0z" fill="#f6c4a0" />
    {/* blank face */}
    <ellipse cx="32" cy="27" rx="10.500" ry="12.500" fill="#f9d2b6" />
    {/* side-swept fringe */}
    <path d="M20.500 29c0-10 5-16 12-16 6.500 0 10.500 4.500 11.500 11-6.500 0-13-3.500-16.500-9-1 7-3.500 11.500-7 14z" fill="#2b1d3a" />
    {/* long hair falling over shoulders */}
    <path d="M18 30c-2 8-1 15-5 22 5 1 10-1 12-6-3-5-5-10-4-16z" fill="#2b1d3a" />
    <path d="M46 30c2 8 1 15 5 22-5 1-10-1-12-6 3-5 5-10 4-16z" fill="#2b1d3a" />
    {/* hair shine */}
    <path d="M24 17q6-5 14-3" {...S("#fff", 1.800)} opacity=".35" />
    <path d="M15.500 40q-.5 6-2 10" {...S("#fff", 1.400)} opacity=".25" />
  </>),
  // Person in wheelchair
  handicapped: (<>
    <circle cx="28" cy="11" r="5.500" fill="#f0b08a" />
    <path d="M28 5c4 0 7 2 7 5-3-1-8-1-12 1 0-3 2-6 5-6z" fill="#3a2f2a" />
    <path d="M22 19h11l2 15H22z" fill="#4cc38a" />
    <path d="M33 22l9 9" {...S("#4cc38a", 5)} />
    <circle cx="43" cy="32" r="2.600" fill="#f0b08a" />
    <path d="M23 34h17l7 13" {...S("#2f5bd8", 6.500)} />
    <path d="M46 49l6 1" {...S("#8a5a3c", 5)} />
    <path d="M20 22v26" {...S("#4a4f5c", 3.500)} />
    <circle cx="27" cy="46" r="12.500" fill="none" stroke="#4a4f5c" strokeWidth="4" />
    <circle cx="27" cy="46" r="2.500" fill="#4a4f5c" />
  </>),
  // Indian Army soldier: camo helmet, thick moustache, tricolour patches
  exserviceman: (<>
    <defs><clipPath id="pcHelm"><path d="M12 31c0-14 8-22 20-22s20 8 20 22z" /></clipPath></defs>
    {/* uniform */}
    <path d="M3 63c0-11 8-16 17-17l12 6 12-6c9 1 17 6 17 17z" fill="#5d7a3e" />
    <path d="M8 56l6-5 5 4-4 8H6zM46 58l7-4 6 5-2 4H44z" fill="#3f5a2b" opacity=".75" />
    <path d="M26 54l8 4 6-5" fill="#8a9a5b" opacity=".6" />
    <path d="M24 47l8 9 8-9-3-2-5 5-5-5z" fill="#2f3d22" />
    <rect x="36" y="57" width="9" height="3.500" rx="1" fill="#3f5a2b" /><rect x="19" y="57" width="9" height="3.500" rx="1" fill="#3f5a2b" />
    {/* tricolour shoulder patch */}
    <rect x="6" y="52" width="11" height="8" rx="1" fill="#fff" />
    <rect x="6" y="52" width="11" height="2.700" fill="#ff9933" /><rect x="6" y="57.300" width="11" height="2.700" fill="#138808" />
    <circle cx="11.500" cy="56" r="1.300" fill="none" stroke="#1c3f94" strokeWidth=".7" />
    {/* neck, ears, face */}
    <rect x="27" y="42" width="10" height="8" rx="3" fill="#b97a4c" />
    <circle cx="18.500" cy="35" r="3.200" fill="#cf8a58" /><circle cx="45.500" cy="35" r="3.200" fill="#cf8a58" />
    <path d="M19 28h26v9c0 8-5 13-13 13s-13-5-13-13z" fill="#dc9a64" />
    <path d="M19 31v8c0 7 5 12 13 12s13-5 13-12v-8" {...S("#2f3d22", 1.600)} />
    {/* eyes, brows, nose */}
    <path d="M23.500 31.500l6-1.200M40.500 31.500l-6-1.200" {...S("#2a1b14", 1.800)} />
    <ellipse cx="26.500" cy="34.500" rx="2.300" ry="1.600" fill="#fff" /><ellipse cx="37.500" cy="34.500" rx="2.300" ry="1.600" fill="#fff" />
    <circle cx="26.700" cy="34.600" r="1.150" fill="#2a1b14" /><circle cx="37.300" cy="34.600" r="1.150" fill="#2a1b14" />
    <path d="M32 35.500v4.500l-1.800.8" {...S("#b97a4c", 1.300)} />
    {/* thick moustache + smile */}
    <path d="M21 42.500c3-4.500 8-4.800 11-2.200 3-2.600 8-2.300 11 2.200-3 2.200-7 1.800-11-.4-4 2.200-8 2.600-11 .4z" fill="#2a1b14" />
    <path d="M28.500 46.500q3.500 1.800 7 0" {...S("#8a4b36", 1.300)} />
    {/* camo helmet */}
    <g clipPath="url(#pcHelm)">
      <rect x="10" y="7" width="44" height="26" fill="#5d7a3e" />
      <path d="M12 14l9-2 5 6-6 5-8-3z" fill="#3f5a2b" /><path d="M30 10l12 1 3 7-8 3-6-5z" fill="#8a9a5b" />
      <path d="M40 22l10-3 3 8-9 3z" fill="#3f5a2b" /><path d="M18 24l8-2 3 6-7 3z" fill="#b3a46a" opacity=".85" />
      <path d="M31 24l7 1-1 6-7-1z" fill="#3f5a2b" />
      <ellipse cx="25" cy="15" rx="9" ry="4" fill="#fff" opacity=".2" transform="rotate(-20 25 15)" />
    </g>
    <path d="M10 30c0-1.500 1-2.500 2.500-2.500h39c1.500 0 2.500 1 2.500 2.500v1.500c0 1.500-1 2.500-2.500 2.500h-39C11 34 10 33 10 31.500z" fill="#3a4f27" />
    <rect x="27" y="14.500" width="10" height="7" rx="1.300" fill="#fff" />
    <rect x="27" y="14.500" width="10" height="2.400" rx="1" fill="#ff9933" /><rect x="27" y="19.100" width="10" height="2.400" rx="1" fill="#138808" />
    <circle cx="32" cy="18" r="1.200" fill="none" stroke="#1c3f94" strokeWidth=".7" />
  </>),
  // School building with flag and clock
  edu: (<>
    <rect x="31" y="3" width="2" height="11" fill="#555" /><path d="M33 3h10l-3 3 3 3H33z" fill="#e63946" />
    <path d="M5 31L32 13l27 18z" fill="#e4572e" />
    <rect x="10" y="31" width="44" height="27" fill="#ffc857" />
    <circle cx="32" cy="24" r="5.500" fill="#fff" stroke="#2b4c9b" strokeWidth="1.800" />
    <path d="M32 21v3.500l2.500 1.500" {...S("#2b4c9b", 1.400)} />
    <rect x="27" y="43" width="10" height="15" rx="1.500" fill="#2b4c9b" />
    <g fill="#fff"><rect x="14" y="35" width="9" height="7" rx="1" /><rect x="41" y="35" width="9" height="7" rx="1" /><rect x="14" y="46" width="9" height="7" rx="1" /><rect x="41" y="46" width="9" height="7" rx="1" /></g>
    <rect x="4" y="58" width="56" height="4" rx="2" fill="#3aa76d" />
  </>),
  // Eco housing society: towers with trees
  society: (<>
    <rect x="7" y="26" width="15" height="32" rx="1.500" fill="#ff9f43" />
    <rect x="24" y="8" width="16" height="50" rx="1.500" fill="#cfd8e3" />
    <rect x="42" y="20" width="15" height="38" rx="1.500" fill="#ee5253" />
    <g fill="#fff" opacity=".9">
      <rect x="10" y="30" width="3.500" height="3.500" /><rect x="16" y="30" width="3.500" height="3.500" /><rect x="10" y="38" width="3.500" height="3.500" /><rect x="16" y="38" width="3.500" height="3.500" />
      <rect x="28" y="13" width="3.500" height="3.500" /><rect x="34" y="13" width="3.500" height="3.500" /><rect x="28" y="21" width="3.500" height="3.500" /><rect x="34" y="21" width="3.500" height="3.500" /><rect x="28" y="29" width="3.500" height="3.500" /><rect x="34" y="29" width="3.500" height="3.500" />
      <rect x="45" y="25" width="3.500" height="3.500" /><rect x="51" y="25" width="3.500" height="3.500" /><rect x="45" y="33" width="3.500" height="3.500" /><rect x="51" y="33" width="3.500" height="3.500" />
    </g>
    <rect x="29" y="46" width="6" height="12" fill="#6b7a8d" />
    <circle cx="9" cy="54" r="6.500" fill="#2ecc71" /><circle cx="55" cy="54" r="6.500" fill="#27ae60" />
    <rect x="4" y="58" width="56" height="4" rx="2" fill="#3aa76d" />
  </>),
};
const Icon = ({ id, size = 56 }) => <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">{ICONS[id]}</svg>;

/* ---------- New logo (original emblem: house + gear ring) ---------- */
const Logo = ({ size = 64 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label="PCMC logo">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb84d" /><stop offset="1" stopColor="#ff7a18" /></linearGradient>
      <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b3a8a" /><stop offset="1" stopColor="#0c1b4d" /></linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="url(#lg2)" stroke="url(#lg1)" strokeWidth="3" />
    <circle cx="32" cy="32" r="24" fill="none" stroke="url(#lg1)" strokeWidth="5" strokeDasharray="4 3.2" />
    <path d="M18 33l14-12 14 12v12a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2z" fill="#fff" />
    <rect x="28" y="37" width="8" height="10" rx="1.500" fill="url(#lg1)" />
    <path d="M14 33l18-16 18 16" fill="none" stroke="url(#lg1)" strokeWidth="3.500" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="22" cy="16" rx="14" ry="7" fill="#fff" opacity=".16" transform="rotate(-25 22 16)" />
  </svg>
);

/* ---------- Concession options per type (response of your API: data.lstPropertyConcessionVO) ---------- */
const SAMPLE_CONCESSIONS = {
  society: [
    { enConcessionName: "On-Site Composting System – Complete Wet Waste Processing (5%)", mrConcessionName: "ऑनसाईट कंपोस्टींग यंत्रणा कार्यान्वीत असल्यास (ओला कचरा पूर्णत: जिरविणाऱ्या) (5%)", concessionName: "SOCIETY_ONSITE_COMPOSTING" },
    { enConcessionName: "Sewage Treatment Plant (STP)(3%)", mrConcessionName: "एस टी पी कार्यान्वीत असल्यास(3%)", concessionName: "SOCIETY_STP" },
    { enConcessionName: "On-Site Composting + Sewage Treatment Plant (8%)", mrConcessionName: "ऑनसाईट कंपोस्टींग + एस टी पी कार्यान्वीत असल्यास (8%)", concessionName: "SOCIETY_ONSITE_COMPOSTING_STP" },
    { enConcessionName: "Zero Waste Management – Complete Wet & Dry Waste Processing (8%)", mrConcessionName: "झिरो वेस्ट संकल्पना राबविणेत येत असल्यास (ओला व सुका कचरा पूर्णत: जिरविणाऱ्या) (8%)", concessionName: "SOCIETY_ZERO_WASTE" },
    { enConcessionName: "Zero Waste Management + Sewage Treatment Plant (10%)", mrConcessionName: "झिरो वेस्ट + एस टी पी कार्यान्वीत असल्यास (ओला व सुका कचरा पूर्णत: जिरविणाऱ्या) (10%)", concessionName: "SOCIETY_ZERO_WASTE_STP" },
  ],
};
/* Returns the list for a concession type. An empty list means: no sub-options, skip that screen. */
async function loadConcessions(schemeId) {
  // TODO: replace with your API call, for example:
  // const res = await fetch(`/api/concessions?type=${schemeId}`);
  // const data = await res.json();
  // return data.lstPropertyConcessionVO || [];
  return SAMPLE_CONCESSIONS[schemeId] || [];
}
const pctOf = (n) => (n.match(/\((\d+)%\)\s*$/) || [])[1];
const clean = (n) => n.replace(/\s*\(\d+%\)\s*$/, "");

/* ---------- Application flow: instructions -> property details -> documents -> application number ---------- */
const BASE_STEPS = ["Instructions", "Property details", "Documents"];
const Stepper = ({ at, steps }) => (
  <ol className="pc-stepper" aria-label="Progress">
    {steps.map((t, i) => (
      <li key={t} className={i < at ? "done" : i === at ? "on" : ""} aria-current={i === at ? "step" : undefined}>
        <span>{i < at ? "✓" : i + 1}</span>{t}
      </li>
    ))}
  </ol>
);
const SchemeHead = ({ scheme, sub }) => (
  <div className="pc-formhead">
    <div className="pc-tile" style={{ "--c1": scheme.c1, "--c2": scheme.c2 }}><Icon id={scheme.id} size={44} /></div>
    <div><h2>{scheme.en}</h2><p className="pc-mr">{scheme.mr}</p>{sub && <span className="pc-chip">{clean(sub.enConcessionName)}</span>}</div>
  </div>
);
const DECLARATION = "सदर मिळकतीचा मी स्वत: वापर करीत असून चालू वर्षाचे सामान्य करातील सवलत योजनेसाठी मी ऑनलाईन अर्ज करीत आहे. मी सादर केलेली माहिती चुकीची असल्याचे निदर्शनास आलेस मला यापूर्वी सामान्य करात मिळालेल्या सर्व सवलतीस मी अपात्र राहील. तसेच मी सादर केलेल्या चुकीचे माहिती बद्दल करयोग्यमूल्याचे 10% दंडास पात्र राहील.";

function ApplicationForm({ scheme, property, onBack, loadFn = loadConcessions }) {
  const [step, setStep] = useState("select"); // select (if the type has options) -> info -> details -> docs -> done
  const [list, setList] = useState(null);     // concession options for this type (null = loading)
  const [chosen, setChosen] = useState(null); // selected option, e.g. { concessionName: "SOCIETY_STP", ... }
  const [loadErr, setLoadErr] = useState("");
  const [contact, setContact] = useState({ mobile: property.mobile || "", email: property.email || "" });
  const [errors, setErrors] = useState({});
  const [picked, setPicked] = useState({});     // files chosen per document row
  const [uploaded, setUploaded] = useState({}); // uploaded file names per row
  const [busy, setBusy] = useState({});
  const [rowErr, setRowErr] = useState({});
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appNo, setAppNo] = useState(null);

  useEffect(() => {
    let stale = false;
    loadFn(scheme.id)
      .then((l) => { if (stale) return; setList(l); if (!l.length) setStep("info"); })
      .catch(() => { if (!stale) setLoadErr("Could not load the concessions. Please try again."); });
    return () => { stale = true; };
  }, [scheme.id, loadFn]);

  const steps = list?.length ? ["Concession", ...BASE_STEPS] : BASE_STEPS;
  const off = list?.length ? 1 : 0;

  const setRow = (setter, i, v) => setter((o) => ({ ...o, [i]: v }));

  /* ----- step 2: property details ----- */
  const toDocs = (e) => {
    e.preventDefault();
    const err = {};
    if (!contact.email.trim()) err.email = "Please enter Email";
    else if (!/^\S+@\S+\.\S+$/.test(contact.email)) err.email = "Enter a valid Email";
    if (!/^[6-9]\d{9}$/.test(contact.mobile)) err.mobile = "Enter a valid 10-digit Mobile No";
    setErrors(err);
    if (!Object.keys(err).length) setStep("docs");
  };

  /* ----- step 3: documents ----- */
  const pick = (i, list) => {
    const files = Array.from(list);
    let err = "";
    if (files.length > MAX_FILES) err = `Maximum ${MAX_FILES} files`;
    else if (files.some((f) => !/\.pdf$/i.test(f.name))) err = "Only PDF files are allowed";
    else if (files.some((f) => f.size > MAX_MB * 1024 * 1024)) err = `Each file must be under ${MAX_MB} MB`;
    setRow(setPicked, i, err ? [] : files);
    setRow(setRowErr, i, err);
  };
  const upload = async (i) => {
    if (!picked[i]?.length) return setRow(setRowErr, i, "Choose a PDF file first");
    setRow(setBusy, i, true);
    try {
      // TODO: send picked[i] to your upload API (FormData) and keep the returned file ids
      await new Promise((r) => setTimeout(r, 600));
      setRow(setUploaded, i, picked[i].map((f) => f.name));
      setRow(setPicked, i, []);
      setRow(setRowErr, i, "");
    } finally { setRow(setBusy, i, false); }
  };
  const replace = (i) => setRow(setUploaded, i, null);

  const allUploaded = scheme.docs.every((_, i) => uploaded[i]?.length);
  const canSubmit = allUploaded && agree && !submitting;

  const submit = async () => {
    setSubmitting(true);
    try {
      // TODO: POST property code, chosen?.concessionName, contact and uploaded file ids to your API; use the application number it returns
      await new Promise((r) => setTimeout(r, 700));
      setAppNo("PCMC-" + scheme.id.toUpperCase().slice(0, 3) + "-" + Date.now().toString().slice(-6));
      setStep("done");
    } finally { setSubmitting(false); }
  };

  /* ----- screens ----- */
  if (step === "done")
    return (
      <div className="pc-panel pc-center">
        <div className="pc-tick" style={{ background: `linear-gradient(145deg,${scheme.c1},${scheme.c2})` }}>✓</div>
        <h2>Application submitted</h2>
        {chosen && <p className="pc-chip">{clean(chosen.enConcessionName)}</p>}
        <p>Your application number is</p>
        <div className="pc-appno">{appNo}</div>
        <p className="pc-muted">Keep this number to track your {scheme.en.toLowerCase()} request.</p>
        <button className="pc-btn" onClick={onBack}>Back to concessions</button>
      </div>
    );

  if (step === "select")
    return (
      <div className="pc-panel pc-wide">
        <Stepper steps={steps} at={0} />
        <SchemeHead scheme={scheme} />
        {loadErr ? (
          <p className="pc-errlist" role="alert">{loadErr}</p>
        ) : !list ? (
          <p className="pc-muted" role="status">Loading concessions…</p>
        ) : (
          <>
            <p className="pc-notice">योग्य सवलत निवडा · Select the concession you want to apply for</p>
            <div className="pc-opts" role="radiogroup" aria-label="Concession options">
              {list.map((o) => {
                const on = chosen?.concessionName === o.concessionName;
                const pct = pctOf(o.enConcessionName) || pctOf(o.mrConcessionName);
                return (
                  <label key={o.concessionName} className={"pc-opt" + (on ? " on" : "")}>
                    <input type="radio" name="concession" checked={on} onChange={() => setChosen(o)} />
                    <span className="pc-radio" aria-hidden="true" />
                    <span className="pc-optbody"><span className="pc-mr2">{clean(o.mrConcessionName)}</span><small>{clean(o.enConcessionName)}</small></span>
                    {pct && <span className="pc-pct">{pct}%</span>}
                  </label>
                );
              })}
            </div>
          </>
        )}
        <div className="pc-actions">
          <button type="button" className="pc-btn ghost" onClick={onBack}>Cancel</button>
          <button type="button" className="pc-btn" disabled={!chosen} onClick={() => setStep("info")}>Next</button>
        </div>
      </div>
    );

  if (step === "info")
    return (
      <div className="pc-panel">
        <Stepper steps={steps} at={off} />
        <SchemeHead scheme={scheme} sub={chosen} />
        <p className="pc-notice">
          {scheme.mr} योजनेकरिता आवश्यक असलेल्या कागदपत्रांपैकी स्वयंघोषित प्रतिज्ञापत्र ऑनलाईन अर्ज करणेकरिता डाऊनलोड करा व माहिती भरून अपलोड करा
        </p>
        <ol className="pc-steps">
          <li><b>Download</b> the self-declaration affidavit.</li>
          <li><b>Fill it by hand</b> and sign it.</li>
          <li><b>Scan</b> the signed affidavit as a PDF (under {MAX_MB} MB).</li>
          <li><b>Upload</b> it with your other documents in the last step.</li>
        </ol>
        <a className="pc-btn pc-dl" href={affidavitUrl(scheme)} download>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M5 20h14" fill="none" stroke="#fff" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Download affidavit (PDF)
        </a>
        <div className="pc-actions">
          <button type="button" className="pc-btn ghost" onClick={list?.length ? () => setStep("select") : onBack}>{list?.length ? "Back" : "Cancel"}</button>
          <button type="button" className="pc-btn" onClick={() => setStep("details")}>Next</button>
        </div>
      </div>
    );

  if (step === "details") {
    const rows = [
      ["Property Code", property.code], ["Property Name", property.owner],
      ["Property Address", property.address], ["Zone", property.zone],
      ["Area", property.area], ["Ratable Value", property.ratable],
    ];
    const errList = Object.values(errors);
    return (
      <form className="pc-panel pc-wide" onSubmit={toDocs} noValidate>
        <Stepper steps={steps} at={1 + off} />
        {errList.length > 0 && <ul className="pc-errlist" role="alert">{errList.map((m) => <li key={m}>{m}</li>)}</ul>}
        <dl className="pc-props">
          {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          <div>
            <dt><label htmlFor="pc-mobile">Mobile No</label></dt>
            <dd><input id="pc-mobile" type="tel" maxLength={10} value={contact.mobile} aria-invalid={!!errors.mobile}
              onChange={(e) => setContact({ ...contact, mobile: e.target.value.replace(/\D/g, "") })} /></dd>
          </div>
          <div>
            <dt><label htmlFor="pc-email">Email</label></dt>
            <dd><input id="pc-email" type="email" value={contact.email} aria-invalid={!!errors.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })} /></dd>
          </div>
          <div><dt>UseType</dt><dd>{property.useType}</dd></div>
        </dl>
        <div className="pc-actions">
          <button type="button" className="pc-btn ghost" onClick={() => setStep("info")}>Back</button>
          <button type="submit" className="pc-btn">Next</button>
        </div>
      </form>
    );
  }

  /* step === "docs" */
  return (
    <div className="pc-panel pc-wide pc-nopad">
      <div className="pc-docbar">Required Documents</div>
      <div className="pc-docbody">
        <Stepper steps={steps} at={2 + off} />
        <p className="pc-pdfnote">✓ चिन्ह असलेले सर्व कागदपत्रांची केवळ पीडीएफ फाइल अपलोड करा.</p>
        <div className="pc-tablewrap">
          <table className="pc-table">
            <thead><tr><th>Select</th><th>Sr. No.</th><th>Document Name</th><th>Upload Documents</th></tr></thead>
            <tbody>
              {scheme.docs.map((d, i) => {
                const done = uploaded[i]?.length;
                return (
                  <tr key={i}>
                    <td><input type="checkbox" checked={!!done} readOnly tabIndex={-1} aria-label={`${d.en} uploaded`} /></td>
                    <td>{i + 1}</td>
                    <td>
                      <span className="pc-mr2">{d.mr}</span><small>{d.en}</small>
                      {d.blank && <a className="pc-blank" href={affidavitUrl(scheme)} download>Download blank</a>}
                    </td>
                    <td>
                      {done ? (
                        <div className="pc-ok">
                          <span>✓ {uploaded[i].join(", ")}</span>
                          <button type="button" className="pc-link" onClick={() => replace(i)}>Replace</button>
                        </div>
                      ) : (
                        <div className="pc-up">
                          <input type="file" accept=".pdf,application/pdf" multiple aria-label={`Choose PDF for ${d.en}`}
                            onChange={(e) => pick(i, e.target.files)} />
                          <button type="button" className="pc-upbtn" disabled={busy[i]} onClick={() => upload(i)}>
                            {busy[i] ? "Uploading…" : "Upload"}
                          </button>
                          <small>PDF only. Files (maximum {MAX_FILES}), {MAX_MB} MB each.</small>
                          {rowErr[i] && <em role="alert">{rowErr[i]}</em>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button type="button" className="pc-link center" onClick={() => setStep("details")}>Back</button>
      </div>
      <div className="pc-decl">
        <p>{DECLARATION}</p>
        <label className="pc-check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I agree to the declaration above.</label>
        <button type="button" className="pc-btn" disabled={!canSubmit} onClick={submit}>
          {submitting ? "Submitting…" : "Submit application"}
        </button>
        {!canSubmit && <small className="pc-hint">{allUploaded ? "Tick the declaration to submit." : "Upload all documents to enable Submit."}</small>}
      </div>
    </div>
  );
}

/* ---------- Landing page ---------- */
/* Home blocks. Add more service blocks here later; only "concession" opens this module's screens. */
const HOME_BLOCKS = [
  { id: "concession", mr: "मालमत्ता कर सवलत", en: "Property Tax Concession", note: "Apply online for concession schemes", c1: "#7aa5ff", c2: "#2a58c9" },
];

export default function ConcessionModule({ property = SAMPLE_PROPERTY, loadConcessionsFn = loadConcessions }) {
  // screens: "home" (blocks) -> "types" (concession type screen) -> application flow for the chosen concession
  // swap with react-router: /home, /concession, /concession/:id
  const [screen, setScreen] = useState("home");
  const [active, setActive] = useState(null);
  const scheme = SCHEMES.find((s) => s.id === active);

  const goHome = () => { setActive(null); setScreen("home"); };
  const goTypes = () => { setActive(null); setScreen("types"); };

  const crumbs = [];
  if (screen !== "home" || scheme) {
    crumbs.push({ label: "Home", go: goHome });
    crumbs.push({ label: "Concession type", go: scheme ? goTypes : null });
    if (scheme) crumbs.push({ label: scheme.en, go: null });
  }

  return (
    <div className="pc-root">
      <style>{CSS}</style>
      <div className="pc-blob b1" /><div className="pc-blob b2" />

      <header className="pc-header">
        <Logo />
        <div className="pc-title">
          <h1>पिंपरी चिंचवड महानगरपालिका</h1>
          <p>कर आकारणी व कर संकलन विभाग · Tax Assessment &amp; Collection</p>
        </div>
        <div className="pc-help">
          <span>Helpline</span><strong>8888006666</strong>
          <a href="mailto:ptax@pcmcindia.gov.in">ptax@pcmcindia.gov.in</a>
        </div>
      </header>

      <main className="pc-main">
        {crumbs.length > 0 && (
          <nav className="pc-crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={c.label}>
                {i > 0 && <i aria-hidden="true">›</i>}
                {c.go ? <button type="button" onClick={c.go}>{c.label}</button> : <b aria-current="page">{c.label}</b>}
              </span>
            ))}
          </nav>
        )}

        {scheme ? (
          <ApplicationForm key={scheme.id} scheme={scheme} property={property} loadFn={loadConcessionsFn} onBack={goTypes} />
        ) : screen === "home" ? (
          <>
            <div className="pc-intro">
              <h2>ऑनलाईन सेवा</h2>
              <p>Online services. Select a service to continue.</p>
            </div>
            <div className="pc-cards">
              {HOME_BLOCKS.map((b) => (
                <button key={b.id} className="pc-card" onClick={goTypes} style={{ "--c1": b.c1, "--c2": b.c2 }}>
                  <span className="pc-tile big"><Icon id={b.id} size={62} /></span>
                  <span className="pc-mr">{b.mr}</span>
                  <span className="pc-en">{b.en}</span>
                  <span className="pc-note">{b.note}</span>
                  <span className="pc-go">Open</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="pc-intro">
              <h2>सवलतीचा प्रकार निवडा · Select Concession Type</h2>
              <p>मालमत्ता करातील विविध सवलत योजना. Choose the one that applies to you and apply online.</p>
            </div>
            <div className="pc-cards">
              {SCHEMES.map((s) => (
                <button key={s.id} className="pc-card" onClick={() => setActive(s.id)} style={{ "--c1": s.c1, "--c2": s.c2 }}>
                  <span className="pc-tile big"><Icon id={s.id} size={62} /></span>
                  <span className="pc-mr">{s.mr}</span>
                  <span className="pc-en">{s.en}</span>
                  <span className="pc-note">{s.note}</span>
                  <span className="pc-go">Apply</span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ---------- Styles ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;800&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
.pc-root{--ink:#0c1b4d;--muted:#5b6785;--line:#dfe6f3;--accent:#ff7a18;min-height:100vh;position:relative;overflow:hidden;
 font-family:'Plus Jakarta Sans','Noto Sans Devanagari',system-ui,sans-serif;color:var(--ink);
 background:linear-gradient(180deg,#eef3ff 0%,#f7fbff 55%,#fff6ec 100%);padding-bottom:64px}
.pc-root *{box-sizing:border-box}
.pc-blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.45;pointer-events:none}
.b1{width:420px;height:420px;background:#7aa5ff;top:120px;left:-120px}
.b2{width:380px;height:380px;background:#ffc58a;bottom:40px;right:-100px}
.pc-header{position:relative;z-index:1;display:flex;align-items:center;gap:20px;flex-wrap:wrap;padding:18px clamp(16px,4vw,48px);
 color:#fff;background:linear-gradient(120deg,#0c1b4d 0%,#1b3a8a 60%,#2a58c9 100%);box-shadow:0 10px 30px rgba(12,27,77,.35)}
.pc-header::after{content:"";position:absolute;inset:0 0 50% 0;background:linear-gradient(180deg,rgba(255,255,255,.18),rgba(255,255,255,0));pointer-events:none}
.pc-header::before{content:"";position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,#ffb84d,#ff7a18,#ffb84d)}
.pc-title{flex:1;min-width:240px}
.pc-title h1{margin:0;font-size:clamp(20px,3vw,30px);font-weight:700;line-height:1.25}
.pc-title p{margin:4px 0 0;opacity:.85;font-size:14px}
.pc-help{display:flex;flex-direction:column;align-items:flex-end;font-size:13px;gap:2px;position:relative;z-index:1}
.pc-help span{opacity:.7}.pc-help strong{font-size:18px;letter-spacing:.5px}
.pc-help a{color:#ffd9a8;text-decoration:none}
.pc-main{position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:36px 20px 0}
.pc-intro h2{margin:0 0 6px;font-size:clamp(22px,3vw,30px);font-weight:700}
.pc-intro p{margin:0 0 28px;color:var(--muted)}
.pc-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:22px}
.pc-card{all:unset;box-sizing:border-box;cursor:pointer;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:4px;padding:26px 24px 22px;border-radius:22px;
 background:linear-gradient(160deg,rgba(255,255,255,.95),rgba(255,255,255,.65));border:1px solid rgba(255,255,255,.9);
 box-shadow:0 1px 0 #fff inset,0 18px 40px -18px rgba(12,27,77,.35);backdrop-filter:blur(10px);transition:transform .25s,box-shadow .25s}
.pc-card::before{content:"";position:absolute;top:0;left:-70%;width:45%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.9),transparent);transform:skewX(-18deg);transition:left .7s}
.pc-card::after{content:"";position:absolute;left:0;right:0;bottom:0;height:5px;background:linear-gradient(90deg,var(--c1),var(--c2))}
.pc-card:hover,.pc-card:focus-visible{transform:translateY(-6px);box-shadow:0 1px 0 #fff inset,0 28px 48px -16px var(--c2)}
.pc-card:hover::before{left:130%}
.pc-card:focus-visible{outline:3px solid var(--c2);outline-offset:3px}
.pc-tile{display:grid;place-items:center;width:52px;height:52px;border-radius:16px;position:relative;
 box-shadow:0 8px 18px -6px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.6)}
.pc-tile{background:radial-gradient(circle at 30% 25%,#fff,#f1f5fb);border:2.5px solid var(--c1);box-shadow:0 10px 22px -8px var(--c2),inset 0 -6px 12px rgba(12,27,77,.06)}
.pc-tile.big{width:92px;height:92px;border-radius:50%;margin-bottom:14px}
.pc-tile:not(.big){width:68px;height:68px;border-radius:50%}
.pc-tile::after{content:"";position:absolute;top:6px;left:14%;width:72%;height:34%;border-radius:50%;background:linear-gradient(rgba(255,255,255,.85),rgba(255,255,255,0));pointer-events:none}
.pc-tile svg{position:relative;z-index:1}
.pc-card:hover .pc-tile{transform:scale(1.06);transition:transform .25s}
.pc-mr{font-family:'Noto Sans Devanagari',sans-serif;font-size:19px;font-weight:700}
.pc-en{font-weight:600;font-size:15px;color:#2a58c9}
.pc-note{font-size:13px;color:var(--muted);margin-top:2px}
.pc-go{margin-top:14px;align-self:flex-start;font-size:13px;font-weight:600;color:#fff;padding:7px 16px;border-radius:999px;background:linear-gradient(135deg,var(--c1),var(--c2))}
.pc-back{all:unset;cursor:pointer;color:#2a58c9;font-weight:600;margin-bottom:16px;display:inline-block}
.pc-back:focus-visible{outline:2px solid #2a58c9;outline-offset:3px}
.pc-panel{background:rgba(255,255,255,.88);backdrop-filter:blur(12px);border:1px solid #fff;border-radius:24px;padding:30px;max-width:760px;margin:0 auto;
 box-shadow:0 24px 50px -24px rgba(12,27,77,.4)}
.pc-panel h2{margin:0;font-size:24px}
.pc-formhead{display:flex;gap:16px;align-items:center;margin-bottom:24px}
.pc-formhead .pc-mr{margin:2px 0 0;font-size:16px;color:var(--muted);font-weight:400}
.pc-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:16px}
.pc-field{display:flex;flex-direction:column;gap:6px;font-size:14px;font-weight:600;margin-bottom:4px}
.pc-field input{font:inherit;font-weight:400;padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);background:#fff;transition:border .2s,box-shadow .2s}
.pc-field input:focus{outline:none;border-color:#2a58c9;box-shadow:0 0 0 4px rgba(42,88,201,.15)}
.pc-field input[aria-invalid=true]{border-color:#d93a5a}
.pc-field em{color:#d93a5a;font-style:normal;font-weight:500;font-size:12.5px}
.pc-field small{font-weight:400;color:var(--muted)}
.pc-check{display:flex;gap:10px;align-items:center;font-size:14px;margin:14px 0 22px}
.pc-actions{display:flex;gap:12px;justify-content:flex-end;flex-wrap:wrap}
.pc-btn{cursor:pointer;font:inherit;font-weight:600;color:#fff;border:0;padding:13px 26px;border-radius:14px;
 background:linear-gradient(135deg,#2a58c9,#0c1b4d);box-shadow:0 10px 20px -8px rgba(12,27,77,.6),inset 0 1px 0 rgba(255,255,255,.35);transition:transform .15s,filter .2s}
.pc-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
.pc-btn.ghost{background:#fff;color:var(--ink);border:1.5px solid var(--line);box-shadow:none}
.pc-notice{margin:0 0 20px;padding:16px 18px;border-radius:16px;font-size:16px;font-weight:600;line-height:1.6;color:#0b7f58;
 background:linear-gradient(135deg,#e6faf2,#f3fcf8);border:1px solid #bfeedb}
.pc-steps{list-style:none;counter-reset:s;margin:0 0 24px;padding:0;display:grid;gap:12px}
.pc-steps li{counter-increment:s;display:flex;align-items:center;gap:14px;font-size:15px}
.pc-steps li::before{content:counter(s);flex:none;display:grid;place-items:center;width:32px;height:32px;border-radius:50%;color:#fff;font-weight:700;
 background:linear-gradient(135deg,#2a58c9,#0c1b4d);box-shadow:inset 0 1px 0 rgba(255,255,255,.4)}
.pc-dl{display:inline-flex;align-items:center;gap:10px;text-decoration:none;background:linear-gradient(135deg,#17b978,#0b7f58);margin-bottom:22px}
.pc-field small a{color:#2a58c9;font-weight:600}
.pc-wide{max-width:960px}
.pc-nopad{padding:0;overflow:hidden}
.pc-stepper{list-style:none;display:flex;gap:10px;flex-wrap:wrap;margin:0 0 22px;padding:0;font-size:13px;font-weight:600;color:var(--muted)}
.pc-stepper li{display:flex;align-items:center;gap:8px;padding:6px 14px 6px 6px;border-radius:999px;background:#eef2fa}
.pc-stepper span{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#cfd8ea;color:#fff;font-size:12px}
.pc-stepper li.on{background:#e3ecff;color:var(--ink)}.pc-stepper li.on span{background:linear-gradient(135deg,#2a58c9,#0c1b4d)}
.pc-stepper li.done{color:#0b7f58;background:#e6faf2}.pc-stepper li.done span{background:#17b978}
.pc-errlist{margin:0 0 18px;padding:12px 18px 12px 34px;border-radius:12px;background:#fdecef;color:#b3243f;font-size:14px;font-weight:600}
.pc-props{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 40px;margin:0 0 26px}
.pc-props>div{display:grid;grid-template-columns:140px 1fr;align-items:center;gap:10px;padding:10px 0;border-bottom:1px dashed var(--line)}
.pc-props dt{font-size:14px;color:var(--muted)}.pc-props dt label{cursor:pointer}
.pc-props dd{margin:0;font-weight:700;font-size:15px;word-break:break-word}
.pc-props input{width:100%;font:inherit;font-weight:500;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);background:#fff}
.pc-props input:focus{outline:none;border-color:#2a58c9;box-shadow:0 0 0 4px rgba(42,88,201,.15)}
.pc-props input[aria-invalid=true]{border-color:#d93a5a}
.pc-docbar{padding:16px 24px;color:#fff;font-weight:700;text-align:center;background:linear-gradient(135deg,#2a58c9,#0c1b4d);position:relative}
.pc-docbar::after{content:"";position:absolute;inset:0 0 50% 0;background:linear-gradient(rgba(255,255,255,.2),transparent)}
.pc-docbody{padding:24px 28px 18px}
.pc-pdfnote{text-align:center;color:#d93a5a;font-weight:600;margin:0 0 16px}
.pc-tablewrap{overflow-x:auto}
.pc-table{width:100%;border-collapse:collapse;font-size:14px;min-width:640px}
.pc-table th{text-align:left;padding:10px 12px;border-bottom:2px solid var(--line)}
.pc-table td{padding:14px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.pc-table small{display:block;color:var(--muted);margin-top:2px}
.pc-mr2{font-family:'Noto Sans Devanagari',sans-serif;font-weight:600}
.pc-blank{display:inline-block;margin-top:4px;font-size:12.5px;font-weight:600;color:#2a58c9}
.pc-up{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}.pc-up small,.pc-up em{flex-basis:100%;margin:0}
.pc-up em{color:#d93a5a;font-style:normal;font-size:12.5px}
.pc-upbtn{cursor:pointer;font:inherit;font-weight:600;color:#fff;border:0;padding:8px 18px;border-radius:10px;background:linear-gradient(135deg,#35b6e8,#1b82c9);box-shadow:inset 0 1px 0 rgba(255,255,255,.4)}
.pc-upbtn:disabled{opacity:.6;cursor:wait}
.pc-ok{display:flex;gap:14px;align-items:center;flex-wrap:wrap;color:#0b7f58;font-weight:600}
.pc-link{all:unset;cursor:pointer;color:#2a58c9;font-weight:600}.pc-link:focus-visible{outline:2px solid #2a58c9;outline-offset:3px}
.pc-link.center{display:block;text-align:center;margin:18px auto 0}
.pc-decl{padding:20px 28px 26px;background:#f6f8fc;border-top:1px solid var(--line);text-align:center;font-family:'Noto Sans Devanagari',sans-serif}
.pc-decl p{margin:0 0 12px;line-height:1.7;font-size:15px}
.pc-decl .pc-check{justify-content:center;font-family:'Plus Jakarta Sans',sans-serif;margin:8px 0 16px}
.pc-hint{display:block;margin-top:10px;color:var(--muted);font-family:'Plus Jakarta Sans',sans-serif}
.pc-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;filter:grayscale(.4)}
@media (max-width:700px){.pc-props{grid-template-columns:1fr}.pc-docbody,.pc-decl{padding-left:16px;padding-right:16px}}
.pc-crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 22px;font-size:14px}
.pc-crumbs i{font-style:normal;color:var(--muted);margin:0 8px}
.pc-crumbs button{all:unset;cursor:pointer;color:#2a58c9;font-weight:600}
.pc-crumbs button:hover{text-decoration:underline}.pc-crumbs button:focus-visible{outline:2px solid #2a58c9;outline-offset:3px;border-radius:4px}
.pc-crumbs b{color:var(--ink)}
.pc-opts{display:grid;gap:12px;margin:0 0 24px}
.pc-opt{position:relative;display:flex;align-items:center;gap:14px;padding:16px 18px;border-radius:16px;cursor:pointer;background:#fff;border:1.5px solid var(--line);transition:border .2s,box-shadow .2s,transform .2s}
.pc-opt:hover{transform:translateY(-2px);box-shadow:0 12px 24px -14px rgba(12,27,77,.4)}
.pc-opt input{position:absolute;opacity:0;inset:0;cursor:pointer}
.pc-opt:focus-within{outline:3px solid rgba(42,88,201,.4);outline-offset:2px}
.pc-radio{flex:none;width:22px;height:22px;border-radius:50%;border:2px solid #b7c3dc;background:#fff;transition:all .2s}
.pc-opt.on{border-color:#2a58c9;background:linear-gradient(135deg,#f2f6ff,#fff);box-shadow:0 14px 28px -16px #2a58c9}
.pc-opt.on .pc-radio{border:7px solid #2a58c9}
.pc-optbody{flex:1;display:flex;flex-direction:column;gap:3px}
.pc-optbody .pc-mr2{font-size:15.5px;line-height:1.5}
.pc-pct{flex:none;min-width:58px;text-align:center;padding:8px 12px;border-radius:12px;color:#fff;font-weight:800;font-size:16px;background:linear-gradient(135deg,#17b978,#0b7f58);box-shadow:inset 0 1px 0 rgba(255,255,255,.45)}
.pc-chip{display:inline-block;margin-top:8px;padding:4px 12px;border-radius:999px;background:#e3ecff;color:#1b3a8a;font-size:12.5px;font-weight:600}
.pc-center{text-align:center;max-width:520px}
.pc-tick{width:72px;height:72px;border-radius:50%;margin:0 auto 14px;display:grid;place-items:center;color:#fff;font-size:34px;box-shadow:0 12px 24px -8px rgba(0,0,0,.35)}
.pc-appno{display:inline-block;margin:6px 0 10px;padding:10px 20px;border-radius:12px;background:#eef3ff;font-weight:800;font-size:22px;letter-spacing:1px}
.pc-muted{color:var(--muted);font-size:14px;margin-bottom:20px}
@media (prefers-reduced-motion:reduce){.pc-card,.pc-card::before,.pc-btn{transition:none}}
@media (max-width:600px){.pc-help{align-items:flex-start}.pc-panel{padding:22px}}
`;