export type FeatureSlide = {
  id: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  buttonType?: "solid" | "outline" | "ghost";
  image?: string;
  desktopImage?: string;
  mobileImage?: string;
  overlay?: number;
  alignment?: "left" | "center" | "right";
  duration?: number;
  accent: string;
  status?: "published" | "draft";
};

export const featuredSlides: FeatureSlide[] = [
  {
    id: "feature-admission",
    kicker: "Admission Open",
    title: "Admissions Open for 2083/84 B.S.",
    subtitle:
      "Kickstart your Police, Army, Loksewa, Medical & Technical entrance preparation with Star Coaching Institute.",
    ctaText: "Apply Online",
    ctaLink: "/admission",
    image: "/images/hero/feature-1.svg",
    accent: "from-blue-800 via-navy to-navy",
    alignment: "left",
    buttonType: "solid",
  },
  {
    id: "feature-uniform",
    kicker: "Uniform Services",
    title: "Police • Army • APF Coaching",
    subtitle:
      "Structured written & physical preparation for Nepal Police, Nepal Army and Armed Police Force.",
    ctaText: "Explore Courses",
    ctaLink: "/courses",
    image: "/images/hero/feature-3.svg",
    accent: "from-indigo-800 via-navy to-blue-900",
    alignment: "left",
    buttonType: "solid",
  },
  {
    id: "feature-entrance",
    kicker: "Entrance Preparation",
    title: "Loksewa • Medical • Technical",
    subtitle:
      "Naxa & entrance-focused curriculum with regular mock tests, hostel facility and expert doubt sessions.",
    ctaText: "Browse Courses",
    ctaLink: "/courses",
    image: "/images/hero/feature-4.svg",
    accent: "from-navy via-blue-800 to-sky-900",
    alignment: "left",
    buttonType: "solid",
  },
  {
    id: "feature-results",
    kicker: "Our Results",
    title: "5,000+ Students Trained, 800+ Top Selections",
    subtitle: "A legacy of success built with discipline, mentorship and trust in Janakpurdham.",
    ctaText: "See Results",
    ctaLink: "/results",
    image: "/images/hero/feature-5.svg",
    accent: "from-sky-700 via-navy to-navy",
    alignment: "left",
    buttonType: "solid",
  },
];
