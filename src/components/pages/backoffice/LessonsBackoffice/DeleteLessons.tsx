import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";

interface DeleteLessonModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  lessonTitle?: string;
}

export default function DeleteLessonModal({
  open,
  onClose,
  onDelete,
  lessonTitle,
}: DeleteLessonModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Excluir Aula</DialogTitle>
      <DialogContent>
        <Typography>
          Tem certeza que deseja excluir a aula
          {lessonTitle ? ` "${lessonTitle}"` : ""}?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={onDelete} color="error" variant="contained">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
