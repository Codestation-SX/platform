import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useSession } from "next-auth/react";

import { Lessons } from "@/types/lesson";
import { isLessonAccessible } from "@/utils/lessonAccess";

type Props = {
  lessons?: Lessons;
  onSelectLesson?: (videoUrl: string) => void;
};

export default function ListingLesson({ lessons = [], onSelectLesson }: Props) {
  const { data: session } = useSession();

  return (
    <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
      {lessons.map((lesson, index) => {
        const canView = isLessonAccessible(lesson, session);
        const labelId = `lesson-${lesson.id}`;
        const title = `${index + 1} - ${lesson.title || "Aula sem título"}`;

        return (
          <ListItem
            key={lesson.id}
            sx={{
              width: "100%",
              p: 0,
              "& .MuiButtonBase-root": { p: "16px!important" },
            }}
          >
            <ListItemButton
              onClick={() => canView && onSelectLesson?.(lesson.videoUrl)}
              sx={{ width: "100%", p: 2 }}
              disabled={!canView}
            >
              <ListItemText
                id={labelId}
                primary={
                  <>
                    {title}
                    {lesson.isFree ? (
                      <Chip
                        label="Gratuita"
                        size="small"
                        sx={{ ml: 1 }}
                        color="success"
                      />
                    ) : !canView ? (
                      <LockOutlinedIcon
                        fontSize="small"
                        color="disabled"
                        sx={{ ml: 1 }}
                        titleAccess="Aula paga"
                      />
                    ) : null}
                  </>
                }
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
