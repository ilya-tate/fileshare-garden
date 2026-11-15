import { api } from "./api.js";

const MAX_DEVICES = 8;

const devicesContainer = document.getElementById("devices");
if (!devicesContainer) throw new Error("Devices container not found");
const pagesElement = document.getElementById("pages");
if (!pagesElement) throw new Error("Pages element not found");

let devices = [];
let maxPage;

let curPage = 0;
const cyclePage = (step) => {
  // Do nothing if first or last page
  if (curPage == 0 && step == -1) return;
  if (curPage == maxPage && step == 1) return;
  curPage += step;

  pagesElement.textContent = `${curPage + 1} / ${maxPage + 1}`;

  devicesContainer.replaceChildren();

  const firstDevice = curPage * MAX_DEVICES;
  const lastDevice = Math.min(firstDevice + MAX_DEVICES, devices.length);

  for (let i = firstDevice; i < lastDevice; i++) {
    if (i >= devices.length) break;
    const deviceElement = document.createElement("div");
    deviceElement.className = "device";

    // Create link on each device
    deviceElement.addEventListener("onclick", () => {
      location.href = `https://${devices[i]}.fileshare-garden.com`;
    });

    // Create p for all word in each device
    for (const word of devices[i].split("-")) {
      const wordElement = document.createElement("p");
      wordElement.textContent = word.charAt(0).toUpperCase() + word.slice(1);
      deviceElement.appendChild(wordElement);
    }

    devicesContainer.appendChild(deviceElement);
  }
};

export const init = async () => {
  devices = await api.getUserIds();

  // Assign buttons to change page
  document.querySelectorAll(".arrow-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      cyclePage(Number(btn.dataset.step));
    });
  });

  // Desktop shows 2 rows, so each row holds half a page
  devicesContainer.style.setProperty("--columns", Math.ceil(MAX_DEVICES / 2));

  // Start on first page
  cyclePage(0);
};

export const updateList = (deviceIds) => {
  devices = deviceIds;
  maxPage = Math.ceil(devices.length / MAX_DEVICES) - 1;
  cyclePage(0);
};
