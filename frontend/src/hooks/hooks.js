// src/hooks/useTheme.js
// Re-export for convenience — already defined in ThemeContext.jsx
export { useTheme } from "../context/ThemeContext";

// src/hooks/useLang.js
// Re-export for convenience — already defined in LangContext.jsx
export { useLang } from "../context/LangContext";

/*
  Usage in any component:
  
  import { useTheme } from "../hooks/useTheme";
  import { useLang }  from "../hooks/useLang";
  
  const { isDark, toggleTheme } = useTheme();
  const { t, toggleLang, lang } = useLang();
*/