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

  sendPing: async (id) => {
    const param = new URLSearchParams({ id });
    const res = await req(`/ping?${param}`);
    if (res.status !== "ALIVE") {
      throw new Error(`Ping failed, ${res.status}`);
    }

    return res.status;
  },
};
