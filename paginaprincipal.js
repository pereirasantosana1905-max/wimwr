document.addEventListener("DOMContentLoaded", () => {
  // Carrega dados do usuário salvo
  const savedUser = JSON.parse(localStorage.getItem("wime_user") || "{}");
  if (savedUser.nome) {
    const headerName = document.getElementById("headerUserName");
    if (headerName) headerName.textContent = savedUser.nome;
  }
  if (savedUser.foto) {
    const avatarBox = document.getElementById("headerAvatarBox");
    if (avatarBox) avatarBox.innerHTML = `<img src="${savedUser.foto}" alt="Avatar">`;
  }

  // Menu Hambúrguer
  const menuBtn = document.getElementById("menuBtn");
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("active");
    hamburgerMenu.classList.toggle("show");
    const isOpen = hamburgerMenu.classList.contains("show");
    menuBtn.setAttribute("aria-expanded", isOpen);
  });

  // Partidas padrão + partidas criadas pelo usuário no localStorage
  const imgMap = {
    futebol: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80",
    volei: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80",
    basquete: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80"
  };

  const defaultMatches = [
    {
      id: "1",
      title: "Futebol Society - Campo A",
      sport: "futebol",
      location: "Quadra Central",
      distance: 3,
      date: "Hoje",
      time: "19:00",
      when: "hoje",
      visibility: "publica",
      current: 8,
      max: 10,
      joined: false,
      lat: -25.429,
      lng: -49.271
    },
    {
      id: "2",
      title: "Vôlei de Praia - Arena 2",
      sport: "volei",
      location: "Arena Sol",
      distance: 8,
      date: "Sábado",
      time: "10:00",
      when: "fimdesemana",
      visibility: "publica",
      current: 4,
      max: 6,
      joined: false,
      lat: -25.442,
      lng: -49.285
    },
    {
      id: "3",
      title: "Basquete 3x3 - Parque Central",
      sport: "basquete",
      location: "Quadra Parque",
      distance: 14,
      date: "Hoje",
      time: "17:30",
      when: "hoje",
      visibility: "publica",
      current: 5,
      max: 6,
      joined: false,
      lat: -25.412,
      lng: -49.268
    }
  ];

  let allMatches = JSON.parse(localStorage.getItem("wime_matches") || "null") || defaultMatches;
  function saveMatches() {
    localStorage.setItem("wime_matches", JSON.stringify(allMatches));
  }

  // --- MAPA INTERATIVO (LEAFLET) ---
  const centerCoords = [-25.4284, -49.2733];
  let map = null;
  let radiusCircle = null;
  let mapMarkers = [];

  if (typeof L !== "undefined" && document.getElementById("wimeMap")) {
    map = L.map("wimeMap", { zoomControl: false }).setView(centerCoords, 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    radiusCircle = L.circle(centerCoords, {
      color: "#3C3374",
      fillColor: "#6A77C4",
      fillOpacity: 0.18,
      radius: 15000
    }).addTo(map);
  }

  function updateMapPins(visibleMatches, maxRadiusKm) {
    if (!map) return;
    mapMarkers.forEach((m) => map.removeLayer(m));
    mapMarkers = [];

    if (radiusCircle) {
      radiusCircle.setRadius(maxRadiusKm * 1000);
    }

    visibleMatches.forEach((m) => {
      if (m.visibility === "privada") return;
      const lat = m.lat || centerCoords[0] + (Math.random() - 0.5) * 0.02;
      const lng = m.lng || centerCoords[1] + (Math.random() - 0.5) * 0.02;
      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<strong>${m.title}</strong><br>${m.location} (${m.distance} km)`);
      mapMarkers.push(marker);
    });
  }

  // --- RENDERIZAÇÃO DOS CARDS ---
  const matchesList = document.getElementById("matchesList");

  function renderMatchCards(list) {
    matchesList.innerHTML = "";
    list.forEach((m) => {
      const remaining = Math.max(0, m.max - m.current);
      const badgeVis = m.visibility === "privada" ? "🔒 Privada (Link)" : "🌐 Pública";
      const sportLabel = m.sport.charAt(0).toUpperCase() + m.sport.slice(1);
      const slotsText =
        remaining === 0
          ? `Lotado (${m.current}/${m.max})`
          : `${remaining} ${remaining === 1 ? "vaga disponível" : "vagas disponíveis"} (${m.current}/${m.max})`;

      const card = document.createElement("article");
      card.className = "match-card";
      card.setAttribute("data-id", m.id);
      card.innerHTML = `
        <div class="match-image-container">
          <img src="${imgMap[m.sport] || imgMap.futebol}" alt="${m.title}" class="match-img">
          <span class="match-badge">${sportLabel}</span>
        </div>
        <div class="match-body">
          <div class="match-info">
            <h3>${m.title} <span class="visibility-badge">${badgeVis}</span></h3>
            <p>📍 ${m.location} (${m.distance} km) • 🕒 ${m.date}, ${m.time}</p>
            <span class="slots-highlight ${remaining === 0 ? "full" : ""}">${slotsText}</span>
          </div>
          <div class="card-actions">
            <button class="btn-join btn-toggle-join ${m.joined ? "joined" : ""}">${m.joined ? "Confirmado ✓" : "Participar"}</button>
            <button class="btn-share" data-title="${m.title}" data-id="${m.id}">Convidar</button>
            <a href="partida.html?id=${m.id}" class="btn-room">Sala & Chat</a>
          </div>
        </div>
      `;
      matchesList.appendChild(card);
    });
  }

  // --- FILTROS COMBINADOS ---
  const filterBtns = document.querySelectorAll(".filter-btn");
  const radiusFilter = document.getElementById("radiusFilter");
  const dateFilter = document.getElementById("dateFilter");
  const searchInput = document.getElementById("searchInput");
  const mapRadiusLabel = document.getElementById("mapRadiusLabel");
  let selectedSport = "todos";

  function applyAllFilters() {
    const maxRadius = parseInt(radiusFilter.value, 10);
    const selectedDate = dateFilter.value;
    const term = searchInput.value.toLowerCase();

    mapRadiusLabel.textContent = `Raio: ${maxRadius} km`;

    const filtered = allMatches.filter((m) => {
      const matchSport = selectedSport === "todos" || m.sport === selectedSport;
      const matchDist = m.distance <= maxRadius;
      const matchDate = selectedDate === "todas" || m.when === selectedDate;
      const matchText = `${m.title} ${m.sport} ${m.location} ${m.date} ${m.time}`.toLowerCase().includes(term);
      return matchSport && matchDist && matchDate && matchText;
    });

    renderMatchCards(filtered);
    updateMapPins(filtered, maxRadius);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedSport = btn.getAttribute("data-sport");
      applyAllFilters();
    });
  });

  radiusFilter.addEventListener("change", applyAllFilters);
  dateFilter.addEventListener("change", applyAllFilters);
  searchInput.addEventListener("input", applyAllFilters);

  // --- CRIAR NOVA PARTIDA ---
  const btnCreateMatch = document.getElementById("btnCreateMatch");
  const createMatchModal = document.getElementById("createMatchModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const btnCancelModal = document.getElementById("btnCancelModal");
  const formCreateMatch = document.getElementById("formCreateMatch");
  const toggleModal = () => createMatchModal.classList.toggle("hidden");

  btnCreateMatch.addEventListener("click", toggleModal);
  btnCloseModal.addEventListener("click", toggleModal);
  btnCancelModal.addEventListener("click", toggleModal);

  formCreateMatch.addEventListener("submit", (e) => {
    e.preventDefault();
    const newMatch = {
      id: String(Date.now()),
      title: document.getElementById("titleMatch").value,
      sport: document.getElementById("sportCategory").value,
      location: document.getElementById("locationMatch").value,
      distance: 2,
      date: document.getElementById("dateMatch").value,
      time: document.getElementById("timeMatch").value,
      when: "hoje",
      visibility: document.getElementById("visibilityMatch").value,
      current: 1,
      max: parseInt(document.getElementById("maxPlayersMatch").value, 10),
      joined: true,
      lat: centerCoords[0] + (Math.random() - 0.5) * 0.015,
      lng: centerCoords[1] + (Math.random() - 0.5) * 0.015
    };

    allMatches.unshift(newMatch);
    saveMatches();
    formCreateMatch.reset();
    toggleModal();
    applyAllFilters();
  });

  // --- PARTICIPAR / CANCELAR PRESENÇA E COMPARTILHAR ---
  const shareModal = document.getElementById("shareModal");
  const shareMatchTitle = document.getElementById("shareMatchTitle");
  const shareLinkInput = document.getElementById("shareLinkInput");
  const btnShareWhatsApp = document.getElementById("btnShareWhatsApp");
  const btnShareInstagram = document.getElementById("btnShareInstagram");

  document.getElementById("btnCloseShare").addEventListener("click", () => shareModal.classList.add("hidden"));
  btnShareInstagram.addEventListener("click", () => {
    navigator.clipboard.writeText(shareLinkInput.value);
    alert("Link copiado! Cole na sua DM ou Stories do Instagram.");
  });

  matchesList.addEventListener("click", (e) => {
    const card = e.target.closest(".match-card");
    if (!card) return;
    const matchId = card.getAttribute("data-id");
    const matchObj = allMatches.find((m) => m.id === matchId);

    if (e.target.classList.contains("btn-toggle-join") && matchObj) {
      if (!matchObj.joined) {
        if (matchObj.current >= matchObj.max) {
          alert("Esta partida já está lotada!");
          return;
        }
        matchObj.current++;
        matchObj.joined = true;
      } else {
        matchObj.current--;
        matchObj.joined = false;
      }
      saveMatches();
      applyAllFilters();
    }

    if (e.target.classList.contains("btn-share") && matchObj) {
      const baseUrl = window.location.href.replace("paginaprincipal.html", `partida.html?id=${matchObj.id}`);
      shareMatchTitle.textContent = matchObj.title;
      shareLinkInput.value = baseUrl;
      const msg = encodeURIComponent(`Bora jogar "${matchObj.title}" no Wime? Confirme sua vaga aqui: ${baseUrl}`);
      btnShareWhatsApp.href = `https://api.whatsapp.com/send?text=${msg}`;
      shareModal.classList.remove("hidden");
    }
  });

  // --- ONBOARDING ---
  const onboardingModal = document.getElementById("onboardingModal");
  const onboardingContent = document.getElementById("onboardingContent");
  const onboardingDots = document.getElementById("onboardingDots");
  const btnNextOnboarding = document.getElementById("btnNextOnboarding");
  const slides = [
    { icon: "🔍", title: "Encontre jogos perto de você", desc: "Visualize o mapa interativo e filtre partidas por esporte, data ou raio de 5 km a 15 km." },
    { icon: "⚡", title: "Confirme em poucos cliques", desc: "Veja quantas vagas restam, garanta sua presença e entre no chat exclusivo da partida." },
    { icon: "➕", title: "Organize suas próprias partidas", desc: "Crie jogos públicos ou privados e convide amigos direto pelo WhatsApp ou Instagram." }
  ];
  let currentSlide = 0;

  function renderOnboarding() {
    const slide = slides[currentSlide];
    onboardingContent.innerHTML = `<div class="onboarding-icon">${slide.icon}</div><h4>${slide.title}</h4><p style="color:var(--color-gray-text); font-size:0.9rem; margin-top:6px;">${slide.desc}</p>`;
    onboardingDots.innerHTML = slides.map((_, i) => `<span class="step-dot ${i === currentSlide ? "active" : ""}"></span>`).join("");
    btnNextOnboarding.textContent = currentSlide === slides.length - 1 ? "Começar!" : "Próximo";
  }

  function closeOnboarding() {
    onboardingModal.classList.add("hidden");
    localStorage.setItem("wime_onboarding_done", "true");
  }

  if (!localStorage.getItem("wime_onboarding_done")) {
    renderOnboarding();
    onboardingModal.classList.remove("hidden");
  }

  btnNextOnboarding.addEventListener("click", () => {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      renderOnboarding();
    } else {
      closeOnboarding();
    }
  });
  document.getElementById("btnSkipOnboarding").addEventListener("click", closeOnboarding);
  document.getElementById("btnCloseOnboarding").addEventListener("click", closeOnboarding);
  document.getElementById("btnOpenOnboarding").addEventListener("click", () => {
    currentSlide = 0;
    renderOnboarding();
    onboardingModal.classList.remove("hidden");
  });

  // Inicializa lista e mapa
  applyAllFilters();
});

function responderValidacao(aconteceu) {
  document.getElementById("postMatchValidation").classList.add("hidden");
  alert(
    aconteceu
      ? "Obrigado! Local e organizador validados com sucesso."
      : "Registramos que a partida não ocorreu. Obrigado pelo feedback!"
  );
}