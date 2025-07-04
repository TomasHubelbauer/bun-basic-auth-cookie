# Bun Basic Auth Cookie

HTTP Basic Auth is trivial to support in Bun and it is secure when performed via
a secure connection.

However, on iOS, when pinning a PWA to the home screen and using Basic Auth to
log into it, the authorization state won't be remembered between app restarts.

This is less of a problem on desktop browsers where the tab can be left opened
or even pinned so that the session state remains persisted.

I like HTTP Basic Auth and would like to keep using it over coding up a custom
login form, but the non-persistence on mobile is a deal-breaker for me, so I am
hoping to come up with a hybrid solution that presents the HTTP Basic Auth modal
prompt by the browser to the user, but instead of relying on the user agent to
remember the credential and keep sending it in the `Authorization` header like
HTTP Basic Auth works typically, I am thinking of handling the HTTP Basic Auth
challenge submission and copying over the `Authorization` header value into a
cookie that should then get re-sent for every subsequent request and could even
be cleared remotely much easier than the persistent HTTP Basic Auth session.

Hopefully web apps pinned to the home screen on iOS will persist cookies in this
scenario.

If not, I think the only recourse then is to stop using HTTP Basic Auth and rely
on form auto-fill so that whenever the pinned web app is open in its standalone
full-screen browser tab window, the form auto-fill would pre-fill the credential
from the Safari Auto-Fill feature powered by the Passwords app and submit the
log in form automatically, achieving smooth session preservation in the eyes of
the user.

In this repository I've implemented several flows which are all captured in
`index.test.ts`.

Now it remains to be seen if this scheme works on iOS home screen pinned app.

I've added a PWA manifest to the web app.
I've added a Dockerfile and deployed the web app to Sliplane at:
https://bun-basic-auth-cookie.sliplane.app.

- [ ] Test whether the PWA manifest took effect and the experiment works
- [ ] Add end to end UI tests with Playwright to verify the Basic Auth dialog
