# Application Scope Cleanup

## Approved scope

The user approved a code and interface cleanup while preserving the database schema, existing database data, and migration files.

Keep these business areas:

- Customers
- Sections
- Categories
- Items
- Customer products
- Machines
- Users
- Master batch colors
- Legacy database integration
- Orders
- Production board

## Preservation rules

- Do not delete or modify `shared/schema.ts`, `migrations/`, or database data.
- Keep authentication, authorization, and password-change flows because users remain in scope.
- Keep the Definitions page because it owns the requested master-data tabs.
- Keep the Orders page and its production-related tabs.
- Keep the unified Production Dashboard and its API dependencies.
- Keep legacy database routes and the legacy tab.
- Remove unrelated visible pages, navigation entries, route registrations, services, and files only after reference checks.

## Implementation sequence

1. Restrict client routes and navigation to the approved scope.
2. Restrict server route registration to authentication, approved master data, orders, production, legacy, and shared health/setup behavior.
3. Remove orphaned client/server files after checking imports and references.
4. Remove unused dependencies only when the build confirms they are no longer referenced.
5. Run TypeScript, lint, build, and focused smoke checks.

## Current risk boundary

Several approved pages depend on shared tables and route modules that also contain unrelated endpoints. The first pass removes exposure and registration of unrelated domains. File deletion is performed only after dependency analysis so that shared production and master-data behavior is not broken.

## Verification criteria

- No unrelated navigation item is rendered.
- Unapproved client routes no longer resolve to feature pages.
- Approved routes compile and render their route modules.
- Server build and TypeScript checks pass.
- Database schema and migration files are unchanged.
