import { CookieMap } from "bun";
import cookieName from "./cookieName.ts";

export default function makeLogoutResponse() {
  const response = new Response(null, {
    status: 401,
    headers: { "WWW-Authenticate": "Basic" },
  });

  const cookieMap = new CookieMap();
  cookieMap.delete(cookieName);
  response.headers.set("Set-Cookie", cookieMap.toSetCookieHeaders()[0]);

  return response;
}
