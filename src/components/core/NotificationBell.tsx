"use client";

import { useEffect, useState } from "react";
import { Badge, IconButton, Tooltip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/backoffice/matriculas-pendentes/count");
        if (res.ok) {
          const data = await res.json();
          setCount(data.count ?? 0);
        }
      } catch {
        // silencioso
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 60 * 1000); // atualiza a cada 1 min
    return () => clearInterval(interval);
  }, []);

  return (
    <Tooltip title={count > 0 ? `${count} matrícula(s) pendente(s)` : "Sem matrículas pendentes"}>
      <IconButton
        color="inherit"
        onClick={() => router.push("/backoffice/matriculas-pendentes")}
      >
        <Badge badgeContent={count > 0 ? count : undefined} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
