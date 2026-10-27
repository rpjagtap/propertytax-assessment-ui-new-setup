import { useState } from "react";
import "./citizenConcessionApplication.css";
import { AVATARS } from "./concessionAvtar";

/**
 * CitizenConcessionApplication – Landing page
 * PCMC Tax Assessment & Collection Department
 *
 * Usage:
 *   <CitizenConcessionApplication
 *     onSelect={(id) => navigate(`/concession/${id}`)}
 *     onBack={() => navigate(-1)}
 *   />
 *
 * Category ids: women | handicapped | ex-servicemen | env-institution | env-society
 * Each card calls onSelect(id) – wire that to your router to open the
 * application screen (affidavit download, document upload, submit).
 */

const HELPLINE = "8888006666";
const EMAIL = "ptax@pcmcindia.gov.in";

const CATEGORIES = [
  { id: "women", marathi: "महिला सवलत", english: "Women Concession", tone: "rose" },
  { id: "handicapped", marathi: "दिव्यांग सवलत", english: "Handicapped Concession", tone: "sky" },
  { id: "ex-servicemen", marathi: "माजी सैनिक", english: "Ex-servicemen", tone: "olive" },
  {
    id: "env-institution",
    marathi: "पर्यावरणपूरक शैक्षणिक संस्था सवलत",
    english: "Environmental Educational Institution Concession",
    tone: "teal",
  },
  { id: "env-society", marathi: "पर्यावरणपूरक सोसायटी", english: "Environmental Society", tone: "leaf" },
];

export default function CitizenConcessionApplication({ onSelect, onBack }) {
  const [picked, setPicked] = useState(null);

  const handleSelect = (id) => {
    setPicked(id);
    if (typeof onSelect === "function") onSelect(id);
  };

  return (
    <div className="cca">
      <header className="cca-hd">
        <div className="cca-hd-inner">
          <div className="cca-hd-logo">
            <div className="cca-hd-logo-img" role="img" aria-label="Pimpri Chinchwad Municipal Corporation logo" />
          </div>

          <div className="cca-hd-title">
            <div className="cca-hd-name">पिंपरी चिंचवड महानगरपालिका पिंपरी - ४११०१८</div>
            <div className="cca-hd-dept">कर आकारणी व कर संकलन विभाग</div>
          </div>

          <div className="cca-hd-contact">
            <a className="cca-hd-chip" href={`tel:${HELPLINE}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
              </svg>
              <span>
                <small>Help-line Number</small>
                {HELPLINE}
              </span>
            </a>
            <a className="cca-hd-chip" href={`mailto:${EMAIL}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3.5 7l8.5 6 8.5-6" />
              </svg>
              <span>
                <small>Email</small>
                {EMAIL}
              </span>
            </a>
          </div>
        </div>
      </header>

      <div className="cca-wrap">
        <div className="cca-bar">
          <div>
            <div className="cca-bar-mr">मालमत्ता करातील विविध सवलत योजना</div>
            <div className="cca-bar-en">Property tax concession schemes: choose your category to apply</div>
          </div>
          <button type="button" className="cca-back" aria-label="Go back" onClick={() => onBack && onBack()}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
        </div>

        <section className="cca-grid" aria-label="Concession categories">
          {CATEGORIES.map((c) => {
            const Avatar = AVATARS[c.id];
            return (
              <button
                key={c.id}
                type="button"
                className="cca-card"
                data-tone={c.tone}
                aria-pressed={picked === c.id}
                onClick={() => handleSelect(c.id)}
              >
                <div className="cca-avatar">
                  <Avatar />
                </div>
                <h4 className="cca-mr">{c.marathi}</h4>
                <div className="cca-en">{c.english}</div>
                <div className="cca-apply">
                  Apply now <span aria-hidden="true">›</span>
                </div>
              </button>
            );
          })}
        </section>

        <footer className="cca-foot">
          © Pimpri Chinchwad Municipal Corporation
        </footer>
      </div>
    </div>
  );
}