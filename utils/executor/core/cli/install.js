#!/usr/bin/env node

const packageSpec = process.argv[2];
if (!packageSpec) {
    console.error('Usage: install.js <language>[=<version>]');
    process.exit(2);
}

const [language, version = '*'] = packageSpec.split('=');
if (!language || !/^[a-z0-9+#.-]+$/i.test(language)) {
    console.error(`Invalid runtime package: ${packageSpec}`);
    process.exit(2);
}

const baseUrl = process.env.PISTON_URL || 'http://127.0.0.1:2000';
const headers = { 'Content-Type': 'application/json' };
if (process.env.PISTON_KEY) {
    headers.Authorization = process.env.PISTON_KEY;
}

async function install() {
    const response = await fetch(new URL('/api/v2/packages', baseUrl), {
        method: 'POST',
        headers,
        body: JSON.stringify({ language, version }),
        signal: AbortSignal.timeout(300_000),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.message || `Piston returned HTTP ${response.status}`);
    }

    console.log(`Installed ${language} ${version}`);
}

install().catch(error => {
    console.error(`Installation failed for ${packageSpec}: ${error.message}`);
    process.exitCode = 1;
});
