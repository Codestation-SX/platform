import * as React from "react";

import Typography from "@mui/material/Typography";
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from "@/components/core/Accordion";
import { LessonModules } from "@/types/lesson";
import ListingLesson from "./ListingLesson";
import { Box } from "@mui/material";

export default function AccordionLesson({
  lessonModules,
  onSelectLesson,
}: {
  lessonModules: LessonModules;
  onSelectLesson?: (videoUrl: string) => void;
}) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      event.stopPropagation();
      setExpandedItems((prev) =>
        isExpanded ? [...prev, panel] : prev.filter((item) => item !== panel)
      );
    };

  return (
    <Box>
      {lessonModules.map((module) => (
        <Accordion
          key={module.id}
          expanded={expandedItems.includes(module.id)}
          onChange={handleChange(module.id)}
        >
          <AccordionSummary
            aria-controls={`${module.id}-content`}
            id={`${module.id}-header`}
          >
            <Typography component="span">{module.title}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <ListingLesson
              lessons={module.lessons}
              onSelectLesson={onSelectLesson}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
