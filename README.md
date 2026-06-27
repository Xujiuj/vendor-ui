# Vendor UI

厂商端云端前端，基于 Vue 3、TypeScript、Vite 和 Element Plus，面向厂商运营人员提供客户、授权、因子、模板、续费和系统基础管理能力。

## Delivery Boundary

- 运行形态：独立 Vite/Vue 前端，开发代理指向厂商端后端。
- 接口边界：页面必须接真实厂商端接口，不在前端写业务兜底数据。
- 保留页面：客户档案、License 授权、因子版本、因子开放范围、维表管理、模板库、模板分发、公告、续费订单、用户、角色、部门、岗位、套餐、操作日志、登录日志。
- 已剔除页面：RuoYi 代码生成、在线用户、缓存监控、任务调度、工作流流程组件、WebSocket 通知入口、原始演示页面。

## Commands

```bash
rtk npm run lint:eslint -- src/portal/vendorPortalContract.ts src/portal/vendorPortalContract.test.ts
rtk npm run test:unit -- src/portal/vendorPortalContract.test.ts
rtk npm run build:prod
```
