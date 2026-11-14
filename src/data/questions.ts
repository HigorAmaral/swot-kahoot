export interface Question {
  id: number;
  category: string;
  theme: 'FORÇAS' | 'FRAQUEZAS' | 'OPORTUNIDADES' | 'AMEAÇAS' | 'PLANEJAMENTO' | 'CONTROLE';
  question: string;
  options: {
    text: string;
    symbol: 'triangle' | 'diamond' | 'circle' | 'square';
    color: string;
  }[];
  correctIndex: number;
  caseRelation: string;
  explanation: string;
  swotQuadrant?: 'Interno - Positivo' | 'Interno - Negativo' | 'Externo - Positivo' | 'Externo - Negativo';
  codeSnippet?: string;
  imageUrl?: string;
}

export const questionsData: Question[] = [
  {
    id: 1,
    category: "Funções Administrativas - Planejamento",
    theme: "PLANEJAMENTO",
    question: "No início da transformação da InovaTech, os diretores de TI se reuniram para definir a visão de futuro, metas de migração cloud para 3 anos e orçamentos antes de qualquer linha de código. Qual função administrativa foi exercida?",
    options: [
      { text: "Organização estrutural", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "Direção de pessoal", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Planejamento Estratégico", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Controle de qualidade", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 2,
    caseRelation: "A diretoria definiu objetivos e roadmap antes de alocar recursos e executar.",
    explanation: "O Planejamento é a primeira função administrativa básica (PODC). Ele define onde a empresa quer chegar (visão, metas e objetivos) e traça as estratégias e planos de ação necessários para atingir esse estado futuro antes da alocação de recursos."
  },
  {
    id: 2,
    category: "Análise SWOT - Quadrante Forças (Strengths)",
    theme: "FORÇAS",
    question: "A InovaTech possui 94% de retenção de clientes corporativos e uma equipe sênior que domina as regras de negócio dos clientes. Na Matriz SWOT, esse aspecto representa:",
    options: [
      { text: "Uma Força Interna (Strengths)", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "Uma Oportunidade Externa (Opportunities)", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Uma Ameaça Competitiva (Threats)", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Um Fator Incontrolável de Mercado", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 0,
    swotQuadrant: "Interno - Positivo",
    caseRelation: "A carteira de clientes fidelizada e a equipe técnica são recursos sob controle direto da empresa.",
    explanation: "Forças (Strengths) são características e competências INTERNAS positivas que diferenciam a organização de seus concorrentes e estão sob seu controle direto. A lealdade dos clientes e a qualificação do time sênior são ativos próprios da InovaTech."
  },
  {
    id: 3,
    category: "Análise SWOT - Quadrante Fraquezas (Weaknesses)",
    theme: "FRAQUEZAS",
    question: "O diagnóstico revelou código legado monolítico de 10 anos sem documentação, dependência de servidores físicos obsoletos e deploys manuais. Como a SWOT classifica isso?",
    options: [
      { text: "Uma Ameaça Tecnológica Externa", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "Uma Fraqueza Interna (Weaknesses)", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Uma Oportunidade de Mercado", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Um Risco de Mercado Macroeconômico", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 1,
    swotQuadrant: "Interno - Negativo",
    caseRelation: "O débito técnico e a falta de documentação são limitações internas que dependem da gestão da empresa para serem resolvidas.",
    explanation: "Fraquezas (Weaknesses) são fatores INTERNOS negativos que colocam a organização em desvantagem operacional. Como o código e a infraestrutura pertencem à InovaTech, está em sua esfera de governabilidade corrigi-los através de refatoração e automação."
  },
  {
    id: 4,
    category: "Análise SWOT - Quadrante Oportunidades (Opportunities)",
    theme: "OPORTUNIDADES",
    question: "O mercado brasileiro de Nuvem cresce 35% ao ano e provedores de nuvem (AWS/Google/Azure) estão concedendo subsídios e créditos financeiros para migração de software. Na SWOT, isso é:",
    options: [
      { text: "Uma Força Organizacional da TI", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "Uma Ameaça de Dependência Técnica", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Uma Fraqueza da Equipe de Vendas", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Uma Oportunidade Externa (Opportunities)", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 3,
    swotQuadrant: "Externo - Positivo",
    caseRelation: "O crescimento do mercado de Cloud e os incentivos de grandes provedores existem independentemente da InovaTech.",
    explanation: "Oportunidades (Opportunities) são forças do ambiente EXTERNO que a organização não controla, mas que geram cenários favoráveis para expansão, inovação e aumento de faturamento se forem devidamente aproveitadas no planejamento."
  },
  {
    id: 5,
    category: "Análise SWOT - Quadrante Ameaças (Threats)",
    theme: "AMEAÇAS",
    question: "O aumento de 140% em ataques globais de Ransomware direcionados a servidores e o surgimento de startups nativas da nuvem com preços agressivos representam na SWOT:",
    options: [
      { text: "Ameaças Externas (Threats)", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "Fraquezas de Programação", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Falhas de Direção dos Gestores", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Oportunidades de Marketing", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 0,
    swotQuadrant: "Externo - Negativo",
    caseRelation: "Hackers e novos concorrentes atuam no ambiente externo incontrolável pela InovaTech.",
    explanation: "Ameaças (Threats) são variáveis EXTERNAS desfavoráveis que a empresa não controla diretamente e que podem comprometer sua segurança, estabilidade financeira ou participação de mercado se medidas preventivas não forem planejadas."
  },
  {
    id: 6,
    category: "Ambiente Interno vs Ambiente Externo",
    theme: "PLANEJAMENTO",
    question: "Qual é a regra de ouro que os gestores de TI devem usar para nunca confundir Forças/Fraquezas com Oportunidades/Ameaças?",
    options: [
      { text: "A quantidade de dinheiro necessária para resolver", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "A governabilidade: Ambiente Interno é controlável pela empresa; Ambiente Externo é incontrolável", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Se o problema envolve hardware (externo) ou software (interno)", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Se o evento ocorreu há mais de um ano atrás", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 1,
    caseRelation: "A InovaTech pode mudar seu código (interno), mas não pode impedir que o dólar suba ou que a LGPD exista (externo).",
    explanation: "O critério divisor é a GOVERNABILIDADE. Fatores internos (Forças e Fraquezas) são frutos de decisões, processos e ativos que a empresa tem poder de intervir diretamente. Fatores externos (Oportunidades e Ameaças) decorrem do mercado, política, economia e tecnologia global, cabendo à empresa se antecipar e adaptar."
  },
  {
    id: 7,
    category: "Matriz SWOT Cruzada - Estratégia de Alavancagem",
    theme: "PLANEJAMENTO",
    question: "Ao cruzar a FORÇA interna da InovaTech (time sênior especialista) com a OPORTUNIDADE externa (mercado de Cloud e IA em alta), qual postura estratégica de planejamento é adotada?",
    options: [
      { text: "Estratégia de Sobrevivência (redução drástica)", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "Estratégia de Crescimento / Ataque (Desenvolvimento)", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Estratégia de Desinvestimento e venda de ativos", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Estratégia Passiva de Manutenção", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 1,
    caseRelation: "Usar pontos fortes para agarrar oportunidades de mercado cria vantagem competitiva sustentável.",
    explanation: "Na Matriz SWOT Cruzada, a combinação de Forças + Oportunidades (F-O) gera a estratégia de 'Desenvolvimento ou Ataque'. A organização utiliza seus maiores talentos e vantagens para capturar novos mercados e expandir sua liderança tecnológica."
  },
  {
    id: 8,
    category: "Matriz SWOT Cruzada - Estratégia de Proteção",
    theme: "PLANEJAMENTO",
    question: "A InovaTech possui servidores obsoletos sem patches de segurança (Fraqueza) e enfrenta uma onda agressiva de Ransomware (Ameaça). A prioridade no planejamento tático deve ser:",
    options: [
      { text: "Sobrevivência / Blindagem e Mitigação de Danos Imediatos", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "Focar 100% em campanhas publicitárias de vendas", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Demitir a equipe de desenvolvimento para cortar custos", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Ignorar, pois ataques hacker são inevitáveis no mundo de TI", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 0,
    caseRelation: "Uma fraqueza exposta a uma ameaça crítica pode levar a empresa à falência por vazamento de dados ou sequestro de sistemas.",
    explanation: "O cruzamento de Fraquezas + Ameaças (F-A) é o ponto mais crítico e vulnerável de qualquer organização. A estratégia requerida é de 'Sobrevivência ou Defesa Máxima', aplicando contingências, backups isolados e migração emergencial para evitar o colapso do negócio."
  },
  {
    id: 9,
    category: "Funções Administrativas - Controle",
    theme: "CONTROLE",
    question: "Após iniciar a migração cloud, a equipe acompanha dashboards com métricas diárias: SLA de 99,9%, tempo de resposta em ms e custos reais versus orçados. Essa atividade refere-se à função de:",
    options: [
      { text: "Organização", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "Direção", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Recrutamento", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Controle", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 3,
    caseRelation: "Monitorar resultados em relação aos padrões estabelecidos no planejamento permite correções de rumo em tempo hábil.",
    explanation: "O Controle é a função administrativa responsável por medir o desempenho atual, comparar com os padrões planejados (KPIs, SLAs, metas) e acionar medidas corretivas caso haja desvios. Em TI, isso é feito via observabilidade, APM e FinOps."
  },
  {
    id: 10,
    category: "Planejamento Estratégico em TI",
    theme: "PLANEJAMENTO",
    question: "Em resumo, por que a Análise SWOT é uma ferramenta indispensável para os profissionais e gestores de TI no Planejamento Empresarial?",
    options: [
      { text: "Porque elimina a necessidade de fazer testes de software", symbol: "triangle", color: "bg-kahoot-red" },
      { text: "Porque substitui todas as linguagens de programação", symbol: "diamond", color: "bg-kahoot-blue" },
      { text: "Porque oferece um diagnóstico situacional realista para alinhar investimentos de TI aos objetivos estratégicos do negócio", symbol: "circle", color: "bg-kahoot-yellow" },
      { text: "Porque serve exclusivamente para calcular os impostos da empresa", symbol: "square", color: "bg-kahoot-green" }
    ],
    correctIndex: 2,
    caseRelation: "A TI deixa de ser um mero centro de custos para ser um motor de valor estratégico corporativo.",
    explanation: "A Análise SWOT conecta o mundo técnico da TI aos objetivos macro da organização. Ela fornece clareza para priorizar investimentos de tecnologia onde há maior retorno (oportunidades) e proteção (ameaças), garantindo sustentabilidade e competitividade no mercado digital."
  }
];
