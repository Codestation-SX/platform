import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AccordionLesson from "./AccordionLesson";
import { LessonModules } from "@/types/lesson";
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  [key: string]: unknown;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function TabsLesson({
  lessonModules,
  onSelectLesson,
}: {
  lessonModules: LessonModules;
  onSelectLesson?: (videoUrl: string) => void;
}) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          <Tab label="Visão geral" {...a11yProps(0)} />
          <Tab label="Conteúdo do curso" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        Domine testes de software com nossos cursos online. Acesse conteúdos
        atualizados, práticos e focados no mercado de QA.
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <AccordionLesson
          lessonModules={lessonModules}
          onSelectLesson={onSelectLesson}
        />
      </CustomTabPanel>
    </Box>
  );
}
