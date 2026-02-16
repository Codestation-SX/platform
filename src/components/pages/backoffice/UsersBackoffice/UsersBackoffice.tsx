// UsersBackofficePage.tsx
"use client";

import { GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
} from "@mui/material";
import BackofficeTable, {
  PaginatedDataGridHandle,
} from "@/components/core/PaginatedDataGrid";
import UserModal from "./UserModal";
import DeleteUserModal from "./DeleteUserModal";
import { useMemo, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import { api } from "@/lib/api"; // ✅ ajuste se necessário

type Classroom = { id: string; name: string };

export function UsersBackofficePage() {
  const gridRef = useRef<PaginatedDataGridHandle>(null);

  const [selectedId, setSelectedId] = useState<string>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  async function handleUpdateUserClassroom(
    userId: string,
    classroomId: string | null
  ) {
    try {
      await api.put(`/api/backoffice/users/${userId}/classroom`, {
        classroomId,
      });
  
      // ✅ CORREÇÃO DO BUG (linha MAIS IMPORTANTE)
      await mutate("/api/backoffice/users");
  
      setSnack({
        open: true,
        type: "success",
        msg: "Turma do aluno atualizada!",
      });
    } catch (e) {
      setSnack({
        open: true,
        type: "error",
        msg: "Erro ao atualizar turma do aluno.",
      });
    }
  }
  

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "firstName", headerName: "Nome", flex: 1 },
      { field: "lastName", headerName: "Sobrenome", flex: 1 },
      { field: "email", headerName: "Email", flex: 1 },
      {
        field: "role",
        headerName: "Função",
        width: 150,
        renderCell: ({ row }) => (row.role === "student" ? "Aluno" : "ADMIN"),
      },

      // ✅ NOVA COLUNA: Turma
      {
        field: "classroomId",
        headerName: "Turma",
        width: 220,
        sortable: false,
        renderCell: ({ row }) => {
          const isStudent = row.role === "student";
          if (!isStudent) return "-";

          return (
            <FormControl size="small" fullWidth>
              <Select
                value={row.classroomId ?? ""}
                displayEmpty
                onChange={(e) => {
                  const value = e.target.value as string;
                  handleUpdateUserClassroom(row.id, value ? value : null);
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
          );
        },
      },

      {
        field: "paymentDeferred",
        headerName: "Pós-Emprego",
        width: 150,
        renderCell: ({ row }) => (row.paymentDeferred ? "Sim" : "Não"),
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
          Gerenciar Usuários
        </Typography>
        <Button onClick={() => setIsOpen(true)} variant="contained" sx={{ mb: 2 }}>
          Novo Usuário
        </Button>
      </Box>

      {/* ✅ IMPORTANTE: passar ref pra tabela conseguir refetch */}
      <BackofficeTable ref={gridRef} columns={columns} endpoint="/api/backoffice/users" />

      {isOpen && (
        <UserModal
          id={selectedId}
          onClose={() => {
            setSelectedId(undefined);
            setIsOpen(false);
          }}
          onSaved={() => {
            gridRef.current?.refetch();
            setSelectedId(undefined);
            setIsOpen(false);
          }}
          open={isOpen}
        />
      )}

      {deleteId && (
        <DeleteUserModal
          id={deleteId}
          onClose={() => setDeleteId(null)}
          onDeleted={() => {
            gridRef.current?.refetch();
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

export default UsersBackofficePage;
