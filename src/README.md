# Dashboard de Métricas - Jacto Drones OS v0.1

Dashboard completo para monitoramento de métricas de qualidade (QoS e QoP) do pipeline de Continuous Delivery do Jacto Drones Operating System.

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Métricas Implementadas](#métricas-implementadas)

## 🎯 Visão Geral

Este dashboard fornece visibilidade completa sobre a saúde técnica do software (QoS) e a eficiência do processo de engenharia (QoP).

## ✨ Funcionalidades

### QoS - Quality of Service
- **Taxa de Sucesso de Builds**: Visualização de builds bem-sucedidos vs falhas
- **Defeitos em Testes**: Quantidade e tipos de defeitos capturados nos testes automatizados
- **Estabilidade de Integração**: Monitoramento da integração firmware ↔ plataforma digital

### QoP - Quality of Process
- **Cycle Time**: Tempo médio de concepção à entrega com breakdown por estágio
- **Throughput**: Vazão de entregas, métricas DORA
- **Saúde do Backlog**: Status do backlog, WIP limits, itens em envelhecimento

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- npm

### Passos

```bash
# Acesse o diretório do dashboard
cd src

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

### Build para Produção

```bash
npm run build
# Arquivos estáticos em dist/
```

## 📁 Estrutura do Projeto

```
src/                    # Dashboard application root
├── src/                # Next.js source directory
│   ├── app/            # Next.js App Router pages
│   │   ├── page.tsx    # Homepage
│   │   ├── qos/page.tsx # QoS section
│   │   └── qop/page.tsx # QoP section
│   ├── components/     # Reusable UI components
│   ├── lib/            # Utilities and config
│   ├── services/       # Data fetching and mocks
│   ├── types/          # TypeScript definitions
│   └── styles/         # Design tokens
├── design/tokens.json  # Jacto brand tokens
├── dist/               # Build output
└── package.json        # Dependencies
```

## 📈 Métricas Implementadas

### QoS (Quality of Service)
- Build Metrics: Total, success rate, failed, duration
- Test Defects: By type, by stage, defect density
- Integration: Uptime, API compatibility, incidents

### QoP (Quality of Process)
- Cycle Time: Average, median, P85, P95, by stage
- Throughput: Deployments, story points, DORA metrics
- Backlog: Status distribution, sprint health, WIP, aging items

## 🎨 Design System

**Cores:**
- Blue: #0a5193
- Orange: #ec6608
- Paper: #f5f3ee
- Ink: #1f2227

**Tipografia:**
- Display: Archivo
- Mono: JetBrains Mono

---

**Desenvolvido por:** Grupo 04 (O Grupo Quatro) - Inteli  
**Parceiro:** Jacto  
**Módulo:** M10 - Continuous Delivery