import 'dotenv/config';
import jwt from 'jsonwebtoken';

const cleanEnvStr = (val, defaultVal = '') => {
    if (!val) return defaultVal;
    return String(val).replace(/^["']|["']$/g, '').trim();
};

const getAsgardeoBaseUrl = () => {
    const tenant = cleanEnvStr(process.env.ASGARDEO_TENANT, 'devcanvas2026');
    let baseUrl = cleanEnvStr(process.env.ASGARDEO_BASE_URL, `https://api.asgardeo.io/t/${tenant}`);
    if (tenant && !baseUrl.includes(`/t/${tenant}`)) {
        baseUrl = `${baseUrl.replace(/\/$/, '')}/${tenant}`;
    }
    return baseUrl.replace(/\/$/, '');
};

export const getAsgardeoConfig = () => {
    const baseUrl = getAsgardeoBaseUrl();
    const serverUrl = cleanEnvStr(process.env.SERVER_URL, 'http://localhost:3000');

    return {
        clientId: cleanEnvStr(process.env.ASGARDEO_CLIENT_ID),
        clientSecret: cleanEnvStr(process.env.ASGARDEO_CLIENT_SECRET),
        baseUrl,
        authorizationEndpoint: `${baseUrl}/oauth2/authorize`,
        tokenEndpoint: `${baseUrl}/oauth2/token`,
        userinfoEndpoint: `${baseUrl}/oauth2/userinfo`,
        jwksUri: `${baseUrl}/oauth2/jwks`,
        logoutEndpoint: `${baseUrl}/oidc/logout`,
        issuer: cleanEnvStr(process.env.ASGARDEO_ISSUER, `${baseUrl}/oauth2/token`),
        redirectUri: cleanEnvStr(process.env.ASGARDEO_REDIRECT_URI, `${serverUrl}/api/auth/asgardeo/callback`),
        scopes: cleanEnvStr(process.env.ASGARDEO_SCOPES, 'openid profile email phone'),
    };
};

let jwksCache = {
    keys: null,
    fetchedAt: 0,
};

export const fetchAsgardeoJwks = async () => {
    const config = getAsgardeoConfig();
    const NOW = Date.now();
    // Cache for 1 hour
    if (jwksCache.keys && (NOW - jwksCache.fetchedAt < 3600000)) {
        return jwksCache.keys;
    }

    try {
        const response = await fetch(config.jwksUri);
        if (!response.ok) {
            throw new Error(`Failed to fetch JWKS from Asgardeo: ${response.statusText}`);
        }
        const data = await response.json();
        jwksCache = {
            keys: data.keys,
            fetchedAt: NOW,
        };
        return data.keys;
    } catch (err) {
        console.error('Error fetching Asgardeo JWKS:', err.message);
        throw err;
    }
};

export const jwkToPem = (jwk) => {
    if (jwk.kty !== 'RSA') {
        throw new Error('Unsupported key type');
    }
    const n = Buffer.from(jwk.n, 'base64url');
    const e = Buffer.from(jwk.e, 'base64url');

    function encodeLength(len) {
        if (len < 128) return Buffer.from([len]);
        const bytes = [];
        while (len > 0) {
            bytes.unshift(len & 0xff);
            len >>= 8;
        }
        return Buffer.from([0x80 | bytes.length, ...bytes]);
    }

    function encodeSequence(...items) {
        const body = Buffer.concat(items);
        return Buffer.concat([Buffer.from([0x30]), encodeLength(body.length), body]);
    }

    function encodeInteger(buf) {
        if (buf[0] & 0x80) {
            buf = Buffer.concat([Buffer.from([0x00]), buf]);
        }
        return Buffer.concat([Buffer.from([0x02]), encodeLength(buf.length), buf]);
    }

    function encodeBitString(buf) {
        return Buffer.concat([Buffer.from([0x03]), encodeLength(buf.length + 1), Buffer.from([0x00]), buf]);
    }

    const rsaPubKey = encodeSequence(encodeInteger(n), encodeInteger(e));
    const algoIdentifier = encodeSequence(
        Buffer.from([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01]), // rsaEncryption OID
        Buffer.from([0x05, 0x00]) // NULL
    );

    const subjectPublicKeyInfo = encodeSequence(algoIdentifier, encodeBitString(rsaPubKey));
    const base64Pem = subjectPublicKeyInfo.toString('base64').match(/.{1,64}/g).join('\n');
    return `-----BEGIN PUBLIC KEY-----\n${base64Pem}\n-----END PUBLIC KEY-----\n`;
};

export const verifyAsgardeoToken = async (token) => {
    const config = getAsgardeoConfig();
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
        throw new Error('Invalid token structure or missing kid');
    }

    const keys = await fetchAsgardeoJwks();
    const matchingKey = keys.find((k) => k.kid === decodedHeader.header.kid);
    if (!matchingKey) {
        throw new Error(`Public key matching kid ${decodedHeader.header.kid} not found in JWKS`);
    }

    const pem = jwkToPem(matchingKey);

    const verifyOptions = {
        algorithms: ['RS256'],
        clockTolerance: 60, // 60 seconds tolerance for clock skew
    };

    if (config.clientId) {
        verifyOptions.audience = config.clientId;
    }

    const payload = jwt.verify(token, pem, verifyOptions);
    return payload;
};
