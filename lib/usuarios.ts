import type { Papel } from "./sessao";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  papel: Papel;
  /** null só para a equipe da Boechat, que enxerga todos os clientes. */
  imobiliariaId: string | null;
  /** Liga ao registro em lib/equipe.ts, quando existir (cargo, entrada, etc). */
  pessoaId: string | null;
  /** Foto de perfil, como data URL. null = usa a inicial do nome. */
  foto: string | null;
  /**
   * true logo após a conta ser criada com senha gerada pelo sistema.
   * Middleware força a passagem por /trocar-senha antes de liberar o resto.
   */
  deveTrocarSenha: boolean;
};

/**
 * Base provisória, em código, para a fase de demonstração. Mutável em
 * memória — some a cada reinício do servidor, igual ao resto da casa.
 * Trocar por banco antes de existir cliente real: este arquivo é o
 * único ponto que precisa mudar.
 *
 * Senhas de demonstração:
 *   equipe Boechat  -> boechat2026
 *   Vale Norte      -> valenorte2026
 */
const HASH_BOECHAT =
  "feb2683c84070553bedbde43d3993e35:05f527b4672722d68628e3a997ae809c97579da2f7549627f58213b4d6c64f0db34ef65c471819ab44675509be6d03e830fc595483bf0af8f5e0e94ea29210bc";

const HASH_VALENORTE =
  "1caa327ee41a62c7a81836472495b921:4505adabacd3298bf7fc875ab1743f1e277d5b31a47868b2a88dcf9f9db44b4133977588c4b4199ad856cafe0aa01b89530045ba92c588dcc29915e8c24e85fd";

const USUARIOS: Usuario[] = [
  {
    id: "u-luan",
    nome: "Luan Boechat",
    email: "luan@boechat.com",
    senhaHash: HASH_BOECHAT,
    papel: "boechat",
    imobiliariaId: null,
    pessoaId: null,
    foto: null,
    deveTrocarSenha: false,
  },
  {
    id: "u-samuel",
    nome: "Samuel",
    email: "samuel@boechat.com",
    senhaHash: HASH_BOECHAT,
    papel: "boechat",
    imobiliariaId: null,
    pessoaId: null,
    foto: null,
    deveTrocarSenha: false,
  },
  {
    id: "u-dono",
    nome: "Carlos Nogueira",
    email: "dono@valenorte.com",
    senhaHash: HASH_VALENORTE,
    papel: "dono",
    imobiliariaId: "vale-norte",
    pessoaId: "carlos",
    foto: null,
    deveTrocarSenha: false,
  },
  {
    id: "u-gestor",
    nome: "Renata Alves",
    email: "gestor@valenorte.com",
    senhaHash: HASH_VALENORTE,
    papel: "gestor",
    imobiliariaId: "vale-norte",
    pessoaId: "renata",
    foto: null,
    deveTrocarSenha: false,
  },
];

export function acharPorEmail(email: string): Usuario | undefined {
  const alvo = email.trim().toLowerCase();
  return USUARIOS.find((u) => u.email.toLowerCase() === alvo);
}

export function acharPorId(id: string): Usuario | undefined {
  return USUARIOS.find((u) => u.id === id);
}

export function acharPorPessoaId(pessoaId: string): Usuario | undefined {
  return USUARIOS.find((u) => u.pessoaId === pessoaId);
}

export function emailEmUso(email: string, ignorarId?: string): boolean {
  const alvo = email.trim().toLowerCase();
  return USUARIOS.some((u) => u.email.toLowerCase() === alvo && u.id !== ignorarId);
}

export type NovoUsuario = {
  pessoaId: string;
  nome: string;
  email: string;
  papel: Papel;
  imobiliariaId: string | null;
  senhaHash: string;
};

/** Cria login para uma pessoa nova. Nasce com senha temporária a trocar. */
export function criarUsuario(dados: NovoUsuario): Usuario {
  const usuario: Usuario = {
    id: `u-${dados.pessoaId}`,
    nome: dados.nome,
    email: dados.email,
    senhaHash: dados.senhaHash,
    papel: dados.papel,
    imobiliariaId: dados.imobiliariaId,
    pessoaId: dados.pessoaId,
    foto: null,
    deveTrocarSenha: true,
  };
  USUARIOS.push(usuario);
  return usuario;
}

/** Mantém o login em dia quando a pessoa é editada em /equipe. */
export function sincronizarUsuario(
  pessoaId: string,
  dados: { nome: string; email: string; papel: Papel }
): void {
  const usuario = acharPorPessoaId(pessoaId);
  if (!usuario) return;
  usuario.nome = dados.nome;
  usuario.email = dados.email;
  usuario.papel = dados.papel;
}

export function trocarSenhaUsuario(id: string, novoHash: string): void {
  const usuario = acharPorId(id);
  if (!usuario) return;
  usuario.senhaHash = novoHash;
  usuario.deveTrocarSenha = false;
}

export function definirFoto(id: string, foto: string | null): Usuario | undefined {
  const usuario = acharPorId(id);
  if (!usuario) return undefined;
  usuario.foto = foto;
  return usuario;
}
