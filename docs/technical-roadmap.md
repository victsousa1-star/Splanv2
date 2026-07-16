# Roadmap Tecnico do SPlan

Este documento organiza as melhorias recomendadas para evoluir o SPlan sem comprometer o que ja esta funcionando.

## Fase 1 - Base de Producao

Objetivo: deixar o projeto mais facil de manter, configurar e publicar.

- Manter README operacional atualizado.
- Manter `.dockerignore` para deploys leves no Railway.
- Rodar `npm run lint` e `npm run build` antes de cada deploy.
- Documentar variaveis obrigatorias de ambiente.
- Manter `supabase-setup.sql` como fonte de configuracao inicial do banco.

## Fase 2 - Modularizacao do Frontend

Objetivo: reduzir risco de bugs no `App.tsx`.

Estrutura sugerida:

```text
src/
  modules/
    shopping/
    lojas/
    obras/
    checklists/
    relatorios/
    rdo/
    admin/
  shared/
    components/
    hooks/
    permissions/
    services/
    utils/
```

Ordem recomendada de extracao:

1. Constantes e permissoes.
2. Componentes de layout compartilhado.
3. Modulo de lojas.
4. Modulo de checklists/relatorios.
5. Modulo de RDO.
6. Modulo de obras e cronograma.
7. Administracao/usuarios.

## Fase 3 - Modelo de Dados

Objetivo: sair gradualmente da tabela JSON generica para tabelas relacionais.

Tabelas futuras recomendadas:

- `shoppings`
- `stores`
- `projects`
- `project_services`
- `measurements`
- `checklist_reports`
- `rdo_reports`
- `rdo_photos`
- `user_access`
- `audit_logs`

Estrategia segura:

1. Manter `splan_data` como compatibilidade.
2. Criar tabelas novas em paralelo.
3. Migrar um modulo por vez.
4. Validar permissoes RLS modulo por modulo.

## Fase 4 - Permissoes e Auditoria

Objetivo: garantir que o acesso seja protegido tambem no banco.

Melhorias:

- Criar `user_access` com escopo por shopping, loja, obra e modulo.
- Criar `audit_logs`.
- Registrar criacao, edicao, exclusao, exportacao PDF e upload de fotos.
- Reforcar RLS por modulo.
- Criar painel de auditoria no Admin.

## Fase 5 - RDO de Campo

Objetivo: melhorar uso no dia a dia da obra.

Melhorias:

- Status do RDO: `rascunho`, `finalizado`, `enviado`.
- Foto com legenda obrigatoria opcional.
- Compressao padronizada.
- Assinatura/responsavel do dia.
- Filtros por periodo, responsavel e ocorrencias.
- Exportacao consolidada por periodo.

## Fase 6 - Checklists e Relatorios

Objetivo: transformar checklist em fluxo de entrega.

Melhorias:

- Rascunho e finalizacao.
- Revisao/aprovacao.
- Plano de acao para itens `Nao OK`.
- Responsavel e prazo para pendencia.
- Historico por loja e periodo.
- Indicadores de conformidade.

## Fase 7 - Cronograma

Objetivo: tornar o cronograma uma ferramenta de gestao.

Melhorias:

- Dependencias entre servicos.
- Impacto automatico de atrasos.
- Responsavel por servico.
- Filtro por macroetapa.
- Exportacao PDF/Excel.
- Historico visual de reprogramacoes.

## Fase 8 - Testes

Objetivo: evitar regressao em fluxos criticos.

Testes prioritarios:

- Permissoes por perfil.
- Criacao/delecao de shopping.
- Criacao de loja.
- Criacao/finalizacao de checklist.
- Upload/fallback de foto RDO.
- Calculo de status do cronograma.
