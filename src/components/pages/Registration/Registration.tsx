"use client";

import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { backofficeTheme } from "@/theme/backofficeTheme";
import RegisterForm from "./components/RegistrationForm";

export default function MatriculaSucesso() {
  return (
    <ThemeProvider theme={backofficeTheme}>
      <CssBaseline />
      <div className="backoffice-shell">
        <RegisterForm />
      </div>
    </ThemeProvider>
  );
}
