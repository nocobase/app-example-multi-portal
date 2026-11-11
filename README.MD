# ServiceHub

English | [简体中文](README.zh-CN.md)

A multi-portal equipment service demo built with NocoBase 3. Customers, dispatchers, and engineers collaborate on the same service ticket through portals tailored to their responsibilities.

## Installation

### 1. Prerequisites

- Node.js **24 or later**.
- pnpm **11.7.0**.
- Git and access to the `nocobase/ServiceHub` repository.
- Read access to the NocoBase private package registry. This application uses the commercial multi-portal plugin.

The default database is SQLite; no separate database service is required.

```bash
node --version
npm install -g pnpm@11.7.0
pnpm --version
```

### 2. Clone the repository

```bash
git clone https://github.com/nocobase/ServiceHub.git
cd ServiceHub
```

Install this repository directly. You do not need to generate another application with `create-app`.

### 3. Configure the registry and install dependencies

Sign in to the NocoBase private registry with an account that has read access:

```bash
pnpm login --registry=https://pkg-v3.nocobase.com/ --scope=@nocobase
```

Enter your account details when prompted, using the registry's read token (`nbr_…`) as the password. This configures the `@nocobase` scope in your user-level configuration; other dependencies continue to use the default npm registry. Do not commit the token.

```bash
pnpm config get @nocobase:registry
# Expected: https://pkg-v3.nocobase.com/

pnpm install
```

The private registry serves both commercial and open-source `@nocobase` packages. If an error references `registry.npmjs.org/@nocobase/app-plugin-multi-portal`, check the scoped registry configuration first.

## Initialize the demo

Complete these steps before starting a new installation for the first time.

### 1. Generate the configuration

```bash
pnpm nocobase config init --dialect sqlite
```

This creates a local `config.yml` and initializes its encryption keys. Do not use the placeholder key from [config.example.yml](config.example.yml).

There are three separate types of credentials:

| Credential                               | Purpose                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------- |
| Registry read token                      | Download NocoBase dependencies                                                  |
| `secrets.keys` in `config.yml`           | Encrypt stored sensitive information and derive authentication and session keys |
| Administrator and demo account passwords | Sign in to ServiceHub                                                           |

`config.yml` is ignored by Git. Preserve the original keys when migrating an existing database; generate new keys for a separate demo installation.

### 2. Enable sample data

```bash
pnpm nocobase config set app.sampleData=true
pnpm nocobase config set client.app.title=ServiceHub i18n.defaultLocale=zh-CN client.app.defaultTheme=compact
pnpm nocobase config check
```

The demo's business pages and sample records currently use Chinese. The command above selects the Chinese interface to match the screenshots; the instructions below include the relevant Chinese button labels.

On first startup, migrations and seeds automatically create the demo roles, 6 business accounts, 6 devices, and 12 tickets. The sample data covers 3 coffee shops and several stages of the service process.

The initial administrator is configured under `users.initialAdmin` in `config.yml`:

- Username: `nocobase`
- Email: `admin@nocobase.com` (also accepted at sign-in)
- Initial password: `admin123`

Change this configuration before the first startup if you want different initial credentials. Once an account exists, editing these values does not reset it or its password. Demo passwords are public test credentials; use them only in an isolated demo environment.

## Start the application

```bash
pnpm dev
```

Open the application URL printed in the terminal's ready message, including its full path (`/main/` by default). Do not use Vite's internal port as the application entry point.

For access from a phone or another device on your LAN, run this on macOS or Linux:

```bash
APP_SERVER_HOST=0.0.0.0 pnpm dev
```

Use the machine's actual LAN IP and the application port from the ready message. For a temporary public tunnel, forward the application entry port, preserve the application path, and add the public origin to `auth.trustedOrigins`. Configure `APP_ALLOWED_HOSTS` as needed in development. A temporary public URL expires when its tunnel stops.

## Prepare the portals

Sign in as the administrator, open **System settings → Portal management**, and install the first three business portals. Their code is included in the repository; installation enables each portal.

| Portal                             | Demo role                              | Main features                                            | State to prepare  |
| ---------------------------------- | -------------------------------------- | -------------------------------------------------------- | ----------------- |
| Customer service desk (客户服务台) | Customer                               | Devices, repair requests, progress, service confirmation | Installed         |
| Dispatch operations (运营调度台)   | Dispatcher                             | Ticket overview, engineer assignment, service tracking   | Installed         |
| Engineer workspace (工程师工作台)  | Engineer                               | Assigned tasks, acceptance, resolution reporting         | Installed         |
| Service insights                   | Administrator demonstrating extensions | Service analysis entry                                   | Leave uninstalled |

Return to the home workbench to enter installed portals that your account can access. Installation and business permissions are separate requirements; installing a portal does not automatically grant access to every user.

## Demo accounts

All business accounts below use **`ServiceHub2026!`** as their password. Sign in with either the username or email.

| Role                                 | Name                  | Username     | Email                           |
| ------------------------------------ | --------------------- | ------------ | ------------------------------- |
| Customer · Xinghe Coffee (星河咖啡)  | Chen Xiaoman (陈小满) | `customer1`  | `customer-1@servicehub.example` |
| Customer · Shanye Coffee (山野咖啡)  | Zhou Qing (周晴)      | `customer2`  | `customer-2@servicehub.example` |
| Customer · Baizhou Coffee (白昼咖啡) | Xu Le (许乐)          | `customer3`  | `customer-3@servicehub.example` |
| Dispatcher                           | Shen Yue (沈悦)       | `dispatcher` | `dispatcher@servicehub.example` |
| Engineer                             | Lin Chen (林晨)       | `engineer1`  | `engineer-1@servicehub.example` |
| Engineer                             | Gu Chuan (顾川)       | `engineer2`  | `engineer-2@servicehub.example` |

Customers access their own devices and tickets; engineers handle their assigned tasks; the dispatcher assigns tickets across customers. Use separate browser profiles for the three roles to switch between them easily. Regular tabs in the same browser share a login session.

## Five-minute walkthrough

1. **Report a fault:** sign in as `customer1`, select the Linea coffee machine, and submit a request titled “咖啡机无法加热” (coffee machine not heating).
2. **Assign an engineer:** sign in as `dispatcher`, find the new ticket, and assign it to Lin Chen (林晨).
3. **Complete the work:** sign in as `engineer1`, accept the task, record the resolution, and complete the service.
4. **Confirm the service:** return to `customer1`, review the resolution, confirm completion, and rate the service.
5. **Show portal extensions:** as the administrator, install Service insights and return to the workbench to see its entry. Uninstall it to hide the entry again.

Highlight each role's view of the same process, its data scope, its available actions, and the ability to enable portals independently. Ticket operations also work on mobile. Customer and dispatcher portals use responsive tables with row actions in a more menu; the engineer portal uses task cards.

## Usage guide and screenshots

These screenshots show the running demo with fictional accounts and sample records. They show different preloaded tickets, rather than consecutive states of one newly created ticket. Counts change as you use the application.

### Customers: report a fault and track progress

Sign in as `customer1` and enter **Customer service desk (客户服务台)**. The top section shows device and service statistics, followed by the customer's devices and service tickets.

![Customer service desk with device overview, repair request entry, and service tickets](docs/images/customer-portal.png)

1. Click **Report a fault (发起报修)** in the upper-right corner and select the device.
2. Enter a title, description, and urgency. For example: “Coffee machine not heating”; “The water temperature has stayed low since opening this morning, even after restarting.”
3. Click **Submit request (提交报修)**. The ticket appears as **Awaiting assignment (待分配)**. Note its ID for the following steps.
4. Click the ticket title or **View details (查看详情)** in the row's more menu to see the device, engineer, description, and progress.

Search by ticket ID, issue, or shop, or filter by status. Customers see only their own data; switch to `customer2` to demonstrate customer data isolation.

### Dispatchers: assign an engineer

Sign in as `dispatcher` and enter **Dispatch operations (运营调度台)**. This portal brings together tickets from different customers for service coordination.

![Dispatch operations with tickets across customers and status filters](docs/images/dispatch-portal.png)

1. Search for the ticket ID, or select **Awaiting assignment (待分配)**.
2. Open its details, or choose **Assign engineer (分配工程师)** from the row's more menu.
3. Select **Lin Chen (林晨)** in the engineer field and submit the assignment.
4. The ticket becomes **Awaiting acceptance (待接单)** and displays Lin Chen as its engineer.

Continue with `engineer1`. If you assign the ticket to Gu Chuan (顾川), use `engineer2` instead.

### Engineers: accept a task and report the resolution

Sign in as `engineer1` and enter **Engineer workspace (工程师工作台)**. Task cards show the assigned ticket, customer, address, device, and status. The same operations are available on mobile.

<img src="docs/images/engineer-mobile.png" alt="Engineer mobile workspace with statistics, status filters, and task cards" width="390" />

1. Find the newly assigned task under **All (全部)** and click **View task (查看任务)**.
2. Click **Accept and start work (接单并开始处理)** in its details. The status becomes **In progress (处理中)**.
3. After completing the work, reopen the task and enter the **Resolution (处理结果)**. For example: “Descaled the heating element, replaced the temperature sensor, and confirmed normal water temperature during a test run.”
4. Click **Submit resolution (提交处理结果)**. The status becomes **Awaiting confirmation (待确认)**.

Actions appear only for tasks assigned to the current engineer and in the appropriate state. If a task is missing, switch back to All and check which engineer the dispatcher selected.

### Customers: confirm and rate the service

Return to `customer1`'s customer portal. Refresh the page if needed to load the latest status.

1. Select **Awaiting confirmation (待确认)** and find the ticket.
2. Open its details and read the engineer's resolution.
3. Select a rating and submit the confirmation. You can also enter through **Confirm and rate (确认并评价)** in the row's menu.
4. The ticket becomes **Completed (已完成)**, retaining its resolution and rating.

The full sequence is **Awaiting assignment → Awaiting acceptance → In progress → Awaiting confirmation → Completed**. Available actions depend on the role and current state; preceding steps cannot be skipped.

### Administrators: manage portals and repeat the demo

Open **System settings → Portal management** and use each row's more menu to install, open, or uninstall a portal. Install Service insights to show its new workbench entry, then uninstall it to hide the entry.

Before another walkthrough, use **Restore demo data (恢复演示数据)** on the workbench. This removes tickets created during the walkthrough and recreates the sample business data. Accounts, roles, and portal installation states remain unchanged; see the next section for details.

## Restore demo data

As the administrator, click **Restore demo data (恢复演示数据)** on the home workbench and confirm. This replaces the demo devices, tickets, and processing records with the initial dataset of 12 tickets.

- Accounts, roles, and portal installation states are preserved.
- Restoration requires `app.sampleData` to be enabled.
- This operation does not recreate missing demo accounts or roles.

If sample data was disabled during the first initialization, stop the development server and run:

```bash
pnpm nocobase config set app.sampleData=true
pnpm nocobase db sample
pnpm dev
```

`db sample` runs previously skipped sample initialization in development; production deployments reject it. Do not clear the entire database just to reset a walkthrough.

## Troubleshooting

### Dependency installation returns 401, 403, or 404

Check that the `@nocobase` scope points to `https://pkg-v3.nocobase.com/` and that your read token is valid and authorized for the packages. A commercial package returning 404 on npmjs does not mean it is unpublished in the private registry.

### Configuration keys are missing

For a new installation, run `pnpm nocobase config init --dialect sqlite`, then `pnpm nocobase config check`. For an existing database, restore the original `config.yml` or key configuration rather than replacing its keys arbitrarily.

### Sign-in works, but business portals are missing

Ask the administrator to confirm that the portal is installed and the user has the appropriate role. Newly registered accounts do not automatically receive demo roles. Use a demo account or explicitly assign a role through user and permission management.

### Demo accounts are missing or their passwords do not work

Check that `app.sampleData` was enabled before initialization. If sample initialization was skipped, follow the `db sample` steps above. The administrator uses a different password from the business demo accounts; existing installations retain their actual account settings.

### The default language or theme does not change

Saved browser preferences take precedence over configuration defaults. Change the language or theme through the interface, or use a new browser profile to see the defaults.

## Development and deployment

Business pages live in [client/pages/servicehub](client/pages/servicehub), API routes in [server/routes/servicehub.ts](server/routes/servicehub.ts), and seed data in [database/main/seeds](database/main/seeds). The four portal packages are under [packages](packages).

| Command          | Purpose                                            |
| ---------------- | -------------------------------------------------- |
| `pnpm dev`       | Start the development server                       |
| `pnpm typecheck` | Check client, server, and tooling types            |
| `pnpm test`      | Run automated tests                                |
| `pnpm build`     | Build the application and its runtime dependencies |
| `pnpm start`     | Start the built application                        |

Production deployment requires separate configuration, persistent storage, and registry credentials. See [build and deployment notes](.agents/rules/build-and-deploy.md). [scripts/start-demo.sh](scripts/start-demo.sh) is a maintenance script for the existing Linux demo host; it depends on that host's service configuration and a built frontend. For a new installation, use the `pnpm dev` instructions above.

Role collaboration, permission checks, and frontend compilation have been verified. Independent dependency resolution with the private registry has also passed. A complete clean installation and a portable production bundle have not yet been verified end to end. The repository does not currently include a dependency lockfile, so installation at different times may resolve different compatible versions.
