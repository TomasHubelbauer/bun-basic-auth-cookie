import { BunRequest } from "bun";
import cookieName from "./cookieName.ts";
import parseBasicCredential from "./parseBasicCredential.ts";

// Use hard-coded credentials for the demonstration purposes
import USER_NAME from "./userName.ts";
import PASSWORD from "./password.ts";

export default function validateCredential(request: BunRequest) {
  const cookie = request.cookies.get(cookieName);
  if (!cookie) {
    request.cookies.delete(cookieName);
    return new Response(null, {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  const [userName, password] = parseBasicCredential(cookie);
  if (userName !== USER_NAME || password !== PASSWORD) {
    request.cookies.delete(cookieName);
    return new Response(null, {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  return userName;
}
