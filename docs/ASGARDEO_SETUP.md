# Asgardeo OIDC Integration Setup Guide

This guide provides step-by-step instructions for configuring Asgardeo as the OpenID Connect (OIDC) Identity Provider for **DevCanvas**.

---

## 1. Asgardeo Console Setup

1. Log into your [Asgardeo Console](https://console.asgardeo.io/).
2. Navigate to **Applications** -> **Register Application**.
3. Select **Standard-Based Application** -> **OpenID Connect (OIDC)**.
4. Set Application Name: `DevCanvas-Showcase-Portal`.
5. Select Protocol: **Code Grant** (Authorization Code Flow).

---

## 2. User Attributes Configuration (Crucial for Profile Claims)

In the Asgardeo Application settings for **DevCanvas**:

1. Click on the **User Attributes** tab.
2. Under **Requested Attributes**, check the boxes for:
   - **Email** (`email`)
   - **First Name** (`given_name`)
   - **Last Name** (`family_name`)
   - **Username** (`preferred_username`)
   - **Mobile** (`phone_number`)
3. Click **Update / Save**.
4. In the Asgardeo **Users** directory, ensure your test user account has an **Email Address** set in their user profile.

---

## 3. Protocol & Security Configurations

In the created application settings:

1. **Authorized Redirect URLs**:
   ```text
   http://localhost:3000/api/auth/asgardeo/callback
   ```
2. **Allowed Origins (CORS)**:
   ```text
   http://localhost:5173
   ```
3. **User Attributes / Scopes**:
   Enable the following scopes under **User Attributes**:
   - `openid`
   - `profile`
   - `email`
   - `phone`
4. **PKCE & Client Credentials**:
   - Obtain your **Client ID** and **Client Secret**.
   - Copy them securely into your backend `.env` file (NEVER commit `.env` to Git).

---

## 4. Environment Variables Configuration

In `backend/.env`, configure the following variables:

```env
ASGARDEO_CLIENT_ID=your_client_id_from_asgardeo
ASGARDEO_CLIENT_SECRET=your_client_secret_from_asgardeo
ASGARDEO_TENANT=your_organization_tenant_name
ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your_organization_tenant_name
ASGARDEO_ISSUER=https://api.asgardeo.io/t/your_organization_tenant_name/oauth2/token
ASGARDEO_REDIRECT_URI=http://localhost:3000/api/auth/asgardeo/callback
ASGARDEO_SCOPES="openid profile email phone"
```

---

## 5. OIDC Authentication Protocol Flow

1. User clicks **"Sign in with Asgardeo (OIDC)"** on the frontend login page.
2. The browser is redirected to `/api/auth/asgardeo`, which constructs the authorization request and forwards to Asgardeo's authorization endpoint:
   `https://api.asgardeo.io/t/<tenant>/oauth2/authorize?response_type=code&client_id=...&scope=openid+profile+email+phone`
3. Upon user authentication and consent, Asgardeo redirects back to `/api/auth/asgardeo/callback` with an authorization `code`.
4. The backend securely exchanges the `code` for `id_token` and `access_token` via HTTP POST to Asgardeo's Token Endpoint.
5. The backend cryptographically verifies the received token using Asgardeo's public keys dynamically fetched from `jwks_uri` (`/oauth2/jwks`), checking:
   - Signature (RS256)
   - Issuer (`iss`)
   - Audience (`aud`)
   - Expiration (`exp`)
6. The backend fetches `/oauth2/userinfo` and extracts `email`, `username`, `given_name`, `family_name`, and `phone_number`.
7. The backend upserts the `User` record in MongoDB using `asgardeoId`, syncs any updated profile claims, and issues the session.
