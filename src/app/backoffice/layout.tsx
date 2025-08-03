"use client";
import * as React from "react";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { AppProvider } from "@toolpad/core/AppProvider";
import { NAVIGATION_BACKOFFICE } from "@/core/navigation";
import { theme } from "@/theme";
import ColorModeSelect from "@/theme/ColorModeIconDropdown";
import { Stack } from "@mui/material";
import SidebarFooterAccount from "@/components/core/SidebarFooterAccount";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function CustomToolbarActions() {
  return (
    <Stack direction="row" alignItems="center">
      <ColorModeSelect />
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
    signOut: () => signOut({ callbackUrl: "/backoffice/login" }),
  };
  return (
    <AppProvider
      navigation={NAVIGATION_BACKOFFICE}
      theme={theme}
      router={toolpadRouter}
      authentication={authentication}
      session={status === "loading" ? undefined : data}
    >
      <DashboardLayout
        branding={{
          logo: false,
          title: "Backoffice",
          homeUrl: "/backoffice",
        }}
        defaultSidebarCollapsed
        slots={{
          sidebarFooter: SidebarFooterAccount,
        }}
      >
        {props.children}
      </DashboardLayout>
    </AppProvider>
  );
}
