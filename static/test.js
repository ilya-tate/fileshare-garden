// CLIENT LIST STUFF

let clients = [];

const addClientBtn = document.getElementById("add-client");
const pingClientsBtn = document.getElementById("ping-clients");
const autoPingBtn = document.getElementById("auto-ping");
const clientListDiv = document.getElementById("client-list");

async function pingClient(id) {
  const resp = await fetch(`/ping?clientId=${id}`);
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

async function pingAllClients() {
  for (const client of clients) {
    const pingResp = await pingClient(client.id);
    console.log(pingResp);
  }
}

addClientBtn.addEventListener("click", () => {
  fetch("/register");
});

pingClientsBtn.addEventListener("click", async () => {
  pingAllClients();
});

let intervalId = null;
autoPingBtn.addEventListener("click", async () => {
  if (autoPingBtn.getAttribute("aria-pressed") === "true") {
    autoPingBtn.setAttribute("aria-pressed", false);
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  } else {
    autoPingBtn.setAttribute("aria-pressed", true);
    intervalId = setInterval(async () => {
      pingAllClients();
    }, 1000);
  }
});

setInterval(updateClientListInternal, 1000);
setInterval(updateClientListUi, 1000);

// SENDING STUFF

const senderIdInput = document.getElementById("sender-id");
const receiverIdInput = document.getElementById("receiver-id");
const sendFileBtn = document.getElementById("send-file-button");

sendFileBtn.addEventListener("click", async () => {
  const senderId = senderIdInput.value;
  const receiverId = receiverIdInput.value;

  fetch(`/try-send?senderId=${senderId}&receiverId=${receiverId}`);

  senderIdInput.value = "";
  receiverIdInput.value = "";
});
