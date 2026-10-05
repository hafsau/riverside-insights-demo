import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FamilyReport } from "@/components/educator/family-report";
import { getStudent, STUDENTS } from "@/lib/data/roster";

export function generateStaticParams() {
  return STUDENTS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/educator/[id]/family">): Promise<Metadata> {
  const { id } = await params;
  const s = getStudent(id);
  return { title: s ? `${s.name}: family report` : "Student not found" };
}

export default async function FamilyPage({ params }: PageProps<"/educator/[id]/family">) {
  const { id } = await params;
  if (!getStudent(id)) notFound();
  return <FamilyReport id={id} />;
}
