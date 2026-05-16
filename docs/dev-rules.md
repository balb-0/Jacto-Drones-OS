<Table>
  <tr>
    <td><a href= "link"><img src="img/logo.png" alt="Nome" border="0"></td>
    <td>
      <a href= "https://www.inteli.edu.br/"><img src="img/logo-Inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0"></a>
    </td>
  </tr>
</table>

# Nome do Projeto: Jacto Drones Operating System v0.1

## Nome do Grupo: G04 (O Grupo Quatro)

## Integrantes:

- <a href="https://www.linkedin.com/in/calebe-matias/?locale=pt">Calebe Matias</a>
- <a href="https://www.linkedin.com/in/fernandobertholdo/">Fernando Bertholdo</a>
- <a href="https://www.linkedin.com/in/kauanmassuia/">Kauan Massuia</a>
- <a href="https://www.linkedin.com/in/lucca-henrique-pereira/">Lucca Henrique</a>
- <a href="https://www.linkedin.com/in/marlos-do-carmo-guedes-366987250/">Marlos Guedes</a>
- <a href="https://www.linkedin.com/in/otavio-vasc/">Otávio Vasconcelos</a>
- <a href="https://www.linkedin.com/in/vitorbalbo/">Vitor Balbo</a>

# Sumário

# Histórico de Revisões

| Data | Versão | Descrição | Autor |
| :--- | :--- | :--- | :--- |
| 28/04/2026 | 0.1 | Criação do documento e definição de padrões iniciais. | Vitor Balbo |
| 30/04/2026 | 0.1.0 | Sprint 1 - Entrega Final. | G04 |



# 1. Introdução
_conteúdo_

## 1.1 Objetivo do Documento

Estabelecer padrões técnicos de codificação e práticas de CI/CD para garantir a consistência do firmware e do dashboard gerencial do Jacto Drones OS v0.1.

# 2. Padrões de Codificação
_conteúdo_

## 2.1 Naming Conventions

- Variáveis e Funções: Utilize camelCase
  - Exemplos:
    - ```let userName = "John";``` 
    - ```function calculateTotal() { ... } 

- Classes e Interfaces: Utilize PascalCase
  - Exemplos:
    - ```class UserProfile { ... }``` 
    - ```interface PaymentGateway { ... }```  

- Constantes: Utilize UPPER_CASE com underscores
  - Exemplo:
    - const MAX_USERS = 100; 

- Arquivos de Teste: Utilize snake_case (nome_do_teste)
  - Exemplo: 
    - ```test_calculo_rota.py```
    - ```test_integracao_mavlink.py```

## 2.2 Formatação de Código

A formatação do projeto é garantida de forma automatizada através do **Prettier** e do **ESLint**, acionados localmente pelo Husky antes de cada commit.
- **Indentação:** Utilize 2 espaços para indentação (configurado no `.prettierrc`).
- **Linhas:** Mantenha o comprimento das linhas em até 80 caracteres.
- **Chaves:** Coloque chaves de abertura na mesma linha.
- **Ponto e Vírgula:** Uso obrigatório ao final das instruções.
- **Aspas:** Uso de aspas simples para strings.

  *Exemplo:*
  ```javascript
  if (condition) {
    // código
  }
  ```

## 2.3 Comentários e Documentação

- Comentários de Linha: Use para explicar lógica complexa.
  - Exemplo: // Calcula o total com desconto

- Comentários de Bloco: Use para documentar funções e classes com JSDoc.
  - Exemplo: 
    ```
    /**
    * Calcula o total de um pedido.
    * @param {number} price - Preço do item.
    * @param {number} quantity - Quantidade do item.
    * @returns {number} Total calculado.
    */
    function calculateTotal(price, quantity) {
        return price * quantity;
    }
    ```

- Documentação da API e do Código
  - Firmware: Utilizar Doxygen para gerar documentação a partir dos headers C++.
  - Dashboard: Documentar componentes via JSDoc/TSDoc para integração com Storybook.

# 3. Padrões de Projeto
_conteúdo_

## 3.1 Design Patterns

_Opcionalmente, o grupo pode definir um ou mais design patterns para serem adotados, como forma de exercitarem tipos de solução para problemas/situações recorrentes_
_Sugestão de leitura: https://refactoring.guru/_

- Utilize a Arquitetura de Visões (RM-ODP) e Malha Fechada: Separe a lógica de controle (Firmware), a orquestração da esteira (Pipeline) e a visualização de gestão (Dashboard).
  - Exemplo: No Firmware PX4, utilize módulos isolados para controle e navegação. No Dashboard, utilize componentes React 19 para visualização de métricas.

# 4. Práticas de Desenvolvimento

## 4.1 Testes Automatizados e Simulação

- Testes Unitários (Python/Firmware): Utilize `pytest` para validar funções de extração de logs `.ulg`.
- Simulação SITL (Software In The Loop): Uso obrigatório do PX4 SITL + Gazebo para validar missões de voo no pipeline.
- Validação MAVLink: Testes automatizados para conformidade do protocolo entre a GCS e o Autopilot.
- Testes de Dashboard (Next.js): Utilize Playwright para regressão visual e acessibilidade (axe-core).

## 4.2 Controle de Qualidade e Containers

- **Revisão de Código:** Todos os MRs devem ser revisados por pelo menos um outro desenvolvedor.
- **Análise Estática Local (Shift-left):** O uso de **ESLint** e **Prettier** é obrigatório e automatizado via Husky (`pre-commit` com `lint-staged`). Além disso, o **TruffleHog** escaneia o código localmente em busca de credenciais vazadas antes de permitir o commit.
- **Boas Práticas de Docker (Reprodutibilidade):**
  - Todo `Dockerfile` deve adotar o padrão **multi-stage build** para separar as dependências de desenvolvimento do artefato final em produção.
  - O uso do arquivo `.dockerignore` é obrigatório para evitar que arquivos de configuração, credenciais locais e pastas como `node_modules` inflem a imagem.
  - O hook de `pre-push` aciona o build da imagem local e roda o **Trivy** para varredura de vulnerabilidades antes de enviar o código para o GitLab.

# 5. Ferramentas e Tecnologias

## 5.1 Ferramentas de Desenvolvimento

- Editor de Código: Utilize Visual Studio Code como editor padrão.

- Plugins recomendados: ESLint, Prettier, GitLens.

## 5.2 Tecnologias e Frameworks

- Firmware: PX4 Autopilot, MAVLink, C++, Python.
- Simulação: Gazebo, SITL.
- Dashboard: Next.js 15+, React 19, Tailwind CSS 4, Recharts.
- Pipeline: GitLab CI/CD, Docker.

## 5.3 Regras por Track (consolidação)

A esteira do Jacto Drones OS v0.1 cobre tracks com naturezas técnicas distintas. Esta tabela consolida as regras já dispersas nas seções anteriores, separando-as por contexto de uso. Em caso de dúvida em qual regra aplicar, identificar primeiro o track e seguir a linha correspondente.

| Categoria | Firmware (PX4 / C++) | Web (Next.js / TS) | Dados / Scripts (Python) |
| :--- | :--- | :--- | :--- |
| **Linter / Style guide** | clang-tidy + Google C++ Style Guide | ESLint + Prettier | ruff + black + PEP 8 |
| **Naming — funções e variáveis** | `snake_case` | `camelCase` | `snake_case` |
| **Naming — classes e tipos** | `PascalCase` | `PascalCase` | `PascalCase` |
| **Naming — constantes** | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` |
| **Formatação automática** | clang-format (4 espaços; linha ≤ 100 chars) | Prettier (2 espaços; linha ≤ 100 chars) | black (4 espaços; linha ≤ 88 chars) |
| **Testes automatizados** | GTest, Catch2 + SITL/HIL no pipeline | Jest, React Testing Library; Cypress quando aplicável | pytest |
| **Documentação de API** | Doxygen (a partir de headers C++) | JSDoc / TSDoc (integração com Storybook) | docstrings + Sphinx |
| **Hook pre-commit** | clang-format check + lint | lint-staged + Prettier | ruff |
| **Modelo arquitetural** | Módulos isolados (controle, navegação, atuadores) | Componentes React 19 + estado isolado | Scripts curtos + funções puras |

Casos não cobertos pela tabela seguem a regra mais conservadora aplicável ao track em questão. Decisões controversas que afetem regras de mais de um track devem ser registradas como ADR em `docs/decisoes/`.
