# Molochain CMS Admin Panels

These files add admin panels for managing Settings, Menu Items, and Home Sections.

## File Structure

Upload these files to your Laravel CMS at `/var/www/vhosts/molochain.com/cms.molochain.com/`:

```
├── app/Http/Controllers/Admin/
│   ├── SettingsController.php
│   ├── MenuController.php
│   └── HomeSectionsController.php
│
├── resources/views/
│   ├── layouts/
│   │   └── admin.blade.php          (Main admin layout)
│   └── admin/
│       ├── settings/
│       │   └── index.blade.php      (Settings manager)
│       ├── menu/
│       │   └── index.blade.php      (Menu editor)
│       └── home-sections/
│           ├── index.blade.php      (Sections list)
│           └── edit.blade.php       (Section editor)
│
└── routes/
    └── admin.php                    (Route definitions)
```

## Installation Steps

### 1. Upload Files

Upload each file to the corresponding directory on your server:

```bash
# Create directories if they don't exist
mkdir -p app/Http/Controllers/Admin
mkdir -p resources/views/layouts
mkdir -p resources/views/admin/settings
mkdir -p resources/views/admin/menu
mkdir -p resources/views/admin/home-sections
```

### 2. Add Routes

Edit `routes/web.php` and add this at the bottom:

```php
require __DIR__.'/admin.php';
```

Or copy the content from `routes/admin.php` directly into `routes/web.php`.

### 3. Clear Cache

```bash
cd /var/www/vhosts/molochain.com/cms.molochain.com
/opt/plesk/php/8.4/bin/php artisan cache:clear
/opt/plesk/php/8.4/bin/php artisan route:clear
/opt/plesk/php/8.4/bin/php artisan view:clear
/opt/plesk/php/8.4/bin/php artisan config:clear
```

### 4. Access Admin Panels

After installation, access the panels at:

- **Settings**: https://cms.molochain.com/admin/settings
- **Menu**: https://cms.molochain.com/admin/menu
- **Home Sections**: https://cms.molochain.com/admin/home-sections

**Note**: You must be logged in to access these panels.

## Database Requirements

Make sure you have already created these tables (should be done from previous steps):

- `settings` - For key-value settings
- `menu_items` - For navigation menu
- `home_sections` - For homepage content (already exists)

## Layout Compatibility

The `admin.blade.php` layout uses:
- Tailwind CSS via CDN
- Standard Laravel Blade syntax
- Auth check for user info

If you have an existing admin layout, you can modify the views to use your layout instead by changing:
```php
@extends('layouts.admin')
```
to your existing layout path.

## API Endpoints

These admin panels work with the existing API endpoints:

| Endpoint | Description |
|----------|-------------|
| `/api/settings` | Returns all settings |
| `/api/menu` | Returns active menu items |
| `/api/home-sections` | Returns homepage sections |

Changes made in the admin panels are immediately available via these APIs.

## Webhook Integration

For real-time cache invalidation when services are updated in the CMS, see:
- **SETUP.md** - Quick 3-step setup guide
- **webhook-integration.md** - Full technical documentation

### Key Files for Webhook Integration

| File | Purpose |
|------|---------|
| `app/Services/WebhookService.php` | HMAC-SHA256 signed webhook sender |
| `app/Observers/ServiceObserver.php` | Auto-triggers webhooks on service CRUD |
| `config/webhooks.php` | Webhook configuration |

### Status (Dec 28, 2025)

- Webhook integration: **Operational**
- Success rate: **100%**
- Secret configured: **Yes**
