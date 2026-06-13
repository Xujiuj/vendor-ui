# Spec: Vendor UI Missing Features

Updated: 2026-06-05

## Objective

Finish the vendor-side portal for central operations. The UI owns customer operations, License issue/renew/revoke/audit, factor catalog/version lifecycle, report template management/distribution, and renewal/payment operations. It must not expose enterprise-local business workflows, enterprise runtime License status, enterprise-applied factor results, or enterprise-local workflow data.

Current baseline:

- The project is a split `vendor-ui` repository.
- Frontend portal ownership has been frozen.
- Vendor backend License issue API exists and has been hardened.
- Vendor factor lifecycle backend is still missing.

## Tech Stack

- Vue 3.5.30
- Vite 7.3.2
- TypeScript 5.9.x
- Element Plus 2.13.5
- Pinia 3.0.4
- Vue Router 5.0.3
- ECharts 6.0.0

## Commands

Run from `vendor-ui`.

```powershell
rtk npm run dev
rtk npm run build:prod
rtk npm run build:dev
rtk npm run lint:eslint
rtk npm run preview
```

## Project Structure

```text
src/                  Vue application source
src/api/              API clients
src/views/            Route-level pages
src/components/       Shared UI components
src/router/           Route definitions and guards
src/store/            Pinia stores
public/               Static assets
docs/                 Vendor UI specs and task plans
```

## Missing Features

### VU-1: Vendor Portal Cleanup

Remove enterprise-local business surfaces from vendor-ui.

Vendor keeps:

- Home/workbench
- Customer management
- License issue/renew/revoke/audit
- Factor catalog/version lifecycle/release/freeze/open scope
- Report template management
- Template distribution
- Renewal/payment operations
- Portal-local system management and logs

Vendor removes:

- Enterprise License import page
- Enterprise current runtime License state page
- 01-05 enterprise local business data workflows
- Enterprise custom field metadata
- Enterprise data validation/submission/c催办
- Power BI enterprise connection page as an enterprise-local runtime surface

### VU-2: License Issue Drawer and `.lic` Download

Requirements:

- Connect to vendor backend `POST /vendor/license-issue/issue` or current equivalent.
- Resolve customer by vendor-side customer ID.
- Do not allow user-entered customer code/name to override vendor master data.
- Display disabled/inactive customer rejection.
- Display duplicate issue rejection.
- Display sanitized `license issue failed` for generic issue failure.
- Support downloading generated `.lic`.
- Do not display `privateKeyRef` or private key material.

### VU-3: Factor Lifecycle Pages

Requirements:

- Manage factor catalog and versions.
- Support release, freeze, and open-scope operations once backend API exists.
- Show vendor-side release/distribution metadata only.
- Do not show enterprise-applied effective factor results or enterprise runtime state.

### VU-4: Report Template Management and Distribution

Requirements:

- Upload/manage `.pbix` template metadata.
- Publish/disable template versions.
- Distribute templates to customers, editions, or License entitlements.
- Do not connect to enterprise SQL Server or vendor database for enterprise business data preview.

### VU-5: Renewal / Payment Operations

Requirements:

- Vendor owns renewal/payment pages and workflows.
- Manual renewal may drive License issue.
- Future payment callback status must be auditable.
- Enterprise portal may link out to vendor-owned renewal, but vendor UI remains the owner.

### VU-6: Vendor System Management Surface

Requirements:

- Keep the RuoYi-native system management directory visible in vendor-ui.
- The vendor portal must expose menu management, role management, package management, user management, department management, post management, dictionary management, parameter settings, and announcement settings when the backend returns those routes.
- These pages reuse the existing `src/views/system/*` pages and real `/system/*` backend APIs.
- Do not create duplicate vendor-specific system management pages unless RuoYi cannot cover the workflow.
- Continue filtering enterprise-local workflow menus and tenant/customer compatibility menus that are not vendor administration functions.

## Code Style

Use Vue SFC and existing project conventions:

```vue
<script setup lang="ts">
import { ref } from 'vue';

const issuing = ref(false);

async function issueLicense(customerId: string) {
  issuing.value = true;
  try {
    // API client sends customerId; backend resolves canonical customer data.
  } finally {
    issuing.value = false;
  }
}
</script>
```

Conventions:

- API clients live under `src/api`.
- Pages live under `src/views`.
- Do not duplicate enterprise-ui local workflow pages.
- Keep customer facts server-authored.

## Testing Strategy

- Build verification with `npm run build:prod`.
- ESLint verification with `npm run lint:eslint`.
- Component/unit tests may be added for download helpers and status mappers.
- Manual browser verification is required for menu cleanup, License issue, and factor lifecycle pages.

## Boundaries

- Always:
  - Keep vendor operations in vendor-ui.
  - Treat backend customer master data as authoritative.
  - Display sanitized signing errors.
  - Keep factor release/distribution metadata vendor-side.
- Ask first:
  - New dependencies.
  - Payment provider UI.
  - Route/menu architecture changes outside frozen contract.
- Never:
  - Show enterprise local 01-05 data workflows.
  - Show enterprise runtime License state.
  - Show enterprise-applied factor results.
  - Display private key material or `privateKeyRef`.

## Success Criteria

- Enterprise-local routes are removed from vendor menus.
- License issue drawer can create and download `.lic`.
- Factor lifecycle pages can drive backend release/freeze/scope APIs once available.
- Report template management/distribution is vendor-owned and does not preview enterprise data.
- Vendor system management includes menu, role, and package management through backend-returned routes.
- `npm run build:prod` passes.

## Open Questions

- What is the exact download API shape for generated `.lic`?
- Which factor lifecycle backend endpoints will be exposed first?
- Which payment provider statuses are required in the first renewal UI slice?
