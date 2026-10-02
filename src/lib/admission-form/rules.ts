/**
 * Page 2 — नियमहरु र सहमति।
 * Transcribed from the institute's official printed form (reference image 2).
 * Do NOT translate or simplify — Nepali wording is part of the official document.
 */

export interface RuleSection {
  no: string;
  title: string;
  bullets: string[];
}

export const RULES_HEADING =
  "यस शैक्षिक संस्थामा अध्ययन गर्दा विद्यार्थीहरुले पालना गर्नुपर्ने नियमहरु ।";

export const RULE_SECTIONS: RuleSection[] = [
  {
    no: "१",
    title: "प्रक्रिया भर्ना",
    bullets: [
      "विद्यार्थीले भर्ना फाराम पुरा गरी आवश्यक कागजात (फोटो, शैक्षिक प्रमाणपत्र, परिचयपत्र आदि) अनिवार्य रूपमा बुझाउनुपर्ने।",
    ],
  },
  {
    no: "२",
    title: "उपस्थिति र परीक्षा",
    bullets: [
      "नियमित उपस्थिति र परीक्षामा सहभागिता सबै विद्यार्थीलाई अनिवार्य हुनेले।",
      "आकस्मिक अनुपस्थितिको अवस्थामा अभिभावकको अनुमति पत्र वा लिखित जानकारी अनिवार्य रूपमा पेस गर्नुपर्नेछ।",
      "अनुपस्थित भएमा प्रति दिन रु. ५० जरिवाना अनिवार्य रूपमा तिर्नुपर्नेछ॥",
      "परीक्षामा अनुपस्थित भएमा रु. २०० जरिवाना अनिवार्य रूपमा तिर्नुपर्नेछ।",
    ],
  },
  {
    no: "३",
    title: "पोशाक र व्यक्तित्व",
    bullets: [
      "विद्यार्थी सम्भव शैक्षिक वातावरण अनुकूल पोशाकमा मात्र कक्षा लिनुपर्नेछ।",
      "काम्मा कनिस्ठी, हातमा बाला, फेशनावाला जिन्स, स्किनी, वा अन्य अनावश्यक फेशन सामग्री पूर्ण रूपमा निषेध छ।",
    ],
  },
  {
    no: "४",
    title: "अनुशासन र आचरण",
    bullets: [
      "धुम्रपान, मदिरा, गुटखा, सुर्ती सेवन, अश्लीलता शब्द प्रयोग, झगडा वा अनुशासनविपरित गतिविधि कडाइका साथ निषेध छ।",
      "विद्यार्थी कोचिङ्ग परिसरभित्र सम्यक भाषा, व्यवहार र शिष्टाचार अपनाउनुपर्नेछ।",
    ],
  },
  {
    no: "५",
    title: "शुल्क",
    bullets: [
      "शैक्षिक शुल्क निश्चित समयभित्र बुझाउनुपर्नेछ । हिडा गर्दा जरिवाना लागे वा कक्षा रोकिन सक्नेछ ।",
    ],
  },
  {
    no: "६",
    title: "गृहकार्य र शैक्षिक दायित्व",
    bullets: [
      "शिक्षकले दिएको गृहकार्य वा असाइनमेन्ट समयभित्र बुझाउनुपर्नेछ ।",
      "समयमा नबुझाएमा सम्बन्धित अभिभावकलाई कोचिङ्गमा बोलाइनेछ ।",
    ],
  },
  {
    no: "७",
    title: "सम्पत्ति संरक्षण",
    bullets: [
      "कोचिङ्ग परिसरभित्र कुनै सम्पत्तिमा क्षति पुर्याउने विद्यार्थीले आफै क्षतिपूर्ति तिर्नुपर्नेछ ।",
    ],
  },
  {
    no: "८",
    title: "मोबाइल प्रयोग",
    bullets: ["कक्षा वा परिसरभित्र विद्यार्थीले मोबाइल फोन प्रयोग गर्न अनुमति दिने छैन ।"],
  },
  {
    no: "९",
    title: "कोचिङ्ग छोड्ने अवस्था",
    bullets: [
      "कुनै कारणवश कोचिङ्ग छाड्दुपर्दा बाँकी शुल्क अनिवार्य रूपमा तिर्नुपर्नेछ ।",
      "१ दिनदेखि १५ दिनभित्र मात्र कक्षा गएको अवस्थामा कुल शुल्कको २५ % कटी बाँकी रकम फिर्ता गरिनेछ । तर, मानसिक कारण नदेखिएमा कोचिङ्ग छाड्दा बुझाइएको शुल्क फिर्ता गरिने छैन ।",
    ],
  },
];

/** नोट box — its tick IS the required agreement (blue tick). */
export const AGREEMENT_NOTE =
  "यी नियमहरुको पालना नगर्ने विद्यार्थीमाथि कोचिङ्ग प्रशासनले आवश्यक कारबाही गर्ने अधिकार राख्छ ।";

/** English agreement statement (spec §26). */
export const AGREEMENT_EN =
  "I/Student confirm that I have read and agree to follow all the rules mentioned above.";

export const SIGNATURE_LABELS = [
  "Student's Signature",
  "Parent's Signature",
  "Academic Signature",
  "Principal's Signature",
] as const;

export type SignatureKind = (typeof SIGNATURE_LABELS)[number];

/** Printed fee tables (reference image 3) — used by admin pricing seeds/docs. */
export const FEE_TABLE_ROWS = [
  { key: "admissionFee", label: "Admission Fee ( भर्नी शुल्क)" },
  { key: "tuitionFee", label: "Tuition Fee (पढाई शुल्क)" },
  { key: "examFee", label: "Exam Fee (परीक्षा शुल्क)" },
  { key: "physicalFee", label: "Physical ( फिजिकल शुल्क)" },
  { key: "totalFee", label: "Total Fee (जम्मा शुल्क)" },
] as const;
