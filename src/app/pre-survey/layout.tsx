import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-Survey | Thesis Project",
  description: "Prepare for your entrepreneurship research survey",
};

export default function PreSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      {children}
    </div>
  );
}
