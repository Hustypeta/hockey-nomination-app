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
    : "max-lg-device:flex-none max-lg-device:overflow-visible";

  return (
    <div
      className={`flex w-full flex-col ${mobileClass} px-4 py-4 sm:px-5 sm:py-5 ${
        fitViewport
          ? "lg-device:h-full lg-device:min-h-0 lg-device:flex-1 lg-device:overflow-y-auto lg-device:overflow-hidden lg-device:px-5 lg-device:py-2.5"
          : ""
      } ${className}`}
    >
      <div
        className={`flex w-full flex-col ${fillMobile ? "flex-1 min-h-0 overflow-hidden" : "max-lg-device:flex-none"} ${
          fitViewport ? "lg-device:min-h-0 lg-device:flex-1 lg-device:overflow-hidden" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
