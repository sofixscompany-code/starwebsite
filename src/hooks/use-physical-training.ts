import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/config";

/** One row of the daily routine table. */
export interface RoutineRow {
  id: string;
  /** "05:00 – 05:10" */
  time: string;
  /** "वार्मअप" */
  activity: string;
  /** Optional note, e.g. "१० मिनेट" (always present after normalise) */
  note: string;
}

/** Content for the public `/physical-training` page + its homepage preview. */
export interface PhysicalTrainingData {
  title: string;
  lead: string;
  responsibilityTitle: string;
  /** Bullet lines of the responsibility (जिम्मेवारी) card. */
  responsibilities: string[];
  routineTitle: string;
  /** 60 / 90-minute daily routine, 05:00 → 07:00. */
  routine: RoutineRow[];
  photoUrl: string;
  attendanceRegisterLabel: string;
  progressRegisterLabel: string;
}

const FALLBACK: PhysicalTrainingData = {
  title: "शारीरिक प्रशिक्षण",
  lead: "नेपाल प्रहरी, सशस्त्र प्रहरी बल, नेपाल सेना र अन्य सुरक्षा सेवाका लागि शारीरिक तयारी अनिवार्य छ। संस्थामा प्रत्येक दिन बिहान ०५:०० देखि ०७:०० सम्म अनुभवी प्रशिक्षकको तत्वावधानमा ६० / ९० मिनेटको नियमित शारीरिक प्रशिक्षण सञ्चालन गरिन्छ।",
  responsibilityTitle: "जिम्मेवारी",
  responsibilities: [
    "प्रत्येक बिहानको शारीरिक प्रशिक्षणमा शारीरिक प्रशिक्षक उपस्थित हुनुपर्छ ।",
    "कक्षा मुख्यले विद्यार्थीको उपस्थिति रजिस्टरमा नाम नियमित रूपमा भर्नुपर्छ ।",
    "प्रशिक्षणमा चोटपटकको जिम्मेवारी संस्था प्रशासनले राख्नेछ ।",
    "अनुशासन र निर्देशन पालना नगर्ने विद्यार्थीलाई पुनः तालिम दिइनेछ ।",
  ],
  routineTitle: "दैनिक शारीरिक प्रशिक्षण दिनचर्या (६० / ९० मिनेट)",
  routine: [
    { id: "r1", time: "05:00 – 05:10", activity: "वार्मअप", note: "१० मिनेट" },
    { id: "r2", time: "05:10 – 05:30", activity: "दौड (Running)", note: "२० मिनेट" },
    { id: "r3", time: "05:30 – 05:50", activity: "पुशअप, सिटअप र जम्पिङ", note: "२० मिनेट" },
    { id: "r4", time: "05:50 – 06:10", activity: "दण्ड बैठक, स्क्वाट र प्लङ्क", note: "२० मिनेट" },
    { id: "r5", time: "06:10 – 06:30", activity: "खेलकुद र युद्धभ्यास (Drill)", note: "२० मिनेट" },
    { id: "r6", time: "06:30 – 07:00", activity: "स्ट्रेचिङ / कूल डाउन", note: "३० मिनेट" },
  ],
  photoUrl: "/services/army.jpg",
  attendanceRegisterLabel: "उपस्थिति रजिस्टर",
  progressRegisterLabel: "प्रगति रजिस्टर",
};

const str = (v: unknown, fb: string) => (typeof v === "string" && v.trim() ? v : fb);

function normalise(d: Record<string, unknown> | undefined): PhysicalTrainingData {
  if (!d) return FALLBACK;
  const routine = Array.isArray(d.routine) ? d.routine : [];
  const responsibilities = Array.isArray(d.responsibilities) ? d.responsibilities : [];
  return {
    title: str(d.title, FALLBACK.title),
    lead: str(d.lead, FALLBACK.lead),
    responsibilityTitle: str(d.responsibilityTitle, FALLBACK.responsibilityTitle),
    responsibilities: responsibilities
      .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
      .map((r) => String(r.text ?? ""))
      .filter(Boolean),
    routineTitle: str(d.routineTitle, FALLBACK.routineTitle),
    routine: routine
      .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
      .map((r, i) => ({
        id: String(r.id ?? i),
        time: String(r.time ?? ""),
        activity: String(r.activity ?? ""),
        note: typeof r.note === "string" ? r.note : "",
      }))
      .filter((r) => r.time || r.activity),
    photoUrl: str(d.photoUrl, FALLBACK.photoUrl),
    attendanceRegisterLabel: str(d.attendanceRegisterLabel, FALLBACK.attendanceRegisterLabel),
    progressRegisterLabel: str(d.progressRegisterLabel, FALLBACK.progressRegisterLabel),
  };
}

/**
 * Physical-training content — Firestore `site_settings/physical_training`
 * (public read, super-admin write). Falls back to the printed routine when the
 * document has not been created yet, so the page is never empty.
 */
export function usePhysicalTraining(): { data: PhysicalTrainingData; hasData: boolean } {
  const [data, setData] = useState<PhysicalTrainingData>(FALLBACK);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getDoc(doc(db, "site_settings", "physical_training"))
      .then((snap) => {
        if (cancelled || !snap.exists()) return;
        setData(normalise(snap.data() as Record<string, unknown>));
        setHasData(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, hasData };
}

export { FALLBACK as PHYSICAL_TRAINING_DEFAULTS };
