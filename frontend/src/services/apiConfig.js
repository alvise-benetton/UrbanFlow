// Single source of truth for the backend API base URL.
//
// The value MUST be injected at build time through the VITE_API_URL
// environment variable (GitHub Actions repositories secrets/variables).
// In local development Vite falls back to the dev API on localhost, but a
// production build without VITE_API_URL must fail loudly instead of silently
// pointing the deployed SPA at http://localhost:3000.
const configuredUrl = import.meta.env.VITE_API_URL;

const fallbackUrl = import.meta.env.DEV ? 'http://localhost:3000' : '';

if (!configuredUrl && import.meta.env.PROD) {
  console.error(
    '[UrbanFlow] VITE_API_URL is not set. API requests from the deployed ' +
      'frontend will fail. Set it in the build environment (see README → Deployment).'
  );
}

// Normalise by stripping trailing slashes so `${API_BASE_URL}/api/...` is always valid.
export const API_BASE_URL = (configuredUrl || fallbackUrl).replace(/\/+$/, '');

export default API_BASE_URL;
