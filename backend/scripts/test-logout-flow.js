import 'dotenv/config';
import { getAsgardeoConfig } from '../src/config/asgardeo.js';

const fetch = globalThis.fetch;

async function testAsgardeoLogoutUrls() {
  const config = getAsgardeoConfig();
  console.log('Registered Callback URI:', config.redirectUri);

  // Case 4: post_logout_redirect_uri set to config.redirectUri
  const url4 = `${config.baseUrl}/oidc/logout?client_id=${config.clientId}&post_logout_redirect_uri=${encodeURIComponent(config.redirectUri)}`;
  const res4 = await fetch(url4, { redirect: 'manual' });
  console.log('\nCase 4 (registered redirectUri): Status', res4.status);
  console.log('Location:', res4.headers.get('location'));

  // Case 5: client_id without post_logout_redirect_uri
  const url5 = `${config.baseUrl}/oidc/logout?client_id=${config.clientId}`;
  const res5 = await fetch(url5, { redirect: 'manual' });
  console.log('\nCase 5 (client_id only): Status', res5.status);
  console.log('Location:', res5.headers.get('location'));
}

testAsgardeoLogoutUrls();
