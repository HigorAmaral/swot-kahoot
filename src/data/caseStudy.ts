export interface CaseStudyData {
  title: string;
  subtitle: string;
  summary: string;
  companyProfile: {
    name: string;
    sector: string;
    size: string;
    marketTime: string;
  };
  context: string[];
  swotBreakdown: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  administrativeFunctionsConnection: {
    planejamento: string;
    organizacao: string;
    direcao: string;
    controle: string;
  };
}

export const itCaseStudy: CaseStudyData = {
  title: "Estudo de Caso em TI: Transformação Cloud & Segurança na InovaTech",
  subtitle: "Artigo / Paper de Aplicação Prática das Funções Administrativas e Matriz SWOT",
  summary: "A InovaTech Soluções Digitais é uma fornecedora de sistemas corporativos de gestão (ERP) e logística para médias empresas. Com o rápido crescimento e a pressão por modernização, a diretoria de TI precisa conduzir o Planejamento Estratégico para migrar sua arquitetura legada para Cloud Computing e garantir conformidade com a LGPD e segurança cibernética.",
  companyProfile: {
    name: "InovaTech Soluções Digitais S.A.",
    sector: "Tecnologia da Informação & Software Corporativo",
    size: "180 colaboradores (65 em Engenharia e Suporte de TI)",
    marketTime: "12 anos de atuação no mercado nacional"
  },
  context: [
    "1. DIAGNÓSTICO ATUAL: A InovaTech possui mais de 450 clientes corporativos ativos e um índice de fidelidade (retenção) de 94%, gerando receita recorrente previsível.",
    "2. O GARGALO TÉCNICO: O sistema principal foi desenvolvido há 10 anos em arquitetura monolítica on-premise. Falta documentação atualizada, servidores físicos alocados em data center próprio sofrem com quedas pontuais de energia e os deploys são manuais e demorados.",
    "3. O CENÁRIO EXTERNO: O mercado de Cloud Computing e IA cresce 35% ao ano no Brasil. Clientes exigem integrações com IA generativa e acesso 100% web/mobile. Ao mesmo tempo, fornecedores de nuvem (AWS/Google Cloud/Azure) oferecem créditos e parcerias para ISVs (Independent Software Vendors).",
    "4. OS RISCOS & PRESSÕES: Ataques globais de Ransomware cresceram 140% no setor de TI nos últimos 2 anos. A ANPD (Autoridade Nacional de Proteção de Dados) aumentou a fiscalização sobre incidentes de segurança. Além disso, startups nativas da nuvem estão oferecendo soluções mais ágeis a preços competitivos."
  ],
  swotBreakdown: {
    strengths: [
      "Base de clientes consolidada e fidelizada (94% de retenção anual).",
      "Corpo técnico de desenvolvedores sênior com profundo conhecimento do negócio dos clientes.",
      "Solução já adaptada às complexas regras fiscais e tributárias brasileiras.",
      "Excelente reputação de suporte ao cliente e atendimento consultivo."
    ],
    weaknesses: [
      "Código legado monolítico sem cobertura adequada de testes automatizados e sem documentação.",
      "Infraestrutura dependente de servidores físicos próprios com limitações de escalabilidade.",
      "Processos de deploy manuais (baixo nível de maturidade DevOps / CI-CD).",
      "Alta sobrecarga da equipe de suporte técnico com retrabalho de bugs em versões antigas."
    ],
    opportunities: [
      "Crescimento acelerado do mercado de migração para Nuvem (SaaS) e Inteligência Artificial corporativa.",
      "Parcerias estratégicas com provedores de Cloud (subsídios e créditos de migração).",
      "Linhas de financiamento público e incentivos fiscais para inovação tecnológica (Finep/Lei de Informática).",
      "Expansão para novos nichos de clientes (pequenas e médias empresas via modelo SaaS escalável)."
    ],
    threats: [
      "Aumento exponencial de ataques de Ransomware e ameaças cibernéticas a sistemas corporativos.",
      "Concorrência feroz de Startups nativas da nuvem com precificação agressiva.",
      "Escassez e alta rotatividade de talentos de cibersegurança e engenharia DevOps no mercado.",
      "Variação cambial (dólar alto) encarecendo custos de licenças e infraestrutura cloud internacional."
    ]
  },
  administrativeFunctionsConnection: {
    planejamento: "Definição dos objetivos estratégicos de migração, elaboração do roadmap tecnológico de 3 anos, metas de redução de downtime e plano de contingência baseado na análise SWOT.",
    organizacao: "Reestruturação das equipes em Squads ágeis de produto, redistribuição de responsabilidades de DevOps e alocação do orçamento para infraestrutura cloud.",
    direcao: "Liderança técnica, comunicação transparente da visão de futuro, capacitação dos colaboradores em tecnologias em nuvem e motivação do time frente às mudanças culturais.",
    controle: "Acompanhamento de KPIs em tempo real (SLA de disponibilidade 99.9%, tempo médio de resposta, índice de bugs em produção e custos mensais de cloud computing)."
  }
};
