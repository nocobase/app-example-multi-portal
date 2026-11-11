# ServiceHub demo

A five-minute demonstration of customer, dispatch and engineer portals sharing one service request. Use the existing NocoBase multi-portal runtime, authentication and authorization. Keep the PM-1359 review deployment separate.

## Accepted scope

- Customer: devices, report a fault, track progress, confirm and rate.
- Dispatch: compact request table, assignment, internal notes and progress.
- Engineer: mobile task list, accept, record work and finish.
- Optional insights portal: install/uninstall through native portal management, preserve records.
- Explicit demo users, three customers, six devices, twelve requests.
- Own-customer and assigned-engineer record restrictions enforced by APIs.
- Portal management remains a responsive table; row menus contain text only.
- Restore synthetic business data only in the dedicated demo environment.

## Verification

Run the report → assign → accept → complete → confirm journey. Check unauthenticated, forbidden and cross-customer requests, disabled portal access, persistence and duplicate submissions. Verify frontend types and business tests.
