import {
  init as initDeviceList,
  updateList as updateDeviceListUi,
} from "./devices.js";
import { api } from "./api.js";

let myDeviceId = null;
const assignId = async () => {
  myDeviceId = (await api.registerUser()).id;
  const myDeviceIdElement = document.getElementById("user-id");
  myDeviceIdElement.textContent = myDeviceId;
};

const updateDeviceList = async () => {
  try {
    const response = await fetch("/all-clients");
    const json = await response.json();
    const devices = json.clients;

    const deviceIds = devices.map((device) => device.id);

    updateDeviceListUi(deviceIds);
  } catch (e) {
    alert(e);
  }
};

const refreshLoop = async () => {
  setInterval(async () => {
    // Reassign invalid IDs
    if ((await api.sendPing(myDeviceId)) !== "ALIVE") {
      await assignId();
    }
    updateDeviceList();
  }, 1000);
};

document.addEventListener("DOMContentLoaded", async () => {
  await assignId();
  initDeviceList();
  updateDeviceList();
  refreshLoop();
});
