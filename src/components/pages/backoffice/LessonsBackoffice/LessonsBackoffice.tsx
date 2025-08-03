"use client";

import { useRef, useState } from "react";
import PaginatedDataGrid, {
  PaginatedDataGridHandle,
} from "@/components/core/PaginatedDataGrid";
import { Box, Button, Typography } from "@mui/material";
import LessonModal from "@/components/pages/backoffice/LessonsBackoffice/LessonModal";
import DeleteConfirmationModal from "@/components/core/DeleteConfirmationModal";
import { api } from "@/lib/api";

export default function LessonsBackofficePage() {
  const gridRef = useRef<PaginatedDataGridHandle>(null);

  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <Box sx={{ p: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" gutterBottom>
          Gerenciar Aulas
        </Typography>
        <Button
          onClick={() => setIsOpenCreateModal(true)}
          variant="contained"
          sx={{ mb: 2, alignSelf: "flex-end" }}
        >
          Nova Aula
        </Button>
      </Box>

      <PaginatedDataGrid
        ref={gridRef}
        endpoint="/api/backoffice/lessons"
        columns={[
          { field: "title", headerName: "Título", flex: 1 },
          { field: "duration", headerName: "Duração (s)", width: 130 },
          {
            field: "isFree",
            headerName: "Gratuita?",
            width: 120,
            type: "boolean",
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

                    setIsOpenCreateModal(true);
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
      />

      {isOpenCreateModal && (
        <LessonModal
          id={selectedId}
          open={isOpenCreateModal}
          onSaved={() => {
            gridRef.current?.refetch();
            setSelectedId(undefined);
            setIsOpenCreateModal(false);
          }}
          onClose={() => {
            setSelectedId(undefined);
            setIsOpenCreateModal(false);
          }}
        />
      )}

      <DeleteConfirmationModal
        title="Excluir Aula"
        description="Tem certeza que deseja excluir esta aula?"
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          await api
            .delete(`/api/backoffice/lessons?id=${deleteId}`)
            .then(() => {
              gridRef.current?.refetch();
              setDeleteId(null);
            });
        }}
      />
    </Box>
  );
}
