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
    "who-is-the"
];

const devicesContainer = document.getElementById("devices");
if (!devicesContainer) throw new Error("Devices container not found");

for (let i in TEST_DEVICES) {
    if (i >= MAX_DEVICES) break;

    const deviceElement = document.createElement("div");
    deviceElement.className = "device";

    const deviceLink = document.createElement("a");
    deviceLink.href = `https://${TEST_DEVICES[i]}.fileshare-garden.com`;
    deviceLink.textContent = TEST_DEVICES[i].split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    deviceElement.appendChild(deviceLink);
    devicesContainer.appendChild(deviceElement);
}
