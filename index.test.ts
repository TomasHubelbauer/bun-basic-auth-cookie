import { test, expect } from "bun:test";
import { server } from "./index.ts";
import cookieName from "./cookieName.ts";
import queryString from "node:querystring";

// Use hard-coded credentials for the demonstration purposes
import USER_NAME from "./userName.ts";
import PASSWORD from "./password.ts";

const credential = btoa(`${USER_NAME}:${PASSWORD}`);
const clearCookie = `${cookieName}=; Path=/; Expires=Fri, 1 Jan 1970 00:00:00 -0000; SameSite=Lax`;
const setCookie = new RegExp(
  `${cookieName}=${queryString.escape(
    `Basic ${credential}`
  )}; Path=/; Expires=\\w{3}, \\d{1,2} \\w{3} \\d{4} \\d{1,2}:\\d{2}:\\d{2} -\\d{4}; HttpOnly; SameSite=Strict`
);

test("no auth, no cookie = 401, auth, clear cookie", async () => {
  const response = await fetch(server.url);
  expect(response.status).toBe(401);
  expect(response.headers.get("WWW-Authenticate")).toBe("Basic");
  expect(response.headers.get("Set-Cookie")).toBe(clearCookie);
});

test("no auth, bad cookie = 401, auth, clear cookie", async () => {
  const response = await fetch(server.url, {
    headers: { Cookie: `${cookieName}=Basic bad` },
  });

  expect(response.status).toBe(401);
  expect(response.headers.get("WWW-Authenticate")).toBe("Basic");
  expect(response.headers.get("Set-Cookie")).toBe(clearCookie);
});

test("no auth, good cookie = 200, no auth, no cookie", async () => {
  const response = await fetch(server.url, {
    headers: { Cookie: `${cookieName}=Basic ${credential}` },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("WWW-Authenticate")).toBeNull();
  expect(response.headers.get("Set-Cookie")).toBeNull();
});

test("bad auth, no cookie = 401, auth, clear cookie", async () => {
  const response = await fetch(server.url, {
    headers: { Authorization: `Basic bad` },
  });

  expect(response.status).toBe(401);
  expect(response.headers.get("WWW-Authenticate")).toBe("Basic");
  expect(response.headers.get("Set-Cookie")).toBe(clearCookie);
});

test("bad auth, bad cookie = 401, auth, clear cookie", async () => {
  const response = await fetch(server.url, {
    headers: {
      Authorization: `Basic bad`,
      Cookie: `${cookieName}=Basic bad`,
    },
  });

  expect(response.status).toBe(401);
  expect(response.headers.get("WWW-Authenticate")).toBe("Basic");
  expect(response.headers.get("Set-Cookie")).toBe(clearCookie);
});

test("bad auth, good cookie = 401, auth, clear cookie", async () => {
  const response = await fetch(server.url, {
    headers: {
      Authorization: `Basic bad`,
      Cookie: `${cookieName}=Basic ${credential}`,
    },
  });

  expect(response.status).toBe(401);
  expect(response.headers.get("WWW-Authenticate")).toBe("Basic");
  expect(response.headers.get("Set-Cookie")).toBe(clearCookie);
});

test("good auth, no cookie = 200, no auth, set cookie", async () => {
  const response = await fetch(server.url, {
    headers: { Authorization: `Basic ${credential}` },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("WWW-Authenticate")).toBeNull();
  expect(response.headers.get("Set-Cookie")).toMatch(setCookie);
});

test("good auth, bad cookie = 200, no auth, set cookie", async () => {
  const response = await fetch(server.url, {
    headers: {
      Authorization: `Basic ${credential}`,
      Cookie: `${cookieName}=Basic bad`,
    },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("WWW-Authenticate")).toBeNull();
  expect(response.headers.get("Set-Cookie")).toMatch(setCookie);
});

test("good auth, good cookie = 200, no auth, no cookie", async () => {
  const response = await fetch(server.url, {
    headers: {
      Authorization: `Basic ${credential}`,
      Cookie: `${cookieName}=Basic ${credential}`,
    },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("WWW-Authenticate")).toBeNull();
  expect(response.headers.get("Set-Cookie")).toBeNull();
});

test("protected: no cookie = 401, auth, clear cookie", async () => {
  const response = await fetch(`${server.url}/user`);
  expect(response.status).toBe(401);
  expect(response.headers.get("WWW-Authenticate")).toBe("Basic");
  expect(response.headers.get("Set-Cookie")).toBe(clearCookie);
});

test("protected: bad cookie = 401, auth, clear cookie", async () => {
  const response = await fetch(`${server.url}/user`, {
    headers: { Cookie: `${cookieName}=Basic bad` },
  });

  expect(response.status).toBe(401);
  expect(response.headers.get("WWW-Authenticate")).toBe("Basic");
  expect(response.headers.get("Set-Cookie")).toBe(clearCookie);
});

test("protected: good cookie = 200, no auth, no cookie", async () => {
  const response = await fetch(`${server.url}/user`, {
    headers: { Cookie: `${cookieName}=Basic ${credential}` },
  });

  expect(response.status).toBe(200);
  expect(response.headers.get("WWW-Authenticate")).toBeNull();
  expect(response.headers.get("Set-Cookie")).toBeNull();
});

test("logout", async () => {
  const response = await fetch(`${server.url}`, {
    headers: { Cookie: `${cookieName}-logout=` },
  });

  expect(response.status).toBe(401);
  expect(response.headers.get("WWW-Authenticate")).toBe("Basic");
  expect(response.headers.get("Set-Cookie")).toBe(clearCookie);
});
