// UnitsBackofficePage.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Snackbar,
  Typography,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import useSWR from "swr";

import BackofficeTable, {
  PaginatedDataGridHandle,
} from "@/components/core/PaginatedDataGrid";
import DeleteConfirmationModal from "@/components/core/DeleteConfirmationModal";
import UnitModal from "./UnitModal";
import { api } from "@/lib/api";

type Classroom = { id: string; name: string };

export default function UnitsBackofficePage() {
  const gridRef = useRef<PaginatedDataGridHandle>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [snack, setSnack] = useState<{
    open: boolean;
    type: "success" | "error";
    msg: string;
  }>({ open: false, type: "success", msg: "" });

  // ✅ Carrega turmas
  const { data: classrooms } = useSWR<Classroom[]>(
    "/api/backoffice/classrooms",
    async (url: string) => {
      const res = await api.get(url);
      return res.data;
    }
  );

  async function handleUpdateUnitClassroom(unitId: string, classroomId: string | null) {
    try {
      await api.put(`/api/backoffice/units/${unitId}/classroom`, { classroomId });
      setSnack({ open: true, type: "success", msg: "Turma do módulo atualizada!" });
      gridRef.current?.refetch?.();
    } catch (e) {
      setSnack({ open: true, type: "error", msg: "Erro ao atualizar turma do módulo." });
    }
  }

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "title", headerName: "Título", flex: 1 },
      { field: "description", headerName: "Descrição", flex: 1 },

      // ✅ NOVA COLUNA: Turma
      {
        field: "classroomId",
        headerName: "Turma",
        width: 220,
        sortable: false,
        renderCell: ({ row }) => (
          <FormControl size="small" fullWidth>
            <Select
              value={row.classroomId ?? ""}
              displayEmpty
              onChange={(e) => {
                const value = e.target.value as string;
                handleUpdateUnitClassroom(row.id, value ? value : null);
              }}
              renderValue={(selected) => {
                if (!selected) return <em>Sem turma</em>;
                const found = classrooms?.find((c) => c.id === selected);
                return found?.name ?? "Turma";
              }}
            >
              <MenuItem value="">
                <em>Sem turma</em>
              </MenuItem>

              {(classrooms ?? []).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ),
      },

      {
        field: "actions",
        headerName: "Ações",
        width: 180,
        sortable: false,
        renderCell: (params) => (
          <>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setSelectedId(params.row.id);
                setIsOpen(true);
              }}
            >
              Editar
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => setDeleteId(params.row.id)}
              sx={{ ml: 1 }}
            >
              Excluir
            </Button>
          </>
        ),
      },
    ],
    [classrooms]
  );

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Gerenciar Módulos de aula
        </Typography>
        <Button onClick={() => setIsOpen(true)} variant="contained" sx={{ mb: 2 }}>
          Novo módulo
        </Button>
      </Box>

      <BackofficeTable ref={gridRef} columns={columns} endpoint="/api/backoffice/units" />

      {isOpen && (
        <UnitModal
          id={selectedId}
          open={isOpen}
          onClose={() => {
            setSelectedId(undefined);
            setIsOpen(false);
          }}
          onSaved={() => {
            gridRef.current?.refetch();
            setIsOpen(false);
          }}
        />
      )}

      {deleteId && (
        <DeleteConfirmationModal
          title="Excluir Unidade"
          description="Tem certeza que deseja excluir esta unidade?"
          onClose={() => setDeleteId(null)}
          onConfirm={async () => {
            await api.delete(`/api/backoffice/units?id=${deleteId}`).finally(() => {
              gridRef.current?.refetch();
            });
            setDeleteId(null);
          }}
        />
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
