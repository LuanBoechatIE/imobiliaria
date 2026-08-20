import type { Papel } from "./sessao";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  papel: Papel;
  /** null só para a equipe da Boechat, que enxerga todos os clientes. */
  imobiliariaId: string | null;
};

/**
 * Base provisória, em código, para a fase de demonstração.
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

export const USUARIOS: Usuario[] = [
  {
    id: "u-luan",
    nome: "Luan Boechat",
    email: "luan@boechat.com",
    senhaHash: HASH_BOECHAT,
    papel: "boechat",
    imobiliariaId: null,
  },
  {
    id: "u-samuel",
    nome: "Samuel",
    email: "samuel@boechat.com",
    senhaHash: HASH_BOECHAT,
    papel: "boechat",
    imobiliariaId: null,
  },
  {
    id: "u-dono",
    nome: "Carlos Nogueira",
    email: "dono@valenorte.com",
    senhaHash: HASH_VALENORTE,
    papel: "dono",
    imobiliariaId: "vale-norte",
  },
  {
    id: "u-gestor",
    nome: "Renata Alves",
    email: "gestor@valenorte.com",
    senhaHash: HASH_VALENORTE,
    papel: "gestor",
    imobiliariaId: "vale-norte",
  },
];

export function acharPorEmail(email: string): Usuario | undefined {
  const alvo = email.trim().toLowerCase();
  return USUARIOS.find((u) => u.email.toLowerCase() === alvo);
}
