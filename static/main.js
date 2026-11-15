import {
    init as initDeviceList,
    updateList as updateDeviceListUi
} from "./devices.js";

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

    myDeviceId = await async function() {
        const resp = await fetch("/register");
        const json = await resp.json();
        return json.id;
    }();
    myDeviceIdLabel.textContent = myDeviceId;

    initDeviceList();

    updateDeviceList();
    setInterval(async () => {
        updateDeviceList();       
    }, 1000);
});
