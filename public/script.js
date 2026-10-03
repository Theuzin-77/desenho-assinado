let id_token = null;
function onGoogleSignIn(response) {
  id_token = response.credential;
  document.getElementById("status-login").textContent = "Login OK! Pode gerar.";
}
document.getElementById("form-desenho").addEventListener("submit", async (e) => {
  e.preventDefault();
  const erro = document.getElementById("mensagem-erro");
  const saida = document.getElementById("saida");
  erro.textContent = ""; saida.innerHTML = "";
  if (!id_token) { erro.textContent = "Faça login com Google antes."; return; }
  const numero = parseInt(document.getElementById("numero").value, 10);
  const resp = await fetch("/api/desenho", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${id_token}` },
    body: JSON.stringify({ numero })
  });
  if (resp.status === 400 || resp.status === 401) {
    erro.textContent = `Erro ${resp.status}: ${await resp.text()}`; return;
  }
  saida.innerHTML = await resp.text();
});