# Admin Setup

## Automatic Admin Code Setup

The admin access code is now automatically created from your `.env` file. No manual Firestore edits needed!

### Steps:

1. **Set your admin code in `.env`:**

```bash
ADMIN_CODE=ADMIN-YOUR-SECRET-CODE
```

Choose a secure code. This will be auto-created in Firestore when you first access the admin dashboard.

2. **Access the dashboard:**
   - Go to `/access-code`
   - Enter your admin code (from `.env`)
   - You'll be redirected to `/admin/codes`
   - The code is automatically created in Firestore on first load

3. **Create more codes:**
   - Use the admin dashboard to create regular user codes
   - Create additional admin codes if needed

## How It Works

When the `/admin/codes` page loads, it automatically:
- Checks if `ADMIN_CODE` env variable is set
- Checks if a code with that value exists in Firestore
- Creates it if missing with:
  - `isAdmin: true` (admin privileges)
  - `expiresAt: 9999999999999` (effectively permanent)
  - `maxUses: 999999` (very high limit)
  - `active: true`

## Security Notes

- Keep your admin code secret
- Use `isAdmin: false` for regular user codes
- Regularly review code usage
- Disable or delete unused codes
