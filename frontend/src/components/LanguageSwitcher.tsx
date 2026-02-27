import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex space-x-2">
      <button
        className={`text-xs px-2 py-1 rounded ${i18n.language === "es" ? "font-bold bg-white text-blue-800" : ""}`}
        onClick={() => changeLanguage("es")}
      >
        ES
      </button>
      <button
        className={`text-xs px-2 py-1 rounded ${i18n.language === "ru" ? "font-bold bg-white text-blue-800" : ""}`}
        onClick={() => changeLanguage("ru")}
      >
        RU
      </button>
    </div>
  );
}
