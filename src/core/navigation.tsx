import type { Navigation } from "@toolpad/core/AppProvider";
import BookIcon from "@mui/icons-material/Book";
import PersonIcon from "@mui/icons-material/Person";
import ViewModule from "@mui/icons-material/ViewModule";
import PlayLessonIcon from "@mui/icons-material/PlayLesson";
import GavelIcon from "@mui/icons-material/Gavel";
import PaymentIcon from "@mui/icons-material/Payment";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";

export const NAVIGATION_BACKOFFICE: Navigation = [
  {
    segment: "backoffice/users",
    title: "Usuários",
    icon: <PersonIcon />,
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
];
