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
    { name: 'Tomate Carmem', ncm: '0702.00.00', emoji: '🍅' },
    { name: 'Tomate Cereja', ncm: '0702.00.00', emoji: '🍅' },
    { name: 'Batata Monalisa', ncm: '0701.90.00', emoji: '🥔' },
    { name: 'Batata Doce', ncm: '0714.20.00', emoji: '🍠' },
    { name: 'Cebola Branca', ncm: '0703.10.11', emoji: '🧅' },
    { name: 'Cebola Roxa', ncm: '0703.10.11', emoji: '🧅' },
    { name: 'Alface Crespa', ncm: '0705.11.00', emoji: '🥬' },
    { name: 'Alface Americana', ncm: '0705.11.00', emoji: '🥬' },
    { name: 'Banana Nanica', ncm: '0803.90.00', emoji: '🍌' },
    { name: 'Banana Prata', ncm: '0803.90.00', emoji: '🍌' },
    { name: 'Maçã Fuji', ncm: '0808.10.00', emoji: '🍎' },
    { name: 'Maçã Gala', ncm: '0808.10.00', emoji: '🍎' },
    { name: 'Cenoura', ncm: '0706.10.00', emoji: '🥕' },
    { name: 'Pimentão Verde', ncm: '0709.60.00', emoji: '🫑' },
    { name: 'Pimentão Amarelo', ncm: '0709.60.00', emoji: '🫑' },
  ],
  'Padaria': [
    { name: 'Pão Francês', ncm: '1905.90.90', emoji: '🥖' },
    { name: 'Pão de Forma', ncm: '1905.90.10', emoji: '🍞' },
    { name: 'Bolo de Chocolate', ncm: '1905.90.90', emoji: '🍰' },
    { name: 'Sonho', ncm: '1905.90.90', emoji: '🍩' },
    { name: 'Leite Integral', ncm: '0401.20.10', emoji: '🥛' },
  ],
  'Açougue': [
    { name: 'Patinho Bovino', ncm: '0201.30.00', emoji: '🥩' },
    { name: 'Alcatra', ncm: '0201.30.00', emoji: '🥩' },
    { name: 'Frango Inteiro', ncm: '0207.11.00', emoji: '🍗' },
    { name: 'Linguiça Tosca', ncm: '1601.00.00', emoji: '🌭' },
  ]
};

export const getSuggestionsForSector = (sector: string): NCMSuggestion[] => {
  return NCM_DATABASE[sector] || [];
};
