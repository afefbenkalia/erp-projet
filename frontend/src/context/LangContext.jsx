import { createContext, useContext, useState } from "react";
import { translations } from "../i18n/translations";

export const LangContext = createContext();

export default function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("erp_lang") || "fr";
  });

  const toggleLang = () => {
    const next = lang === "fr" ? "en" : "fr";
    localStorage.setItem("erp_lang", next);
    setLang(next);
  };

  const t = (key) => {
    const keys = key.split(".");
    let result = translations[lang];
    for (const k of keys) {
      result = result?.[k];
    }
    return result ?? key;
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);