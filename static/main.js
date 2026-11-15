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

async function updateDeviceList() {
  const response = await fetch("/all-clients");
  const json = await response.json();
  const devices = json.clients;

  const deviceIds = devices.map((device) => device.id);

  updateDeviceListUi(deviceIds);
}

document.addEventListener("DOMContentLoaded", async () => {
  await assignId();
  initDeviceList();
  updateDeviceList();

  setInterval(async () => {
    // Reassign invalid IDs
    if ((await api.sendPing(myDeviceId)) !== "ALIVE") {
      await assignId();
    }
    updateDeviceList();
  }, 1000);
});
