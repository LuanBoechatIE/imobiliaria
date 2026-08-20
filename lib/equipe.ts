import { acharCorretor, media } from "./dados";
import type { Papel } from "./sessao";

export type Status = "ativo" | "inativo";

export type Pessoa = {
  id: string;
  nome: string;
  email: string;
  /** Cargo como a imobiliária chama. Texto livre. */
  cargo: string;
  /** Papel no sistema, que define o que a pessoa enxerga. */
  papel: Papel;
  entrada: string; // ISO
  status: Status;
  ultimoAcesso: string | null; // ISO
};

/**
 * Base provisória, em memória. Some quando o servidor reinicia.
 * É de propósito: banco só entra quando existir cliente pagando.
 */
const PESSOAS: Pessoa[] = [
  {
    id: "carlos",
    nome: "Carlos Nogueira",
    email: "dono@valenorte.com",
    cargo: "Diretor",
    papel: "dono",
    entrada: "2016-03-01",
    status: "ativo",
    ultimoAcesso: "2026-08-19T14:20:00",
  },
  {
    id: "renata",
    nome: "Renata Alves",
    email: "gestor@valenorte.com",
    cargo: "Gerente comercial",
    papel: "gestor",
    entrada: "2019-08-12",
    status: "ativo",
    ultimoAcesso: "2026-08-20T09:05:00",
  },
  {
    id: "ana",
    nome: "Ana Ribeiro",
    email: "ana@valenorte.com",
    cargo: "Corretora sênior",
    papel: "corretor",
    entrada: "2022-02-07",
    status: "ativo",
    ultimoAcesso: "2026-08-19T18:42:00",
  },
  {
    id: "ricardo",
    nome: "Ricardo Mendes",
    email: "ricardo@valenorte.com",
    cargo: "Corretor",
    papel: "corretor",
    entrada: "2019-05-20",
    status: "ativo",
    ultimoAcesso: "2026-08-18T11:30:00",
  },
  {
    id: "juliana",
    nome: "Juliana Prado",
    email: "juliana@valenorte.com",
    cargo: "Corretora",
    papel: "corretor",
    entrada: "2023-09-04",
    status: "ativo",
    ultimoAcesso: "2026-08-20T08:15:00",
  },
  {
    id: "marcos",
    nome: "Marcos Teixeira",
    email: "marcos@valenorte.com",
    cargo: "Corretor",
    papel: "corretor",
    entrada: "2021-11-15",
    status: "ativo",
    ultimoAcesso: "2026-08-12T16:00:00",
  },
  {
    id: "patricia",
    nome: "Patrícia Lemos",
    email: "patricia@valenorte.com",
    cargo: "Corretora sênior",
    papel: "corretor",
    entrada: "2020-06-22",
    status: "ativo",
    ultimoAcesso: "2026-08-19T17:10:00",
  },
  {
    id: "eduardo",
    nome: "Eduardo Vasques",
    email: "eduardo@valenorte.com",
    cargo: "Corretor",
    papel: "corretor",
    entrada: "2024-01-08",
    status: "ativo",
    ultimoAcesso: "2026-08-17T10:45:00",
  },
  {
    id: "silvia",
    nome: "Sílvia Castro",
    email: "silvia@valenorte.com",
    cargo: "Corretora",
    papel: "corretor",
    entrada: "2025-10-01",
    status: "ativo",
    ultimoAcesso: null,
  },
  {
    id: "roberto",
    nome: "Roberto Dias",
    email: "roberto@valenorte.com",
    cargo: "Corretor",
    papel: "corretor",
    entrada: "2018-04-03",
    status: "inativo",
    ultimoAcesso: "2026-01-30T09:12:00",
  },
];

export const NOME_PAPEL: Record<Papel, string> = {
  boechat: "Equipe Boechat",
  dono: "Dono",
  gestor: "Gestor",
  corretor: "Corretor",
};

export function listarPessoas(): Pessoa[] {
  return PESSOAS;
}

export function acharPessoa(id: string): Pessoa | undefined {
  return PESSOAS.find((p) => p.id === id);
}

export type DadosPessoa = {
  nome: string;
  email: string;
  cargo: string;
  papel: Papel;
  entrada: string;
};

function gerarId(nome: string): string {
  const base = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let id = base || "pessoa";
  let n = 2;
  while (PESSOAS.some((p) => p.id === id)) id = `${base}-${n++}`;
  return id;
}

export function adicionarPessoa(dados: DadosPessoa): Pessoa {
  const pessoa: Pessoa = {
    id: gerarId(dados.nome),
    ...dados,
    status: "ativo",
    ultimoAcesso: null,
  };
  PESSOAS.push(pessoa);
  return pessoa;
}

export function editarPessoa(id: string, dados: DadosPessoa): Pessoa | undefined {
  const pessoa = PESSOAS.find((p) => p.id === id);
  if (!pessoa) return undefined;
  Object.assign(pessoa, dados);
  return pessoa;
}

export function alternarStatusPessoa(id: string): Pessoa | undefined {
  const pessoa = PESSOAS.find((p) => p.id === id);
  if (!pessoa) return undefined;
  pessoa.status = pessoa.status === "ativo" ? "inativo" : "ativo";
  return pessoa;
}

/**
 * Nota atual só existe para corretor ativo. Quem está inativo sai dos
 * rankings e dos cálculos do ciclo, mas o histórico continua guardado.
 */
export function notaAtual(pessoa: Pessoa): number | null {
  if (pessoa.papel !== "corretor" || pessoa.status !== "ativo") return null;
  const corretor = acharCorretor(pessoa.id);
  return corretor ? media(corretor.notas) : null;
}

export function contarAtivos(): number {
  return PESSOAS.filter((p) => p.status === "ativo").length;
}

/* ---------- formatação ---------- */

export function dataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function desdeQuando(iso: string | null): string {
  if (!iso) return "nunca acessou";

  const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas}h`;

  const dias = Math.floor(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;

  const meses = Math.floor(dias / 30);
  if (meses < 12) return `há ${meses} ${meses === 1 ? "mês" : "meses"}`;

  const anos = Math.floor(meses / 12);
  return `há ${anos} ${anos === 1 ? "ano" : "anos"}`;
}
