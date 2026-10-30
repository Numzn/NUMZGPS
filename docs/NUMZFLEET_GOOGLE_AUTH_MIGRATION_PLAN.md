# NUMZFLEET Google Authentication & Company Onboarding

## Decisions

- Registration: both owner-issued invitations and customer self-registration.
- Company approval: NUMZ platform owner and explicitly delegated platform administrators.
- Existing accounts: preserve and migrate safely; do not force an immediate cutover.
- Delivery: incremental changes on `feat/numzfleet-google-auth-onboarding`; no direct changes to `main`.

## Initial repository audit (2026-10-30)

Repository: `Numzn/NUMZGPS`, default branch `main`.

### Existing authentication

- The React login screen is `traccar-fleet-system/frontend/src/login/LoginPage.jsx`.
- Password login currently posts to Traccar `/api/session`; token login also validates through Traccar.
- Fuel API authentication is implemented in `fuel-api/src/middleware/auth.js` and `fuel-api/src/services/sessionService.js`.
- The current fuel API session service validates Traccar `JSESSIONID` using Traccar MySQL and then the Traccar API.
- Development fallback accepts `x-user-id` under permissive configuration and can create synthetic users. This must remain development-only and must never be accepted as production identity.
- `fuel-api/src/middleware/authGates.js` provides user/manager/admin gates but has no platform/company membership checks.
- Socket.IO authentication in `fuel-api/src/socket/socketHandler.js` validates only the Traccar session cookie and assigns user/driver rooms.
- The frontend has a Traccar registration page at `traccar-fleet-system/frontend/src/login/RegisterPage.jsx`; this is not a NUMZ company approval workflow.

### Data and tenancy

- Fuel API models are Sequelize models in `fuel-api/src/models`, connected to PostgreSQL.
- The inspected `Vehicle` and `FuelRequest` model definitions do not include `company_id`.
- The inspected model registry calls Sequelize `sync`; its fallback can use `alter: true`. Production identity/tenancy changes must instead use explicit, versioned, reversible SQL migrations.
- Repository code search did not find `company_id` or `companyId` in the indexed default-branch code. This conflicts with the intended company-scoped architecture and must be reconciled against the actual deployed database/schema before tenant migration. Do not assume that the repository snapshot and deployed environment are identical.

### Initial risks

1. Authentication is currently coupled to Traccar. Replacing it in-place would risk breaking existing fleet users and API flows.
2. There is no observed platform identity, company approval, invitation, or company membership domain in the inspected source.
3. No company ownership field was observed on the inspected core fleet models; tenant isolation must be implemented in every relevant query and mutation, not just in login.
4. Existing permissive development identity must not leak into production.
5. WebSocket authorization and room membership must become company-aware; clients must not be allowed to join arbitrary company or role rooms.
6. The current database sync behavior is not an adequate production migration strategy for this change.

## Target architecture

Separate identity, authentication, authorization, and tenant membership:

- `users`: canonical NUMZ platform person record.
- `oauth_accounts`: external identity link; Google subject (`sub`) is the stable provider identifier. Email is an attribute, not the primary external identity key.
- `companies`: customer company and lifecycle status (`pending`, `active`, `suspended`, `rejected`).
- `company_memberships`: user/company association, role and status (`pending`, `active`, `suspended`, `revoked`).
- `company_invitations`: owner-issued invitation for a specific company and email, with hashed, expiring, single-use token.
- `registration_requests`: customer self-service company application and approval history.
- `platform_admins` (or an equivalent existing platform-role mechanism): platform owner and delegated platform administrators, independent of customer-company roles.
- `auth_sessions`: revocable server-side sessions with expiry and rotation.
- `audit_logs`: actor, action, target, timestamp and relevant metadata for security-sensitive changes.

A Google login is successful authentication, not automatic authorization. Every protected request must resolve an active user, active company membership and allowed role. Company context must be selected from server-validated membership/session state, never trusted from a caller-supplied `company_id`.

A single Google identity may eventually belong to multiple companies. Company switching must explicitly select one of the user's active memberships and revalidate it server-side.

## Registration flows

### Invitation flow

1. Platform owner/delegate creates or selects a company.
2. Admin issues an invitation for a specific normalized email and company role.
3. System emails a short-lived, single-use invitation link.
4. Customer authenticates with Google.
5. Backend verifies Google token signature, issuer, audience, expiry and verified-email claim; binds the Google `sub` to the user.
6. The normalized Google email must match the invitation email.
7. Invitation is consumed atomically; membership becomes active only if company is active and invitation policy permits activation.
8. User is redirected to the selected company workspace.

### Self-registration flow

1. Customer chooses “Register your company”.
2. Customer authenticates with Google first.
3. Backend verifies the Google identity and creates/loads a user record.
4. Customer completes company details.
5. Backend creates a pending company, pending owner membership and registration request in one transaction.
6. Customer receives an application-received email.
7. Platform owner/delegate reviews the application.
8. Approval activates the company and owner membership; rejection records reason and notifies applicant.
9. User can authenticate while pending but receives a clear pending/rejected/suspended state and no fleet-data access.

## Migration-safe implementation phases

### Phase 0 — Baseline and schema reconciliation
- Confirm the repository revision and compare it with the deployed NUMZFLEET source and PostgreSQL schema.
- Inventory every fuel API route, controller, query, model, background job and Socket.IO event that reads/writes tenant data.
- Capture baseline tests and database backup/restore procedure.
- Identify the current Traccar-to-fuel user/device/vehicle relationships.
- Do not change production data or authentication in this phase.

### Phase 1 — Identity and tenancy foundation
- Add explicit SQL migrations for identity, company, membership, invitation, registration, platform-admin, session and audit tables.
- Add nullable tenant ownership fields to tenant-owned records first.
- Backfill legacy records only where ownership can be proven from existing Traccar/company mappings.
- Quarantine ambiguous records for manual reconciliation; never assign them to an arbitrary tenant.
- Add indexes, foreign keys and uniqueness constraints after validation.
- Keep legacy Traccar login working.

### Phase 2 — Google OAuth and session service
- Implement Google Authorization Code flow with state, nonce and PKCE where applicable.
- Validate Google identity server-side; use the stable Google subject, not email alone, for account linkage.
- Create secure, HttpOnly, SameSite cookies; rotate sessions after login; implement logout/revocation and CSRF protection.
- Keep Traccar session authentication as a separate legacy adapter during migration.
- Do not expose Google client secrets or session tokens to the frontend.

### Phase 3 — Registration and email workflows
- Implement invitation creation, expiry, resend and atomic consumption.
- Implement self-service registration and pending status.
- Implement email notifications for invitation, application receipt, approval, rejection and suspension.
- Use a configurable email provider/SMTP adapter; secrets remain environment-managed.
- Add rate limits and abuse controls to public registration and OAuth initiation/callback endpoints.

### Phase 4 — Platform administration
- Add platform owner/delegate roles and a secure bootstrap process for the first platform owner.
- Add company review, approve, reject, suspend and reactivate operations.
- Add per-company member invitations, role assignment, suspension and revocation.
- Require audit records for every privileged action.
- Never infer platform-admin status from a customer-company role or Google email domain.

### Phase 5 — Company-scoped authorization and data migration
- Add authenticated company context and tenant-aware authorization middleware.
- Scope all tenant data reads, updates and deletes by server-derived company membership.
- Add ownership checks for nested resources and cross-tenant identifier probing.
- Migrate Socket.IO authentication and server-controlled room assignment to active user/company memberships.
- Remove arbitrary client room joins or constrain them to authorized room namespaces.
- Keep legacy access behind a deliberate compatibility adapter until all users/data are mapped.

### Phase 6 — Frontend experience
- Replace the public customer login entry with “Continue with Google”.
- Add “Register your company” and invitation acceptance.
- Add completion form for company details and clear pending/rejected/suspended states.
- Add company selector for users with multiple memberships.
- Preserve an explicitly separated legacy login route during transition; do not silently remove current login.

### Phase 7 — Verification and controlled rollout
- Unit, integration and end-to-end tests for OAuth, state/nonce replay, invitation matching, approval, suspension, revocation, company switching and logout.
- Tenant-isolation tests across every protected resource and WebSocket event.
- Regression tests for Traccar telemetry, existing user sessions, fuel workflows, vehicle/device assignment, reports and Socket.IO.
- Deploy migrations additively; enable Google auth behind a feature flag for a small test cohort.
- Monitor errors and audit events; expand only after verification.
- Keep rollback path: disable new auth flag, retain legacy adapter, and do not drop legacy columns/tables until a separately approved decommission phase.

## Security and acceptance criteria

- Google email must be verified; Google `sub` is the external identity key.
- OAuth state and nonce are checked; authorization codes are exchanged server-side.
- Unapproved, suspended or rejected companies have no fleet-data access.
- Pending company users may see only their application status and permitted profile data.
- A user cannot change tenant by editing a request body, URL, header, socket payload or local storage.
- All tenant queries are company-scoped and all privileged actions audited.
- Platform administrators are separate from company managers.
- Legacy accounts continue to work until safely linked/migrated.
- No destructive Sequelize sync or automatic production schema alteration is used for these migrations.
- No production secrets are committed to Git.

## External configuration required before enabling OAuth/email

- Google Cloud OAuth client ID and client secret.
- Exact production and development callback URLs.
- Allowed frontend origins and cookie domain/HTTPS configuration.
- Email provider/SMTP host, port, sender identity and credentials.
- Initial platform-owner bootstrap identity and recovery procedure.

These values must be supplied through deployment secrets/environment configuration, never committed to the repository.
