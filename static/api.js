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
};
