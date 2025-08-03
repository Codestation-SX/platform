"use client";
import { Suspense } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import AppTheme from "@/theme/AppTheme";
import { SessionProvider } from "next-auth/react";
import { SnackbarProvider } from "notistack";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <Suspense fallback={<LinearProgress />}>
          <SessionProvider>
            <AppTheme>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <SnackbarProvider
                  maxSnack={3}
                  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                  autoHideDuration={3000}
                  preventDuplicate
                >
                  {children}
                </SnackbarProvider>
              </LocalizationProvider>
            </AppTheme>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
