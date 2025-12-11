# Connecting to Oracle Database from Terminal

This guide covers multiple ways to connect to an Oracle database from a terminal/command line.

## Prerequisites

1. **Oracle Client Installation**
   - Install Oracle Instant Client or full Oracle Client
   - Download from: https://www.oracle.com/database/technologies/instant-client/downloads.html

2. **Environment Setup**
   - Set `ORACLE_HOME` environment variable
   - Add Oracle binaries to `PATH`

## Method 1: Using SQL*Plus (Most Common)

### Basic Connection

```bash
sqlplus username/password@hostname:port/service_name
```

### Examples:

```bash
# Connect to local database
sqlplus hr/hr@localhost:1521/XEPDB1

# Connect with full connection string
sqlplus hr/hr@"(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=XEPDB1)))"

# Connect with TNS alias (if tnsnames.ora is configured)
sqlplus hr/hr@MYDB

# Connect and prompt for password (more secure)
sqlplus username@hostname:port/service_name
```

### Common SQL*Plus Commands:

```sql
-- Exit SQL*Plus
EXIT;
-- or
QUIT;

-- Show current user
SHOW USER;

-- Show connection info
SHOW CON_NAME;

-- Run SQL scripts
@/path/to/script.sql
START /path/to/script.sql

-- Spool output to file
SPOOL /path/to/output.txt
-- Your queries here
SPOOL OFF
```

## Method 2: Using Easy Connect Naming

```bash
sqlplus username/password@//hostname:port/service_name
```

Example:
```bash
sqlplus hr/hr@//localhost:1521/XEPDB1
```

## Method 3: Using SQLcl (Modern SQL Command Line)

SQLcl is Oracle's modern command-line interface (better than SQL*Plus):

```bash
# Download from Oracle website
sql username/password@hostname:port/service_name

# Example
sql hr/hr@localhost:1521/XEPDB1
```

## Method 4: Using Docker (No Local Installation Needed)

If you have Docker, you can run SQL*Plus in a container:

```bash
# Connect to Oracle running in Docker
docker exec -it oracle-container sqlplus hr/hr@localhost:1521/XEPDB1

# Or use Oracle Instant Client in Docker
docker run -it --rm store/oracle/database-instantclient:21.3.0.0.0 sqlplus hr/hr@hostname:port/service_name
```

## Method 5: Using Oracle Cloud (OCI)

For Oracle Cloud databases:

```bash
sqlplus admin/your_password@(description=(address=(protocol=tcps)(port=1522)(host=your-db-host.adb.region.oraclecloud.com))(connect_data=(service_name=your_service_name.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))
```

## Connection String Format

### Format Options:

1. **Simple format:**
   ```
   username/password@hostname:port/service_name
   ```

2. **Full TNS format:**
   ```
   username/password@"(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=hostname)(PORT=port))(CONNECT_DATA=(SERVICE_NAME=service_name)))"
   ```

3. **With SID (older format):**
   ```
   username/password@hostname:port:SID
   ```

## Common Connection Parameters

- **Username**: Your Oracle database username
- **Password**: Your Oracle database password
- **Hostname**: Server IP or hostname (e.g., `localhost`, `192.168.1.100`)
- **Port**: Oracle listener port (default is `1521`)
- **Service Name**: Database service name (e.g., `XEPDB1`, `ORCL`)
- **SID**: System Identifier (older databases, use SERVICE_NAME for newer ones)

## Troubleshooting

### Error: "ORA-12154: TNS:could not resolve the connect identifier"
- Check your connection string syntax
- Verify the hostname/port are correct
- Ensure Oracle client is properly installed
- Check if `tnsnames.ora` needs to be configured

### Error: "ORA-12541: TNS:no listener"
- Verify the Oracle listener is running on the server
- Check if the port is correct
- Ensure network connectivity to the server

### Error: "ORA-01017: invalid username/password"
- Verify username and password are correct
- Check if the user account is locked

### Check if Oracle Client is Installed:

**Windows (PowerShell):**
```powershell
sqlplus -version
```

**Linux/Mac:**
```bash
sqlplus -version
```

If command not found, install Oracle Instant Client.

## Example Connection Script

### Windows PowerShell Script:

```powershell
# Set Oracle connection details
$ORACLE_USER = "hr"
$ORACLE_PASS = "yourpassword"
$ORACLE_HOST = "localhost"
$ORACLE_PORT = "1521"
$ORACLE_SERVICE = "XEPDB1"

# Connect to Oracle
sqlplus "${ORACLE_USER}/${ORACLE_PASS}@${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SERVICE}"
```

### Linux/Mac Bash Script:

```bash
#!/bin/bash
ORACLE_USER="hr"
ORACLE_PASS="yourpassword"
ORACLE_HOST="localhost"
ORACLE_PORT="1521"
ORACLE_SERVICE="XEPDB1"

sqlplus "${ORACLE_USER}/${ORACLE_PASS}@${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SERVICE}"
```

## Security Best Practices

1. **Avoid passwords in command line** (visible in process list):
   ```bash
   sqlplus username@connection_string
   # Then enter password when prompted
   ```

2. **Use Oracle Wallet** for credential storage:
   ```bash
   sqlplus /@connection_string
   ```

3. **Use environment variables** for sensitive data:
   ```bash
   export ORACLE_PASSWORD="yourpassword"
   sqlplus username/${ORACLE_PASSWORD}@connection_string
   ```

## Additional Resources

- Oracle SQL*Plus Documentation: https://docs.oracle.com/en/database/oracle/oracle-database/
- Oracle Instant Client Downloads: https://www.oracle.com/database/technologies/instant-client/downloads.html
- Oracle SQLcl Documentation: https://www.oracle.com/database/technologies/appdev/sqlcl.html



