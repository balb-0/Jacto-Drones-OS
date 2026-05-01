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


## Professores:
### Orientador(a) 
- <a href="https://www.linkedin.com/in/reginaldo-arakaki-9574222b/">Reginaldo Arakaki</a>
### Instrutores
- <a href="https://www.linkedin.com/in/hermano-peixoto-1091796/">Computação - Hermano</a>
- <a href="https://www.linkedin.com/in/jose-romualdo/">Computação - José Romualdo</a>
- <a href="https://www.linkedin.com/in/ovidio-netto/">Computação - Ovídio</a>
- <a href="https://www.linkedin.com/in/fernando-pizzo-208b526a/">Matemática e Física - Pizzo</a>
- <a href="https://www.linkedin.com/in/egondaxbacher/?locale=pt">Negócios - Egon</a>
- <a href="https://www.linkedin.com/in/juliastateri/?locale=pt">Design - Julia</a>
- <a href="https://www.linkedin.com/in/profclaudioandre/">Liderança - Claudio Andre</a>


## 📝 Descrição

Desenvolvimento de um protótipo funcional de um **Operating System de continuous delivery para software de drones (OS v0.1)**. O sistema visa unificar o workflow de desenvolvimento para firmware, plataformas digitais e sistemas de dados, automatizando atividades recorrentes de gestão de tarefas, rituais de engenharia e estabelecendo critérios padronizados de qualidade e métricas operacionais (DORA Metrics).

## 📝 LINKS

<a href="/docs/projeto.md">Link para a documentação geral</a> do projeto.
<br>
<a href="/docs/projeto.pdf">Versão em PDF do documento do projeto (Placement)</a>.

## 📊 Dashboards Implementados (Placement)

O repositório adotará uma camada de visualização para métricas operacionais (Cycle Time, Throughput, Backlog Health):

- **Dashboard Operacional**: Monitoramento de saúde da esteira e cadência de entrega.

## 📁 Estrutura de pastas

```
g04/
├─ docs/
│  ├─ index.md                          # Índice da documentação
│  ├─ projeto.md                        # Documento principal do produto (OS v0.1)
│  ├─ gestao-projeto.md                 # Gestão de sprints e riscos
│  ├─ gestao-configuração.md            # Políticas de repo e branches
│  ├─ dev-rules.md                      # Padrões de código e testes
│  └─ referencias/                      # Normas e evidências do parceiro
├─ src/
│  ├─ core/                             # Scripts de automação da esteira
│  └─ tests/
│     ├─ unit/                          # Testes unitários (nome_do_teste.py)
│     └─ integration/                   # Testes de integração (nome_do_teste.py)
├─ .gitlab-ci.yml                       # Pipeline de CI/CD GitLab
├─ requirements.txt                     # Dependências do projeto
└─ README.md
```

## ✅ Requisitos (Placement)

Para executar o projeto localmente, utilize as versões abaixo (ou superiores compatíveis):

- **Git**: 2.40+
- **Python**: 3.12+
- **Docker Engine**: 24+

## 💻 Configuração para desenvolvimento (Placement)

```bash
git clone https://git.inteli.edu.br/graduacao/2026-1b/t13/g04
cd g04
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 🗃 Histórico de lançamentos

* 0.1.0 - 30/04/2026
    * SPRINT 1 - GESTÃO DE CONFIGURAÇÃO E ARQUITETURA (ISO 10746)

## 📋 Licença/License

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://git.inteli.edu.br/graduacao/2026-1b/t13/g04">Jacto Drones OS v0.1</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://git.inteli.edu.br/graduacao/2026-1b/t13/g04">INTELI</a>, <a href="https://www.linkedin.com/in/calebe-matias/?locale=pt">Calebe Matias</a>, <a href="https://www.linkedin.com/in/fernandobertholdo/">Fernando Bertholdo</a>, <a href="https://www.linkedin.com/in/kauanmassuia/">Kauan Massuia</a>, <a href="https://www.linkedin.com/in/lucca-henrique-pereira/">Lucca Henrique</a>, <a href="https://www.linkedin.com/in/marlos-do-carmo-guedes-366987250/">Marlos Guedes</a>, <a href="https://www.linkedin.com/in/otavio-vasc/">Otávio Vasconcelos</a>, <a href="https://www.linkedin.com/in/vitorbalbo/">Vitor Balbo</a> is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"></a></p>