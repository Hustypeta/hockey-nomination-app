import type { ReactNode } from "react";

export function FifaAppPage({
  children,
  className = "",
  fitViewport = true,
  fillMobile = false,
}: {
  children: ReactNode;
  className?: string;
  fitViewport?: boolean;
  /** Na mobilu vyplní dostupnou výšku (editor sestavy). Homepage nechte false. */
  fillMobile?: boolean;
}) {
  const mobileClass = fillMobile
    ? "flex-1 min-h-0 overflow-hidden"
    : "max-lg:flex-none max-lg:overflow-visible";

  return (
    <div
      className={`flex w-full flex-col ${mobileClass} px-4 py-4 sm:px-5 sm:py-5 ${
        fitViewport
          ? "lg:h-full lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overflow-hidden lg:px-5 lg:py-2.5"
          : ""
      } ${className}`}
    >
      <div
        className={`flex w-full flex-col ${fillMobile ? "flex-1 min-h-0 overflow-hidden" : "max-lg:flex-none"} ${
          fitViewport ? "lg:min-h-0 lg:flex-1 lg:overflow-hidden" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
