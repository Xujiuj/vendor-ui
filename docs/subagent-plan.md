# Subagent Plan: Vendor UI

Updated: 2026-06-05

## Overview

This plan decomposes vendor-ui missing work into portal cleanup, License issue UX, factor lifecycle UX, report template operations, and renewal/payment operations. Tasks must stay within vendor-owned business surfaces.

## Architecture Decisions

- Vendor UI owns central operations, not enterprise-local workflows.
- License issue UI sends customer ID; backend resolves canonical customer facts.
- Factor pages show vendor release/distribution metadata only.
- Report template pages manage template assets, not enterprise report data.

## Phase 1: Portal Cleanup

### Task VU-1: Remove Enterprise-Owned Menu and Routes

**Description:** Clean vendor-ui route/menu surface so enterprise-local pages are not visible business entries.

**Acceptance criteria:**
- [ ] 01-05 enterprise workflows are removed from vendor menus.
- [ ] Enterprise License import/runtime pages are removed.
- [ ] Vendor customer/License/factor/template/renewal pages remain.
- [ ] Route/error infrastructure remains available as infrastructure only.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual menu scan in browser.

**Dependencies:** None

**Estimated scope:** M

## Phase 2: License Issue UX

### Task VU-2: License Issue API Client

**Description:** Add typed API client for vendor License issue.

**Acceptance criteria:**
- [ ] Client sends customer ID, install ID, validity, edition/features, and allowed issue inputs.
- [ ] Client does not send trusted customer code/name facts.
- [ ] Client does not expose `privateKeyRef`.

**Verification:**
- [ ] `rtk npm run lint:eslint`
- [ ] `rtk npm run build:prod`

**Dependencies:** None

**Estimated scope:** S

### Task VU-3: License Issue Drawer and Download

**Description:** Build vendor License issue drawer and `.lic` download flow.

**Acceptance criteria:**
- [ ] User selects a vendor customer.
- [ ] Disabled/inactive and duplicate issue errors display clearly.
- [ ] Generated `.lic` can be downloaded.
- [ ] Generic signing failure displays sanitized text.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual issue flow against dev or mocked backend.

**Dependencies:** VU-2

**Estimated scope:** M

## Phase 3: Factor Lifecycle UX

### Task VU-4: Factor Version List and State Actions

**Description:** Add factor version list and release/freeze action surfaces.

**Acceptance criteria:**
- [ ] Draft/released/frozen states are visually clear.
- [ ] Release/freeze actions call vendor backend APIs.
- [ ] No enterprise effective factor results are displayed.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual state action smoke test.

**Dependencies:** Vendor backend factor lifecycle API

**Estimated scope:** M

### Task VU-5: Factor Open Scope Editor

**Description:** Add customer/edition/license entitlement scope editor for factor versions.

**Acceptance criteria:**
- [ ] Scope editor stores vendor-side entitlement metadata.
- [ ] UI does not request enterprise runtime state.
- [ ] Unauthorized scope state is visible before publish.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual scope edit smoke test.

**Dependencies:** VU-4 and vendor backend scope API

**Estimated scope:** M

## Phase 4: Template and Renewal Operations

### Task VU-6: Report Template Management

**Description:** Build vendor report template publish/disable/distribution management UI.

**Acceptance criteria:**
- [ ] Template versions can be listed and managed.
- [ ] Distribution targets customer/edition/license entitlement metadata.
- [ ] UI does not preview enterprise business data.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual template management check.

**Dependencies:** Template backend API

**Estimated scope:** M

### Task VU-7: Renewal / Payment Operation Page

**Description:** Build first vendor-owned renewal operation page.

**Acceptance criteria:**
- [ ] Renewal records are visible.
- [ ] Manual renewal can lead to License issue or queued issue action.
- [ ] Payment callback statuses are display-only until backend automation exists.

**Verification:**
- [ ] `rtk npm run build:prod`
- [ ] Manual page check.

**Dependencies:** Renewal backend contract

**Estimated scope:** M

## Checkpoint

After VU-1, VU-3, VU-5, VU-6:

- [ ] `rtk npm run lint:eslint`
- [ ] `rtk npm run build:prod`
- [ ] Browser smoke test for menu, License issue, factor lifecycle, and template pages.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| UI exposes enterprise local state | High | Remove enterprise pages and avoid runtime-state APIs |
| Customer facts are user-forged | High | Backend resolves customer by ID; UI does not send trusted facts |
| Private key metadata leaks | High | Do not render key refs or private-key details |
| Backend APIs not ready | Medium | Use typed mock contract and keep task blocked for real integration |

## Parallelization

- VU-1 and VU-2 can run in parallel.
- VU-3 waits for VU-2.
- VU-4 waits for vendor backend factor lifecycle API.
- VU-5 waits for VU-4.
- VU-6 and VU-7 can run independently after backend contracts are defined.
