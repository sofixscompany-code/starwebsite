import { createElement } from "react";
import { useLanguageState, LangContext } from "@/hooks/use-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const langState = useLanguageState();
  return createElement(LangContext.Provider, { value: langState }, children);
}
