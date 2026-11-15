const req = async (endpoint, options = {}) => {
  const res = await fetch(endpoint, options);
  if (!res.ok) {
    throw new Error(`Req to ${endpoint} failed, ${res.status}`);
  }
  return res.json();
};

const postReq = (endpoint, body) => {
  return req(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
};

export const api = {
  registerUser: async () => req("/register"),

  getUsers: async (id, loc) => {
    const res = postReq("/ping", { id, loc });

    if (res.status !== "alive") {
      throw new Error("Failed to verify user as alive");
    }
    return res.clientList;
  },
};
