import { useSearchParams, Link } from "react-router-dom"

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get("session_id")

  return (
    <div style={{ padding: "40px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Pagamento aprovado</h1>
      <p>Seu pagamento foi concluído com sucesso.</p>
      {sessionId && <p><strong>Session ID:</strong> {sessionId}</p>}
      <div style={{ marginTop: "20px" }}>
        <Link to="/">Voltar para a página inicial</Link>
      </div>
    </div>
  )
}