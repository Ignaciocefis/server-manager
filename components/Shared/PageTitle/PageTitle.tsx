import { PageTitleProps } from "./PageTitle.types";

export function PageTitle({ title, children }: PageTitleProps) {
  return (
    <div className="bg-gray-app-100 rounded-lg px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-app-600">{title}</h2>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
