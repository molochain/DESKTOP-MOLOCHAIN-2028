#!/bin/bash
set -e

echo "Creating WAL archive directory..."
mkdir -p /backups/wal
mkdir -p /backups/daily
mkdir -p /backups/weekly
chown -R postgres:postgres /backups
chmod 700 /backups/wal
echo "WAL archive directory created successfully"
