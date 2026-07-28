// Self-check for the deployer's pure decision logic — the part that decides what
// gets cancelled or archived on a live ledger. Every bug found in devnet.mjs so
// far was in this layer, so it gets the one runnable check.
//   node scripts/test-devnet-logic.mjs
import assert from 'node:assert/strict';
import { orphansOf } from './devnet.mjs';

const PKG = 'abc123';
const req = (tpl, cid, extra = {}) => ({ templateId: `${PKG}:Tirai:${tpl}`, contractId: cid, createArgument: extra });
const quote = (tpl, cid, rfqId) => ({ templateId: `${PKG}:Tirai:${tpl}`, contractId: cid, createArgument: { rfqId } });

let passed = 0;
const ok = (name, fn) => { fn(); console.log('  ✓', name); passed++; };

ok('a request with a quote pointing at it is not an orphan', () => {
  const acs = [req('RFQ', 'r1'), quote('Quote', 'q1', 'r1')];
  assert.deepEqual(orphansOf(acs, 'RFQ', 'Quote'), []);
});

ok('a request nothing points at is an orphan', () => {
  const acs = [req('RFQ', 'r1'), quote('Quote', 'q1', 'r2')];
  assert.deepEqual(orphansOf(acs, 'RFQ', 'Quote').map((r) => r.contractId), ['r1']);
});

ok('a quote with rfqId null (Optional None) does not shield anything', () => {
  const acs = [req('RFQ', 'r1'), quote('Quote', 'q1', null)];
  assert.deepEqual(orphansOf(acs, 'RFQ', 'Quote').map((r) => r.contractId), ['r1']);
});

ok('baskets are matched against basket quotes, not single quotes', () => {
  // The bug this guards: matching BasketRFQ against the wrong quote template
  // would make every live basket look like a shell and archive it.
  const acs = [req('BasketRFQ', 'b1'), quote('BasketQuote', 'bq1', 'b1'), quote('Quote', 'q1', 'r9')];
  assert.deepEqual(orphansOf(acs, 'BasketRFQ', 'BasketQuote'), []);
});

ok('single RFQs and basket RFQs never shadow each other', () => {
  // ':Tirai:RFQ' must not also match ':Tirai:BasketRFQ' by suffix.
  const acs = [req('BasketRFQ', 'b1'), req('RFQ', 'r1'), quote('Quote', 'q1', 'r1')];
  assert.deepEqual(orphansOf(acs, 'RFQ', 'Quote'), [], 'r1 is quoted, b1 is a different template');
  assert.deepEqual(orphansOf(acs, 'BasketRFQ', 'BasketQuote').map((r) => r.contractId), ['b1']);
});

ok('an empty ledger yields no orphans', () => {
  assert.deepEqual(orphansOf([], 'RFQ', 'Quote'), []);
});

console.log(`\n════ DEVNET LOGIC: ${passed}/${passed} passed ════`);
