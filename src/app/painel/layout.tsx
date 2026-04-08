"use client";
import * as React from "react";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { AppProvider } from "@toolpad/core/AppProvider";
import { NAVIGATION_STUDENT } from "@/core/navigation";
import { backofficeTheme } from "@/theme/backofficeTheme";
import { Box, Stack, ThemeProvider, CssBaseline } from "@mui/material";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import SidebarFooterAccount from "@/components/core/SidebarFooterAccount";
import { signIn, signOut, useSession } from "next-auth/react";

function CustomToolbarActions() {
  return <Stack direction="row" alignItems="center" />;
}

export default function Layout(props: { children: React.ReactNode }) {
  const { data, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toolpadRouter = {
    pathname,
    searchParams,
    navigate: (url: string | URL) => {
      if (typeof url === "string") {
        router.push(url);
      } else {
        router.push(url.toString());
      }
    },
  };

  const authentication = {
    signIn,
    signOut: () => signOut({ callbackUrl: "/login" }),
  };

  const isPaginaPagamento = pathname === "/painel/pagamento";
  const pagamentoConfirmado = data?.user?.payment?.status === "PAID";
  const pagamentoIsento = (data?.user as any)?.paymentDeferred === true;
  const semAcesso = isPaginaPagamento && !pagamentoConfirmado && !pagamentoIsento;

  if (semAcesso) {
    return (
      <ThemeProvider theme={backofficeTheme}>
        <CssBaseline />
        <div className="backoffice-shell">
          <Box
            sx={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
            }}
          >
            <Box sx={{ mb: 4 }}>
              <span
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 800,
                  fontSize: "20px",
                  letterSpacing: "1px",
                  color: "#63b3ed",
                }}
              >
                CODE<span style={{ color: "#e2e8f0" }}>STATION</span>
              </span>
            </Box>
            {props.children}
          </Box>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <div className="backoffice-shell">
      <AppProvider
        navigation={NAVIGATION_STUDENT}
        theme={backofficeTheme}
        router={toolpadRouter}
        authentication={authentication}
        session={status === "loading" ? undefined : data}
      >
        <DashboardLayout
          branding={{
            logo: (
              <span
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 800,
                  fontSize: "14px",
                  letterSpacing: "1px",
                  color: "#63b3ed",
                }}
              >
                CODE<span style={{ color: "#e2e8f0" }}>STATION</span>
              </span>
            ),
            title: "",
            homeUrl: "/painel",
          }}
          defaultSidebarCollapsed
          slots={{
            toolbarActions: CustomToolbarActions,
            sidebarFooter: SidebarFooterAccount,
          }}
        >
          {props.children}
        </DashboardLayout>
      </AppProvider>
    </div>
  );
}
