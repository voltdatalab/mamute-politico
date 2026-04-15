import type {PieceId} from "./types.js";

export const pieceLabels: Array<{id: PieceId; label: string}> = [
  {id: "ui", label: "UI"},
  {id: "reverse_proxy", label: "Proxy reverso (Caddy)"},
  {id: "api", label: "API"},
  {id: "chatbot_backend", label: "Backend do chatbot"},
  {id: "ghost", label: "Ghost"}
];
