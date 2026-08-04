// Watch the desk's buyer party for an incoming token-standard transfer, from any
// registry — the CBTC faucet parks one as a TransferInstruction that the receiver
// must accept. Prints everything needed to accept it: the contract id, the
// instrument, the amount, and whatever the registry put in its metadata (which is
// where a registry API base tends to show up).
//   node scripts/watch-incoming.mjs          # poll until something arrives
//   node scripts/watch-incoming.mjs once     # single look
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENV = Object.fromEntries(
  (await readFile(join(HERE, process.env.ENV_FILE ?? '.env.devnet'), 'utf8')).split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const P = JSON.parse(await readFile(join(HERE, 'devnet.parties.json'), 'utf8'));
const PARTY = process.argv.find((a) => a.includes('::')) ?? P.buyer;

let tok = null, tokAt = 0;
async function token() {
  if (ENV.DEVNET_TOKEN) return ENV.DEVNET_TOKEN.trim();
  if (tok && Date.now() - tokAt < 5 * 60_000) return tok;
  const r = await fetch(ENV.DEVNET_TOKEN_URL, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: ENV.DEVNET_CLIENT_ID,
      client_secret: ENV.DEVNET_CLIENT_SECRET, audience: ENV.DEVNET_AUDIENCE, scope: ENV.DEVNET_SCOPE }),
  });
  tok = (await r.json()).access_token.trim(); tokAt = Date.now();
  return tok;
}
async function api(path, body) {
  const r = await fetch(ENV.DEVNET_LEDGER_URL + path, {
    method: body ? 'POST' : 'GET',
    headers: { authorization: `Bearer ${await token()}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  try { return { status: r.status, d: JSON.parse(t) }; } catch { return { status: r.status, d: t }; }
}

const IFACE = {
  instruction: '#splice-api-token-transfer-instruction-v1:Splice.Api.Token.TransferInstructionV1:TransferInstruction',
  holding: '#splice-api-token-holding-v1:Splice.Api.Token.HoldingV1:Holding',
};
async function byInterface(interfaceId) {
  const off = (await api('/v2/state/ledger-end')).d.offset;
  const r = await api('/v2/state/active-contracts?limit=2000', {
    activeAtOffset: off, verbose: false,
    filter: { filtersByParty: { [PARTY]: { cumulative: [{ identifierFilter: { InterfaceFilter: {
      value: { interfaceId, includeInterfaceView: true, includeCreatedEventBlob: false } } } }] } } },
  });
  if (!Array.isArray(r.d)) throw new Error(`acs ${r.status}: ${JSON.stringify(r.d).slice(0, 200)}`);
  return r.d.map((x) => x.contractEntry?.JsActiveContract?.createdEvent).filter(Boolean);
}

// Instruments this party holds that neither the desk nor the Canton Coin registry issued.
const foreign = (hs) => hs.map((h) => h.interfaceViews?.[0]?.viewValue).filter(Boolean)
  .filter((v) => !String(v.instrumentId.admin).startsWith('tirai-'));

async function look() {
  const pending = await byInterface(IFACE.instruction);
  const holdings = foreign(await byInterface(IFACE.holding));
  const byInst = {};
  for (const v of holdings) byInst[`${v.instrumentId.id} @ ${v.instrumentId.admin.split('::')[0]}`] =
    (byInst[`${v.instrumentId.id} @ ${v.instrumentId.admin.split('::')[0]}`] ?? 0) + Number(v.amount);
  return { pending, byInst };
}

const once = process.argv.includes('once');
console.log(`watching ${PARTY.split('::')[0]} for incoming transfers…`);
for (let i = 0; ; i++) {
  const { pending, byInst } = await look();
  if (pending.length) {
    console.log(`\n${pending.length} pending transfer instruction(s):`);
    for (const c of pending) {
      const v = c.interfaceViews?.[0]?.viewValue ?? {};
      console.log('  contractId :', c.contractId);
      console.log('  templateId :', c.templateId);
      console.log('  view       :', JSON.stringify(v, null, 2).slice(0, 1200));
    }
    break;
  }
  const line = Object.entries(byInst).map(([k, n]) => `${n} ${k}`).join(' · ') || 'none';
  process.stdout.write(`\r[${new Date().toTimeString().slice(0, 8)}] non-desk holdings: ${line}      `);
  if (once) { console.log(); break; }
  await new Promise((r) => setTimeout(r, 15000));
}
