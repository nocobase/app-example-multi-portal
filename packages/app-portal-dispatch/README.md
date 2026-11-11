# Dispatch console

Keep every service request moving.

Application-local portal package: `@nocobase/app-portal-dispatch`.

Install this portal through **System settings → Portal management** after initializing the host application. See the [ServiceHub guide](../../README.MD) for accounts and the demo walkthrough.

## Layout and pages

A dark sidebar with Ticket queue, Field team, and Service overview. Team and overview pages summarize real assignments and tickets. The package owns `client/layout.tsx`; the host supplies authorized navigation, the portal switcher, and account controls.
