let clients = [];

const addClientBtn = document.getElementById("add-client");
const pingClientsBtn = document.getElementById("ping-clients");
const clientListDiv = document.getElementById("client-list");

async function pingClient(id) {
  const resp = await fetch(`/ping?id=${id}`);
  const json = await resp.json();
  return json;
}

async function updateClientListInternal() {
  const resp = await fetch("/all-clients");
  const json = await resp.json();
  clients = json.clients;
}

async function updateClientListUi() {
  clientListDiv.replaceChildren();

  for (const client of clients) {
    const clientDiv = document.createElement("div");
    const clientId = document.createElement("p");

    clientId.textContent = client.id;

    clientDiv.appendChild(clientId);
    clientListDiv.appendChild(clientDiv);
  }
}

addClientBtn.addEventListener("click", () => {
  fetch("/register");
});

pingClientsBtn.addEventListener("click", async () => {
  for (const client of clients) {
    const pingResp = await pingClient(client.id);
    console.log(pingResp);
  }
});

setInterval(updateClientListInternal, 100);
setInterval(updateClientListUi, 100);
