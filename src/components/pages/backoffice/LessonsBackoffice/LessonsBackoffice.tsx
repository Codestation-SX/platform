"use client";

import { useRef, useState } from "react";
import PaginatedDataGrid, {
  PaginatedDataGridHandle,
} from "@/components/core/PaginatedDataGrid";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import LessonModal from "@/components/pages/backoffice/LessonsBackoffice/LessonModal";
import DeleteConfirmationModal from "@/components/core/DeleteConfirmationModal";
import { api } from "@/lib/api";
import useSWR from "swr";

export default function LessonsBackofficePage() {
  const gridRef = useRef<PaginatedDataGridHandle>(null);

  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [turmaFiltro, setTurmaFiltro] = useState<string>("");

  const { data: turmas } = useSWR("/api/backoffice/turmas", async (url: string) => {
    const res = await api.get(url);
    return res.data;
  });

  const endpoint = turmaFiltro
    ? `/api/backoffice/lessons?turmaId=${turmaFiltro}`
    : "/api/backoffice/lessons";

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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

      <Box mb={2} maxWidth={300}>
        <FormControl fullWidth size="small">
          <InputLabel>Filtrar por turma</InputLabel>
          <Select
            value={turmaFiltro}
            label="Filtrar por turma"
            onChange={(e) => {
              setTurmaFiltro(e.target.value);
              setTimeout(() => gridRef.current?.refetch(), 0);
            }}
          >
            <MenuItem value="">Todas as turmas</MenuItem>
            {Array.isArray(turmas) &&
              turmas.map((turma: any) => (
                <MenuItem key={turma.id} value={turma.id}>
                  {turma.nome}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      <PaginatedDataGrid
        ref={gridRef}
        endpoint={endpoint}
        columns={[
          { field: "title", headerName: "Título", flex: 1 },
          {
            field: "turma",
            headerName: "Turma",
            width: 160,
            valueGetter: (value: any) => value?.nome ?? "—",
          },
          { field: "duration", headerName: "Duração (s)", width: 120 },
          { field: "isFree", headerName: "Gratuita?", width: 110, type: "boolean" },
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
          await api.delete(`/api/backoffice/lessons?id=${deleteId}`).then(() => {
            gridRef.current?.refetch();
            setDeleteId(null);
          });
        }}
      />
    </Box>
  );
}
