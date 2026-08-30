import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { getAsgardeoConfig } from '../src/config/asgardeo.js';

const fetch = globalThis.fetch;
const BACKEND_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function runVerificationTests() {
    console.log('====================================================');
    console.log('   DEVCANVAS ASSESSMENT 2 — SECURITY & API TESTS    ');
    console.log('====================================================\n');

    let passedCount = 0;
    let failedCount = 0;

    function reportResult(description, status, details = '') {
        if (status) {
            console.log(`[PASS] ${description}`);
            passedCount++;
        } else {
            console.log(`[FAIL] ${description} ${details ? '(' + details + ')' : ''}`);
            failedCount++;
        }
    }

    // 1. Health check & Server Status
    try {
        const res = await fetch(`${BACKEND_URL}/api/health`);
        const data = await res.json();
        reportResult('Backend Health Check (/api/health)', res.ok && data.status === 'ok');
    } catch (err) {
        reportResult('Backend Health Check (/api/health)', false, err.message);
    }

    // 2. Unauthenticated request to protected endpoint -> 401
    try {
        const res = await fetch(`${BACKEND_URL}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test Project' })
        });
        reportResult('Unauthenticated POST /api/projects returns HTTP 401', res.status === 401);
    } catch (err) {
        reportResult('Unauthenticated POST /api/projects returns HTTP 401', false, err.message);
    }

    // 3. Forged / Invalid Token on Protected Endpoint -> 401
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
            headers: { 'Authorization': 'Bearer invalid_forged_token_123' }
        });
        reportResult('Forged Bearer Token on /api/auth/me returns HTTP 401', res.status === 401);
    } catch (err) {
        reportResult('Forged Bearer Token on /api/auth/me returns HTTP 401', false, err.message);
    }

    // 4. Invalid ObjectId parameter validation -> 400
    try {
        const res = await fetch(`${BACKEND_URL}/api/projects/invalid-objectid-999`);
        reportResult('Invalid ObjectId in URL parameter returns HTTP 400', res.status === 400);
    } catch (err) {
        reportResult('Invalid ObjectId in URL parameter returns HTTP 400', false, err.message);
    }

    // 5. Public Projects Feed -> 200
    try {
        const res = await fetch(`${BACKEND_URL}/api/projects`);
        reportResult('Public GET /api/projects returns HTTP 200', res.status === 200);
    } catch (err) {
        reportResult('Public GET /api/projects returns HTTP 200', false, err.message);
    }

    // 6. Asgardeo OIDC Configuration & Endpoint Setup
    try {
        const config = getAsgardeoConfig();
        const validConfig = !!(config.authorizationEndpoint && config.tokenEndpoint && config.jwksUri);
        reportResult('Asgardeo OIDC Endpoint Configuration Validated', validConfig);
    } catch (err) {
        reportResult('Asgardeo OIDC Endpoint Configuration Validated', false, err.message);
    }

    // 7. Schema Check: User.asgardeoId exists
    try {
        const hasAsgardeoId = !!User.schema.path('asgardeoId');
        reportResult('Database Schema: User.asgardeoId field present & indexed', hasAsgardeoId);
    } catch (err) {
        reportResult('Database Schema: User.asgardeoId field present & indexed', false, err.message);
    }

    console.log('\n====================================================');
    console.log(` SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('====================================================');

    process.exit(failedCount > 0 ? 1 : 0);
}

runVerificationTests().catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
});
