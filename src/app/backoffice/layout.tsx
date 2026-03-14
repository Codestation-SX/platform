"use client";
import * as React from "react";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { AppProvider } from "@toolpad/core/AppProvider";
import { NAVIGATION_BACKOFFICE } from "@/core/navigation";
import { backofficeTheme } from "@/theme/backofficeTheme";
import { Stack } from "@mui/material";
import SidebarFooterAccount from "@/components/core/SidebarFooterAccount";
import NotificationBell from "@/components/core/NotificationBell";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function CustomToolbarActions() {
  return (
    <Stack direction="row" alignItems="center">
      <NotificationBell />
    </Stack>
  );
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
    signOut: () => signOut({ callbackUrl: "/admin/login" }),
  };

  return (
    <div className="backoffice-shell">
      <AppProvider
        navigation={NAVIGATION_BACKOFFICE}
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
            homeUrl: "/backoffice",
          }}
          defaultSidebarCollapsed={false}
          slots={{
            sidebarFooter: SidebarFooterAccount,
            toolbarActions: CustomToolbarActions,
          }}
        >
          {props.children}
        </DashboardLayout>
      </AppProvider>
    </div>
  );
}
