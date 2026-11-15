import {
  init as initDeviceList,
  updateList as updateDeviceListUi,
} from "./devices.js";
import { api } from "./api.js";

let myDeviceId = null;

async function updateDeviceList() {
  const response = await fetch("/all-clients");
  const json = await response.json();
  const devices = json.clients;

  const deviceIds = devices.map((device) => device.id);

  updateDeviceListUi(deviceIds);
}

document.addEventListener("DOMContentLoaded", async () => {
  const myDeviceIdLabel = document.getElementById("user-id");
  const myDevice = await api.registerUser();
  myDeviceIdLabel.textContent = myDevice.id;

  initDeviceList();

  updateDeviceList();
  setInterval(async () => {
    api.sendPing(myDevice.id);
    updateDeviceList();
  }, 1000);
});
