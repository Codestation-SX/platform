// UsersBackofficePage.tsx
"use client";
import { GridColDef } from "@mui/x-data-grid";
import { Box, Button, Chip, Typography } from "@mui/material";
import BackofficeTable, {
  PaginatedDataGridHandle,
} from "@/components/core/PaginatedDataGrid";
import UserModal from "./UserModal";
import { useRef, useState } from "react";
import DeleteUserModal from "./DeleteUserModal";

export function UsersBackofficePage() {
  const gridRef = useRef<PaginatedDataGridHandle>(null);

  const [selectedId, setSelectedId] = useState<string>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    setToggling(id);
    try {
      await fetch(`/api/backoffice/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      });
      gridRef.current?.refetch();
    } finally {
      setToggling(null);
    }
  };

  const columns: GridColDef[] = [
    { field: "firstName", headerName: "Nome", flex: 1 },
    { field: "lastName", headerName: "Sobrenome", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "role",
      headerName: "Função",
      width: 120,
      renderCell: ({ row }) => (row.role === "student" ? "Aluno" : "ADMIN"),
    },
    {
      field: "ativo",
      headerName: "Status",
      width: 110,
      renderCell: ({ row }) =>
        row.role === "student" ? (
          <Chip
            label={row.ativo ? "Ativo" : "Inativo"}
            color={row.ativo ? "success" : "default"}
            size="small"
          />
        ) : null,
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 260,
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

          {params.row.role === "student" && (
            <Button
              size="small"
              variant="outlined"
              color={params.row.ativo ? "warning" : "success"}
              disabled={toggling === params.row.id}
              onClick={() => handleToggleAtivo(params.row.id, params.row.ativo)}
              sx={{ ml: 1 }}
            >
              {toggling === params.row.id
                ? "..."
                : params.row.ativo
                ? "Inativar"
                : "Ativar"}
            </Button>
          )}

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
  ];

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" gutterBottom>
          Gerenciar Usuários
        </Typography>
        <Button
          onClick={() => setIsOpen(true)}
          variant="contained"
          sx={{ mb: 2 }}
        >
          Novo Usuário
        </Button>
      </Box>

      <BackofficeTable columns={columns} endpoint="/api/backoffice/users" ref={gridRef} />

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
    </Box>
  );
}
export default UsersBackofficePage;
