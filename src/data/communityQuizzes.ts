import { SavedQuiz } from '../types';
import { Question } from './questions';

type RawQ = [
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string
];

const makeQuestions = (category: string, items: RawQ[]): Question[] =>
  items.map(([question, opts, correctIndex, explanation], idx) => ({
    id: idx + 1,
    category,
    theme: 'PLANEJAMENTO',
    question,
    options: [
      { text: opts[0], symbol: 'triangle', color: 'bg-kahoot-red' },
      { text: opts[1], symbol: 'diamond', color: 'bg-kahoot-blue' },
      { text: opts[2], symbol: 'circle', color: 'bg-kahoot-yellow' },
      { text: opts[3], symbol: 'square', color: 'bg-kahoot-green' },
    ],
    correctIndex,
    caseRelation: `Quiz da Comunidade • ${category}`,
    explanation,
  }));

const makeQuiz = (
  num: number,
  title: string,
  category: string,
  likesCount: number,
  playsCount: number,
  items: RawQ[]
): SavedQuiz => ({
  id: 1000 + num,
  shareCode: `COMM-${String(num).padStart(2, '0')}`,
  ownerUsername: 'arenaquiz',
  ownerName: 'ArenaQuiz Oficial',
  ownerAvatar: '🤖',
  title,
  category,
  isPublic: true,
  likesCount,
  playsCount,
  questions: makeQuestions(category, items),
  createdAt: '2026-11-14T00:00:00.000Z',
});

export const communitySeedQuizzes: SavedQuiz[] = [
  makeQuiz(1, 'JavaScript Moderno (ES6+)', 'Programação', 48, 132, [
    ['Qual palavra-chave declara uma variável com escopo de bloco que NÃO pode ser reatribuída?', ['var', 'let', 'const', 'static'], 2, 'const cria uma ligação constante no escopo de bloco, impedindo reatribuição da variável.'],
    ['O que o operador spread (...) faz em [...arr1, ...arr2]?', ['Remove duplicatas', 'Espalha os elementos em um novo array', 'Ordena os arrays', 'Converte para string'], 1, 'O operador spread expande os elementos de iteráveis como arrays ou propriedades de objetos.'],
    ['Qual método de array retorna um novo array apenas com os itens que passam em um teste?', ['map()', 'forEach()', 'filter()', 'reduce()'], 2, 'filter() cria um novo array contendo somente os elementos cuja função de callback retorna true.'],
    ['O que a sintaxe async/await simplifica em JavaScript?', ['Manipulação de CSS', 'Consumo de Promises assíncronas', 'Criação de classes', 'Compilação de TypeScript'], 1, 'async/await permite escrever código assíncrono baseado em Promises com aparência síncrona.'],
    ['Qual é o retorno de typeof null em JavaScript?', ['"null"', '"undefined"', '"object"', '"boolean"'], 2, 'Por um comportamento histórico da linguagem desde a primeira versão, typeof null retorna "object".'],
  ]),

  makeQuiz(2, 'TypeScript na Prática', 'Programação', 42, 118, [
    ['Qual é o principal benefício de usar TypeScript em projetos JavaScript?', ['Executar mais rápido no navegador sem build', 'Tipagem estática em tempo de desenvolvimento', 'Substituir o HTML', 'Eliminar a necessidade de APIs'], 1, 'TypeScript adiciona verificação estática de tipos antes da execução, evitando muitos bugs comuns.'],
    ['Qual tipo indica que uma função não retorna nenhum valor?', ['never', 'unknown', 'void', 'any'], 2, 'void é usado como tipo de retorno para funções que não retornam valor.'],
    ['Qual tipo é mais seguro que "any" quando ainda não sabemos o tipo do dado recebido?', ['unknown', 'object', 'void', 'null'], 0, 'unknown exige verificação de tipo (type narrowing) antes de manipular o valor, ao contrário de any.'],
    ['Como definimos uma propriedade opcional em uma interface TypeScript?', ['nome!: string', 'nome?: string', 'optional nome: string', 'nome: string | void'], 1, 'O ponto de interrogação (?) após o nome da propriedade indica que ela é opcional.'],
    ['Para que servem Generics (<T>) em TypeScript?', ['Criar componentes e funções reutilizáveis mantendo a tipagem', 'Remover tipos do código', 'Forçar conversão para string', 'Importar módulos CSS'], 0, 'Generics permitem parametrizar tipos para reutilizar lógica com segurança de tipo.'],
  ]),

  makeQuiz(3, 'Python: Fundamentos e Dicas', 'Programação', 51, 145, [
    ['Qual estrutura em Python armazena pares chave-valor?', ['list', 'tuple', 'dict', 'set'], 2, 'Dicionários (dict) mapeiam chaves únicas para valores, como {"nome": "Ana"}.'],
    ['Qual é a diferença principal entre list e tuple em Python?', ['Tuplas são imutáveis após criadas', 'Listas só aceitam números', 'Tuplas não têm índice', 'Listas são sempre mais rápidas'], 0, 'Tuplas são sequências imutáveis, enquanto listas podem ser modificadas (append, pop, etc.).'],
    ['O que faz o comando "pip install" no ecossistema Python?', ['Compila código C++', 'Instala pacotes e bibliotecas do PyPI', 'Cria um servidor web', 'Formata o disco'], 1, 'pip é o gerenciador de pacotes padrão do Python para instalar bibliotecas.'],
    ['Como se cria um bloco de código (como if ou def) em Python?', ['Usando chaves { }', 'Usando begin e end', 'Usando dois-pontos : e indentação', 'Usando ponto e vírgula ;'], 2, 'Python usa indentação obrigatória após dois-pontos (:) para delimitar blocos.'],
    ['O que [x * 2 for x in range(3)] produz em Python?', ['[0, 2, 4]', '[2, 4, 6]', '[1, 2, 3]', '[0, 1, 2]'], 0, 'List comprehension multiplica por 2 os valores 0, 1 e 2 gerados por range(3).'],
  ]),

  makeQuiz(4, 'Java & Orientação a Objetos', 'Programação', 34, 89, [
    ['Qual pilar da POO permite que uma subclasse reescreva um método da superclasse?', ['Encapsulamento', 'Polimorfismo', 'Abstração de hardware', 'Serialização'], 1, 'Polimorfismo (via sobrescrita/override) permite comportamentos específicos em subclasses.'],
    ['Qual modificador restringe o acesso de um atributo apenas à própria classe?', ['public', 'protected', 'private', 'default'], 2, 'private garante encapsulamento, permitindo acesso somente dentro da própria classe.'],
    ['Qual é a função da JVM (Java Virtual Machine)?', ['Editar código no navegador', 'Executar bytecode Java em qualquer sistema operacional', 'Gerenciar bancos SQL', 'Criar arquivos CSS'], 1, 'A JVM interpreta/compila bytecode (.class), garantindo portabilidade ("Write Once, Run Anywhere").'],
    ['Em Java, qual palavra-chave indica herança entre classes?', ['implements', 'inherits', 'extends', 'super'], 2, 'extends é usada para herdar de uma classe; implements é usada para interfaces.'],
    ['Qual método é o ponto de entrada padrão de uma aplicação Java?', ['start()', 'run()', 'main(String[] args)', 'init()'], 2, 'public static void main(String[] args) é o método inicial executado pela JVM.'],
  ]),

  makeQuiz(5, 'C# e Ecossistema .NET', 'Programação', 29, 76, [
    ['Qual recurso do C# permite consultas declarativas em coleções e bancos de dados?', ['LINQ', 'JSX', 'DOM', 'NPM'], 0, 'LINQ (Language Integrated Query) oferece sintaxe integrada para filtrar, ordenar e projetar dados.'],
    ['Qual palavra-chave em C# libera automaticamente recursos como conexões e arquivos?', ['free', 'using', 'dispose', 'defer'], 1, 'A declaração using garante a chamada automática de Dispose() ao sair do escopo.'],
    ['O que é o ASP.NET Core?', ['Um banco NoSQL', 'Um framework multiplataforma para APIs e aplicações web', 'Um compilador de Python', 'Uma biblioteca de gráficos 3D'], 1, 'ASP.NET Core é o framework moderno e de alta performance da Microsoft para web e APIs.'],
    ['Em C#, qual tipo representa uma operação assíncrona que retorna um valor?', ['Promise<T>', 'Future<T>', 'Task<T>', 'Thread<T>'], 2, 'Task<T> representa trabalho assíncrono em C#, usado com async e await.'],
    ['Qual gerenciador de pacotes é padrão no ecossistema .NET?', ['Maven', 'NuGet', 'Cargo', 'Composer'], 1, 'NuGet é o gerenciador de pacotes oficial para bibliotecas .NET.'],
  ]),

  makeQuiz(6, 'Lógica de Programação & Algoritmos', 'Programação', 46, 128, [
    ['Qual estrutura de repetição executa um bloco enquanto uma condição for verdadeira?', ['if / else', 'switch', 'while', 'return'], 2, 'O laço while repete o bloco enquanto a condição booleana permanecer verdadeira.'],
    ['O que é uma função recursiva?', ['Uma função sem parâmetros', 'Uma função que chama a si mesma até um caso base', 'Uma função que só roda uma vez', 'Uma variável global'], 1, 'Recursão ocorre quando uma função resolve um problema chamando a si mesma em subproblemas menores.'],
    ['Qual é a complexidade de tempo da Busca Binária em um array ordenado?', ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], 2, 'A busca binária divide o espaço de busca pela metade a cada passo, resultando em O(log n).'],
    ['Na tabela verdade do operador lógico AND (&&), quando o resultado é verdadeiro?', ['Quando pelo menos um lado é verdadeiro', 'Somente quando ambos os lados são verdadeiros', 'Quando ambos são falsos', 'Sempre'], 1, 'O operador AND exige que todas as condições envolvidas sejam verdadeiras.'],
    ['O que significa "caso base" em recursão?', ['A primeira linha do arquivo', 'A condição de parada que evita loop infinito', 'O maior número do array', 'Um erro de compilação'], 1, 'Sem o caso base, a função recursiva continuaria se chamando até causar Stack Overflow.'],
  ]),

  makeQuiz(7, 'Estruturas de Dados Essenciais', 'Programação', 38, 94, [
    ['Qual estrutura segue o princípio LIFO (Último a Entrar, Primeiro a Sair)?', ['Fila (Queue)', 'Pilha (Stack)', 'Lista Ligada', 'Árvore Binária'], 1, 'Em uma Pilha (Stack), o último elemento inserido (push) é o primeiro a ser removido (pop).'],
    ['Qual estrutura segue o princípio FIFO (Primeiro a Entrar, Primeiro a Sair)?', ['Pilha (Stack)', 'Grafo', 'Fila (Queue)', 'Tabela Hash'], 2, 'Filas (Queue) atendem os elementos na ordem exata em que chegaram.'],
    ['Qual estrutura oferece busca média em O(1) usando chave e valor?', ['Tabela Hash (HashMap)', 'Lista Encadeada', 'Pilha', 'Matriz'], 0, 'Tabelas Hash calculam o índice diretamente pela função de hash, atingindo O(1) em média.'],
    ['Em um Grafo, o que são "arestas" (edges)?', ['Os valores dentro dos nós', 'As conexões entre os vértices/nós', 'A altura máxima da árvore', 'Os índices do vetor'], 1, 'Arestas representam as ligações ou relacionamentos entre vértices de um grafo.'],
    ['Qual estrutura é mais usada para representar hierarquias (como pastas de um sistema)?', ['Pilha', 'Árvore (Tree)', 'Fila circular', 'Vetor estático'], 1, 'Árvores modelam relações hierárquicas de pai e filho, como diretórios e o DOM.'],
  ]),

  makeQuiz(8, 'React 18: Hooks e Renderização', 'Frontend & Web', 55, 160, [
    ['Qual Hook gerencia estado local dentro de um componente funcional React?', ['useEffect', 'useState', 'useRef', 'useMemo'], 1, 'useState retorna o valor atual do estado e a função para atualizá-lo, disparando re-renderização.'],
    ['Para que serve o array de dependências [dep] no useEffect?', ['Estilizar o componente', 'Controlar quando o efeito deve ser reexecutado', 'Definir rotas', 'Tipar props'], 1, 'O efeito roda após a montagem e sempre que algum valor do array de dependências mudar.'],
    ['Por que devemos passar a prop "key" única ao renderizar listas com .map()?', ['Para o React identificar quais itens mudaram, foram adicionados ou removidos', 'Para aplicar CSS automático', 'Para ordenar o array', 'É obrigatório apenas no HTML'], 0, 'Keys estáveis otimizam o algoritmo de reconciliação (Virtual DOM) do React.'],
    ['Qual Hook permite referenciar um elemento DOM ou guardar valor mutável sem re-renderizar?', ['useState', 'useContext', 'useRef', 'useCallback'], 2, 'useRef mantém um objeto .current persistente entre renderizações sem causar novo render ao mudar.'],
    ['O que são "props" no React?', ['Variáveis globais do navegador', 'Parâmetros passados de um componente pai para um filho', 'Tabelas do banco', 'Arquivos de imagem'], 1, 'Props (propriedades) são dados imutáveis recebidos por um componente vindos do componente pai.'],
  ]),

  makeQuiz(9, 'HTML5 Semântico & Acessibilidade', 'Frontend & Web', 31, 82, [
    ['Qual tag HTML5 representa o conteúdo principal único da página?', ['<div class="main">', '<section>', '<main>', '<header>'], 2, '<main> identifica o conteúdo dominante do documento, ajudando leitores de tela e SEO.'],
    ['Para que serve o atributo "alt" na tag <img>?', ['Definir a largura da imagem', 'Fornecer texto alternativo para acessibilidade e falha de carregamento', 'Aplicar sombra', 'Acelerar o CSS'], 1, 'Leitores de tela leem o alt para usuários com deficiência visual e ele aparece se a imagem falhar.'],
    ['Qual tag é mais semântica para um menu de navegação principal?', ['<nav>', '<menu-bar>', '<aside>', '<span>'], 0, '<nav> indica semanticamente uma seção com links de navegação.'],
    ['Quantos <h1> principais se recomenda ter por página para boa hierarquia?', ['Nenhum', 'Pelo menos 5', 'Geralmente 1 principal descrevendo o tema da página', 'Um em cada botão'], 2, 'Um único <h1> principal torna a estrutura de títulos clara para SEO e tecnologias assistivas.'],
    ['Qual atributo ARIA melhora a descrição de um botão que tem apenas um ícone?', ['aria-label', 'aria-hidden', 'data-icon', 'tabindex'], 0, 'aria-label fornece um rótulo legível por leitores de tela quando não há texto visível.'],
  ]),

  makeQuiz(10, 'CSS3, Flexbox & Grid Layout', 'Frontend & Web', 40, 110, [
    ['No Flexbox, qual propriedade alinha os itens ao longo do eixo principal (horizontal por padrão)?', ['align-items', 'justify-content', 'flex-wrap', 'place-self'], 1, 'justify-content controla o alinhamento no eixo principal; align-items controla o eixo transversal.'],
    ['Qual unidade CSS é relativa ao tamanho da fonte do elemento raiz (<html>)?', ['em', 'px', 'rem', 'vw'], 2, 'rem (root em) baseia-se sempre no font-size do elemento raiz, garantindo escala consistente.'],
    ['Qual propriedade do CSS Grid define o espaçamento entre linhas e colunas?', ['margin', 'padding', 'gap', 'spacing'], 2, 'gap (antigo grid-gap) define o espaço entre células no Grid e também funciona no Flexbox.'],
    ['O que "box-sizing: border-box" faz?', ['Remove todas as bordas', 'Inclui padding e border dentro da largura/altura declarada', 'Centraliza a div', 'Cria sombra interna'], 1, 'Com border-box, width: 200px já inclui conteúdo, padding e borda, evitando quebras de layout.'],
    ['Qual recurso CSS permite aplicar estilos diferentes conforme a largura da tela?', ['@keyframes', '@media (Media Queries)', '@import', ':hover'], 1, 'Media Queries (@media) são a base do design responsivo para adaptar layouts a mobile, tablet e desktop.'],
  ]),

  makeQuiz(11, 'Tailwind CSS & Design Systems', 'Frontend & Web', 37, 98, [
    ['O que significa a abordagem "Utility-First" do Tailwind CSS?', ['Escrever apenas CSS inline', 'Compor interfaces usando classes utilitárias pequenas diretamente no markup', 'Usar apenas tabelas', 'Gerar imagens automaticamente'], 1, 'Classes como flex, p-4, text-white e rounded-xl permitem estilizar rápido sem sair do HTML/JSX.'],
    ['No Tailwind, qual prefixo aplica um estilo apenas a partir de telas médias (>= 768px)?', ['xs:', 'md:', 'lg:', 'mobile:'], 1, 'Tailwind é mobile-first: classes sem prefixo valem para mobile e md: aplica a partir de 768px.'],
    ['Qual classe Tailwind cria uma grade com 2 colunas iguais?', ['grid-cols-2', 'flex-cols-2', 'cols-2', 'grid-2'], 0, 'Com display grid (classe grid), grid-cols-2 cria duas colunas de largura igual.'],
    ['Para que serve o arquivo tailwind.config.js?', ['Configurar rotas do backend', 'Personalizar cores, fontes, breakpoints e plugins do tema', 'Conectar ao PostgreSQL', 'Rodar testes unitários'], 1, 'O tailwind.config.js centraliza tokens de design customizados do projeto.'],
    ['O que a classe "truncate" faz em um texto no Tailwind?', ['Deixa em negrito', 'Corta o texto com reticências (...) em uma linha se ultrapassar o espaço', 'Converte para maiúsculas', 'Quebra em 3 linhas'], 1, 'truncate aplica overflow: hidden, text-overflow: ellipsis e white-space: nowrap.'],
  ]),

  makeQuiz(12, 'Next.js & Arquitetura Web Moderna', 'Frontend & Web', 33, 87, [
    ['O que significa SSR (Server-Side Rendering)?', ['Renderizar o HTML da página no servidor a cada requisição', 'Executar CSS apenas no cliente', 'Salvar imagens no localStorage', 'Desativar JavaScript'], 0, 'No SSR, o servidor gera o HTML pronto antes de enviar ao navegador, melhorando SEO e carregamento inicial.'],
    ['Qual é a vantagem do SSG (Static Site Generation)?', ['Requer servidor GPU', 'Páginas pré-geradas no build e servidas direto via CDN com altíssima velocidade', 'Não funciona com links', 'Atualiza o banco a cada segundo'], 1, 'SSG gera HTML estático no build, ideal para blogs, docs e páginas de alta escala.'],
    ['Qual pasta define as rotas no App Router moderno do Next.js?', ['src/routes/', 'app/', 'views/', 'controllers/'], 1, 'No App Router, cada subpasta com page.tsx dentro de app/ vira uma rota automaticamente.'],
    ['O que diferencia React Server Components de Client Components?', ['Server Components rodam no servidor e não enviam seu JS ao bundle do cliente', 'Client Components não podem usar useState', 'Server Components não acessam banco', 'Não há diferença'], 0, 'Server Components reduzem o JavaScript enviado ao navegador e podem acessar dados do servidor direto.'],
    ['Qual componente do Next.js otimiza carregamento, redimensionamento e formato (WebP/AVIF) de imagens?', ['<Picture />', '<Image />', '<ImgOpt />', '<Media />'], 1, 'O componente next/image otimiza imagens automaticamente com lazy loading e formatos modernos.'],
  ]),

  makeQuiz(13, 'Node.js & Event Loop', 'Backend & APIs', 39, 105, [
    ['Qual motor JavaScript alimenta o Node.js?', ['SpiderMonkey', 'V8 (do Google Chrome)', 'Chakra', 'JavaScriptCore'], 1, 'O Node.js executa código JavaScript fora do navegador utilizando o motor V8 em C++.'],
    ['Por que o Node.js lida tão bem com múltiplas requisições de I/O simultâneas?', ['Porque cria 1000 processos por clique', 'Por causa da arquitetura orientada a eventos e I/O não-bloqueante (Event Loop)', 'Porque ignora erros', 'Porque usa apenas SQL'], 1, 'O Event Loop delega operações de I/O ao sistema e continua atendendo outras requisições sem bloquear a thread.'],
    ['Qual arquivo lista dependências e scripts de um projeto Node.js?', ['node.xml', 'package.json', 'config.env', 'index.lock'], 1, 'package.json armazena metadados, dependências e scripts como dev, build e test.'],
    ['Qual objeto global no Node.js dá acesso às variáveis de ambiente?', ['window.env', 'system.vars', 'process.env', 'global.config'], 2, 'process.env contém as variáveis de ambiente configuradas no servidor ou .env.'],
    ['Qual comando instala exatamente as versões travadas no package-lock.json em CI/CD?', ['npm update', 'npm ci', 'npm init', 'npm link'], 1, 'npm ci (Clean Install) instala de forma determinística a partir do package-lock.json.'],
  ]),

  makeQuiz(14, 'APIs REST, HTTP & Status Codes', 'Backend & APIs', 44, 121, [
    ['Qual método HTTP é semanticamente usado para CRIAR um novo recurso?', ['GET', 'POST', 'DELETE', 'HEAD'], 1, 'POST envia dados ao servidor para criar um novo recurso.'],
    ['O que significa o status HTTP 201?', ['Não encontrado', 'Criado com sucesso (Created)', 'Erro interno do servidor', 'Sem permissão'], 1, '201 Created confirma que a requisição resultou na criação de um novo recurso.'],
    ['Qual código HTTP indica "Não autorizado / Token ausente ou inválido"?', ['200', '301', '401', '500'], 2, '401 Unauthorized indica falta de autenticação válida; 403 indica autenticado mas sem permissão.'],
    ['O que significa o status HTTP 404?', ['Requisição muito lenta', 'Recurso não encontrado (Not Found)', 'Conflito de versão', 'Redirecionamento'], 1, '404 Not Found informa que a rota ou recurso solicitado não existe no servidor.'],
    ['Qual formato de dados é o mais comum em APIs REST modernas?', ['XML binário', 'JSON', 'CSV com tabulação', 'YAML'], 1, 'JSON (JavaScript Object Notation) é leve, legível e nativamente suportado pela web.'],
  ]),

  makeQuiz(15, 'GraphQL vs REST', 'Backend & APIs', 26, 68, [
    ['Qual problema clássico de APIs REST o GraphQL resolve?', ['Falta de HTTPS', 'Over-fetching (dados demais) e Under-fetching (múltiplas chamadas)', 'Falta de banco de dados', 'Lentidão de CSS'], 1, 'Em GraphQL, o cliente pede exatamente os campos que precisa em uma única requisição.'],
    ['No GraphQL, qual operação equivale a alterar/criar dados no servidor?', ['Query', 'Mutation', 'Subscription', 'Schema'], 1, 'Queries são para leitura; Mutations são para escrita (criar, atualizar, deletar).'],
    ['Para que serve uma Subscription no GraphQL?', ['Assinar plano pago', 'Receber atualizações em tempo real via WebSockets', 'Compactar imagens', 'Gerar tokens JWT'], 1, 'Subscriptions permitem que o servidor envie eventos em tempo real ao cliente.'],
    ['Quantos endpoints HTTP o GraphQL normalmente expõe?', ['Um por tabela', 'Geralmente um único endpoint (ex: /graphql)', 'Dez fixos', 'Nenhum'], 1, 'GraphQL centraliza queries e mutations em um único endpoint tipado por um Schema.'],
    ['Quando REST ainda costuma ser mais simples que GraphQL?', ['Cache HTTP simples, uploads de arquivo e APIs CRUD diretas', 'Nunca', 'Apenas em jogos 3D', 'Apenas offline'], 0, 'REST aproveita nativamente cache HTTP, status codes e simplicidade para CRUDs padrão.'],
  ]),

  makeQuiz(16, 'Autenticação: JWT, OAuth2 & Sessões', 'Backend & APIs', 36, 95, [
    ['Quais são as 3 partes de um token JWT (JSON Web Token)?', ['User, Pass, Salt', 'Header, Payload e Signature', 'Key, Value, Hash', 'Public, Private, Secret'], 1, 'Um JWT é composto por Header.Payload.Signature codificados em Base64Url.'],
    ['Por que NUNCA devemos armazenar senhas em texto puro no banco?', ['Ocupa muito espaço', 'Para proteger usuários caso o banco seja vazado (usar hash seguro como bcrypt/scrypt)', 'Porque SQL não aceita letras', 'Porque deixa o login lento'], 1, 'Hashes criptográficos com salt (bcrypt, Argon2, scrypt) impedem a leitura direta das senhas.'],
    ['O que significa HTTPS em comparação com HTTP?', ['Adiciona criptografia TLS/SSL no tráfego entre cliente e servidor', 'Aumenta a resolução das imagens', 'Desativa cookies', 'Funciona apenas no celular'], 0, 'HTTPS protege os dados em trânsito contra interceptação e adulteração.'],
    ['Para que serve a flag "HttpOnly" em um cookie de sessão?', ['Permitir acesso via JavaScript', 'Impedir que scripts JavaScript (XSS) leiam o cookie', 'Apagar o cookie ao recarregar', 'Compartilhar com outros sites'], 1, 'Cookies HttpOnly não ficam acessíveis via document.cookie, mitigando roubo de sessão por XSS.'],
    ['O que o protocolo OAuth 2.0 permite fazer?', ['Login delegado/autorização com provedores como Google e GitHub sem expor a senha', 'Formatar discos na nuvem', 'Compilar TypeScript', 'Enviar SMS'], 0, 'OAuth 2.0 autoriza aplicações a acessarem recursos em nome do usuário via tokens de acesso.'],
  ]),

  makeQuiz(17, 'SQL & Modelagem Relacional (PostgreSQL)', 'Banco de Dados', 43, 115, [
    ['Qual comando SQL recupera dados de uma tabela?', ['INSERT', 'UPDATE', 'SELECT', 'DROP'], 2, 'SELECT consulta registros; WHERE filtra e ORDER BY ordena os resultados.'],
    ['O que garante uma Chave Primária (PRIMARY KEY)?', ['Que a coluna pode repetir valores', 'Identificação única e não nula de cada linha da tabela', 'Que a tabela será apagada', 'Criptografia automática'], 1, 'A Primary Key identifica cada registro de forma única e não permite valores NULL.'],
    ['Qual tipo de JOIN retorna apenas registros que têm correspondência nas duas tabelas?', ['LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN'], 2, 'INNER JOIN retorna somente as linhas em que a condição de junção coincide em ambas as tabelas.'],
    ['Para que serve uma Chave Estrangeira (FOREIGN KEY)?', ['Conectar à internet', 'Garantir integridade referencial entre duas tabelas relacionadas', 'Aumentar o limite de caracteres', 'Gerar backups'], 1, 'Foreign Key assegura que o valor referenciado exista na tabela de destino.'],
    ['O que significa ACID em bancos relacionais?', ['Um tipo de vírus', 'Propriedades de confiabilidade das transações: Atomicidade, Consistência, Isolamento e Durabilidade', 'Um framework CSS', 'Um protocolo de rede'], 1, 'ACID garante que transações bancárias ou críticas sejam executadas de forma segura e íntegra.'],
  ]),

  makeQuiz(18, 'NoSQL: MongoDB & Redis', 'Banco de Dados', 30, 79, [
    ['Em que formato o MongoDB armazena seus registros?', ['Planilhas Excel', 'Documentos flexíveis estilo JSON (BSON)', 'Arquivos MP3', 'Tabelas fixas com JOIN obrigatório'], 1, 'MongoDB é um banco orientado a documentos, armazenando objetos em BSON (Binary JSON).'],
    ['Para qual caso de uso o Redis é mais famoso?', ['Armazenar vídeos 4K', 'Cache em memória ultrarrápido, filas e sessões (chave-valor)', 'Renderizar páginas HTML', 'Editar fotos'], 1, 'Redis mantém dados em memória RAM, oferecendo latência de sub-milissegundos para cache e contadores.'],
    ['Qual é uma vantagem de bancos NoSQL orientados a documentos?', ['Esquema flexível que evolui facilmente sem migrações rígidas', 'Não precisam de servidor', 'Substituem o HTML', 'Não usam rede'], 0, 'Documentos podem ter estruturas variadas na mesma coleção, agilizando iterações rápidas.'],
    ['O que significa TTL (Time To Live) no Redis?', ['Tamanho Total Livre', 'Tempo de expiração automático de uma chave em cache', 'Tipo de Tabela Local', 'Taxa de Transferência'], 1, 'TTL define após quantos segundos uma chave expira e é removida automaticamente da memória.'],
    ['Quando um banco SQL relacional costuma ser melhor que NoSQL?', ['Dados altamente estruturados com muitas relações e transações ACID complexas', 'Cache temporário de 5 segundos', 'Logs não estruturados', 'Armazenamento de imagens brutas'], 0, 'SQL brilha em integridade referencial, relatórios complexos e transações multi-tabela.'],
  ]),

  makeQuiz(19, 'Otimização de Queries & Índices', 'Banco de Dados', 25, 64, [
    ['Para que serve um ÍNDICE (INDEX) em uma tabela SQL?', ['Deixar a tabela bonita', 'Acelerar buscas e filtros evitando leitura completa (Full Table Scan)', 'Comprimir imagens', 'Apagar linhas duplicadas automaticamente'], 1, 'Índices (como B-Tree) permitem localizar registros rapidamente sem varrer toda a tabela.'],
    ['Qual comando SQL mostra o plano de execução de uma query no PostgreSQL?', ['SHOW PLAN', 'EXPLAIN ANALYZE', 'DEBUG QUERY', 'TRACE SQL'], 1, 'EXPLAIN ANALYZE exibe como o otimizador executou a query, tempos reais e uso de índices.'],
    ['O que é o problema de "N+1 queries"?', ['Um erro de sintaxe', 'Fazer 1 consulta inicial e depois N consultas extras dentro de um loop', 'Ter mais de 100 tabelas', 'Usar SELECT *'], 1, 'N+1 degrada muito a performance; resolve-se com JOINs, IN (...) ou DataLoaders.'],
    ['Por que criar índices em TODAS as colunas pode ser ruim?', ['Porque deixa SELECT mais lento', 'Porque aumenta uso de disco e torna INSERT/UPDATE/DELETE mais lentos', 'Porque apaga dados', 'Não tem nenhum custo'], 1, 'Cada escrita precisa atualizar todos os índices da tabela, então indexe apenas colunas filtradas/ordenadas.'],
    ['Por que evitar "SELECT *" em produção?', ['É proibido pelo SQL', 'Trafega colunas desnecessárias, consome mais memória/rede e pode impedir Index-Only Scans', 'Apaga o banco', 'Não funciona com WHERE'], 1, 'Selecionar apenas as colunas necessárias reduz tráfego e melhora cache e performance.'],
  ]),

  makeQuiz(20, 'Git & GitHub: Fluxos e Comandos', 'Cloud & DevOps', 53, 152, [
    ['Qual comando cria e muda imediatamente para uma nova branch no Git?', ['git branch nova', 'git checkout -b nova (ou git switch -c nova)', 'git commit -b nova', 'git merge nova'], 1, 'git checkout -b ou o moderno git switch -c criam a branch e já mudam para ela.'],
    ['Qual é a diferença entre "git fetch" e "git pull"?', ['Não há diferença', 'fetch baixa alterações sem mesclar; pull faz fetch + merge/rebase na branch atual', 'pull envia código para o GitHub', 'fetch apaga commits'], 1, 'git fetch atualiza referências remotas com segurança antes de integrar com sua branch local.'],
    ['O que é um Pull Request (PR) no GitHub?', ['Um pedido para apagar o repositório', 'Uma proposta de alteração com revisão de código antes de mesclar na branch principal', 'Um erro de rede', 'Um backup automático'], 1, 'PRs permitem revisar diffs, rodar CI e aprovar código antes do merge em main.'],
    ['Para que serve o arquivo .gitignore?', ['Esconder senhas no código-fonte', 'Listar arquivos/pastas (como node_modules e .env) que o Git NÃO deve rastrear', 'Configurar o Vite', 'Rodar testes'], 1, 'O .gitignore evita versionar dependências pesadas, builds e arquivos locais sensíveis.'],
    ['Qual comando desfaz o último commit mantendo os arquivos modificados no workspace?', ['git reset --soft HEAD~1', 'git rm -rf .', 'git push --force', 'git clean -fd'], 0, 'git reset --soft HEAD~1 volta o ponteiro do commit mantendo suas alterações prontas para novo commit.'],
  ]),

  makeQuiz(21, 'Docker & Containers na Prática', 'Cloud & DevOps', 41, 108, [
    ['Qual problema principal o Docker resolve?', ['Substitui a linguagem de programação', 'Garante que a aplicação rode igual em qualquer máquina ("na minha máquina funciona")', 'Cria designs no Figma', 'Substitui o Git'], 1, 'Containers empacotam código, runtime e dependências de forma isolada e reproduzível.'],
    ['Qual arquivo contém as instruções para construir uma imagem Docker?', ['docker-build.json', 'Dockerfile', 'package.docker', 'container.yml'], 1, 'O Dockerfile define imagem base (FROM), cópia de arquivos (COPY), build (RUN) e comando inicial (CMD).'],
    ['Qual é a diferença entre Imagem e Container no Docker?', ['Imagem é o molde imutável; Container é a instância em execução dessa imagem', 'Container é maior que o disco', 'São a mesma coisa', 'Imagem só roda no Windows'], 0, 'Você pode subir vários containers independentes a partir de uma única imagem.'],
    ['Para que serve o Docker Compose?', ['Editar vídeos', 'Orquestrar múltiplos containers (ex: app + banco + redis) em um arquivo YAML', 'Compilar React', 'Monitorar Wi-Fi'], 1, 'docker-compose.yml sobe toda a stack conectada em rede com um único comando.'],
    ['Por que usar Volumes no Docker para bancos de dados?', ['Para aumentar o som', 'Para persistir os dados mesmo quando o container for removido ou recriado', 'Para acelerar o CSS', 'Para gerar tokens'], 1, 'Sem volumes, dados gravados dentro do container são perdidos ao destruí-lo.'],
  ]),

  makeQuiz(22, 'CI/CD & Automação de Deploy', 'Cloud & DevOps', 28, 72, [
    ['O que significa a sigla CI (Continuous Integration)?', ['Código Interno', 'Integrar código frequentemente com build e testes automatizados a cada commit/PR', 'Computação Inteligente', 'Conexão Imediata'], 1, 'CI valida automaticamente cada alteração com lint, testes e build para detectar falhas cedo.'],
    ['O que significa CD (Continuous Deployment / Delivery)?', ['Compactação de Dados', 'Automatizar a entrega/publicação do software após passar pelas validações de CI', 'Controle de Domínio', 'Código Descartável'], 1, 'CD reduz erros manuais e acelera a entrega de novas versões em staging ou produção.'],
    ['Qual ferramenta nativa do GitHub automatiza pipelines de CI/CD via YAML?', ['GitHub Pages', 'GitHub Actions', 'GitHub Gist', 'GitHub Wiki'], 1, 'Workflows em .github/workflows/*.yml executam testes, builds e deploys automaticamente.'],
    ['Por que rodar testes automatizados antes do deploy em produção?', ['Para gastar memória', 'Para impedir que regressões e bugs quebrados cheguem aos usuários finais', 'Para atrasar o time', 'Não é necessário'], 1, 'Testes no pipeline funcionam como rede de segurança contínua para o time.'],
    ['O que é um ambiente de "Staging" (Homologação)?', ['O computador pessoal do dev', 'Um ambiente espelho da produção usado para validar mudanças antes do lançamento final', 'O banco de dados de produção', 'Um editor de texto'], 1, 'Staging permite testar integrações reais sem impactar usuários finais.'],
  ]),

  makeQuiz(23, 'Cloud Computing (AWS, Azure & Vercel)', 'Cloud & DevOps', 35, 91, [
    ['O que é uma função Serverless (como Vercel Functions ou AWS Lambda)?', ['Um servidor físico no escritório', 'Código executado sob demanda sem precisar gerenciar infraestrutura ou servidores 24/7', 'Um site sem HTML', 'Um banco offline'], 1, 'No modelo Serverless, a nuvem escala automaticamente e você paga apenas pelo tempo de execução.'],
    ['O que é uma CDN (Content Delivery Network)?', ['Um banco relacional', 'Rede de servidores distribuídos geograficamente que entrega conteúdo estático mais perto do usuário', 'Um protocolo de e-mail', 'Uma linguagem de backend'], 1, 'CDNs reduzem drasticamente a latência servindo assets a partir do ponto de presença mais próximo.'],
    ['Qual serviço da AWS é referência para armazenamento de objetos/arquivos (imagens, backups)?', ['AWS EC2', 'Amazon S3', 'AWS IAM', 'Amazon VPC'], 1, 'Amazon S3 (Simple Storage Service) armazena arquivos escaláveis com alta durabilidade.'],
    ['O que significa "Escalabilidade Horizontal"?', ['Aumentar RAM e CPU de uma única máquina', 'Adicionar mais instâncias/servidores trabalhando em paralelo', 'Reduzir o tamanho da fonte', 'Apagar logs antigos'], 1, 'Escalar horizontalmente (scale out) distribui a carga entre múltiplas máquinas/réplicas.'],
    ['Por que guardar chaves secretas em Variáveis de Ambiente na nuvem em vez do código?', ['Para ficar mais rápido', 'Para evitar vazamento de credenciais no histórico do Git', 'Porque o navegador exige', 'Para diminuir o CSS'], 1, 'Segredos (API keys, DATABASE_URL) nunca devem ser commitados no repositório.'],
  ]),

  makeQuiz(24, 'Linux & Linha de Comando (Bash)', 'Cloud & DevOps', 32, 85, [
    ['Qual comando lista arquivos e pastas (incluindo ocultos com -a) no Linux?', ['dir', 'ls -la', 'cd ..', 'cat'], 1, 'ls -la mostra permissões, donos, tamanhos e arquivos ocultos iniciados por ponto.'],
    ['Qual comando busca um texto específico dentro de arquivos?', ['grep', 'mkdir', 'chmod', 'touch'], 0, 'grep filtra linhas que correspondem a um padrão ou expressão regular em arquivos ou streams.'],
    ['O que o comando "chmod +x script.sh" faz?', ['Apaga o script', 'Adiciona permissão de execução ao arquivo', 'Compacta o arquivo', 'Abre no navegador'], 1, 'chmod altera permissões de leitura (r), escrita (w) e execução (x) no Linux.'],
    ['Qual símbolo redireciona a saída de um comando como entrada para outro (Pipeline)?', ['>', '|', '&', '$'], 1, 'O pipe (|) conecta stdout de um comando ao stdin do próximo, ex: cat log.txt | grep ERROR.'],
    ['Qual comando mostra o diretório de trabalho atual?', ['pwd', 'whoami', 'ps', 'df -h'], 0, 'pwd (Print Working Directory) exibe o caminho completo da pasta onde você está.'],
  ]),

  makeQuiz(25, 'Cibersegurança & OWASP Top 10', 'Segurança & Redes', 47, 130, [
    ['O que é SQL Injection?', ['Um comando para acelerar queries', 'Inserção de código SQL malicioso em inputs para manipular ou vazar o banco de dados', 'Uma técnica de backup', 'Um antivírus'], 1, 'Previne-se SQL Injection usando queries parametrizadas (prepared statements) e validação.'],
    ['O que é XSS (Cross-Site Scripting)?', ['Troca de estilos CSS', 'Injeção de scripts maliciosos executados no navegador de outros usuários', 'Um tipo de roteador', 'Erro de DNS'], 1, 'Escapar/sanitizar saídas HTML e usar CSP + cookies HttpOnly protegem contra XSS.'],
    ['O que significa o princípio do "Menor Privilégio"?', ['Dar acesso admin a todos', 'Conceder a cada usuário/serviço apenas as permissões mínimas necessárias', 'Não usar senhas', 'Desligar o firewall'], 1, 'Limitar permissões reduz drasticamente o impacto caso uma conta ou serviço seja comprometido.'],
    ['O que é autenticação em dois fatores (2FA/MFA)?', ['Digitar a senha duas vezes', 'Exigir uma segunda verificação além da senha (ex: código TOTP, biometria ou chave física)', 'Usar dois navegadores', 'Ter duas contas'], 1, 'MFA bloqueia a maioria dos ataques mesmo que a senha do usuário tenha sido vazada.'],
    ['O que caracteriza um ataque de Phishing?', ['Sobrecarga de tráfego DDoS', 'Engenharia social por e-mail/site falso para enganar a vítima e roubar credenciais', 'Criptografia de disco', 'Varredura de portas'], 1, 'Phishing explora o fator humano fingindo ser uma instituição ou colega confiável.'],
  ]),

  makeQuiz(26, 'Redes de Computadores, DNS & TCP/IP', 'Segurança & Redes', 29, 74, [
    ['Qual é a função do DNS (Domain Name System)?', ['Criptografar senhas', 'Traduzir nomes de domínio (ex: google.com) para endereços IP', 'Aumentar a velocidade do Wi-Fi', 'Bloquear pop-ups'], 1, 'O DNS funciona como a agenda telefônica da internet, resolvendo domínios em IPs.'],
    ['Qual porta padrão é usada pelo protocolo HTTPS?', ['22', '80', '443', '3306'], 2, 'HTTP usa porta 80; HTTPS usa porta 443; SSH usa porta 22.'],
    ['Qual é a principal diferença entre TCP e UDP?', ['TCP garante entrega ordenada e confiável; UDP é mais rápido sem garantia de entrega', 'UDP é só para textos', 'TCP não usa IPs', 'São idênticos'], 0, 'TCP é ideal para web e APIs; UDP é muito usado em streaming ao vivo, VoIP e jogos online.'],
    ['Para que serve o endereço IP 127.0.0.1 (localhost)?', ['Acessar o roteador da rua', 'Apontar para a própria máquina local (loopback)', 'Conectar à AWS', 'Enviar e-mails'], 1, '127.0.0.1 é o endereço de loopback usado para testar serviços rodando no próprio computador.'],
    ['O que faz um Balanceador de Carga (Load Balancer)?', ['Limita a bateria', 'Distribui o tráfego de entrada entre vários servidores para evitar sobrecarga', 'Apaga cache do navegador', 'Gera certificados PDF'], 1, 'Load Balancers aumentam disponibilidade e desempenho distribuindo requisições entre réplicas.'],
  ]),

  makeQuiz(27, 'Inteligência Artificial & LLMs', 'IA & Dados', 58, 175, [
    ['O que significa a sigla LLM?', ['Local Logic Machine', 'Large Language Model (Modelo de Linguagem Grande)', 'Linear Learning Method', 'Low Latency Memory'], 1, 'LLMs são modelos treinados em enormes volumes de texto para compreender e gerar linguagem natural e código.'],
    ['O que são "tokens" em um LLM?', ['Moedas virtuais', 'Unidades de texto (palavras ou subpalavras) processadas pelo modelo', 'Senhas de Wi-Fi', 'Imagens vetoriais'], 1, 'Modelos dividem o texto em tokens para calcular contexto, limites de janela e custo.'],
    ['O que significa "alucinação" em IA generativa?', ['Quando o servidor desliga', 'Quando o modelo gera uma informação falsa ou inventada com aparência confiante', 'Quando o áudio falha', 'Quando a tela pisca'], 1, 'Por preverem o próximo token provável, LLMs podem fabricar fatos se não houver verificação ou RAG.'],
    ['Para que serve a técnica RAG (Retrieval-Augmented Generation)?', ['Aumentar a resolução de tela', 'Buscar documentos reais atualizados e injetá-los no contexto do modelo antes da resposta', 'Treinar do zero toda semana', 'Substituir o CSS'], 1, 'RAG conecta o LLM a bases de conhecimento próprias, reduzindo alucinações e trazendo dados atuais.'],
    ['O que o parâmetro "Temperature" controla na geração de texto?', ['O calor da GPU', 'O grau de aleatoriedade/criatividade nas respostas do modelo', 'A velocidade da internet', 'O idioma padrão'], 1, 'Temperatura baixa (ex: 0.1) gera respostas mais determinísticas; alta (ex: 0.8) traz mais criatividade.'],
  ]),

  makeQuiz(28, 'Engenharia de Prompt & IA Generativa', 'IA & Dados', 45, 124, [
    ['O que é "Few-Shot Prompting"?', ['Enviar o prompt sem texto', 'Fornecer alguns exemplos de entrada e saída esperada dentro do prompt', 'Usar apenas 2 palavras', 'Reiniciar o chat'], 1, 'Mostrar 2 ou 3 exemplos claros guia o modelo a seguir exatamente o formato e estilo desejados.'],
    ['Por que definir um "papel/persona" (ex: "Atue como arquiteto de software") ajuda?', ['Deixa o servidor mais frio', 'Direciona o vocabulário, profundidade técnica e critérios da resposta', 'Remove limites de tokens', 'Desbloqueia senhas'], 1, 'Contextualizar o papel e o público-alvo melhora muito a precisão da resposta gerada.'],
    ['O que é "Chain-of-Thought" (Cadeia de Pensamento)?', ['Pedir ao modelo que raciocine passo a passo antes de dar a resposta final', 'Encadear 10 APIs', 'Traduzir para inglês', 'Apagar o histórico'], 1, 'Raciocinar por etapas reduz erros em problemas de lógica, matemática e programação.'],
    ['Qual cuidado de segurança é essencial ao usar ferramentas de IA no trabalho?', ['Colar senhas e chaves privadas para testar', 'Nunca enviar segredos, tokens ou dados sensíveis de clientes em prompts públicos', 'Desativar HTTPS', 'Usar sempre a mesma senha'], 1, 'Dados confidenciais, credenciais e PII não devem ser expostos em prompts externos.'],
    ['Como pedir respostas estruturadas para integrar IA em um sistema?', ['Pedindo "seja criativo"', 'Especificando esquema JSON estrito / Structured Outputs', 'Usando apenas emojis', 'Escrevendo tudo em maiúsculas'], 1, 'Definir um JSON Schema garante saída previsível e fácil de parsear no código.'],
  ]),

  makeQuiz(29, 'Ciência de Dados & Machine Learning', 'IA & Dados', 33, 88, [
    ['Qual é a diferença entre Aprendizado Supervisionado e Não Supervisionado?', ['Supervisionado usa dados rotulados (com resposta conhecida); Não Supervisionado encontra padrões sem rótulos', 'Não Supervisionado não usa computador', 'Supervisionado exige câmera', 'Não há diferença'], 0, 'Classificação e regressão são supervisionados; clusterização (ex: K-Means) é não supervisionada.'],
    ['O que é "Overfitting" em um modelo de Machine Learning?', ['O modelo aprendeu tão bem os ruídos do treino que erra em dados novos', 'O arquivo ficou grande demais', 'Falta de memória RAM', 'O modelo nunca termina de treinar'], 0, 'Overfitting prejudica a generalização; combate-se com mais dados, regularização e validação cruzada.'],
    ['Qual biblioteca Python é referência para manipulação de tabelas (DataFrames)?', ['Flask', 'Pandas', 'PyGame', 'Tkinter'], 1, 'Pandas oferece DataFrames poderosos para limpeza, filtragem e análise de dados tabulares.'],
    ['Para que dividimos os dados em conjunto de Treino e Teste?', ['Para economizar energia', 'Para avaliar se o modelo generaliza bem em dados nunca vistos antes', 'Para duplicar o banco', 'Para apagar nulos'], 1, 'Avaliar no conjunto de teste mede o desempenho real fora da amostra de treinamento.'],
    ['Qual métrica mede a proporção de previsões corretas sobre o total em classificação?', ['Latência', 'Acurácia (Accuracy)', 'Bandwidth', 'Throughput'], 1, 'Acurácia = acertos / total, embora em classes desbalanceadas também se use Precision, Recall e F1-Score.'],
  ]),

  makeQuiz(30, 'Metodologias Ágeis: Scrum & Kanban', 'TI / SWOT', 49, 136, [
    ['Qual é a duração típica de uma Sprint no Scrum?', ['6 meses', '1 a 4 semanas (time-boxed)', '2 horas', '1 ano'], 1, 'Sprints são ciclos curtos de 1 a 4 semanas para entregar incrementos funcionais com feedback rápido.'],
    ['Qual cerimônia do Scrum tem foco em inspecionar o processo e melhorar o trabalho do time na próxima Sprint?', ['Daily Scrum', 'Sprint Planning', 'Sprint Retrospective (Retrospectiva)', 'Deploy'], 2, 'Na Retrospectiva, o time analisa o que funcionou bem e o que precisa melhorar na colaboração.'],
    ['No Kanban, o que significa limitar o WIP (Work In Progress)?', ['Proibir novos clientes', 'Limitar quantas tarefas podem estar em andamento simultaneamente para evitar gargalos', 'Apagar o quadro toda sexta', 'Trabalhar sem prazos'], 1, 'Limitar o WIP aumenta o fluxo de entrega e evita muitas tarefas iniciadas e poucas concluídas.'],
    ['Quem é responsável por priorizar o Product Backlog maximizando o valor do produto?', ['Scrum Master', 'Product Owner (PO)', 'Estagiário de redes', 'Auditor externo'], 1, 'O Product Owner gerencia e prioriza o Backlog alinhado às necessidades do negócio e usuários.'],
    ['Qual é o objetivo da Daily Scrum (reunião diária de ~15 min)?', ['Fazer relatório longo para o chefe', 'Alinhar o progresso em direção à meta da Sprint e identificar impedimentos', 'Codar em grupo', 'Avaliar salários'], 1, 'A Daily é uma sincronização rápida dos desenvolvedores sobre o dia e possíveis bloqueios.'],
  ]),
];
