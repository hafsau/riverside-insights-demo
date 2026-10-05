import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentReport } from "@/components/educator/student-report";
import { getStudent, STUDENTS } from "@/lib/data/roster";

export function generateStaticParams() {
  return STUDENTS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/educator/[id]">): Promise<Metadata> {
  const { id } = await params;
  const s = getStudent(id);
  return { title: s ? `${s.name}: score report` : "Student not found" };
}

export default async function StudentPage({ params }: PageProps<"/educator/[id]">) {
  const { id } = await params;
  if (!getStudent(id)) notFound();
  return <StudentReport id={id} />;
}
