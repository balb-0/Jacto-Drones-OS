module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Atualização de documentação
        'style',    // Mudanças de estilo (formatação, lint)
        'refactor', // Refatoração de código sem adição de feature ou correção
        'perf',     // Melhoria de performance
        'test',     // Adição ou correção de testes
        'ci',       // Mudanças na configuração de CI (GitLab)
        'chore',    // Tarefas de build, dependências ou ferramentas auxiliares
        'revert'    // Reversão de commits
      ],
    ],
    // Obriga uma referência (Issue ID do GitLab) na mensagem do commit
    'references-empty': [2, 'never'],
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['#'] // O prefixo das issues no GitLab (ex: #12)
    }
  }
};
