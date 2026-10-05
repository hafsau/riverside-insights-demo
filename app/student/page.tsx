import type { Metadata } from "next";
import { StudentSession } from "@/components/student/session";

export const metadata: Metadata = {
  title: "Student: test player",
  description: "An accessible test player for K–2 pre-readers: spoken and captioned prompts, large targets, an answer eliminator, magnification, high contrast, breaks and switch scanning.",
};

export default function StudentPage() {
  return <StudentSession />;
}
