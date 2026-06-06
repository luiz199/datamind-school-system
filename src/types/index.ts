export interface User {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  tipo: "professor" | "coordenador" | "admin";
  foto?: string;
  pontuacao: number;
  nivel: number;
  ranking?: number;
  createdAt: Date;
}

export interface PlanoAula {
  id: string;
  professorId: string;
  professorNome: string;
  materia: Materia;
  serie: string;
  turma: string;
  data: string;
  tema: string;
  objetivos: string;
  conteudo: string;
  metodologia: string;
  recursos: string;
  avaliacao: string;
  observacoes: string;
  arquivoUrl?: string;
  arquivoNome?: string;
  arquivoTipo?: string;
  status: "pendente" | "aprovado" | "reprovado" | "correcao";
  nota?: number;
  protocolo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comentario {
  id: string;
  planoId: string;
  usuarioId: string;
  usuarioNome: string;
  texto: string;
  createdAt: Date;
}

export interface Notificacao {
  id: string;
  usuarioId: string;
  tipo: "aprovado" | "reprovado" | "correcao" | "pontuacao" | "comentario" | "ranking";
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: Date;
}

export interface Pontuacao {
  id: string;
  usuarioId: string;
  planoId: string;
  pontos: number;
  motivo: string;
  createdAt: Date;
}

export interface Log {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  acao: string;
  detalhes: string;
  createdAt: Date;
}

export type Materia =
  | "Matemática"
  | "Português"
  | "História"
  | "Geografia"
  | "Ciências"
  | "Biologia"
  | "Física"
  | "Química"
  | "Inglês"
  | "Artes"
  | "Educação Física"
  | "Filosofia"
  | "Sociologia"
  | "Eletiva - Artes"
  | "Eletiva - Robótica"
  | "Eletiva - Teatro"
  | "Eletiva - Música"
  | "Eletiva - Dança"
  | "Eletiva - Programação"
  | "Eletiva - Empreendedorismo"
  | "Eletiva - Meio Ambiente"
  | "Eletiva - Cidadania"
  | "Eletiva - Jornalismo"
  | "Eletiva - Fotografia"
  | "Eletiva - Xadrez"
  | "Trilha - Matemática"
  | "Trilha - Linguagens"
  | "Trilha - Ciências da Natureza"
  | "Trilha - Ciências Humanas"
  | "Trilha - Ensino Religioso"
  | "Trilha - Tecnologia"
  | "Trilha - Redação"
  | "Trilha - Orientação de Estudos";

export const MATERIAS: Materia[] = [
  "Matemática", "Português", "História", "Geografia", "Ciências",
  "Biologia", "Física", "Química", "Inglês", "Artes",
  "Educação Física", "Filosofia", "Sociologia",
  "Eletiva - Artes", "Eletiva - Robótica", "Eletiva - Teatro",
  "Eletiva - Música", "Eletiva - Dança", "Eletiva - Programação",
  "Eletiva - Empreendedorismo", "Eletiva - Meio Ambiente",
  "Eletiva - Cidadania", "Eletiva - Jornalismo", "Eletiva - Fotografia",
  "Eletiva - Xadrez",
  "Trilha - Matemática", "Trilha - Linguagens",
  "Trilha - Ciências da Natureza", "Trilha - Ciências Humanas",
  "Trilha - Ensino Religioso", "Trilha - Tecnologia",
  "Trilha - Redação", "Trilha - Orientação de Estudos",
];

export const SERIES = [
  "1º Ano - Anos Iniciais", "2º Ano - Anos Iniciais",
  "3º Ano - Anos Iniciais", "4º Ano - Anos Iniciais",
  "5º Ano - Anos Iniciais",
  "6º Ano - Anos Finais", "7º Ano - Anos Finais",
  "8º Ano - Anos Finais", "9º Ano - Anos Finais",
  "1º Ano - Ensino Médio", "2º Ano - Ensino Médio",
  "3º Ano - Ensino Médio",
];

export const TURMAS = ["A", "B", "C", "D", "E", "F", "G", "H"];
