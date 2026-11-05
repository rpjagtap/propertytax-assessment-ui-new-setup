import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getPropertyDetailsForTransfer,
  submitConcessionApplication,
} from "../../services/assessment-services";

// Replace this with the affidavit's URL exposed by your server (not its disk path).
// const AFFIDAVIT_URL = "/mnt/nas/159/AFFIDAVIT_MAHILA.pdf";
const AFFIDAVIT_URL = "/E/AFFIDAVIT_MAHILA.pdf";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUIRED_DOCUMENTS = [
  { id: 1, name: "Aadhaar Card" },
  { id: 2, name: "PAN Card" },
  { id: 3, name: "Self-declaration Affidavit" },
];
const formatValue = (value) => (value === null || value === undefined || value === "" ? "—" : value);

export default function WomenConcessionApplication({ onBack }) {
  const [searchParams] = useSearchParams();
  const propertyCode = searchParams.get("propertyCode") || "";
  const [step, setStep] = useState(1);
  const [property, setProperty] = useState(null);
  const [email, setEmail] = useState("");
  const [documents, setDocuments] = useState(() =>
    REQUIRED_DOCUMENTS.map((document) => ({ ...document, file: null, documentBase64: "" }))
  );
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applicationNumber, setApplicationNumber] = useState("");
  const [applicationSummary, setApplicationSummary] = useState(null);

  useEffect(() => {
    let active = true;
    if (!propertyCode) {
      setError("Property code is missing from the page URL.");
      return () => { active = false; };
    }
    setLoading(true);
    setError("");
    getPropertyDetailsForTransfer({ propertyCode: propertyCode.trim() })
      .then((details) => {
        if (active) setProperty(details);
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || "Could not load property details. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [propertyCode]);

  const continueToDocuments = (event) => {
    event.preventDefault();
    if (!property) return;
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email address to continue.");
      return;
    }
    setError("");
    setStep(2);
  };

  const selectFile = (index, event) => {
    const selected = event.target.files?.[0];
    setDocuments((current) => current.map((document, row) => row === index
      ? { ...document, file: selected || null, documentBase64: "" }
      : document));
    setError("");
    if (!selected) return;
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      setDocuments((current) => current.map((document, row) => row === index
        ? { ...document, file: null, documentBase64: "" }
        : document));
      setError(`Please select ${REQUIRED_DOCUMENTS[index].name} as a PDF.`);
      event.target.value = "";
    }
  };

  const uploadDocument = (index) => {
    const file = documents[index]?.file;
    if (!file) {
      setError(`Choose the ${REQUIRED_DOCUMENTS[index].name} PDF first.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      const documentBase64 = dataUrl.includes(",")
        ? dataUrl.slice(dataUrl.indexOf(",") + 1)
        : dataUrl;
      if (!documentBase64.startsWith("JVBER") || documentBase64.length < 100) {
        setError(`${REQUIRED_DOCUMENTS[index].name} does not appear to be a valid PDF. Please choose the scanned PDF and try again.`);
        return;
      }
      setDocuments((current) => current.map((document, row) => row === index
        ? { ...document, documentBase64 }
        : document));
      setError("");
    };
    reader.onerror = () => setError("Could not read the selected PDF. Please choose it again.");
    reader.readAsDataURL(file);
  };

  const allDocumentsReady = documents.every((document) => document.documentBase64);

  const startApplication = async () => {
    if (!allDocumentsReady || !consent) return;
    const upicId = property?.upicId || property?.UPICId || property?.upicID || property?.UPICID || "";
    setLoading(true);
    setError("");
    try {
      const response = await submitConcessionApplication({
        concessionName: "Women",
        propertyCode: property?.propertyCode || propertyCode,
        propertyName: property?.propertyName || property?.ownerName || "",
        // applicantMobile: property?.propertyMobileNo || property?.mobileNo || "",
        // applicantEmail: email.trim(),
        propertyAddress: property?.propertyAddress || "",
        upicId: property?.upicId || property?.UPICId || property?.upicID || property?.UPICID || "",
        finalUseType: property?.finalUseType || property?.useType || "",
        zoneKey: property?.zoneKey || "",
        gatKey: property?.gatKey || "",
        lstDocVOs: documents.map((document) => ({
          documentId: document.id,
          documentURLbase64: document.documentBase64,
        })),
      });
      const result = response?.data || response;
      const responseMessage = typeof result === "string"
        ? result
        : result?.message || result?.responseMessage || response?.message || "";
      const number = result?.applicationNo || result?.applicationNumber || result?.applicationId ||
        result?.applicationID || result?.applicationid || result?.appId ||
        result?.application?.applicationNo || result?.application?.applicationNumber ||
        responseMessage.match(/\bPC\d+\b/i)?.[0];
      if (!number) {
        throw new Error(responseMessage || "The application was submitted, but no application number was returned.");
      }
      setApplicationNumber(String(number));
      setApplicationSummary({
        srNo: result?.srNo || result?.SRNO || result?.srno || result?.serialNo || "—",
        propertyCode: result?.propertyCode || property?.propertyCode || propertyCode,
        propertyName: result?.propertyName || property?.propertyName || property?.ownerName || "—",
        applicationId: number,
        mobileNumber: result?.mobileNumber || result?.applicantMobile || property?.propertyMobileNo || property?.mobileNo || "—",
        concessionName: result?.concessionName || "Women",
        status: "GAT_Premukh-Pending",
      });
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message || submitError?.message ||
        "Could not submit the application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cca-women-flow" aria-label="Women concession application">
      <div className="cca-bar">
        <div>
          <div className="cca-bar-mr">महिला सवलत योजनेसाठी अर्ज</div>
          <div className="cca-bar-en">{applicationNumber ? "Application Confirmation" : `Women Concession Application · Step ${step} of 2`}</div>
        </div>
        <button type="button" className="cca-back" aria-label="Back" onClick={applicationNumber ? onBack : step === 2 ? () => setStep(1) : onBack}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      </div>

      {error && <div className="cca-flow-alert" role="alert">{error}</div>}
      {loading && <p className="cca-flow-status" role="status">{property ? "Submitting your application…" : "Loading property details…"}</p>}

      {applicationNumber ? (
        <div className="cca-result-screen">
          <p className="cca-result-success-message">
            Your application for Women concession has been successfully submitted. Your application number is <strong>{applicationNumber}</strong>.
          </p>
          <div className="cca-result-strip" aria-hidden="true" />
          <p className="cca-result-tip">Please keep your application number for future reference. You can track the application status using the details below.</p>
          <div className="cca-result-table-wrap">
            <table className="cca-result-table">
              <thead>
                <tr>
                  <th>SR No.</th>
                  <th>Application ID</th>
                  <th>Property Code</th>
                  <th>Property Name</th>
                  <th>Mobile Number</th>
                  <th>Concession Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{applicationSummary?.srNo}</td>
                  <td>{applicationSummary?.applicationId}</td>
                  <td>{applicationSummary?.propertyCode}</td>
                  <td>{applicationSummary?.propertyName}</td>
                  <td>{applicationSummary?.mobileNumber}</td>
                  <td>{applicationSummary?.concessionName}</td>
                  <td><span className="cca-result-status">{applicationSummary?.status}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="cca-flow-actions">
            <button type="button" className="cca-flow-primary" onClick={onBack}>Done</button>
          </div>
        </div>
      ) : <>
      {step === 1 && (
        <form className="cca-flow-panel" onSubmit={continueToDocuments}>
          <h2>Property and applicant details</h2>
          <div className="cca-property-grid">
            <Detail label="Property Code" value={property?.propertyCode || propertyCode} />
            <Detail label="Property Name" value={property?.propertyName || property?.ownerName} />
            <Detail label="Property Address" value={property?.propertyAddress} />
            <Detail label="Zone" value={property?.zoneName || property?.zone} />
            <Detail label="Area" value={property?.totalArea || property?.area} />
            <Detail label="Rateable Value" value={property?.ratableValue || property?.rateableValue} />
            <Detail label="Use Type" value={property?.finalUseType || property?.useType} />
            <Detail label="Mobile Number" value={property?.propertyMobileNo || property?.mobileNo} />
          </div>
          <label className="cca-flow-field">
            Email address <span aria-hidden="true">*</span>
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address" />
          </label>
          <div className="cca-flow-actions">
            <button type="button" className="cca-flow-secondary" onClick={onBack}>Cancel</button>
            <button type="submit" className="cca-flow-primary" disabled={!property || loading}>Next</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="cca-flow-panel">
          <h2>Required documents</h2>
          <p className="cca-flow-instructions">Download the self-declaration affidavit, print it, fill it in by hand, sign it, then scan or photograph it and save it as a PDF.</p>
          <a className="cca-affidavit-link" href={AFFIDAVIT_URL} target="_blank" rel="noreferrer">
            <DownloadIcon />
            <span><strong>महिला सवलत योजनेकरिता स्वयंघोषित प्रतिज्ञापत्र</strong><small>Download affidavit form</small></span>
          </a>
          <div className="cca-doc-table-wrap">
            <table className="cca-doc-table">
              <thead><tr><th>Sr. No.</th><th>Document Name</th><th>Choose PDF</th><th>Upload</th></tr></thead>
              <tbody>{documents.map((document, index) => (
                <tr key={document.id}>
                  <td>{index + 1}</td>
                  <td>{document.name}<span className="cca-required-mark"> *</span></td>
                  <td><input type="file" accept="application/pdf,.pdf" aria-label={`Choose ${document.name} PDF`} onChange={(event) => selectFile(index, event)} /></td>
                  <td>
                    <button type="button" className="cca-flow-secondary" onClick={() => uploadDocument(index)} disabled={!document.file}>
                      {document.documentBase64 ? "Ready" : "Upload"}
                    </button>
                    {document.documentBase64 && <span className="cca-doc-ready" role="status"> Ready</span>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <label className="cca-consent">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>मी दिलेली माहिती खरी व अचूक असल्याची खात्री देते.</span>
          </label>
          <div className="cca-flow-actions">
            <button type="button" className="cca-flow-secondary" onClick={() => setStep(1)}>Back</button>
            <button type="button" className="cca-flow-primary" disabled={!allDocumentsReady || !consent || loading} onClick={startApplication}>
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </div>
        </div>
      )}
      </>}
    </section>
  );
}

function Detail({ label, value }) {
  return <div className="cca-property-detail"><span>{label}</span><strong>{formatValue(value)}</strong></div>;
}

function DownloadIcon() {
  return <svg className="cca-download-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3" /></svg>;
}
