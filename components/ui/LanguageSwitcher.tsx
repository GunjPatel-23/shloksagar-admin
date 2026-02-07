import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

interface LanguageSwitcherProps {
  currentLanguage: "hindi" | "gujarati" | "english";
  onLanguageChange: (lang: "hindi" | "gujarati" | "english") => void;
}

export const LanguageSwitcher = ({
  currentLanguage,
  onLanguageChange,
}: LanguageSwitcherProps) => {
  const languages = [
    { id: "hindi" as const, label: "हिंदी", short: "हि" },
    { id: "gujarati" as const, label: "ગુજરાતી", short: "ગુ" },
    { id: "english" as const, label: "English", short: "En" },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
      <Languages className="w-5 h-5 text-muted-foreground ml-2" />
      {languages.map((lang) => (
        <Button
          key={lang.id}
          variant={currentLanguage === lang.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onLanguageChange(lang.id)}
          className={`text-base font-medium px-4 ${
            currentLanguage === lang.id
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <span className="hidden sm:inline">{lang.label}</span>
          <span className="sm:hidden">{lang.short}</span>
        </Button>
      ))}
    </div>
  );
};
