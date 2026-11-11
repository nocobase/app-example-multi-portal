# Customer portal

Keep your equipment running.

Application-local portal package: `@nocobase/app-portal-customer`.

Install this portal through **System settings → Portal management** after initializing the host application. See the [ServiceHub guide](../../README.MD) for accounts and the demo walkthrough.

## Layout and pages

Top navigation with Overview, My devices, and My requests. Devices provide a direct fault-report action. The package owns `client/layout.tsx`; the host supplies authorized navigation, the portal switcher, and account controls.
