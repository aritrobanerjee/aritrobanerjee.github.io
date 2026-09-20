import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

let token = process.env.CLOUDFLARE_API_TOKEN;
let accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
let siteTag = process.env.CLOUDFLARE_SITE_TAG;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const [k, v] = line.split('=');
    if (k && v) {
      if (k.trim() === 'CLOUDFLARE_API_TOKEN') token = v.trim();
      if (k.trim() === 'CLOUDFLARE_ACCOUNT_ID') accountId = v.trim();
      if (k.trim() === 'CLOUDFLARE_SITE_TAG') siteTag = v.trim();
    }
  });
}

if (!token || !accountId) {
  console.error('Missing Cloudflare API Token or Account ID.');
  process.exit(1);
}

// Default to last 7 days
const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
const endDate = new Date().toISOString().split('T')[0];

const query = `
query GetAnalytics($accountTag: string, $start: string, $end: string) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      summary: rumPageloadEventsAdaptiveGroups(
        filter: { date_geq: $start, date_leq: $end }
        limit: 100
      ) {
        count
        sum { visits }
      }
      pages: rumPageloadEventsAdaptiveGroups(
        filter: { date_geq: $start, date_leq: $end }
        limit: 15
        orderBy: [count_DESC]
      ) {
        count
        sum { visits }
        dimensions { requestPath }
      }
      referrers: rumPageloadEventsAdaptiveGroups(
        filter: { date_geq: $start, date_leq: $end }
        limit: 10
        orderBy: [count_DESC]
      ) {
        count
        sum { visits }
        dimensions { refererHost }
      }
      countries: rumPageloadEventsAdaptiveGroups(
        filter: { date_geq: $start, date_leq: $end }
        limit: 10
        orderBy: [count_DESC]
      ) {
        count
        sum { visits }
        dimensions { countryName }
      }
    }
  }
}
`;

async function fetchStats() {
  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        accountTag: accountId,
        start: startDate,
        end: endDate,
      },
    }),
  });

  const res = await response.json();

  if (res.errors) {
    console.error('GraphQL Errors:', JSON.stringify(res.errors, null, 2));
    return;
  }

  const account = res.data?.viewer?.accounts?.[0];
  if (!account) {
    console.log('No account data found.');
    return;
  }

  let totalPageViews = 0;
  let totalVisits = 0;

  account.summary?.forEach((s) => {
    totalPageViews += s.count || 0;
    totalVisits += s.sum?.visits || 0;
  });

  console.log(`\n========================================`);
  console.log(`📊 Cloudflare Analytics (${startDate} to ${endDate})`);
  console.log(`========================================`);
  console.log(`Total Page Views: ${totalPageViews}`);
  console.log(`Unique Visits:    ${totalVisits}\n`);

  if (account.pages && account.pages.length > 0) {
    console.log(`Top Pages:`);
    console.table(
      account.pages.map((p) => ({
        Path: p.dimensions?.requestPath || '/',
        Views: p.count,
        Visits: p.sum?.visits,
      }))
    );
  } else {
    console.log(`Top Pages: No events logged yet.`);
  }

  if (account.referrers && account.referrers.length > 0) {
    console.log(`\nTop Referrers:`);
    console.table(
      account.referrers.map((r) => ({
        Referrer: r.dimensions?.refererHost || '(direct)',
        Views: r.count,
      }))
    );
  }

  if (account.countries && account.countries.length > 0) {
    console.log(`\nTop Countries:`);
    console.table(
      account.countries.map((c) => ({
        Country: c.dimensions?.countryName || '(unknown)',
        Views: c.count,
      }))
    );
  }
}

fetchStats().catch(console.error);
