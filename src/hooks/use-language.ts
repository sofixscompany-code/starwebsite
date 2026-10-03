import { useState, useEffect, useCallback, createContext, useContext } from "react";

export type Lang = "en" | "ne" | "hi";

export const LANG_LABELS: Record<Lang, string> = {
  en: "English",
  ne: "नेपाली",
  hi: "हिन्दी",
};

export const LANG_NATIVE: Record<Lang, string> = {
  en: "English",
  ne: "Nepali",
  hi: "Hindi",
};

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    Home: "Home",
    About: "About",
    Courses: "Courses",
    "Preparation Portal": "Preparation Portal",
    Faculty: "Faculty",
    Results: "Results",
    Notices: "Notices",
    Gallery: "Gallery",
    Contact: "Contact",
    Enquiry: "Enquiry",
    Admission: "Admission",
    "Apply Now": "Apply Now",
    "Student Login": "Student Login",
    Dashboard: "Dashboard",
    "Admin Panel": "Admin Panel",
    "Sign out": "Sign out",
    "Quick Links": "Quick Links",
    "Get Started": "Get Started",
    "Online Admission": "Online Admission",
    "Contact Us": "Contact Us",
    "All rights reserved": "All rights reserved",
    "Powered by": "Powered by",
    "Welcome Back": "Welcome Back",
    "Sign In": "Sign In",
    "Sign Up": "Sign Up",
    Email: "Email",
    Password: "Password",
    "Remember me": "Remember me",
    "Forgot Password?": "Forgot Password?",
    "Quick Demo Access": "Quick Demo Access",
    "Preview each role's dashboard": "Preview each role's dashboard",
    Nepal: "Nepal",

    // Homepage — Hero
    heroTagline: "Today's Right Preparation,",
    heroHighlight: "Tomorrow's Uniform!",
    heroSubtitle: "Discipline, hard work and the right guidance are the foundation of success.",
    admissionOpen: "ADMISSION OPEN",
    admissionYear: "2083/84",
    onlineAdmission: "Online Admission",
    admissionFormHint: "Fill this form and we'll generate your admission number instantly.",
    nepalPolice: "Nepal Police",
    nepaliArmy: "Nepali Army",
    apf: "Armed Police Force (APF)",
    forestGuard: "Forest Guard",
    writtenPhysical: "Written + Physical",
    mockTests: "Mock Tests",
    applyOnline: "APPLY ONLINE",
    whatsappNow: "WHATSAPP NOW",
    address: "Zeromile, Janakpurdham-7, Dhanusha, Nepal",
    preparationTodaySuccessTomorrow: "Preparation Today, Success Tomorrow",

    // Hero Right
    starCoaching: "STAR COACHING",
    institutePvtLtd: "INSTITUTE PVT. LTD.",

    // Quick Features
    writtenPreparation: "Written Preparation",
    physicalTraining: "Physical Training",
    regularMockTests: "Regular Mock Tests",
    safeHostel: "Safe Hostel",

    // Courses Section
    ourCourses: "Our Courses",
    coursePrompt: "Which service are you preparing for?",
    courseSubtext: "Choose your goal and start preparing today",
    applyNow: "Apply Now",
    officialWebsite: "Official Website",
    careerDisclaimer:
      "Selection stages, eligibility and marks change with every vacancy notice — always confirm from the official notices linked below.",
    careerLoading: "Loading details…",
    careerSoon: "Details for this service are being updated. Please check back soon.",
    careerNotFound: "We couldn't find that career page.",
    exploreOtherServices: "Explore other services",
    startPrepTitle: "Start your preparation with Star Coaching",
    startPrepText: "Written + physical + interview coaching for all four services.",
    jumpTo: "On this page",
    secPosts: "Available Posts",
    secEligibility: "Eligibility",
    secSelection: "Selection Process",
    secWritten: "Written Exam",
    secPhysical: "Physical Test",
    secPattern: "Exam Pattern",
    secSyllabus: "Syllabus",
    secQuestions: "Previous Questions",
    secPrep: "Preparation Materials",
    secFaq: "Frequently Asked Questions",
    secNotices: "Official Notices",
    backToHome: "Home",
    careerGuidesEyebrow: "Career Guide",
    viewCourses: "View Courses",
    gotIt: "Got it",
    policeDesc: "Honorable service for the safety of the country and people",
    armyDesc: "Defense of the nation, our commitment",
    apfDesc: "Border security, peace and community service",
    forestDesc: "Nature conservation, secure future",
    viewDetails: "View Details",

    // Stats
    satisfiedStudents: "Satisfied Students",
    selections: "Selections",
    yearsExperience: "Years of Experience",
    trustedInstitute: "Trusted Institute",

    // CTA Banner
    yourDreamOurGuidance: "Your Dream, Our Guidance!!",
    applyToday: "Apply Today",

    // Why Choose Us
    whyChooseUs: "Why Choose Us",
    whyChooseStar: "Why Choose Star Coaching?",
    whySubtext: "Your goal is our responsibility. Excellent preparation, bright future",
    writtenPhysicalPrep: "Written + Physical Preparation",
    writtenPhysicalNepali: "Both written and physical preparation",
    experiencedInstructors: "Experienced Instructors",
    experiencedInstructorsNepali: "Experienced and skilled teachers",
    regularMockTestsNepali: "Regular Mock Tests",
    examFocusedClasses: "Exam-Focused Classes",
    examFocusedNepali: "Exam-centered teaching",
    dailyPhysicalTraining: "Daily Physical Training",
    dailyPhysicalNepali: "Daily physical training",
    dailyPhysicalTrainingNepali: "Daily physical practice",
    hostelFacility: "Hostel Facility",
    hostelFacilityNepali: "Safe accommodation for students",

    // Written vs Physical
    writtenClasses: "Written Classes",
    nepaliEnglishMath: "Nepali | English | Math | Service-related",
    comprehensivePrep: "Comprehensive preparation as per curriculum",
    exploreWrittenClasses: "Explore Written Classes",
    physicalTrainingDetail: "Physical Training",
    runningPushupSitup: "Running | Push-up | Sit-up | Chin-up | 3200m",
    physicalPrepAsPerStandard: "Physical preparation as per standard",
    explorePhysicalTraining: "Explore Physical Training",

    // MD Message
    managingDirector: "Managing Director",
    mdQuote:
      "Discipline, hard work and the right guidance are the foundation of success. Secure your future today.",

    // Online Classes
    onlineClasses: "Online Classes",
    anytimeAnywhereSameQuality: "ANYTIME | ANYWHERE | SAME QUALITY",
    prepareFromHome: "Prepare from home with STAR",
    liveClass: "LIVE CLASS",
    sangathanSanchana: "Organization Structure",
    karyaAdhikarJimmewari: "Duties, Rights and Responsibilities",
    sewaAnushasan: "Service, Discipline",
    mahatwapurnPrashna: "Important Questions",

    // Online Features
    liveOnlineClasses: "Live Online Classes",
    liveOnlineDesc: "Interactive classes with expert teachers",
    recordedClasses: "Recorded Classes",
    recordedDesc: "Watch anytime for revision",
    pdfNotes: "PDF Notes & Study Materials",
    pdfNotesDesc: "Well structured, exam focused notes",
    onlineMockTests: "Online Mock Tests",
    onlineMockDesc: "Practice like real exam",
    teacherSupport: "Teacher Support",
    teacherSupportDesc: "Get your doubts cleared anytime",
    mobileLaptopFriendly: "Mobile + Laptop Friendly",
    mobileLaptopDesc: "Learn on any device, anywhere",
    ourOnlineCourses: "Our Online Courses",
    prepareBrighterTomorrow: "Prepare for a brighter tomorrow",
    joinOnlineClass: "Join Online Class",
    whatsappForDetails: "WhatsApp for Details",

    // Admission Process
    admissionProcess: "Admission Process",
    howToEnroll: "How to enroll?",
    admissionSubtext: "First step to your bright future, start today",
    courseSelect: "Course Select",
    courseSelectDesc: "Choose a course based on your goal",
    formFill: "Form Fill",
    formFillDesc: "Fill online or offline admission form",
    admissionConfirm: "Admission Confirm",
    admissionConfirmDesc: "Submit documents and confirm admission",
    startYourAdmission: "START YOUR ADMISSION",

    // Student Success
    studentSuccess: "Student Success",
    ourStudentOurPride: "Our Students, Our Pride",
    successStoriesSubtext: "Stories of success from past years, now it's your turn!",
    selectedFor: "Selected for",

    // Gallery
    galleryInsideStar: "Gallery / Inside Star Coaching",
    gallerySubtext: "A glimpse of our activities",
    viewMore: "View More",
    browseByCategory: "Browse by Category",
    classroomSessions: "Classroom Sessions",
    physicalTrainingGallery: "Physical Training",
    mockTestGallery: "Mock Test",
    hostelFacilityGallery: "Hostel Facility",
    eventsAndPrograms: "Events & Programs",
    studentLife: "Student Life",

    // Instructors
    ourInstructors: "Our Instructors",
    instructorsSubtext: "Experienced and dedicated teachers",
    viewAllInstructors: "View All Instructors",
    mathematics: "Mathematics",
    generalKnowledge: "General Knowledge",
    english: "English",
    physicalTrainingInstructor: "Physical Training",

    // Hostel
    hostelAvailable: "Hostel Facility Available",
    hostelSubtext: "Safe, comfortable and study-friendly environment",
    starHostel: "STAR HOSTEL",
    safeStayBetterTomorrow: "Safe Stay · Better Tomorrow",
    separateHostel: "Separate Hostel for Boys & Girls",
    cleanRooms: "Clean & Comfortable Rooms",
    nutritiousMeals: "Nutritious Meals (Mess Facility)",
    security247: "24/7 Security & CCTV",
    peacefulEnvironment: "Peaceful Environment for Study",
    nearToInstitute: "Near to Institute",
    contactForDetails: "Contact for Details",

    // Reviews
    studentReviews: "Student Reviews",
    whatStudentsSay: "What Our Students Say",
    reviewsSubtext: "Trust of past students, journey of success",

    // Contact page
    ourLocation: "Our Location",
    locationSubtext:
      "Zeromile, Janakpurdham-7, Dhanusha · Madhesh Province — walk-ins welcome during office hours.",
    emailLabel: "Email",
    followUsCard: "Follow Us",
    sendMessageTitle: "Send us a message",
    sendMessageSub: "Fill in the form and our team will get back to you within a working day.",
    fullNameLabel: "Full name *",
    yourNamePlaceholder: "Your name",
    phoneLabel: "Phone *",
    courseInterest: "Course interest",
    coursePlaceholder: "e.g. Staff Nurse / HA",
    messageLabel: "Message",
    howCanWeHelp: "How can we help you?",
    sendLabel: "Send message",
    sendingLabel: "Sending...",
    messageSentToast: "Message sent! Our team will contact you shortly.",
    messageErrorToast: "Could not send your message. Please try again.",
    messageRequiredToast: "Please enter your name and phone number.",

    // Courses & Gallery (shared filters / labels)
    allFilter: "All",
    allPhotos: "All Photos",
    galleryPhotoCount: "{count} photos in the gallery",
    starCoachingMoment: "Star Coaching moment",
    searchCoursesPlaceholder: "Search courses (e.g. Police, Nurse, Diploma…)",
    noCoursesMatch: "No courses match your search",
    noCoursesMatchSub:
      "Try a different keyword or category, or contact us — we can guide you to the right course.",
    talkToUs: "Talk to us",
    courseOne: "course",
    courseMany: "courses",
    seatsLabel: "seats",
    eligibilityLabel: "Eligibility",
    applyForCourse: "Apply for this course",

    // Results page
    resultsHeroEyebrow: "Congratulations Stars",
    resultsHeroTitle: "Our Top Selections",
    resultsHeroSub: "Real students, real posts. A snapshot of our recent successes across Nepal.",
    searchResultsPlaceholder: "Search student, achievement, tag...",
    allAchievements: "All Achievements",
    allCategories: "All Categories",
    allYears: "All Years",
    allBatches: "All Batches",
    resultsLoadError: "Unable to load results. Please try again.",
    noSelectionsYet: "No selection results available yet.",

    // Notices page
    noticesHeroEyebrow: "Stay Updated",
    noticesHeroTitle: "Notices & Events",
    noticesHeroSub:
      "Official announcements from Star Coaching Institute — exams, admissions, scholarships, fees and events, updated live.",
    noticesSearchPlaceholder: "Search notices...",
    noticesEmpty: "No notices published yet. Check back soon!",
    newBadge: "New",
    generalNotice: "Institute Notice",
    latestNotices: "Latest Notices",
    latestNoticesSub:
      "Official announcements from Star Coaching Institute — published live from the admin dashboard.",
    viewAllNotices: "View all notices",
    aboutSectionTitle: "About the Institute",
    exploreAbout: "Read more",

    // FAQ
    faqs: "FAQs",
    faqHeading: "Frequently Asked Questions",
    faqSubtext: "Your questions, our clear answers",
    faq1Q: "What courses are available at Star Coaching Institute?",
    faq1A:
      "We provide written, physical and other preparation for various government service competitions including Nepal Army, Nepal Police, Armed Police Force (APF) and Forest Guard.",
    faq2Q: "Are classes Offline only or Online too?",
    faq2A: "We conduct classes in both Offline and Online modes.",
    faq3Q: "How often are Mock Tests conducted?",
    faq3A: "We regularly conduct weekly and monthly Mock Tests.",
    faq4Q: "Is Hostel Facility available?",
    faq4A: "Yes, we have safe hostel facilities for boys and girls.",
    faq5Q: "How can I take Admission?",
    faq5A: "You can apply online from our website or visit our center in person.",

    // Contact
    visitUs: "Visit Us",
    contactSubtext: "Contact us today for your bright future",
    addressLabel: "Address",
    phoneNumbers: "Phone Numbers",
    whatsappContact: "Contact on WhatsApp",
    whatsappNowBtn: "WhatsApp Now",
    callNow: "CALL",
    breakingNews: "Breaking News",
    noticesAndResults: "Notices & Results",
    resultLabel: "Result",
    timing: "Timing",
    timingHours: "6:00 AM – 6:00 PM",
    viewLargerMap: "View Larger Map",

    // Footer
    footerTagline: "Your Goal, Our Commitment",
    footerSubtext: "Today's preparation, tomorrow's uniform",
    followUs: "Follow Us",
    todayPrepTomorrowUniform: "Today's right preparation, tomorrow's uniform!",

    // Courses Page
    coursesHeroTitle: "Every course, one focused institute",
    coursesHeroSub:
      "From uniform services to medical, technical and school tuition — pick the path that fits your career.",

    // About Page
    aboutHeroTitle: "Building Nepal's future — one student at a time.",
    aboutHeroSub:
      "Star Coaching Institute Pvt. Ltd. is a Janakpurdham-based coaching institute specializing in Security Forces, Loksewa, Medical, Technical and School education.",
    ourHistory: "Our History",
    historyBody:
      "Since {year}, Star Coaching Institute has been guiding thousands of students from Madhesh Province and beyond to succeed in Nepal Police, Nepal Army, Armed Police Force, Loksewa Aayog, Staff Nurse, HA, CMA/ANM, Engineering Diploma and Computer training.",
    mdMessageAbout: "Message from the Managing Director",
    vision: "Vision",
    visionBody:
      "To become Nepal's most trusted coaching institute for government-service preparation and career-focused technical education.",
    mission: "Mission",
    missionBody:
      "Deliver disciplined, result-focused coaching with real-service faculty, honest guidance and full support — including scholarships for deserving students.",
    achievements: "Achievements",
    achievementsBody:
      "800+ selections across Nepal Police, Army, APF, Staff Nurse, HA and Engineering Diploma programs — with province toppers every year.",
    ourTeam: "Our Team",
    teamSubtext:
      "A blend of experienced faculty from real service backgrounds, dedicated coordinators, and physical trainers.",
    viewAllFaculty: "View all faculty",

    // About page (paper-style: hero → breadcrumb → introduction → goals)
    aboutPageTitle: "About Us",
    breadcrumbHome: "Home",
    aboutIntroTitle: "Our Introduction",
    aboutIntroBody:
      "Star Coaching Institute Pvt. Ltd. is an experienced and trusted training institute established in Janakpurdham. Running preparatory classes for Nepal Police, Nepal Army, Armed Police Force, Lok Service Commission, Medical and Technical careers, we prepare students for success on the foundation of discipline, quality and hard work. Located at Zeromile Chowk, Janakpurdham-7, our institute has experienced trainers, modern study material, a library, a computer lab and full physical-training facilities. Hostel and meal arrangements are also available for students.",
    aboutGoalsTitle: "Our Goals",
    aboutGoal1: "Quality education and excellent training",
    aboutGoal2: "Dedicated and experienced trainers",
    aboutGoal3: "A bright future for every student",
    registerTitle: "Registers",
    progressCardTitle: "Student Progress Card",
    progressCardSub:
      "Every admitted student receives a printed progress report card with subject-wise marks, grade, attendance and the class teacher's remarks.",

    // Faculty Page
    facultyHeroTitle: "Learn from real experts",
    facultyHeroSub:
      "A team of subject experts, physical trainers and mentors — many from real service backgrounds.",

    // Gallery Page
    lifeAtStar: "Life at Star",
    galleryHeroTitle: "Photo Gallery",
    galleryHeroSub: "Real students, real posts. A snapshot of our recent selections across Nepal.",
    galleryEmpty: "Gallery photos are being added. Check back soon.",
  },
  ne: {
    // Nav
    Home: "गृहपृष्ठ",
    About: "हाम्रो बारे",
    Courses: "पाठ्यक्रमहरू",
    "Preparation Portal": "तयारी पोर्टल",
    Faculty: "शिक्षकहरू",
    Results: "नतिजाहरू",
    Notices: "सूचनाहरू",
    Gallery: "ग्यालरी",
    Contact: "सम्पर्क",
    Enquiry: "सोधपुछ",
    Admission: "भर्ना",
    "Apply Now": "अहिले नै आवेदन दिनुहोस्",
    "Student Login": "विद्यार्थी लगइन",
    Dashboard: "ड्यासबोर्ड",
    "Admin Panel": "प्रशासक प्यानल",
    "Sign out": "साइन आउट",
    "Quick Links": "द्रुत लिङ्कहरू",
    "Get Started": "सुरु गर्नुहोस्",
    "Online Admission": "अनलाइन भर्ना",
    "Contact Us": "सम्पर्क गर्नुहोस्",
    "All rights reserved": "सर्वाधिकार सुरक्षित",
    "Powered by": "द्वारा संचालित",
    "Welcome Back": "पुन: स्वागत छ",
    "Sign In": "साइन इन",
    "Sign Up": "साइन अप",
    Email: "इमेल",
    Password: "पासवर्ड",
    "Remember me": "मलाई सम्झनुहोस्",
    "Forgot Password?": "पासवर्ड बिर्सनुभयो?",
    "Quick Demo Access": "द्रुत डेमो पहुँच",
    "Preview each role's dashboard": "प्रत्येक भूमिकाको ड्यासबोर्ड हेर्नुहोस्",
    Nepal: "नेपाल",

    // Homepage — Hero
    heroTagline: "आजको सही तयारी,",
    heroHighlight: "भोलिको वर्दी!",
    heroSubtitle: "अनुशासन, मेहनत र सही मार्गदर्शन नै सफलताको आधार हो।",
    admissionOpen: "भर्ना खुला",
    admissionYear: "2083/84",
    onlineAdmission: "अनलाइन प्रवेश",
    admissionFormHint: "यो फारम भर्नुहोस्, हामी तुरुन्तै तपाईंको प्रवेश नम्बर बनाइदिन्छौ।",
    nepalPolice: "नेपाल प्रहरी",
    nepaliArmy: "नेपाली सेना",
    apf: "सशस्त्र प्रहरी बल (APF)",
    forestGuard: "वनरक्षक",
    writtenPhysical: "लिखित + शारीरिक तयारी",
    mockTests: "नियमित मक टेस्ट",
    experiencedInstructors: "अनुभवी शिक्षकहरू",
    hostelFacility: "छात्रावास सुविधा",
    applyOnline: "अनलाइन आवेदन दिनुहोस्",
    whatsappNow: "व्हाट्सएप अहिले",
    address: "जनकपुरधम-७, जिरोमाइल चोक",

    // Quick Features
    writtenPreparation: "शैक्षिक कक्षा",
    physicalTraining: "दैनिक अभ्यास",
    regularMockTests: "परीक्षा जस्तो अभ्यास",
    safeHostel: "सुरक्षित आवास",

    // Courses
    ourCourses: "हाम्रा पाठ्यक्रमहरू",
    coursePrompt: "तपाईं कुन सेवाको तयारी गर्दै हुनुहुन्छ ?",
    courseSubtext: "आफ्नो लक्ष्य छान्नुहोस् र आजै तयारी सुरु गर्नुहोस्",
    applyNow: "अब आवेदन गर्नुहोस्",
    officialWebsite: "आधिकारिक वेबसाइट",
    careerDisclaimer:
      "छनोट प्रक्रिया, योग्यता र अंक हरेक भर्ना सूचनासँग फरक हुन्छन् — तल दिइएका आधिकारिक सूचनाबाट निश्चित रूपमा जाँच गर्नुहोस्।",
    careerLoading: "विवरण लोड हुँदैछ…",
    careerSoon: "यस सेवाको विवरण अद्यावधिक हुँदैछ। कृपया पछि फेरि हेर्नुहोस्।",
    careerNotFound: "तपाईंले खोजेको करियर पृष्ठ भेटिएन।",
    exploreOtherServices: "अन्य सेवाहरू हेर्नुहोस्",
    startPrepTitle: "स्टार कोचिङसँग तयारी सुरु गर्नुहोस्",
    startPrepText: "चारै सेवाका लागि लिखित + शारीरिक + अन्तर्वार्ता तालिम।",
    jumpTo: "यस पृष्ठमा",
    secPosts: "उपलब्ध पदहरू",
    secEligibility: "योग्यता",
    secSelection: "छनोट प्रक्रिया",
    secWritten: "लिखित परीक्षा",
    secPhysical: "शारीरिक परीक्षण",
    secPattern: "परीक्षा ढाँचा",
    secSyllabus: "पाठ्यक्रम",
    secQuestions: "पुराना प्रश्नपत्र",
    secPrep: "तयारी सामग्री",
    secFaq: "बारम्बार सोधिने प्रश्नहरू",
    secNotices: "आधिकारिक सूचनाहरू",
    backToHome: "गृहपृष्ठ",
    careerGuidesEyebrow: "करियर निर्देशिका",
    viewCourses: "पाठ्यक्रम हेर्नुहोस्",
    gotIt: "बुझियो",
    policeDesc: "देश र जनताको सुरक्षाका लागि गौरवमय सेवा",
    armyDesc: "राष्ट्रको रक्षा, हामो प्रतिबद्धता",
    apfDesc: "सीमा सुरक्षा, शान्ति र सम्प्रदायका लागि",
    forestDesc: "प्रकृति संरक्षण, सुरक्षित भविष्य",
    viewDetails: "विवरण हेर्नुहोस्",
    satisfiedStudents: "सन्तुष्ट विद्यार्थी",
    selections: "छनोटमा सफलता",
    yearsExperience: "वर्षको अनुभव",
    trustedInstitute: "विश्वस्नीय संस्था",
    yourDreamOurGuidance: "तपाईंको सपना, हाम्रो मार्गदर्शन!!",
    applyToday: "आजै आवेदन गर्नुहोस्",
    preparationTodaySuccessTomorrow: "तयारी आज, सफलता भोलि",

    // Why Choose Us
    whyChooseUs: "हामीलाई किन छनोट गर्ने?",
    whyChooseStar: "किन छनोट गर्ने <span class='text-brand-red'>Star Coaching</span>?",
    whySubtext: "तपाईंको लक्ष्य हाम्रो जिम्मेवारी । उत्कृष्ट तयारी, उज्ज्वल भविष्य",
    writtenPhysicalPrep: "लिखित + शारीरिक तयारी",
    writtenPhysicalNepali: "लिखित र शारीरिक दुवै तयारी",
    experiencedInstructorsNepali: "अनुभवी र दक्ष शिक्षकहरू",
    regularMockTestsNepali: "नियमित मक टेस्ट",
    examFocusedClasses: "परीक्षा केन्द्रित कक्षा",
    examFocusedNepali: "परीक्षा केन्द्रित अध्यापन",
    dailyPhysicalTraining: "दैनिक शारीरिक अभ्यास",
    dailyPhysicalNepali: "दैनिक शारीरिक अभ्यास",
    hostelFacilityNepali: "छात्र/छात्राका लागि सुरक्षित आवास",
    writtenClasses: "लिखित कक्षा",
    nepaliEnglishMath: "नेपाली | अंग्रेजी | गणित | सेवा-सम्बन्धित",
    comprehensivePrep: "पाठ्यक्रम अनुसार व्यापक तयारी",
    exploreWrittenClasses: "लिखित कक्षा हेर्नुहोस्",
    physicalTrainingDetail: "शारीरिक तयारी",
    runningPushupSitup: "दौड | पुश-अप | सिट-अप | चिन-अप | 3200m",
    physicalPrepAsPerStandard: "तोलिको मापदण्ड अनुसार शारीरिक तयारी",
    explorePhysicalTraining: "शारीरिक तयारी हेर्नुहोस्",
    managingDirector: "व्यवस्थापक निर्देशक",
    mdQuote:
      "अनुशासन, मेहनत र सही मार्गदर्शन नै सफलताको आधार हो। आज आफ्नो भविष्य सुरक्षित गर्नुहोस्।",

    // Online Classes
    onlineClasses: "अनलाइन कक्षा",
    anytimeAnywhereSameQuality: "कहीं पनि | कहिले पनि | उही गुणस्तर",
    prepareFromHome: "घरमै बसेर STAR बाट तयारी गर्नुहोस्",
    liveClass: "प्रत्यक्ष कक्षा",
    sangathanSanchana: "संगठन संरचना",
    karyaAdhikarJimmewari: "कार्य, अधिकार र जिम्मेवारी",
    sewaAnushasan: "सेवा, अनुशासन",
    mahatwapurnPrashna: "महत्वपूर्ण प्रश्नहरू",
    liveOnlineClasses: "प्रत्यक्ष अनलाइन कक्षा",
    liveOnlineDesc: "अनुभवी शिक्षकहरूसँग अन्तरक्रियात्मक कक्षा",
    recordedClasses: "रेकर्ड कक्षा",
    recordedDesc: "समीक्षाका लागि कहिले पनि हेर्नुहोस्",
    pdfNotes: "PDF नोट र अध्ययन सामग्री",
    pdfNotesDesc: "राम्रोसँग व्यवस्थित, परीक्षा केन्द्रित नोटहरू",
    onlineMockTests: "अनलाइन मक टेस्ट",
    onlineMockDesc: "वास्तविक परीक्षा जस्तै अभ्यास गर्नुहोस्",
    teacherSupport: "शिक्षक सहयोग",
    teacherSupportDesc: "कुनै पनि समय आफ्ना प्रश्नहरू सोध्नुहोस्",
    mobileLaptopFriendly: "मोबाइल + ल्यापटप मैत्री",
    mobileLaptopDesc: "कुनै पनि उपकरणमा, जहाँ पनि सिक्नुहोस्",
    ourOnlineCourses: "हाम्रा अनलाइन पाठ्यक्रमहरू",
    prepareBrighterTomorrow: "उज्ज्वल भविष्यको लागि तयारी गर्नुहोस्",
    joinOnlineClass: "अनलाइन कक्षामा सामेल हुनुहोस्",
    whatsappForDetails: "विवरणका लागि व्हाट्सएप गर्नुहोस्",

    // Admission Process
    admissionProcess: "भर्ना प्रक्रिया",
    howToEnroll: "भर्ना कसरी गर्ने ?",
    admissionSubtext: "तपाईंको उज्ज्वल भविष्यको पहिलो कदम, आजै सुरु गर्नुहोस्",
    courseSelect: "कोर्स छनोट",
    courseSelectDesc: "आफ्नो लक्ष्य अनुसार कोर्स छान्नुहोस्",
    formFill: "फर्म भर्नुहोस्",
    formFillDesc: "अनलाइन वा अफलाइन भर्ना फर्म भर्नुहोस्",
    admissionConfirm: "भर्ना पक्का",
    admissionConfirmDesc: "आवश्यक कागजात बुझाएर भर्ना सुनिश्चित गर्नुहोस्",
    startYourAdmission: "भर्ना सुरु गर्नुहोस्",

    // Student Success
    studentSuccess: "हाम्रो विद्यार्थी सफलता",
    ourStudentOurPride: "हाम्रो विद्यार्थी, हाम्रो गौरव",
    successStoriesSubtext: "हर्जालका सफलताका कथा, अब तपाईंको पालो!",
    selectedFor: "मा चयन",

    // Gallery
    galleryInsideStar: "ग्यालरी / Star भित्रका दृश्य",
    gallerySubtext: "हाम्रा गतिविधिहरूका केही झल्कहरू",
    viewMore: "थप हेर्नुहोस्",
    browseByCategory: "श्रेणीअनुसार खोज्नुहोस्",
    classroomSessions: "कक्षा कक्ष",
    physicalTrainingGallery: "शारीरिक तालिम",
    mockTestGallery: "मक टेस्ट",
    hostelFacilityGallery: "छात्रावास सुविधा",
    eventsAndPrograms: "कार्यक्रमहरू",
    studentLife: "विद्यार्थी जीवन",

    // Instructors
    ourInstructors: "हाम्रा शिक्षकहरू",
    instructorsSubtext: "अनुभवी र समर्पित शिक्षकहरू",
    viewAllInstructors: "सबै शिक्षकहरू हेर्नुहोस्",
    mathematics: "गणित",
    generalKnowledge: "सामान्य ज्ञान",
    english: "अंग्रेजी",
    physicalTrainingInstructor: "शारीरिक तालिम",

    // Hostel
    hostelAvailable: "छात्रावास उपलब्ध",
    hostelSubtext: "सुरक्षित, सुविधाजनक र अध्ययनमैत्री वातावरण",
    starHostel: "STAR छात्रावास",
    safeStayBetterTomorrow: "सुरक्षित बास • उज्ज्वल भविष्य",
    separateHostel: "छोरा र छोरीका लागि छुट्टाछुट्टै छात्रावास",
    cleanRooms: "सफा र सुखद कोठाहरू",
    nutritiousMeals: "पौष्टिक खाना (मेस सुविधा)",
    security247: "२४/७ सुरक्षा र सिसीटिभी",
    peacefulEnvironment: "अध्ययनका लागि शान्त वातावरण",
    nearToInstitute: "संस्थान नजिकै",
    contactForDetails: "विवरणका लागि सम्पर्क गर्नुहोस्",

    // Reviews
    studentReviews: "विद्यार्थी समीक्षा",
    whatStudentsSay: "हाम्रा विद्यार्थीहरू के भन्छन्",
    reviewsSubtext: "हर्जाला विद्यार्थीका विश्वास, सफलताको यात्रा",

    // Contact page
    ourLocation: "हाम्रो स्थान",
    locationSubtext: "जिरोमाइल, जनकपुरधम-७, धनुषा · मधेश प्रदेश — कार्यालय समयमा सिधै आउन सकिन्छ।",
    emailLabel: "इमेल",
    followUsCard: "फलो गर्नुहोस्",
    sendMessageTitle: "हामीलाई सन्देश पठाउनुहोस्",
    sendMessageSub: "फारम भर्नुहोस्, हाम्रो टोलीले एक कामदिनभित्र सम्पर्क गर्नेछ।",
    fullNameLabel: "पूरा नाम *",
    yourNamePlaceholder: "तपाईंको नाम",
    phoneLabel: "फोन *",
    courseInterest: "रुचि रहेको पाठ्यक्रम",
    coursePlaceholder: "जस्तै: स्टाफ नर्स / HA",
    messageLabel: "सन्देश",
    howCanWeHelp: "हामी कसरी मद्दत गर्न सक्छौं?",
    sendLabel: "सन्देश पठाउनुहोस्",
    sendingLabel: "पठाउँदै...",
    messageSentToast: "सन्देश पठाइयो! हाम्रो टोलीले छिट्टै सम्पर्क गर्नेछ।",
    messageErrorToast: "सन्देश पठाउन सकिएन। कृपया पुनः प्रयास गर्नुहोस्।",
    messageRequiredToast: "कृपया आफ्नो नाम र फोन नम्बर राख्नुहोस्।",

    // Courses & Gallery (shared filters / labels)
    allFilter: "सबै",
    allPhotos: "सबै फोटोहरू",
    galleryPhotoCount: "{count} फोटो ग्यालरीमा",
    starCoachingMoment: "Star Coaching को क्षण",
    searchCoursesPlaceholder: "पाठ्यक्रम खोज्नुहोस् (जस्तै प्रहरी, नर्स, डिप्लोमा…)",
    noCoursesMatch: "तपाईंको खोजसँग मेल खाने पाठ्यक्रम भेटिएन",
    noCoursesMatchSub:
      "फरक कीवर्ड वा श्रेणी प्रयास गर्नुहोस् वा हामीलाई सम्पर्क गर्नुहोस् — हामी सही पाठ्यक्रम बताउन सक्छौं।",
    talkToUs: "हामीलाई सोध्नुहोस्",
    courseOne: "पाठ्यक्रम",
    courseMany: "पाठ्यक्रमहरू",
    seatsLabel: "सिटहरू",
    eligibilityLabel: "योग्यता",
    applyForCourse: "यस पाठ्यक्रमका लागि आवेदन गर्नुहोस्",

    // Results page
    resultsHeroEyebrow: "बधाई छ सिताराहरू",
    resultsHeroTitle: "हाम्रा उत्कृष्ट चयनहरू",
    resultsHeroSub: "वास्तविक विद्यार्थी, वास्तविक पद। नेपालभरका हाम्रा हालका सफलताहरूको झलक।",
    searchResultsPlaceholder: "विद्यार्थी, उपलब्धि, ट्याग खोज्नुहोस्...",
    allAchievements: "सबै उपलब्धिहरू",
    allCategories: "सबै श्रेणीहरू",
    allYears: "सबै वर्षहरू",
    allBatches: "सबै बैचहरू",
    resultsLoadError: "नतिजा लोड गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।",
    noSelectionsYet: "अहिलेसम्म कुनै चयन नतिजा उपलब्ध छैन।",

    // Notices page
    noticesHeroEyebrow: "अद्यावधिक रहनुहोस्",
    noticesHeroTitle: "सूचनाहरू र कार्यक्रमहरू",
    noticesHeroSub:
      "स्टार कोचिङ इन्स्टिट्युटबाट आधिकारिक सूचनाहरू — परीक्षा, भर्ना, छात्रवृत्ति, शुल्क र कार्यक्रमहरू, लाइभ अद्यावधिक।",
    noticesSearchPlaceholder: "सूचना खोज्नुहोस्...",
    noticesEmpty: "अहिलेसम्म कुनै सूचना प्रकाशित भएको छैन। फेरि हेर्दैगर्नुहोस्!",
    newBadge: "नयाँ",
    generalNotice: "संस्थागत सूचना",
    latestNotices: "ताजा सूचनाहरू",
    latestNoticesSub:
      "स्टार कोचिङ इन्स्टिट्युटका आधिकारिक घोषणाहरू — एडमिन ड्यासबोर्डबाट प्रत्यक्ष प्रकाशित।",
    viewAllNotices: "सबै सूचना हेर्नुहोस्",
    aboutSectionTitle: "संस्थाको परिचय",
    exploreAbout: "थप पढ्नुहोस्",

    // FAQ
    faqs: "प्रश्नहरू",
    faqHeading: "अक्सर सोधिने प्रश्नहरू",
    faqSubtext: "तपाईंको प्रश्न, हाम्रो स्पष्ट उत्तर",
    faq1Q: "Star Coaching Institute मा कुन-कुन कोर्सहरूको तयारी गराइन्छ?",
    faq1A:
      "हामी नेपाली सेना, नेपाल प्रहरी, सशस्त्र प्रहरी बल (APF), वनरक्षक लगायत विभिन्न सरकारी सेवाको प्रतियोगितामा परीक्षाको लिखित, शारीरिक र अन्य तयारी गराइन्छ।",
    faq2Q: "कक्षाहरू Offline मात्र हो कि Online पनि हुन्छ?",
    faq2A: "हामीले Offline र Online दुवै मोडमा कक्षाहरू सञ्चालन गर्छौं।",
    faq3Q: "Mock Test कति पटक गरिन्छ?",
    faq3A: "हामीले नियमित रूपमा साप्ताहिक र मासिक Mock Test गराइन्छ।",
    faq4Q: "Hostel Facility छ छैन?",
    faq4A: "हो, हामीसँग छात्र र छात्राहरूका लागि सुरक्षित छात्रावास सुविधा छ।",
    faq5Q: "कसरी Admission लिन सकिन्छ?",
    faq5A:
      "तपाईं हाम्रो वेबसाइटबाट Online आवेदन गर्न सक्नुहुन्छ वा हाम्रो केन्द्रमा भौतिक रूपमा भिजिट गर्न सक्नुहुन्छ।",

    // Contact
    visitUs: "हामीलाई भेट्नुहोस्",
    contactSubtext: "तपाईंको उज्ज्वल भविष्यको लागि आजै सम्पर्क गर्नुहोस्",
    addressLabel: "ठेगाना",
    phoneNumbers: "फोन नम्बरहरू",
    whatsappContact: "WhatsApp मा सम्पर्क गर्नुहोस्",
    whatsappNowBtn: "WhatsApp अहिले",
    callNow: "फोन",
    breakingNews: "ब्रेकिङ न्यूज",
    noticesAndResults: "सूचना र नतिजा",
    resultLabel: "नतिजा",
    timing: "समय",
    timingHours: "बिहान ६:०० – साँझ ६:००",
    viewLargerMap: "ठूलो नक्सा हेर्नुहोस्",

    // Footer
    footerTagline: "तपाईंको लक्ष्य, हाम्रो प्रतिबद्धता",
    footerSubtext: "आजको तयारी, भोलिको वर्दी",
    followUs: "हामीलाई फलो गर्नुहोस्",
    todayPrepTomorrowUniform: "आजको सही तयारी, भोलिको वर्दी!",

    // Courses Page
    coursesHeroTitle: "हरेक कोर्स, एउटा केन्द्रित संस्था",
    coursesHeroSub:
      "सुरक्षा सेवादेखि प्राविधिक र विद्यालय शिक्षासम्म — तपाईंको करियर अनुसार बाटो छान्नुहोस्",

    // About Page
    aboutHeroTitle: "नेपालको भविष्य निर्माण — एक विद्यार्थीको समयमा।",
    aboutHeroSub:
      "स्टार कोचिङ इन्स्टिच्युट प्रा. लि. जनकपुरधाममा आधारित कोचिङ इन्स्टिच्युट हो जुन सुरक्षा बल, लोकसेवा, चिकित्सा, प्राविधिक र विद्यालय शिक्षामा विशेषज्ञ छ।",
    ourHistory: "हाम्रो इतिहास",
    historyBody:
      "सन् {year} देखि, स्टार कोचिङ इन्स्टिच्युटले मधेश प्रदेश र त्यसभन्दा बाहिरका हजारौं विद्यार्थीहरूलाई नेपाल प्रहरी, नेपाली सेना, सशस्त्र प्रहरी बल, लोकसेवा आयोग, स्टाफ नर्स, HA, CMA/ANM, इन्जिनियरिङ डिप्लोमा र कम्प्युटर तालिममा सफल बनाउँदै आएको छ।",
    mdMessageAbout: "व्यवस्थापक निर्देशकको सन्देश",
    vision: "दृष्टिकोण",
    visionBody:
      "सरकारी सेवा तयारी र करियर-केन्द्रित प्राविधिक शिक्षाका लागि नेपालको सबैभन्दा विश्वसनीय कोचिङ इन्स्टिच्युट बन्ने।",
    mission: "मिशन",
    missionBody:
      "वास्तविक सेवाको पृष्ठभूमिका भएका शिक्षकहरूसँग अनुशासित, नतिजा-केन्द्रित कोचिङ प्रदान गर्ने, इमानदार मार्गदर्शन र योग्य विद्यार्थीहरूका लागि छात्रवृत्ति सहित पूर्ण सहयोग।",
    achievements: "उपलब्धिहरू",
    achievementsBody:
      "नेपाल प्रहरी, सेना, APF, स्टाफ नर्स, HA र इन्जिनियरिङ डिप्लोमा कार्यक्रममा 800+ छनोट — हरेक वर्ष प्रदेश टपरहरूसहित।",
    ourTeam: "हाम्रो टोली",
    teamSubtext:
      "वास्तविक सेवा पृष्ठभूमिका भएका अनुभवी शिक्षकहरू, समर्पित समन्वयकहरू र शारीरिक प्रशिक्षकहरूको मिश्रण।",
    viewAllFaculty: "सबै शिक्षकहरू हेर्नुहोस्",

    // About page (hero → breadcrumb → परिचय → लक्ष्य, per owner reference)
    aboutPageTitle: "हाम्रो बारेमा",
    breadcrumbHome: "मुख्य पृष्ठ",
    aboutIntroTitle: "हाम्रो परिचय",
    aboutIntroBody:
      "Star Coaching Institute Pvt. Ltd. जनकपुरधाममा स्थापित एक अनुभवी र विश्वसनीय प्रशिक्षण संस्था हो। नेपाल प्रहरी, नेपाल सेना, सशस्त्र प्रहरी बल, लोक सेवा आयोग, स्वास्थ्य तथा प्राविधिक तर्फका विभिन्न तयारी कक्षाहरू सञ्चालन गर्दै हामी विद्यार्थीहरूलाई अनुशासन, गुणस्तर र परिश्रमका आधारमा सफलतात्मक तयारी दिइरहेका छौं। जनकपुरधाम-७, जिरोमाइल चोकमा अवस्थित हाम्रो संस्थामा अनुभवी प्रशिक्षक, आधुनिक अध्ययन सामग्री, पुस्तकालय, कम्प्युटरल्याब र शारीरिक प्रशिक्षणको पूर्ण व्यवस्था छ। विद्यार्थीहरूका लागि छात्रावास तथा खानाको व्यवस्था पनि उपलब्ध छ।",
    aboutGoalsTitle: "हाम्रो लक्ष्य",
    aboutGoal1: "गुणस्तरीय शिक्षा र उत्कृष्ट प्रशिक्षण",
    aboutGoal2: "समर्पित र अनुभवी प्रशिक्षकहरू",
    aboutGoal3: "विद्यार्थीको उज्ज्वल भविष्य",
    registerTitle: "रजिस्टर",
    progressCardTitle: "विद्यार्थी प्रगतिरिपोर्ट कार्ड",
    progressCardSub:
      "भर्ना भएका प्रत्येक विद्यार्थीलाई विषयगत अङ्क, ग्रेड, उपस्थिति र कक्षा शिक्षकको टिप्पणी सहितको प्रगतिरिपोर्ट कार्ड छापिएर दिइन्छ।",

    // Faculty Page
    facultyHeroTitle: "वास्तविक विशेषज्ञहरूबाट सिक्नुहोस्",
    facultyHeroSub:
      "विषय विशेषज्ञ, शारीरिक प्रशिक्षक र मार्गदर्शकहरूको टोली — धेरैजसो वास्तविक सेवा पृष्ठभूमिकाबाट।",

    // Gallery Page
    lifeAtStar: "स्टारमा जीवन",
    galleryHeroTitle: "फोटो ग्यालरी",
    galleryHeroSub: "वास्तविक विद्यार्थी, वास्तविक पद। नेपाभरका हाम्रा साम्प्रतिक छनोटको झल्को।",
    galleryEmpty: "ग्यालरी फोटोहरू थपिँदै छन्। फेरि जाँच गर्नुहोस्।",
  },
  hi: {
    Home: "होम",
    About: "हमारे बारे में",
    Courses: "पाठ्यक्रम",
    "Preparation Portal": "तैयारी पोर्टल",
    Faculty: "शिक्षकगण",
    Results: "परिणाम",
    Notices: "सूचनाएं",
    Gallery: "गैलरी",
    Contact: "संपर्क",
    Enquiry: "पूछताछ",
    Admission: "प्रवेश",
    "Apply Now": "अभी आवेदन करें",
    "Student Login": "छात्र लॉगिन",
    Dashboard: "डैशबोर्ड",
    "Admin Panel": "एडमिन पैनल",
    "Sign out": "साइन आउट",
    "Quick Links": "त्वरित लिंक",
    "Get Started": "शुरू करें",
    "Online Admission": "ऑनलाइन प्रवेश",
    "Contact Us": "संपर्क करें",
    "All rights reserved": "सर्वाधिकार सुरक्षित",
    "Powered by": "द्वारा संचालित",
    "Welcome Back": "वापसी पर स्वागत है",
    "Sign In": "साइन इन",
    "Sign Up": "साइन अप",
    Email: "ईमेल",
    Password: "पासवर्ड",
    "Remember me": "मुझे याद रखें",
    "Forgot Password?": "पासवर्ड भूल गए?",
    "Quick Demo Access": "त्वरित डेमो एक्सेस",
    "Preview each role's dashboard": "प्रत्येक भूमिका का डैशबोर्ड देखें",
    Nepal: "नेपाल",

    // Homepage — Hero
    heroTagline: "आज की सही तैयारी,",
    heroHighlight: "कल की वर्दी!",
    heroSubtitle: "अनुशासन, मेहनत और सही मार्गदर्शन ही सफलता की नींव है।",
    admissionOpen: "प्रवेश खुला",
    admissionYear: "2083/84",
    onlineAdmission: "ऑनलाइन प्रवेश",
    admissionFormHint: "यह फ़ॉर्म भरें, हम तुरंत आपका प्रवेश नंबर बना देंगे।",
    nepalPolice: "नेपाल पुलिस",
    nepaliArmy: "नेपाली सेना",
    apf: "सशस्त्र पुलिस बल (APF)",
    forestGuard: "वनरक्षक",
    writtenPhysical: "लिखित + शारीरिक",
    mockTests: "मॉक टेस्ट",
    applyOnline: "ऑनलाइन आवेदन करें",
    whatsappNow: "व्हाट्सएप अभी",
    address: "ज़ेरोमाइल, जनकपुरधाम-7, धनुषा, नेपाल",
    preparationTodaySuccessTomorrow: "आज की तैयारी, कल की सफलता",
    starCoaching: "स्टार कोचिंग",
    institutePvtLtd: "इंस्टिट्यूट प्रा. लि.",

    // Quick Features
    writtenPreparation: "लिखित तैयारी",
    physicalTraining: "शारीरिक प्रशिक्षण",
    regularMockTests: "नियमित मॉक टेस्ट",
    safeHostel: "सुरक्षित छात्रावास",

    // Courses Section
    ourCourses: "हमारे पाठ्यक्रम",
    coursePrompt: "आप किस सेवा की तैयारी कर रहे हैं?",
    courseSubtext: "अपना लक्ष्य चुनें और आज ही तैयारी शुरू करें",
    applyNow: "अभी आवेदन करें",
    officialWebsite: "आधिकारिक वेबसाइट",
    careerDisclaimer:
      "चयन चरण, पात्रता और अंक हर भर्ती सूचना के साथ बदलते हैं — हमेशा नीचे दिए आधिकारिक लिंक से पुष्टि करें।",
    careerLoading: "विवरण लोड हो रहा है…",
    careerSoon: "इस सेवा का विवरण अपडेट हो रहा है। कृपया बाद में देखें।",
    careerNotFound: "आपका खोजा गया करियर पेज नहीं मिला।",
    exploreOtherServices: "अन्य सेवाएं देखें",
    startPrepTitle: "स्टार कोचिंग के साथ तैयारी शुरू करें",
    startPrepText: "चारों सेवाओं के लिए लिखित + शारीरिक + साक्षात्कार कोचिंग।",
    jumpTo: "इस पेज पर",
    secPosts: "उपलब्ध पद",
    secEligibility: "पात्रता",
    secSelection: "चयन प्रक्रिया",
    secWritten: "लिखित परीक्षा",
    secPhysical: "शारीरिक परीक्षण",
    secPattern: "परीक्षा पैटर्न",
    secSyllabus: "पाठ्यक्रम",
    secQuestions: "पिछले प्रश्नपत्र",
    secPrep: "तैयारी सामग्री",
    secFaq: "अक्सर पूछे जाने वाले प्रश्न",
    secNotices: "आधिकारिक सूचनाएं",
    backToHome: "होम",
    careerGuidesEyebrow: "करियर गाइड",
    viewCourses: "पाठ्यक्रम देखें",
    gotIt: "समझ गया",
    policeDesc: "देश और जनता की सुरक्षा के लिए गौरवशाली सेवा",
    armyDesc: "राष्ट्र की रक्षा, हमारी प्रतिबद्धता",
    apfDesc: "सीमा सुरक्षा, शांति और सामुदायिक सेवा",
    forestDesc: "प्रकृति संरक्षण, सुरक्षित भविष्य",
    viewDetails: "विवरण देखें",

    // Stats
    satisfiedStudents: "संतुष्ट छात्र",
    selections: "चयन",
    yearsExperience: "वर्षों का अनुभव",
    trustedInstitute: "विश्वसनीय संस्थान",

    // CTA Banner
    yourDreamOurGuidance: "आपका सपना, हमारा मार्गदर्शन!!",
    applyToday: "आज ही आवेदन करें",

    // Why Choose Us
    whyChooseUs: "हमें क्यों चुनें",
    whyChooseStar: "स्टार कोचिंग क्यों चुनें?",
    whySubtext: "आपका लक्ष्य हमारी जिम्मेदारी। उत्कृष्ट तैयारी, उज्ज्वल भविष्य",
    writtenPhysicalPrep: "लिखित + शारीरिक तैयारी",
    writtenPhysicalNepali: "लिखित और शारीरिक दोनों की तैयारी",
    experiencedInstructors: "अनुभवी प्रशिक्षक",
    experiencedInstructorsNepali: "अनुभवी और कुशल शिक्षक",
    regularMockTestsNepali: "नियमित मॉक टेस्ट",
    examFocusedClasses: "परीक्षा केंद्रित कक्षाएं",
    examFocusedNepali: "परीक्षा केंद्रित शिक्षण",
    dailyPhysicalTraining: "दैनिक शारीरिक प्रशिक्षण",
    dailyPhysicalNepali: "रोज़ शारीरिक अभ्यास",
    dailyPhysicalTrainingNepali: "दैनिक शारीरिक अभ्यास",
    hostelFacility: "छात्रावास सुविधा",
    hostelFacilityNepali: "छात्रों के लिए सुरक्षित आवास",

    // Written vs Physical
    writtenClasses: "लिखित कक्षाएं",
    nepaliEnglishMath: "नेपाली | अंग्रेजी | गणित | सेवा-संबंधित",
    comprehensivePrep: "पाठ्यक्रम के अनुसार व्यापक तैयारी",
    exploreWrittenClasses: "लिखित कक्षाएं देखें",
    physicalTrainingDetail: "शारीरिक प्रशिक्षण",
    runningPushupSitup: "दौड | पुश-अप | सिट-अप | चिन-अप | 3200m",
    physicalPrepAsPerStandard: "मानक के अनुसार शारीरिक तैयारी",
    explorePhysicalTraining: "शारीरिक प्रशिक्षण देखें",

    // MD Message
    managingDirector: "प्रबंध निदेशक",
    mdQuote: "अनुशासन, मेहनत और सही मार्गदर्शन ही सफलता की नींव है। आज अपना भविष्य सुरक्षित करें।",

    // Online Classes
    onlineClasses: "ऑनलाइन कक्षाएं",
    anytimeAnywhereSameQuality: "कभी भी | कहीं भी | वही गुणवत्ता",
    prepareFromHome: "घर से STAR के साथ तैयारी करें",
    liveClass: "लाइव क्लास",
    sangathanSanchana: "संगठनात्मक संरचना",
    karyaAdhikarJimmewari: "कार्य, अधिकार और जिम्मेदारी",
    sewaAnushasan: "सेवा, अनुशासन",
    mahatwapurnPrashna: "महत्वपूर्ण प्रश्न",

    // Online Features
    liveOnlineClasses: "लाइव ऑनलाइन कक्षाएं",
    liveOnlineDesc: "विशेषज्ञ शिक्षकों के साथ इंटरैक्टिव कक्षाएं",
    recordedClasses: "रिकॉर्डेड कक्षाएं",
    recordedDesc: "कभी भी रिविजन के लिए देखें",
    pdfNotes: "PDF नोट्स और अध्ययन सामग्री",
    pdfNotesDesc: "अच्छी तरह से संरचित, परीक्षा केंद्रित नोट्स",
    onlineMockTests: "ऑनलाइन मॉक टेस्ट",
    onlineMockDesc: "वास्तविक परीक्षा जैसा अभ्यास",
    teacherSupport: "शिक्षक सहायता",
    teacherSupportDesc: "कभी भी अपनी शंका दूर करें",
    mobileLaptopFriendly: "मोबाइल + लैपटॉप अनुकूल",
    mobileLaptopDesc: "किसी भी डिवाइस पर, कहीं भी सीखें",
    ourOnlineCourses: "हमारे ऑनलाइन पाठ्यक्रम",
    prepareBrighterTomorrow: "उज्ज्वल भविष्य के लिए तैयारी करें",
    joinOnlineClass: "ऑनलाइन कक्षा में शामिल हों",
    whatsappForDetails: "विवरण के लिए व्हाट्सएप करें",

    // Admission Process
    admissionProcess: "प्रवेश प्रक्रिया",
    howToEnroll: "कैसे दाखिला लें?",
    admissionSubtext: "आपके उज्ज्वल भविष्य का पहला कदम, आज ही शुरू करें",
    courseSelect: "पाठ्यक्रम चुनें",
    courseSelectDesc: "अपने लक्ष्य के अनुसार पाठ्यक्रम चुनें",
    formFill: "फॉर्म भरें",
    formFillDesc: "ऑनलाइन या ऑफलाइन प्रवेश फॉर्म भरें",
    admissionConfirm: "प्रवेश पक्का",
    admissionConfirmDesc: "आवश्यक दस्तावेज जमा करके प्रवेश की पुष्टि करें",
    startYourAdmission: "अपना प्रवेश शुरू करें",

    // Student Success
    studentSuccess: "छात्र सफलता",
    ourStudentOurPride: "हमारे छात्र, हमारा गौरव",
    successStoriesSubtext: "पिछले वर्षों की सफलता की कहानियां, अब आपकी बारी!",
    selectedFor: "में चयनित",

    // Gallery
    galleryInsideStar: "गैलरी / स्टार कोचिंग के अंदर",
    gallerySubtext: "हमारी गतिविधियों की एक झलक",
    viewMore: "और देखें",
    browseByCategory: "श्रेणी के अनुसार खोजें",
    classroomSessions: "कक्षा सत्र",
    physicalTrainingGallery: "शारीरिक प्रशिक्षण",
    mockTestGallery: "मॉक टेस्ट",
    hostelFacilityGallery: "छात्रावास सुविधा",
    eventsAndPrograms: "कार्यक्रम और आयोजन",
    studentLife: "छात्र जीवन",

    // Instructors
    ourInstructors: "हमारे शिक्षक",
    instructorsSubtext: "अनुभवी और समर्पित शिक्षक",
    viewAllInstructors: "सभी शिक्षक देखें",
    mathematics: "गणित",
    generalKnowledge: "सामान्य ज्ञान",
    english: "अंग्रेजी",
    physicalTrainingInstructor: "शारीरिक प्रशिक्षण",

    // Hostel
    hostelAvailable: "छात्रावास सुविधा उपलब्ध",
    hostelSubtext: "सुरक्षित, आरामदायक और अध्ययन-अनुकूल वातावरण",
    starHostel: "स्टार छात्रावास",
    safeStayBetterTomorrow: "सुरक्षित ठहराव · बेहतर भविष्य",
    separateHostel: "लड़कों और लड़कियों के लिए अलग छात्रावास",
    cleanRooms: "साफ और आरामदायक कमरे",
    nutritiousMeals: "पौष्टिक भोजन (मेस सुविधा)",
    security247: "24/7 सुरक्षा और CCTV",
    peacefulEnvironment: "अध्ययन के लिए शांत वातावरण",
    nearToInstitute: "संस्थान के पास",
    contactForDetails: "विवरण के लिए संपर्क करें",

    // Reviews
    studentReviews: "छात्र समीक्षा",
    whatStudentsSay: "हमारे छात्र क्या कहते हैं",
    reviewsSubtext: "पिछले छात्रों का भरोसा, सफलता की यात्रा",

    // Contact page
    ourLocation: "हमारा स्थान",
    locationSubtext:
      "ज़रोमाइल, जनकपुरधम-७, धनुषा · मधेश प्रांत — कार्यालय के समय में सीधे आ सकते हैं।",
    emailLabel: "ईमेल",
    followUsCard: "फ़ॉलो करें",
    sendMessageTitle: "हमें संदेश भेजें",
    sendMessageSub: "फ़ॉर्म भरें, हमारी टीम एक कार्य दिन के भीतर आपसे संपर्क करेगी।",
    fullNameLabel: "पूरा नाम *",
    yourNamePlaceholder: "आपका नाम",
    phoneLabel: "फ़ोन *",
    courseInterest: "रुचि वाला कोर्स",
    coursePlaceholder: "जैसे: स्टाफ नर्स / HA",
    messageLabel: "संदेश",
    howCanWeHelp: "हम कैसे आपकी मदद कर सकते हैं?",
    sendLabel: "संदेश भेजें",
    sendingLabel: "भेज रहे हैं...",
    messageSentToast: "संदेश भेजा गया! हमारी टीम जल्द ही आपसे संपर्क करेगी।",
    messageErrorToast: "संदेश नहीं भेजा जा सका। कृपया पुनः प्रयास करें।",
    messageRequiredToast: "कृपया अपना नाम और फ़ोन नंबर दर्ज करें।",

    // Courses & Gallery (shared filters / labels)
    allFilter: "सभी",
    allPhotos: "सभी फ़ोटो",
    galleryPhotoCount: "गैलरी में {count} फ़ोटो",
    starCoachingMoment: "Star Coaching पल",
    searchCoursesPlaceholder: "पाठ्यक्रम खोजें (जैसे पुलिस, नर्स, डिप्लोमा…)",
    noCoursesMatch: "आपकी खोज से मेल खाते कोर्स नहीं मिले",
    noCoursesMatchSub:
      "दूसरा कीवर्ड या श्रेणी आज़माएं या हमसे संपर्क करें — हम सही कोर्स बता सकते हैं।",
    talkToUs: "हमसे बात करें",
    courseOne: "कोर्स",
    courseMany: "कोर्स",
    seatsLabel: "सीटें",
    eligibilityLabel: "पात्रता",
    applyForCourse: "इस कोर्स के लिए आवेदन करें",

    // Results page
    resultsHeroEyebrow: "बधाई हो सितारों",
    resultsHeroTitle: "हमारे श्रेष्ठ चयन",
    resultsHeroSub: "वास्तविक छात्र, वास्तविक पद। नेपाल भर हमारी हाल की सफलताओं की एक झलक।",
    searchResultsPlaceholder: "छात्र, उपलब्धि, टैग खोजें...",
    allAchievements: "सभी उपलब्धियां",
    allCategories: "सभी श्रेणियां",
    allYears: "सभी वर्ष",
    allBatches: "सभी बैच",
    resultsLoadError: "परिणाम लोड नहीं हो सके। कृपया पुनः प्रयास करें।",
    noSelectionsYet: "अभी तक कोई चयन परिणाम उपलब्ध नहीं है।",

    // Notices page
    noticesHeroEyebrow: "अपडेट रहें",
    noticesHeroTitle: "सूचनाएं और कार्यक्रम",
    noticesHeroSub:
      "स्टार कोचिंग इंस्टीट्यूट से आधिकारिक घोषणाएं — परीक्षा, प्रवेश, छात्रवृत्ति, शुल्क और कार्यक्रम, लाइव अपडेट के साथ।",
    noticesSearchPlaceholder: "सूचनाएं खोजें...",
    noticesEmpty: "अभी तक कोई सूचना प्रकाशित नहीं हुई है। जल्द देखें!",
    newBadge: "नई",
    generalNotice: "संस्थागत सूचना",
    latestNotices: "ताज़ा सूचनाएं",
    latestNoticesSub:
      "स्टार कोचिंग इंस्टीट्यूट की आधिकारिक घोषणाएं — एडमिन डैशबोर्ड से सीधे प्रकाशित।",
    viewAllNotices: "सभी सूचनाएं देखें",
    aboutSectionTitle: "संस्था के बारे में",
    exploreAbout: "और पढ़ें",

    // FAQ
    faqs: "अक्सर पूछे जाने वाले प्रश्न",
    faqHeading: "अक्सर पूछे जाने वाले प्रश्न",
    faqSubtext: "आपके प्रश्न, हमारे स्पष्ट उत्तर",
    faq1Q: "स्टार कोचिंग इंस्टिट्यूट में कौन-कौन से पाठ्यक्रम उपलब्ध हैं?",
    faq1A:
      "हम नेपाली सेना, नेपाल पुलिस, सशस्त्र पुलिस बल (APF) और वनरक्षक सहित विभिन्न सरकारी सेवा प्रतियोगिताओं की लिखित, शारीरिक और अन्य तैयारी कराते हैं।",
    faq2Q: "कक्षाएं केवल ऑफलाइन हैं या ऑनलाइन भी होती हैं?",
    faq2A: "हम ऑफलाइन और ऑनलाइन दोनों मोड में कक्षाएं संचालित करते हैं।",
    faq3Q: "मॉक टेस्ट कितनी बार होता है?",
    faq3A: "हम नियमित रूप से साप्ताहिक और मासिक मॉक टेस्ट आयोजित करते हैं।",
    faq4Q: "क्या छात्रावास सुविधा उपलब्ध है?",
    faq4A: "हां, हमारे पास लड़कों और लड़कियों के लिए सुरक्षित छात्रावास सुविधा है।",
    faq5Q: "प्रवेश कैसे ले सकते हैं?",
    faq5A:
      "आप हमारी वेबसाइट से ऑनलाइन आवेदन कर सकते हैं या हमारे केंद्र में व्यक्तिगत रूप से आ सकते हैं।",

    // Contact
    visitUs: "हमसे मिलें",
    contactSubtext: "अपने उज्ज्वल भविष्य के लिए आज ही संपर्क करें",
    addressLabel: "पता",
    phoneNumbers: "फोन नंबर",
    whatsappContact: "व्हाट्सएप पर संपर्क करें",
    whatsappNowBtn: "अभी व्हाट्सएप करें",
    callNow: "कॉल",
    breakingNews: "ब्रेकिंग न्यूज़",
    noticesAndResults: "सूचना और नतीजे",
    resultLabel: "नतीजा",
    timing: "समय",
    timingHours: "सुबह 6:00 – शाम 6:00",
    viewLargerMap: "बड़ा नक्शा देखें",

    // Footer
    footerTagline: "आपका लक्ष्य, हमारी प्रतिबद्धता",
    footerSubtext: "आज की तैयारी, कल की वर्दी",
    followUs: "हमें फॉलो करें",
    todayPrepTomorrowUniform: "आज की सही तैयारी, कल की वर्दी!",

    // Courses Page
    coursesHeroTitle: "हर पाठ्यक्रम, एक केंद्रित संस्थान",
    coursesHeroSub:
      "सुरक्षा सेवा से लेकर चिकित्सा, तकनीकी और स्कूल शिक्षा तक — अपने करियर के अनुसार राह चुनें।",

    // About Page
    aboutHeroTitle: "नेपाल के भविष्य का निर्माण — एक छात्र के समय में।",
    aboutHeroSub:
      "स्टार कोचिंग इंस्टिट्यूट प्रा. लि. जनकपुरधाम में स्थित एक कोचिंग संस्थान है जो सुरक्षा बल, लोकसेवा, चिकित्सा, तकनीकी और स्कूल शिक्षा में विशेषज्ञ है।",
    ourHistory: "हमारा इतिहास",
    historyBody:
      "सन् {year} से, स्टार कोचिंग इंस्टिट्यूट मधेश प्रदेश और उससे बाहर के हजारों छात्रों को नेपाल पुलिस, नेपाली सेना, सशस्त्र पुलिस बल, लोकसेवा आयोग, स्टाफ नर्स, HA, CMA/ANM, इंजीनियरिंग डिप्लोमा और कंप्यूटर प्रशिक्षण में सफल बना रहा है।",
    mdMessageAbout: "प्रबंध निदेशक का संदेश",
    vision: "दृष्टि",
    visionBody:
      "सरकारी सेवा की तैयारी और करियर-केंद्रित तकनीकी शिक्षा के लिए नेपाल की सबसे विश्वसनीय कोचिंग संस्था बनने का।",
    mission: "मिशन",
    missionBody:
      "वास्तविक सेवा की पृष्ठभूमि वाले शिक्षकों के साथ अनुशासित, परिणाम-केंद्रित कोचिंग प्रदान करना, ईमानदार मार्गदर्शन और योग्य छात्रों के लिए छात्रवृत्ति सहित पूर्ण सहायता।",
    achievements: "उपलब्धियां",
    achievementsBody:
      "नेपाल पुलिस, सेना, APF, स्टाफ नर्स, HA और इंजीनियरिंग डिप्लोमा कार्यक्रमों में 800+ चयन — हर साल प्रांत टॉपर्स के साथ।",
    ourTeam: "हमारी टीम",
    teamSubtext:
      "वास्तविक सेवा पृष्ठभूमि वाले अनुभवी शिक्षक, समर्पित समन्वयक और शारीरिक प्रशिक्षकों का मिश्रण।",
    viewAllFaculty: "सभी शिक्षक देखें",

    // About page (hero → breadcrumb → परिचय → लक्ष्य)
    aboutPageTitle: "हमारे बारे में",
    breadcrumbHome: "मुख पृष्ठ",
    aboutIntroTitle: "हमारा परिचय",
    aboutIntroBody:
      "Star Coaching Institute Pvt. Ltd. जनकपुरधाम में स्थापित एक अनुभवी और भरोसेमंद प्रशिक्षण संस्था है। नेपाल पुलिस, नेपाल सेना, सशस्त्र पुलिस बल, लोक सेवा आयोग, चिकित्सा तथा प्राविधिक तैयारी कक्षाएँ चलाकर हम अनुशासन, गुणवत्ता और परिश्रम के आधार पर विद्यार्थियों को सफलता की तैयारी दे रहे हैं। जनकपुरधाम-७, जीरोमाइल चौक में स्थित हमारे संस्थान में अनुभवी प्रशिक्षक, आधुनिक अध्ययन सामग्री, पुस्तकालय, कंप्यूटर लैब और शारीरिक प्रशिक्षण की पूर्ण व्यवस्था है। विद्यार्थियों के लिए छात्रावास तथा भोजन की व्यवस्था भी उपलब्ध है।",
    aboutGoalsTitle: "हमारा लक्ष्य",
    aboutGoal1: "गुणवत्तापूर्ण शिक्षा और उत्कृष्ट प्रशिक्षण",
    aboutGoal2: "समर्पित और अनुभवी प्रशिक्षक",
    aboutGoal3: "विद्यार्थी का उज्ज्वल भविष्य",
    registerTitle: "रजिस्टर",
    progressCardTitle: "छात्र प्रगति कार्ड",
    progressCardSub:
      "प्रवेश पाए हर छात्र को विषयवार अंक, ग्रेड, उपस्थिति और कक्षा शिक्षक की टिप्पणी सहित प्रगति रिपोर्ट कार्ड छापा जाता है।",

    // Faculty Page
    facultyHeroTitle: "वास्तविक विशेषज्ञों से सीखें",
    facultyHeroSub:
      "विषय विशेषज्ञ, शारीरिक प्रशिक्षक और मेंटर की टीम — कई वास्तविक सेवा पृष्ठभूमि से।",

    // Gallery Page
    lifeAtStar: "स्टार में जीवन",
    galleryHeroTitle: "फोटो गैलरी",
    galleryHeroSub: "वास्तविक छात्र, वास्तविक पद। नेपाल भर के हमारे हाल के चयनों की एक झलक।",
    galleryEmpty: "गैलरी फोटो जोड़े जा रहे हैं। जल्द ही वापस देखें।",
  },
};

function getDefaultLang(): Lang {
  try {
    const saved = localStorage.getItem("app_lang");
    if (saved === "en" || saved === "ne" || saved === "hi") return saved;
  } catch {
    // localStorage unavailable — default to English
  }
  return "ne"; // Default to Nepali like the images
}

type LangContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

export const LangContext = createContext<LangContextType>({
  lang: "ne",
  setLang: () => {},
  t: (k: string) => k,
});

export function useLanguage() {
  return useContext(LangContext);
}

export function useLanguageState() {
  const [lang, setLangState] = useState<Lang>(getDefaultLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("app_lang", l);
    } catch {
      // localStorage unavailable — ignore persistence failure
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || key;
    },
    [lang],
  );

  return { lang, setLang, t };
}
