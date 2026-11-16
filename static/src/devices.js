import { api } from "./api.js";

const MAX_DEVICES = 8;

const devicesContainer = document.getElementById("devices");
if (!devicesContainer) throw new Error("Devices container not found");
const pagesElement = document.getElementById("pages");
if (!pagesElement) throw new Error("Pages element not found");

let devices = [];
let maxPage = 0;

// clientId
const getClientId = () => document.getElementById("user-id").textContent;

let curPage = 0;
const cyclePage = (step) => {
  maxPage = Math.max(0, Math.ceil(devices.length / MAX_DEVICES) - 1);
  curPage = Math.min(curPage, maxPage); // the list may have shrunk
  // Do nothing if first or last page
  if (curPage == 0 && step == -1) return;
  if (curPage == maxPage && step == 1) return;
  curPage += step;

  pagesElement.textContent = `${curPage + 1} / ${maxPage + 1}`;

  devicesContainer.replaceChildren();

  const firstDevice = curPage * MAX_DEVICES;
  const lastDevice = firstDevice + MAX_DEVICES;
  for (const device of devices.slice(firstDevice, lastDevice)) {
    const deviceDiv = document.createElement("div");
    deviceDiv.className = "device";
    const deviceText = document.createElement("p");
    deviceText.textContent = device;
    deviceDiv.appendChild(deviceText);

    // Pick file to be sent to clicked on device
    deviceDiv.addEventListener("click", api.trySendFile(getClientId(), device));

    devicesContainer.appendChild(deviceDiv);
  }
};

export const init = async () => {
  devices = (await api.getUserIds()).filter((id) => id !== getClientId());

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
  devices = deviceIds.filter((id) => id !== getClientId()); // don't list ourselves
  cyclePage(0);
};
