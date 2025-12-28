#!/usr/bin/env bash
set -e

echo "===================================================="
echo "🧠 MOLOCHAIN SERVER STRUCTURE CHECK"
echo "===================================================="
echo

# 1) وجود فولدر server
if [ ! -d server ]; then
  echo "❌ server/ folder NOT found!"
  exit 1
fi
echo "✅ server/ folder exists"
echo

# 2) لیست محتویات لایه اول server
echo "📂 Top-level items inside server/:"
ls -1 server
echo

# 3) چک کردن فایل‌های کلیدی
echo "🔍 Checking key files..."
for f in \
  server/index.ts \
  server/routes.ts \
  server/vite.ts \
  server/neon-fix.ts \
  server/db.ts
do
  if [ -f "$f" ]; then
    echo "  ✅ $f"
  else
    echo "  ⚠  $f  (missing)"
  fi
done
echo

# 4) چک کردن پوشه routes و چندتا route مهم
echo "📂 Routes directory:"
if [ -d server/routes ]; then
  ls -1 server/routes
else
  echo "❌ server/routes/ folder NOT found"
fi
echo

echo "🔍 Looking for external-status & departments routes..."
grep -R "external-status" -n server/routes || echo "  ⚠ no 'external-status' reference found in server/routes"
grep -R "departments" -n server/routes || echo "  ⚠ no 'departments' reference found in server/routes"
echo

# 5) نمایش ساختار تا عمق 2
echo "📁 Folder tree (depth 2) under server/:"
find server -maxdepth 2 -type d | sort
echo

# 6) فایل‌های index.ts و routes.ts داخل زیرپوشه‌ها
echo "📄 index.ts files under server/:"
find server -name "index.ts" | sort
echo
echo "📄 routes.ts files under server/:"
find server -name "routes.ts" | sort
echo

echo "✅ CHECK COMPLETE"
echo "===================================================="
