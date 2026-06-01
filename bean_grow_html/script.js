const routes = {
  home: "./index.html",
  missions: "./missions.html",
  records: "./records.html",
  collection: "./collection.html",
  settings: "./settings.html",
};

document.querySelectorAll("[data-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = routes[button.dataset.nav] || "./index.html";
  });
});

function initWaterDrag() {
  const can = document.querySelector("#waterCan");
  const garden = document.querySelector("#gardenDrop");
  if (!can || !garden) return;

  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let dragging = false;

  can.addEventListener("pointerdown", (event) => {
    dragging = true;
    can.setPointerCapture(event.pointerId);
    const rect = can.getBoundingClientRect();
    startX = event.clientX;
    startY = event.clientY;
    originX = rect.left;
    originY = rect.top;
    can.classList.add("dragging");
    can.style.left = `${originX}px`;
    can.style.top = `${originY}px`;
    can.style.right = "auto";
    can.style.bottom = "auto";
    can.style.position = "fixed";
  });

  can.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const nextX = originX + event.clientX - startX;
    const nextY = originY + event.clientY - startY;
    can.style.left = `${nextX}px`;
    can.style.top = `${nextY}px`;
  });

  can.addEventListener("pointerup", (event) => {
    if (!dragging) return;
    dragging = false;
    can.releasePointerCapture(event.pointerId);
    can.classList.remove("dragging");

    const canRect = can.getBoundingClientRect();
    const gardenRect = garden.getBoundingClientRect();
    const canCenterX = canRect.left + canRect.width / 2;
    const canCenterY = canRect.top + canRect.height / 2;
    const dropped =
      canCenterX > gardenRect.left &&
      canCenterX < gardenRect.right &&
      canCenterY > gardenRect.top &&
      canCenterY < gardenRect.bottom;

    can.style.position = "";
    can.style.left = "";
    can.style.top = "";
    can.style.right = "";
    can.style.bottom = "";

    if (dropped) {
      garden.classList.remove("watered");
      void garden.offsetWidth;
      garden.classList.add("watered");
      document.querySelector("#homeExp")?.style.setProperty("width", "68%");
      const expText = document.querySelector("#expText");
      const hint = document.querySelector("#waterHint");
      if (expText) expText.textContent = "450 / 700 EXP";
      if (hint) hint.textContent = "물주기 완료! +30 EXP";
      const mission = document.querySelector("#waterMission");
      if (mission) {
        mission.classList.add("complete");
        mission.querySelector(".bar span")?.style.setProperty("width", "100%");
        const count = mission.querySelector("small");
        if (count) count.textContent = "1 / 1";
        const action = mission.querySelector("button");
        if (action) action.textContent = "✓";
      }
    }
  });
}

function initStageBean() {
  const bean = document.querySelector("#stageBean");
  if (!bean) return;

  const stages = [
    { id: 1, src: "./assets/bean-stage1.gif", exp: "120 / 300 EXP", width: "40%", label: "1단계 새싹 콩" },
    { id: 2, src: "./assets/bean-stage2.gif", exp: "420 / 700 EXP", width: "60%", label: "2단계 꽃핀 콩" },
    { id: 3, src: "./assets/bean-stage3.gif", exp: "820 / 1000 EXP", width: "82%", label: "3단계 열매 콩" },
  ];

  const setStage = (stage) => {
    bean.dataset.stage = String(stage.id);
    bean.src = stage.src;
    bean.alt = `강낭콩 캐릭터 ${stage.id}단계`;
    bean.classList.remove("stage-pop");
    void bean.offsetWidth;
    bean.classList.add("stage-pop");
    document.querySelector("#homeExp")?.style.setProperty("width", stage.width);
    const expText = document.querySelector("#expText");
    const hint = document.querySelector("#waterHint");
    if (expText) expText.textContent = stage.exp;
    if (hint) hint.textContent = `${stage.label}로 변경됨`;
  };

  const goNext = () => {
    const current = Number(bean.dataset.stage || "2");
    const next = stages[(stages.findIndex((stage) => stage.id === current) + 1) % stages.length];
    setStage(next);
  };

  bean.addEventListener("click", goNext);
  bean.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goNext();
    }
  });
}

function initMissionSort() {
  const list = document.querySelector("#missionDragList");
  if (!list) return;

  let card = null;
  let placeholder = null;
  let startY = 0;
  let offsetY = 0;
  let startRect = null;

  list.addEventListener("pointerdown", (event) => {
    const target = event.target.closest(".draggable-card");
    if (!target || event.target.closest("button")) return;
    card = target;
    startY = event.clientY;
    startRect = card.getBoundingClientRect();
    offsetY = event.clientY - startRect.top;
    card.setPointerCapture(event.pointerId);
  });

  list.addEventListener("pointermove", (event) => {
    if (!card) return;
    const moved = Math.abs(event.clientY - startY);
    if (moved < 8 && !placeholder) return;

    if (!placeholder) {
      placeholder = document.createElement("div");
      placeholder.className = "drag-placeholder";
      placeholder.style.height = `${startRect.height}px`;
      card.after(placeholder);
      card.classList.add("lifted");
      card.style.width = `${startRect.width}px`;
      card.style.left = `${startRect.left}px`;
    }

    card.style.top = `${event.clientY - offsetY}px`;
    const siblings = [...list.querySelectorAll(".draggable-card:not(.lifted)")];
    const after = siblings.find((item) => event.clientY < item.getBoundingClientRect().top + item.offsetHeight / 2);
    if (after) {
      list.insertBefore(placeholder, after);
    } else {
      list.appendChild(placeholder);
    }
  });

  list.addEventListener("pointerup", (event) => {
    if (!card) return;
    card.releasePointerCapture(event.pointerId);
    if (placeholder) {
      placeholder.replaceWith(card);
    }
    card.classList.remove("lifted");
    card.style.width = "";
    card.style.left = "";
    card.style.top = "";
    card = null;
    placeholder = null;
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
  event.currentTarget.textContent = event.currentTarget.textContent.startsWith("한국어") ? "English⌄" : "한국어⌄";
});

initWaterDrag();
initStageBean();
initMissionSort();
initCollectionFilter();
initCalendarButtons();
