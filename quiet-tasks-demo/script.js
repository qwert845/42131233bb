const taskSets = [
  {
    title: "Ship a tiny working thing",
    text: "A compact private web page with real interactions, clean layout, and no setup friction.",
    tasks: [
      ["Pick a small scope", "done", "plan"],
      ["Build responsive layout", "done", "dev"],
      ["Wire task actions", "done", "dev"],
      ["Upload privately", "pending", "note"],
      ["Share the repo link", "pending", "note"],
    ],
  },
  {
    title: "Make the page feel alive",
    text: "Refresh the task set, add a quick item, and keep the interface useful on phone or desktop.",
    tasks: [
      ["Refresh dashboard data", "done", "dev"],
      ["Check mobile wrapping", "done", "plan"],
      ["Keep colors balanced", "done", "note"],
      ["Confirm private visibility", "pending", "note"],
      ["Open from GitHub", "pending", "dev"],
    ],
  },
];

let activeSet = 0;
let addedCount = 0;

const taskList = document.querySelector("#taskList");
const focusTitle = document.querySelector("#focusTitle");
const focusText = document.querySelector("#focusText");
const doneCount = document.querySelector("#doneCount");
const queueCount = document.querySelector("#queueCount");
const focusMinutes = document.querySelector("#focusMinutes");

function render() {
  const set = taskSets[activeSet];
  focusTitle.textContent = set.title;
  focusText.textContent = set.text;
  taskList.replaceChildren(
    ...set.tasks.map(([title, status, tag]) => {
      const item = document.createElement("li");
      item.className = `task-item ${status}`;
      item.innerHTML = `
        <span class="check">OK</span>
        <span>
          <span class="task-title">${title}</span>
          <span class="task-meta">${status === "done" ? "Finished" : "Next up"}</span>
        </span>
        <span class="tag ${tag}">${tag}</span>
      `;
      item.addEventListener("click", () => {
        item.classList.toggle("pending");
        updateStats();
      });
      return item;
    }),
  );
  updateStats();
}

function updateStats() {
  const done = taskList.querySelectorAll(".task-item:not(.pending)").length;
  const total = taskList.querySelectorAll(".task-item").length;
  doneCount.textContent = done;
  queueCount.textContent = total - done;
  focusMinutes.textContent = 25 + addedCount * 5;
}

document.querySelector("#shuffleButton").addEventListener("click", () => {
  activeSet = (activeSet + 1) % taskSets.length;
  render();
});

document.querySelector("#addButton").addEventListener("click", () => {
  addedCount += 1;
  taskSets[activeSet].tasks.push([`Quick task ${addedCount}`, "pending", "plan"]);
  render();
});

render();
