// Tirai DevNet deploy/seed against the shared 5N hackathon validator.
// Reads scripts/.env.devnet (gitignored). Node >= 20.
//   node scripts/devnet.mjs probe
//   node scripts/devnet.mjs upload .daml/dist/tirai-desk-0.1.0.dar
//   node scripts/devnet.mjs allocate
//   node scripts/devnet.mjs seed
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

async function loadEnv() {
  // ENV_FILE picks the target: scripts/.env.devnet (fivenorth, client_credentials)
  // or scripts/.env.hackcanton (hackcanton-01 node, Keycloak password grant).
  const file = process.env.ENV_FILE ?? '.env.devnet';
  const txt = await readFile(join(HERE, file), 'utf8');
  const e = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) e[m[1]] = m[2];
  }
  return e;
}

let ENV, TOKEN, TOKEN_AT = 0;
const L = () => ENV.DEVNET_LEDGER_URL.replace(/\/$/, '');

async function token() {
  // A pre-issued bearer (e.g. grabbed from the wallet UI's browser session when
  // the account is Google-SSO, or the Keycloak cert is expired) — used verbatim,
  // never calling the token endpoint. Refresh it in the env file when it expires.
  if (ENV.DEVNET_TOKEN) return ENV.DEVNET_TOKEN.trim();
  if (TOKEN && Date.now() - TOKEN_AT < 6 * 60 * 1000) return TOKEN; // reuse ~6min
  // Two auth shapes: fivenorth uses client_credentials (M2M secret); the
  // hackcanton-01 node uses a Keycloak password grant (public UI client, no
  // secret) — selected by presence of DEVNET_USERNAME in the env file.
  const body = ENV.DEVNET_USERNAME
    ? new URLSearchParams({
        grant_type: 'password',
        client_id: ENV.DEVNET_CLIENT_ID,
        username: ENV.DEVNET_USERNAME,
        password: ENV.DEVNET_PASSWORD,
        scope: ENV.DEVNET_SCOPE,
      })
    : new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: ENV.DEVNET_CLIENT_ID,
        client_secret: ENV.DEVNET_CLIENT_SECRET,
        audience: ENV.DEVNET_AUDIENCE,
        scope: ENV.DEVNET_SCOPE,
      });
  let lastErr;
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(ENV.DEVNET_TOKEN_URL, {
        method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body,
      });
      const t = await r.text();
      const j = JSON.parse(t);
      if (j.access_token) { TOKEN = j.access_token.trim(); TOKEN_AT = Date.now(); return TOKEN; }
      lastErr = new Error('no access_token: ' + t.slice(0, 120));
    } catch (e) { lastErr = e; }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw lastErr;
}

async function api(path, { method = 'GET', json, raw, contentType, retry = false } = {}) {
  let last;
  for (let i = 0; i < (retry ? 5 : 1); i++) {
    try {
      const t = await token();
      const headers = { authorization: `Bearer ${t}` };
      let body;
      if (json !== undefined) { headers['content-type'] = 'application/json'; body = JSON.stringify(json); }
      else if (raw !== undefined) { headers['content-type'] = contentType ?? 'application/octet-stream'; body = raw; }
      const r = await fetch(L() + path, { method, headers, body });
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch { data = text; }
      if (r.ok || !retry || ![429, 500, 502, 503, 504].includes(r.status)) return { status: r.status, ok: r.ok, data };
      last = `HTTP ${r.status}`;
    } catch (e) { last = e; if (!retry) throw e; }
    await new Promise((res) => setTimeout(res, 1200 * (i + 1)));
  }
  throw new Error('read failed after retries: ' + last);
}

const P = () => 'participant_admin'; // userId is derived from token sub; unused for commands here
const NS = { value: null };

// ---- commands ----
async function probe() {
  const end = await api('/v2/state/ledger-end');
  console.log('ledger-end:', end.status, JSON.stringify(end.data));
  const ver = await api('/v2/version');
  console.log('version:', ver.status, typeof ver.data === 'object' ? ver.data.version : ver.data);
  const parties = await api('/v2/parties');
  const list = parties.data?.partyDetails ?? [];
  console.log('parties:', parties.status, 'count=', list.length);
  for (const p of list.slice(0, 8)) console.log('   ', p.party);
  // who am I / rights
  const me = await api('/v2/users/' + USER);
  console.log(`user ${USER}:`, me.status, JSON.stringify(me.data).slice(0, 200));
  const rights = await api('/v2/users/' + USER + '/rights');
  console.log(`user ${USER} rights:`, rights.status, JSON.stringify(rights.data).slice(0, 400));
}

async function upload(darPath) {
  const bytes = await readFile(join(ROOT, darPath));
  // retry: the shared validator returns 503 (gateway timeout) under load; the
  // package upload + vetting can still need several tries to land a clean 200.
  const r = await api('/v2/packages', { method: 'POST', raw: bytes, retry: true });
  console.log('upload:', r.status, JSON.stringify(r.data).slice(0, 200));
}

// Ledger user id for command submission + rights grants. On fivenorth the shared
// M2M user is "6"; on hackcanton-01 (password grant) it's the Keycloak subject —
// set LEDGER_USER_ID in that env file once `probe` reveals it.
const USER = process.env.LEDGER_USER_ID ?? '6';
// v2 party set — isolates this deployment's (new package) contracts from any
// earlier ones on the shared validator, so party queries return only our data.
const HINTS = {
  buyer: 'tirai-v1-buyer', dealerA: 'tirai-v1-dealerA', dealerB: 'tirai-v1-dealerB',
  regulator: 'tirai-v1-regulator', cashIssuer: 'tirai-v1-cashissuer', bondIssuer: 'tirai-v1-bondissuer',
};

async function namespace() {
  if (NS.value) return NS.value;
  const me = await api('/v2/users/' + USER);
  NS.value = me.data?.user?.primaryParty?.split('::')[1];
  return NS.value;
}

// The parties for whichever node ENV_FILE selects, derived rather than read:
// scripts/devnet.parties.json describes whichever deployment was seeded last, and
// the two Devnet participants have different namespaces — reading it means asking
// one node about another node's parties, which comes back as an opaque
// "security-sensitive error" rather than anything that names the cause.
const partyMap = async () => {
  const ns = await namespace();
  return Object.fromEntries(Object.entries(HINTS).map(([role, hint]) => [role, `${hint}::${ns}`]));
};

async function allocateOne(hint) {
  const r = await api('/v2/parties', { method: 'POST', retry: true, json: { partyIdHint: hint, identityProviderId: '' } });
  if (r.status === 200) return r.data?.partyDetails?.party;
  const cause = JSON.stringify(r.data);
  if (cause.includes('already allocated') || cause.includes('already exists')) {
    return `${hint}::${await namespace()}`; // idempotent on the shared namespace
  }
  // On a node where party allocation is admin-only (hackcanton-01), the operator
  // allocates the parties for us and we simply address them: same participant
  // namespace, same hints. Assume that rather than failing the whole run.
  if (r.status === 403) {
    // Say so: if the operator has NOT allocated this hint, the party id below is
    // fiction and the first submit fails with UNKNOWN_INFORMEES, which blames the
    // synchronizer rather than the missing party.
    console.log(`  ${hint}: allocation is admin-only here — assuming the operator allocated it`);
    return `${hint}::${await namespace()}`;
  }
  console.log('  allocate failed for', hint, r.status, cause.slice(0, 160));
  return null;
}

async function grant(party) {
  const r = await api(`/v2/users/${USER}/rights`, { method: 'POST', json: {
    userId: USER,
    identityProviderId: '',
    rights: [
      { kind: { CanActAs: { value: { party } } } },
      { kind: { CanReadAs: { value: { party } } } },
    ],
  } });
  if (r.status !== 200 && process.env.DEBUG) console.log('  grant body:', JSON.stringify(r.data).slice(0, 300));
  // 403 = rights are admin-managed on this node; the operator granted them with
  // the parties. Nothing to do here — the first submit proves it either way.
  return r.status === 403 ? 'admin' : r.status;
}

async function allocate() {
  const out = {};
  for (const [role, hint] of Object.entries(HINTS)) {
    const party = await allocateOne(hint);
    if (!party) continue;
    const gs = await grant(party);
    out[role] = party;
    console.log(`${role.padEnd(11)} ${party}   grant=${gs}`);
  }
  await writeFile(join(HERE, 'devnet.parties.json'), JSON.stringify(out, null, 2));
  console.log('wrote scripts/devnet.parties.json');
}

// Main package id of .daml/dist/tirai-desk-0.1.0.dar. Regenerate after a model change
// with: daml damlc inspect-dar --json .daml/dist/tirai-desk-0.1.0.dar  (or set TIRAI_PKG).
const PKG = process.env.TIRAI_PKG ?? '4b1e408f6eda27364a55da076d9251ee117f0641f03aaf20883995f1e507a7e3';
let CID = 0;
// `disclosed` carries a registry's off-ledger contracts (token-standard choice
// contexts); `effects` asks for the ledger-effects shape, the only one whose
// response includes exercise results — that is how the registry hands an
// Allocation contract id back.
async function submit(actAs, command, { disclosed = [], effects = false } = {}) {
  const commandId = `tirai-${Date.now()}-${CID++}`; // stable across retries → dedup on the ledger
  let last;
  for (let i = 0; i < 6; i++) {
    let r;
    try {
      r = await api('/v2/commands/submit-and-wait-for-transaction', { method: 'POST', json: {
      commands: { userId: USER, commandId, actAs: [actAs], commands: [command], disclosedContracts: disclosed },
      ...(effects ? { transactionFormat: {
        eventFormat: { filtersByParty: { [actAs]: { cumulative: [{ identifierFilter: { WildcardFilter: { value: { includeCreatedEventBlob: false } } } }] } }, verbose: false },
        transactionShape: 'TRANSACTION_SHAPE_LEDGER_EFFECTS',
      } } : {}),
      } });
    } catch (e) {
      // A dropped connection is exactly what the stable commandId exists for:
      // retry it rather than aborting the seeder mid-book.
      last = `submit transport: ${e.message}`;
      process.stdout.write(' (retry transport)');
      await new Promise((res) => setTimeout(res, 2000 * (i + 1)));
      continue;
    }
    if (r.ok) return r.data;
    last = `submit ${r.status}: ${JSON.stringify(r.data).slice(0, 200)}`;
    // A duplicate means the ORIGINAL submit already committed on-ledger but its HTTP
    // response was lost — retrying the same commandId 409s forever. Stop immediately
    // with a clear message; the idempotent seeders skip the completed work on rerun.
    if (/DUPLICATE_COMMAND/i.test(last))
      throw new Error('command already committed (response lost) — rerun the idempotent seed to continue. ' + last);
    // Same situation seen from the other side: we are RETRYING, and the contract we
    // meant to exercise is already archived — so the lost-response attempt did land.
    // The intended effect happened; treat it as done instead of failing the run.
    if (i > 0 && /UNKNOWN_CONTRACT|been archived|CONTRACT_NOT_FOUND/i.test(last)) {
      process.stdout.write(' (already applied)');
      return null;
    }
    // 409 SEQUENCER_BACKPRESSURE = transient overload on the shared validator.
    if (![409, 503, 429, 500, 502, 504].includes(r.status)) throw new Error(last);
    process.stdout.write(` (retry ${r.status})`);
    await new Promise((res) => setTimeout(res, 2000 * (i + 1)));
  }
  throw new Error('gave up: ' + last);
}
const createHolding = (issuer, owner, instrument, amount) =>
  ({ CreateCommand: { templateId: `${PKG}:Tirai:Holding`, createArguments: { issuer, owner, instrument, amount: String(amount) } } });

// `tx` is null when submit() decided a lost response had already landed; the
// caller then has no contract id and must re-read the ACS rather than crash.
const cidOf = (tx) => tx?.transaction?.events?.find((e) => e.CreatedEvent)?.CreatedEvent?.contractId;
// A SubmitQuote tx creates both an EscrowedHolding and a Quote — pick by template.
const cidOfTpl = (tx, suffix) => (tx?.transaction?.events ?? [])
  .map((e) => e.CreatedEvent).filter(Boolean)
  .find((c) => c.templateId?.endsWith(suffix))?.contractId;

async function parties() {
  const out = {};
  for (const [role, hint] of Object.entries(HINTS)) {
    const p = await allocateOne(hint);
    await grant(p);
    out[role] = p;
  }
  return out;
}

async function seed() {
  const p = await parties();
  console.log('parties ready:');
  for (const [r, v] of Object.entries(p)) console.log('  ', r.padEnd(11), v);

  // Idempotent: if this party set already has a live RFQ, don't double-seed.
  const existing = (await acsAs(p.buyer)).filter((e) => e.templateId.endsWith(':Tirai:RFQ'));
  if (existing.length) {
    await writeFile(join(HERE, 'devnet.parties.json'), JSON.stringify(p, null, 2));
    console.log(`already seeded (${existing.length} live RFQ) — run "cleanup" or use fresh party hints to reseed.`);
    return;
  }

  const cash = cidOf(await submit(p.cashIssuer, createHolding(p.cashIssuer, p.buyer, 'USDC', '5000000.0')));
  const bondA = cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, p.dealerA, 'TBOND30', '1000.0')));
  const bondB = cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, p.dealerB, 'TBOND30', '1000.0')));
  console.log('minted holdings (cash + 2 bonds)');

  const rfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:RFQ`, createArguments: {
    buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB],
    instrument: 'TBOND30', quantity: '1000.0', payInstrument: 'USDC',
    assetIssuer: p.bondIssuer, payIssuer: p.cashIssuer,
    deadline: '2030-01-01T00:00:00Z' } } }));
  console.log('RFQ live:', rfq.slice(0, 24) + '…');

  const quote = (dealer, price, assetCid) => ({ ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`,
    contractId: rfq, choice: 'SubmitQuote', choiceArgument: { dealer, price, assetCid } } });
  await submit(p.dealerA, quote(p.dealerA, '4210000.0', bondA));
  await submit(p.dealerB, quote(p.dealerB, '4250000.0', bondB));
  console.log('two sealed quotes submitted (A: 4.21M, B: 4.25M)');

  await writeFile(join(HERE, 'devnet.parties.json'), JSON.stringify(p, null, 2));
  console.log('\nwrote scripts/devnet.parties.json — point the web UI at DevNet and open it.');
}

// Every template the desk defines. A wildcard ACS read for a busy party now
// exceeds the node's hard 200-element response cap (it is not a query parameter),
// so the read is split per template and re-joined.
const TEMPLATES = ['Holding', 'EscrowedHolding', 'RFQ', 'Quote', 'QuoteDisclosure', 'TradeReport',
  'TokenTrade', 'BasketRFQ', 'BasketQuote', 'BasketTradeReport'];

async function acsAs(party) {
  const off = (await api('/v2/state/ledger-end', { retry: true })).data?.offset;
  if (typeof off !== 'number') throw new Error('ledger-end returned no offset (devnet unreachable?)');
  const out = [];
  for (const tpl of TEMPLATES) {
    const r = await api('/v2/state/active-contracts', { method: 'POST', retry: true, json: {
      filter: { filtersByParty: { [party]: { cumulative: [{ identifierFilter: {
        // Template filters take the package NAME; a package id is rejected here.
        TemplateFilter: { value: { templateId: `#tirai-desk:Tirai:${tpl}`, includeCreatedEventBlob: false } },
      } }] } } },
      verbose: true, activeAtOffset: off } });
    if (!Array.isArray(r.data)) throw new Error(`active-contracts (${tpl}) returned no array: ` + JSON.stringify(r.data).slice(0, 120));
    out.push(...r.data.map((x) => x.contractEntry?.JsActiveContract?.createdEvent).filter(Boolean));
  }
  return out;
}

async function verify() {
  // Read-only on purpose: going through parties() would make a *check* allocate
  // parties and grant rights as a side effect.
  const p = await partyMap();
  const acs = {};
  for (const role of ['buyer', 'dealerA', 'dealerB', 'regulator']) acs[role] = await acsAs(p[role]);
  const quotesOf = (role) => acs[role].filter((e) => e.templateId.endsWith(':Tirai:Quote'));
  // A green tick on an empty read is worse than a red one: pointing the deployer at
  // the wrong node, or at a namespace with no desk on it, must not look like proof.
  const nothingThere = !acs.buyer.length && !acs.dealerA.length && !acs.regulator.length;
  for (const role of ['buyer', 'dealerA', 'dealerB', 'regulator']) {
    const byTpl = {};
    for (const e of acs[role]) { const t = e.templateId.split(':').slice(-1)[0]; byTpl[t] = (byTpl[t] ?? 0) + 1; }
    const q = quotesOf(role).map((e) => e.createArgument.dealer.split('::')[0]);
    console.log(role.padEnd(11), JSON.stringify(byTpl), q.length ? 'quotes from: ' + q.join(',') : '');
  }
  // Assert the privacy invariants the desk claims — a real pass/fail, not just a dump.
  const fails = [];
  for (const d of ['dealerA', 'dealerB']) {
    const rival = quotesOf(d).filter((e) => e.createArgument.dealer !== p[d]);
    if (rival.length) fails.push(`${d} received ${rival.length} rival quote(s) — sub-transaction privacy broken`);
  }
  const regQuotes = quotesOf('regulator').length;
  const regRfq = acs.regulator.filter((e) => e.templateId.endsWith(':Tirai:RFQ') || e.templateId.endsWith(':Tirai:BasketRFQ')).length;
  if (regQuotes) fails.push(`regulator sees ${regQuotes} sealed quote(s) — must see none pre-trade`);
  if (regRfq) fails.push(`regulator sees ${regRfq} live RFQ(s) — must see none pre-trade`);
  if (nothingThere) fails.push('read nothing at all — wrong node, wrong namespace, or nothing deployed here');
  if (fails.length) { console.error('\n✗ PRIVACY VERIFICATION FAILED:\n  ' + fails.join('\n  ')); process.exit(1); }
  console.log('\n✓ privacy verified on-ledger: each dealer sees only its own quotes; the regulator sees zero pre-trade.');
}

// Add ONE prior settled trade (a separate instrument, GILT10) to the live desk, so
// the regulator's post-trade audit column isn't empty — it proves the "regulator
// observes executed trades, and only executed trades" half of the story on Devnet.
// Idempotent: skips if the regulator already sees a TradeReport.
async function settleDemo() {
  const p = await partyMap();
  const regEv = await acsAs(p.regulator);
  if (regEv.some((e) => e.templateId.endsWith(':Tirai:TradeReport'))) {
    console.log('regulator already has a settled trade — nothing to do.');
    return;
  }
  const inst = 'GILT10';
  // Dedicated 195000 cash so the buyer's 5M TBOND30 float stays intact (exact clear = no change).
  const cash = cidOf(await submit(p.cashIssuer, createHolding(p.cashIssuer, p.buyer, 'USDC', '195000.0')));
  const gA = cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, p.dealerA, inst, '100.0')));
  const gB = cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, p.dealerB, inst, '100.0')));
  const rfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:RFQ`, createArguments: {
    buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB],
    instrument: inst, quantity: '100.0', payInstrument: 'USDC',
    assetIssuer: p.bondIssuer, payIssuer: p.cashIssuer, deadline: '2030-01-01T00:00:00Z' } } }));
  const quote = (dealer, price, assetCid) => ({ ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`,
    contractId: rfq, choice: 'SubmitQuote', choiceArgument: { dealer, price, assetCid } } });
  const qA = cidOfTpl(await submit(p.dealerA, quote(p.dealerA, '190000.0', gA)), ':Tirai:Quote');
  const qB = cidOfTpl(await submit(p.dealerB, quote(p.dealerB, '195000.0', gB)), ':Tirai:Quote');
  // Cheapest (A) wins, paid the second price (195000) — atomic DvP; TradeReport → regulator.
  await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: rfq,
    choice: 'Award', choiceArgument: { quoteCids: [qA, qB], cashCid: cash } } });
  console.log('settled GILT10 100 @ 195000 (Vickrey) — regulator now sees one executed trade.');
}

// Archive duplicate buyer USDC holdings left by 503-retries; keep exactly one.
async function cleanup() {
  const p = await partyMap();
  const ev = await acsAs(p.buyer);
  const cash = ev.filter((e) => e.templateId.endsWith(':Tirai:Holding')
    && e.createArgument.owner === p.buyer && e.createArgument.instrument === 'USDC');
  console.log('buyer USDC holdings:', cash.length);
  for (const c of cash.slice(1)) {
    await submit(p.cashIssuer, { ExerciseCommand: { templateId: `${PKG}:Tirai:Holding`,
      contractId: c.contractId, choice: 'Archive', choiceArgument: {} } });
    console.log('  archived duplicate', c.contractId.slice(0, 18) + '…');
  }
  console.log('done — buyer now holds one USDC position');
}

// Seed a live multi-instrument BASKET (TBOND30 + GILT10) with two sealed basket
// quotes, un-settled, so the hosted desk showcases the basket lane on Devnet.
// Mints fresh legs (the dealers' original bonds are escrowed in the single RFQ).
// Idempotent: skips if the buyer already sees a BasketRFQ.
async function seedBasket() {
  const p = await partyMap();
  if ((await acsAs(p.buyer)).some((e) => e.templateId.endsWith(':Tirai:BasketRFQ'))) {
    console.log('basket already seeded — nothing to do.');
    return;
  }
  const legs = [
    { instrument: 'TBOND30', quantity: '1000.0', assetIssuer: p.bondIssuer },
    { instrument: 'GILT10', quantity: '100.0', assetIssuer: p.bondIssuer },
  ];
  const mkAssets = async (dealer) => [
    cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, dealer, 'TBOND30', '1000.0'))),
    cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, dealer, 'GILT10', '100.0'))),
  ];
  const aAssets = await mkAssets(p.dealerA);
  const bAssets = await mkAssets(p.dealerB);
  const rfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, createArguments: {
    buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB],
    legs, payInstrument: 'USDC', payIssuer: p.cashIssuer, deadline: '2030-01-01T00:00:00Z' } } }));
  const bq = (dealer, price, assetCids) => ({ ExerciseCommand: { templateId: `${PKG}:Tirai:BasketRFQ`,
    contractId: rfq, choice: 'SubmitBasketQuote', choiceArgument: { dealer, price, assetCids } } });
  await submit(p.dealerA, bq(p.dealerA, '4400000.0', aAssets));
  await submit(p.dealerB, bq(p.dealerB, '4450000.0', bAssets));
  console.log('basket RFQ live with two sealed basket quotes (A 4.40M, B 4.45M).');
}

// Seed a spread of REALISTIC settled trades across instruments and settlement
// modes (Vickrey, direct OTC, partial fill, basket), so the regulator's on-chain
// audit trail on the hosted desk looks like a real desk's post-trade record.
// Idempotent per instrument. Institutional tickers, block-size notionals in USD.
async function seedCases() {
  const p = await partyMap();
  const reg = await acsAs(p.regulator);
  const doneInst = new Set(reg.filter((e) => e.templateId.endsWith(':Tirai:TradeReport')).map((e) => e.createArgument.instrument));
  const doneBasket = reg.filter((e) => e.templateId.endsWith(':Tirai:BasketTradeReport')).length >= 1;

  const cash = async (amt) => cidOf(await submit(p.cashIssuer, createHolding(p.cashIssuer, p.buyer, 'USDC', amt)));
  const bond = async (owner, inst, qty) => cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, owner, inst, qty)));
  const mkRfq = async (inst, qty) => cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:RFQ`, createArguments: {
    buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB],
    instrument: inst, quantity: qty, payInstrument: 'USDC', assetIssuer: p.bondIssuer, payIssuer: p.cashIssuer,
    deadline: '2030-01-01T00:00:00Z' } } }));
  const quote = async (dealer, rfq, price, assetCid) => cidOfTpl(await submit(dealer, { ExerciseCommand: {
    templateId: `${PKG}:Tirai:RFQ`, contractId: rfq, choice: 'SubmitQuote', choiceArgument: { dealer, price, assetCid } } }), ':Tirai:Quote');
  const onQuote = (qCid, choice, arg) => submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:Quote`, contractId: qCid, choice, choiceArgument: arg } });
  // A third dealer for the 3-dealer Vickrey cases (idempotent allocation).
  const dealerC = await allocateOne('tirai-v1-dealerC'); await grant(dealerC);
  // Helpers: run a full 2- or 3-dealer Vickrey and settle it.
  const vickrey2 = async (inst, qty, pA, pB, cashAmt) => {
    const c = await cash(cashAmt); const bA = await bond(p.dealerA, inst, qty); const bB = await bond(p.dealerB, inst, qty);
    const rfq = await mkRfq(inst, qty); const qA = await quote(p.dealerA, rfq, pA, bA); const qB = await quote(p.dealerB, rfq, pB, bB);
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: rfq, choice: 'Award', choiceArgument: { quoteCids: [qA, qB], cashCid: c } } });
  };
  const vickrey3 = async (inst, qty, pA, pB, pC, cashAmt) => {
    const c = await cash(cashAmt); const bA = await bond(p.dealerA, inst, qty); const bB = await bond(p.dealerB, inst, qty); const bC = await bond(dealerC, inst, qty);
    const rfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:RFQ`, createArguments: {
      buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB, dealerC],
      instrument: inst, quantity: qty, payInstrument: 'USDC', assetIssuer: p.bondIssuer, payIssuer: p.cashIssuer, deadline: '2030-01-01T00:00:00Z' } } }));
    const qA = await quote(p.dealerA, rfq, pA, bA); const qB = await quote(p.dealerB, rfq, pB, bB); const qC = await quote(dealerC, rfq, pC, bC);
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: rfq, choice: 'Award', choiceArgument: { quoteCids: [qA, qB, qC], cashCid: c } } });
  };
  const directOtc = async (inst, qty, price, cashAmt) => {
    const c = await cash(cashAmt); const bA = await bond(p.dealerA, inst, qty);
    const rfq = await mkRfq(inst, qty); const qA = await quote(p.dealerA, rfq, price, bA);
    await onQuote(qA, 'SettleQuote', { cashCid: c, clearingPrice: price });
  };
  const partial = async (inst, qty, price, fill, cashAmt) => {
    const c = await cash(cashAmt); const bA = await bond(p.dealerA, inst, qty);
    const rfq = await mkRfq(inst, qty); const qA = await quote(p.dealerA, rfq, price, bA);
    await onQuote(qA, 'AcceptPartial', { cashCid: c, fillQuantity: fill });
  };
  const basketTrade = async (legDefs, price, cashAmt) => {
    const c = await cash(cashAmt);
    const assetCids = []; for (const [inst, qty] of legDefs) assetCids.push(await bond(p.dealerA, inst, qty));
    const legs = legDefs.map(([inst, qty]) => ({ instrument: inst, quantity: qty, assetIssuer: p.bondIssuer }));
    const brfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, createArguments: {
      buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB], legs, payInstrument: 'USDC', payIssuer: p.cashIssuer, deadline: '2030-01-01T00:00:00Z' } } }));
    const bq = cidOfTpl(await submit(p.dealerA, { ExerciseCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, contractId: brfq, choice: 'SubmitBasketQuote', choiceArgument: { dealer: p.dealerA, price, assetCids } } }), ':Tirai:BasketQuote');
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:BasketQuote`, contractId: bq, choice: 'SettleBasket', choiceArgument: { cashCid: c } } });
  };

  // 1 · Competitive Vickrey (2 dealers): German Bund 10Y, A 490k / B 495k → A paid the 2nd price 495k.
  if (!doneInst.has('BUND10')) {
    const c = await cash('600000.0'); const bA = await bond(p.dealerA, 'BUND10', '500.0'); const bB = await bond(p.dealerB, 'BUND10', '500.0');
    const rfq = await mkRfq('BUND10', '500.0');
    const qA = await quote(p.dealerA, rfq, '490000.0', bA); const qB = await quote(p.dealerB, rfq, '495000.0', bB);
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: rfq, choice: 'Award', choiceArgument: { quoteCids: [qA, qB], cashCid: c } } });
    console.log('· Vickrey     BUND10  500 @ 495,000 (2 dealers, 2nd price)');
  }
  // 2 · Direct bilateral OTC (settle at ask): US Treasury 2Y, 2,000 @ 1.98M.
  if (!doneInst.has('UST2Y')) {
    const c = await cash('1980000.0'); const bA = await bond(p.dealerA, 'UST2Y', '2000.0');
    const rfq = await mkRfq('UST2Y', '2000.0'); const qA = await quote(p.dealerA, rfq, '1980000.0', bA);
    await onQuote(qA, 'SettleQuote', { cashCid: c, clearingPrice: '1980000.0' });
    console.log('· direct OTC  UST2Y  2000 @ 1,980,000 (at ask)');
  }
  // 3 · Partial fill: Apple 2030 corp, ask 520k on 500, buyer fills 300 → 312,000 prorated.
  if (!doneInst.has('AAPL30')) {
    const c = await cash('520000.0'); const bA = await bond(p.dealerA, 'AAPL30', '500.0');
    const rfq = await mkRfq('AAPL30', '500.0'); const qA = await quote(p.dealerA, rfq, '520000.0', bA);
    await onQuote(qA, 'AcceptPartial', { cashCid: c, fillQuantity: '300.0' });
    console.log('· partial     AAPL30 300/500 @ 312,000 (prorated ask)');
  }
  // 4 · Multi-instrument basket settled: [US Treasury 10Y ×1000 + JPMorgan 2028 ×200] @ 2.30M.
  if (!doneBasket) {
    const c = await cash('2300000.0'); const t = await bond(p.dealerA, 'UST10Y', '1000.0'); const j = await bond(p.dealerA, 'JPM28', '200.0');
    const legs = [{ instrument: 'UST10Y', quantity: '1000.0', assetIssuer: p.bondIssuer }, { instrument: 'JPM28', quantity: '200.0', assetIssuer: p.bondIssuer }];
    const brfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, createArguments: {
      buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB], legs, payInstrument: 'USDC', payIssuer: p.cashIssuer, deadline: '2030-01-01T00:00:00Z' } } }));
    const bq = cidOfTpl(await submit(p.dealerA, { ExerciseCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, contractId: brfq,
      choice: 'SubmitBasketQuote', choiceArgument: { dealer: p.dealerA, price: '2300000.0', assetCids: [t, j] } } }), ':Tirai:BasketQuote');
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:BasketQuote`, contractId: bq, choice: 'SettleBasket', choiceArgument: { cashCid: c } } });
    console.log('· basket      [UST10Y 1000 + JPM28 200] @ 2,300,000 (atomic multi-leg)');
  }
  // 5 · Three-dealer Vickrey (proves 3+ competing dealers on-chain): US Treasury 5Y.
  if (!doneInst.has('UST5Y')) {
    await vickrey3('UST5Y', '1500.0', '1470000.0', '1485000.0', '1500000.0', '1500000.0');
    console.log('· Vickrey×3   UST5Y 1500 @ 1,485,000 (3 dealers, 2nd price)');
  }
  // 6 · Direct OTC: Microsoft 2029 corp, 400 @ 410,000 (at ask).
  if (!doneInst.has('MSFT29')) {
    const c = await cash('410000.0'); const bA = await bond(p.dealerA, 'MSFT29', '400.0');
    const rfq = await mkRfq('MSFT29', '400.0'); const qA = await quote(p.dealerA, rfq, '410000.0', bA);
    await onQuote(qA, 'SettleQuote', { cashCid: c, clearingPrice: '410000.0' });
    console.log('· direct OTC  MSFT29 400 @ 410,000');
  }
  // 7 · Partial fill: Mexico 2034 sovereign, ask 950k on 1000, buyer fills 600 → 570,000.
  if (!doneInst.has('MEX34')) {
    const c = await cash('950000.0'); const bA = await bond(p.dealerA, 'MEX34', '1000.0');
    const rfq = await mkRfq('MEX34', '1000.0'); const qA = await quote(p.dealerA, rfq, '950000.0', bA);
    await onQuote(qA, 'AcceptPartial', { cashCid: c, fillQuantity: '600.0' });
    console.log('· partial     MEX34 600/1000 @ 570,000');
  }
  // 8 · Second basket settled: [UK Gilt 30Y ×500 + German Bund 5Y ×300] @ 1.80M.
  if (reg.filter((e) => e.templateId.endsWith(':Tirai:BasketTradeReport')).length < 2) {
    const c = await cash('1800000.0'); const g = await bond(p.dealerA, 'GILT30', '500.0'); const bu = await bond(p.dealerA, 'BUND5Y', '300.0');
    const legs = [{ instrument: 'GILT30', quantity: '500.0', assetIssuer: p.bondIssuer }, { instrument: 'BUND5Y', quantity: '300.0', assetIssuer: p.bondIssuer }];
    const brfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, createArguments: { buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB], legs, payInstrument: 'USDC', payIssuer: p.cashIssuer, deadline: '2030-01-01T00:00:00Z' } } }));
    const bq = cidOfTpl(await submit(p.dealerA, { ExerciseCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, contractId: brfq, choice: 'SubmitBasketQuote', choiceArgument: { dealer: p.dealerA, price: '1800000.0', assetCids: [g, bu] } } }), ':Tirai:BasketQuote');
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:BasketQuote`, contractId: bq, choice: 'SettleBasket', choiceArgument: { cashCid: c } } });
    console.log('· basket      [GILT30 500 + BUND5Y 300] @ 1,800,000');
  }
  // 9 · Vickrey: Alphabet 2031 corp, A 255k / B 260k → A paid 260k.
  if (!doneInst.has('GOOGL31')) {
    const c = await cash('300000.0'); const bA = await bond(p.dealerA, 'GOOGL31', '250.0'); const bB = await bond(p.dealerB, 'GOOGL31', '250.0');
    const rfq = await mkRfq('GOOGL31', '250.0'); const qA = await quote(p.dealerA, rfq, '255000.0', bA); const qB = await quote(p.dealerB, rfq, '260000.0', bB);
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: rfq, choice: 'Award', choiceArgument: { quoteCids: [qA, qB], cashCid: c } } });
    console.log('· Vickrey     GOOGL31 250 @ 260,000');
  }
  // 10 · Vickrey: Japan Government Bond 10Y, A 1.960M / B 1.975M → A paid 1.975M.
  if (!doneInst.has('JGB10Y')) { await vickrey2('JGB10Y', '2000.0', '1960000.0', '1975000.0', '2000000.0'); console.log('· Vickrey     JGB10Y 2000 @ 1,975,000'); }
  // 11 · Direct OTC: France OAT 10Y, 600 @ 615,000 (at ask).
  if (!doneInst.has('OAT10Y')) { await directOtc('OAT10Y', '600.0', '615000.0', '615000.0'); console.log('· direct OTC  OAT10Y 600 @ 615,000'); }
  // 12 · Partial fill: Brazil 2033 sovereign, ask 720k on 800, buyer fills 500 → 450,000.
  if (!doneInst.has('BRAZIL33')) { await partial('BRAZIL33', '800.0', '720000.0', '500.0', '500000.0'); console.log('· partial     BRAZIL33 500/800 @ 450,000'); }
  // 13 · Three-dealer Vickrey: Tesla 2030 corp, A 310k / B 315k / C 320k → A paid 315k.
  if (!doneInst.has('TSLA30')) { await vickrey3('TSLA30', '300.0', '310000.0', '315000.0', '320000.0', '320000.0'); console.log('· Vickrey×3   TSLA30 300 @ 315,000 (3 dealers)'); }
  // 14 · Third basket settled: [France OAT 30Y ×400 + Japan JGB 5Y ×600] @ 1.05M.
  if (reg.filter((e) => e.templateId.endsWith(':Tirai:BasketTradeReport')).length < 3) {
    await basketTrade([['OAT30', '400.0'], ['JGB5Y', '600.0']], '1050000.0', '1050000.0');
    console.log('· basket      [OAT30 400 + JGB5Y 600] @ 1,050,000');
  }

  // ── Extended spread — a broader institutional book on-chain (idempotent per instrument) ──
  // More sovereigns (developed markets)
  if (!doneInst.has('CAN10Y'))  { await vickrey2('CAN10Y', '1000.0', '985000.0', '992000.0', '1000000.0');           console.log('· Vickrey     CAN10Y 1000 @ 992,000 (Canada, 2nd price)'); }
  if (!doneInst.has('ACGB10Y')) { await directOtc('ACGB10Y', '800.0', '824000.0', '824000.0');                       console.log('· direct OTC  ACGB10Y 800 @ 824,000 (Australia)'); }
  if (!doneInst.has('DSL10Y'))  { await partial('DSL10Y', '1500.0', '1470000.0', '900.0', '1470000.0');              console.log('· partial     DSL10Y 900/1500 @ 882,000 (Netherlands)'); }
  if (!doneInst.has('CONF10Y')) { await vickrey3('CONF10Y', '600.0', '588000.0', '594000.0', '600000.0', '600000.0'); console.log('· Vickrey×3   CONF10Y 600 @ 594,000 (Switzerland, 3 dealers)'); }
  if (!doneInst.has('KTB10Y'))  { await directOtc('KTB10Y', '2000.0', '1940000.0', '1940000.0');                     console.log('· direct OTC  KTB10Y 2000 @ 1,940,000 (Korea)'); }
  if (!doneInst.has('SGS10Y'))  { await vickrey2('SGS10Y', '1000.0', '978000.0', '985000.0', '1000000.0');           console.log('· Vickrey     SGS10Y 1000 @ 985,000 (Singapore)'); }
  // Supranationals / agencies
  if (!doneInst.has('IBRD28'))  { await vickrey2('IBRD28', '1500.0', '1485000.0', '1492000.0', '1500000.0');         console.log('· Vickrey     IBRD28 1500 @ 1,492,000 (World Bank)'); }
  if (!doneInst.has('EIB30'))   { await directOtc('EIB30', '1000.0', '990000.0', '990000.0');                        console.log('· direct OTC  EIB30 1000 @ 990,000 (EIB)'); }
  if (!doneInst.has('KFW27'))   { await partial('KFW27', '2000.0', '1960000.0', '1200.0', '1960000.0');              console.log('· partial     KFW27 1200/2000 @ 1,176,000 (KfW)'); }
  // More corporates
  if (!doneInst.has('AMZN32'))  { await vickrey3('AMZN32', '400.0', '408000.0', '414000.0', '420000.0', '420000.0'); console.log('· Vickrey×3   AMZN32 400 @ 414,000 (Amazon, 3 dealers)'); }
  if (!doneInst.has('NVDA34'))  { await directOtc('NVDA34', '300.0', '318000.0', '318000.0');                        console.log('· direct OTC  NVDA34 300 @ 318,000 (Nvidia)'); }
  if (!doneInst.has('GS30'))    { await partial('GS30', '500.0', '505000.0', '350.0', '505000.0');                   console.log('· partial     GS30 350/500 @ 353,500 (Goldman Sachs)'); }
  // EM sovereigns
  if (!doneInst.has('INGB33'))  { await vickrey2('INGB33', '1000.0', '910000.0', '925000.0', '1000000.0');           console.log('· Vickrey     INGB33 1000 @ 925,000 (India)'); }
  if (!doneInst.has('INDON34')) { await directOtc('INDON34', '800.0', '760000.0', '760000.0');                       console.log('· direct OTC  INDON34 800 @ 760,000 (Indonesia)'); }
  // 4th basket — a 3-leg European-periphery package (more legs = more detail on-chain)
  if (reg.filter((e) => e.templateId.endsWith(':Tirai:BasketTradeReport')).length < 4) {
    await basketTrade([['SPGB5Y', '500.0'], ['BTP5Y', '400.0'], ['OLO5Y', '300.0']], '1180000.0', '1180000.0');
    console.log('· basket3     [SPGB5Y 500 + BTP5Y 400 + OLO5Y 300] @ 1,180,000 (3-leg periphery)');
  }
  // 5th basket — an Asia package
  if (reg.filter((e) => e.templateId.endsWith(':Tirai:BasketTradeReport')).length < 5) {
    await basketTrade([['KTB5Y', '1000.0'], ['SGS5Y', '800.0']], '1750000.0', '1750000.0');
    console.log('· basket      [KTB5Y 1000 + SGS5Y 800] @ 1,750,000 (Asia)');
  }

  // Extra OPEN RFQs on-chain (real un-settled data): the buyer holds several live
  // requests at once, each with two sealed quotes.
  const openInst = new Set((await acsAs(p.buyer)).filter((e) => e.templateId.endsWith(':Tirai:RFQ')).map((e) => e.createArgument.instrument));
  const openRfq = async (inst, qty, pA, pB) => {
    if (openInst.has(inst)) return;
    const bA = await bond(p.dealerA, inst, qty); const bB = await bond(p.dealerB, inst, qty);
    const rfq = await mkRfq(inst, qty);
    await quote(p.dealerA, rfq, pA, bA); await quote(p.dealerB, rfq, pB, bB);
    console.log(`· open RFQ    ${inst} ${qty} (2 sealed quotes, un-settled)`);
  };
  await openRfq('UST30Y', '800.0', '3800000.0', '3820000.0');
  await openRfq('BUND30', '400.0', '1900000.0', '1920000.0');
  await openRfq('JGB30Y', '1000.0', '2400000.0', '2415000.0');
  await openRfq('OAT5Y', '700.0', '710000.0', '715000.0');

  // Tidy: direct-OTC and partial settles archive the winning Quote, not the RFQ,
  // and SettleBasket archives the BasketQuote, not the BasketRFQ — so those shells
  // linger with no live quotes. Cancel/archive any quote-less RFQ or basket RFQ.
  const buyerNow = await acsAs(p.buyer);
  const withQuotes = new Set(buyerNow.filter((e) => e.templateId.endsWith(':Tirai:Quote')).map((e) => e.createArgument.rfqId).filter(Boolean));
  for (const r of buyerNow.filter((e) => e.templateId.endsWith(':Tirai:RFQ'))) {
    if (!withQuotes.has(r.contractId)) {
      await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: r.contractId, choice: 'CancelRFQ', choiceArgument: {} } });
      console.log(`· tidied orphan RFQ ${r.createArgument.instrument}`);
    }
  }
  // BasketRFQ has no cancel choice, but the buyer is its sole signatory → the
  // built-in Archive choice tidies the settled-basket shells (no redeploy needed).
  const withBQuotes = new Set(buyerNow.filter((e) => e.templateId.endsWith(':Tirai:BasketQuote')).map((e) => e.createArgument.rfqId).filter(Boolean));
  for (const r of buyerNow.filter((e) => e.templateId.endsWith(':Tirai:BasketRFQ'))) {
    if (!withBQuotes.has(r.contractId)) {
      await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, contractId: r.contractId, choice: 'Archive', choiceArgument: {} } });
      console.log('· tidied orphan BasketRFQ');
    }
  }

  console.log('\nseed-cases done — the regulator now audits a spread of real settlement types on-chain.');
}

// Auctions where the buyer selectively DISCLOSES both competing sealed asks to the
// regulator before awarding — so the hosted "Provable best execution" view and the
// MCP best_execution tool show real, green attestations on live Devnet data. One per
// fresh institutional instrument; idempotent (skips any already settled).
async function seedBestExec() {
  const p = await partyMap();
  const reg = await acsAs(p.regulator);
  const done = new Set(reg.filter((e) => e.templateId.endsWith(':Tirai:TradeReport')).map((e) => e.createArgument.instrument));
  const disclose = (qc) => submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:Quote`, contractId: qc,
    choice: 'DiscloseTo', choiceArgument: { auditor: p.regulator, reason: 'best-execution audit' } } });
  // One disclosed 2-dealer Vickrey: dealerA (lower ask) wins, cleared at dealerB's price.
  const auction = async (inst, qty, pA, pB, cashAmt) => {
    if (done.has(inst)) { console.log(`· ${inst} already settled — skip`); return; }
    const cash = cidOf(await submit(p.cashIssuer, createHolding(p.cashIssuer, p.buyer, 'USDC', cashAmt)));
    const bA = cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, p.dealerA, inst, qty)));
    const bB = cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, p.dealerB, inst, qty)));
    const rfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:RFQ`, createArguments: {
      buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB],
      instrument: inst, quantity: qty, payInstrument: 'USDC', assetIssuer: p.bondIssuer, payIssuer: p.cashIssuer,
      deadline: '2030-01-01T00:00:00Z' } } }));
    const q = async (dealer, price, asset) => cidOfTpl(await submit(dealer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`,
      contractId: rfq, choice: 'SubmitQuote', choiceArgument: { dealer, price, assetCid: asset } } }), ':Tirai:Quote');
    const qA = await q(p.dealerA, pA, bA);
    const qB = await q(p.dealerB, pB, bB);
    await disclose(qA); await disclose(qB); // both sealed asks revealed to the regulator BEFORE award
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: rfq,
      choice: 'Award', choiceArgument: { quoteCids: [qA, qB], cashCid: cash } } });
    console.log(`· ${inst} ${qty} — Vickrey: dealerA ${pA} wins, cleared at ${pB}; both asks disclosed ✓ attested`);
  };
  // Shared setup for the bilateral rails: two disclosed sealed asks (A cheaper).
  const twoQuotesDisclosed = async (inst, qty, pA, pB, cashAmt) => {
    const cash = cidOf(await submit(p.cashIssuer, createHolding(p.cashIssuer, p.buyer, 'USDC', cashAmt)));
    const bA = cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, p.dealerA, inst, qty)));
    const bB = cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, p.dealerB, inst, qty)));
    const rfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:RFQ`, createArguments: {
      buyer: p.buyer, regulator: p.regulator, invitedDealers: [p.dealerA, p.dealerB],
      instrument: inst, quantity: qty, payInstrument: 'USDC', assetIssuer: p.bondIssuer, payIssuer: p.cashIssuer,
      deadline: '2030-01-01T00:00:00Z' } } }));
    const q = async (dealer, price, asset) => cidOfTpl(await submit(dealer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`,
      contractId: rfq, choice: 'SubmitQuote', choiceArgument: { dealer, price, assetCid: asset } } }), ':Tirai:Quote');
    const qA = await q(p.dealerA, pA, bA);
    const qB = await q(p.dealerB, pB, bB);
    await disclose(qA); await disclose(qB);
    return { cash, qA, qB, rfq };
  };
  const onQuote = (qc, choice, arg) => submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:Quote`, contractId: qc, choice, choiceArgument: arg } });
  // SettleQuote/AcceptPartial act on the Quote, not the RFQ — so the RFQ itself would
  // linger empty. Cancel it (buyer is sole signatory) so no orphan open RFQ is left.
  const cancelRfq = (rfq) => submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: rfq, choice: 'CancelRFQ', choiceArgument: {} } });
  // Direct bilateral OTC: the buyer HITS the cheaper disclosed dealer at its ask
  // (SettleQuote). The loser's quote is withdrawn so no escrow is left stranded.
  const directOtc = async (inst, qty, pA, pB, cashAmt) => {
    if (done.has(inst)) { console.log(`· ${inst} already settled — skip`); return; }
    const { cash, qA, qB, rfq } = await twoQuotesDisclosed(inst, qty, pA, pB, cashAmt);
    await onQuote(qA, 'SettleQuote', { cashCid: cash, clearingPrice: pA });
    await submit(p.dealerB, { ExerciseCommand: { templateId: `${PKG}:Tirai:Quote`, contractId: qB, choice: 'WithdrawQuote', choiceArgument: {} } });
    await cancelRfq(rfq);
    console.log(`· ${inst} ${qty} — direct OTC: hit dealerA ${pA} (beat disclosed dealerB ${pB}) ✓ attested`);
  };
  // Partial direct fill: the buyer takes `fill` of the cheaper lot at the prorated ask.
  const partial = async (inst, qty, pA, pB, fill, cashAmt) => {
    if (done.has(inst)) { console.log(`· ${inst} already settled — skip`); return; }
    const { cash, qA, qB, rfq } = await twoQuotesDisclosed(inst, qty, pA, pB, cashAmt);
    await onQuote(qA, 'AcceptPartial', { cashCid: cash, fillQuantity: fill });
    await submit(p.dealerB, { ExerciseCommand: { templateId: `${PKG}:Tirai:Quote`, contractId: qB, choice: 'WithdrawQuote', choiceArgument: {} } });
    await cancelRfq(rfq);
    console.log(`· ${inst} ${fill}/${qty} — partial fill of dealerA ${pA} (beat disclosed dealerB ${pB}) ✓ attested`);
  };
  // Vickrey rail — winner ask < runner-up = clearing price.
  await auction('UST7Y', '1000.0', '1470000.0', '1490000.0', '1500000.0');
  await auction('UST3Y', '2000.0', '1960000.0', '1980000.0', '2000000.0');
  await auction('GILT7Y', '1000.0', '1180000.0', '1195000.0', '1200000.0');
  await auction('BUND7Y', '1500.0', '1465000.0', '1485000.0', '1500000.0');
  await auction('JPM30', '500.0', '505000.0', '512000.0', '520000.0');
  await auction('OAT7Y', '800.0', '815000.0', '825000.0', '830000.0');
  // Direct-OTC rail — buyer hits the cheaper disclosed ask.
  await directOtc('GILT20Y', '1000.0', '1240000.0', '1255000.0', '1300000.0');
  await directOtc('BTP10Y', '1500.0', '1440000.0', '1460000.0', '1500000.0');
  // Partial rail — buyer takes part of the cheaper disclosed lot.
  await partial('UST20Y', '2000.0', '1900000.0', '1930000.0', '800.0', '2000000.0');
  await partial('SPGB10Y', '1000.0', '1120000.0', '1140000.0', '600.0', '1200000.0');
  // ── Extended attestations — more instruments across all three rails (fresh maturities) ──
  await auction('CAN7Y', '1000.0', '980000.0', '990000.0', '1000000.0');              // Canada · Vickrey
  await auction('SGS7Y', '1000.0', '970000.0', '982000.0', '1000000.0');              // Singapore · Vickrey
  await directOtc('ACGB5Y', '800.0', '810000.0', '822000.0', '850000.0');             // Australia · direct OTC
  await directOtc('INDON30', '800.0', '745000.0', '758000.0', '800000.0');            // Indonesia · direct OTC
  await partial('NVDA30', '500.0', '320000.0', '328000.0', '300.0', '330000.0');      // Nvidia · partial
  await partial('IBRD30', '1000.0', '1480000.0', '1495000.0', '600.0', '1500000.0');  // World Bank · partial
  console.log('seed-bestexec done — best execution proven across Vickrey, direct-OTC, and partial-fill rails.');
}

// Cancel any quote-less open RFQ the buyer holds — e.g. an orphan left when a
// direct-OTC / partial settle consumed the quotes but not the RFQ. Idempotent.
// Requests of `reqTpl` that no `quoteTpl` in the same ACS points back at. Quotes
// carry rfqId = Some self when created through the request's choice, so a missing
// or unmatched link means the request is a leftover shell. Exported and pure, so
// scripts/test-devnet-logic.mjs can hold it to that: this predicate decides what
// gets cancelled or archived on a live ledger.
export const orphansOf = (acs, reqTpl, quoteTpl) => {
  const reqs = acs.filter((e) => e.templateId.endsWith(`:Tirai:${reqTpl}`));
  const linked = new Set(acs.filter((e) => e.templateId.endsWith(`:Tirai:${quoteTpl}`))
    .map((q) => q.createArgument?.rfqId).filter(Boolean));
  return reqs.filter((r) => !linked.has(r.contractId));
};

async function tidy() {
  const p = await partyMap();
  const ev = await acsAs(p.buyer);
  const orphans = orphansOf(ev, 'RFQ', 'Quote');
  // Basket RFQs have no cancel choice, but the buyer is their sole signatory, so
  // the built-in Archive clears the shells a settled basket leaves behind
  // (SettleBasket archives the quote, not the request).
  const basketOrphans = orphansOf(ev, 'BasketRFQ', 'BasketQuote');
  for (const b of basketOrphans) {
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, contractId: b.contractId, choice: 'Archive', choiceArgument: {} } });
    console.log(`· archived orphan BasketRFQ (${(b.createArgument.legs ?? []).length} legs)`);
  }
  if (!orphans.length) {
    console.log(basketOrphans.length ? `tidy: archived ${basketOrphans.length} orphan BasketRFQ(s); no orphan single RFQs.` : 'tidy: no orphan RFQs.');
    return;
  }
  // This cancels EVERY quote-less RFQ, and `seed-book` deliberately leaves several
  // open with no asks yet — sweeping them guts the live book. It has happened once.
  // Make the caller say so out loud.
  if (!process.argv.includes('--all')) {
    console.log(`tidy: ${orphans.length} quote-less RFQ(s) found — NOT cancelled.`);
    console.log("       Some are the live book's un-quoted requests. Re-run `tidy --all` to cancel them anyway.");
    return;
  }
  console.log(`tidy: cancelling ${orphans.length} quote-less RFQ(s) — including any still awaiting a first quote.`);
  for (const r of orphans) {
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: r.contractId, choice: 'CancelRFQ', choiceArgument: {} } });
    console.log(`· cancelled orphan RFQ ${r.createArgument.instrument} qty ${r.createArgument.quantity}`);
  }
  console.log(`tidy: cancelled ${orphans.length} orphan RFQ(s).`);
}

// ===========================================================================
// Real Canton Token Standard settlement — the cash leg in Canton Coin, issued
// and administered by the DSO, not by this app. Everything below talks to the
// registry's own HTTP API (via the validator's scan proxy) and passes the
// choice contexts and disclosed contracts it returns straight to the ledger.
// cETH and CBTC are the same code path: only the InstrumentId admin changes.
// ===========================================================================

const V = () => (ENV.DEVNET_VALIDATOR_URL ?? '').replace(/\/$/, '');
const REGISTRY = () => V() + '/api/validator/v0/scan-proxy/registry';

// Canton Coin's registry is reached through this validator's scan proxy. Every
// other registry publishes its own API, and the DA Utility Registry (which issues
// CBTC on DevNet) namespaces it per registrar party. Nothing on-ledger tells you
// the URL, so it is configuration.
const UTILITY_REGISTRY = (process.env.REGISTRY_URL ?? 'https://api.utilities.digitalasset-dev.com').replace(/\/$/, '');
const registryBase = (admin) => admin.startsWith('DSO::')
  ? REGISTRY()
  : `${UTILITY_REGISTRY}/api/token-standard/v0/registrars/${admin}/registry`;

async function regAt(base, path, json) {
  const t = await token();
  const r = await fetch(base + path, {
    method: json === undefined ? 'GET' : 'POST',
    // A foreign registry does not accept this validator's token; it does not ask
    // for one either. Only send the bearer to our own validator.
    headers: { ...(base.startsWith(V()) ? { authorization: `Bearer ${t}` } : {}),
      ...(json === undefined ? {} : { 'content-type': 'application/json' }) },
    body: json === undefined ? undefined : JSON.stringify(json),
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  if (!r.ok) throw new Error(`registry ${path} → ${r.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function reg(path, json) {
  if (!V()) throw new Error('set DEVNET_VALIDATOR_URL in the env file to reach the token registry');
  const t = await token();
  const r = await fetch(REGISTRY() + path, {
    method: json === undefined ? 'GET' : 'POST',
    headers: { authorization: `Bearer ${t}`, ...(json === undefined ? {} : { 'content-type': 'application/json' }) },
    body: json === undefined ? undefined : JSON.stringify(json),
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  if (!r.ok) throw new Error(`registry ${path} → ${r.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

const IFACE = {
  transferFactory: '#splice-api-token-transfer-instruction-v1:Splice.Api.Token.TransferInstructionV1:TransferFactory',
  transferInstruction: '#splice-api-token-transfer-instruction-v1:Splice.Api.Token.TransferInstructionV1:TransferInstruction',
  allocFactory: '#splice-api-token-allocation-instruction-v1:Splice.Api.Token.AllocationInstructionV1:AllocationFactory',
  allocation: '#splice-api-token-allocation-v1:Splice.Api.Token.AllocationV1:Allocation',
  holding: '#splice-api-token-holding-v1:Splice.Api.Token.HoldingV1:Holding',
};
const disclose = (cc) => cc.disclosedContracts.map(({ templateId, contractId, createdEventBlob, synchronizerId }) =>
  ({ templateId, contractId, createdEventBlob, synchronizerId }));
const ctxArgs = (cc) => ({ context: cc.choiceContextData, meta: { values: {} } });
const damlTime = (ms) => new Date(ms).toISOString().replace('Z', '000Z');
const exResult = (tx, choice) => (tx?.transaction?.events ?? []).map((e) => e.ExercisedEvent).filter(Boolean)
  .find((e) => e.choice === choice)?.exerciseResult;
const createdOf = (tx, suffix) => (tx?.transaction?.events ?? []).map((e) => e.CreatedEvent).filter(Boolean)
  .find((c) => c.templateId?.endsWith(suffix));
const isStale = (e) => /archived|UNKNOWN_CONTRACT|CONTRACT_NOT_FOUND|STALE/i.test(String(e));

// An ACS read scoped to one interface or template — the wildcard read is now too
// large for a single response on the busier parties.
async function acsFiltered(party, identifierFilter) {
  const off = (await api('/v2/state/ledger-end', { retry: true })).data?.offset;
  const r = await api('/v2/state/active-contracts?limit=5000', { method: 'POST', retry: true, json: {
    filter: { filtersByParty: { [party]: { cumulative: [{ identifierFilter }] } } }, verbose: false, activeAtOffset: off } });
  if (!Array.isArray(r.data)) throw new Error('active-contracts: ' + JSON.stringify(r.data).slice(0, 200));
  return r.data.map((x) => x.contractEntry?.JsActiveContract?.createdEvent).filter(Boolean);
}
const heldVia = (party, interfaceId) => acsFiltered(party, { InterfaceFilter: { value: { interfaceId, includeInterfaceView: true, includeCreatedEventBlob: true } } });
// Template filters take the package NAME, never a package id.
const ofTemplate = async (party, tpl) => (await acsFiltered(party, { TemplateFilter: { value: { templateId: `#tirai-desk:Tirai:${tpl}`, includeCreatedEventBlob: false } } }))
  .map((c) => ({ cid: c.contractId, arg: c.createArgument }));
const ifaceView = (c) => c.interfaceViews?.[0]?.viewValue;
const optionalCid = (v) => (v && typeof v === 'object' ? v.value ?? null : v ?? null);

async function seedCc() {
  const p = await partyMap();
  const admin = (await reg('/metadata/v1/info')).adminId;
  const instruments = (await reg('/metadata/v1/instruments')).instruments ?? [];
  const cc = instruments.find((i) => i.id === 'Amulet') ?? instruments[0];
  if (!cc) throw new Error('registry lists no instruments');
  const CASH = { admin, id: cc.id };
  console.log(`registry: ${cc.name} (${cc.symbol}) · admin ${admin.split('::')[0]} · allocation API ${Object.keys(cc.supportedApis ?? {}).some((k) => k.includes('allocation')) ? 'yes' : 'NO'}`);

  const cashOf = async (party) => (await heldVia(party, IFACE.holding)).filter((h) => {
    const v = ifaceView(h);
    return v.instrumentId.id === CASH.id && v.instrumentId.admin === admin && !v.lock;
  });
  const total = (hs) => hs.reduce((s, h) => s + Number(ifaceView(h).amount), 0);

  // 1 · Fund the desk's buyer from this validator's own wallet party, through
  // the registry's transfer factory (two-phase: instruction, then accept).
  const wallet = (await (await fetch(V() + '/api/validator/v0/validator-user', { headers: { authorization: `Bearer ${await token()}` } })).json()).party_id;
  let buyerCash = await cashOf(p.buyer);
  if (total(buyerCash) < 20000) {
    const amount = '60000.0000000000';
    for (let i = 0; i < 4 && total(buyerCash) < 20000; i++) {
      try {
        // Accept anything already parked before issuing another transfer — a
        // pending instruction holds the sender's cash and counts as nothing here.
        for (const inst of await heldVia(p.buyer, IFACE.transferInstruction)) {
          const ctx = await reg(`/transfer-instruction/v1/${inst.contractId}/choice-contexts/accept`, {});
          await submit(p.buyer, { ExerciseCommand: {
            templateId: IFACE.transferInstruction, contractId: inst.contractId, choice: 'TransferInstruction_Accept',
            choiceArgument: { extraArgs: ctxArgs(ctx) },
          } }, { disclosed: disclose(ctx), effects: true });
          console.log('  accepted a transfer instruction left pending by an earlier run');
        }
        buyerCash = await cashOf(p.buyer);
        if (total(buyerCash) >= 20000) break;
        // Read the wallet's holdings as late as possible: round automation
        // re-creates them, and a stale input cid fails the whole command.
        const transfer = {
          sender: wallet, receiver: p.buyer, amount, instrumentId: CASH,
          requestedAt: damlTime(Date.now()), executeBefore: damlTime(Date.now() + 3600e3),
          inputHoldingCids: (await cashOf(wallet)).map((h) => h.contractId), meta: { values: {} },
        };
        const f = await reg('/transfer-instruction/v1/transfer-factory', {
          choiceArguments: { expectedAdmin: admin, transfer, extraArgs: { context: { values: {} }, meta: { values: {} } } },
        });
        const tx = await submit(wallet, { ExerciseCommand: {
          templateId: IFACE.transferFactory, contractId: f.factoryId, choice: 'TransferFactory_Transfer',
          choiceArgument: { expectedAdmin: admin, transfer, extraArgs: ctxArgs(f.choiceContext) },
        } }, { disclosed: disclose(f.choiceContext), effects: true });
        const pending = exResult(tx, 'TransferFactory_Transfer')?.output?.value?.transferInstructionCid;
        if (pending) { // no pre-approval for the receiver: it accepts explicitly
          const ctx = await reg(`/transfer-instruction/v1/${pending}/choice-contexts/accept`, {});
          await submit(p.buyer, { ExerciseCommand: {
            templateId: IFACE.transferInstruction, contractId: pending, choice: 'TransferInstruction_Accept',
            choiceArgument: { extraArgs: ctxArgs(ctx) },
          } }, { disclosed: disclose(ctx), effects: true });
        }
      } catch (e) {
        if (!isStale(e)) throw e;
        console.log('  funding input went stale — retrying with fresh holdings');
      }
      buyerCash = await cashOf(p.buyer);
    }
  }
  console.log(`buyer holds ${total(buyerCash)} ${cc.symbol} (real registry asset, not a desk token)`);

  // 2 · Auctions whose cash leg is that registry asset.
  const dealers = { A: p.dealerA, B: p.dealerB };
  const book = [
    { instrument: 'GILT10Y', quantity: '1000.0', asks: [{ dealer: 'A', price: '12400.0' }, { dealer: 'B', price: '12500.0' }] },
    { instrument: 'BUND2Y',  quantity: '500.0',  asks: [{ dealer: 'B', price: '8100.0' },  { dealer: 'A', price: '8250.0' }] },
    { instrument: 'JGB20Y',  quantity: '2000.0', asks: [{ dealer: 'A', price: '15900.0' }, { dealer: 'B', price: '16050.0' }] },
    { instrument: 'UST8Y',   quantity: '800.0',  asks: [{ dealer: 'A', price: '9800.0' }], mode: 'direct' },
    { instrument: 'OAT15Y',  quantity: '600.0',  asks: [{ dealer: 'B', price: '7300.0' }], mode: 'direct' },
    { instrument: 'KTB20Y',  quantity: '900.0',  asks: [{ dealer: 'A', price: '6900.0' }, { dealer: 'B', price: '7000.0' }] },
  ];

  const done = [];
  for (const t of book) {
    try { done.push(await ccTrade({ ...t, p, dealers, admin, CASH, cashOf })); }
    catch (e) { console.log(`· FAILED ${t.instrument}: ${String(e.message ?? e).slice(0, 180)}`); }
  }

  console.log(`\n${done.length}/${book.length} trades settled in ${cc.symbol} through the ${cc.name} registry:`);
  for (const d of done) console.log(`· ${d.mode === 'direct' ? 'direct OTC' : 'Vickrey   '} ${d.instrument.padEnd(8)} ${Number(d.clearing).toLocaleString('en-GB').padStart(10)} ${cc.symbol} → ${d.dealer.split('::')[0]}`);
  console.log(`buyer ${total(await cashOf(p.buyer))} · dealerA ${total(await cashOf(p.dealerA))} · dealerB ${total(await cashOf(p.dealerB))} ${cc.symbol}`);
}

async function ccTrade({ instrument, quantity, asks, mode = 'vickrey', p, dealers, admin, CASH, cashOf }) {
  const settledAlready = (await ofTemplate(p.regulator, 'TradeReport')).find((r) => r.arg.instrument === instrument);
  if (settledAlready) {
    console.log(`· ${instrument}: already settled`);
    return { instrument, mode, clearing: settledAlready.arg.clearingPrice, dealer: settledAlready.arg.dealer };
  }

  // The RFQ has to name the registry instrument as its pay leg: ConvertToTokenTrade
  // asserts cashInstrument.id == payInstrument and cashInstrument.admin == payIssuer.
  const open = (await ofTemplate(p.buyer, 'RFQ')).find((r) => r.arg.instrument === instrument);
  if (open && (open.arg.payInstrument !== CASH.id || open.arg.payIssuer !== admin)) {
    for (const q of (await ofTemplate(p.buyer, 'Quote')).filter((q) => optionalCid(q.arg.rfqId) === open.cid))
      await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:Quote`, contractId: q.cid, choice: 'RejectQuote', choiceArgument: {} } });
    await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: open.cid, choice: 'CancelRFQ', choiceArgument: {} } });
  }
  let rfq = open && open.arg.payInstrument === CASH.id && open.arg.payIssuer === admin ? open.cid : null;
  if (!rfq) rfq = createdOf(await submit(p.buyer, { CreateCommand: {
    templateId: `${PKG}:Tirai:RFQ`,
    createArguments: {
      buyer: p.buyer, regulator: p.regulator, invitedDealers: asks.map((a) => dealers[a.dealer]),
      instrument, quantity, payInstrument: CASH.id, assetIssuer: p.bondIssuer, payIssuer: admin,
      deadline: '2030-01-01T00:00:00Z',
    },
  } }), ':Tirai:RFQ').contractId;

  let trade = (await ofTemplate(p.buyer, 'TokenTrade')).find((t) => t.arg.instrument === instrument);
  if (!trade) {
    const existing = (await ofTemplate(p.buyer, 'Quote')).filter((q) => optionalCid(q.arg.rfqId) === rfq);
    const quoteCids = [];
    for (const a of asks) {
      const dealer = dealers[a.dealer];
      const already = existing.find((q) => q.arg.dealer === dealer);
      if (already) { quoteCids.push(already.cid); continue; }
      // A dealer can only quote a lot whose size matches the RFQ exactly.
      const lot = (await ofTemplate(dealer, 'Holding')).find((h) => h.arg.instrument === instrument && h.arg.amount === quantity)?.cid
        ?? cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, dealer, instrument, quantity)));
      quoteCids.push(createdOf(await submit(dealer, { ExerciseCommand: {
        templateId: `${PKG}:Tirai:RFQ`, contractId: rfq, choice: 'SubmitQuote', choiceArgument: { dealer, price: a.price, assetCid: lot },
      } }), ':Tirai:Quote').contractId);
    }

    // Vickrey awards the cheapest ask at the second price; direct OTC converts one
    // sealed quote at that dealer's own ask. Both produce the same TokenTrade,
    // which implements the standard AllocationRequest the buyer's wallet funds.
    const now = Date.now();
    const window = { allocateBefore: damlTime(now + 30 * 60e3), settleBefore: damlTime(now + 60 * 60e3) };
    const tx = mode === 'direct'
      ? await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:Quote`, contractId: quoteCids[0], choice: 'ConvertToTokenTrade',
          choiceArgument: { cashInstrument: CASH, clearingPrice: asks[0].price, ...window } } })
      : await submit(p.buyer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: rfq, choice: 'AwardWithAllocation',
          choiceArgument: { quoteCids, cashInstrument: CASH, ...window } } });
    const c = createdOf(tx, ':Tirai:TokenTrade');
    trade = { cid: c.contractId, arg: c.createArgument };
  }
  const tradeCid = trade.cid;
  const t = trade.arg;

  // The spec the trade will accept, rebuilt exactly as expectedAllocation does:
  // a forged or repointed allocation cannot settle it.
  const allocation = {
    settlement: {
      executor: t.buyer,
      settlementRef: { id: 'tirai-quote', cid: t.quoteCid },
      requestedAt: t.createdAt, allocateBefore: t.allocateBefore, settleBefore: t.settleBefore,
      meta: { values: {} },
    },
    transferLegId: 'cash',
    transferLeg: { sender: t.buyer, receiver: t.dealer, amount: t.clearingPrice, instrumentId: t.cashInstrument, meta: { values: {} } },
  };

  let allocCid;
  for (let i = 0; !allocCid && i < 4; i++) {
    // Look again on EVERY attempt: a lost response or an "already applied" null
    // otherwise sends us back to the factory, and each extra allocation locks
    // another clearingPrice of real cash until it expires.
    allocCid = (await heldVia(p.buyer, IFACE.allocation))
      .find((a) => ifaceView(a)?.allocation?.settlement?.settlementRef?.cid === t.quoteCid)?.contractId;
    if (allocCid) break;
    // Refetch the context on every attempt: the round contracts it discloses are
    // archived when the amulet round rolls, and a replay fails as "archived".
    const args = {
      expectedAdmin: admin, allocation, requestedAt: damlTime(Date.now()),
      inputHoldingCids: (await cashOf(p.buyer)).map((h) => h.contractId),
      extraArgs: { context: { values: {} }, meta: { values: {} } },
    };
    try {
      const f = await regAt(registryBase(admin), '/allocation-instruction/v1/allocation-factory', { choiceArguments: args });
      const tx = await submit(p.buyer, { ExerciseCommand: {
        templateId: IFACE.allocFactory, contractId: f.factoryId, choice: 'AllocationFactory_Allocate',
        choiceArgument: { ...args, extraArgs: ctxArgs(f.choiceContext) },
      } }, { disclosed: disclose(f.choiceContext), effects: true });
      allocCid = exResult(tx, 'AllocationFactory_Allocate')?.output?.value?.allocationCid;
    } catch (e) {
      if (!isStale(e)) throw e;
    }
  }
  if (!allocCid) throw new Error('the registry never completed the allocation');

  // One atomic transaction: the registry moves the cash, the desk delivers the
  // bond out of escrow, the regulator gets its report. DvP or nothing.
  for (let i = 0; i < 4; i++) {
    const ctx = await regAt(registryBase(admin), `/allocations/v1/${allocCid}/choice-contexts/execute-transfer`, {});
    try {
      await submit(p.buyer, { ExerciseCommand: {
        templateId: `${PKG}:Tirai:TokenTrade`, contractId: tradeCid, choice: 'TokenTrade_Settle',
        choiceArgument: { allocCid, extraArgs: ctxArgs(ctx) },
      } }, { disclosed: disclose(ctx), effects: true });
      break;
    } catch (e) {
      if (!isStale(e)) throw e;
      // A stale settle may mean it already landed: the report is the proof.
      if ((await ofTemplate(p.regulator, 'TradeReport')).some((r) => r.arg.instrument === instrument)) break;
      if (i === 3) throw e;
    }
  }
  console.log(`· ${instrument} settled: ${t.clearingPrice} ${CASH.id} → ${t.dealer.split('::')[0]}`);
  return { instrument, mode, clearing: t.clearingPrice, dealer: t.dealer };
}

// ===========================================================================
// A live book. The settled history seeders leave the desk with a handful of open
// requests; a trading screen should look like a trading screen. This creates a
// spread of OPEN requests across instruments, execution modes and quote states,
// so the book reads the same from any identity: the buy side sees its own
// requests, and each dealer sees exactly the ones it was invited to.
// Idempotent per instrument — a rerun tops up what is missing, nothing else.
// ===========================================================================
async function seedBook() {
  const p = await partyMap();
  const dealerC = await allocateOne('tirai-v1-dealerC'); await grant(dealerC);
  const open = (await ofTemplate(p.buyer, 'RFQ')).map((r) => r.arg.instrument);
  const quotesByRfq = await ofTemplate(p.buyer, 'Quote');

  const book = [
    // instrument, qty, invited dealers, asks that get sealed against it
    ['UST2Y',    '2000.0', ['A', 'B'],      ['1980000.0', '1992000.0']],
    ['UST10Y',   '1000.0', ['A', 'B'],      ['1042000.0']],
    ['UST30Y',   '800.0',  ['A', 'B'],      []],
    ['GILT30',   '500.0',  ['A', 'B', 'C'], ['612000.0', '615500.0', '611000.0']],
    ['BUND10',   '500.0',  ['A'],           ['494500.0']],
    ['BUND30',   '400.0',  ['B'],           []],
    ['JGB10Y',   '2000.0', ['A', 'B'],      ['1760000.0', '1772000.0']],
    ['OAT10Y',   '600.0',  ['B'],           ['588000.0']],
    ['BTP10Y',   '1500.0', ['A', 'B'],      []],
    ['SPGB10Y',  '600.0',  ['A', 'C'],      ['591000.0']],
    ['AAPL30',   '300.0',  ['A', 'B'],      ['318000.0', '319500.0']],
    ['MSFT29',   '400.0',  ['B'],           []],
    ['NVDA34',   '300.0',  ['A', 'B'],      ['341000.0']],
    ['IBRD28',   '1500.0', ['A', 'B'],      ['1487000.0', '1491000.0']],
    ['KFW27',    '1200.0', ['A'],           []],
    ['MEX34',    '600.0',  ['A', 'B'],      ['576000.0']],
    ['INDON34',  '800.0',  ['B', 'C'],      ['781000.0', '784500.0']],
  ];
  const partyOf = { A: p.dealerA, B: p.dealerB, C: dealerC };

  let made = 0, quoted = 0;
  for (const [inst, qty, panel, asks] of book) {
    let rfq = (await ofTemplate(p.buyer, 'RFQ')).find((r) => r.arg.instrument === inst)?.cid;
    if (!rfq) {
      rfq = cidOf(await submit(p.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:RFQ`, createArguments: {
        buyer: p.buyer, regulator: p.regulator, invitedDealers: panel.map((d) => partyOf[d]),
        instrument: inst, quantity: qty, payInstrument: 'USDC',
        assetIssuer: p.bondIssuer, payIssuer: p.cashIssuer, deadline: '2030-01-01T00:00:00Z' } } }));
      made++;
      process.stdout.write(`· ${inst.padEnd(9)} ${panel.length > 1 ? 'auction' : 'direct '} ${panel.join('+')}`);
    } else {
      process.stdout.write(`· ${inst.padEnd(9)} exists`);
    }
    // Top up sealed quotes: a dealer may only quote once, and only with a lot of
    // exactly the requested size.
    const already = new Set((await ofTemplate(p.buyer, 'Quote'))
      .filter((q) => optionalCid(q.arg.rfqId) === rfq).map((q) => q.arg.dealer));
    for (let i = 0; i < asks.length; i++) {
      const dealer = partyOf[panel[i]];
      if (!dealer || already.has(dealer)) continue;
      const lot = (await ofTemplate(dealer, 'Holding')).find((h) => h.arg.instrument === inst && h.arg.amount === qty)?.cid
        ?? cidOf(await submit(p.bondIssuer, createHolding(p.bondIssuer, dealer, inst, qty)));
      await submit(dealer, { ExerciseCommand: { templateId: `${PKG}:Tirai:RFQ`, contractId: rfq,
        choice: 'SubmitQuote', choiceArgument: { dealer, price: asks[i], assetCid: lot } } });
      quoted++;
    }
    // Leave every invited dealer that has NOT quoted holding a matching lot, so the
    // "Quote" action on the desk opens a real dialog instead of explaining why it
    // cannot. A dealer can only back a quote with a lot of exactly the RFQ size.
    const quoted = new Set((await ofTemplate(p.buyer, 'Quote'))
      .filter((q) => optionalCid(q.arg.rfqId) === rfq).map((q) => q.arg.dealer));
    let stocked = 0;
    for (const d of panel) {
      const dealer = partyOf[d];
      if (!dealer || quoted.has(dealer)) continue;
      const has = (await ofTemplate(dealer, 'Holding')).some((h) => h.arg.instrument === inst && h.arg.amount === qty);
      if (!has) { await submit(p.bondIssuer, createHolding(p.bondIssuer, dealer, inst, qty)); stocked++; }
    }
    console.log(` · ${asks.length} sealed${stocked ? `, ${stocked} dealer(s) stocked to quote` : ''}`);
  }
  console.log(`\nbook: ${made} new request(s), ${quoted} new sealed quote(s).`);
  console.log('Open requests now:', (await ofTemplate(p.buyer, 'RFQ')).length, '(was', open.length + ')');
  console.log('Sealed quotes the buyer holds:', (await ofTemplate(p.buyer, 'Quote')).length, '(was', quotesByRfq.length + ')');
}

// Accept a token-standard transfer somebody sent this desk — the CBTC faucet parks
// one as a TransferOffer that only the receiver can complete. Any registry works:
// point REGISTRY_URL at that registry's API base and it fetches the accept choice
// context from there. Canton Coin's is reached through the validator's scan proxy
// and needs no extra configuration.
//   REGISTRY_URL=https://<registry-api> node scripts/devnet.mjs accept-incoming
async function acceptIncoming() {
  const p = await partyMap();
  const party = process.argv.find((a) => a.includes('::')) ?? p.buyer;
  const pending = await heldVia(party, IFACE.transferInstruction);
  if (!pending.length) { console.log('nothing pending for', party.split('::')[0]); return; }

  for (const c of pending) {
    const v = ifaceView(c) ?? {};
    const t = v.transfer ?? {};
    console.log(`· ${t.amount} ${t.instrumentId?.id} from ${String(t.sender).split('::')[0]}`);
    // The registry decides what its accept needs. Canton Coin's context comes from
    // the scan proxy; a foreign registry's must come from its own API, and without
    // it the ledger refuses with "Missing context entry".
    let ctx;
    try {
      ctx = await regAt(registryBase(t.instrumentId.admin),
        `/transfer-instruction/v1/${c.contractId}/choice-contexts/accept`, {});
    } catch (e) {
      console.log(`  cannot build the accept context: ${e.message}`);
      console.log('  the offer stays on-ledger until it expires, so this is retryable.');
      continue;
    }
    await submit(party, { ExerciseCommand: {
      templateId: IFACE.transferInstruction, contractId: c.contractId, choice: 'TransferInstruction_Accept',
      choiceArgument: { extraArgs: ctxArgs(ctx) },
    } }, { disclosed: disclose(ctx), effects: true });
    console.log('  accepted.');
  }
}

// Settle in an asset issued by a registry that is not Canton Coin's. The desk does
// not care which: `cashInstrument` is any {admin, id}, and the only thing that
// changes is where the choice contexts come from.
//   node scripts/devnet.mjs seed-foreign CBTC
async function seedForeign() {
  const p = await partyMap();
  const want = (process.argv[3] ?? 'CBTC').toUpperCase();

  // Find the instrument by looking at what the buyer actually holds — the desk
  // learns the registrar party from the holding, not from configuration.
  const held = (await heldVia(p.buyer, IFACE.holding)).map(ifaceView).filter(Boolean)
    .filter((v) => v.instrumentId.id.toUpperCase() === want && !v.lock);
  if (!held.length) {
    console.log(`the buyer holds no ${want}. Request some to`);
    console.log(' ', p.buyer);
    console.log('then run `node scripts/devnet.mjs accept-incoming` and try again.');
    return;
  }
  const admin = held[0].instrumentId.admin;
  const CASH = { admin, id: held[0].instrumentId.id };
  const balance = held.reduce((a, v) => a + Number(v.amount), 0);
  const info = await regAt(registryBase(admin), '/metadata/v1/info');
  const apis = Object.keys(info.supportedApis ?? {});
  console.log(`${CASH.id} · registrar ${admin.split('::')[0]} · buyer holds ${balance}`);
  console.log(`allocation API: ${apis.some((k) => k.includes('allocation-v1')) ? 'supported' : 'MISSING — DvP cannot settle'}`);

  const cashOf = async (party) => (await heldVia(party, IFACE.holding)).filter((h) => {
    const v = ifaceView(h);
    return v.instrumentId.id === CASH.id && v.instrumentId.admin === admin && !v.lock;
  });
  const dealers = { A: p.dealerA, B: p.dealerB };
  // Sized to a faucet's worth of a scarce asset: a whole Bitcoin is not 4.2m of
  // anything, and the point is the rail, not the notional.
  const book = [
    { instrument: 'XBTC5Y', quantity: '500.0', asks: [{ dealer: 'A', price: '0.30' }, { dealer: 'B', price: '0.34' }] },
    { instrument: 'XBTC10Y', quantity: '300.0', asks: [{ dealer: 'B', price: '0.22' }], mode: 'direct' },
  ];
  const done = [];
  for (const t of book) {
    try { done.push(await ccTrade({ ...t, p, dealers, admin, CASH, cashOf })); }
    catch (e) { console.log(`· FAILED ${t.instrument}: ${String(e.message ?? e).slice(0, 200)}`); }
  }
  console.log(`
${done.length}/${book.length} settled in ${CASH.id}:`);
  for (const d of done) console.log(`· ${d.mode === 'direct' ? 'direct OTC' : 'Vickrey   '} ${d.instrument.padEnd(8)} ${d.clearing} ${CASH.id} → ${d.dealer.split('::')[0]}`);
  console.log(`buyer ${(await cashOf(p.buyer)).reduce((a, h) => a + Number(ifaceView(h).amount), 0)} ${CASH.id} left`);
}

// Importing this file (the logic test does) must not run a command.
const cmd = process.argv[1]?.endsWith('devnet.mjs') ? process.argv[2] : null;
if (cmd !== null) (async () => {
  ENV = await loadEnv();
  if (cmd === 'probe') await probe();
  else if (cmd === 'cleanup') await cleanup();
  else if (cmd === 'upload') await upload(process.argv[3] ?? '.daml/dist/tirai-desk-0.1.0.dar');
  else if (cmd === 'allocate-one') console.log(await allocateOne(process.argv[3] ?? 'tirai-probe-1'));
  else if (cmd === 'allocate') await allocate();
  else if (cmd === 'seed') await seed();
  else if (cmd === 'settle-demo') await settleDemo();
  else if (cmd === 'seed-basket') await seedBasket();
  else if (cmd === 'seed-cases') await seedCases();
  else if (cmd === 'seed-bestexec') await seedBestExec();
  else if (cmd === 'seed-cc') await seedCc();
  else if (cmd === 'seed-book') await seedBook();
  else if (cmd === 'accept-incoming') await acceptIncoming();
  else if (cmd === 'seed-foreign') await seedForeign();
  else if (cmd === 'tidy') await tidy();
  else if (cmd === 'verify') await verify();
  else console.log('usage: probe | upload <dar> | allocate | seed | settle-demo | seed-basket | seed-cases | seed-bestexec | seed-cc | seed-book | accept-incoming | seed-foreign <ID> | tidy | verify');
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
