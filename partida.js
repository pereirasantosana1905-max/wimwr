document.addEventListener("DOMContentLoaded", () => {
  // Menu hambúrguer
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

  // Dados do usuário atual
  const savedUser = JSON.parse(localStorage.getItem("wime_user") || "{}");
  const currentUserName = savedUser.nome || "Você (Usuário)";
  document.getElementById("headerUserName").textContent = currentUserName;

  // Busca partida pelo ID na URL (?id=...) no localStorage ou nos exemplos padrão
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get("id") || "1";
  const storedMatches = JSON.parse(localStorage.getItem("wime_matches") || "[]");
  const foundMatch = storedMatches.find((m) => String(m.id) === String(matchId));

  const fallbackMatches = {
    "1": {
      title: "Futebol Society - Campo A",
      sport: "Futebol",
      location: "Quadra Central",
      date: "Hoje",
      time: "19:00",
      visibility: "🌐 Pública",
      maxPlayers: 10
    },
    "2": {
      title: "Vôlei de Praia - Arena 2",
      sport: "Vôlei",
      location: "Arena Sol",
      date: "Sábado",
      time: "10:00",
      visibility: "🌐 Pública",
      maxPlayers: 6
    },
    "3": {
      title: "Basquete 3x3 - Parque Central",
      sport: "Basquete",
      location: "Quadra Parque",
      date: "Hoje",
      time: "17:30",
      visibility: "🌐 Pública",
      maxPlayers: 6
    }
  };

  const match = foundMatch
    ? {
        title: foundMatch.title,
        sport: foundMatch.sport.charAt(0).toUpperCase() + foundMatch.sport.slice(1),
        location: foundMatch.location,
        date: foundMatch.date,
        time: foundMatch.time,
        visibility: foundMatch.visibility === "privada" ? "🔒 Privada (Link)" : "🌐 Pública",
        maxPlayers: Number(foundMatch.max) || 10
      }
    : fallbackMatches[matchId] || {
        title: "Partida Personalizada Wime",
        sport: "Esporte",
        location: "Local Combinado",
        date: "Em breve",
        time: "20:00",
        visibility: "🔒 Privada (Link)",
        maxPlayers: 10
      };

  // Lista inicial de outros participantes confirmados
  let players = [
    { id: "lucas", name: "Lucas Mendes", role: "Organizador", level: "Intermediário", sports: "Futebol, Futevôlei" },
    { id: "mariana", name: "Mariana Silva", role: "Confirmada", level: "Avançado", sports: "Vôlei, Futebol" },
    { id: "rafael", name: "Rafael Costa", role: "Confirmado", level: "Iniciante", sports: "Futebol, Basquete" },
    { id: "camila", name: "Camila Rocha", role: "Confirmada", level: "Intermediário", sports: "Vôlei, Tênis" }
  ].slice(0, Math.max(1, match.maxPlayers - 1));

  let isUserJoined = foundMatch ? Boolean(foundMatch.joined) : true;
  let isOrganizer = true;
  let isCanceled = false;

  // Sincroniza alterações da partida com a página principal
  function syncMatchStorage() {
    if (!foundMatch) return;
    foundMatch.joined = isUserJoined;
    foundMatch.current = players.length + (isUserJoined ? 1 : 0);
    foundMatch.time = match.time;
    localStorage.setItem("wime_matches", JSON.stringify(storedMatches));
  }

  // Elementos da tela
  const matchTitleEl = document.getElementById("matchTitle");
  const matchSportEl = document.getElementById("matchSport");
  const matchVisibilityEl = document.getElementById("matchVisibility");
  const matchStatusEl = document.getElementById("matchStatus");
  const matchMetaEl = document.getElementById("matchMeta");
  const slotsCountEl = document.getElementById("slotsCount");
  const slotsAvailableEl = document.getElementById("slotsAvailable");
  const playersListEl = document.getElementById("playersList");
  const btnTogglePresence = document.getElementById("btnTogglePresence");
  const organizerPanel = document.getElementById("organizerPanel");
  const toggleOrganizerMode = document.getElementById("toggleOrganizerMode");
  const chatLockedBox = document.getElementById("chatLockedBox");
  const chatMessagesEl = document.getElementById("chatMessages");
  const chatForm = document.getElementById("chatForm");
  const chatAccessBadge = document.getElementById("chatAccessBadge");

  // Notificação push simulada
  const pushToast = document.getElementById("pushToast");
  const pushTitle = document.getElementById("pushTitle");
  const pushBody = document.getElementById("pushBody");
  let toastTimeout;

  function showPushNotification(title, body) {
    pushTitle.textContent = title;
    pushBody.textContent = body;
    pushToast.classList.remove("hidden");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      pushToast.classList.add("hidden");
    }, 5000);
  }

  document.getElementById("closePushBtn").addEventListener("click", () => {
    pushToast.classList.add("hidden");
  });

  // Renderiza dados da partida e vagas
  function renderMatch() {
    matchTitleEl.textContent = match.title;
    matchSportEl.textContent = match.sport;
    matchVisibilityEl.textContent = match.visibility;
    matchMetaEl.innerHTML = `📍 ${match.location} • 📅 ${match.date} • 🕒 <span id="matchTimeDisplay">${match.time}</span>`;
    document.getElementById("newTimeInput").value = match.time;

    const totalConfirmed = players.length + (isUserJoined ? 1 : 0);
    const remaining = Math.max(0, match.maxPlayers - totalConfirmed);

    slotsCountEl.textContent = `${totalConfirmed}/${match.maxPlayers}`;
    slotsAvailableEl.textContent =
      remaining === 0
        ? "Partida lotada"
        : `${remaining} ${remaining === 1 ? "vaga disponível" : "vagas disponíveis"}`;

    if (isCanceled) {
      matchStatusEl.textContent = "Cancelada";
      matchStatusEl.className = "status-tag canceled";
      btnTogglePresence.disabled = true;
      btnTogglePresence.textContent = "Partida Cancelada";
    } else if (isUserJoined) {
      btnTogglePresence.textContent = "Cancelar Minha Presença";
      btnTogglePresence.classList.add("leave");
      chatLockedBox.classList.add("hidden");
      chatMessagesEl.classList.remove("hidden");
      chatForm.classList.remove("hidden");
      chatAccessBadge.textContent = "Acesso liberado";
    } else {
      btnTogglePresence.textContent = "Confirmar Presença";
      btnTogglePresence.classList.remove("leave");
      chatLockedBox.classList.remove("hidden");
      chatMessagesEl.classList.add("hidden");
      chatForm.classList.add("hidden");
      chatAccessBadge.textContent = "Bloqueado";
    }

    organizerPanel.classList.toggle("hidden", !isOrganizer || isCanceled);
    renderPlayers();
  }

  // Renderiza lista de participantes clicáveis
  function renderPlayers() {
    playersListEl.innerHTML = "";

    if (isUserJoined) {
      const userInitial = currentUserName.charAt(0).toUpperCase();
      const avatarContent = savedUser.foto
        ? `<img src="${savedUser.foto}" alt="${currentUserName}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`
        : userInitial;

      const myLi = document.createElement("li");
      myLi.className = "player-item";
      myLi.innerHTML = `
        <a href="perfil.html?user=voce" class="player-link">
          <div class="player-avatar">${avatarContent}</div>
          <div class="player-info">
            <strong>${currentUserName} (Você)</strong>
            <small>${isOrganizer ? "Organizador" : "Confirmado"} • Ver perfil</small>
          </div>
        </a>
      `;
      playersListEl.appendChild(myLi);
    }

    players.forEach((player) => {
      const li = document.createElement("li");
      li.className = "player-item";
      li.innerHTML = `
        <a href="perfil.html?user=${player.id}" class="player-link">
          <div class="player-avatar">${player.name.charAt(0)}</div>
          <div class="player-info">
            <strong>${player.name}</strong>
            <small>Nível ${player.level} • ${player.sports}</small>
          </div>
        </a>
        ${
          isOrganizer && !isCanceled
            ? `<button type="button" class="btn-remove-player" data-id="${player.id}">Remover</button>`
            : ""
        }
      `;
      playersListEl.appendChild(li);
    });
  }

  // Confirmar ou cancelar presença (libera vaga imediatamente)
  btnTogglePresence.addEventListener("click", () => {
    if (isUserJoined) {
      if (confirm("Deseja cancelar sua presença? Sua vaga será liberada imediatamente.")) {
        isUserJoined = false;
        syncMatchStorage();
        renderMatch();
      }
    } else {
      if (players.length >= match.maxPlayers) {
        alert("Esta partida já está lotada!");
        return;
      }
      isUserJoined = true;
      syncMatchStorage();
      renderMatch();
      showPushNotification("Presença confirmada!", `Você entrou na sala de "${match.title}".`);
    }
  });

  // Alternar visão de organizador para testes
  toggleOrganizerMode.addEventListener("change", (e) => {
    isOrganizer = e.target.checked;
    renderMatch();
  });

  // Remover participante (controle do organizador)
  playersListEl.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remove-player")) {
      const id = e.target.getAttribute("data-id");
      const target = players.find((p) => p.id === id);
      if (target && confirm(`Remover ${target.name} da partida por comportamento inadequado?`)) {
        players = players.filter((p) => p.id !== id);
        syncMatchStorage();
        renderMatch();
        showPushNotification("Participante removido", `${target.name} foi removido e 1 vaga foi liberada.`);
      }
    }
  });

  // Alterar horário da partida
  document.getElementById("btnUpdateTime").addEventListener("click", () => {
    const newTime = document.getElementById("newTimeInput").value;
    if (!newTime) return;
    match.time = newTime;
    syncMatchStorage();
    renderMatch();
    showPushNotification(
      "⏰ Horário Alterado!",
      `O organizador mudou o horário de "${match.title}" para ${newTime}.`
    );
  });

  // Cancelar partida
  document.getElementById("btnCancelMatch").addEventListener("click", () => {
    if (confirm("Tem certeza que deseja cancelar esta partida? Todos os participantes serão avisados.")) {
      isCanceled = true;
      if (foundMatch) {
        const updatedList = storedMatches.filter((m) => String(m.id) !== String(matchId));
        localStorage.setItem("wime_matches", JSON.stringify(updatedList));
      }
      renderMatch();
      showPushNotification(
        "🚨 Partida Cancelada",
        `O organizador cancelou "${match.title}". Você não precisa se deslocar ao local.`
      );
    }
  });

  // Simular lembrete push 1 hora antes
  document.getElementById("btnTestReminder").addEventListener("click", () => {
    showPushNotification(
      "⏰ Falta 1 hora para o jogo!",
      `Prepare-se: "${match.title}" começa às ${match.time} em ${match.location}.`
    );
  });

  // Compartilhar no WhatsApp e Instagram
  document.getElementById("btnShareWhatsApp").addEventListener("click", () => {
    const url = window.location.href;
    const text = encodeURIComponent(`Bora jogar "${match.title}" no Wime? Confirme sua vaga: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  });

  document.getElementById("btnShareInstagram").addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link direto da partida copiado! Cole no seu Direct ou Stories do Instagram.");
  });

  // --- CHAT EXCLUSIVO DA PARTIDA ---
  const storageKey = `wime_chat_${matchId}`;
  let messages = JSON.parse(localStorage.getItem(storageKey) || "null") || [
    { sender: "Lucas Mendes", text: "Fala pessoal! Cheguem 10 minutos antes para dividir os times.", mine: false },
    { sender: "Mariana Silva", text: "Combinado! Vou levar uma bola reserva.", mine: false }
  ];

  function renderMessages() {
    chatMessagesEl.innerHTML = messages
      .map(
        (m) => `
        <div class="msg-bubble ${m.mine ? "mine" : ""}">
          <span class="msg-sender">${m.sender}</span>
          <span>${m.text}</span>
        </div>
      `
      )
      .join("");
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;

    messages.push({ sender: currentUserName, text, mine: true });
    localStorage.setItem(storageKey, JSON.stringify(messages));
    input.value = "";
    renderMessages();

    // Simula resposta de outro participante com notificação push de nova mensagem
    setTimeout(() => {
      const reply = { sender: "Rafael Costa", text: "Beleza, fechado! Nos vemos lá.", mine: false };
      messages.push(reply);
      localStorage.setItem(storageKey, JSON.stringify(messages));
      renderMessages();
      showPushNotification(`💬 Nova mensagem em ${match.title}`, `${reply.sender}: ${reply.text}`);
    }, 1500);
  });

  renderMatch();
  renderMessages();
});