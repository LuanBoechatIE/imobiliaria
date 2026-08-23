"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { atualizarFoto } from "./acoes";

const LADO = 320; // px, recorte quadrado antes de enviar

function recortarQuadrado(imagem: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = LADO;
  canvas.height = LADO;
  const ctx = canvas.getContext("2d")!;

  const menor = Math.min(imagem.width, imagem.height);
  const sx = (imagem.width - menor) / 2;
  const sy = (imagem.height - menor) / 2;

  ctx.drawImage(imagem, sx, sy, menor, menor, 0, 0, LADO, LADO);
  return canvas.toDataURL("image/jpeg", 0.85);
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
    const leitor = new FileReader();
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onload = () => {
        const dataUrl = recortarQuadrado(imagem);
        setFoto(dataUrl);
        iniciarTransicao(async () => {
          const resultado = await atualizarFoto(dataUrl);
          if (resultado?.erro) setErro(resultado.erro);
          else toast.success("Foto atualizada");
        });
      };
      imagem.onerror = () => setErro("Não consegui abrir essa imagem.");
      imagem.src = String(leitor.result);
    };
    leitor.onerror = () => setErro("Não consegui ler o arquivo.");
    leitor.readAsDataURL(arq);
  }

  function remover() {
    setFoto(null);
    setErro(null);
    iniciarTransicao(async () => {
      await atualizarFoto(null);
      toast.success("Foto removida");
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: 80, height: 89 }}>
        <span className="hex-recorte grid size-full place-items-center overflow-hidden bg-laranja-suave text-[1.7rem] font-bold text-laranja-escuro">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} alt="" className="size-full object-cover" />
          ) : (
            nome.charAt(0)
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
            className="inline-flex items-center gap-1.5 rounded-md border border-linha-forte bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-tinta-suave transition-colors hover:border-laranja hover:text-laranja-escuro"
          >
            <Camera size={15} />
            {foto ? "Trocar foto" : "Adicionar foto"}
          </button>
          {foto && (
            <button
              type="button"
              onClick={remover}
              className="inline-flex items-center gap-1.5 rounded-md border border-linha-forte bg-white px-3 py-1.5 text-[0.85rem] font-semibold text-alerta transition-colors hover:bg-alerta-suave"
            >
              <Trash2 size={15} />
              Remover
            </button>
          )}
        </div>
        <span className="text-[0.78rem] text-suave">JPG ou PNG. Recorte automático.</span>
        {erro && <span className="text-[0.78rem] font-medium text-alerta">{erro}</span>}
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
