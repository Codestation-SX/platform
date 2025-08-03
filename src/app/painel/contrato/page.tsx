"use client";
import { api } from "@/lib/api";
import { Grid } from "@mui/material";

export default function Contrato() {
  const action = async () => {
    await api
      .post(
        "/api/painel/contract/generate",
        {
          fullName: "João da Silva",
          cpf: "12345678900",
          rg: "123456789",
          address: "Rua Teste, 123 - Bairro - Cidade/SP - 01234-567",
          paymentMethod: "Cartão de Crédito",
          installments: 12,
          installmentValue: "120,00",
          firstInstallmentDate: "15/08/2025",
          contractDate: "15 de Julho de 2025",
        },
        {
          responseType: "blob", // necessário para baixar o PDF
        }
      )
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "contrato.pdf");
        document.body.appendChild(link);
        link.click();
      });
  };

  return (
    <Grid container>
      <Grid size={{ xs: 12, md: 8 }}>
        {" "}
        <button onClick={action}>teste</button>
      </Grid>
      <Grid size="grow" sx={{ display: { xs: "none", md: "block" } }}>
        <button onClick={action}>teste</button>
      </Grid>
    </Grid>
  );
}
