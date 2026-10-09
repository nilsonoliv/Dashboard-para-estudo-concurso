// Import all existing questions packs from the project
import { pack1 } from '../../assets/script/modules/modules-questions/pack1.js';
import { pack2 } from '../../assets/script/modules/modules-questions/pack2.js';
import { pack3 } from '../../assets/script/modules/modules-questions/pack3.js';
import { pack4 } from '../../assets/script/modules/modules-questions/pack4.js';
import { pack5 } from '../../assets/script/modules/modules-questions/pack5.js';
import { pack6 } from '../../assets/script/modules/modules-questions/pack6.js';
import { pack7 } from '../../assets/script/modules/modules-questions/pack7.js';
import { pack8 } from '../../assets/script/modules/modules-questions/pack8.js';
import { pack9 } from '../../assets/script/modules/modules-questions/pack9.js';
import { pack10 } from '../../assets/script/modules/modules-questions/pack10.js';

export interface QuestionItem {
  id: number;
  categoria?: string;
  materia?: string;
  assunto?: string;
  cargo?: string;
  ano?: string | number;
  banca?: string;
  concurso?: string;
  enunciado?: string;
  imagem?: string | null;
  alternativas?: string[];
  resposta_correta?: number;
  explicacao?: string;
  status?: number;
  historico?: number;
}

export const ALL_RAW_QUESTIONS: any[] = [
  ...pack1,
  ...pack2,
  ...pack3,
  ...pack4,
  ...pack5,
  ...pack6,
  ...pack7,
  ...pack8,
  ...pack9,
  ...pack10,
];
