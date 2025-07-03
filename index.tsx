const logoutButton = document.querySelector<HTMLButtonElement>("#logoutButton");
if (!logoutButton) {
  throw new Error("Logout button not found");
}

// Note that we can't use `<form>` for this as it doesn't support `DELETE`
// Note that we can't use `/logout` with a `a` because it would change from `/`
// Note that `/logout` with `Location: /` with session clear won't work because
// the `Authorization` header will recreate the session cookie upon the `/` hit
logoutButton.addEventListener("click", async () => {
  await fetch("/", { method: "DELETE" });

  // Reload to force the page to see the missing cookie and trigger Basic Auth
  location.reload();
});
