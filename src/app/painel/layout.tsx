"use client";
import * as React from "react";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { AppProvider } from "@toolpad/core/AppProvider";
import { NAVIGATION_STUDENT } from "@/core/navigation";
import { theme } from "@/theme";
import ColorModeSelect from "@/theme/ColorModeIconDropdown";
import { Stack } from "@mui/material";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import SidebarFooterAccount from "@/components/core/SidebarFooterAccount";
import { signIn, signOut, useSession } from "next-auth/react";

function CustomToolbarActions() {
  return (
    <Stack direction="row" alignItems="center">
      {/* <ColorModeSelect /> */}
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
    signOut: () => signOut({ callbackUrl: "/login" }),
  };

  return (
    <AppProvider
      navigation={NAVIGATION_STUDENT}
      theme={theme}
      router={toolpadRouter}
      authentication={authentication}
      session={status === "loading" ? undefined : data}
    >
      <DashboardLayout
        branding={{
          logo: false,
          title: "Área do aluno",
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
  );
}
