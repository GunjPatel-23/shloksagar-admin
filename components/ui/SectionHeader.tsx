import { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  centered?: boolean;
}

export const SectionHeader = ({
  title,
  subtitle,
  children,
  centered = true,
}: SectionHeaderProps) => {
  return (
    <div className={`mb-10 ${centered ? "text-center" : ""}`}>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle mt-2">{subtitle}</p>}
      <div className={`sacred-divider ${centered ? "" : "mx-0"}`} />
      {children}
    </div>
  );
};
