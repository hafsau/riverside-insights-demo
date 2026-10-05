import type { Metadata } from "next";
import { ClassResults } from "@/components/educator/class-results";

export const metadata: Metadata = {
  title: "Educator: class results",
  description: "A CogAT-style class score report designed for decisions in seconds: who to review for the talent pool, which scores to check first, and how to group for instruction.",
};

export default function EducatorPage() {
  return <ClassResults />;
}
