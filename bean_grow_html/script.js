const routes = {
  home: "./index.html",
  missions: "./missions.html",
  records: "./records.html",
  collection: "./collection.html",
  settings: "./settings.html",
};

const STORAGE_KEY = "beanGrowMissionStateV1";
const EXP_PER_CLEAR = 30;
const EXP_PER_LEVEL = 100;

const missions = [
  {
    id: "tumbler",
    icon: "🥤",
    title: "카페 테이크아웃 시 텀블러 사용",
    detail: "카페나 매장에서 일회용 컵 대신 텀블러를 사용했어요.",
    type: "자가체크",
  },
  {
    id: "bag",
    icon: "🛍",
    title: "비닐 대신 장바구니 사용",
    detail: "장보기나 편의점 이용 때 개인 장바구니를 사용했어요.",
    type: "자가체크",
  },
  {
    id: "recycle",
    icon: "♻",
    title: "재활용품 분리수거 완료",
    detail: "종이, 플라스틱, 캔, 유리 등을 분리해서 배출했어요.",
    type: "자가체크",
  },
  {
    id: "no-disposable",
    icon: "🥡",
    title: "배달 주문 시 일회용품 제외",
    detail: "주문 화면에서 일회용 수저와 포크를 제외했어요.",
    type: "자가체크",
  },
  {
    id: "stairs",
    icon: "🪜",
    title: "엘리베이터 대신 계단 이용",
    detail: "가까운 층은 계단으로 이동했어요.",
    type: "자가체크",
  },
  {
    id: "steps",
    icon: "👟",
    title: "오늘의 걸음 수 인증",
    detail: "걷기 목표를 달성했다고 체크했어요.",
    type: "자가체크",
  },
  {
    id: "plogging",
    icon: "🧤",
    title: "쓰레기 줍기",
    detail: "산책 중 보이는 쓰레기를 주워 정리했어요.",
    type: "자가체크",
  },
  {
    id: "empty-plate",
    icon: "🍽",
    title: "잔반 없는 그릇 만들기",
    detail: "먹을 만큼만 담고 남기지 않았어요.",
    type: "자가체크",
  },
  {
    id: "lights-off",
    icon: "💡",
    title: "사용하지 않는 전등 끄기",
    detail: "비어 있는 공간의 전등을 껐어요.",
    type: "자가체크",
  },
  {
    id: "veggie",
    icon: "🥗",
    title: "채식 메뉴 한 끼 먹기",
    detail: "오늘 한 끼는 채식 위주의 메뉴로 먹었어요.",
    type: "자가체크",
  },
];

const eventMessages = {
  1: {
    icon: "🌱",
    title: "첫 번째 클리어!",
    body: "첫 실천이 기록됐어요. 강낭콩이 새싹처럼 반응합니다.",
  },
  5: {
    icon: "🌿",
    title: "5번째 클리어!",
    body: "오늘의 절반을 넘겼어요. 콩의 잎이 더 풍성해집니다.",
  },
  10: {
    icon: "🏆",
    title: "10번째 클리어!",
    body: "오늘의 미션을 모두 완료했어요. 특별 보상을 받을 수 있습니다.",
  },
};

document.querySelectorAll("[data-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = routes[button.dataset.nav] || "./index.html";
  });
});

function loadState() {
  const fallback = {
    completed: [],
    eventsSeen: [],
    completedAt: {},
  };

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || !Array.isArray(parsed.completed)) return fallback;
    return {
      completed: parsed.completed,
      eventsSeen: Array.isArray(parsed.eventsSeen) ? parsed.eventsSeen : [],
      completedAt: parsed.completedAt || {},
    };
  } catch {
    return fallback;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getProgress(state = loadState()) {
  const clearCount = state.completed.length;
  const totalExp = clearCount * EXP_PER_CLEAR;
  const level = Math.max(1, Math.floor(totalExp / EXP_PER_LEVEL) + 1);
  const currentExp = totalExp % EXP_PER_LEVEL;
  const stage = clearCount >= 10 ? 3 : clearCount >= 5 ? 2 : 1;
  return {
    clearCount,
    totalExp,
    level,
    currentExp,
    nextExp: EXP_PER_LEVEL,
    expPercent: Math.round((currentExp / EXP_PER_LEVEL) * 100),
    stage,
  };
}

function completeMission(id) {
  const state = loadState();
  if (state.completed.includes(id)) return;

  state.completed.push(id);
  state.completedAt[id] = new Date().toISOString();
  const clearCount = state.completed.length;
  saveState(state);

  renderApp();
  maybeShowEvent(clearCount);
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  renderApp();
}

function maybeShowEvent(clearCount) {
  const state = loadState();
  const key = String(clearCount);
  if (!eventMessages[clearCount] || state.eventsSeen.includes(key)) return;
  state.eventsSeen.push(key);
  saveState(state);
  showEventModal(eventMessages[clearCount]);
}

function showEventModal(event) {
  const existing = document.querySelector(".event-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className = "event-modal";
  modal.innerHTML = `
    <div class="event-card" role="dialog" aria-modal="true" aria-label="${event.title}">
      <span>${event.icon}</span>
      <h2>${event.title}</h2>
      <p>${event.body}</p>
      <button type="button">확인</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector("button").addEventListener("click", () => modal.remove());
}

function missionById(id) {
  return missions.find((mission) => mission.id === id);
}

function renderApp() {
  const state = loadState();
  const progress = getProgress(state);
  renderProgress(progress);
  renderHome(state, progress);
  renderMissions(state, progress);
  renderRecords(state, progress);
  updateCalendar(progress);
}

function renderProgress(progress) {
  const levelText = document.querySelector("#levelText");
  const homeExp = document.querySelector("#homeExp");
  const expText = document.querySelector("#expText");
  const clearBadge = document.querySelector("#clearCountBadge");
  const stageBean = document.querySelector("#stageBean");
  const hint = document.querySelector("#waterHint");

  if (levelText) levelText.textContent = `Lv. ${progress.level}`;
  if (homeExp) homeExp.style.width = `${progress.expPercent}%`;
  if (expText) expText.textContent = `${progress.currentExp} / ${progress.nextExp} EXP`;
  if (clearBadge) clearBadge.textContent = progress.clearCount;
  if (hint) hint.textContent = progress.clearCount >= 10 ? "오늘의 미션을 모두 완료했어요" : `${10 - progress.clearCount}개 더 체크할 수 있어요`;
  if (stageBean) {
    stageBean.src = `./assets/bean-stage${progress.stage}.gif`;
    stageBean.dataset.stage = String(progress.stage);
    stageBean.alt = `강낭콩 캐릭터 ${progress.stage}단계`;
  }
}

function renderHome(state, progress) {
  const list = document.querySelector("#homeMissionList");
  const progressText = document.querySelector("#homeProgressText");
  const clearBig = document.querySelector("#homeClearBig");
  const remainBig = document.querySelector("#homeRemainBig");
  if (progressText) progressText.textContent = `${progress.clearCount} / ${missions.length} 완료`;
  if (clearBig) clearBig.textContent = progress.clearCount;
  if (remainBig) remainBig.textContent = Math.max(0, missions.length - progress.clearCount);
  if (!list) return;

  const nextMissions = missions.filter((mission) => !state.completed.includes(mission.id)).slice(0, 3);
  const recentDone = state.completed.slice(-2).map(missionById).filter(Boolean);
  const visible = nextMissions.length ? nextMissions : recentDone;

  if (!visible.length) {
    list.innerHTML = `
      <div class="home-check-empty">
        <span>🌱</span>
        <p>미션 화면에서 첫 자가체크를 시작해보세요.</p>
        <a href="./missions.html">미션 시작</a>
      </div>
    `;
    return;
  }

  if (progress.clearCount >= missions.length) {
    list.innerHTML = `
      <div class="home-check-empty complete">
        <span>🏆</span>
        <p>오늘의 자가체크를 모두 완료했어요.</p>
        <a href="./records.html">기록 보기</a>
      </div>
    `;
    return;
  }

  list.innerHTML = visible.map((mission) => renderHomeQuest(mission, state.completed.includes(mission.id))).join("");
  bindMissionButtons(list);
}

function renderHomeQuest(mission, completed) {
  return `
    <article class="home-check-item${completed ? " complete" : ""}">
      <span class="quest-icon green">${mission.icon}</span>
      <div>
        <h3>${mission.title}</h3>
        <p>${mission.type} · +${EXP_PER_CLEAR} EXP</p>
      </div>
      <button type="button" data-complete="${mission.id}" ${completed ? "disabled" : ""}>${completed ? "완료" : "체크"}</button>
    </article>
  `;
}

function renderMissions(state, progress) {
  const list = document.querySelector("#missionCheckList");
  const progressText = document.querySelector("#missionProgressText");
  const progressBar = document.querySelector("#missionProgressBar");
  if (progressText) progressText.textContent = `${progress.clearCount} / ${missions.length} 완료`;
  if (progressBar) progressBar.style.width = `${Math.round((progress.clearCount / missions.length) * 100)}%`;

  [1, 5, 10].forEach((count) => {
    const item = document.querySelector(`#milestone${count}`);
    if (item) item.classList.toggle("done", progress.clearCount >= count);
  });

  if (!list) return;
  list.innerHTML = missions.map((mission) => renderQuest(mission, state.completed.includes(mission.id), "wide")).join("");
  bindMissionButtons(list);

  document.querySelector("#resetProgress")?.addEventListener("click", resetProgress);
}

function renderQuest(mission, completed, mode) {
  const classes = mode === "wide" ? "wide-quest mission-check-card" : "quest";
  const doneClass = completed ? " complete" : "";
  return `
    <article class="${classes}${doneClass}">
      <span class="quest-icon green">${mission.icon}</span>
      <div class="quest-main">
        <h3>${mission.title}</h3>
        ${mode === "wide" ? `<p>${mission.detail}</p>` : ""}
        <div class="bar"><span style="width: ${completed ? 100 : 0}%"></span></div>
        <small>${completed ? "1 / 1" : "0 / 1"}</small>
      </div>
      <strong>+${EXP_PER_CLEAR} EXP</strong>
      <button type="button" data-complete="${mission.id}" ${completed ? "disabled" : ""}>${completed ? "완료" : "체크"}</button>
    </article>
  `;
}

function bindMissionButtons(root) {
  root.querySelectorAll("[data-complete]").forEach((button) => {
    button.addEventListener("click", () => completeMission(button.dataset.complete));
  });
}

function renderRecords(state, progress) {
  const doneList = document.querySelector("#doneMissionList");
  if (!doneList) return;

  const completedMissions = state.completed.map(missionById).filter(Boolean);
  document.querySelector("#recordClearDays").textContent = `${progress.clearCount}개`;
  document.querySelector("#recordExp").textContent = String(progress.totalExp);
  document.querySelector("#recordLevel").textContent = `Lv. ${progress.level}`;
  document.querySelector("#recordStage").textContent = progress.stage === 3 ? "열매" : progress.stage === 2 ? "꽃핀 콩" : "새싹";
  document.querySelector("#doneListCount").textContent = `${progress.clearCount} / ${missions.length}`;

  if (!completedMissions.length) {
    doneList.innerHTML = `<p class="empty-state">아직 완료한 미션이 없습니다.</p>`;
    return;
  }

  doneList.innerHTML = completedMissions.map((mission) => `
    <article>
      <span>${mission.icon}</span>
      <p>${mission.title}</p>
      <b>+${EXP_PER_CLEAR} EXP</b>
      <i>✓</i>
    </article>
  `).join("");
}

function updateCalendar(progress) {
  const today = document.querySelector(".dates .today");
  if (today) today.classList.toggle("sprout", progress.clearCount > 0);
}

function initWaterAction() {
  const can = document.querySelector("#waterCan");
  const garden = document.querySelector("#gardenDrop");
  if (!can || !garden) return;

  can.addEventListener("click", () => {
    garden.classList.remove("watered");
    void garden.offsetWidth;
    garden.classList.add("watered");
    setTimeout(() => {
      window.location.href = routes.missions;
    }, 260);
  });
}

function initStageBean() {
  const bean = document.querySelector("#stageBean");
  if (!bean) return;

  bean.addEventListener("click", () => {
    bean.classList.remove("stage-pop");
    void bean.offsetWidth;
    bean.classList.add("stage-pop");
  });
}

function initCollectionFilter() {
  const buttons = document.querySelectorAll(".tabs [data-filter]");
  const groups = document.querySelectorAll(".collection-group[data-group]");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      const filter = button.dataset.filter;
      groups.forEach((group) => {
        group.classList.toggle("hidden", filter !== "all" && filter !== "latest" && group.dataset.group !== filter);
      });
    });
  });
}

function initCalendarButtons() {
  const label = document.querySelector("#monthLabel");
  const dates = document.querySelector("#calendarDates");
  if (!label || !dates) return;
  const months = ["2026년 5월", "2026년 6월", "2026년 7월"];
  let index = 1;
  const setMonth = (nextIndex) => {
    index = Math.max(0, Math.min(months.length - 1, nextIndex));
    label.textContent = months[index];
    dates.classList.remove("pulse");
    void dates.offsetWidth;
    dates.classList.add("pulse");
  };
  document.querySelector("#prevMonth")?.addEventListener("click", () => setMonth(index - 1));
  document.querySelector("#nextMonth")?.addEventListener("click", () => setMonth(index + 1));
}

document.querySelector("#languageBtn")?.addEventListener("click", (event) => {
  event.currentTarget.textContent = event.currentTarget.textContent === "한국어" ? "English" : "한국어";
});

initWaterAction();
initStageBean();
initCollectionFilter();
initCalendarButtons();
renderApp();
