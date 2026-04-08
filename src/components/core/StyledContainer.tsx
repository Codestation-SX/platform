// import { useState } from "react";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

export const StyledContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,179,237,0.06) 0%, transparent 70%)",
    backgroundRepeat: "no-repeat",
    backgroundColor: (theme.vars || theme).palette.background.default,
  },
}));

export default StyledContainer;
// This component is a styled container that uses Material-UI's Stack component.
// It applies a height based on the template frame height, adds padding, and sets a background
