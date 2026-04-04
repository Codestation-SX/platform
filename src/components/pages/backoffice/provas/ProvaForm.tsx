"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  useFieldArray,
  useForm,
} from "react-hook-form";

type AlternativaForm = {
  id?: string;
  texto: string;
  correta: boolean;
};

type PerguntaForm = {
  id?: string;
  enunciado: string;
  valorNota: number;
  ordem: number;
  alternativas: AlternativaForm[];
};

export type ProvaFormValues = {
  titulo: string;
  descricao: string;
  dataInicioDisponibilidade: string;
  dataFimDisponibilidade: string;
  tempoDuracaoMinutos: number;
  percentualMinimoAprovacao: number;
  status: "RASCUNHO" | "ATIVA" | "INATIVA" | "ENCERRADA";
  perguntas: PerguntaForm[];
};

type ProvaFormProps = {
  mode: "create" | "edit";
  provaId?: string;
  initialData?: Partial<ProvaFormValues>;
};

const createPergunta = (ordem: number): PerguntaForm => ({
  enunciado: "",
  valorNota: 1,
  ordem,
  alternativas: [
    { texto: "", correta: false },
    { texto: "", correta: false },
  ],
});

type PerguntaCardProps = {
  perguntaIndex: number;
  totalPerguntas: number;
  control: Control<ProvaFormValues>;
  register: UseFormRegister<ProvaFormValues>;
  errors: FieldErrors<ProvaFormValues>;
  watch: UseFormWatch<ProvaFormValues>;
  setValue: UseFormSetValue<ProvaFormValues>;
  onRemovePergunta: (index: number) => void;
};

function PerguntaCard({
  perguntaIndex,
  totalPerguntas,
  control,
  register,
  errors,
  watch,
  setValue,
  onRemovePergunta,
}: PerguntaCardProps) {
  const alternativasPath = `perguntas.${perguntaIndex}.alternativas` as const;

  const {
    fields: alternativas,
    append: appendAlternativa,
    remove: removeAlternativa,
  } = useFieldArray({
    control,
    name: alternativasPath,
  });

  const alternativasAtuais =
    watch(`perguntas.${perguntaIndex}.alternativas`) || [];

  const marcarAlternativaCorreta = (alternativaIndex: number) => {
    alternativasAtuais.forEach((_, idx) => {
      setValue(
        `perguntas.${perguntaIndex}.alternativas.${idx}.correta`,
        idx === alternativaIndex
      );
    });
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              Pergunta {perguntaIndex + 1}
            </Typography>

            <IconButton
              color="error"
              onClick={() => onRemovePergunta(perguntaIndex)}
              disabled={totalPerguntas === 1}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>

          <TextField
            label="Enunciado da pergunta"
            fullWidth
            multiline
            minRows={2}
            {...register(`perguntas.${perguntaIndex}.enunciado`, {
              required: "O enunciado é obrigatório",
            })}
            error={!!errors.perguntas?.[perguntaIndex]?.enunciado}
            helperText={errors.perguntas?.[perguntaIndex]?.enunciado?.message}
          />

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Valor da pergunta"
              type="number"
              fullWidth
              {...register(`perguntas.${perguntaIndex}.valorNota`, {
                required: "O valor é obrigatório",
                min: {
                  value: 0.01,
                  message: "O valor deve ser maior que zero",
                },
                valueAsNumber: true,
              })}
              error={!!errors.perguntas?.[perguntaIndex]?.valorNota}
              helperText={errors.perguntas?.[perguntaIndex]?.valorNota?.message}
            />

            <TextField
              label="Ordem"
              type="number"
              fullWidth
              {...register(`perguntas.${perguntaIndex}.ordem`, {
                valueAsNumber: true,
              })}
              disabled
            />
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={700}>Alternativas</Typography>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() =>
                  appendAlternativa({
                    texto: "",
                    correta: false,
                  })
                }
              >
                Adicionar alternativa
              </Button>
            </Stack>

            {alternativas.map((alternativa, alternativaIndex) => (
              <Card key={alternativa.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems={{ xs: "stretch", md: "center" }}
                  >
                    <TextField
                      label={`Alternativa ${alternativaIndex + 1}`}
                      fullWidth
                      {...register(
                        `perguntas.${perguntaIndex}.alternativas.${alternativaIndex}.texto`,
                        {
                          required: "O texto da alternativa é obrigatório",
                        }
                      )}
                      error={
                        !!errors.perguntas?.[perguntaIndex]?.alternativas?.[
                          alternativaIndex
                        ]?.texto
                      }
                      helperText={
                        errors.perguntas?.[perguntaIndex]?.alternativas?.[
                          alternativaIndex
                        ]?.texto?.message
                      }
                    />

                    <Controller
                      control={control}
                      name={`perguntas.${perguntaIndex}.alternativas.${alternativaIndex}.correta`}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={!!field.value}
                              onChange={() =>
                                marcarAlternativaCorreta(alternativaIndex)
                              }
                            />
                          }
                          label="Correta"
                        />
                      )}
                    />

                    <IconButton
                      color="error"
                      onClick={() => removeAlternativa(alternativaIndex)}
                      disabled={alternativas.length <= 2}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function localDateTimeToUTC(localStr: string): string {
  if (!localStr) return localStr;
  const [datePart, timePart] = localStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

function toInputDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function ProvaForm({
  mode,
  provaId,
  initialData,
}: ProvaFormProps) {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [tooltipMsg, setTooltipMsg] = useState("");

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProvaFormValues>({
    defaultValues: {
      titulo: initialData?.titulo || "",
      descricao: initialData?.descricao || "",
      dataInicioDisponibilidade: toInputDateTime(
        initialData?.dataInicioDisponibilidade
      ),
      dataFimDisponibilidade: toInputDateTime(
        initialData?.dataFimDisponibilidade
      ),
      tempoDuracaoMinutos: initialData?.tempoDuracaoMinutos || 15,
      percentualMinimoAprovacao:
        initialData?.percentualMinimoAprovacao || 86,
      status: initialData?.status || "ATIVA",
      perguntas:
        initialData?.perguntas && initialData.perguntas.length > 0
          ? initialData.perguntas
          : [createPergunta(1)],
    },
  });

  const {
    fields: perguntas,
    append: appendPergunta,
    remove: removePergunta,
  } = useFieldArray({
    control,
    name: "perguntas",
  });

  const onSubmit = async (data: ProvaFormValues) => {
    setErro("");
    setSucesso("");

    const perguntasTratadas = data.perguntas.map((pergunta, index) => ({
      ...pergunta,
      ordem: index + 1,
    }));

    for (const pergunta of perguntasTratadas) {
      const totalCorretas = pergunta.alternativas.filter((a) => a.correta).length;

      if (pergunta.alternativas.length < 2) {
        setErro("Toda pergunta deve ter ao menos 2 alternativas.");
        return;
      }

      if (totalCorretas !== 1) {
        setErro("Cada pergunta deve ter exatamente 1 alternativa correta.");
        return;
      }
    }

    try {
      setSalvando(true);

      const endpoint =
        mode === "create"
          ? "/api/backoffice/provas"
          : `/api/backoffice/provas/${provaId}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          dataInicioDisponibilidade: localDateTimeToUTC(data.dataInicioDisponibilidade),
          dataFimDisponibilidade: localDateTimeToUTC(data.dataFimDisponibilidade),
          percentualMinimoAprovacao: Number(data.percentualMinimoAprovacao),
          tempoDuracaoMinutos: Number(data.tempoDuracaoMinutos),
          perguntas: perguntasTratadas.map((pergunta) => ({
            ...pergunta,
            valorNota: Number(pergunta.valorNota),
            ordem: Number(pergunta.ordem),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao salvar prova.");
      }

      setSucesso(
        mode === "create"
          ? "Prova criada com sucesso."
          : "Prova atualizada com sucesso."
      );

      setTimeout(() => {
        router.push("/backoffice/provas");
      }, 1000);
    } catch (error: any) {
      setErro(error.message || "Erro ao salvar prova.");
    } finally {
      setSalvando(false);
    }
  };

  const getFirstError = (obj: any): string => {
    if (!obj) return "";
    if (typeof obj.message === "string") return obj.message;
    for (const key of Object.keys(obj)) {
      const result = getFirstError(obj[key]);
      if (result) return result;
    }
    return "";
  };

  const onInvalid = (errs: any) => {
    const msg = getFirstError(errs);
    setTooltipMsg(msg || "Preencha todos os campos obrigatórios.");
    setTimeout(() => setTooltipMsg(""), 4000);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Breadcrumbs>
          <Link href="/backoffice" style={{ textDecoration: "none" }}>
            Backoffice
          </Link>
          <Link href="/backoffice/provas" style={{ textDecoration: "none" }}>
            Provas
          </Link>
          <Typography color="text.primary">
            {mode === "create" ? "Nova prova" : "Editar prova"}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {mode === "create" ? "Criar prova" : "Editar prova"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cadastre uma prova com perguntas e alternativas.
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/backoffice/provas"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Voltar
        </Button>
      </Stack>

      {erro && <Alert severity="error">{erro}</Alert>}
      {sucesso && <Alert severity="success">{sucesso}</Alert>}

      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={700}>
                  Dados da prova
                </Typography>

                <TextField
                  label="Título da prova"
                  fullWidth
                  {...register("titulo", {
                    required: "O título é obrigatório",
                  })}
                  error={!!errors.titulo}
                  helperText={errors.titulo?.message}
                />

                <TextField
                  label="Descrição"
                  fullWidth
                  multiline
                  minRows={3}
                  {...register("descricao")}
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    label="Data/hora de início"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    {...register("dataInicioDisponibilidade", {
                      required: "A data de início é obrigatória",
                    })}
                    error={!!errors.dataInicioDisponibilidade}
                    helperText={errors.dataInicioDisponibilidade?.message}
                  />

                  <TextField
                    label="Data/hora de fim"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    {...register("dataFimDisponibilidade", {
                      required: "A data de fim é obrigatória",
                    })}
                    error={!!errors.dataFimDisponibilidade}
                    helperText={errors.dataFimDisponibilidade?.message}
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <TextField
                    label="Tempo de duração (minutos)"
                    type="number"
                    fullWidth
                    {...register("tempoDuracaoMinutos", {
                      required: "O tempo é obrigatório",
                      min: {
                        value: 1,
                        message: "O tempo deve ser maior que zero",
                      },
                      valueAsNumber: true,
                    })}
                    error={!!errors.tempoDuracaoMinutos}
                    helperText={errors.tempoDuracaoMinutos?.message}
                  />

                  <TextField
                    label="Percentual mínimo para aprovação"
                    type="number"
                    fullWidth
                    {...register("percentualMinimoAprovacao", {
                      required: "O percentual é obrigatório",
                      min: {
                        value: 0,
                        message: "O percentual não pode ser menor que 0",
                      },
                      max: {
                        value: 100,
                        message: "O percentual não pode ser maior que 100",
                      },
                      valueAsNumber: true,
                    })}
                    error={!!errors.percentualMinimoAprovacao}
                    helperText={errors.percentualMinimoAprovacao?.message}
                  />

                  <TextField
                    label="Status"
                    fullWidth
                    select
                    SelectProps={{ native: true }}
                    {...register("status", {
                      required: "O status é obrigatório",
                    })}
                  >
                    <option value="RASCUNHO">Rascunho</option>
                    <option value="ATIVA">Ativa</option>
                    <option value="INATIVA">Inativa</option>
                    <option value="ENCERRADA">Encerrada</option>
                  </TextField>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6" fontWeight={700}>
                  Perguntas
                </Typography>

                {perguntas.map((pergunta, perguntaIndex) => (
                  <PerguntaCard
                    key={pergunta.id}
                    perguntaIndex={perguntaIndex}
                    totalPerguntas={perguntas.length}
                    control={control}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    onRemovePergunta={removePergunta}
                  />
                ))}

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => appendPergunta(createPergunta(perguntas.length + 1))}
                >
                  Adicionar pergunta
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button component={Link} href="/backoffice/provas" variant="outlined">
              Cancelar
            </Button>

            <Tooltip title={tooltipMsg} open={!!tooltipMsg} arrow>
              <span>
                <Button type="submit" variant="contained" disabled={salvando}>
                  {salvando
                    ? "Salvando..."
                    : mode === "create"
                    ? "Salvar prova"
                    : "Atualizar prova"}
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
}