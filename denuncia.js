document.addEventListener("DOMContentLoaded", () => {
  // Lógica do Menu Hambúrguer
  const menuBtn = document.getElementById("menuBtn");
  const hamburgerMenu = document.getElementById("hamburgerMenu");

  if (menuBtn && hamburgerMenu) {
    menuBtn.addEventListener("click", () => {
      menuBtn.classList.toggle("active");
      hamburgerMenu.classList.toggle("show");
      const isOpen = hamburgerMenu.classList.contains("show");
      menuBtn.setAttribute("aria-expanded", isOpen);
    });
  }

  // Lógica dos Botões de Filtro dentro do Menu (Redirecionam para a Página Principal)
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      window.location.href = "paginaprincipal.html";
    });
  });

  // Lógica de Envio do Formulário de Denúncia
  const formDenuncia = document.getElementById("formDenuncia");
  const mensagemSucesso = document.getElementById("mensagemSucesso");

  if (formDenuncia && mensagemSucesso) {
    formDenuncia.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Exibe a mensagem de confirmação
      mensagemSucesso.classList.remove("hidden");
      formDenuncia.reset();

      // Redireciona de volta à página principal após 2.5 segundos
      setTimeout(() => {
        window.location.href = "paginaprincipal.html";
      }, 2500);
    });
  }
});