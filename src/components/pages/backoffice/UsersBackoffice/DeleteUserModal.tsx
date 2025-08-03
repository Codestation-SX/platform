// src/components/backoffice/users/DeleteUserModal.tsx
"use client";

import DeleteConfirmationModal from "@/components/core/DeleteConfirmationModal";
import { api } from "@/lib/api";

interface DeleteUserModalProps {
  id: string;
  onClose: () => void;
  onDeleted: () => void;
  open?: boolean;
}

export default function DeleteUserModal({
  id,
  onClose,
  onDeleted,
  open,
}: DeleteUserModalProps) {
  const handleDelete = async () => {
    await api
      .delete("/api/backoffice/users", {
        data: { id },
      })
      .then(() => {
        onDeleted();
      })
      .catch((error) => {
        console.error("Erro ao excluir usuário:", error);
      });
  };

  return (
    <DeleteConfirmationModal
      title="Excluir Usuário"
      description="Tem certeza que deseja excluir este usuário? Esta ação não poderá ser desfeita."
      onClose={onClose}
      onConfirm={handleDelete}
      open={open}
    />
  );
}
