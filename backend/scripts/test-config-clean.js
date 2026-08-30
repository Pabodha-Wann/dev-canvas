import { getAsgardeoConfig } from '../src/config/asgardeo.js';

const config = getAsgardeoConfig();
const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes,
});
console.log('Built Authorize URL:', `${config.authorizationEndpoint}?${params.toString()}`);
