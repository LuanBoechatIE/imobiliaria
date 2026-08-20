import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, lerSessao } from "@/lib/sessao";

const PUBLICAS = ["/entrar"];
const TROCAR_SENHA = "/trocar-senha";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessao = await lerSessao(req.cookies.get(COOKIE_SESSAO)?.value);

  // Já autenticado não precisa ver a tela de login.
  if (PUBLICAS.includes(pathname)) {
    if (sessao) {
      return NextResponse.redirect(new URL("/painel", req.url));
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
    return NextResponse.redirect(new URL("/painel", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
