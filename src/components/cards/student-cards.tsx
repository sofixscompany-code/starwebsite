import "@/components/cards/student-cards.css";
import { StarLogo } from "@/components/site/StarLogo";

/** One subject row on the progress card. */
export interface CardSubject {
  id: string;
  subject: string;
  /** Full marks */
  total: string;
  /** Marks obtained */
  obt: string;
  grade: string;
  status: CardStatus;
}

export const CARD_STATUSES = [
  "उत्कृष्ट",
  "उत्तीर्ण",
  "राम्रो",
  "कृपया ध्यान",
  "समीक्षाधीन",
] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

export const DEFAULT_SUBJECT_NAMES = [
  "सामान्य ज्ञान",
  "गणित",
  "अंग्रेजी",
  "नेपाली",
  "डिजिटल",
] as const;

export interface StudentCardData {
  studentName: string;
  photo: string;
  courseName: string;
  admissionNumber: string;
  rollNumber: string;
  /** e.g. "२०८२ / २०८३ प्रथम सत्र" */
  term: string;
  issuedDate: string;
  attendance: string;
  remarks: string;
  subjects: CardSubject[];
}

export function defaultSubjects(): CardSubject[] {
  return DEFAULT_SUBJECT_NAMES.map((subject, i) => ({
    id: `s${i + 1}`,
    subject,
    total: "100",
    obt: "",
    grade: "",
    status: "समीक्षाधीन" as CardStatus,
  }));
}

export function emptyCard(): StudentCardData {
  return {
    studentName: "",
    photo: "",
    courseName: "",
    admissionNumber: "",
    rollNumber: "",
    term: "२०८२ / २०८३",
    issuedDate: new Date().toLocaleDateString("en-GB"),
    attendance: "",
    remarks: "",
    subjects: defaultSubjects(),
  };
}

/** Demo card rendered on the homepage preview. */
export const SAMPLE_CARD: StudentCardData = {
  studentName: "राम कुमार यादव",
  photo: "",
  courseName: "Sub-Inspector (ASI) Preparation Course",
  admissionNumber: "SCI-2082-014",
  rollNumber: "07",
  term: "२०८२ / २०८३ प्रथम सत्र",
  issuedDate: "2082-06-15",
  attendance: "94%",
  remarks: "नियमित उपस्थिति र मेहनती — अगाडि झन् राम्रो गर्न सक्छ।",
  subjects: [
    {
      id: "s1",
      subject: "सामान्य ज्ञान",
      total: "100",
      obt: "88",
      grade: "A+",
      status: "उत्कृष्ट",
    },
    { id: "s2", subject: "गणित", total: "100", obt: "79", grade: "A", status: "उत्तीर्ण" },
    { id: "s3", subject: "अंग्रेजी", total: "100", obt: "74", grade: "B+", status: "राम्रो" },
    { id: "s4", subject: "नेपाली", total: "100", obt: "84", grade: "A", status: "उत्कृष्ट" },
    { id: "s5", subject: "डिजिटल", total: "100", obt: "66", grade: "B+", status: "राम्रो" },
  ],
};

function pct(obt: string, total: string) {
  const o = Number(obt);
  const t = Number(total);
  if (!t || Number.isNaN(o) || Number.isNaN(t)) return null;
  return Math.round((o / t) * 1000) / 10;
}

function overall(data: StudentCardData) {
  let obt = 0;
  let total = 0;
  for (const s of data.subjects) {
    const o = Number(s.obt);
    const t = Number(s.total);
    if (Number.isNaN(t) || !t) continue;
    obt += Number.isNaN(o) ? 0 : o;
    total += t;
  }
  if (!total) return { pctText: "—", grade: "—" };
  const p = Math.round((obt / total) * 1000) / 10;
  const grade =
    p >= 90 ? "A+" : p >= 80 ? "A" : p >= 70 ? "B+" : p >= 60 ? "B" : p >= 40 ? "C" : "D";
  return { pctText: `${p}%`, grade };
}

const statusTone: Record<CardStatus, string> = {
  उत्कृष्ट: "sc-st-excellent",
  उत्तीर्ण: "sc-st-pass",
  राम्रो: "sc-st-good",
  "कृपया ध्यान": "sc-st-warn",
  समीक्षाधीन: "sc-st-review",
};

function StudentPhoto({ src, alt }: { src: string; alt: string }) {
  if (src) {
    return <img src={src} alt={alt} className="sc-photo" loading="lazy" />;
  }
  return (
    <div className="sc-photo sc-photo-empty" aria-label={alt}>
      <StarLogo className="h-full w-full object-contain p-1" />
    </div>
  );
}

/* ───────────────────────── Progress Card ───────────────────────── */

export function ProgressCard({ data }: { data: StudentCardData }) {
  const sum = overall(data);

  return (
    <div className="sc-progress">
      <header className="sc-head">
        <img src="/favicon-180x180.jpg?v=2" alt="Star Coaching Institute" className="sc-logo" />
        <div className="sc-head-text">
          <p className="sc-title">Star Coaching Institute Pvt. Ltd.</p>
          <p className="sc-sub">जनकपुरधाम, नेपाल • ९८०४८९९१२३ / ९८६४१७६६०६</p>
          <p className="sc-doc">प्रगति रिपोर्ट कार्ड — PROGRESS REPORT CARD</p>
        </div>
        <div className="sc-term">
          <span className="sc-term-label">सत्र</span>
          <span className="sc-term-value">{data.term}</span>
        </div>
      </header>

      <section className="sc-student">
        <StudentPhoto src={data.photo} alt={data.studentName} />
        <dl className="sc-fields">
          <div>
            <dt>विद्यार्थीको नाम</dt>
            <dd>{data.studentName || "—"}</dd>
          </div>
          <div>
            <dt>कक्षा / कोर्स</dt>
            <dd>{data.courseName || "—"}</dd>
          </div>
          <div>
            <dt>रोल नं.</dt>
            <dd>{data.rollNumber || "—"}</dd>
          </div>
          <div>
            <dt>भर्ना नं.</dt>
            <dd>{data.admissionNumber || "—"}</dd>
          </div>
          <div>
            <dt>उपस्थिति</dt>
            <dd>{data.attendance || "—"}</dd>
          </div>
          <div>
            <dt>जारी मिति</dt>
            <dd>{data.issuedDate || "—"}</dd>
          </div>
        </dl>
      </section>

      <table className="sc-table">
        <thead>
          <tr>
            <th className="sc-c-sub">विषय</th>
            <th>पूर्णाङ्क</th>
            <th>प्राप्ताङ्क</th>
            <th>%</th>
            <th>ग्रेड</th>
            <th className="sc-c-status">स्थिति</th>
          </tr>
        </thead>
        <tbody>
          {data.subjects.map((s) => {
            const p = pct(s.obt, s.total);
            return (
              <tr key={s.id}>
                <td className="sc-c-sub">{s.subject}</td>
                <td>{s.total}</td>
                <td>{s.obt || "—"}</td>
                <td>{p === null ? "—" : `${p}%`}</td>
                <td>{s.grade || "—"}</td>
                <td className="sc-c-status">
                  <span className={`sc-status ${statusTone[s.status] ?? "sc-st-review"}`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td className="sc-c-sub">जम्मा</td>
            <td>500</td>
            <td colSpan={2}>{sum.pctText} समग्र</td>
            <td>{sum.grade}</td>
            <td className="sc-c-status">{data.subjects[0]?.status ?? "—"}</td>
          </tr>
        </tfoot>
      </table>

      <section className="sc-remarks">
        <span className="sc-remarks-label">शिक्षकको टिप्पणी</span>
        <p>{data.remarks || "—"}</p>
      </section>

      <footer className="sc-signs">
        <div className="sc-sign">
          <span className="sc-sign-line" />
          <span>कक्षा शिक्षक</span>
        </div>
        <div className="sc-sign sc-sign-stamp">
          <span className="sc-sign-line" />
          <span>संस्था मुद्रा</span>
        </div>
        <div className="sc-sign">
          <span className="sc-sign-line" />
          <span>प्रधानाचार्य</span>
        </div>
      </footer>
    </div>
  );
}

/* ───────────────────────── Photo ID Card ───────────────────────── */

export function IdCard({ data }: { data: StudentCardData }) {
  return (
    <div className="sc-id-pair">
      {/* Front */}
      <div className="sc-id sc-id-front">
        <div className="sc-id-band">
          <img src="/favicon-48x48.jpg?v=2" alt="" className="sc-id-logo" />
          <div>
            <p className="sc-id-inst">Star Coaching Institute</p>
            <p className="sc-id-inst-sub">PVT. LTD. • JANAKPURDHAM</p>
          </div>
        </div>
        <div className="sc-id-body">
          <StudentPhoto src={data.photo} alt={data.studentName} />
          <dl className="sc-id-fields">
            <div>
              <dt>नाम</dt>
              <dd>{data.studentName || "—"}</dd>
            </div>
            <div>
              <dt>कक्षा / कोर्स</dt>
              <dd className="sc-id-clip">{data.courseName || "—"}</dd>
            </div>
            <div>
              <dt>रोल नं.</dt>
              <dd>{data.rollNumber || "—"}</dd>
            </div>
          </dl>
        </div>
        <div className="sc-id-foot">संस्था परिचयपत्र • Student Identity Card</div>
      </div>

      {/* Back */}
      <div className="sc-id sc-id-back">
        <div className="sc-id-back-head">सम्पर्क / Contact</div>
        <dl className="sc-id-back-fields">
          <div>
            <dt>भर्ना नं.</dt>
            <dd>{data.admissionNumber || "—"}</dd>
          </div>
          <div>
            <dt>उपस्थिति</dt>
            <dd>{data.attendance || "—"}</dd>
          </div>
          <div>
            <dt>सत्र</dt>
            <dd>{data.term || "—"}</dd>
          </div>
          <div>
            <dt>जारी मिति</dt>
            <dd>{data.issuedDate || "—"}</dd>
          </div>
        </dl>
        <p className="sc-id-note">
          यो कार्ड संस्थाको सम्पत्ति हो। हराउँदा संस्थालाई जानकारी दिनुहोस्। ९८०४८९९१२३
        </p>
        <div className="sc-id-barcode" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
