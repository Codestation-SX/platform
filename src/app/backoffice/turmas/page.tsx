"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
} from "@mui/material";
import { api } from "@/lib/api";

type Classroom = { id: string; name: string };

export default function TurmasBackofficePage() {
  const [name, setName] = useState("");

  const { data, isLoading, error } = useSWR<Classroom[]>(
    "/api/backoffice/classrooms",
    async (url: string) => {
      const res = await api.get(url);
      return res.data;
    }
  );

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    await api.post("/api/backoffice/classrooms", { name: trimmed });
    setName("");
    mutate("/api/backoffice/classrooms");
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Turmas
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Nome da turma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={handleCreate}>
          Criar
        </Button>
      </Box>

      {isLoading && <CircularProgress />}

      {error && (
        <Alert severity="error">Erro ao carregar turmas.</Alert>
      )}

      {data && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell width={420}>ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
