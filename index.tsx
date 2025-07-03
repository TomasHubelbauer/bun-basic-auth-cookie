import cookieName from "./cookieName.ts";

const logoutA = document.querySelector<HTMLAnchorElement>("#logoutA");
if (!logoutA) {
  throw new Error("Logout link not found");
}

logoutA.addEventListener("click", () => {
  const expires = new Date(Date.now() + 1000).toUTCString();
  document.cookie = `${cookieName}-logout=; Expires=${expires}; Path=/; SameSite=Strict;`;
});
