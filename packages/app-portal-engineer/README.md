# Engineer workspace

Your tasks. Your next move.

Application-local portal package: `@nocobase/app-portal-engineer`.

Install this portal through **System settings → Portal management** after initializing the host application. See the [ServiceHub guide](../../README.MD) for accounts and the demo walkthrough.

## Layout and pages

A focused task layout with fixed bottom navigation for active tasks and completed work. Only the current user’s assignments are shown. The package owns `client/layout.tsx`; the host supplies authorized navigation, the portal switcher, and account controls.
