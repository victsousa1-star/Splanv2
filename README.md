# SPlan

Sistema web para gestao de obras, lojas, checklists, RDOs, relatorios e permissoes por shopping.

## Principais Modulos

- **Shoppings**: ponto de entrada principal do app.
- **Lojas**: cadastro de lojas, checklists e historico de relatorios por loja.
- **Obras**: locais de obra, obras, medicoes, notas fiscais, cronograma, RDO e apresentacao.
- **Checklists**: vistoria estruturada conforme modelo operacional.
- **Relatorios**: historico por loja e geracao de PDF.
- **Usuarios e Permissoes**: perfis, convites, acessos por shopping, obra e loja.

## Requisitos

- Node.js LTS
- npm
- Projeto Supabase configurado, para dados em nuvem e fotos do RDO

## Rodar Localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-public
GEMINI_API_KEY=sua-chave-gemini-opcional
```

3. Execute o app:

```bash
npm run dev
```

4. Abra:

```text
http://127.0.0.1:3000
```

## Supabase

Execute o arquivo [supabase-setup.sql](./supabase-setup.sql) no SQL Editor do Supabase.

Ele cria:

- `splan_data`: tabela principal de sincronizacao.
- `rdo_fotos`: metadados das fotos de RDO.
- `rdo-fotos`: bucket publico de storage.
- Policies basicas de acesso.

As variaveis ficam em:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Deploy no Railway

O projeto esta preparado para Railway com:

- [Dockerfile](./Dockerfile)
- [Caddyfile](./Caddyfile)

Fluxo recomendado:

1. Railway > New Project.
2. Deploy from GitHub repo.
3. Selecione `victsousa1-star/Splanv2`.
4. Configure as variaveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`, se for usar IA.
5. Gere o dominio publico em `Settings > Networking > Generate Domain`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Cuidados

- Nunca versionar `.env`.
- Rodar `npm run lint` antes de subir mudancas.
- Rodar `npm run build` antes de deploy.
- Manter permissoes sensiveis reforcadas no Supabase, nao apenas no frontend.

## Proximas Melhorias Tecnicas

As melhorias planejadas estao documentadas em [docs/technical-roadmap.md](./docs/technical-roadmap.md).
