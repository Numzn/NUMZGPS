# Fuel API Database Migrations

This service currently uses SQL migration files under `fuel-api/migrations/`.

## Apply the operation session migrations

`release-prod.ps1` starts `fuel-api` so Sequelize can create any missing base tables, applies all
SQL files in `fuel-api/migrations/`, then restarts `fuel-api`.
For manual recovery or local environments, run the migrations in filename order.

Run this from the repository root:

```powershell
Get-ChildItem "C:\Users\NUMERI\NUMZFLEET\fuel-api\migrations\*.sql" |
  Sort-Object Name |
  ForEach-Object { psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f $_.FullName }
```

If `DATABASE_URL` is not set, pass it directly:

```powershell
Get-ChildItem "C:\Users\NUMERI\NUMZFLEET\fuel-api\migrations\*.sql" |
  Sort-Object Name |
  ForEach-Object { psql "postgresql://numztrak:<password>@<host>:5432/numztrak_fuel" -v ON_ERROR_STOP=1 -f $_.FullName }
```

## Why this migration is safe to re-run

The current operation-session migrations use `IF NOT EXISTS` for new columns, indexes, and enum
values where applicable, so repeated execution is idempotent for those objects.

## Verify migration state

```powershell
psql "$env:DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name='operation_sessions' ORDER BY ordinal_position;"
psql "$env:DATABASE_URL" -c "SELECT column_name FROM information_schema.columns WHERE table_name='operation_session_refuels' ORDER BY ordinal_position;"
psql "$env:DATABASE_URL" -c "SELECT indexname FROM pg_indexes WHERE tablename='operation_sessions' ORDER BY indexname;"
```

After migration, expect operation-session totals columns, intelligent refuel columns, the `incomplete`
refuel status enum value, and the `idx_operation_sessions_one_active_per_user` index.
