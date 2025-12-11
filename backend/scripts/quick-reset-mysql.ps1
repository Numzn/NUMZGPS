# Quick MySQL Password Reset
# This is the fastest method to reset MySQL passwords

Write-Host "Quick MySQL Password Reset" -ForegroundColor Cyan

# Stop MySQL container
docker stop numztrak-mysql

# Start temporary MySQL with skip-grant-tables (no password needed)
docker run -d --name mysql-reset `
    --network numztrak-network `
    -v "$PWD\..\data\mysql:/var/lib/mysql" `
    mysql:8.0 `
    --skip-grant-tables `
    --skip-networking

Start-Sleep -Seconds 8

# Reset passwords (no password needed with skip-grant-tables)
docker exec mysql-reset mysql -u root << 'EOF'
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NumzTrak2025Root';
ALTER USER 'root'@'%' IDENTIFIED BY 'NumzTrak2025Root';
ALTER USER 'traccar'@'%' IDENTIFIED BY 'traccar123';
CREATE USER IF NOT EXISTS 'traccar'@'%' IDENTIFIED BY 'traccar123';
GRANT ALL PRIVILEGES ON traccar.* TO 'traccar'@'%';
FLUSH PRIVILEGES;
EOF

# Stop and remove temp container
docker stop mysql-reset
docker rm mysql-reset

# Restart original container
docker start numztrak-mysql

Start-Sleep -Seconds 5

# Verify
docker exec numztrak-mysql mysql -u traccar -ptraccar123 -e "SELECT 'Password reset successful!' as status;"

Write-Host "Done! MySQL passwords reset." -ForegroundColor Green

