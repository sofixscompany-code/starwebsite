// Seeds the Firestore-backed career CMS:
//   career          → 4 service docs (hero name/intro/apply/official links)
//   career_sections → content blocks per service (post-wise exam data included)
// Idempotent: stable doc IDs + merge:true, safe to re-run after edits.
// Auth: super_admin demo client (firestore.rules: career* write = super_admin).
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyC5eZvLkCskpmgeAYBmAPmtOeL_0UsuiMA",
  authDomain: "starcoachinginstitutenepal.firebaseapp.com",
  projectId: "starcoachinginstitutenepal",
});
const db = getFirestore(app);
const auth = getAuth(app);

const SITE = "https://starcoachinginstitute.com.np";

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

/* ─────────────────────────── services ─────────────────────────── */

const services = [
  {
    slug: "nepal-police",
    name: "Nepal Police",
    tagline:
      "Constable to Inspector — complete guidance for every stage of Nepal Police recruitment.",
    intro:
      "Nepal Police is the national civil police force of Nepal under the Ministry of Home Affairs, responsible for law enforcement, public order and community safety across all districts.\n\nRecruitment runs through Nepal Police's Online Recruitment Management System (ORMS): every post — Police Constable, Assistant Sub-Inspector, Inspector (open competitive) and technical cadres — is announced separately with its own syllabus, stages and marks. Applications, syllabus PDFs and exam schedules are published on the official website.\n\nStar Coaching Institute prepares you for all of it: written classes, physical fitness ground training and interview guidance.",
    applyUrl: "https://careers.nepalpolice.gov.np",
    officialUrl: "https://nepalpolice.gov.np",
    order: 1,
  },
  {
    slug: "nepali-army",
    name: "Nepali Army",
    tagline: "Serve with pride — join the Nepali Army through open competitive recruitment.",
    intro:
      "The Nepali Army (नेपाली सेना) is the military force of Nepal, mandated with national defence, disaster response and peacekeeping. Recruitment is announced in periodic campaigns by the Recruitment & Selection Directorate (भर्ना छनोट निर्देशनालय, जंगी अड्डा) for soldier posts, trade/technical and followers cadres, plus officer-track and specialist appointments.\n\nThe process is online-first but not online-only: fill the form on the official portal, print it, and physically submit the printed copy with documents at a designated recruitment centre — online-only applications are not accepted. Physical fitness, written exam, medical and interview stages follow as per each campaign notice.\n\nStar Coaching prepares you for the written exam, ground-level physical training and interview.",
    applyUrl: "https://vacancy.nepalarmy.mil.np",
    officialUrl: "https://www.nepalarmy.mil.np",
    order: 2,
  },
  {
    slug: "apf",
    name: "Armed Police Force (APF)",
    tagline:
      "Post-wise syllabi, physical test and interview — complete APF recruitment preparation.",
    intro:
      "The Armed Police Force, Nepal (सशस्त्र प्रहरी, नेपाल) is Nepal's internal security force — guarding vital installations, counter-terrorism duties, VIP security and disaster response.\n\nAPF recruits through its own Online Recruitment Management System (ORMS) at bharna.apf.gov.np. Crucially, APF publishes a SEPARATE syllabus for every post — Inspector, ASI, Constable and other/technical posts each have their own curriculum PDF — so preparation must be post-specific, never generic.\n\nStar Coaching's APF program follows the official post-wise syllabi for written + physical + interview.",
    applyUrl: "https://bharna.apf.gov.np",
    officialUrl: "https://www.apf.gov.np",
    order: 3,
  },
  {
    slug: "forest-guard",
    name: "Forest Guard (वन रक्षक)",
    tagline:
      "PSC Forest Guard — its own separate curriculum; three phases: physical, written, interview.",
    intro:
      "Forest Guard (वन रक्षक) is a Nepal Forest Service, General Forestry Group post selected through the Public Service Commission (Lok Sewa Aayog). PSC publishes a separate competitive-exam curriculum for Forest Guard — distinct from other government posts — and selection runs in three phases: Physical Fitness Test, Written Examination and Interview, each with its own marks.\n\nVacancies, curriculum PDFs and model questions are published on psc.gov.np, and applications go through the Commission's online portal.\n\nStar Coaching prepares candidates for all three phases — fitness ground, Nepali-medium written classes and interview practice.",
    applyUrl: "https://psconline1.psc.gov.np",
    officialUrl: "https://www.psc.gov.np",
    order: 4,
  },
];

/* ─────────────────────────── sections ─────────────────────────── */
// order within a service: sectionIndex*10 + blockIndex

const S = [];
const add = (service, section, order, title, body, post) =>
  S.push({ service, section, order, title, body, ...(post ? { post } : {}) });

// ═══════════ NEPAL POLICE ═══════════
add(
  "nepal-police",
  "posts",
  1,
  "Police Constable (प्रहरी जवान)",
  `The entry-level field post of Nepal Police — the largest recruitment stream every year.
- Serves at ward police posts, district/valley units and specialised branches after training
- Duties: patrolling, crime prevention, crowd management and community policing
- Open competitive recruitment through the ORMS portal
- Promotion path to ASI and beyond through service exams`,
);
add(
  "nepal-police",
  "posts",
  2,
  "Assistant Sub-Inspector (ASI — प्रहरी सहायक निरीक्षक)",
  `Officer-track sub-inspector grade post that supervises police posts and investigation work.
- Written exam + physical test + interview stages
- Separate advertisements for general, law (कानुन) and office-assistant sub-groups
- Educational requirement as per each notice (typically +2 level)
- Pathway toward inspector-level service with experience`,
);
add(
  "nepal-police",
  "posts",
  3,
  "Inspector (प्रहरी निरीक्षक — Open Competitive)",
  `Officer-rank post recruited directly through open competitive examination.
- Leads police posts, units and branches as the station in-charge
- Three written components: GART, Language Proficiency Test and Professional Orientation Aptitude Test — each full marks 100, pass marks 40
- Stages: screening, medicals, physical test, written, special medical, competency/presentation and interview
- Bachelor-level education as per the advertisement`,
);
add(
  "nepal-police",
  "posts",
  4,
  "Technical & Specialist Posts (प्राविधिक प्रहरी)",
  `Separate recruitment campaigns for technical cadres:
- Sub-overseer / inspector level engineering, telecom, IT, forensic and medical sub-groups
- Driver, band, dog-handling and other specialised units
- Education and trade tests differ by subgroup — see the ORMS advertisement
- Technical posts have their own written syllabus published with the notice`,
);
add(
  "nepal-police",
  "eligibility",
  11,
  "Constable — Eligibility",
  `Education:
- Passed SEE/SLC, or a higher qualification as specified in the vacancy notice
- Specialised sub-groups may additionally ask for +2 in a relevant subject

Age:
- Commonly 18–25 years; relaxations apply for inclusive groups and government employees as per law

Physical requirements:
- Minimum height, chest and fitness standards checked at the initial physical/medical stage

Other requirements:
- Nepali citizenship certificate
- Character certificate and medical fitness
- ORMS online profile completed (100%) with scanned documents uploaded`,
  "Constable",
);
add(
  "nepal-police",
  "eligibility",
  12,
  "ASI — Eligibility",
  `Education:
- +2 / Intermediate pass (or equivalent) as per the notice
- Law and office-assistant sub-groups ask for matching qualifications

Age:
- Commonly 18–25 years (inclusive-group relaxations apply)

Physical requirements:
- Height, chest and endurance standards verified in the physical test

Other requirements:
- Nepali citizenship, character certificate, clean record
- Online ORMS application before the deadline with fee paid`,
  "ASI",
);
add(
  "nepal-police",
  "eligibility",
  13,
  "Inspector — Eligibility",
  `Education:
- Bachelor's degree from a recognised university, as per the open-competitive advertisement

Age:
- As published in the notice — open competitive Inspector recruitment commonly allows a wider age band than constable-level posts

Physical requirements:
- Physical fitness test with height/chest standards as per the notice

Other requirements:
- Nepali citizenship, character and medical certificates
- ORMS registration with a fully verified (100%) profile`,
  "Inspector",
);
add(
  "nepal-police",
  "eligibility",
  14,
  "Technical Posts — Eligibility",
  `Education:
- Trade-wise: SLC / +2 / diploma / degree in the relevant engineering, medical, telecom or IT field

Age:
- As mentioned in each technical advertisement

Physical requirements:
- General Nepal Police physical fitness standards

Other requirements:
- Trade/proficiency test for the specific subgroup
- Nepali citizenship and character certificates`,
  "Technical Posts",
);
add(
  "nepal-police",
  "selection",
  21,
  "Application & Screening (ORMS)",
  `- Register and apply at https://careers.nepalpolice.gov.np
- Complete profile to 100%, upload scanned documents and pay the fee via e-Sewa, Khalti, IME Pay or IPS-connected banking
- Applications are screened for eligibility and document completeness`,
);
add(
  "nepal-police",
  "selection",
  22,
  "Initial Medical",
  `- First-stage health screening: vision, general fitness, height and chest measurements
- Medically unfit candidates are filtered out before the written exam`,
);
add(
  "nepal-police",
  "selection",
  23,
  "Physical Test (शारीरिक तन्दुरुस्ती परीक्षण)",
  `- Events include running, push-ups and sit-ups along with other applicable tests
- Standards differ by post and gender as announced in the notice
- Body measurements are re-verified at this stage`,
);
add(
  "nepal-police",
  "selection",
  24,
  "Written Examination",
  `- Post-wise written exam (MCQ and/or descriptive papers) at notified centres
- Each wrong answer in MCQ papers carries 20% negative marking (ORMS advertisement)
- Where applicable, written exams are run at centres notified by Nepal Police / Lok Sewa Aayog`,
);
add(
  "nepal-police",
  "selection",
  25,
  "Detailed / Special Medical",
  `- Second-stage detailed medical examination (special medical)
- Full body check-up, laboratory tests and post-specific medical criteria
- Final medical standards as per Nepal Police health regulations`,
);
add(
  "nepal-police",
  "selection",
  26,
  "Practical / Competency Test (where applicable)",
  `- Skill, competency or presentation components for posts that require them
- Technical cadres take trade/practical tests for their subgroup
- Officer-level posts may include a presentation/competency assessment`,
);
add(
  "nepal-police",
  "selection",
  27,
  "Interview",
  `- Final interview/viva-voce assessing confidence, communication, judgement and service aptitude
- Final merit list combines performance across all stages as published in the result notice`,
);
add(
  "nepal-police",
  "written",
  31,
  "Inspector — Written Exam (3 Papers)",
  `Paper 1 — GART:
- Full Marks: 100 | Pass Marks: 40

Paper 2 — Language Proficiency Test:
- Full Marks: 100 | Pass Marks: 40

Paper 3 — Professional Orientation Aptitude Test:
- Full Marks: 100 | Pass Marks: 40

Duration:
- As notified in the exam schedule / admit card`,
  "Inspector",
);
add(
  "nepal-police",
  "written",
  32,
  "Constable — Written Exam",
  `Post-wise syllabus is published with every advertisement. The written exam generally covers:
- Nepali language (grammar, comprehension, composition)
- English language (grammar, comprehension, vocabulary)
- Mathematics, General Knowledge, Current Affairs and Reasoning
- Subject/profession-related questions where applicable

Full marks, pass marks & duration:
- As published in the vacancy notice for that post
- MCQ papers carry 20% negative marking for wrong answers`,
  "Constable",
);
add(
  "nepal-police",
  "written",
  33,
  "ASI — Written Exam",
  `Paper-wise syllabus is published separately for every ASI advertisement. Common components:
- Nepali and English language papers
- General knowledge, current affairs, reasoning and arithmetic
- Professional/office orientation for officer-track posts

Full marks, pass marks & duration:
- Per the official advertisement and syllabus PDF`,
  "ASI",
);
add(
  "nepal-police",
  "written",
  34,
  "Technical Posts — Written Exam",
  `- Trade/technical subject paper based on the subgroup (engineering, telecom, medical, IT)
- General papers: Nepali, English, GK/current affairs and reasoning
- Practical/trade test may follow the written exam

Marks & duration:
- As published per technical advertisement`,
  "Technical Posts",
);
add(
  "nepal-police",
  "physical",
  41,
  "Running",
  `- Long-distance running is the primary endurance event of the physical test
- Qualifying timing standards are announced per post and gender in the physical-test notice
- Build up to the required distance with 4-day-a-week ground practice before applying`,
);
add(
  "nepal-police",
  "physical",
  42,
  "Push-ups",
  `- Number of push-ups within the set time window as per the event sheet
- Form and count both are judged — practice with a timer`,
);
add(
  "nepal-police",
  "physical",
  43,
  "Sit-ups",
  `- Sit-ups / core endurance event as per the event sheet
- Standards are announced with the physical-test notice for each post`,
);
add(
  "nepal-police",
  "physical",
  44,
  "Other Applicable Events",
  `- Body measurements: height, chest and weight verification
- Field events (e.g., long jump) where listed in the notice
- Medical screening accompanies the physical test — bring original documents`,
);
add(
  "nepal-police",
  "exam-pattern",
  51,
  "How Nepal Police selection is structured",
  `- Stages: application screening → initial medical → physical test → written → special medical → practical/competency (where applicable) → interview
- Written papers are post-wise — there is no single common exam pattern
- Inspector (open competitive): three written components — GART, Language Proficiency Test, Professional Orientation Aptitude Test — each full marks 100 with pass marks 40
- MCQ written exams carry 20% negative marking for every wrong answer
- Physical, medical and interview stages carry weightage as published in the final result notice
- Always confirm full marks, pass marks and duration from the official advertisement`,
);
add(
  "nepal-police",
  "syllabus",
  61,
  "Inspector — Syllabus Overview",
  `Paper 1 — GART:
- General knowledge and current affairs
- Reasoning, arithmetic and mental ability

Paper 2 — Language Proficiency Test:
- Nepali: grammar, comprehension and composition
- English: grammar, comprehension, vocabulary and writing

Paper 3 — Professional Orientation Aptitude Test:
- Service orientation, professional attitude and judgement
- Administrative basics, ethics and law-related awareness

Note:
- Exact topic lists are published with each advertisement on nepalpolice.gov.np`,
  "Inspector",
);
add(
  "nepal-police",
  "syllabus",
  62,
  "Constable — Syllabus Overview",
  `- Nepali: व्याकरण, बुझाइ र रचना
- English: grammar, comprehension, vocabulary
- Mathematics: arithmetic, ratio/percentage, basic algebra
- GK & current affairs: Nepal polity, history, geography, sports, recent events
- Reasoning: series, coding-decoding, direction, number puzzles`,
  "Constable",
);
add(
  "nepal-police",
  "syllabus",
  63,
  "ASI — Syllabus Overview",
  `- Nepali and English language papers
- GK/current affairs and reasoning
- Arithmetic and office/administrative orientation
- Advertisement-specific professional paper where applicable`,
  "ASI",
);
add(
  "nepal-police",
  "syllabus",
  64,
  "Technical — Syllabus Overview",
  `- Trade subject syllabus for the specific subgroup (published with the ad)
- Nepali, English, GK/current affairs and reasoning
- Download the subgroup syllabus PDF from the ORMS portal before you start`,
  "Technical Posts",
);
add(
  "nepal-police",
  "previous-questions",
  71,
  "Previous questions & official archives",
  `Solve official model questions and past advertisements before every attempt:
- Vacancy archive with advertisements, syllabus PDFs and schedules — https://nepalpolice.gov.np/career/vacancy/
- Career notices and announcements — https://www.nepalpolice.gov.np/notices/other-notice-career/
- Exam schedules — https://nepalpolice.gov.np/notices/exam-schedule/
- ORMS portal (registration, admit card, results) — https://careers.nepalpolice.gov.np
- Star Coaching solved model-test series — ${SITE}/courses`,
);
add(
  "nepal-police",
  "preparation",
  81,
  "Written Preparation Plan",
  `- Daily: Nepali/English grammar 20 minutes, reasoning + arithmetic 30 minutes, GK/current affairs 20 minutes
- Weekly full-length mock exams with negative-marking practice
- Maintain an error notebook — revise it every Sunday`,
);
add(
  "nepal-police",
  "preparation",
  82,
  "Physical Preparation Plan",
  `- Run 3–4 km at least 4 days a week; add push-up/sit-up circuits
- Weekend ground practice before the physical test date
- Star Coaching runs guided physical-test drills on its ground`,
);
add(
  "nepal-police",
  "preparation",
  83,
  "Documents & Interview Ready",
  `- Keep citizenship, character certificate, photos and certificates scanned + originals ready
- Prepare service-motivation answers and communication practice for the interview stage
- Track notices daily so you never miss the application window`,
);
add(
  "nepal-police",
  "preparation",
  84,
  "Train with Star Coaching Institute",
  `- Classroom written coaching + physical ground training for Nepal Police, APF, Army and Forest Guard
- Admission/enquiry — ${SITE}/admission
- Course list and fees — ${SITE}/courses`,
);
add(
  "nepal-police",
  "faqs",
  91,
  "How many exams does Nepal Police have?",
  `There is no fixed number — the selection process changes post-wise, and every advertisement publishes its own stages. For example, the official Inspector syllabus lists application screening, medical checks, physical test, three written components (GART, Language Proficiency Test, Professional Orientation Aptitude Test — 100 marks each, pass 40), special medical, competency/presentation and interview. Always read the specific notice for your post.`,
);
add(
  "nepal-police",
  "faqs",
  92,
  "Is there negative marking in the written exam?",
  `Yes — for MCQ written papers, each wrong answer carries a 20% negative marking as per the ORMS advertisement. Answers must be marked in capital letters (A, B, C, D) to be accepted.`,
);
add(
  "nepal-police",
  "faqs",
  93,
  "How do I apply online?",
  `Register at https://careers.nepalpolice.gov.np, complete your profile to 100%, upload scanned documents, submit the application and pay the fee through e-Sewa, Khalti, IME Pay or IPS-connected banking.`,
);
add(
  "nepal-police",
  "faqs",
  94,
  "What is the age limit?",
  `It varies per post and notice — constable/ASI-level posts are commonly 18–25 years. Relaxations apply for inclusive groups and government employees as per the advertisement.`,
);
add(
  "nepal-police",
  "faqs",
  95,
  "Does Star Coaching cover all stages?",
  `Yes — written classes, physical ground training and interview guidance are all covered for Nepal Police. See ${SITE}/courses`,
);
add(
  "nepal-police",
  "notices",
  101,
  "Latest Vacancy / Advertisements",
  `All current post advertisements with eligibility and dates — https://nepalpolice.gov.np/career/vacancy/`,
);
add(
  "nepal-police",
  "notices",
  102,
  "Career Notices & Announcements",
  `ORMS announcements, syllabus notifications and results — https://www.nepalpolice.gov.np/notices/other-notice-career/`,
);
add(
  "nepal-police",
  "notices",
  103,
  "Exam Schedules",
  `Written exam centre and date announcements — https://nepalpolice.gov.np/notices/exam-schedule/`,
);
add(
  "nepal-police",
  "notices",
  104,
  "Ministry of Home Affairs",
  `Parent ministry of Nepal Police — https://moha.gov.np`,
);

// ═══════════ NEPALI ARMY ═══════════
add(
  "nepali-army",
  "posts",
  1,
  "Soldier (सैनिक — सिपाही/भरुवा)",
  `Open-competitive soldier recruitment — the largest Nepali Army entry stream.
- Combat and unit duties after training at army training centres
- Campaigns announced by the Recruitment & Selection Directorate, जंगी अड्डा
- Trade-specific and followers posts run in the same campaigns`,
);
add(
  "nepali-army",
  "posts",
  2,
  "Officer Track (अधिकारी पद)",
  `Officer commission through open competitive process.
- Written, physical, medical and interview stages as per the notice
- Training at Nepali Army Academy (NAAS)
- Bachelor-level education as per the campaign`,
);
add(
  "nepali-army",
  "posts",
  3,
  "Technical & Professional Cadre",
  `Professional appointments announced separately:
- Doctor, nurse, pharmacist, engineer, lawyer, scribe (लेखक), IT and computer operator roles
- Contract and open campaigns as per notice
- Matching degree/experience required per post`,
);
add(
  "nepali-army",
  "posts",
  4,
  "Sports, Band & Followers (फलोअर्स)",
  `Special quota campaigns:
- Sports quota entries for athletes
- Band and music appointments
- Followers posts: b.k.c. (sweeper), tailor, cobbler, barber, blacksmith etc. as per campaign notice`,
);
add(
  "nepali-army",
  "eligibility",
  11,
  "Soldier — Eligibility",
  `Education:
- Passed SLC/SEE or as per the campaign notice (technical trades ask matching qualifications)

Age:
- Commonly around 16–21 years for soldier entry (per notice; inclusive relaxations apply)

Physical requirements:
- Height, chest and endurance standards verified in the physical fitness test

Other requirements:
- Nepali citizenship, character certificate, medical fitness
- Both online registration AND printed-form submission at the recruitment centre are required`,
  "Soldier",
);
add(
  "nepali-army",
  "eligibility",
  12,
  "Officer — Eligibility",
  `Education:
- Bachelor's level from a recognised university as per the open-competitive notice

Age:
- As published in the campaign (officer-track bands differ from soldier entry)

Physical requirements:
- Standard physical fitness tests plus full medical examination

Other requirements:
- Nepali citizenship, character certificates and academic transcripts`,
  "Officer",
);
add(
  "nepali-army",
  "eligibility",
  13,
  "Technical & Professional — Eligibility",
  `Education:
- Matching degree/diploma for the professional post (MBBS/BDS, engineering, law, bachelor for scribe/IT roles)
- Experience requirements as per the notice where applicable

Age:
- As published per campaign

Other requirements:
- Registration/licence certificates for medical and legal posts`,
  "Technical & Professional",
);
add(
  "nepali-army",
  "eligibility",
  14,
  "Sports & Band — Eligibility",
  `Education:
- As per the quota campaign notice

Age:
- As published in the notice

Other requirements:
- Sports achievement certificates for the sports quota
- Audition/trial or proficiency test for band appointments`,
  "Sports & Band",
);
add(
  "nepali-army",
  "selection",
  21,
  "Campaign Announcement",
  `Vacancies are published on the official Nepali Army website and national dailies — schedule, centres and quotas are listed in each notice.`,
);
add(
  "nepali-army",
  "selection",
  22,
  "Online Application + Centre Submission",
  `- Fill the online form at https://vacancy.nepalarmy.mil.np (Apply Online)
- Download and print the form; sign it, affix photo and thumb impression
- Physically submit the printed form with documents at the designated recruitment centre
- Online-only submission is NOT accepted`,
);
add(
  "nepali-army",
  "selection",
  23,
  "Physical Fitness Test",
  `Running, strength and endurance events as per the event sheet of each campaign — standards differ for soldier, officer-track and special quota posts.`,
);
add(
  "nepali-army",
  "selection",
  24,
  "Written Examination",
  `Curriculum is published with the campaign (typically Nepali, English, mathematics, GK/current affairs and reasoning; professional paper for officer/technical tracks).`,
);
add(
  "nepali-army",
  "selection",
  25,
  "Medical Examination",
  `Detailed medical screening of shortlisted candidates — vision, general health and post-specific medical criteria as per army health standards.`,
);
add(
  "nepali-army",
  "selection",
  26,
  "Final Interview / Merit List",
  `Interview/viva where applicable, then the final merit list published by the Recruitment & Selection Directorate.`,
);
add(
  "nepali-army",
  "written",
  31,
  "Soldier — Written Exam",
  `Curriculum is published with each campaign. Common components:
- Nepali and English language
- Mathematics, general knowledge and reasoning
- Profession-related questions for trade posts

Full marks, pass marks & duration:
- As published in the campaign notice
- Syllabus and requirements: https://vacancy.nepalarmy.mil.np`,
  "Soldier",
);
add(
  "nepali-army",
  "written",
  32,
  "Officer — Written Exam",
  `Officer-track written components (as per the open-competitive notice):
- English language (emphasis on comprehension and writing)
- General knowledge, current affairs, reasoning and aptitude
- Subject/professional paper where applicable

Marks & duration:
- As published in the campaign notice`,
  "Officer",
);
add(
  "nepali-army",
  "physical",
  41,
  "Running",
  `- Endurance running is the core event of the physical fitness test
- Distance/timing standards per campaign and post — check the event sheet`,
);
add(
  "nepali-army",
  "physical",
  42,
  "Push-ups & Pull-ups",
  `- Upper-body strength events judged on count within the given window
- Practice with correct form — reps are only counted when performed properly`,
);
add(
  "nepali-army",
  "physical",
  43,
  "Other Events & Measurements",
  `- Height, chest and weight measurements
- Additional field/obstacle events as listed in the campaign event sheet
- Medical screening accompanies the physical stage`,
);
add(
  "nepali-army",
  "exam-pattern",
  51,
  "How Nepali Army selection is structured",
  `- Stages: campaign notice → online form + centre submission → physical fitness test → written → medical → interview/merit
- Soldier and officer-track posts follow separate curricula — prepare post-wise
- Curriculum, centres and event sheets are published on https://vacancy.nepalarmy.mil.np
- Always confirm marks and dates from the specific campaign notice`,
);
add(
  "nepali-army",
  "syllabus",
  61,
  "Soldier — Syllabus Areas",
  `- Nepali: grammar, comprehension and writing
- English: grammar, comprehension, vocabulary
- Mathematics: arithmetic, ratio/percentage, basic algebra
- GK & current affairs: Nepal polity, history, geography, defence/SAARC basics, sports
- Reasoning: series, coding, direction, puzzles`,
  "Soldier",
);
add(
  "nepali-army",
  "syllabus",
  62,
  "Officer — Syllabus Areas",
  `- English: comprehension, essay, grammar (higher weightage)
- GK & current affairs: national/international issues, polity, economy
- Reasoning and aptitude
- Service orientation and profession-related paper as per notice
- Download the exact curriculum from https://vacancy.nepalarmy.mil.np before you start`,
  "Officer",
);
add(
  "nepali-army",
  "previous-questions",
  71,
  "Syllabus, requirements & past notices",
  `- Army vacancy portal: syllabus, requirements, event sheets — https://vacancy.nepalarmy.mil.np
- Official Nepali Army site (all notices) — https://www.nepalarmy.mil.np
- Star Coaching solved model tests — ${SITE}/courses`,
);
add(
  "nepali-army",
  "preparation",
  81,
  "Written Preparation Plan",
  `- Follow the campaign curriculum from the vacancy portal — never a generic pattern
- Daily: language 20 min, reasoning + maths 30 min, GK/current affairs 20 min
- Weekly mock exams + previous campaign model questions`,
);
add(
  "nepali-army",
  "preparation",
  82,
  "Physical Preparation Plan",
  `- Run 4 days/week, build up to the campaign's required distance with timed runs
- Add pull-ups, push-ups and obstacle-style circuits
- Weekend ground sessions with Star Coaching's army batch`,
);
add(
  "nepali-army",
  "preparation",
  83,
  "Train with Star Coaching Institute",
  `- Written + ground + interview preparation for Nepali Army recruitment
- Admission/enquiry — ${SITE}/admission
- Course list and fees — ${SITE}/courses`,
);
add(
  "nepali-army",
  "faqs",
  91,
  "Is the online form enough by itself?",
  `No — after filling the online form at https://vacancy.nepalarmy.mil.np you must print it, sign it with photo/thumb impression and physically submit the printed copy with documents at the recruitment centre. Online-only submissions are not accepted.`,
);
add(
  "nepali-army",
  "faqs",
  92,
  "Where is the army syllabus published?",
  `On the official vacancy portal https://vacancy.nepalarmy.mil.np — under syllabus & requirements for each campaign. General notices appear on https://www.nepalarmy.mil.np`,
);
add(
  "nepali-army",
  "faqs",
  93,
  "What is the age limit for soldiers?",
  `It is published per campaign — soldier entry is commonly in the mid-teens to early-20s band, with relaxations for inclusive groups and serving personnel as per the notice. Always verify from the specific advertisement.`,
);
add(
  "nepali-army",
  "faqs",
  94,
  "Does Star Coaching cover army preparation?",
  `Yes — written classes, physical ground training and interview guidance. See ${SITE}/courses`,
);
add(
  "nepali-army",
  "notices",
  101,
  "Vacancy Portal (apply + syllabus)",
  `Campaign notices, application forms, syllabus and event sheets — https://vacancy.nepalarmy.mil.np`,
);
add(
  "nepali-army",
  "notices",
  102,
  "Nepal Army HQ (all notices)",
  `Official announcements, tender and general notices — https://www.nepalarmy.mil.np`,
);
add(
  "nepali-army",
  "notices",
  103,
  "Recruitment & Selection Directorate",
  `भर्ना छनोट निर्देशनालय, जंगी अड्डा runs all campaigns — contact details are listed on each vacancy notice.`,
);

// ═══════════ APF ═══════════
add(
  "apf",
  "posts",
  1,
  "APF Constable (सशस्त्र प्रहरी जवान)",
  `The largest APF recruitment post — ground-level internal security duty.
- Sub-groups: general, fire-fighting, animal-breeding (परिचर/व्यापार) and technical
- Duties: installation security, VIP protection, counter-disaster and border-area support
- Separate open-competitive syllabus published for जवान posts
- Recruitment announced campaign-wise on the APF ORMS portal`,
);
add(
  "apf",
  "posts",
  2,
  "APF Inspector (सशस्त्र प्रहरी निरीक्षक)",
  `Officer-rank post through open competitive examination.
- Sub-groups: general, law (कानुन) and accounting (लेखा)
- Leads platoons/units and administrative functions
- Separate Inspector syllabus PDF published by APF`,
);
add(
  "apf",
  "posts",
  3,
  "APF ASI (सशस्त्र प्रहरी सहायक निरीक्षक)",
  `Sub-inspector track between constable and inspector.
- Separate syllabus for the ASI open competitive exam
- Initial physical test notice is published before the written stage
- Supervises section-level duties after training`,
);
add(
  "apf",
  "posts",
  4,
  "Other Posts (हवल्दार / परिचर / Technical)",
  `- Havildar and warder (परिचर) posts announced in special campaigns
- Technical cadres: engineering (electronics, computer, civil), health (staff nurse, pharmacy) and multimedia
- Each post/subgroup has its own qualification and syllabus PDF`,
);
add(
  "apf",
  "eligibility",
  11,
  "Constable — Eligibility",
  `Education:
- As per the advertisement — commonly SLC/+2 level; sub-groups may ask for specific subjects

Age:
- Commonly 18–25 years (inclusive-group relaxations as per the notice)

Physical requirements:
- Height/chest standards plus physical efficiency test (running and events per the notice)

Other requirements:
- Nepali citizenship, character certificate and photo/ID documents
- Online application on the APF ORMS portal before the deadline`,
  "Constable",
);
add(
  "apf",
  "eligibility",
  12,
  "Inspector — Eligibility",
  `Education:
- Bachelor's degree; law/accounting sub-groups require the matching degree

Age:
- As per the notice — commonly a wider band for open competitive officer posts

Physical requirements:
- Physical efficiency test as per the campaign notice

Other requirements:
- Nepali citizenship, character and testimonial documents
- ORMS application with fee payment within the deadline`,
  "Inspector",
);
add(
  "apf",
  "eligibility",
  13,
  "ASI — Eligibility",
  `Education:
- +2/Intermediate or equivalent as per the notice

Age:
- Commonly 18–25 years (relaxations per inclusive groups)

Physical requirements:
- Initial physical test (शारीरिक परीक्षण) — notices are published post-wise before written exams

Other requirements:
- Nepali citizenship, character certificate, complete ORMS profile`,
  "ASI",
);
add(
  "apf",
  "eligibility",
  14,
  "Other Posts — Eligibility",
  `Education:
- Havildar/warder: SLC to +2 as per post
- Technical trades: diploma/degree in the relevant engineering or health field

Age:
- As published per post

Physical requirements:
- APF physical standards for the specific post

Other requirements:
- Trade test / proficiency verification for technical posts`,
  "Other Posts",
);
add(
  "apf",
  "selection",
  21,
  "ORMS Application & Screening",
  `- Apply online at https://bharna.apf.gov.np — fill post/sub-group carefully
- Upload photo, citizenship, education and character certificates
- Applications are screened for eligibility before test invitations`,
);
add(
  "apf",
  "selection",
  22,
  "Physical Efficiency Test",
  `- Physical/fitness test notices are published post-wise before written exams
- Running and event standards differ by post and gender
- Only qualified candidates proceed to the written stage`,
);
add(
  "apf",
  "selection",
  23,
  "Written Examination",
  `- Post-wise written exam following APF's separate syllabus for each post
- Conducted at notified centres — carry the admit card and original citizenship
- Marks/pass standards as published per campaign`,
);
add(
  "apf",
  "selection",
  24,
  "Medical Examination",
  `- Detailed medical screening after the written result
- Vision, general health and post-specific medical criteria apply`,
);
add(
  "apf",
  "selection",
  25,
  "Interview & Final Merit",
  `- Interview/viva for shortlisted candidates
- Final merit combines written + physical + interview performance as per the result notice`,
);
add(
  "apf",
  "written",
  31,
  "Inspector — Written Exam",
  `- Separate syllabus PDF for Inspector open competitive (general, law and accounting sub-groups)
- Components: language papers, GK/current affairs, reasoning/arithmetic and the professional paper
- Full marks, pass marks and duration as published in the campaign notice

Download:
- APF syllabus portal — https://bharna.apf.gov.np/syllabus`,
  "Inspector",
);
add(
  "apf",
  "written",
  32,
  "ASI — Written Exam",
  `- Separate ASI syllabus PDF published by APF
- Nepali and English language, GK/current affairs, reasoning/arithmetic
- Professional/administrative orientation paper

Full marks, pass marks & duration:
- Per the campaign notice — https://bharna.apf.gov.np/syllabus`,
  "ASI",
);
add(
  "apf",
  "written",
  33,
  "Constable — Written Exam",
  `- Separate जवान syllabus PDF published by APF
- Nepali, English, mathematics, GK/current affairs and reasoning
- Full marks, pass marks & duration per campaign notice

Download:
- https://bharna.apf.gov.np/syllabus`,
  "Constable",
);
add(
  "apf",
  "written",
  34,
  "Other Posts — Written Exam",
  `- Post/subgroup-specific syllabus PDFs (havildar, warder, technical)
- Technical posts: trade subject + general papers
- Health/engineering syllabus pages linked in the Syllabus section`,
  "Other Posts",
);
add(
  "apf",
  "physical",
  41,
  "Running",
  `- Endurance run is the first event of the physical efficiency test
- Timing standards per post and gender as per the notice`,
);
add(
  "apf",
  "physical",
  42,
  "Push-ups & Sit-ups",
  `- Strength/endurance events judged on count within the given window
- Practice with a timer and correct form`,
);
add(
  "apf",
  "physical",
  43,
  "Measurements & Other Events",
  `- Height, chest and weight measurements
- Any additional event listed in the physical-test notice for your post
- Original documents required at the test venue`,
);
add(
  "apf",
  "exam-pattern",
  51,
  "How APF selection is structured",
  `- APF publishes a SEPARATE syllabus for every post — Inspector, ASI, Constable and others (never prepare from one generic pattern)
- Stages: ORMS application → physical efficiency test → written exam → medical → interview
- Written follows the official syllabus PDF of your post; full/pass marks are announced per campaign
- Physical-test notices for each post are published before the written exam — watch the Official Notices below
- Download syllabi: https://bharna.apf.gov.np/syllabus`,
);
add(
  "apf",
  "syllabus",
  61,
  "Inspector — Syllabus (official PDFs)",
  `- Inspector open competitive curriculum (general/law/accounting sub-groups): https://bharna.apf.gov.np/syllabus
- Also listed on the general syllabus page: https://www.apf.gov.np/syllabus-general
- Download and prepare exactly from the PDF of your sub-group`,
  "Inspector",
);
add(
  "apf",
  "syllabus",
  62,
  "ASI — Syllabus (official PDFs)",
  `- ASI open competitive curriculum PDF: https://bharna.apf.gov.np/syllabus
- General syllabus listing: https://www.apf.gov.np/syllabus-general`,
  "ASI",
);
add(
  "apf",
  "syllabus",
  63,
  "Constable — Syllabus (official PDFs)",
  `- सशस्त्र प्रहरी जवान पदको खुला प्रतियोगितात्मक परीक्षाको पाठ्यक्रम: https://bharna.apf.gov.np/syllabus
- Topics: Nepali, English, mathematics, GK/current affairs, reasoning
- General syllabus page: https://www.apf.gov.np/syllabus-general`,
  "Constable",
);
add(
  "apf",
  "syllabus",
  64,
  "Other Posts — Syllabus (official PDFs)",
  `- Technical (Engineering) syllabus: https://apf.gov.np/syallbus-technical-engineering
- Technical (Health) syllabus: https://apf.gov.np/syllabus-technical-health
- General syllabus page: https://www.apf.gov.np/syllabus-general`,
  "Other Posts",
);
add(
  "apf",
  "previous-questions",
  71,
  "Previous questions & official archives",
  `Post-wise syllabus PDFs and past notices:
- Post-wise syllabus PDFs (official) — https://bharna.apf.gov.np/syllabus
- APF vacancy/campaign notices — https://apf.gov.np/vacancy
- General syllabus page — https://www.apf.gov.np/syllabus-general
- Star Coaching APF model tests — ${SITE}/courses`,
);
add(
  "apf",
  "preparation",
  81,
  "Written Preparation Plan",
  `- Start from your post's official syllabus PDF — nothing generic
- Daily: language 20 min, reasoning + maths 30 min, GK/current affairs 20 min
- Weekly full mocks in exam conditions`,
);
add(
  "apf",
  "preparation",
  82,
  "Physical Preparation Plan",
  `- Run 3–4 km four days a week; add push-up/sit-up circuits
- Rehearse the event sheet before every test date
- Star Coaching runs APF physical batches on its ground`,
);
add(
  "apf",
  "preparation",
  83,
  "Train with Star Coaching Institute",
  `- Written + physical + interview preparation for APF recruitment
- Admission/enquiry — ${SITE}/admission
- Course list and fees — ${SITE}/courses`,
);
add(
  "apf",
  "faqs",
  91,
  "Where does APF publish its syllabus?",
  `On its recruitment portal: https://bharna.apf.gov.np/syllabus — with separate PDFs for Inspector, ASI, Constable and other posts.`,
);
add(
  "apf",
  "faqs",
  92,
  "Is the exam pattern the same for all APF posts?",
  `No. APF publishes post-wise syllabi — pick your post in the tabs above and download that exact PDF. Inspector, ASI and Constable curricula are different documents.`,
);
add(
  "apf",
  "faqs",
  93,
  "How do I apply?",
  `Online via https://bharna.apf.gov.np — create your application, upload documents and pay the fee within the deadline. Physical-test notices for each post come before the written exam.`,
);
add(
  "apf",
  "faqs",
  94,
  "Does Star Coaching cover APF?",
  `Yes — post-wise written classes, physical ground training and interview guidance. See ${SITE}/courses`,
);
add(
  "apf",
  "notices",
  101,
  "Vacancy / Campaign Notices",
  `Post-wise recruitment campaigns and updates — https://apf.gov.np/vacancy`,
);
add(
  "apf",
  "notices",
  102,
  "APF Notices Board",
  `Written schedules, physical test notices and results — https://apf.gov.np/notices`,
);
add(
  "apf",
  "notices",
  103,
  "Online Recruitment System (ORMS)",
  `Application portal with syllabus downloads — https://bharna.apf.gov.np`,
);

// ═══════════ FOREST GUARD ═══════════
add(
  "forest-guard",
  "posts",
  1,
  "Forest Guard (वन रक्षक)",
  `Nepal Forest Service, General Forestry Group — non-gazetted field post selected through PSC.
- Field protection of forest areas, patrol (गस्ती) and illegal-harvesting control
- Timber marking/measurement duties and community forestry support
- Selected through the Public Service Commission competitive exam with its own curriculum`,
);
add(
  "forest-guard",
  "posts",
  2,
  "Related Posts (Game Scout & others)",
  `PSC also recruits Game Scout (national parks & wildlife group) and other forest-service posts with similar phase-based curricula.
- Watch the PSC vacancy board for campaign-wise openings
- Mahut and other special posts announce self-declared fitness/skill requirements`,
);
add(
  "forest-guard",
  "eligibility",
  11,
  "Forest Guard — Eligibility",
  `Education:
- Passed Class 8 (eight classes) from a recognised educational institution and physically fit — as per PSC vacancy notice

Age:
- 18–35 years; upper limit 40 for women and persons with disability
- No upper limit for certain incumbent government servants as per the notice

Physical requirements:
- Self-declared physical fitness at application + first-phase Physical Fitness Test
- Only candidates who pass the physical phase qualify for the written exam

Other requirements:
- Nepali citizenship certificate and educational certificates submitted with the application
- Inclusive-group candidates attach the relevant commission certificates`,
);
add(
  "forest-guard",
  "selection",
  21,
  "Application & Screening (PSC)",
  `- Apply through the Commission's online portal (link in Official Notices)
- Screened against education, age and quota requirements
- Admit card issued for the first phase`,
);
add(
  "forest-guard",
  "selection",
  22,
  "Phase 1 — Physical Fitness Test (शारीरिक तन्दुरुस्ती परीक्षण)",
  `- First phase of the PSC Forest Guard curriculum
- Carries 50 marks in the standard curriculum pattern
- Only qualified candidates move to the written exam`,
);
add(
  "forest-guard",
  "selection",
  23,
  "Phase 2 — Written Examination",
  `- Second phase, conducted in Nepali medium
- Carries 30 marks in the standard curriculum pattern
- Subject areas: forestry, forest laws, conservation and general knowledge (see Syllabus)`,
);
add(
  "forest-guard",
  "selection",
  24,
  "Phase 3 — Interview",
  `- Third phase interview/viva — carries 20 marks
- Final result combines all three phases in qualification order as published by PSC`,
);
add(
  "forest-guard",
  "written",
  31,
  "Forest Guard — Written Exam",
  `- Medium: Nepali
- Pattern (standard PSC Forest Guard curriculum): physical 50 + written 30 + interview 20
- Province PSCs may publish different splits (e.g., 54/40/6) — always check the current curriculum PDF
- You reach the written phase only after passing the physical fitness test`,
);
add(
  "forest-guard",
  "physical",
  41,
  "Physical Fitness Test (Phase 1)",
  `- The first phase is a fitness test, not just a formality — it carries the highest marks share (50 in the standard pattern)
- Events as per the campaign's physical plan — prepare running and endurance in advance
- Fitness is also self-declared at application time`,
);
add(
  "forest-guard",
  "physical",
  42,
  "Preparation Notes",
  `- Train 4 days/week: running, endurance circuits and basic strength work
- Only physically qualified candidates appear for the written exam
- Carry the admit card and original citizenship to the test venue`,
);
add(
  "forest-guard",
  "exam-pattern",
  51,
  "How Forest Guard selection is structured",
  `- Three fixed phases: Physical Fitness Test → Written → Interview (no hidden exams beyond the published curriculum)
- Standard marks split: 1st phase 50, 2nd phase 30, 3rd phase 20 (central curriculum; province notices may differ)
- Medium of written examination: Nepali
- Final merit = aggregate of all three phases in qualification order
- Curriculum PDF and implementation date are published with each campaign — verify at https://www.psc.gov.np`,
);
add(
  "forest-guard",
  "syllabus",
  61,
  "Forest Guard — Syllabus (official curriculum areas)",
  `Written exam subject areas from the official PSC Forest Guard curriculum:
- वन, वनस्पति र वन्यजन्तु संरक्षण; मानव-वन्यजन्तु द्वन्द्व न्यूनीकरण
- वन अपराध नियन्त्रण र गस्ती गदा; अवैध कटान/तस्करी नियन्त्रण
- वन मापन तथा वन पैदावर: छपान, कटान, मछान र घाटगद्दी
- टाचा, दर्शपठ, तसल, छोडपजरी र वन पैदावर ओसारपसार
- वन ऐन, २०७६ र वन नियमावली, २०७९ का प्रमुख व्यवस्था
- राष्ट्रिय वन, सामुदायिक वन, निजी वन, धातुवन, वन संरक्षण क्षेत्र र जीव वन
- वन डढेलो, अतिक्रमण र चरचरी जस्ता प्रमुख चुनौतीहरू
- वन्यजन्तु उद्धार/नियन्त्रण र दुर्लभ प्रजातिहरू
- सतत वन व्यवस्थापन, नतुवा/जर्डेवटीको उपयोग, कृषि-वनीकरण
- राष्ट्रिय निकुञ्ज तथा वन्यजन्तु संरक्षण ऐन, २०२९
- भूमि उपयोग, वातावरण संरक्षण र जलवायु प्रभाव सम्बन्धी सामान्य ज्ञान`,
);
add(
  "forest-guard",
  "previous-questions",
  71,
  "Curriculum, model questions & application",
  `- PSC curriculum category (all post syllabi & model questions) — https://www.psc.gov.np/category/course
- Online application portal — https://psconline1.psc.gov.np
- PSC official site (vacancies, results) — https://www.psc.gov.np
- Star Coaching model tests — ${SITE}/courses`,
);
add(
  "forest-guard",
  "preparation",
  81,
  "Phase 1 First — Physical Preparation",
  `- The physical phase comes first and carries the most marks (50) — train running/endurance from day one
- 4 days/week minimum: timed runs + strength circuits`,
);
add(
  "forest-guard",
  "preparation",
  82,
  "Nepali-medium Written Preparation",
  `- Study the official curriculum areas in Nepali — forestry terms, वन ऐन २०७६, नियमावली २०७९
- Make one-page notes per topic; revise weekly
- Practice PSC model questions under time limits`,
);
add(
  "forest-guard",
  "preparation",
  83,
  "Train with Star Coaching Institute",
  `- Written + fitness-ground + interview preparation for Forest Guard and other PSC exams
- Admission/enquiry — ${SITE}/admission
- Course list and fees — ${SITE}/courses`,
);
add(
  "forest-guard",
  "faqs",
  91,
  "How many phases are in Forest Guard selection?",
  `Three: Physical Fitness Test (50 marks), Written Examination (30 marks) and Interview (20 marks) as per the PSC curriculum pattern — verify the current split from the curriculum PDF of your campaign (province PSCs can differ, e.g. 54/40/6).`,
);
add(
  "forest-guard",
  "faqs",
  92,
  "What education is required?",
  `Passed Class 8 (eight classes) from a recognised educational institution and physically fit — as per the PSC vacancy notice. Age is commonly 18–35 (upper limit 40 for women and persons with disability).`,
);
add(
  "forest-guard",
  "faqs",
  93,
  "What medium is the written exam?",
  `Nepali — the medium of the written examination is Nepali as per the curriculum.`,
);
add(
  "forest-guard",
  "faqs",
  94,
  "Where do I get the syllabus and model questions?",
  `From PSC's curriculum category: https://www.psc.gov.np/category/course — PSC publishes the Forest Guard curriculum separately with each campaign.`,
);
add(
  "forest-guard",
  "notices",
  101,
  "PSC Vacancies & Results",
  `All campaign notices, accepted-applicant lists and results — https://www.psc.gov.np`,
);
add(
  "forest-guard",
  "notices",
  102,
  "PSC Curriculum Page",
  `Post-wise syllabi, exam plans and model questions — https://www.psc.gov.np/category/course`,
);
add(
  "forest-guard",
  "notices",
  103,
  "Online Application Portal",
  `Create application, upload documents, download admit card — https://psconline1.psc.gov.np`,
);

const sections = S;

/* ─────────────────────────── seed ─────────────────────────── */

async function main() {
  await signInWithEmailAndPassword(
    auth,
    "super_admin@demo.starcoaching.edu.np",
    "Star#Demo2026!Kx7",
  );
  console.log("Signed in as super_admin demo");

  for (const s of services) {
    await setDoc(
      doc(db, "career", `svc-${s.slug}`),
      { ...s, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }
  console.log(`career services upserted: ${services.length}`);

  const seen = new Set();
  for (const sec of sections) {
    const id = `${sec.service}--${sec.section}--${slugify(sec.post ?? "all")}--${slugify(
      sec.title,
    )}`;
    if (seen.has(id)) throw new Error(`duplicate section id: ${id}`);
    seen.add(id);
    await setDoc(
      doc(db, "career_sections", id),
      {
        service: sec.service,
        section: sec.section,
        post: sec.post ?? null,
        title: sec.title,
        body: sec.body,
        order: sec.order,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
  console.log(`career_sections upserted: ${sections.length}`);

  const svcSnap = await getDocs(collection(db, "career"));
  const secSnap = await getDocs(collection(db, "career_sections"));
  const byService = {};
  secSnap.docs.forEach((d) => {
    const sv = d.data().service;
    byService[sv] = (byService[sv] ?? 0) + 1;
  });
  console.log(`VERIFY career: ${svcSnap.size} docs | career_sections: ${secSnap.size} docs`);
  console.log("per service:", JSON.stringify(byService));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("ERROR:", e.message);
    process.exit(1);
  });
