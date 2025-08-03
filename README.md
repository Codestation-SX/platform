# CodeStation - Plataforma de Videoaulas de QA

Este repositório contém o código-fonte da plataforma de ensino da **CodeStation**, focada em cursos online voltados à área de **Quality Assurance (QA)**.

## ✨ Tecnologias Principais

- [Next.js 15](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- [MUI (Material UI)](https://mui.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Axios](https://axios-http.com/)
- [SWR](https://swr.vercel.app/)
- [AWS S3](https://aws.amazon.com/s3/) (armazenamento de arquivos)
- [Vimeo](https://vimeo.com/) (hospedagem de vídeos com acesso restrito)
- [Resend](https://resend.com/) (envio de emails)
- [Asaas](https://asaas.com/) (pagamentos)
- [Sentry](https://sentry.io/) (monitoramento de erros)

## ⚙️ Funcionalidades Implementadas

### 🧑‍💻 Admin (Backoffice)

- CRUD de Unidades (Módulos)
- CRUD de Aulas com ordenação automática
- CRUD de Usuários com endereço (relacionamento 1:1)
- Paginação padronizada com metadados e links
- Modais para criação e edição utilizando RHF + Zod + MUI
- Validações robustas e tratamento de erros (Zod + Prisma)
- Upload de arquivos para S3 (vídeos, imagens, contratos)
- Área administrativa de arquivos por categoria

### 📚 Plataforma do Aluno

- Cadastro/matrícula com validações completas
- Criação de usuário + endereço
- Geração automática de contrato em PDF
- Upload do contrato assinado
- Área de aulas com ReactPlayer e controle de liberação
- Integração com Vimeo (vídeos privados, acesso restrito)
- Proteção de rota e autenticação com NextAuth

### 💳 Integração com Pagamentos (Asaas)

- Criação de cliente e cobrança via API do Asaas
- Suporte a Pix, Boleto e Cartão (com parcelamento até 12x)
- Validação automática via Webhook do Asaas
- Liberação do curso após pagamento confirmado
- Link de cobrança reaproveitado ou regenerado se expirado

### 🔒 Recuperação de Senha

- Modal de "Esqueceu a senha?" com validação por código PIN
- Envio de email via Resend
- Validação do código
- Redefinição de senha com validação Zod

## 📁 Estrutura da Aplicação

```
src/
├── app/                  # Estrutura de rotas Next.js 15
├── components/           # Componentes reutilizáveis (modais, formulários, player, etc.)
├── lib/                  # Instâncias do Axios, helpers de API, utilitários
├── modules/              # Domínios principais como authentication, enrollment, payments, backoffice
├── pages/                # Páginas legacy (se houver)
├── styles/               # Temas e estilos globais
├── generated/prisma/     # Código gerado pelo Prisma
```

## 🔐 Segurança

- Tokens JWT armazenados com segurança em cookies
- Validação de sessão com NextAuth
- Middleware de proteção de rotas (públicas x privadas)
- Verificação de assinatura do contrato
- Acesso ao vídeo via embed do Vimeo com domínio restrito

## 📌 Como Rodar o Projeto Localmente

```bash
# Clonar o repositório
git clone https://github.com/sua-org/codestation.git
cd codestation

# Instalar dependências
npm install

# Criar arquivo .env com base no .env.example

# Rodar o projeto
npm run dev
```

## 🚀 Futuras Funcionalidades

- Área do aluno com progresso
- Certificados automáticos
- Notificações por e-mail/SMS
- Dashboard analítico (admin)
- Versão white-label para outras instituições

## 🧠 Contribuindo

Contribuições são bem-vindas! Siga o padrão dos hooks, validações com Zod, e estrutura modularizada em `/modules`.

## 🧾 Licença

Este projeto é privado e licenciado sob uso exclusivo da CodeStation. Todos os direitos reservados.
