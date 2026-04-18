import type { Navigation } from "@toolpad/core/AppProvider";
import BookIcon from "@mui/icons-material/Book";
import PersonIcon from "@mui/icons-material/Person";
import ViewModule from "@mui/icons-material/ViewModule";
import PlayLessonIcon from "@mui/icons-material/PlayLesson";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import QuizIcon from "@mui/icons-material/Quiz";
import GradeIcon from "@mui/icons-material/Grade";
import GroupsIcon from "@mui/icons-material/Groups";
import SensorsIcon from "@mui/icons-material/Sensors";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SettingsIcon from "@mui/icons-material/Settings";
import SchoolIcon from "@mui/icons-material/School";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

export const NAVIGATION_BACKOFFICE: Navigation = [
  {
    segment: "backoffice",
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  { kind: "divider" },
  {
    kind: "header",
    title: "Gestão",
  },
  {
    segment: "backoffice/users",
    title: "Usuários",
    icon: <PersonIcon />,
  },
  {
    segment: "backoffice/matriculas-novas",
    title: "Matrículas Novas",
    icon: <FiberNewIcon />,
  },
  {
    segment: "backoffice/matriculas",
    title: "Matrículas Admin",
    icon: <SchoolIcon />,
  },
  {
    segment: "backoffice/turmas",
    title: "Turmas",
    icon: <GroupsIcon />,
  },
  {
    segment: "backoffice/presenca",
    title: "Presença",
    icon: <SensorsIcon />,
  },
  {
    segment: "backoffice/units",
    title: "Módulos",
    icon: <ViewModule />,
  },
  {
    segment: "backoffice/lessons",
    title: "Aulas",
    icon: <PlayLessonIcon />,
  },
  { kind: "divider" },
  {
    kind: "header",
    title: "Financeiro",
  },
  {
    segment: "backoffice/payments",
    title: "Pagamentos",
    icon: <PaymentIcon />,
  },
  {
    segment: "backoffice/matriculas-pendentes",
    title: "Matrículas Pendentes",
    icon: <HourglassEmptyIcon />,
  },
  {
    segment: "backoffice/configuracoes",
    title: "Valor do Curso",
    icon: <SettingsIcon />,
  },
  { kind: "divider" },
  {
    kind: "header",
    title: "Avaliações",
  },
  {
    segment: "backoffice/provas",
    title: "Provas",
    icon: <HistoryEduIcon />,
  },
  {
    segment: "backoffice/notas",
    title: "Notas",
    icon: <GradeIcon />,
  },
  {
    segment: "backoffice/certificados",
    title: "Certificados",
    icon: <WorkspacePremiumIcon />,
  },
];

export const NAVIGATION_STUDENT: Navigation = [
  {
    kind: "header",
    title: "Aluno",
  },
  {
    segment: "painel/aulas",
    title: "Aulas",
    icon: <BookIcon />,
  },
  {
    segment: "painel/provas",
    title: "Provas",
    icon: <QuizIcon />,
  },
  {
    segment: "painel/notas",
    title: "Minhas notas",
    icon: <GradeIcon />,
  },
  {
    segment: "painel/certificados",
    title: "Meu Certificado",
    icon: <WorkspacePremiumIcon />,
  },
];
