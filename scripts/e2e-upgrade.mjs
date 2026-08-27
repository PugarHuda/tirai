// Upgrade rehearsal: a contract written by the PREVIOUS package must still settle
// under the new one, and settle correctly.
//
// The README has documented this discipline since 0.2.0, but it was carried out by
// hand each time, which is the kind of check that quietly stops happening. `damlc`
// already refuses a change that would strand an existing contract — that is a
// signature check. This is the behavioural half: it boots a sandbox holding BOTH
// versions, writes an RFQ and its quotes against the OLD package id explicitly, then
// awards by package NAME so the node picks the newest vetted version, and asserts the
// old contracts came through the new code intact.
//
//   node scripts/e2e-upgrade.mjs            (latest two DARs in .daml/dist)
//   node scripts/e2e-upgrade.mjs 0.3.0 0.5.0
import { spawn, execSync as execFileSync } from 'node:child_process';
import { readdirSync, existsSync, rmSync, openSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DAML = process.env.DAML_CMD ?? join(process.env.APPDATA ?? '', 'daml', 'bin', 'daml.cmd');
const DIST = join(ROOT, '.daml', 'dist');
const PORT = 6900, JSON_PORT = 7600; // clear of the demo: a sandbox also claims PORT+1..+3

const R = [];
const check = (n, ok, d = '') => { R.push({ n, ok: !!ok }); console.log((ok ? '  ok   ' : '  FAIL ') + n + (ok || !d ? '' : ' — ' + d)); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const versions = readdirSync(DIST)
  .map((f) => f.match(/^tirai-desk-(\d+\.\d+\.\d+)\.dar$/)?.[1]).filter(Boolean)
  .sort((a, b) => { const [x, y] = [a, b].map((v) => v.split('.').map(Number));
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; });
const [OLD, NEW] = process.argv.length > 3 ? process.argv.slice(2, 4) : versions.slice(-2);
if (!OLD || !NEW || OLD === NEW) { console.error('need two built versions in .daml/dist'); process.exit(2); }
// Relative, and never absolute: this repo lives under "Hackathon Build on Canton", and
// a spawn with shell:true does not quote its arguments — the sandbox saw "Build" and
// "on" as separate flags and printed its usage instead of starting.
const dar = (v) => `.daml/dist/tirai-desk-${v}.dar`;
for (const v of [OLD, NEW]) if (!existsSync(join(ROOT, dar(v)))) { console.error('missing', dar(v)); process.exit(2); }

// shell:true — a Windows .cmd is not an executable image, and execFileSync without it
// fails with EINVAL rather than anything that names the problem.
const pkgId = (v) => JSON.parse(execFileSync(`"${DAML}" damlc inspect-dar --json ${dar(v)}`,
  { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, shell: true })).main_package_id;

console.log(`\n── Upgrade rehearsal: contracts written by ${OLD}, settled by ${NEW} ──`);
const OLD_PKG = pkgId(OLD), NEW_PKG = pkgId(NEW);
console.log(`   ${OLD} ${OLD_PKG.slice(0, 12)}…   ${NEW} ${NEW_PKG.slice(0, 12)}…\n`);
check('the two versions are genuinely different packages', OLD_PKG !== NEW_PKG);

// The sandbox's own output goes to a file rather than /dev/null: when it refuses to
// start, "sandbox did not come up" is not a diagnosis, and swallowing the reason costs
// far more time than the log ever will.
mkdirSync(join(ROOT, 'log'), { recursive: true });
const SBLOG = openSync(join(ROOT, 'log', 'upgrade-sandbox.log'), 'w');

const portFile = join(tmpdir(), 'tirai-upgrade-json.port');
try { rmSync(portFile, { force: true }); } catch { /* first run */ }
// The sandbox takes one --dar, which turns out to be the right shape anyway: boot on
// the version that is live, then upload the new one on top, exactly as a validator is
// upgraded. Vetting is asynchronous, so the first submit afterwards may need a retry.
const kid = spawn(DAML, ['sandbox', '--port', String(PORT), '--json-api-port', String(JSON_PORT),
  '--dar', dar(OLD), '--json-api-port-file', portFile,
  '--no-legacy-assistant-warning'], { cwd: ROOT, stdio: ['ignore', SBLOG, SBLOG], shell: true });
const stop = () => { try { kid.kill(); } catch { /* already gone */ } };
process.on('exit', stop);

const L = `http://localhost:${JSON_PORT}`;
const api = async (path, body) => {
  const r = await fetch(L + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return { raw: t, status: r.status }; }
};

const until = async (fn, ms = 240000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { try { if (await fn()) return true; } catch { /* not up yet */ } await sleep(1500); }
  throw new Error('sandbox did not come up — see log/upgrade-sandbox.log');
};

try {
  await until(async () => (await fetch(L + '/v2/state/ledger-end')).ok);
  console.log(`   sandbox up on ${OLD}; uploading ${NEW} over it
`);
  try {
    // No --no-legacy-assistant-warning here: `ledger upload-dar` does not take it, and
    // rejects the whole command rather than ignoring the flag.
    execFileSync(`"${DAML}" ledger upload-dar --host localhost --port ${PORT} ${dar(NEW)}`,
      { cwd: ROOT, encoding: 'utf8', shell: true, stdio: 'pipe' });
  } catch (e) {
    const why = String(e.stderr || e.stdout || e.message).trim().split(/\r?\n/).slice(-3).join(' / ');
    throw new Error('upload failed: ' + why);
  }

  // Same call the deployer makes: partyIdHint, and the id comes back on partyDetails.
  const party = async (hint) => {
    const r = await api('/v2/parties', { partyIdHint: hint, identityProviderId: '' });
    return r?.partyDetails?.party
      ?? (await api('/v2/parties'))?.partyDetails?.find((d) => d.party.startsWith(hint + '::'))?.party;
  };
  const [buyer, regulator, cashIssuer, bondIssuer, dealerA, dealerB] =
    await Promise.all(['buyer', 'regulator', 'cashIssuer', 'bondIssuer', 'dealerA', 'dealerB'].map(party));
  check('parties allocated', [buyer, regulator, cashIssuer, bondIssuer, dealerA, dealerB].every(Boolean));

  let cmdN = 0;
  // Vetting completes a moment after the upload returns, and a submit that lands in
  // that window fails with NO_SYNCHRONIZER_FOR_SUBMISSION — which reads like a queue
  // when it is a rejection. Retry rather than report a failure that is really timing.
  const submit = async (actAs, command) => {
    for (let i = 0; ; i++) {
      const r = await api('/v2/commands/submit-and-wait-for-transaction', {
        commands: { userId: 'participant_admin', commandId: `upg-${Date.now()}-${cmdN++}`, actAs: [actAs].flat(), commands: [command] },
      });
      if (r?.transaction || i === 8) return r;
      if (!/vetted|NO_SYNCHRONIZER|PACKAGE_SELECTION/i.test(JSON.stringify(r))) return r;
      await sleep(2000);
    }
  };
  const created = (tx, suffix) => tx?.transaction?.events?.map((e) => e.CreatedEvent)
    .find((e) => e && e.templateId.endsWith(suffix));

  // ---- written by the OLD package, addressed by its package id so there is no doubt
  const T = (pkg, name) => `${pkg}:Tirai:${name}`;
  const holding = (issuer, owner, instrument, amount) => ({ CreateCommand: {
    templateId: T(OLD_PKG, 'Holding'), createArguments: { issuer, owner, instrument, amount } } });
  const cash = created(await submit(cashIssuer, holding(cashIssuer, buyer, 'USDC', '5000000.0')), ':Tirai:Holding')?.contractId;
  const bondA = created(await submit(bondIssuer, holding(bondIssuer, dealerA, 'TBOND30', '1000.0')), ':Tirai:Holding')?.contractId;
  const bondB = created(await submit(bondIssuer, holding(bondIssuer, dealerB, 'TBOND30', '1000.0')), ':Tirai:Holding')?.contractId;
  check(`holdings created under ${OLD}`, !!(cash && bondA && bondB));

  const rfqTx = await submit(buyer, { CreateCommand: { templateId: T(OLD_PKG, 'RFQ'), createArguments: {
    buyer, regulator, invitedDealers: [dealerA, dealerB], instrument: 'TBOND30', quantity: '1000.0',
    payInstrument: 'USDC', assetIssuer: bondIssuer, payIssuer: cashIssuer,
    deadline: '2100-01-01T00:00:00Z', venue: null, feeBps: null } } });
  const rfq = created(rfqTx, ':Tirai:RFQ')?.contractId;
  check(`an RFQ written by ${OLD}`, !!rfq, JSON.stringify(rfqTx).slice(0, 160));

  const quote = async (dealer, price, assetCid) => created(await submit(dealer, { ExerciseCommand: {
    templateId: T(OLD_PKG, 'RFQ'), contractId: rfq, choice: 'SubmitQuote',
    choiceArgument: { dealer, price, assetCid } } }), ':Tirai:Quote')?.contractId;
  const qA = await quote(dealerA, '4210000.0', bondA);
  const qB = await quote(dealerB, '4250000.0', bondB);
  check(`two quotes sealed by the ${OLD} choice`, !!(qA && qB));

  // An 0.4.0 quote has no sealedAt. The new code reads that field, so this is the
  // exact shape that would strand if the field had not been added as an Optional.
  const acs = async (p) => {
    const off = (await api('/v2/state/ledger-end')).offset;
    const rows = await api('/v2/state/active-contracts', { activeAtOffset: off, verbose: true,
      filter: { filtersByParty: { [p]: { cumulative: [] } } } });
    return (Array.isArray(rows) ? rows : []).map((x) => x.contractEntry?.JsActiveContract?.createdEvent).filter(Boolean);
  };
  const oldQuote = (await acs(buyer)).find((c) => c.templateId.endsWith(':Tirai:Quote'));
  check('the old quote reads back with no sealedAt', oldQuote != null
    && (oldQuote.createArgument.sealedAt ?? null) === null,
    JSON.stringify(oldQuote?.createArgument?.sealedAt));

  // ---- settled by NAME, which is how the desk writes: the node picks the newest
  //      vetted version, so this exercise runs the NEW code over OLD contracts.
  const awardTx = await submit(buyer, { ExerciseCommand: {
    templateId: '#tirai-desk:Tirai:RFQ', contractId: rfq, choice: 'Award',
    choiceArgument: { quoteCids: [qA, qB], cashCid: cash } } });
  const report = created(awardTx, ':Tirai:TradeReport');
  check(`${OLD} contracts settle under ${NEW}`, !!report, JSON.stringify(awardTx).slice(0, 200));
  check('and still at the Vickrey second price', report?.createArgument?.clearingPrice === '4250000.0000000000',
    report?.createArgument?.clearingPrice);
  check(`the report was written by ${NEW}`, report?.templateId?.startsWith(NEW_PKG),
    report?.templateId?.split(':')[0]?.slice(0, 12));

  const panel = (await acs(buyer)).find((c) => c.templateId.endsWith(':Tirai:PanelRecord'));
  check('a panel record exists for an auction of old quotes', !!panel);
  check('and carries no response time it could not know',
    panel?.createArgument?.entries?.every((e) => (e.sealedAt ?? null) === null),
    JSON.stringify(panel?.createArgument?.entries?.map((e) => e.sealedAt)));
  check('while still scoring how far the loser sat from the winner',
    panel?.createArgument?.entries?.map((e) => e.fromWinnerBps).join(',') === '0.0000000000,95.0000000000',
    panel?.createArgument?.entries?.map((e) => e.fromWinnerBps).join(','));
} catch (e) {
  check('rehearsal ran to completion', false, e.message.split('\n')[0]);
} finally {
  stop();
}

const pass = R.filter((r) => r.ok).length;
console.log(`\n════ UPGRADE ${OLD} → ${NEW}: ${pass}/${R.length} passed ════`);
const bad = R.filter((r) => !r.ok);
if (bad.length) console.log('FAIL: ' + bad.map((x) => x.n).join(' | '));
process.exit(bad.length ? 1 : 0);
