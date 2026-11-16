import {
  init as initDeviceList,
  updateList as updateDeviceListUi,
} from "./devices.js";
import { api } from "./api.js";

let myDeviceId = null;
const assignId = async () => {
  myDeviceId = await api.registerUser();
  const myDeviceIdElement = document.getElementById("user-id");
  myDeviceIdElement.textContent = myDeviceId;
};

let userIds = [];
const refreshLoop = async () => {
  setInterval(async () => {
    // Reassign invalid IDs
    if ((await api.sendPing(myDeviceId)) !== "ALIVE") {
      await assignId();
    }
    userIds = await api.getUserIds();
    updateDeviceListUi(userIds);
  }, 1000);
};

document.addEventListener("DOMContentLoaded", async () => {
  await assignId();
  initDeviceList();
  refreshLoop();

  const searchForm = document.getElementById("search");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Stop page from reloading
    const searchQuery = searchForm.elements.id.value.trim();
    api.trySendFile(myDeviceId, searchQuery);
  });
});
