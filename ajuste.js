document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const formAjustes = document.getElementById("formAjustes");
  const fotoInput = document.getElementById("fotoPerfil");
  const avatarImg = document.getElementById("avatarPreviewImg");
  const avatarLetter = document.getElementById("avatarPreviewLetter");
  const btnDeletarConta = document.getElementById("btnDeletarConta");

  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    hamburgerMenu.classList.toggle("show");
    const isOpen = hamburgerMenu.classList.contains("show");
    menuBtn.setAttribute("aria-expanded", isOpen);
  });

  const savedUser = JSON.parse(localStorage.getItem("wime_user") || "{}");
  if (savedUser.nome) document.getElementById("nome").value = savedUser.nome;
  if (savedUser.email) document.getElementById("email").value = savedUser.email;
  if (savedUser.nivel) document.getElementById("nivel").value = savedUser.nivel;
  if (savedUser.foto) {
    avatarImg.src = savedUser.foto;
    avatarImg.style.display = "block";
    avatarLetter.style.display = "none";
  }
  if (Array.isArray(savedUser.esportes)) {
    document.querySelectorAll('input[name="esportes"]').forEach((cb) => {
      cb.checked = savedUser.esportes.includes(cb.value);
    });
  }

  fotoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      avatarImg.src = reader.result;
      avatarImg.style.display = "block";
      avatarLetter.style.display = "none";
    };
    reader.readAsDataURL(file);
  });

  formAjustes.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const nivel = document.getElementById("nivel").value;
    const notificacoes = document.getElementById("notificacoes").value;
    const esportes = Array.from(document.querySelectorAll('input[name="esportes"]:checked')).map(
      (cb) => cb.value
    );

    const userData = {
      nome,
      email,
      nivel,
      notificacoes,
      esportes,
      foto: avatarImg.style.display === "block" ? avatarImg.src : ""
    };

    localStorage.setItem("wime_user", JSON.stringify(userData));
    alert("Alterações salvas com sucesso!");
  });

  btnDeletarConta.addEventListener("click", () => {
    if (
      confirm(
        "Tem certeza que deseja deletar sua conta e apagar todos os seus dados pessoais? Esta ação não pode ser desfeita."
      )
    ) {
      localStorage.clear();
      alert("Sua conta e todos os seus dados foram apagados.");
      window.location.href = "inicio.html";
    }
  });
});