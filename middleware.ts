import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, lerSessao, type Papel } from "@/lib/sessao";

const PUBLICAS = ["/entrar"];
const TROCAR_SENHA = "/trocar-senha";

/**
 * A área do corretor é uma lista fechada.
 *
 * Fechar por lista, e não por lista de bloqueio, é de propósito: tela
 * nova que alguém criar amanhã nasce indisponível para o corretor até
 * ser liberada aqui de propósito. O contrário — esquecer de bloquear —
 * vazaria o painel da casa inteira para o time.
 */
const AREA_DO_CORRETOR = [
  "/meu-painel",
  "/meu-desempenho",
  "/meus-treinamentos",
  "/minhas-atividades",
  "/meu-perfil",
];

function dentroDe(pathname: string, rotas: string[]): boolean {
  return rotas.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

/** Onde cada papel começa depois de entrar. */
function inicio(papel: Papel): string {
  return papel === "corretor" ? "/meu-painel" : "/painel";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessao = await lerSessao(req.cookies.get(COOKIE_SESSAO)?.value);

  // Já autenticado não precisa ver a tela de login.
  if (PUBLICAS.includes(pathname)) {
    if (sessao) {
      return NextResponse.redirect(new URL(inicio(sessao.papel), req.url));
    }
    return NextResponse.next();
  }

  // Fecha por padrão: qualquer rota não pública exige sessão válida.
  if (!sessao) {
    const destino = new URL("/entrar", req.url);
    if (pathname !== "/") destino.searchParams.set("de", pathname);
    return NextResponse.redirect(destino);
  }

  // Conta com senha gerada pelo sistema não navega até trocar a senha.
  if (sessao.deveTrocarSenha && pathname !== TROCAR_SENHA) {
    return NextResponse.redirect(new URL(TROCAR_SENHA, req.url));
  }
  if (!sessao.deveTrocarSenha && pathname === TROCAR_SENHA) {
    return NextResponse.redirect(new URL(inicio(sessao.papel), req.url));
  }

  // Separação de áreas. Vale para a URL digitada na mão, não só para o
  // que o menu mostra — a mesma checagem se repete dentro de cada página
  // e de cada Server Action, porque redirecionar não é autorizar.
  const naAreaDoCorretor = dentroDe(pathname, AREA_DO_CORRETOR);

  if (sessao.papel === "corretor" && !naAreaDoCorretor) {
    return NextResponse.redirect(new URL("/meu-painel", req.url));
  }
  if (sessao.papel !== "corretor" && naAreaDoCorretor) {
    return NextResponse.redirect(new URL("/painel", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
