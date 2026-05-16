# Testes Funcionais - Calebe


Esta entrega mostra como a esteira do projeto pode validar automaticamente um
fluxo básico de software de drones usando PX4 e MAVLink como referência.

Nesta parte de testes funcionais, nós construímos uma esteira um fluxo básico de software de drones (com o fim de mostrar como isso pode ser usado na JACTO), usando o PX4 como referência de piloto automático (ou ecossistema de simulação) e o MAVLink como protocolo de comunicação pra validar os comandos de voo de forma automática.

Nosso objetivo é mostrar que o pipeline consegue rodar uma
validação funcional simples, guardar os logs e gerar um resultado de
aprovado ou reprovado.

No MVP, os testes funcionais funcionam como um primeiro filtro de qualidade:
se uma mudança quebrar a inicialização da simulação, a comunicação MAVLink ou
um fluxo básico de missão, o merge request deve ser bloqueado para correção.

## Fontes usadas

Conforme conversa com o professor Romualdo, adicionamos as fontes para todas considerações feitas na entrega.

| Fonte | Parte do TAP que embasa | Como isso foi usado na entrega |
| :--- | :--- | :--- |
| TAP, página 2 | "software embarcado do drone, incluindo firmware de controle de voo, percepção, navegação" | A entrega considera que a esteira precisa validar software ligado ao firmware de voo. |
| TAP, página 3 | "utilizar componentes do ecossistema open-source de software para drones (como o stack Dronecode)" | PX4, MAVLink e Dronecode são usados como base aberta para o caso pedagógico. |
| TAP, página 4 | "pipeline básico de Continuous Integration / Continuous Delivery [...] build automatizado [...] validações básicas de integração" | Os testes funcionais entram como uma validação automática dentro do pipeline. |
| TAP, página 6 | "Esse caso de uso servirá apenas como ambiente de validação do fluxo de desenvolvimento e não como objetivo principal do projeto." | A simulação de drone é usada para validar a esteira, não para entregar um produto de voo. |
| TAP, página 7 | "não contempla [...] desenvolvimento de novos algoritmos de controle de voo [...] desenvolvimento de hardware [...] acesso a dados sensíveis" | A entrega não inclui drone físico, firmware proprietário, dados reais ou algoritmo novo de controle. |
| Workflow disponibilizado pelo Regis | "Feature Development", "Unit Testing", "Integration Testing", "Commit", "Merge request", "Release" | Os testes funcionais ficam entre integração e aceite do merge request. |
| Workflow disponibilizado pelo Regis | "Tests in MIL", "SIL" e "PIL / HIL" | MIL, SIL e HIL fazem parte do processo real citado no workflow, mas o MVP fica em simulação PX4/SITL por ser mais simples de rodar em CI. |

## Onde os testes entram no fluxo

No fluxo do projeto, os testes funcionais entram depois que a funcionalidade já
foi desenvolvida e depois dos testes unitários. Eles ficam no momento em que o
time quer saber se a mudança ainda conversa bem com o ambiente de simulação e
com os componentes básicos do ecossistema Dronecode.

O fluxo esperado é:

1. A tarefa sai do backlog e entra em desenvolvimento.
2. O estudante ou desenvolvedor implementa a mudança.
3. Os testes unitários validam partes menores do código.
4. Os testes funcionais validam o comportamento mínimo em simulação.
5. O pipeline guarda os logs e gera um resumo.
6. Se tudo passar, o merge request pode seguir para revisão.
7. Se algo falhar, o merge request fica bloqueado até a correção.

Esse formato combina com o workflow anexado, porque ele coloca os testes antes
do commit aceito, merge request e release.

## Testes mínimos do MVP

Para esta versão do projeto, a suíte funcional precisa cobrir quatro pontos
simples.

| Teste | O que verifica | Resultado esperado |
| :--- | :--- | :--- |
| Inicialização PX4/SITL | Verifica se o ambiente de simulação inicia sem erro crítico. | A simulação fica pronta para receber comandos. |
| Comunicação MAVLink | Verifica se existe troca básica de mensagens, como heartbeat. | O teste recebe resposta do sistema simulado. |
| Missão simples | Simula um fluxo curto, como preparar missão, executar um waypoint e finalizar. | O fluxo termina sem falha obrigatória. |
| Coleta de logs | Guarda logs brutos e separa erros, avisos e tempo de execução. | O pipeline publica evidências para revisão. |

No repositório, o script `scripts/run_functional_tests.py` gera essas
evidências em modo demonstrativo. Quando o ambiente PX4 real estiver pronto no
runner, os blocos simulados podem ser trocados por comandos reais de PX4 SITL,
MAVSDK ou MAVLink sem mudar o formato dos relatórios.

## Logs e evidências

Um dos pontos levantados no Kickoff da Sprint 1 (24/05/2026, porém não temos a transcrição) é que a leitura de logs dos
drones pode virar um gargalo, porque o volume é altíssimo e não eles vêm de forma estruturada. Por isso, nossa entrega não deve apenas dizer "passou"
ou "falhou", mas também guardamos evidências.

O pipeline publica três tipos de arquivo:

- `functional-test-report.json`: relatório estruturado para ser usado pelo
  dashboard ou por outro script.
- `functional-test-summary.md`: resumo simples para leitura humana.
- `simulation.log`: log bruto da execução funcional.

O relatório JSON contém, no mínimo:
- branch;
- commit;
- data da execução;
- ambiente usado;
- cenários executados;
- status de cada cenário;
- duração;
- lista simples de erros e avisos.

## Relação com o dashboard QoS

Os resultados dos testes funcionais servem como entrada para os indicadores de
QoS. Eles podem alimentar métricas como:
- total de testes executados;
- testes aprovados;
- testes com falha;
- falhas por etapa;
- estabilidade da integração PX4/MAVLink;
- tempo médio de execução.

No MVP, o dashboard ainda pode usar dados mockados. Mesmo assim, o formato do
relatório já deixa preparado o caminho para trocar dados simulados por dados
vindos do pipeline.