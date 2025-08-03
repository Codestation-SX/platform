import { EducationLevel } from "./global-options";
export type Role = "student" | "admin";

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  rg: string;
  cpf: string;
  birthDate: Date | string;
  educationLevel: EducationLevel;
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  educationLevel: EducationLevel;
  createdAt: Date;
  updatedAt: Date;
}
