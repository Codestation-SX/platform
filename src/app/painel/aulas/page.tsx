"use client";
import useSWR from "swr";
import { api } from "@/lib/api";
import ReactPlayer from "react-player";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import TabsLesson from "@/components/pages/Lessons/components/TabsLesson";
import AccordionLesson from "@/components/pages/Lessons/components/AccordionLesson";
import { LessonModules } from "@/types/lesson";
import { useState } from "react";

export default function Aulas() {
  const { data, isLoading, error } = useSWR<LessonModules>(
    "/api/painel/lessons",
    async (url: string) => {
      const res = await api.get(url);
      return res.data;
    }
  );
  console.log(data);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);

  // Atualiza vídeo ao clicar em uma aula
  const handleSelectLesson = (url: string) => {
    setCurrentVideoUrl(url);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Typography variant="body1" color="error">
        Erro ao carregar aulas.
      </Typography>
    );
  }

  // Primeira aula para autoplay
  const firstLesson = data
    .flatMap((mod) => mod.lessons)
    .find((lesson) => !!lesson.videoUrl);

  const videoUrl = currentVideoUrl || firstLesson?.videoUrl;

  return (
    <Grid container>
      <Grid size={{ xs: 12, md: 8 }}>
        {videoUrl ? (
          <ReactPlayer
            src={videoUrl}
            width="100%"
            height="100%"
            controls
            security="restrict"
            style={{ width: "100%", height: "auto", aspectRatio: "16/9" }}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0,
                  fs: 0,
                  disablekb: 1,
                },
              },
            }}
          />
        ) : (
          <Typography variant="h6" mt={2}>
            Nenhuma aula disponível.
          </Typography>
        )}
        <TabsLesson lessonModules={data} onSelectLesson={handleSelectLesson} />
      </Grid>
      <Grid size="grow" sx={{ display: { xs: "none", md: "block" } }}>
        <AccordionLesson
          lessonModules={data}
          onSelectLesson={handleSelectLesson}
        />
      </Grid>
    </Grid>
  );
}
