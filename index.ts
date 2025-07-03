import { serve, CookieMap } from "bun";
import index from "./index.html";
import cookieName from "./cookieName.ts";
import parseBasicCredential from "./parseBasicCredential.ts";
import makeLogoutResponse from "./makeLogoutResponse.ts";

// Use hard-coded credentials for the demonstration purposes
import USER_NAME from "./userName.ts";
import PASSWORD from "./password.ts";
import validateCredential from "./validateCredential.ts";

// Generate a random nonce to make the `HTMLBundle` direct endpoint protected
const nonce = crypto.randomUUID();

const server = serve({
  routes: {
    // Hide the web app via the nonce to prevent direct access to `HTMLBundle`
    // Note that this is here as Bun won't take `HTMLBundle` in a route function
    [`/${nonce}`]: index,

    // Serve the PWA manifest as a `BunFile`-based response
    "/manifest.json": () => new Response(Bun.file("./manifest.json")),

    // Handle both cookie-based and HTTP Basic Auth-based authentication on root
    "/": async (request) => {
      // Handle logout on the same route with no changes to the URL structure
      if (request.cookies.get(cookieName + "-logout") !== null) {
        return makeLogoutResponse();
      }

      // Validate the cookie for an existing session if present (logged in)
      const cookie = request.cookies.get(cookieName);
      if (cookie) {
        // Serve the web app like a proxy if the cookie credential is correct
        const [userName, password] = parseBasicCredential(cookie);
        if (userName === USER_NAME && password === PASSWORD) {
          // Ensure the `Authorization` header matches the cookie if present
          const authorization = request.headers.get("Authorization");
          if (authorization) {
            const [userName, password] = parseBasicCredential(authorization);

            // Clear the cookie if the `Authorization` header is invalid and 401
            if (userName !== USER_NAME || password !== PASSWORD) {
              return makeLogoutResponse();
            }

            // Let the branch fall through to success if header matches cookie
          }

          // Get the normal Bun HMR response for the `HTMLBundle` endpoint
          // Note that this in this branch there is no need to reset the cookie
          return await fetch(`${server.url}/${nonce}`);
        }

        // Let the branch fall through to the 401 if the credential is invalid
      }

      // Validate the HTTP Basic Auth challenge retort if present (logging in)
      const authorization = request.headers.get("Authorization");
      if (authorization) {
        // Serve the web app like a proxy if the cookie credential is correct
        const [userName, password] = parseBasicCredential(authorization);
        if (userName === USER_NAME && password === PASSWORD) {
          // Get the normal Bun HMR response for the `HTMLBundle` endpoint
          const response = await fetch(`${server.url}/${nonce}`);

          // Prepare the cookie jar to place the nascent session cookie into
          const cookieMap = new CookieMap();
          cookieMap.set(cookieName, authorization, {
            // Restrict the cookie to be sent only with request to this origin
            sameSite: "strict",

            // Prevent browser scripts from being able to see the cookie at all
            httpOnly: true,

            // Prevent the cookie from being sent over insecure connections
            // Note that this is conditional to make local development easy
            secure: server.url.protocol === "https:",
          });

          // Enrich the response with the `Authorization`-turned-cookie
          response.headers.set("Set-Cookie", cookieMap.toSetCookieHeaders()[0]);
          return response;
        }

        // Let the branch fall through to the 401 if the credential is invalid
      }

      // Return the HTTP Basic Auth challenge (logged out or invalid credential)
      // Clear cookie pre-emptively in case it was present but had invalid auth
      return makeLogoutResponse();
    },

    // Protect non-root endpoints with only the cookie-based authentication
    "/user": (request) => {
      const cookie = request.cookies.get(cookieName);
      const credential = validateCredential(cookie);
      if (credential instanceof Response) {
        return credential;
      }

      return new Response(
        JSON.stringify({ user: credential, cookie }, null, 2)
      );
    },
  },
});

console.log(server.url.href);
