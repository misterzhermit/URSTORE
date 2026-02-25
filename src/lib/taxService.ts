export interface NCMSuggestion {
  name: string;
  ncm: string;
  emoji: string;
}

export const ACTIVITY_SECTORS = [
  'Hortifruti',
  'Padaria',
  'Açougue',
  'Mercado',
  'Bebidas'
] as const;

export const NCM_DATABASE: Record<string, NCMSuggestion[]> = {
  'Hortifruti': [
    { name: 'Tomate Italiano', ncm: '0702.00.00', emoji: '🍅' },
    { name: 'Tomate Débora', ncm: '0702.00.00', emoji: '🍅' },
    { name: 'Tomate Carmem', ncm: '0702.00.00', emoji: '🍅' },
    { name: 'Tomate Cereja', ncm: '0702.00.00', emoji: '🍅' },
    { name: 'Batata Monalisa', ncm: '0701.90.00', emoji: '🥔' },
    { name: 'Batata Asterix', ncm: '0701.90.00', emoji: '🥔' },
    { name: 'Batata Doce', ncm: '0714.20.00', emoji: '🍠' },
    { name: 'Cebola Branca', ncm: '0703.10.11', emoji: '🧅' },
    { name: 'Cebola Roxa', ncm: '0703.10.11', emoji: '🧅' },
    { name: 'Alface Crespa', ncm: '0705.11.00', emoji: '🥬' },
    { name: 'Alface Americana', ncm: '0705.11.00', emoji: '🥬' },
    { name: 'Alface Roxa', ncm: '0705.11.00', emoji: '🥬' },
    { name: 'Banana Nanica', ncm: '0803.90.00', emoji: '🍌' },
    { name: 'Banana Prata', ncm: '0803.90.00', emoji: '🍌' },
    { name: 'Maçã Fuji', ncm: '0808.10.00', emoji: '🍎' },
    { name: 'Maçã Gala', ncm: '0808.10.00', emoji: '🍎' },
    { name: 'Cenoura', ncm: '0706.10.00', emoji: '🥕' },
    { name: 'Chuchu', ncm: '0709.99.90', emoji: '🥒' },
    { name: 'Abobrinha Italiana', ncm: '0709.93.00', emoji: '🥒' },
    { name: 'Pimentão Verde', ncm: '0709.60.00', emoji: '🫑' },
    { name: 'Pimentão Amarelo', ncm: '0709.60.00', emoji: '🫑' },
    { name: 'Pimentão Vermelho', ncm: '0709.60.00', emoji: '🫑' },
    { name: 'Alho Roxo', ncm: '0703.20.10', emoji: '🧄' },
    { name: 'Ovos Brancos (Dúzia)', ncm: '0407.21.00', emoji: '🥚' },
    { name: 'Ovos Vermelhos (Dúzia)', ncm: '0407.21.00', emoji: '🥚' },
  ],
  'Padaria': [
    { name: 'Pão Francês', ncm: '1905.90.90', emoji: '🥖' },
    { name: 'Pão de Forma', ncm: '1905.90.10', emoji: '🍞' },
    { name: 'Pão de Queijo', ncm: '1901.20.00', emoji: '🧀' },
    { name: 'Bolo de Chocolate', ncm: '1905.90.90', emoji: '🍰' },
    { name: 'Bolo de Cenoura', ncm: '1905.90.90', emoji: '🍰' },
    { name: 'Sonho', ncm: '1905.90.90', emoji: '🍩' },
    { name: 'Leite Integral', ncm: '0401.20.10', emoji: '🥛' },
    { name: 'Manteiga com Sal', ncm: '0405.10.00', emoji: '🧈' },
    { name: 'Presunto Cozido', ncm: '1602.41.00', emoji: '🍖' },
    { name: 'Queijo Mussarela', ncm: '0406.90.10', emoji: '🧀' },
  ],
  'Açougue': [
    { name: 'Patinho Bovino', ncm: '0201.30.00', emoji: '🥩' },
    { name: 'Alcatra Bovino', ncm: '0201.30.00', emoji: '🥩' },
    { name: 'Contra Filé', ncm: '0201.30.00', emoji: '🥩' },
    { name: 'Coxão Mole', ncm: '0201.30.00', emoji: '🥩' },
    { name: 'Carne Moída de Primeira', ncm: '0201.30.00', emoji: '🥩' },
    { name: 'Frango Inteiro', ncm: '0207.11.00', emoji: '🍗' },
    { name: 'Peito de Frango', ncm: '0207.14.11', emoji: '🍗' },
    { name: 'Sobrecoxa de Frango', ncm: '0207.14.13', emoji: '🍗' },
    { name: 'Linguiça Toscana', ncm: '1601.00.00', emoji: '🌭' },
    { name: 'Copa Lombo Suína', ncm: '0203.19.00', emoji: '🥩' },
    { name: 'Costela Bovina', ncm: '0201.20.00', emoji: '🥩' },
  ],
  'Mercado': [
    { name: 'Arroz Agulhinha Tipo 1 (5kg)', ncm: '1006.30.11', emoji: '🌾' },
    { name: 'Feijão Carioca (1kg)', ncm: '0713.33.19', emoji: '🫘' },
    { name: 'Açúcar Refinado (1kg)', ncm: '1701.99.00', emoji: '🧂' },
    { name: 'Sal Refinado (1kg)', ncm: '2501.00.11', emoji: '🧂' },
    { name: 'Café Torrado e Moído (500g)', ncm: '0901.21.00', emoji: '☕' },
    { name: 'Óleo de Soja (900ml)', ncm: '1507.90.11', emoji: '🛢️' },
    { name: 'Macarrão Espaguete', ncm: '1902.19.00', emoji: '🍝' },
    { name: 'Extrato de Tomate', ncm: '2103.20.10', emoji: '🥫' },
    { name: 'Detergente Líquido', ncm: '3402.20.00', emoji: '🧼' },
    { name: 'Sabão em Pó', ncm: '3402.20.00', emoji: '🧼' },
    { name: 'Papel Higiênico (Leve 12 Pague 11)', ncm: '4818.10.00', emoji: '🧻' },
  ],
  'Bebidas': [
    { name: 'Cerveja Lata (350ml)', ncm: '2203.00.00', emoji: '🍺' },
    { name: 'Cerveja Garrafa (600ml)', ncm: '2203.00.00', emoji: '🍺' },
    { name: 'Refrigerante Cola (2L)', ncm: '2202.10.00', emoji: '🥤' },
    { name: 'Água Mineral sem Gás (500ml)', ncm: '2201.10.00', emoji: '💧' },
    { name: 'Água Mineral com Gás (500ml)', ncm: '2201.10.00', emoji: '🫧' },
    { name: 'Suco de Laranja Integral (1L)', ncm: '2009.12.00', emoji: '🍊' },
    { name: 'Vinho Tinto Seco', ncm: '2204.21.00', emoji: '🍷' },
    { name: 'Vodka (750ml)', ncm: '2208.60.00', emoji: '🍸' },
  ]
};

export const getSuggestionsForSector = (sector: string): NCMSuggestion[] => {
  return NCM_DATABASE[sector] || [];
};
