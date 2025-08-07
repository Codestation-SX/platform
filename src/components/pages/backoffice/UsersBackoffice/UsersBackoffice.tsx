// UsersBackofficePage.tsx
"use client";
import { GridColDef } from "@mui/x-data-grid";
import { Box, Button, Typography } from "@mui/material";
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

  const columns: GridColDef[] = [
    { field: "firstName", headerName: "Nome", flex: 1 },
    { field: "lastName", headerName: "Sobrenome", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "role",
      headerName: "Função",
      width: 150,
      renderCell: ({ row }) => (row.role === "student" ? "Aluno" : "ADMIN"),
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
            onClick={() => {
              setDeleteId(params.row.id);
            }}
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

      <BackofficeTable columns={columns} endpoint="/api/backoffice/users" />

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
