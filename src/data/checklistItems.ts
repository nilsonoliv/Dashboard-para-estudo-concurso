export interface ChecklistItem {
  id: string;
  category: string;
  text: string;
}

export const COUNTDOWN_TARGETS = {
  etapa2: { label: 'Contagem Regressiva para Etapa 2', date: '2026-10-25T00:00:00' },
  bonito: { label: 'Contagem Bonito', date: '2026-09-20T00:00:00', ticket: 441 },
  ibge2: { label: 'Contagem IBGE 2', date: '2026-09-27T00:00:00', ticket: 50 },
  formosa: { label: 'Contagem Formosa', date: '2026-10-11T00:00:00', ticket: 900 },
};

export const BASE_CHECKLIST_ITEMS: ChecklistItem[] = [
  // Ciclo de Estudos
  { id: 'di1', category: 'Ciclo de Estudos', text: 'C. Esp Bonito' },
  { id: 'di2', category: 'Ciclo de Estudos', text: 'Português' },
  { id: 'di3', category: 'Ciclo de Estudos', text: 'Matemática' },
  { id: 'di4', category: 'Ciclo de Estudos', text: 'Informática' },
  { id: 'di5', category: 'Ciclo de Estudos', text: 'C. Gerais Bonito' },
  { id: 'di6', category: 'Ciclo de Estudos', text: 'Simulado da Apk' },
  { id: 'di7', category: 'Ciclo de Estudos', text: 'C. Esp Bonito' },
  { id: 'di8', category: 'Ciclo de Estudos', text: 'C. Locais Bonito' },
  { id: 'di9', category: 'Ciclo de Estudos', text: 'Matemática' },
  { id: 'di10', category: 'Ciclo de Estudos', text: 'C. Esp Formosa' },
  { id: 'di11', category: 'Ciclo de Estudos', text: 'Simulado Bonito' },
  { id: 'di12', category: 'Ciclo de Estudos', text: 'C. Esp Bonito' },
  { id: 'di13', category: 'Ciclo de Estudos', text: 'Português' },
  { id: 'di14', category: 'Ciclo de Estudos', text: 'RLM' },
  { id: 'di15', category: 'Ciclo de Estudos', text: 'Simulado Bonito' },
  { id: 'di16', category: 'Ciclo de Estudos', text: 'C. Locais Bonito' },
  { id: 'di17', category: 'Ciclo de Estudos', text: 'Legislação Merendeira' },
  { id: 'di18', category: 'Ciclo de Estudos', text: 'Simulado da Apk' },
  { id: 'di19', category: 'Ciclo de Estudos', text: 'C. Esp Bonito' },
  { id: 'di20', category: 'Ciclo de Estudos', text: 'Matemática' },
  { id: 'di21', category: 'Ciclo de Estudos', text: 'C. Esp. Merendeira' },
  { id: 'di22', category: 'Ciclo de Estudos', text: 'Legislação e Ética na Adm P.' },
  { id: 'di23', category: 'Ciclo de Estudos', text: 'RLM' },
  { id: 'di24', category: 'Ciclo de Estudos', text: 'Simulado Bonito' },

  // Língua Portuguesa
  { id: 'lp1', category: 'Língua Portuguesa', text: '🔥 QUENTE - Compreensão e Interpretação de Textos: Análise de textos variados, digitais (e-mails, redes sociais) e multimodais (gráficos, tabelas).' },
  { id: 'lp2', category: 'Língua Portuguesa', text: '🔥 QUENTE - Coesão, coerência e uso de conectores.' },
  { id: 'lp3', category: 'Língua Portuguesa', text: '🔥 QUENTE - Pontuação: Uso correto dos sinais de pontuação.' },
  { id: 'lp4', category: 'Língua Portuguesa', text: '🔥 QUENTE - Concordância verbal e nominal.' },
  { id: 'lp5', category: 'Língua Portuguesa', text: '🔥 QUENTE - Regência verbal e nominal e uso da crase.' },
  { id: 'lp6', category: 'Língua Portuguesa', text: '🔥 QUENTE - Reescrita de frases e textos.' },
  { id: 'lp7', category: 'Língua Portuguesa', text: '🟡 MORNO - Emprego das classes de palavras e colocação de pronomes.' },
  { id: 'lp8', category: 'Língua Portuguesa', text: '🟡 MORNO - Emprego correto de tempos e modos verbais.' },
  { id: 'lp9', category: 'Língua Portuguesa', text: '🟡 MORNO - Estrutura de orações e períodos (Sintaxe).' },
  { id: 'lp10', category: 'Língua Portuguesa', text: '🟡 MORNO - Relações de coordenação e subordinação.' },
  { id: 'lp11', category: 'Língua Portuguesa', text: '🟡 MORNO - Significado de palavras (sinônimos, antônimos, etc.).' },
  { id: 'lp12', category: 'Língua Portuguesa', text: '❄️ FRIO - Ortografia oficial.' },
  { id: 'lp13', category: 'Língua Portuguesa', text: '❄️ FRIO - Identificação de tipos textuais.' },
  { id: 'lp14', category: 'Língua Portuguesa', text: '❄️ FRIO - Figuras de linguagem, denotação e conotação.' },
  { id: 'lp15', category: 'Língua Portuguesa', text: '❄️ FRIO - Adequação da linguagem a diferentes contextos.' },
  { id: 'lp16', category: 'Língua Portuguesa', text: '🔥 QUENTE - Correspondência oficial (conforme Manual de Redação da Presidência da República).' },

  // Saúde Pública
  { id: 'cef1', category: 'Saúde Pública', text: '🟡 MORNO - Noções de vigilância sanitária municipal: conceito, competências do Município (Lei nº 9.782/1999 - ANVISA).' },
  { id: 'cef2', category: 'Saúde Pública', text: '🔥 QUENTE - Diretrizes Nacionais para prevenção e controle de epidemias da Dengue.' },
  { id: 'cef3', category: 'Saúde Pública', text: '🔥 QUENTE - Noções de saneamento básico: abastecimento de água, esgotamento sanitário, resíduos sólidos e controle de vetores.' },
  { id: 'cef4', category: 'Saúde Pública', text: '🟡 MORNO - Procedimento administrativo de fiscalização sanitária municipal: notificação e auto de infração.' },
  { id: 'cef5', category: 'Saúde Pública', text: '🟡 MORNO - Boas práticas de higiene e segurança sanitária em estabelecimentos de alimentos.' },
  { id: 'cef6', category: 'Saúde Pública', text: '🟡 MORNO - Noções de educação em saúde e comunicação com a comunidade.' },
  { id: 'cef7', category: 'Saúde Pública', text: '🔥 QUENTE - Vigilância em Saúde da Esquistossomose, Malária, Tracoma.' },
  { id: 'cef8', category: 'Saúde Pública', text: '❄️ FRIO - Noções de saúde pública, epidemiologia e saneamento.' },
  { id: 'cef9', category: 'Saúde Pública', text: '❄️ FRIO - Vigilância em saúde sanitária e controle de zoonoses.' },
  { id: 'cef23', category: 'Saúde Pública', text: '🔥 QUENTE - Evolução histórica das Políticas públicas de saúde no Brasil: SUS, princípios e Diretrizes.' },
  { id: 'cef24', category: 'Saúde Pública', text: '🔥 QUENTE - Regulamentação da Profissão de Agente de combate às endemias (Lei Federal nº 11.350/2006).' },
  { id: 'cef33', category: 'Saúde Pública', text: '🔥 QUENTE - Política Nacional de Atenção Básica: Conceito, Princípios e Financiamento.' },
];

export const PEDAGOGICAL_CHECKLIST_ITEMS: ChecklistItem[] = [
  // Conhecimentos Locais Bonito
  { id: 'lbo1', category: 'C. Locais Bonito', text: '🔥 QUENTE - Geografia de Bonito: Meios de transporte e comunicação, limites, território, povoados, distritos.' },
  { id: 'lbo2', category: 'C. Locais Bonito', text: '🔥 QUENTE - Geografia de Bonito: Pontos extremos, relevo, clima, hidrografia.' },
  { id: 'lbo3', category: 'C. Locais Bonito', text: '🔥 QUENTE - Geografia de Bonito: Desenvolvimento humano, economia, extrativismo.' },
  { id: 'lbo4', category: 'C. Locais Bonito', text: '🔥 QUENTE - Geografia de Bonito: Pontos turísticos e folclore.' },
  { id: 'lbo5', category: 'C. Locais Bonito', text: '🔥 QUENTE - História de Bonito: Autoridades Municipais e símbolos.' },
  { id: 'lbo6', category: 'C. Locais Bonito', text: '🔥 QUENTE - Símbolos do município e datas cívicas e sociais.' },
  { id: 'lbo7', category: 'C. Locais Bonito', text: '🔥 QUENTE - Acontecimentos importantes ocorridos em Bonito.' },
  { id: 'lbo8', category: 'C. Locais Bonito', text: '🔥 QUENTE - Formação do Município de Bonito (período pré-emancipatório ao contemporâneo).' },
  { id: 'lbo9', category: 'C. Locais Bonito', text: '🟡 MORNO - Lei Orgânica do Município de Bonito.' },

  // C. Esp. Merendeira
  { id: 'CespM1', category: 'C. Esp. Merendeira', text: '🔥 QUENTE - Programa Nacional de Alimentação Escolar (PNAE).' },
  { id: 'CespM2', category: 'C. Esp. Merendeira', text: '🔥 QUENTE - Técnicas de pré-preparo, preparo e cocção.' },
  { id: 'CespM3', category: 'C. Esp. Merendeira', text: '🔥 QUENTE - Controle de estoque de alimentos perecíveis e não perecíveis e desperdício.' },
  { id: 'CespM4', category: 'C. Esp. Merendeira', text: '🔥 QUENTE - Controle de temperatura e congelamento/descongelamento.' },
  { id: 'CespM5', category: 'C. Esp. Merendeira', text: '🔥 QUENTE - Noções gerais de higiene e manipulação de alimentos (RDC 216/04).' },
  { id: 'CespM6', category: 'C. Esp. Merendeira', text: '🔥 QUENTE - Doenças Transmitidas por Alimentos (DTAs) e cuidados.' },
  { id: 'CespM7', category: 'C. Esp. Merendeira', text: '🔥 QUENTE - Segurança no trabalho: EPI e EPC no preparo de refeições.' },

  // Tecnologia da Informação
  { id: 'ti63', category: 'Tecnologia da Informação', text: '🔥 QUENTE - Arquitetura de computadores e periféricos.' },
  { id: 'ti65', category: 'Tecnologia da Informação', text: '🔥 QUENTE - Instalação e configuração de redes de computadores.' },
  { id: 'ti66', category: 'Tecnologia da Informação', text: '🔥 QUENTE - Sistemas operacionais Windows / Linux.' },
  { id: 'ti69', category: 'Tecnologia da Informação', text: '🟡 MORNO - Internet: conceitos gerais, protocolos e segurança.' },
  { id: 'ti74', category: 'Tecnologia da Informação', text: '🔥 QUENTE - Modelagem e conceitos de banco de dados relacionais (SQL).' },
];
