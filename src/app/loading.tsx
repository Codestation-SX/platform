// app/loading.tsx
"use client";

import { Box, LinearProgress } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{ width: "100%", position: "fixed", top: 0, left: 0, zIndex: 1200 }}
    >
      <LinearProgress />
    </Box>
  );
}
