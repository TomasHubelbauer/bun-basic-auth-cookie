import makeLogoutResponse from "./makeLogoutResponse.ts";
import parseBasicCredential from "./parseBasicCredential.ts";

// Use hard-coded credentials for the demonstration purposes
import USER_NAME from "./userName.ts";
import PASSWORD from "./password.ts";

export default function validateCredential(cookie: string | null) {
  if (!cookie) {
    return makeLogoutResponse();
  }

  const [userName, password] = parseBasicCredential(cookie);
  if (userName !== USER_NAME || password !== PASSWORD) {
    return makeLogoutResponse();
  }

  return userName;
}
