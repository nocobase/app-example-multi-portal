# Service insights

See how your service team is performing.

Application-local portal package: `@nocobase/app-portal-insights`.

Install this portal through **System settings → Portal management** after initializing the host application. See the [ServiceHub guide](../../README.MD) for accounts and the demo walkthrough.

## Layout and pages

An analytics sidebar with live ticket status and location summaries. Leave uninstalled initially to demonstrate portal installation. The package owns `client/layout.tsx`; the host supplies authorized navigation, the portal switcher, and account controls.
