// UnitsBackofficePage.tsx
"use client";
import { useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import BackofficeTable, {
  PaginatedDataGridHandle,
} from "@/components/core/PaginatedDataGrid";
import DeleteConfirmationModal from "@/components/core/DeleteConfirmationModal";
import UnitModal from "./UnitModal";
import { mutate } from "swr";
import { api } from "@/lib/api";

export default function UnitsBackofficePage() {
  const gridRef = useRef<PaginatedDataGridHandle>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" gutterBottom>
          Gerenciar Módulos de aula
        </Typography>
        <Button
          onClick={() => setIsOpen(true)}
          variant="contained"
          sx={{ mb: 2 }}
        >
          Nova módulo
        </Button>
      </Box>
      <BackofficeTable
        ref={gridRef}
        columns={[
          { field: "title", headerName: "Título", flex: 1 },
          { field: "description", headerName: "Descrição", flex: 1 },
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
        ]}
        endpoint="/api/backoffice/units"
      />

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
            await api
              .delete(`/api/backoffice/units?id=${deleteId}`)
              .finally(() => {
                gridRef.current?.refetch(); // Refetch units after deletion
              });

            setDeleteId(null);
          }}
        />
      )}
    </Box>
  );
}
