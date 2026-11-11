# 服务洞察

Business portal / 业务门户: `@nocobase/app-portal-insights`.

Owns its Layout, routes, locales and registration. It uses the existing plugin runtime.
门户拥有独立 Layout、路由、语言资源和注册逻辑，复用现有插件机制。

Enable it in Portal management after database initialization; generated portals start disabled.
初始化数据库后在门户管理启用；生成的门户默认停用。

Template: minimal. No business table or CRUD is assumed. Add domain-specific APIs and enforce authorization on every endpoint.

Run checks from the App root: `pnpm --filter @nocobase/app-portal-insights check`.
