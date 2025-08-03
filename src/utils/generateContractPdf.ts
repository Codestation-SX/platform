// utils/generateContractPdf.ts
import { marked } from "marked";
import { jsPDF } from "jspdf";

interface ContractData {
  fullName: string;
  cpf: string;
  rg: string;
  address: string;
  paymentMethod: string;
  installments: number;
  installmentValue: string;
  firstInstallmentDate: string;
  contractDate: string;
}

const contractTemplate = `
# CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS

Pelo presente instrumento particular de contrato de prestação de serviços educacionais, de um lado:
**Instituto Flashcode Escola de Tecnologia LTDA**, inscrito no CNPJ sob nº 61.342.876/0001-00, com sede à Avenida Miguel Yunes, nº 540, na cidade de São Paulo, Estado de São Paulo, doravante denominada "CONTRATADA".

E, de outro lado, o(a) aluno(a) identificado(a) abaixo, doravante denominado(a) "CONTRATANTE":

- **Nome completo:** {{fullName}}
- **CPF:** {{cpf}}    **RG:** {{rg}}
- **Endereço completo:** {{address}}

## CLÁUSULA PRIMEIRA – DO OBJETO
O presente contrato tem por objeto a prestação de serviços educacionais à distância (EAD), pela CONTRATADA, por meio da disponibilização de curso online na área de tecnologia, com duração estimada entre 4 (quatro) a 5 (cinco) meses.

## CLÁUSULA SEGUNDA – DA FORMA DE PAGAMENTO
O valor total do curso será definido no momento da matrícula. O CONTRATANTE poderá optar pelas seguintes formas de pagamento:

Forma de pagamento selecionada: **{{paymentMethod}}**  
Número de parcelas: **{{installments}}**  
Valor de cada parcela: **R$ {{installmentValue}}**  
Data da primeira parcela: **{{firstInstallmentDate}}**

## CLÁUSULA TERCEIRA – DO DIREITO DE DESISTÊNCIA
O CONTRATANTE poderá desistir do curso no prazo de até 07 (sete) dias corridos a contar da data de início do curso.

## CLÁUSULA QUARTA – DA ANÁLISE DE CRÉDITO
Ao optar pelo pagamento via boleto bancário, o CONTRATANTE autoriza a CONTRATADA a consultar seus dados junto aos órgãos de proteção ao crédito.

## CLÁUSULA QUINTA – DA INADIMPLÊNCIA
O não pagamento das parcelas poderá acarretar a inscrição do nome do CONTRATANTE nos órgãos de proteção ao crédito.

## CLÁUSULA SEXTA – DAS OBRIGAÇÕES DAS PARTES
A CONTRATADA compromete-se a oferecer acesso ao conteúdo do curso durante a vigência. O CONTRATANTE compromete-se a não compartilhar seus dados de acesso.

## CLÁUSULA SÉTIMA – DO DIREITO DE ACESSO E REFAZIMENTO
O CONTRATANTE poderá realizar o curso até 2 (duas) vezes dentro do prazo de 1 (um) ano.

## CLÁUSULA OITAVA – DO FORO
Fica eleito o foro da Comarca de São Paulo/SP.

---
São Paulo, {{contractDate}}.

Assinatura do CONTRATANTE: ___________________________________________  
Assinatura da CONTRATADA: Instituto Flashcode Escola de Tecnologia LTDA
`;

export async function generateContractPdf(data: ContractData) {
  const filled = contractTemplate.replace(/{{(\w+)}}/g, (_, key) => {
    return (data as any)[key] || "";
  });

  const html = await marked.parse(filled);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.html(html, {
    x: 30,
    y: 30,
    callback: () => {
      doc.save("contrato.pdf");
    },
    width: 540,
  });
}
