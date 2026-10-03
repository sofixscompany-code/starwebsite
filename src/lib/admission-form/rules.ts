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

/**
 * Page 3 — विधिक तथा प्रावधानिक विद्यार्थी भर्ना सम्बन्धी (Declaration & Undertaking).
 * Paper form §7 — English and Nepali declarations plus the undertaking block.
 */
export const DECLARATION_HEADING_NP = "विधिक तथा प्रावधानिक विद्यार्थी भर्ना सम्बन्धी";
export const DECLARATION_HEADING_EN = "(Declaration & Undertaking)";

export const DECLARATION_NP = [
  "म आफ्नै स्वेच्छा र इच्छामा Star Coaching Institute Pvt. Ltd., जनकपुरधाममा भर्ना लिएको हुँ र संस्थाको सम्पूर्ण नियम, शर्त, शुल्क तथा अनुशासन पालना गर्ने सहमति जनाउँछु।",
  "मैले यस भर्ना फारामसँग बुझाएका सम्पूर्ण कागजात, प्रमाणपत्र र जानकारीहरू सत्य र वास्तविक रहेकोमा कुनै तथ्य लुकाएको वा बिगारेर बुझाएको छैन भनी घोषणा गर्दछु।",
  "संस्थाले निर्धारित गरेको शुल्क निश्चित समयसम्म तिर्ने, कक्षा, परीक्षा र शारीरिक प्रशिक्षणमा नियमित रूपमा सहभागी हुने र शिक्षक तथा प्रशासनको निर्देशन पालना गर्ने बाध्यता स्वीकार गर्दछु।",
  "अभिभावकको सहमति र परिचयमा आधारित भएकाले भर्ना, शुल्क र उपस्थितिसम्बन्धी समस्त निर्णयमा अभिभावक पनि सहभागी हुनेछन् भन्ने मान्दछु।",
  "यो घोषणा र बाध्यतापत्रमा सही गरेपछि माथिका बुँदाहरू कानुनी रूपमा बाध्यकारी रहनेछन् भन्ने र कुनै विवाद उत्पन्न भएमा संस्थाको नियम अनुसार निपटान हुनेछ भन्ने स्वीकार गर्दछु।",
];

export const DECLARATION_EN = [
  "I confirm that I am taking admission at Star Coaching Institute Pvt. Ltd., Janakpurdham of my own free will, and I agree to abide by all the rules, conditions, fees and discipline of the institute.",
  "I declare that all documents, certificates and information submitted with this admission form are true and original, and that nothing has been hidden or falsified.",
  "I undertake to pay the prescribed fee on time, to attend classes, examinations and physical training regularly, and to follow the guidance of the teachers and the administration.",
  "As this admission is based on the consent and reference of my guardian, I acknowledge that the guardian also participates in all decisions regarding admission, fee and attendance.",
  "Once signed, this Declaration & Undertaking shall be legally binding, and any dispute shall be settled as per the rules of the institute.",
];

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
