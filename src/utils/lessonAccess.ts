// utils/lessonAccess.ts
import { Session } from "next-auth";
import { Lesson } from "@/types/lesson";

export function isLessonAccessible(
  lesson: Lesson,
  session: Session | null
): boolean {
  if (!session) return false;

  // A API já filtra as aulas por turma e status do aluno.
  // Se a aula apareceu na lista, o aluno tem acesso.
  return true;
}
