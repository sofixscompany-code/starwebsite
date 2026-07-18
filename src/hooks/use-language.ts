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
  en: {},
  ne: {
    "Home": "गृहपृष्ठ",
    "About": "हाम्रो बारे",
    "Courses": "पाठ्यक्रमहरू",
    "Faculty": "शिक्षकहरू",
    "Results": "नतिजाहरू",
    "Gallery": "ग्यालरी",
    "Contact": "सम्पर्क",
    "Admission": "भर्ना",
    "Apply Now": "अहिले नै आवेदन दिनुहोस्",
    "Student Login": "विद्यार्थी लगइन",
    "Dashboard": "ड्यासबोर्ड",
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
    "Email": "इमेल",
    "Password": "पासवर्ड",
    "Remember me": "मलाई सम्झनुहोस्",
    "Forgot Password?": "पासवर्ड बिर्सनुभयो?",
    "Quick Demo Access": "द्रुत डेमो पहुँच",
    "Preview each role's dashboard": "प्रत्येक भूमिकाको ड्यासबोर्ड हेर्नुहोस्",
    "Nepal": "नेपाल",
  },
  hi: {
    "Home": "होम",
    "About": "हमारे बारे में",
    "Courses": "पाठ्यक्रम",
    "Faculty": "शिक्षकगण",
    "Results": "परिणाम",
    "Gallery": "गैलरी",
    "Contact": "संपर्क",
    "Admission": "प्रवेश",
    "Apply Now": "अभी आवेदन करें",
    "Student Login": "छात्र लॉगिन",
    "Dashboard": "डैशबोर्ड",
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
    "Email": "ईमेल",
    "Password": "पासवर्ड",
    "Remember me": "मुझे याद रखें",
    "Forgot Password?": "पासवर्ड भूल गए?",
    "Quick Demo Access": "त्वरित डेमो एक्सेस",
    "Preview each role's dashboard": "प्रत्येक भूमिका का डैशबोर्ड देखें",
    "Nepal": "भारत",
  },
};

function getDefaultLang(): Lang {
  try {
    const saved = localStorage.getItem("app_lang");
    if (saved === "en" || saved === "ne" || saved === "hi") return saved;
  } catch {}
  return "en";
}

type LangContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

export const LangContext = createContext<LangContextType>({
  lang: "en",
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
    try { localStorage.setItem("app_lang", l); } catch {}
  }, []);

  const t = useCallback(
    (key: string): string => {
      if (lang === "en") return key;
      return TRANSLATIONS[lang]?.[key] || key;
    },
    [lang]
  );

  return { lang, setLang, t };
}
