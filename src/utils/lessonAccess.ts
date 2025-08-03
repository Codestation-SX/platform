// utils/lessonAccess.ts
import { Session } from "next-auth";
import { Lesson } from "@/types/lesson"; // ajuste se necessário

export function isLessonAccessible(
  lesson: Lesson,
  session: Session | null
): boolean {
  if (!session) return false;

  const isAdmin = session.user.role === "admin";
  const isFree = lesson.isFree;

  if (isAdmin) return true;

  const hasContractValidated =
    session.user.contract?.isSigned && session.user.contract?.isValidated;
  const hasPaymentConfirmed = session.user.payment?.status === "CONFIRMED";

  return isFree || (hasContractValidated && hasPaymentConfirmed);
}
