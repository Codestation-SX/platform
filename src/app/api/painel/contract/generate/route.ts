// /app/api/painel/contract/generate/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { marked } from "marked";

type ContractRequest = {
  fullName: string;
  cpf: string;
  rg: string;
  address: string;
  paymentMethod: string;
  installments: number;
  installmentValue: string;
  firstInstallmentDate: string;
  contractDate: string;
};

function generateMarkdown(data: ContractRequest): string {
  return `
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS

Pelo presente instrumento particular de contrato de prestação de serviços educacionais, de um lado:  
**Instituto Flashcode Escola de Tecnologia LTDA**, inscrito no CNPJ sob nº 61.342.876/0001-00, com sede à Avenida Miguel Yunes, nº 540, na cidade de São Paulo, Estado de São Paulo, doravante denominada **"CONTRATADA"**.

E, de outro lado, o(a) aluno(a) identificado(a) abaixo, doravante denominado(a) **"CONTRATANTE"**:

**Nome completo:** ${data.fullName}  
**CPF:** ${data.cpf}    **RG:** ${data.rg}  
**Endereço completo:** ${data.address}  

---

## CLÁUSULA PRIMEIRA – DO OBJETO
Prestação de serviços educacionais à distância (EAD), com duração estimada entre 4 a 5 meses.

## CLÁUSULA SEGUNDA – DA FORMA DE PAGAMENTO
Forma selecionada: ${data.paymentMethod}  
Número de parcelas: ${data.installments}  
Valor de cada parcela: R$ ${data.installmentValue}  
Data da primeira parcela: ${data.firstInstallmentDate}

## CLÁUSULA TERCEIRA – DO DIREITO DE DESISTÊNCIA
Desistência em até 7 dias corridos com reembolso integral.

## CLÁUSULA QUARTA – DA ANÁLISE DE CRÉDITO
Autorização de consulta ao SPC e Serasa, se boleto.

## CLÁUSULA QUINTA – DA INADIMPLÊNCIA
Multa, juros e possibilidade de inscrição nos órgãos de proteção ao crédito.

## CLÁUSULA SEXTA – DAS OBRIGAÇÕES DAS PARTES
A CONTRATADA fornece acesso à plataforma; o CONTRATANTE se compromete ao uso individual.

## CLÁUSULA SÉTIMA – DO DIREITO DE ACESSO E REFAZIMENTO
2 tentativas em até 1 ano. Após isso, taxa de R$ 1.000,00.  
Acesso ao conteúdo por mais 3 meses após o fim da turma.

## CLÁUSULA OITAVA – DO FORO
Foro da Comarca de São Paulo/SP.

---

São Paulo, ${data.contractDate}  

**Assinatura do CONTRATANTE:** ______________________________________  
**Assinatura da CONTRATADA:** Instituto Flashcode Escola de Tecnologia LTDA  
`;
}

export async function POST(req: Request) {
  try {
    const data: ContractRequest = await req.json();
    const markdown = generateMarkdown(data);
    const htmlContent = marked(markdown);
    console.log(htmlContent);
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; line-height: 1.6; }
            // h1, h2, h3 { margin-top: 60px; }
            strong { font-weight: bold; }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: "shell" });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    return new NextResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue(pdfBuffer);
          controller.close();
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=contrato.pdf",
        },
      }
    );
  } catch (error) {
    console.error("Erro ao gerar contrato:", error);
    return NextResponse.json(
      { error: "Erro ao gerar contrato" },
      { status: 500 }
    );
  }
}
