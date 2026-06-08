import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const endpoints = [
    '/brands',
    '/campaigns',
    '/campaign-markets',
    '/service-types',
    '/sub-campaign-types?serviceTypeId=1',
    '/objectives',
    '/industry-types',
    '/industry-subtypes?industryTypeId=1',
    '/platforms',
    '/channels',
    '/creatives',
    '/menu',
    '/theme',
    '/users',
    '/cms/landing-page'
];

async function check() {
    console.log('🔍 Checking API Endpoints at ' + BASE_URL);
    let hasError = false;

    for (const ep of endpoints) {
        try {
            const res = await fetch(BASE_URL + ep);
            const contentType = res.headers.get('content-type');

            if (!res.ok) {
                console.error(`❌ ${ep} -> ${res.status} ${res.statusText}`);
                hasError = true;
            } else if (!contentType?.includes('application/json')) {
                console.error(`❌ ${ep} -> Non-JSON response: ${contentType}`);
                // Read body to see if it's HTML
                const text = await res.text();
                console.log(`   Body start: ${text.substring(0, 100)}...`);
                hasError = true;
            } else {
                console.log(`✅ ${ep} -> ${res.status}`);
            }
        } catch (e) {
            console.error(`❌ ${ep} -> Network Error: ${e.message}`);
            hasError = true;
        }
    }

    if (hasError) {
        console.log('\n⚠️ Some endpoints failed. Check logs above.');
        process.exit(1);
    } else {
        console.log('\n✨ All checked endpoints return valid JSON.');
    }
}

check();
