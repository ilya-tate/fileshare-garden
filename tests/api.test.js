import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { api } from "../static/src/api.js";

// Fake fetch: records each request and replies with whatever the test sets up
let requests;
const realFetch = globalThis.fetch;

const fakeFetch = (reply) => {
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    return reply();
  };
};

const respondWith = (json, status = 200) =>
  fakeFetch(() => new Response(JSON.stringify(json), { status }));

const respondWithText = (text, status = 200) =>
  fakeFetch(() => new Response(text, { status }));

const failNetwork = () =>
  fakeFetch(() => {
    throw new TypeError("fetch failed");
  });

beforeEach(() => {
  requests = [];
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("api object", () => {
  it("has registerUser and getUsers functions", () => {
    assert.equal(typeof api.registerUser, "function");
    assert.equal(typeof api.getUsers, "function");
  });
});

describe("registerUser", () => {
  it("sends one request to /register", async () => {
    respondWith({ id: "abc123" });

    await api.registerUser();

    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "/register");
  });

  it("uses GET", async () => {
    respondWith({ id: "abc123" });

    await api.registerUser();

    assert.equal(requests[0].options.method ?? "GET", "GET");
  });

  it("sends no body", async () => {
    respondWith({ id: "abc123" });

    await api.registerUser();

    assert.equal(requests[0].options.body, undefined);
  });

  it("resolves to the server's JSON", async () => {
    respondWith({ id: "abc123" });

    assert.deepEqual(await api.registerUser(), { id: "abc123" });
  });

  it("treats any 2xx status as success, like 201 Created", async () => {
    respondWith({ id: "abc123" }, 201);

    assert.deepEqual(await api.registerUser(), { id: "abc123" });
  });

  it("makes a new request on every call", async () => {
    respondWith({ id: "abc123" });

    await api.registerUser();
    await api.registerUser();

    assert.equal(requests.length, 2);
  });
});

describe("request errors", () => {
  for (const status of [400, 404, 422, 500, 503]) {
    it(`rejects on ${status}, naming the endpoint and status`, async () => {
      respondWith({ detail: "nope" }, status);

      await assert.rejects(
        api.registerUser(),
        new RegExp(`/register.*${status}`),
      );
    });
  }

  it("rejects with fetch's own error when the network fails", async () => {
    failNetwork();

    await assert.rejects(api.registerUser(), {
      name: "TypeError",
      message: "fetch failed",
    });
  });

  it("rejects when the response isn't valid JSON", async () => {
    respondWithText("<h1>Server error</h1>");

    await assert.rejects(api.registerUser(), SyntaxError);
  });

  it("rejects on an empty 204 response, since there's no JSON to read", async () => {
    fakeFetch(() => new Response(null, { status: 204 }));

    await assert.rejects(api.registerUser(), SyntaxError);
  });

  it("reports errors through the returned promise, not by throwing straight away", async () => {
    failNetwork();

    let promise;
    assert.doesNotThrow(() => {
      promise = api.registerUser();
    });
    await assert.rejects(promise);
  });
});

describe("getUsers", () => {
  const loc = { lat: 51.5, lon: -0.1 };

  // For tests that only check the request: ignore how the response is handled
  const sendPing = () => api.getUsers("abc123", loc).catch(() => {});

  it("sends one request to /ping", async () => {
    respondWith({ status: "alive", clientList: [] });

    await sendPing();

    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "/ping");
  });

  it("uses POST", async () => {
    respondWith({ status: "alive", clientList: [] });

    await sendPing();

    assert.equal(requests[0].options.method, "POST");
  });

  it("sends a JSON Content-Type header", async () => {
    respondWith({ status: "alive", clientList: [] });

    await sendPing();

    assert.equal(
      requests[0].options.headers["Content-Type"],
      "application/json",
    );
  });

  it("sends exactly { id, loc } as the body, not wrapped in another object", async () => {
    respondWith({ status: "alive", clientList: [] });

    await sendPing();

    assert.deepEqual(JSON.parse(requests[0].options.body), {
      id: "abc123",
      loc,
    });
  });

  it("resolves to the client list when the server says alive", async () => {
    respondWith({
      status: "alive",
      clientList: ["why-not-you", "get-my-free"],
    });

    assert.deepEqual(await api.getUsers("abc123", loc), [
      "why-not-you",
      "get-my-free",
    ]);
  });

  it("resolves to an empty list when no one else is online", async () => {
    respondWith({ status: "alive", clientList: [] });

    assert.deepEqual(await api.getUsers("abc123", loc), []);
  });

  it("rejects when the server's status isn't alive", async () => {
    respondWith({ status: "dead", clientList: [] });

    await assert.rejects(api.getUsers("abc123", loc), /alive/);
  });

  it("rejects when the response has no status at all", async () => {
    respondWith({ clientList: [] });

    await assert.rejects(api.getUsers("abc123", loc), /alive/);
  });

  it("rejects naming /ping and the status when the server errors", async () => {
    respondWith({ detail: "nope" }, 500);

    await assert.rejects(api.getUsers("abc123", loc), /\/ping.*500/);
  });

  it("rejects with fetch's own error when the network fails", async () => {
    failNetwork();

    await assert.rejects(api.getUsers("abc123", loc), {
      name: "TypeError",
      message: "fetch failed",
    });
  });

  it("reports errors through the returned promise, not by throwing straight away", async () => {
    respondWith({ status: "dead", clientList: [] });

    let promise;
    assert.doesNotThrow(() => {
      promise = api.getUsers("abc123", loc);
    });
    await assert.rejects(promise);
  });
});
