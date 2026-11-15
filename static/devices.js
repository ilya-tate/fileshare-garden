import TEST_DEVICES from "./test-devices.json" with { type: "json" };

const MAX_DEVICES = matchMedia("(max-width: 768px)").matches ? 10 : 6;

const devicesContainer = document.getElementById("devices");
if (!devicesContainer) throw new Error("Devices container not found");
const pagesElement = document.getElementById("pages");
if (!pagesElement) throw new Error("Pages element not found");

let currPage = 0;
const maxPage = Math.ceil(TEST_DEVICES.length / MAX_DEVICES) - 1;
const cyclePage = (step) => {
  // Do nothing if first or last page
  if (currPage == 0 && step == -1) return;
  if (currPage == maxPage && step == 1) return;
  currPage += step;

  pagesElement.textContent = `${currPage + 1} / ${maxPage + 1}`;

  devicesContainer.replaceChildren();

  const firstDevice = currPage * MAX_DEVICES;
  const lastDevice = Math.min(firstDevice + MAX_DEVICES, TEST_DEVICES.length);

  for (let i = firstDevice; i < lastDevice; i++) {
    if (i >= TEST_DEVICES.length) break;
    const deviceElement = document.createElement("div");
    deviceElement.className = "device";

    // Create link for each device
    const deviceLink = document.createElement("a");
    deviceElement.appendChild(deviceLink);
    deviceLink.href = `https://${TEST_DEVICES[i]}.fileshare-garden.com`;

    // Create p for all word in each device
    for (const word of TEST_DEVICES[i].split("-")) {
      const wordElement = document.createElement("p");
      wordElement.textContent = word.charAt(0).toUpperCase() + word.slice(1);
      deviceLink.appendChild(wordElement);
    }

    devicesContainer.appendChild(deviceElement);
  }
};

export const init = () => {
  // Assign buttons to change page
  document.querySelectorAll(".arrow-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      cyclePage(Number(btn.dataset.step));
    });
  });

  // Start on first page
  cyclePage(0);
};
