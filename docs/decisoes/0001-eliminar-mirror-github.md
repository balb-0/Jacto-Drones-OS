# ADR-0001 — GitLab como Fonte Única da Verdade (eliminação do mirror GitHub)

**Status:** Aceito (formalizado retrospectivamente em 16/05/2026 — decisão já implementada na Sprint 1 e refletida no repositório)
**Data da decisão:** Sprint 1 (28/04/2026 a 30/04/2026)
**Autores:** G04

## Contexto

A versão inicial do plano de esteira (Sprint 1) previa o **GitHub como repositório primário** e o **GitLab como executor de CI/CD via mirror**. Durante o feedback formal da Sprint 1 (nota 6,5/10), o avaliador apontou que essa decisão configurava uma **tensão técnica não justificada** — exigia justificativa mais forte sobre por que operar duas plataformas simultaneamente em vez de simplificar a cadeia SCM.

A discussão oral pós-feedback elencou os riscos não endereçados: (a) sincronização entre as plataformas (latência, conflito de refs); (b) duplicação de permissões e governança; (c) fonte da verdade ambígua (qual versão é canônica em caso de divergência); (d) auditabilidade comprometida.

## Decisão

O **GitLab é a fonte única da verdade (Single Source of Truth — SSoT)** para todo o ciclo de vida do Jacto Drones OS v0.1:

- Todo `git push` é direcionado direto ao GitLab (`git.inteli.edu.br`).
- Merge Requests são revisados e integrados nativamente no GitLab.
- CI/CD, Container Registry, auditoria e governança operam sobre o mesmo plano.
- O GitHub original deixa de receber pushes e é mantido apenas como referência histórica / legado.

## Trade-offs aceitos

- **Dependência de uma única plataforma:** GitLab passa a ser ponto único de falha operacional para o time. Mitigação: backups locais via clones; o GitLab Inteli é instância administrada institucionalmente.
- **Ecossistema GitHub-first abandonado:** integrações populares (ex.: GitHub Actions Marketplace, Codespaces) não estão disponíveis. Aceitamos perda de ergonomia em troca de coerência operacional.
- **Curva de adaptação:** parte do time tinha mais familiaridade com fluxo GitHub. Compensada pela equivalência funcional do GitLab (MRs ≈ PRs, GitLab CI ≈ GitHub Actions).

## Trade-offs descartados (riscos do mirror que motivaram a decisão)

- **Sincronização frágil:** mirror requer hook, agendamento ou push duplicado — qualquer falha cria divergência silenciosa entre plataformas.
- **Permissões fragmentadas:** dois sistemas de IAM (usuários, grupos, roles) para manter sincronizados.
- **Fonte da verdade ambígua:** em caso de divergência (push direto em uma plataforma, edição via web na outra), não há regra unívoca de resolução.
- **Auditoria duplicada:** rastreabilidade fica espalhada — quem fez o quê, em qual plataforma, com qual timestamp.
- **Latência operacional:** o tempo entre push no GitHub e disponibilidade no GitLab introduz janelas de inconsistência que prejudicam CI/CD.

## Consequências

- O repositório `g04-gitlab` no GitLab Inteli é o único canônico do projeto.
- A `dev-rules.md` e o `mapeamento-ambiente-jacto.md` §4.1 refletem essa decisão.
- O Sprint 1 já operou parcialmente sob esse fluxo; a Sprint 2 consolida-o em definitivo.
- Esta decisão atende ao princípio operacional permanente "Decisão técnica controversa exige ADR" derivado do feedback da Sprint 1.

## Referências

- Feedback formal do avaliador da Sprint 1 (30/04/2026).
- Conversa oral pós-feedback (mesma data): "tensão técnica não resolvida — exigiria justificativa mais forte sobre por que operar duas plataformas em vez de simplificar a cadeia SCM".
- `docs/referencias/mapeamento-ambiente-jacto.md` §4.1.
- Princípios operacionais permanentes do G04 (`guia/guia-v1.md`).
