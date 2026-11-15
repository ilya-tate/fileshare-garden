"use strict";

const MAX_DEVICES = 12;
const TEST_DEVICES = [
  "apple-banana-tree",
  "why-not-you",
  "get-my-free",
  "yes-bro-no",
  "tim-me-the",
  "am-is-he",
  "she-is-she",
  "we-are-the",
  "they-are-the",
  "you-are-the",
  "i-am-the",
  "we-are-the",
  "who-is-the",
];

const devicesContainer = document.getElementById("devices");
if (!devicesContainer) throw new Error("Devices container not found");

// Assign buttons to change page
document.querySelectorAll(".arrow-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    cyclePage(Number(btn.dataset.step));
  });
});

let currPage = 0;
const maxPage = Math.ceil(TEST_DEVICES.length / MAX_DEVICES) - 1;
const cyclePage = (step) => {
  currPage += step;

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

// Start on first page
cyclePage(0);
