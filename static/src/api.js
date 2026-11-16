import { openPopup } from "./popup.js";

const req = async (endpoint, options = {}) => {
  const res = await fetch(endpoint, options);
  if (!res.ok) {
    throw new Error(`Req to ${endpoint} failed, ${res.status}`);
  }
  return res.json();
};

export const api = {
  registerUser: async () => req("/register"),

  getUserIds: async () => {
    const res = await req("/all-clients");
    return res.clients.map((client) => client.id);
  },

  sendPing: async (clientId) => {
    const param = new URLSearchParams({ clientId });
    const res = await req(`/ping?${param}`);

    return res.status;
  },

  trySendFile: async (senderId, receiverId) => {
    const params = new URLSearchParams({ senderId, receiverId });

    const filePicker = document.createElement("input");
    filePicker.type = "file";

    filePicker.onchange = async () => {
      const file = filePicker.files[0]; // One file only
      if (!file) return; // File manager closed

      try {
        const res = await req(`/try-send?${params}`);
        openPopup(
          "File sent",
          `Waiting for ${receiverId} to accept ${file.name}`,
        );
      } catch {
        openPopup("File send failed", `Could not reach ${receiverId}`);
      } finally {
        filePicker.remove();
      }
    };

    filePicker.click(); // Open file picker
  },
};
