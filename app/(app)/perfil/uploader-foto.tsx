"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { atualizarFoto } from "./acoes";
import { iniciais } from "@/components/hex-avatar";

const LADO = 320; // px, recorte quadrado antes de enviar

/**
 * Teto do arquivo escolhido. Foto de celular moderno passa fácil de
 * 8 MB, e ler isso em memória para depois jogar fora tudo menos 320px
 * trava o aparelho antes de o recorte começar.
 */
const MAX_BYTES = 8 * 1024 * 1024;

function recortarQuadrado(imagem: HTMLImageElement): string | null {
  const canvas = document.createElement("canvas");
  canvas.width = LADO;
  canvas.height = LADO;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const menor = Math.min(imagem.width, imagem.height);
  if (!menor) return null;

  const sx = (imagem.width - menor) / 2;
  const sy = (imagem.height - menor) / 2;

  try {
    ctx.drawImage(imagem, sx, sy, menor, menor, 0, 0, LADO, LADO);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    // Imagem gigante estoura a memória do canvas em aparelho fraco.
    return null;
  }
}

function formatarMB(bytes: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
    bytes / 1024 / 1024
  );
}

export function UploaderFoto({
  nome,
  fotoInicial,
}: {
  nome: string;
  fotoInicial: string | null;
}) {
  const arquivo = useRef<HTMLInputElement>(null);
  const [foto, setFoto] = useState(fotoInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [processando, iniciarTransicao] = useTransition();

  function escolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arq = e.target.files?.[0];
    e.target.value = "";
    if (!arq) return;

    setErro(null);

    if (!arq.type.startsWith("image/")) {
      setErro("Esse arquivo não é uma imagem.");
      return;
    }
    if (arq.size > MAX_BYTES) {
      setErro(
        `A imagem tem ${formatarMB(arq.size)} MB. O limite é ${formatarMB(MAX_BYTES)} MB.`
      );
      return;
    }

    const anterior = foto;
    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();
      imagem.onload = () => {
        const dataUrl = recortarQuadrado(imagem);
        if (!dataUrl) {
          setErro("Essa imagem é grande demais para recortar aqui. Tente outra.");
          return;
        }

        // Mostra na hora e desfaz se o servidor recusar: a foto na tela
        // nunca fica adiantada em relação ao que ficou gravado.
        setFoto(dataUrl);
        iniciarTransicao(async () => {
          try {
            const resultado = await atualizarFoto(dataUrl);
            if (resultado?.erro) {
              setFoto(anterior);
              setErro(resultado.erro);
            } else {
              toast.success("Foto atualizada");
            }
          } catch {
            setFoto(anterior);
            setErro("A conexão caiu no meio do envio. Tente de novo.");
          }
        });
      };
      imagem.onerror = () => setErro("Não consegui abrir essa imagem.");
      imagem.src = String(leitor.result);
    };

    leitor.onerror = () => setErro("Não consegui ler o arquivo.");
    leitor.readAsDataURL(arq);
  }

  function remover() {
    const anterior = foto;
    setFoto(null);
    setErro(null);

    iniciarTransicao(async () => {
      try {
        const resultado = await atualizarFoto(null);
        if (resultado?.erro) {
          setFoto(anterior);
          setErro(resultado.erro);
        } else {
          toast.success("Foto removida");
        }
      } catch {
        setFoto(anterior);
        setErro("Não consegui remover agora. Tente de novo.");
      }
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: 80, height: 89 }}>
        <span className="hex-recorte grid size-full place-items-center overflow-hidden bg-laranja-suave text-[1.7rem] font-bold text-acao">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt="" className="size-full object-cover" />
          ) : (
            iniciais(nome)
          )}
        </span>
        {processando && (
          <span className="hex-recorte absolute inset-0 grid place-items-center bg-tinta/40">
            <Loader2 size={18} className="animate-spin text-white" />
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => arquivo.current?.click()}
            disabled={processando}
            className="alvo-alto inline-flex items-center gap-1.5 disabled:pointer-events-none disabled:opacity-60 rounded-md border border-borda-campo bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-tinta-suave transition-colors hover:border-laranja hover:text-acao"
          >
            <Camera size={15} />
            {foto ? "Trocar foto" : "Adicionar foto"}
          </button>
          {foto && (
            <button
              type="button"
              onClick={remover}
              disabled={processando}
              className="alvo-alto inline-flex items-center gap-1.5 rounded-md border border-borda-campo bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-alerta transition-colors hover:bg-alerta-suave disabled:pointer-events-none disabled:opacity-60"
            >
              <Trash2 size={15} />
              Remover
            </button>
          )}
        </div>
        <span className="text-[0.78rem] text-suave">
          JPG, PNG ou WebP, até {formatarMB(MAX_BYTES)} MB. Recorte automático.
        </span>
        {erro && (
          <span role="alert" className="text-[0.78rem] font-medium text-alerta">
            {erro}
          </span>
        )}
      </div>

      <input
        ref={arquivo}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={escolherArquivo}
        className="hidden"
      />
    </div>
  );
}
