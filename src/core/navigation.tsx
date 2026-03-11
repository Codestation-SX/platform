import type { Navigation } from "@toolpad/core/AppProvider";
import BookIcon from "@mui/icons-material/Book";
import PersonIcon from "@mui/icons-material/Person";
import ViewModule from "@mui/icons-material/ViewModule";
import PlayLessonIcon from "@mui/icons-material/PlayLesson";
import GavelIcon from "@mui/icons-material/Gavel";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import QuizIcon from "@mui/icons-material/Quiz";
import GradeIcon from "@mui/icons-material/Grade";
import GroupsIcon from "@mui/icons-material/Groups";

export const NAVIGATION_BACKOFFICE: Navigation = [
  {
    segment: "backoffice/users",
    title: "Usuários",
    icon: <PersonIcon />,
  },
  {
    segment: "backoffice/turmas",
    title: "Turmas",
    icon: <GroupsIcon />,
  },
  {
    segment: "backoffice/units",
    title: "Unidades",
    icon: <ViewModule />,
  },
  {
    segment: "backoffice/lessons",
    title: "Aulas",
    icon: <PlayLessonIcon />,
  },
  {
    segment: "backoffice/contracts",
    title: "Contratos",
    icon: <GavelIcon />,
  },
  {
    segment: "backoffice/payments",
    title: "Pagamentos",
    icon: <PaymentIcon />,
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
];
