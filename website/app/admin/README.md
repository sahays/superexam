# Admin Setup

## Initial Admin Code Creation

To access the admin dashboard for the first time, you need to manually create an admin access code in Firestore.

### Steps:

1. **Go to Firebase Console**
   - Navigate to Firestore Database
   - Find or create the `access-codes` collection

2. **Add a new document with these fields:**

```json
{
  "code": "ADMIN-YOUR-SECRET-CODE",
  "expiresAt": 9999999999999,
  "maxUses": 1,
  "currentUses": 0,
  "isAdmin": true,
  "active": true,
  "description": "Initial admin access",
  "createdBy": "system",
  "createdAt": 1703012345000
}
```

3. **Important fields:**
   - `code`: Your secret admin code (choose something secure!)
   - `isAdmin`: **MUST be true** for admin access
   - `maxUses`: Set to 1 (only you can use it)
   - `expiresAt`: Set to far future (9999999999999) for permanent access

4. **Access the dashboard:**
   - Go to `/access-code`
   - Enter your admin code
   - You'll be redirected to `/admin/codes`

5. **Create more codes:**
   - Use the admin dashboard to create regular user codes
   - Create additional admin codes if needed

## Security Notes

- Keep your admin code secret
- Use `isAdmin: false` for regular user codes
- Regularly review code usage
- Disable or delete unused codes
