import type { PrepCourse, PrepModelSet, PrepNote, PrepPost, PrepService } from "@/lib/prep/types";

/**
 * Built-in Preparation Portal content — shown when Firestore is empty.
 *
 * Official syllabus URLs are ONLY set where verified (Nepal Police official
 * site). Other services keep an empty syllabusUrl on purpose: never invent
 * official government URLs — admin fills them from the admin panel.
 */

export const DEFAULT_PREP_SERVICES: PrepService[] = [
  {
    id: "svc-nepal-police",
    name: "Nepal Police",
    slug: "nepal-police",
    description: "Honorable service for the safety of the country and people",
    icon: "Shield",
    color: "from-blue-700 to-blue-900",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "svc-nepali-army",
    name: "Nepali Army",
    slug: "nepali-army",
    description: "Defense of the nation, our commitment",
    icon: "Swords",
    color: "from-emerald-700 to-emerald-900",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "svc-apf",
    name: "Armed Police Force (APF)",
    slug: "apf",
    description: "Border security, peace and community service",
    icon: "ShieldCheck",
    color: "from-orange-600 to-orange-800",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "svc-forest-guard",
    name: "Forest Guard",
    slug: "forest-guard",
    description: "Nature conservation, secure future",
    icon: "Trees",
    color: "from-green-700 to-green-900",
    sortOrder: 4,
    isActive: true,
  },
];

export const DEFAULT_PREP_COURSES: PrepCourse[] = [
  {
    id: "crs-janapad",
    serviceId: "svc-nepal-police",
    name: "जनपद प्रहरी",
    slug: "janapad",
    description: "General Police Group",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "crs-prabidhik",
    serviceId: "svc-nepal-police",
    name: "प्राविधिक प्रहरी",
    slug: "prabidhik",
    description: "Technical Police Group",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "crs-army-general",
    serviceId: "svc-nepali-army",
    name: "आर्मी तयारी",
    slug: "army-prep",
    description: "नेपाली सेना भर्ना तयारी",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "crs-apf-general",
    serviceId: "svc-apf",
    name: "APF तयारी",
    slug: "apf-prep",
    description: "सशस्त्र प्रहरी बल भर्ना तयारी",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "crs-forest-general",
    serviceId: "svc-forest-guard",
    name: "वनरक्षक तयारी",
    slug: "forest-prep",
    description: "वनरक्षक भर्ना तयारी",
    sortOrder: 1,
    isActive: true,
  },
];

export const DEFAULT_PREP_POSTS: PrepPost[] = [
  {
    id: "post-inspector",
    serviceId: "svc-nepal-police",
    courseId: "crs-janapad",
    name: "प्रहरी निरीक्षक",
    slug: "prahari-nirikshak",
    description: "नेपाल प्रहरी निरीक्षक तह",
    syllabusUrl: "",
    syllabusIndexUrl: "https://www.nepalpolice.gov.np/career/syllabus/",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "post-asi",
    serviceId: "svc-nepal-police",
    courseId: "crs-janapad",
    name: "प्रहरी सहायक निरीक्षक (ASI)",
    slug: "prahari-sahayak-nirikshak",
    description: "नेपाल प्रहरी सहायक निरीक्षक तह",
    syllabusUrl: "",
    syllabusIndexUrl: "https://www.nepalpolice.gov.np/career/syllabus/",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "post-jawan",
    serviceId: "svc-nepal-police",
    courseId: "crs-janapad",
    name: "प्रहरी जवान",
    slug: "prahari-jawan",
    description: "नेपाल प्रहरी जनपद समूह",
    // Verified official Nepal Police syllabus page for प्रहरी जवान (जनपद).
    syllabusUrl: "https://www.nepalpolice.gov.np/career/syllabus-detail/6",
    syllabusIndexUrl: "https://www.nepalpolice.gov.np/career/syllabus/",
    syllabusUpdatedAt: "2026-09-30",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "post-office-assistant",
    serviceId: "svc-nepal-police",
    courseId: "crs-janapad",
    name: "प्रहरी कार्यालय सहयोगी",
    slug: "prahari-karyalaya-sahayogi",
    description: "कार्यालय सहयोगी तह",
    syllabusUrl: "",
    syllabusIndexUrl: "https://www.nepalpolice.gov.np/career/syllabus/",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "post-technical-police",
    serviceId: "svc-nepal-police",
    courseId: "crs-prabidhik",
    name: "प्राविधिक प्रहरी",
    slug: "prabidhik-prahari",
    description: "प्राविधिक प्रहरी तह",
    syllabusUrl: "",
    syllabusIndexUrl: "https://www.nepalpolice.gov.np/career/syllabus/",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "post-army-sainik",
    serviceId: "svc-nepali-army",
    courseId: "crs-army-general",
    name: "सैनिक",
    slug: "sainik",
    description: "नेपाली सेना सैनिक तह",
    syllabusUrl: "",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "post-apf-jawan",
    serviceId: "svc-apf",
    courseId: "crs-apf-general",
    name: "जवान",
    slug: "jawan",
    description: "सशस्त्र प्रहरी बल जवान तह",
    syllabusUrl: "",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "post-forest-rakshak",
    serviceId: "svc-forest-guard",
    courseId: "crs-forest-general",
    name: "वनरक्षक",
    slug: "van-rakshak",
    description: "वन तथा वातावरण मन्त्रालय — वनरक्षक तह",
    syllabusUrl: "",
    sortOrder: 1,
    isActive: true,
  },
];

/** Notes + model sets start EMPTY — admin publishes real content. */
export const DEFAULT_PREP_NOTES: PrepNote[] = [];
export const DEFAULT_PREP_MODEL_SETS: PrepModelSet[] = [];
