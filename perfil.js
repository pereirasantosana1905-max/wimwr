document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user") || "lucas";
  
    const savedUser = JSON.parse(localStorage.getItem("wime_user") || "{}");
  
    const profiles = {
      voce: {
        name: savedUser.nome || "Você (Usuário)",
        bio: "Perfil ativo na comunidade Wime.",
        level: "Intermediário",
        matches: "12",
        reputation: "100%",
        sports: savedUser.esportes && savedUser.esportes.length ? savedUser.esportes : ["Futebol", "Vôlei"]
      },
      lucas: {
        name: "Lucas Mendes",
        bio: "Organizador de partidas semanais de society e futevôlei.",
        level: "Intermediário",
        matches: "24",
        reputation: "98%",
        sports: ["Futebol", "Futevôlei"]
      },
      mariana: {
        name: "Mariana Silva",
        bio: "Apaixonada por vôlei de praia e jogos competitivos.",
        level: "Avançado",
        matches: "31",
        reputation: "100%",
        sports: ["Vôlei", "Futebol", "Tênis"]
      },
      rafael: {
        name: "Rafael Costa",
        bio: "Jogando para manter o ritmo e fazer novas amizades.",
        level: "Iniciante",
        matches: "7",
        reputation: "95%",
        sports: ["Futebol", "Basquete"]
      },
      camila: {
        name: "Camila Rocha",
        bio: "Sempre presente nas partidas de fim de semana.",
        level: "Intermediário",
        matches: "19",
        reputation: "97%",
        sports: ["Vôlei", "Tênis"]
      }
    };
  
    const profile = profiles[userId] || profiles.lucas;
  
    document.getElementById("playerBigAvatar").textContent = profile.name.charAt(0).toUpperCase();
    document.getElementById("playerName").textContent = profile.name;
    document.getElementById("playerBio").textContent = profile.bio;
    document.getElementById("playerLevel").textContent = profile.level;
    document.getElementById("playerMatches").textContent = profile.matches;
    document.getElementById("playerReputation").textContent = profile.reputation;
  
    const tagsContainer = document.getElementById("playerSportsTags");
    tagsContainer.innerHTML = profile.sports
      .map((sport) => `<span class="sport-pill">${sport}</span>`)
      .join("");
  });