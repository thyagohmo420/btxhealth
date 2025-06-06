# Hospital de Juquitiba

Sistema de gestão de saúde desenvolvido com Next.js, TypeScript, Tailwind CSS e Supabase.

## Funcionalidades

- Autenticação de usuários
- Gerenciamento de pacientes
- Registro de consultas médicas
- Histórico de sinais vitais
- Histórico de exames

## Tecnologias

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- React Hook Form
- Zod
- Radix UI

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente:
- Crie um arquivo `.env` na raiz do projeto
- Adicione as seguintes variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React reutilizáveis
  ├── contexts/      # Contextos React (Auth, Patients)
  ├── lib/           # Utilitários e configurações
  ├── pages/         # Páginas da aplicação
  ├── styles/        # Estilos globais
  └── types/         # Definições de tipos TypeScript
```

## Licença

MIT
🛠️ Atualização para forçar novo build na Vercel - 04/11/2025 11:31:08
Forçando novo build automático 04/11/2025 12:27:41
