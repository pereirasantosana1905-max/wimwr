document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const upcomingList = document.getElementById("upcomingList");

  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    hamburgerMenu.classList.toggle("show");
    const isOpen = hamburgerMenu.classList.contains("show");
    menuBtn.setAttribute("aria-expanded", isOpen);
  });

  if (upcomingList) {
    upcomingList.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-cancel-slot")) {
        const action = e.target.getAttribute("data-action");
        const card = e.target.closest(".info-card");

        if (action === "sair") {
          if (confirm("Deseja cancelar sua presença? Sua vaga será liberada imediatamente.")) {
            card.remove();
            alert("Presença cancelada e vaga liberada!");
          }
        } else if (action === "cancelar-evento") {
          if (confirm("Deseja cancelar esta partida? Todos os participantes confirmados serão notificados.")) {
            card.remove();
            alert("Partida cancelada e notificações enviadas aos participantes.");
          }
        }
      }
    });
  }
});