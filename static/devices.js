import { api } from "./api.js";
import { openPopup } from "./popup.js";

const MAX_DEVICES = 8;

const devicesContainer = document.getElementById("devices");
if (!devicesContainer) throw new Error("Devices container not found");
const pagesElement = document.getElementById("pages");
if (!pagesElement) throw new Error("Pages element not found");
const filePicker = document.getElementById("file-picker");
if (!filePicker) throw new Error("File picker not found");

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
  const lastDevice = Math.min(firstDevice + MAX_DEVICES, devices.length);

  for (let i = firstDevice; i < lastDevice; i++) {
    const deviceElement = document.createElement("div");
    deviceElement.className = "device";

    // Create p for all word in each device
    for (const word of devices[i].split("-")) {
      const wordElement = document.createElement("p");
      wordElement.textContent = word.charAt(0).toUpperCase() + word.slice(1);
      deviceElement.appendChild(wordElement);
    }

    const receiver = devices[i];
    // Pick file to be sent to clicked on device
    deviceElement.addEventListener("click", () => {
      filePicker.onchange = async () => {
        const file = filePicker.files[0];
        if (!file) return; // picker was cancelled

        try {
          await api.trySendFile(getClientId(), receiver);
          openPopup(
            "File sent",
            `Waiting for ${receiver} to accept ${file.name}`,
          );
        } catch {
          openPopup("File failed to send", `${receiver} couldn't be reached`);
        } finally {
          filePicker.value = ""; // so picking the same file again still works
        }
      };
      filePicker.click();
    });

    devicesContainer.appendChild(deviceElement);
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
