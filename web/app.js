// Tirai desk — three party views of one Canton ledger, via the JSON Ledger API.
// The privacy is real: each panel only ever receives the contracts its party is
// a stakeholder of. Dealer B's column cannot show Dealer A's quote because the
// ledger never sends it to Dealer B's node.

const T = (t) => `Tirai:${t}`; // template-name suffix matcher
let PKG = null;                // discovered model package id (for fresh creates)
let USER_ID = 'participant_admin';
let CFG_PARTIES = {};          // issuer party ids from server config (DevNet)
const P = {};                  // role -> full party id
let awardable = null;          // { rfqCid, tpl, quoteCids, cashCid, qty } when buyer can award
let cancelableRfq = null;      // { cid, tpl } of the buyer's live RFQ (buyer can cancel it)
let READONLY = false;          // hosted public demo: the server allows reads only

const api = async (path, method = 'GET', body) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000); // a wedged gateway must not hang forever
  let r;
  try {
    r = await fetch('/api' + path, {
      method, signal: ctrl.signal,
      headers: { 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } finally { clearTimeout(timer); }
  const text = await r.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  if (!r.ok) {
    const msg = typeof json === 'string' ? json
      : (json.cause || json.error || json.message || json.errors?.[0]?.message || text || `HTTP ${r.status}`);
    throw new Error(msg);
  }
  return json;
};

// Retry read-only calls a couple of times — DevNet's gateway returns transient
// 502/503s. Safe because these are idempotent; command submits are NOT retried.
const retryRead = async (fn, tries = 3) => {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) { last = e; await new Promise((r) => setTimeout(r, 400 * (i + 1))); }
  }
  throw last;
};

const ledgerEnd = async () => {
  const r = await api('/v2/state/ledger-end');
  if (typeof r.offset !== 'number') throw new Error('ledger-end returned no offset');
  return r.offset;
};

// Active contracts for a party AT a known offset — the caller fetches ledger-end
// once and shares it across parties, so a refresh is 1 ledger-end + N parallel
// queries instead of one ledger-end per party (much faster with many contracts).
// The templates this desk renders, in groups. Two constraints pull against each
// other: the node refuses any response over 200 elements (a busy buyer passed
// that, which is why a wildcard read no longer works), but one request per
// template means four parties x nine templates per refresh, and that burst is
// enough to make the serverless proxy fail. Grouping keeps every response well
// under the cap at three requests per party. Template filters take the package
// NAME, which is stable across package versions.
const DESK_TEMPLATE_GROUPS = [
  ['Holding'],
  ['TradeReport', 'BasketTradeReport', 'QuoteDisclosure'],
  ['RFQ', 'Quote', 'TokenTrade', 'BasketRFQ', 'BasketQuote'],
];

const acsGroup = async (party, tpls, off) => {
  const rows = await api('/v2/state/active-contracts', 'POST', {
    filter: { filtersByParty: { [party]: { cumulative: tpls.map((tpl) => ({ identifierFilter: {
      TemplateFilter: { value: { templateId: `#tirai-desk:Tirai:${tpl}`, includeCreatedEventBlob: false } },
    } })) } } },
    verbose: true,
    activeAtOffset: off,
  });
  if (!Array.isArray(rows)) throw new Error('active-contracts returned no array');
  return rows.map((r) => r.contractEntry?.JsActiveContract?.createdEvent).filter(Boolean)
    .map((e) => ({ cid: e.contractId, tpl: e.templateId, arg: e.createArgument }));
};

const acsAt = (party, off) => retryRead(async () => {
  const groups = await Promise.all(DESK_TEMPLATE_GROUPS.map(async (tpls) => {
    const rows = await api('/v2/state/active-contracts', 'POST', {
      filter: { filtersByParty: { [party]: { cumulative: tpls.map((tpl) => ({ identifierFilter: {
        TemplateFilter: { value: { templateId: `#tirai-desk:Tirai:${tpl}`, includeCreatedEventBlob: false } },
      } })) } } },
      verbose: true,
      activeAtOffset: off,
    });
    if (!Array.isArray(rows)) {
      // The node refuses any response over 200 elements. If a group ever crosses
      // that, read its templates one at a time rather than losing the whole view.
      if (tpls.length > 1 && /MAXIMUM_LIST_ELEMENTS/i.test(JSON.stringify(rows))) {
        const singly = await Promise.all(tpls.map((t) => acsGroup(party, [t], off)));
        return singly.flat();
      }
      throw new Error('active-contracts returned no array');
    }
    return rows
      .map((r) => r.contractEntry?.JsActiveContract?.createdEvent)
      .filter(Boolean)
      .map((e) => ({ cid: e.contractId, tpl: e.templateId, arg: e.createArgument }));
  }));
  return groups.flat();
});
const acs = async (party) => acsAt(party, await ledgerEnd());

const is = (c, name) => typeof c.tpl === 'string' && c.tpl.endsWith(T(name));

const submit = async (party, cmd) => {
  const commandId = (crypto.randomUUID?.() ?? 'ui-' + Math.random().toString(36).slice(2) + Date.now());
  return api('/v2/commands/submit-and-wait-for-transaction', 'POST', {
    commands: { userId: USER_ID, commandId, actAs: [party], commands: [cmd] },
  });
};

const fmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 10 });
// Readable dealer name: the party id-hint (before ::), e.g. "tirai-dealerA-1" or "DealerA".
const dealerLabel = (party) => esc(party.split('::')[0]);
// Escape ledger-sourced strings before putting them in innerHTML (instrument, etc.).
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Validate a positive decimal from an input; return the trimmed string (no lossy
// reformatting) or null. Daml Decimal accepts up to 10 fractional digits.
const posDec = (raw) => {
  const s = String(raw).trim();
  // Plain decimal only. A number <input> also accepts "1e5", ".5", "1000." — all of
  // which would reach the ledger as a malformed Daml Decimal; reject them here.
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  if (!(Number(s) > 0)) return null;
  if (/\.\d{11,}/.test(s)) return null; // more precision than Daml Decimal holds
  return s.includes('.') ? s : s + '.0';
};

let toastEl, toastTimer;
const toast = (msg, err = false) => {
  if (!toastEl) {
    toastEl = document.createElement('div'); toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.className = 'toast show' + (err ? ' err' : '');
  clearTimeout(toastTimer);
  // An error stays until it is dismissed: 2.6 seconds is not long enough to read a
  // ledger error, and a message that erases itself reads as "nothing happened".
  if (err) {
    toastEl.className += ' sticky';
    toastEl.onclick = () => { toastEl.className = 'toast'; toastEl.onclick = null; };
  } else {
    toastEl.onclick = null;
    toastTimer = setTimeout(() => (toastEl.className = 'toast'), 2600);
  }
};

// Hosted public demo: the server proxies reads only. Reflect that in the UI —
// disable the write buttons and show a banner. (Security is enforced server-side;
// this is just so the buttons don't look broken.)
const RO_MSG = 'Read-only public demo — clone the repo and run `npm run demo` to drive the flow yourself.';
function enterReadOnly() {
  READONLY = true;
  // Leave the action buttons ENABLED so a click gives a helpful explanation (a
  // disabled button is silently dead); the handlers below no-op with a toast, and
  // the server blocks the write regardless.
  const bar = document.createElement('div');
  bar.textContent = 'Read-only public demo · live Canton Devnet state — actions are disabled. Clone the repo and run `npm run demo` to drive it.';
  bar.style.cssText = 'position:sticky;top:0;z-index:10;padding:6px 12px;font-size:13px;text-align:center;background:#1c2733;color:#8fb4d6;border-bottom:1px solid #2a3947';
  // Insert inside .main (not <body>) — <body class="app"> is a CSS grid, and a
  // banner as a grid child would steal a cell and break the sidebar/desk layout.
  (document.querySelector('.main') ?? document.body).prepend(bar);
}

// ---- discovery ----
async function loadParties(configParties) {
  if (configParties && configParties.buyer) {
    Object.assign(P, configParties); // DevNet: known party IDs from server config
  } else {
    const { partyDetails } = await api('/v2/parties'); // sandbox: discover by id-hint prefix
    const find = (pfx) => partyDetails.find((p) => p.party.startsWith(pfx + '-') || p.party.startsWith(pfx + '::'))?.party;
    P.buyer = find('Buyer'); P.dealerA = find('DealerA'); P.dealerB = find('DealerB'); P.regulator = find('Regulator');
  }
  for (const role of ['buyer', 'dealerA', 'dealerB', 'regulator']) {
    const el = document.getElementById('pid-' + role);
    if (el && P[role]) el.textContent = P[role].split('::')[0];
  }
  return P.buyer && P.dealerA && P.dealerB;
}

// ---- rendering ----
function holdingsHtml(contracts, owner) {
  const hs = contracts.filter((c) => is(c, 'Holding') && c.arg.owner === owner);
  if (!hs.length) return '<div class="empty">none</div>';
  return hs.map((c) => `<div>${esc(c.arg.instrument)} · ${fmt(c.arg.amount)}</div>`).join('');
}

function renderBuyer(mine) {
  const box = document.getElementById('buyer-quotes');
  // Don't clobber a half-typed partial-fill input (and its focus) mid-edit — the
  // 1.8s poll would otherwise wipe it. Mirrors the dealer-panel guard.
  if (box.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return;
  const rfqs = mine.filter((c) => is(c, 'RFQ'));
  const allQuotes = mine.filter((c) => is(c, 'Quote'));
  awardable = null;

  // Scope everything to ONE RFQ: whichever the Active RFQs list selected, else the
  // first that has quotes, else the first open one.
  const rfq = (selectedRfq && rfqs.find((r) => r.cid === selectedRfq))
    ?? rfqs.find((r) => allQuotes.some((q) => q.arg.rfqId === r.cid)) ?? rfqs[0];
  const quotes = rfq ? allQuotes.filter((q) => q.arg.rfqId === rfq.cid) : [];

  if (!quotes.length) {
    box.innerHTML = rfqs.length
      ? '<div class="empty">RFQ live — waiting for dealers to quote…</div>'
      : '<div class="empty">No quotes yet.</div>';
  } else {
    const sorted = [...quotes].sort((a, b) =>
      Number(a.arg.price) - Number(b.arg.price) || a.arg.dealer.localeCompare(b.arg.dealer));
    const winCid = sorted[0].cid;
    const clearing = Number((sorted[1] ?? sorted[0]).arg.price);
    // Per-quote "Accept" = direct bilateral OTC: settle THIS dealer at its own
    // ask (SettleQuote at clearingPrice = price), instead of the competitive
    // Vickrey Award (2nd price) below. Same atomic DvP, same sealed privacy.
    box.innerHTML = sorted.map((c) => {
      const cashFor = mine.find((h) => is(h, 'Holding') && h.arg.owner === P.buyer
        && h.arg.instrument === c.arg.payInstrument && Number(h.arg.amount) >= Number(c.arg.price));
      return `
      <div class="card ${c.cid === winCid ? 'win' : ''}">
        <div class="row"><span>${dealerLabel(c.arg.dealer)}</span><span class="price">${fmt(c.arg.price)} ${esc(c.arg.payInstrument)}</span></div>
        <div class="sub">${esc(c.arg.instrument)} · ${fmt(c.arg.quantity)}${c.cid === winCid ? ' · Vickrey winner, pays 2nd price ' + fmt(clearing) : ''}</div>
        ${cashFor ? `<button class="ghost accept" style="margin-top:8px" data-accept="${c.cid}" data-tpl="${esc(c.tpl)}" data-cash="${cashFor.cid}" data-price="${esc(c.arg.price)}">Accept · direct OTC (pay ask ${fmt(c.arg.price)})</button>
        <div class="form" style="margin-top:6px">
          <label>Partial fill <input type="number" id="fill-${c.cid}" value="${esc(c.arg.quantity)}" min="0" max="${esc(c.arg.quantity)}" /></label>
          <button class="ghost" data-partial="${c.cid}" data-tpl="${esc(c.tpl)}" data-cash="${cashFor.cid}">Fill partial (prorated)</button>
        </div>` : ''}
        ${P.regulator ? `<button class="ghost disclose" style="margin-top:6px" data-disclose="${c.cid}" data-tpl="${esc(c.tpl)}">⚖ Disclose to regulator (best-execution audit)</button>` : ''}
        <button class="ghost" style="margin-top:6px" data-reject="${c.cid}" data-tpl="${esc(c.tpl)}">Reject quote (return escrow)</button>
      </div>`;
    }).join('');

    // Settlement takes ONE cash holding (SettleQuote/Award pass a single cashCid). If the
    // buyer's cash is split so no single holding covers the clearing price — even though
    // the total does — Accept/Award vanish. Say so, instead of leaving the buttons silently
    // gone. (A production build would add a Holding.Merge choice.)
    const usdc = mine.filter((h) => is(h, 'Holding') && h.arg.owner === P.buyer && h.arg.instrument === rfq.arg.payInstrument);
    const totalCash = usdc.reduce((s, h) => s + Number(h.arg.amount), 0);
    const maxCash = usdc.reduce((m, h) => Math.max(m, Number(h.arg.amount)), 0);
    if (maxCash < clearing && totalCash >= clearing) {
      box.innerHTML += `<div class="blind" style="text-align:left;font-style:normal">⚠ Your ${esc(rfq.arg.payInstrument)} is split across ${usdc.length} holdings — the largest is ${fmt(maxCash)}, but the ${fmt(clearing)} clearing price needs one holding to cover it. Total held: ${fmt(totalCash)}. (Settlement passes a single cash holding.)</div>`;
    }

    const cash = mine.find((c) => is(c, 'Holding') && c.arg.owner === P.buyer
      && c.arg.instrument === rfq.arg.payInstrument && Number(c.arg.amount) >= clearing);
    if (rfq && cash) awardable = { rfqCid: rfq.cid, tpl: rfq.tpl, quoteCids: sorted.map((c) => c.cid), cashCid: cash.cid, qty: Number(rfq.arg.quantity) };
  }
  document.getElementById('btn-award').disabled = !awardable;

  // Partial-Vickrey: same sealed auction, but the buyer takes only part of the
  // winning lot at the 2nd price, prorated. Shown whenever a full award is possible.
  const pRow = document.getElementById('award-partial-row');
  const pBtn = document.getElementById('btn-award-partial');
  const fillIn = document.getElementById('award-fill');
  if (awardable) {
    pRow.style.display = ''; pBtn.disabled = false; fillIn.max = awardable.qty;
    if (document.activeElement !== fillIn && (!fillIn.value || Number(fillIn.value) > awardable.qty)) fillIn.value = awardable.qty;
  } else { pRow.style.display = 'none'; pBtn.disabled = true; }

  // Cancel own RFQ — the buyer is its sole signatory, so it can archive a live RFQ
  // at any time (e.g. a stray or mistaken one). Any escrowed quotes stay until the
  // dealer withdraws them.
  const cBtn = document.getElementById('btn-cancel-rfq');
  if (rfq) { cBtn.style.display = ''; cancelableRfq = { cid: rfq.cid, tpl: rfq.tpl }; }
  else { cBtn.style.display = 'none'; cancelableRfq = null; }
}

// Buyer's basket lane: show the open basket RFQ and any sealed basket quotes,
// each settleable in one atomic multi-leg DvP.
function renderBasketBuyer(mine) {
  const box = document.getElementById('buyer-baskets');
  if (!box) return;
  const rfqs = mine.filter((c) => is(c, 'BasketRFQ'));
  const quotes = mine.filter((c) => is(c, 'BasketQuote'));
  if (!rfqs.length && !quotes.length) { box.innerHTML = '<div class="empty">No basket RFQ open.</div>'; return; }
  if (!quotes.length) { box.innerHTML = '<div class="empty">Basket RFQ live — waiting for dealers…</div>'; return; }
  box.innerHTML = quotes.map((c) => {
    const legs = c.arg.legs.map((l) => `${esc(l.instrument)} ×${fmt(l.quantity)}`).join(' + ');
    const cash = mine.find((h) => is(h, 'Holding') && h.arg.owner === P.buyer
      && h.arg.instrument === c.arg.payInstrument && Number(h.arg.amount) >= Number(c.arg.price));
    return `<div class="card">
      <div class="row"><span>${dealerLabel(c.arg.dealer)}</span><span class="price">${fmt(c.arg.price)} ${esc(c.arg.payInstrument)}</span></div>
      <div class="sub">${legs}</div>
      ${cash ? `<button class="ghost" style="margin-top:6px" data-basketsettle="${c.cid}" data-tpl="${esc(c.tpl)}" data-cash="${cash.cid}">Accept basket · atomic multi-leg DvP</button>` : ''}
      <button class="ghost" style="margin-top:6px" data-basketreject="${c.cid}" data-tpl="${esc(c.tpl)}">Reject basket (return all legs)</button>
    </div>`;
  }).join('');
}

function renderDealer(role, mine) {
  const panel = document.getElementById('body-' + role);
  // Don't clobber a half-typed ask price (and focus) mid-edit — the poll runs
  // every 1.8s and would otherwise reset the input to its default each tick.
  if (panel.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return;
  const party = P[role];
  const rfqs = mine.filter((c) => is(c, 'RFQ')); // dealer observes only RFQs they're invited to
  const myQuotes = mine.filter((c) => is(c, 'Quote') && c.arg.dealer === party);
  const bonds = mine.filter((c) => is(c, 'Holding') && c.arg.owner === party);
  const quotedRfqs = new Set(myQuotes.map((q) => q.arg.rfqId));

  const rfqCards = rfqs.map((r) => {
    const already = quotedRfqs.has(r.cid);
    const bond = bonds.find((b) => b.arg.instrument === r.arg.instrument && Number(b.arg.amount) === Number(r.arg.quantity));
    const canQuote = !already && bond;
    return `
      <div class="card">
        <div class="row"><span>RFQ · ${esc(r.arg.instrument)}</span><span class="sub">qty ${fmt(r.arg.quantity)}</span></div>
        ${already ? '<div class="sub">you have quoted (sealed)</div>' :
          canQuote ? `<div class="form" style="margin-top:8px">
              <label>Ask (${esc(r.arg.payInstrument)}) <input type="number" id="ask-${role}-${r.cid}" value="4230000" /></label>
              <button data-quote="${role}" data-rfq="${r.cid}" data-bond="${bond.cid}" data-tpl="${esc(r.tpl)}">Whisper sealed quote</button>
            </div>` : '<div class="sub">no matching asset to quote</div>'}
      </div>`;
  }).join('');

  const mineCards = myQuotes.map((q) => `
      <div class="card"><div class="row"><span>your quote</span><span class="price">${fmt(q.arg.price)}</span></div>
      <div class="sub">${esc(q.arg.instrument)} · ${fmt(q.arg.quantity)} · sealed to buyer only</div>
      ${P.regulator ? `<button class="ghost disclose" style="margin-top:8px" data-dealerdisclose="${q.cid}" data-tpl="${esc(q.tpl)}" data-role="${role}">⚖ Disclose to regulator (fair-pricing defence)</button>` : ''}
      <button class="ghost" style="margin-top:6px" data-withdraw="${q.cid}" data-tpl="${esc(q.tpl)}" data-role="${role}">Withdraw quote (release escrow)</button>
      </div>`).join('');

  // ---- multi-instrument baskets: a dealer quotes ONE price for the whole package ----
  const basketRfqs = mine.filter((c) => is(c, 'BasketRFQ'));
  const myBasketQuotes = mine.filter((c) => is(c, 'BasketQuote') && c.arg.dealer === party);
  const quotedBaskets = new Set(myBasketQuotes.map((q) => q.arg.rfqId));
  const basketCards = basketRfqs.map((r) => {
    const already = quotedBaskets.has(r.cid);
    // one owned holding per leg (matching instrument + quantity), in leg order
    const legAssets = r.arg.legs.map((leg) => bonds.find((b) => b.arg.instrument === leg.instrument && Number(b.arg.amount) === Number(leg.quantity)));
    const haveAll = legAssets.every(Boolean);
    const legTxt = r.arg.legs.map((l) => `${esc(l.instrument)} ×${fmt(l.quantity)}`).join(' + ');
    return `
      <div class="card">
        <div class="row"><span>Basket RFQ</span><span class="sub">${legTxt}</span></div>
        ${already ? '<div class="sub">you have quoted (sealed)</div>' :
          haveAll ? `<div class="form" style="margin-top:8px">
              <label>Basket ask (USDC) <input type="number" id="bask-${role}-${r.cid}" value="4400000" /></label>
              <button data-basketquote="${role}" data-rfq="${r.cid}" data-tpl="${esc(r.tpl)}" data-assets="${legAssets.map((a) => a.cid).join(',')}">Whisper basket quote</button>
            </div>` : '<div class="sub">no matching assets for all legs</div>'}
      </div>`;
  }).join('');
  const myBasketCards = myBasketQuotes.map((q) => {
    const legTxt = q.arg.legs.map((l) => `${esc(l.instrument)} ×${fmt(l.quantity)}`).join(' + ');
    return `<div class="card"><div class="row"><span>your basket quote</span><span class="price">${fmt(q.arg.price)}</span></div>
      <div class="sub">${legTxt} · sealed to buyer only</div>
      <button class="ghost" style="margin-top:8px" data-basketwithdraw="${q.cid}" data-tpl="${esc(q.tpl)}" data-role="${role}">Withdraw basket quote (release all legs)</button></div>`;
  }).join('');
  const basketBlock = (basketRfqs.length || myBasketQuotes.length)
    ? `<div class="block"><h3>Incoming baskets <span class="hint">(multi-leg)</span></h3><div class="list">${basketCards || '<div class="empty">none</div>'}</div>`
      + (myBasketCards ? `<h3 style="margin-top:14px">Your basket quotes <span class="hint">(rivals can't see these)</span></h3><div class="list">${myBasketCards}</div>` : '')
      + `</div>`
    : '';

  panel.innerHTML = `
    <div class="block"><h3>Incoming RFQs</h3><div class="list">${rfqCards || '<div class="empty">none</div>'}</div></div>
    <div class="block"><h3>Your quotes <span class="hint">(rivals can't see these)</span></h3>
      <div class="list">${mineCards || '<div class="blind">You only ever see your own quotes.<br>Rival dealers’ quotes are never sent to your node.</div>'}</div></div>
    ${basketBlock}`;
}

function renderRegulator(mine) {
  if (!P.regulator || !mine) return 0;
  const reports = mine.filter((c) => is(c, 'TradeReport'));
  const baskets = mine.filter((c) => is(c, 'BasketTradeReport'));
  const total = reports.length + baskets.length;
  const parts = [
    ...reports.map((r) => `${esc(r.arg.instrument)} ${fmt(r.arg.quantity)} @ ${fmt(r.arg.clearingPrice)}`),
    ...baskets.map((r) => `basket [${r.arg.legs.map((l) => esc(l.instrument)).join(' + ')}] @ ${fmt(r.arg.clearingPrice)}`),
  ];
  const el = document.getElementById('regulator-view');
  el.innerHTML = total
    ? 'Regulator sees ' + total + ' settled trade(s): ' + parts.join(', ') +
      ' — and nothing about the losing quotes or the RFQ.'
    : 'Regulator view: no settled trades yet (and zero visibility into live RFQs or quotes).';
  return total;
}

// ---- view switcher (sidebar): the 3-column desk · Portfolio · Audit trail ----
let lastReg = [];
let lastAcs = { buyer: [], dealerA: [], dealerB: [] };
let currentView = 'rfqs';
const VIEWS = ['rfqs', 'create', 'activity', 'portfolio', 'audit', 'bestexec', 'verify'];

function showView(v) {
  currentView = v;
  // The three-column view is the side-by-side privacy proof, not the home screen:
  // a deployed desk shows you one identity, not everyone's at once.
  const desk = v === 'desk';
  document.querySelector('.desk').style.display = desk ? '' : 'none';
  document.querySelector('.foot').style.display = desk ? '' : 'none';
  for (const name of VIEWS) document.getElementById('view-' + name).hidden = v !== name;
  const ht = document.getElementById('howto'); if (ht) ht.style.display = desk ? '' : 'none';
  document.querySelectorAll('.side-nav a[data-view]').forEach((a) => a.classList.toggle('on', a.dataset.view === v));
  if (v === 'audit') renderAudit();
  if (v === 'rfqs') renderActive();
  if (v === 'create') renderCreate();
  if (v === 'activity') renderActivity();
  if (v === 'portfolio') renderPortfolio();
  if (v === 'verify') renderVerify();
  if (v === 'bestexec') renderBestExec();
}

// ---- Active RFQs: the whole book in one list ----
// The three-column desk deliberately scopes to ONE auction at a time, which hides
// every other live request. This table is the index: pick a row and the desk
// re-scopes to it. Rows come from contracts the party already has — no extra read.
let rfqFilter = 'all';
let selectedRfq = null;
let lastLoaded = false; // the first ACS poll has landed

// ---- identity ----------------------------------------------------------
// A deployed desk authenticates one party per session. This switcher is the
// honest local equivalent: choose who you are, and every view below shows only
// what that party's participant node actually holds. Nothing is filtered client
// side — switching identity switches which node's contracts we read.
const ROLES = { buyer: 'Buyer', dealerA: 'Dealer A', dealerB: 'Dealer B', regulator: 'Regulator' };
let ACTING = 'buyer';
try { ACTING = localStorage.getItem('tirai.acting') ?? 'buyer'; } catch { /* private mode */ }
if (!ROLES[ACTING]) ACTING = 'buyer';

const actingParty = () => P[ACTING];
const actingAcs = () => (ACTING === 'regulator' ? lastReg : lastAcs[ACTING]) ?? [];
const isDealer = () => ACTING === 'dealerA' || ACTING === 'dealerB';

function setActing(role) {
  if (!ROLES[role]) return;
  ACTING = role;
  try { localStorage.setItem('tirai.acting', role); } catch { /* ignore */ }
  selectedRfq = null;
  rfqFilter = 'all'; // a filter chosen as one identity empties the next one's book
  closeModal();
  renderIdentity();
  renderActive();
  refresh(); // the tiles and their labels are computed in the refresh loop
  // The create page belongs to the buy side; leaving it selected as a dealer
  // would show a form that cannot submit.
  if (currentView === 'create' && role !== 'buyer') showView('rfqs');
}

function renderIdentity() {
  const sel = document.getElementById('acting-as');
  if (sel && sel.value !== ACTING) sel.value = ACTING;
  const pid = document.getElementById('ident-pid');
  if (pid) pid.textContent = actingParty() ? actingParty().split('::')[0] : '—';
  const bal = document.getElementById('ident-balance');
  if (bal) {
    const byInst = {};
    for (const h of actingAcs()) {
      if (!is(h, 'Holding') || h.arg.owner !== actingParty()) continue;
      byInst[h.arg.instrument] = (byInst[h.arg.instrument] ?? 0) + Number(h.arg.amount);
    }
    const top = Object.entries(byInst).sort((a, b) => b[1] - a[1])[0];
    bal.textContent = top ? `${fmt(top[1])} ${top[0]}` : 'no positions';
  }
  // Only the buy side can open a request.
  const cta = document.getElementById('btn-new-rfq');
  if (cta) cta.style.display = ACTING === 'buyer' ? '' : 'none';
  const createNav = document.querySelector('.side-nav a[data-view="create"]');
  if (createNav) createNav.style.display = ACTING === 'buyer' ? '' : 'none';
}

// ---- the book ----------------------------------------------------------
// One row per request this identity can see. A dealer only ever sees requests it
// was invited to, and against them only its own sealed quote — that is the ledger
// speaking, not a filter applied here.
function rfqRows() {
  const mine = actingAcs();
  const me = actingParty();
  const quotes = mine.filter((c) => is(c, 'Quote'));
  const shortOf = (party) => (party ?? '').split('::')[0].replace(/^tirai-v\d+-/, '');
  const open = mine.filter((c) => is(c, 'RFQ')).map((r) => {
    const qs = quotes.filter((q) => q.arg.rfqId === r.cid);
    const invited = r.arg.invitedDealers ?? [];
    // The best ask this identity can see: every sealed quote for the buy side, its
    // own only for a dealer. Empty when nobody has quoted.
    const best = qs.length ? Math.min(...qs.map((q) => Number(q.arg.price))) : null;
    return {
      best,
      counterparty: r.arg.buyer === me
        ? (invited.map(shortOf).join(' + ') || '—')
        : shortOf(r.arg.buyer),
      kind: 'open', cid: r.cid, tpl: r.tpl,
      instrument: r.arg.instrument, quantity: r.arg.quantity, pay: r.arg.payInstrument,
      maker: r.arg.buyer, invited, quotes: qs.length,
      myQuote: qs.find((q) => q.arg.dealer === me) ?? null,
      canQuote: mine.some((c) => is(c, 'Holding') && c.arg.owner === me
        && c.arg.instrument === r.arg.instrument && Number(c.arg.amount) === Number(r.arg.quantity)),
      mode: invited.length > 1 ? 'Auction' : 'Direct',
      mine: r.arg.buyer === me, forMe: invited.includes(me),
      status: qs.length ? 'Open' : 'Awaiting quotes', price: null,
    };
  });
  const done = mine.filter((c) => is(c, 'TradeReport')).map((t) => ({
    best: null, counterparty: shortOf(t.arg.buyer === me ? t.arg.dealer : t.arg.buyer),
    kind: 'filled', cid: t.cid, tpl: t.tpl,
    instrument: t.arg.instrument, quantity: t.arg.quantity, pay: '',
    maker: t.arg.buyer, invited: [], quotes: 0, myQuote: null,
    mode: '—', mine: t.arg.buyer === me, forMe: t.arg.dealer === me,
    status: 'Filled', price: t.arg.clearingPrice, dealer: t.arg.dealer,
  }));
  return [...open, ...done];
}

// What this identity may do with a row, following the model's own rules.
function rowAction(r) {
  if (r.kind === 'filled') return { label: 'Receipt', act: 'receipt' };
  if (ACTING === 'buyer' && r.mine) return r.quotes ? { label: 'Settle', act: 'settle', primary: true } : { label: 'Cancel', act: 'cancel' };
  if (isDealer() && r.forMe) {
    if (r.myQuote) return { label: 'Sealed', act: 'myquote' };
    // Offering "Quote" when this identity holds no lot of the right size promises
    // something the dialog then has to take back.
    return r.canQuote ? { label: 'Quote', act: 'quote', primary: true } : { label: 'No inventory', act: 'quote' };
  }
  return { label: 'View', act: 'receipt' };
}

let pointerDown = false;
document.addEventListener('pointerdown', () => { pointerDown = true; });
document.addEventListener('pointerup', () => { pointerDown = false; });

// Replacing innerHTML throws away whatever the keyboard was on. Remember the one
// thing that identifies the focused control, and put focus back on its replacement.
function keepFocus(render) {
  const a = document.activeElement;
  const key = a?.dataset?.filter ? `.rfq-chip[data-filter="${a.dataset.filter}"]`
    : a?.dataset?.rfq ? `.rfq-act[data-rfq="${a.dataset.rfq}"]`
    : a?.dataset?.row ? `tr[data-row="${a.dataset.row}"]`
    : null;
  render();
  if (key) document.querySelector(key)?.focus();
}

function renderActive() {
  const table = document.getElementById('rfq-table'); if (!table) return;
  // Replacing the table between mousedown and mouseup swallows the click with no
  // error and no feedback — the worst possible failure in front of an audience.
  if (pointerDown && table.querySelector('tr')) return;
  // Live requests first, and among them the ones with quotes waiting on you;
  // settled rows fall to the bottom as history.
  const rank = (r) => (r.kind === 'filled' ? 2 : r.quotes ? 0 : 1);
  const all = rfqRows().sort((a, b) => rank(a) - rank(b) || a.instrument.localeCompare(b.instrument));
  const pass = { all: () => true, mine: (r) => r.mine, forme: (r) => r.forMe };
  const counts = { all: all.length, mine: all.filter(pass.mine).length, forme: all.filter(pass.forme).length };
  const q = (document.getElementById('rfq-search')?.value ?? '').trim().toUpperCase();
  const rows = all.filter(pass[rfqFilter] ?? pass.all).filter((r) => !q || r.instrument.toUpperCase().includes(q));

  const chips = document.getElementById('rfq-chips');
  if (chips) chips.innerHTML = [['all', 'All'], ['mine', 'Mine'], ['forme', 'For me']]
    .map(([k, label]) => `<button class="rfq-chip${rfqFilter === k ? ' on' : ''}" data-filter="${k}" aria-pressed="${rfqFilter === k}">${label} <span>${counts[k]}</span></button>`).join('');
  const count = document.getElementById('rfq-count');
  if (count) count.textContent = rows.length === all.length ? `${rows.length} shown` : `${rows.length} of ${all.length} shown`;

  table.innerHTML = rows.length ? '<table class="audit rfq-table"><thead><tr>'
    + '<th>Request</th><th>Instrument</th><th class="num">Quantity</th><th>Mode</th><th>Counterparty</th>'
    + '<th>Cash leg</th><th class="num">Price</th><th class="num">Sealed quotes</th><th>Status</th><th></th>'
    + '</tr></thead><tbody>'
    + rows.map((r) => {
      const a = rowAction(r);
      return `<tr class="${r.cid === selectedRfq ? 'sel' : ''}">
        <td class="mono">${esc(r.cid.slice(0, 8))}</td>
        <td class="hi">${esc(r.instrument)}</td>
        <td class="num">${fmt(r.quantity)}</td>
        <td class="mode">${esc(r.mode)}</td>
        <td>${esc(r.counterparty)}</td>
        <td>${esc(r.pay) || '—'}</td>
        <td class="num">${r.price != null ? `<span class="hi">${fmt(r.price)}</span>` : r.best != null ? `${fmt(r.best)} <span class="sub">best</span>` : '—'}</td>
        <td class="num">${r.kind === 'filled' ? '—' : r.quotes}</td>
        <td><span class="pill ${r.status === 'Filled' ? 'ok' : r.quotes ? 'live' : 'wait'}">${esc(r.status)}</span></td>
        <td><button class="ghost rfq-act" data-act="${a.act}" data-rfq="${esc(r.cid)}">${esc(a.label)}</button></td>
      </tr>`.replace('<tr ', () => `<tr data-row="${esc(r.cid)}" data-rowact="${a.act}" tabindex="0" `);
    }).join('')
    + '</tbody></table>'
    : `<div class="audit-empty">${!P.buyer || !lastLoaded
        ? 'Reading the book from the ledger…'
        : all.length
        ? 'No request matches that filter.'
        : ACTING === 'buyer'
          ? 'No requests yet — open one with "New RFQ".'
          : 'Nothing addressed to this identity yet. A dealer only sees the requests it was invited to.'}</div>`;
}

// ---- dialogs -----------------------------------------------------------
let modalOpener = null, modalReturnTo = null;
function openModal(title, html, returnTo) {
  const host = document.getElementById('modal-host'); if (!host) return;
  // The opener is usually a table button, and the 1.8s re-render detaches it — so
  // remember how to find its replacement, not just the node itself.
  modalOpener = document.activeElement;
  modalReturnTo = returnTo ?? null;
  document.getElementById('modal-title').textContent = title;
  const body = document.getElementById('modal-body');
  body.innerHTML = html;
  host.hidden = false;
  // Into the body, not onto the close button: the head comes first in the DOM.
  (body.querySelector('input, select, button') ?? document.getElementById('modal-x'))?.focus();
}
function closeModal() {
  const host = document.getElementById('modal-host');
  if (!host || host.hidden) return;
  host.hidden = true;
  // Give the keyboard back to whatever opened it, not to <body>.
  const back = (modalReturnTo && document.querySelector(modalReturnTo))
    ?? (modalOpener?.isConnected ? modalOpener : null);
  back?.focus();
  modalOpener = null; modalReturnTo = null;
}

function openRow(cid, act) {
  const r = rfqRows().find((x) => x.cid === cid);
  if (!r) return;
  selectedRfq = cid;
  const backToRow = `.rfq-act[data-rfq="${cid.replace(/"/g, '')}"]`;
  if (act === 'quote') {
    // Only a lot matching the request exactly can back a quote — the model rejects
    // anything else, so say so here rather than failing on submit.
    const lot = actingAcs().find((c) => is(c, 'Holding') && c.arg.owner === actingParty()
      && c.arg.instrument === r.instrument && Number(c.arg.amount) === Number(r.quantity));
    openModal(`Seal a quote · ${r.instrument}`, lot
      ? `<div class="form">
           <label>Your ask (${esc(r.pay)}) <input type="number" id="modal-ask" value="4230000" /></label>
           <button id="modal-submit" data-rfq="${esc(r.cid)}" data-tpl="${esc(r.tpl)}" data-lot="${esc(lot.cid)}">Whisper sealed quote</button>
           <p class="sub">Sealed to the buyer alone — a competing dealer's node is not an observer of this contract, so it never receives the number. Quoting locks ${fmt(r.quantity)} ${esc(r.instrument)} into escrow, which is what makes the price a commitment rather than an indication.</p>
         </div>`
      : `<p class="sub">This identity holds no lot of exactly ${fmt(r.quantity)} ${esc(r.instrument)}, so it cannot back a quote with escrow. On a real desk that inventory comes from your own book.</p>`, backToRow);
    return;
  }
  if (act === 'settle') { showView('desk'); refresh(); return; }
  if (act === 'cancel') {
    openModal(`Cancel request · ${r.instrument}`,
      `<p class="sub">Withdraws the request. Any dealer that already quoted gets its escrowed lot back.</p>
       <button id="modal-cancel" data-rfq="${esc(r.cid)}" data-tpl="${esc(r.tpl)}">Cancel this RFQ</button>`, backToRow);
    return;
  }
  if (act === 'myquote' && r.myQuote) {
    openModal(`Your sealed quote · ${r.instrument}`,
      `<div class="card"><div class="row"><span>your ask</span><span class="price">${fmt(r.myQuote.arg.price)} ${esc(r.pay)}</span></div>
        <div class="sub">${fmt(r.quantity)} ${esc(r.instrument)} · escrowed · visible to the buyer only</div></div>
       <p class="sub">Nobody else holds this number. You can reveal it to the regulator yourself to defend your pricing, or withdraw it and release the escrow — both from the side-by-side view.</p>`, backToRow);
    return;
  }
  openModal(`${r.kind === 'filled' ? 'Settlement receipt' : 'Request'} · ${r.instrument}`,
    `<table class="audit"><tbody>
       <tr><td>Instrument</td><td class="hi">${esc(r.instrument)}</td></tr>
       <tr><td>Quantity</td><td class="num">${fmt(r.quantity)}</td></tr>
       ${r.price != null ? `<tr><td>Clearing price</td><td class="num hi">${fmt(r.price)}</td></tr>` : ''}
       ${r.dealer ? `<tr><td>Counterparty</td><td>${dealerLabel(r.dealer)}</td></tr>` : ''}
       <tr><td>Status</td><td><span class="pill ${r.status === 'Filled' ? 'ok' : 'live'}">${esc(r.status)}</span></td></tr>
     </tbody></table>
     <p class="sub">The executed price and the counterparty are recorded for the regulator. The losing asks are archived without ever being revealed — not to the market, not to the rivals, and not to the regulator unless someone chooses to disclose them.</p>`, backToRow);
}

// ---- session activity --------------------------------------------------
const activity = [];
function logActivity(what, detail) {
  activity.unshift({ at: new Date(), who: ROLES[ACTING], what, detail });
  if (!document.getElementById('view-activity')?.hidden) renderActivity();
}
function renderActivity() {
  const el = document.getElementById('activity-body'); if (!el) return;
  el.innerHTML = activity.length
    ? '<table class="audit"><thead><tr><th>Time</th><th>Identity</th><th>Action</th><th>Detail</th></tr></thead><tbody>'
      + activity.map((a) => `<tr><td class="mono">${a.at.toTimeString().slice(0, 8)}</td><td>${esc(a.who)}</td><td class="hi">${esc(a.what)}</td><td class="sub">${esc(a.detail ?? '')}</td></tr>`).join('')
      + '</tbody></table>'
    : '<div class="audit-empty">Nothing yet this session. Open a request, or seal a quote against one.</div>';
}

// ---- create ------------------------------------------------------------
let createMode = 'auction';
function renderCreate() {
  document.querySelectorAll('#create-modes .mode').forEach((m) => m.classList.toggle('on', m.dataset.mode === createMode));
  const el = document.getElementById('create-form'); if (!el) return;
  if (el.contains(document.activeElement)) return; // don't wipe a half-typed form
  el.innerHTML = `
    <div class="form">
      <label>Instrument <input id="c-instrument" value="TBOND30" /></label>
      <label>Quantity <input id="c-qty" type="number" value="1000" /></label>
      <label>Cash leg <input id="c-pay" value="USDC" /></label>
      <label>Dealer panel <span class="sub">${createMode === 'auction' ? 'Dealer A and Dealer B' : 'Dealer A only'}</span></label>
      <button id="c-submit">${createMode === 'auction' ? 'Open the auction' : 'Send to the counterparty'}</button>
      <p class="sub">${createMode === 'auction'
        ? 'Both dealers are invited and answer sealed. The cheapest ask wins and is paid the second-cheapest price, so quoting honestly is the dealer\'s best strategy.'
        : 'One counterparty is invited, and you settle at its own ask — the same sealed request and the same atomic delivery-versus-payment.'}</p>
    </div>`;
}

// Provable best execution — the institutional payoff. On a public exchange, best
// execution is audited against a visible order book. Tirai has no public book, yet
// the regulator can still prove it: from its own node it holds the settled trade
// (TradeReport) plus whatever sealed asks the buyer/dealers selectively disclosed to
// it, and confirms the executed price was no worse than any competing ask. Prices
// are normalised per-unit so a partial fill compares cleanly to a full-lot ask.
function renderBestExec() {
  const el = document.getElementById('bestexec-body'); if (!el) return;
  const reports = lastReg.filter((c) => is(c, 'TradeReport'));
  const disc = lastReg.filter((c) => is(c, 'QuoteDisclosure'));
  if (!reports.length) { el.innerHTML = '<div class="audit-empty">No settled trades yet — nothing to attest.</div>'; return; }
  const byInst = {};
  for (const d of disc) {
    const unit = Number(d.arg.price) / Number(d.arg.quantity);
    (byInst[d.arg.instrument] ??= []).push({ dealer: d.arg.dealer, unit, price: Number(d.arg.price) });
  }
  // Disclosures carry no auction/RFQ id, so they can only be matched to a settlement
  // by instrument. If one instrument was settled more than once, the disclosed asks
  // can't be attributed to a specific trade — don't attest against the pooled set.
  const instCount = {};
  for (const r of reports) instCount[r.arg.instrument] = (instCount[r.arg.instrument] ?? 0) + 1;
  const cards = reports.map((r) => {
    const inst = r.arg.instrument;
    const clrUnit = Number(r.arg.clearingPrice) / Number(r.arg.quantity);
    const asks = (byInst[inst] ?? []).slice().sort((a, b) => a.unit - b.unit);
    const head = `<b>${esc(inst)}</b> · ${fmt(r.arg.quantity)} @ ${fmt(r.arg.clearingPrice)} <span class="hint">(${fmt(clrUnit)}/unit)</span>`;
    if (asks.length && instCount[inst] > 1) {
      return `<div class="be-card none"><div class="be-head">${head}<span class="be-verdict warn">ambiguous</span></div>
        <div class="be-note">This instrument was settled more than once; disclosed asks carry no per-auction link, so they can't be attributed to a single trade. Best execution is attested only when an instrument has one settlement.</div></div>`;
    }
    if (!asks.length) {
      return `<div class="be-card none"><div class="be-head">${head}</div>
        <div class="be-note">No competing asks disclosed to the regulator for this instrument yet — the buyer or a dealer can reveal them on demand (⚖ Disclose to regulator) to make best execution provable, without ever showing a rival.</div></div>`;
    }
    const winner = asks[0];
    const winnerOk = clrUnit + 1e-9 >= winner.unit;                 // paid ≥ the cheapest ask
    const beatsField = asks.every((x) => x === winner || x.unit + 1e-9 >= clrUnit); // no rival cheaper than clearing
    const ok = winnerOk && beatsField;
    const rows = asks.map((x) => {
      const isWin = x === winner;
      const good = isWin || x.unit + 1e-9 >= clrUnit;
      return `<tr class="be-${isWin ? 'win' : good ? 'ok' : 'bad'}"><td>${dealerLabel(x.dealer)}${isWin ? ' <span class="be-tag">winner</span>' : ''}</td><td class="num">${fmt(x.price)}</td><td class="num">${fmt(x.unit)}</td><td>${isWin ? 'lowest ask ✓' : good ? '≥ clearing ✓' : '⚠ below clearing'}</td></tr>`;
    }).join('');
    return `<div class="be-card ${ok ? 'ok' : 'warn'}">
      <div class="be-head">${head}<span class="be-verdict ${ok ? 'ok' : 'warn'}">${ok ? '✓ best execution attested' : 'incomplete disclosure'}</span></div>
      <table class="be-tbl"><thead><tr><th>Dealer — disclosed sealed ask</th><th>Ask</th><th>Per unit</th><th>vs clearing</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="be-note">${asks.length} competing ask(s) disclosed. The winner quoted the lowest ask; the buyer cleared at ${asks.length > 1 ? 'the runner-up’s price — the sealed Vickrey second price' : 'that ask'}. ${ok ? 'No disclosed dealer offered better than the executed price.' : 'Reveal the remaining sealed asks to complete the proof.'}</div>
    </div>`;
  }).join('');
  el.innerHTML = `<div class="be-intro">A public exchange audits best execution against a visible order book. Tirai has no public book — pre-trade stays confidential — yet the regulator still proves it, by checking the executed price against the sealed asks the counterparties chose to disclose to it. <b>Confidential pre-trade, provable post-trade.</b></div>` + cards;
}
// Live, on-ledger privacy proof: count what each party's node actually holds.
function renderVerify() {
  const el = document.getElementById('verify-body'); if (!el) return;
  const scan = (arr, party) => {
    const quotes = arr.filter((c) => is(c, 'Quote'));
    const own = quotes.filter((c) => c.arg.dealer === party).length;
    return { total: quotes.length, own, rival: quotes.length - own };
  };
  const a = scan(lastAcs.dealerA, P.dealerA), b = scan(lastAcs.dealerB, P.dealerB);
  const regQuotes = lastReg.filter((c) => is(c, 'Quote')).length;
  const regRfq = lastReg.filter((c) => is(c, 'RFQ') || is(c, 'BasketRFQ')).length;
  const regTrades = lastReg.filter((c) => is(c, 'TradeReport') || is(c, 'BasketTradeReport')).length;
  const pass = a.rival === 0 && b.rival === 0 && regQuotes === 0 && regRfq === 0;
  const row = (name, detail, ok) => `<div class="vf-row"><div class="vf-name">${name}</div><div class="vf-detail">${detail}</div><div class="vf-badge ${ok ? 'ok' : 'bad'}">${ok ? '✓' : '✗'}</div></div>`;
  el.innerHTML =
    `<div class="vf-verdict ${pass ? 'ok' : ''}">${pass ? '✓ Sub-transaction privacy verified on-ledger' : 'seed some quotes to verify…'}</div>`
    + '<div class="vf-grid">'
    + row('Dealer A’s node', `holds <b>${a.total}</b> sealed quote(s) — all <b>${a.own}</b> its own. Rivals’ quotes received: <b>${a.rival}</b>.`, a.rival === 0)
    + row('Dealer B’s node', `holds <b>${b.total}</b> sealed quote(s) — all <b>${b.own}</b> its own. Rivals’ quotes received: <b>${b.rival}</b>.`, b.rival === 0)
    + row('Regulator’s node', `holds <b>${regTrades}</b> settled trade(s), <b>${regQuotes}</b> sealed quotes, <b>${regRfq}</b> live RFQ(s). Pre-trade visibility: <b>none</b>.`, regQuotes === 0 && regRfq === 0)
    + '</div>'
    + '<div class="vf-note">Each figure is the number of contracts that party’s participant node actually holds — queried live over the JSON Ledger API, not filtered by this UI. A rival dealer’s quote isn’t hidden from the screen; it was never transmitted to that node. That is Canton sub-transaction privacy — no ZK proofs, no FHE, no TEE.</div>';

  // Out-of-the-box: quantify the differentiator. Count what a transparent chain
  // would be leaking into its public mempool at THIS instant vs what Canton
  // actually transmits to any non-counterparty (zero), then map the leak surface
  // to the cryptography our four earlier builds needed and Canton makes free.
  const buyerQuotes = lastAcs.buyer.filter((c) => is(c, 'Quote') || is(c, 'BasketQuote')).length;
  const buyerRfqs = lastAcs.buyer.filter((c) => is(c, 'RFQ') || is(c, 'BasketRFQ')).length;
  const wouldLeak = buyerQuotes + buyerRfqs;
  const actualLeak = a.rival + b.rival;
  const cmp = [
    ['RFQ — who is trading, what size', 'broadcast to the public mempool', 'never emitted off the parties'],
    ['Competing dealers’ quotes', 'visible → front-run, quote-fade', 'sealed; never sent to a rival’s node'],
    ['Losing bids', 'on-chain forever', 'archived, never revealed'],
    ['Counterparties', 'public addresses', 'only the two principals + a chosen regulator'],
    ['Privacy machinery needed', 'ZK circuits · FHE · TEE · threshold enc.', 'none — it is the ledger model'],
  ];
  el.innerHTML += `
    <div class="vf-contrast">
      <h3>What a transparent chain would leak — right now</h3>
      <div class="vf-tally">
        <div class="vf-stat leak"><span class="vf-num">${wouldLeak}</span><span>live quotes + RFQs a public L1 would expose in its mempool this instant</span></div>
        <div class="vf-stat safe"><span class="vf-num">${actualLeak}</span><span>actually transmitted to any non-counterparty on Canton</span></div>
      </div>
      <table class="vf-cmp">
        <thead><tr><th></th><th>Public L1 (Ethereum · Sui · Stellar…)</th><th>Canton — Tirai</th></tr></thead>
        <tbody>${cmp.map(([k, l, s]) => `<tr><td class="k">${k}</td><td class="leak">${l}</td><td class="safe">${s}</td></tr>`).join('')}</tbody>
      </table>
      <div class="vf-note">We built this same confidential OTC desk four times before Canton — each time bolting on the exact cryptography that middle column names: a TEE (<b>Diam</b>), two ZK circuits (<b>Segel</b>), Seal threshold encryption (<b>Sealed&nbsp;Pair</b>), FHE (<b>Samar</b>). On Canton the privacy is a <code>signatory</code> / <code>observer</code> declaration — same product, zero cryptography.</div>
    </div>`;
}
// Portfolio: each party's holdings, aggregated by instrument.
function renderPortfolio() {
  const el = document.getElementById('portfolio-body'); if (!el) return;
  const col = (name, party, contracts) => {
    const byInst = {};
    for (const h of contracts.filter((c) => is(c, 'Holding') && c.arg.owner === party))
      byInst[h.arg.instrument] = (byInst[h.arg.instrument] ?? 0) + Number(h.arg.amount);
    const rows = Object.entries(byInst).sort(([a], [b]) => a.localeCompare(b));
    return `<div class="pf-col"><h3>${name}</h3><span class="pid">${party ? esc(party.split('::')[0]) : ''}</span>`
      + (rows.length ? rows.map(([inst, amt]) => `<div class="pf-row"><span>${esc(inst)}</span><span class="num">${fmt(amt)}</span></div>`).join('')
                     : '<div class="empty">no positions</div>') + '</div>';
  };
  // Only your own positions. Rendering the other desks' books here would have been
  // the app leaking what the ledger does not: the side-by-side view is where the
  // comparison belongs, and it is labelled as such.
  const label = { buyer: 'Buyer', dealerA: 'Dealer A', dealerB: 'Dealer B', regulator: 'Regulator' }[ACTING] ?? 'You';
  el.innerHTML = col(`${label} — you`, actingParty(), actingAcs());
  renderRegistryAssets();
}

// Positions in assets some OTHER registry issues, read through the Canton Token
// Standard's own Holding interface — the same query answers for Canton Coin today
// and for cETH or CBTC the day those registries grant tokens. Anything issued by
// this desk's own parties is excluded: the point is what the desk does NOT control.
const REGISTRY_HOLDING = '#splice-api-token-holding-v1:Splice.Api.Token.HoldingV1:Holding';
let registryAt = 0, registryRows = null;

async function registryAssets() {
  if (registryRows && Date.now() - registryAt < 15000) return registryRows;
  const off = await ledgerEnd();
  const ours = new Set([P.buyer, P.dealerA, P.dealerB, P.regulator,
    CFG_PARTIES.cashIssuer, CFG_PARTIES.bondIssuer, CFG_PARTIES.cashissuer, CFG_PARTIES.bondissuer].filter(Boolean));
  const per = await Promise.all([['Buyer', P.buyer], ['Dealer A', P.dealerA], ['Dealer B', P.dealerB]].map(async ([label, party]) => {
    if (!party) return [];
    const rows = await api('/v2/state/active-contracts', 'POST', {
      filter: { filtersByParty: { [party]: { cumulative: [{ identifierFilter: {
        InterfaceFilter: { value: { interfaceId: REGISTRY_HOLDING, includeInterfaceView: true, includeCreatedEventBlob: false } },
      } }] } } },
      verbose: false,
      activeAtOffset: off,
    });
    const by = {};
    for (const r of Array.isArray(rows) ? rows : []) {
      const ev = r.contractEntry?.JsActiveContract?.createdEvent;
      // "Another registry" means exactly that: not a contract this application
      // defines. Judging by the admin party alone fails on a local demo, where the
      // desk's own issuers are not in the served config.
      if (typeof ev?.templateId === 'string' && ev.templateId.includes(':Tirai:')) continue;
      const v = ev?.interfaceViews?.[0]?.viewValue;
      if (!v || v.owner !== party || ours.has(v.instrumentId?.admin)) continue;
      const k = v.instrumentId.id + ' ' + v.instrumentId.admin;
      by[k] = (by[k] ?? 0) + Number(v.amount);
    }
    return Object.entries(by).map(([k, amount]) => {
      const [id, admin] = k.split(' ');
      return { label, id, admin, amount };
    });
  }));
  registryRows = per.flat(); registryAt = Date.now();
  return registryRows;
}

async function renderRegistryAssets() {
  const host = document.getElementById('pf-registry'); if (!host) return;
  try {
    const rows = await registryAssets();
    if (!rows.length) { host.innerHTML = ''; return; }
    host.innerHTML = '<h3 class="pf-reg-title">Registry assets — Canton Token Standard '
      + '<span class="hint">issued by another registry entirely; this is the cash these desks were paid in</span></h3>'
      + '<table class="audit"><thead><tr><th>Party</th><th>Instrument</th><th>Issuer (registry admin)</th><th>Balance</th></tr></thead><tbody>'
      + rows.map((r) => `<tr><td>${esc(r.label)}</td><td>${esc(r.id)}</td><td class="mode">${esc(r.admin.split('::')[0])}</td><td class="num">${fmt(r.amount)}</td></tr>`).join('')
      + '</tbody></table>';
  } catch { host.innerHTML = ''; } // a registry read failing must not break the view
}
function renderAudit() {
  const el = document.getElementById('audit-table'); if (!el) return;
  const rows = [
    ...lastReg.filter((c) => is(c, 'TradeReport')).map((c) => ({ inst: esc(c.arg.instrument), qty: fmt(c.arg.quantity), price: fmt(c.arg.clearingPrice), kind: 'single-instrument' })),
    ...lastReg.filter((c) => is(c, 'BasketTradeReport')).map((c) => ({ inst: 'basket [' + c.arg.legs.map((l) => esc(l.instrument)).join(' + ') + ']', qty: c.arg.legs.map((l) => fmt(l.quantity)).join(' / '), price: fmt(c.arg.clearingPrice), kind: 'basket' })),
  ];
  const trades = rows.length
    ? '<table class="audit"><thead><tr><th>Instrument</th><th>Quantity</th><th>Clearing price</th><th>Type</th></tr></thead><tbody>'
      + rows.map((r) => `<tr><td>${r.inst}</td><td class="num">${r.qty}</td><td class="num">${r.price}</td><td class="mode">${r.kind}</td></tr>`).join('')
      + '</tbody></table>'
    : '<div class="audit-empty">No settled trades yet — the regulator sees nothing pre-trade.</div>';
  // Selective disclosures: sealed quotes the buyer revealed to the regulator on demand.
  const disc = lastReg.filter((c) => is(c, 'QuoteDisclosure'));
  const who = (d) => d.arg.discloser === P.buyer ? 'buyer' : dealerLabel(d.arg.dealer);
  const disclosures = disc.length
    ? '<h3 style="margin-top:34px;font-size:15px;color:var(--ink)">Selectively disclosed quotes '
      + '<span class="hint" style="font-weight:400">— sealed quotes the buyer OR the dealer chose to reveal to the regulator on demand (never public, never sent to rivals)</span></h3>'
      + '<table class="audit"><thead><tr><th>Disclosed by</th><th>Dealer</th><th>Instrument</th><th>Quantity</th><th>Quoted price</th><th>Reason</th></tr></thead><tbody>'
      + disc.map((d) => `<tr><td>${who(d)}</td><td>${dealerLabel(d.arg.dealer)}</td><td>${esc(d.arg.instrument)}</td><td class="num">${fmt(d.arg.quantity)}</td><td class="num">${fmt(d.arg.price)}</td><td class="mode">${esc(d.arg.reason)}</td></tr>`).join('')
      + '</tbody></table>'
    : '';
  el.innerHTML = trades + disclosures;
}

// Glanceable KPI row. All values come from the buyer/regulator ACS the refresh
// loop already fetched; only the offset is a fresh (cheap) read for a liveness pulse.
function setStats({ offset, rfqs, quotes, settled }) {
  const set = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined) el.textContent = v; };
  set('stat-offset', offset != null ? Number(offset).toLocaleString() : undefined);
  set('stat-rfqs', rfqs);
  set('stat-quotes', quotes);
  set('stat-settled', settled);
}

// ---- refresh loop ----
let busy = false;
async function refresh() {
  if (busy) return; busy = true;
  try {
    const off = await ledgerEnd();
    // Which nodes this tick has to read. Normally only the one you are signed in
    // as — a judge with the network tab open should see exactly that. The views
    // that exist to COMPARE nodes (the side-by-side desk, the privacy verifier)
    // are the only ones that read all four, and they say so on screen.
    const everyone = ['desk', 'verify'].includes(currentView);
    const needs = (role) => everyone || role === ACTING
      // The regulator's post-trade record backs the audit and best-execution views.
      || (role === 'regulator' && ['audit', 'bestexec'].includes(currentView));
    // One party's read failing (a cold serverless instance, a 502) must not blank
    // the whole desk: fall back to that party's last known contracts and let the
    // next poll catch up. A stale column beats an empty one during a live demo.
    const settledReads = await Promise.allSettled(
      ['buyer', 'dealerA', 'dealerB', 'regulator'].map((role) =>
        (P[role] && needs(role)) ? acsAt(P[role], off) : Promise.resolve(null)));
    const prev = [lastAcs.buyer, lastAcs.dealerA, lastAcs.dealerB, lastReg];
    // null = deliberately not read this tick; keep what we had rather than blanking.
    const [b, a, d, r] = settledReads.map((s, i) =>
      (s.status === 'fulfilled' && s.value !== null) ? s.value : (prev[i] ?? []));
    const stale = settledReads.filter((s) => s.status === 'rejected').length;
    if (!PKG) { const any = [...b, ...a, ...d].find((c) => typeof c.tpl === 'string' && c.tpl.includes(':Tirai:')); if (any) PKG = any.tpl.split(':')[0]; }
    renderBuyer(b); renderBasketBuyer(b); renderDealer('dealerA', a); renderDealer('dealerB', d);
    const settled = renderRegulator(r);
    lastReg = r; lastAcs = { buyer: b, dealerA: a, dealerB: d };
    lastLoaded = true;
    renderIdentity();
    if (!document.getElementById('view-audit')?.hidden) renderAudit();
    if (!document.getElementById('view-rfqs')?.hidden) keepFocus(renderActive);
    if (!document.getElementById('view-portfolio')?.hidden) renderPortfolio();
    if (!document.getElementById('view-verify')?.hidden) renderVerify();
    if (!document.getElementById('view-bestexec')?.hidden) renderBestExec();
    // The tiles describe the signed-in identity, not always the buy side: a dealer's
    // "sealed quotes" is its own book, and its "open requests" only the invited ones.
    const seen = actingAcs();
    setStats({ offset: off,
      rfqs: seen.filter((c) => is(c, 'RFQ')).length,
      quotes: seen.filter((c) => is(c, 'Quote')).length,
      settled: ACTING === 'regulator' ? settled : seen.filter((c) => is(c, 'TradeReport')).length });
    const lab = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    lab('lab-rfqs', isDealer() ? 'Requests to you' : 'Open requests');
    lab('lab-quotes', isDealer() ? 'Your sealed quotes' : 'Sealed quotes received');
    lab('lab-settled', ACTING === 'regulator' ? 'Settled trades (all)' : 'Your settled trades');
    setLedger(stale ? 'warn' : 'ok',
      (stale ? `ledger live · ${stale} column stale, retrying` : 'ledger live')
      + ' · pkg ' + (PKG ? PKG.slice(0, 8) : '—'));
  } catch (e) {
    setLedger('err', 'ledger error: ' + e.message);
  } finally { busy = false; }
}

const setLedger = (cls, msg) => { const el = document.getElementById('ledger-status'); el.className = 'ledger ' + cls; el.textContent = msg; };

// ---- actions ---- (guarded so a double-click can't fire two submits)
let acting = false;
async function guarded(btn, fn) {
  if (acting) return;
  acting = true; if (btn) btn.disabled = true;
  try { await fn(); }
  finally { acting = false; if (btn) btn.disabled = false; }
}

// Called from two places: the Create RFQ page (the product path) and the buyer
// column of the side-by-side view (the demo path). `btn` decides which form is
// being read, and an auction invites the panel while a direct request invites one.
async function createRFQ(btn) {
  if (READONLY) return toast(RO_MSG);
  if (!PKG) return toast('package not discovered yet', true);
  const fromPage = btn?.id === 'c-submit';
  const val = (id) => document.getElementById(id)?.value ?? '';
  const instrument = (fromPage ? val('c-instrument') : val('rfq-instrument')).trim();
  const payInstrument = (fromPage ? val('c-pay') : val('rfq-pay')).trim();
  const quantity = posDec(fromPage ? val('c-qty') : val('rfq-qty'));
  const panel = fromPage && createMode === 'direct' ? [P.dealerA] : [P.dealerA, P.dealerB];
  if (!instrument || !payInstrument) return toast('instrument and pay currency are required', true);
  if (!quantity) return toast('quantity must be a positive number', true);
  await guarded(btn ?? document.getElementById('btn-create-rfq'), async () => {
    try {
      await submit(P.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:RFQ`, createArguments: {
        buyer: P.buyer, regulator: P.regulator, invitedDealers: panel,
        instrument, quantity, payInstrument,
        assetIssuer: CFG_PARTIES.bondIssuer ?? null, payIssuer: CFG_PARTIES.cashIssuer ?? null,
        // Daml Time as RFC3339 without fractional seconds (the form the ledger's
        // codec is known to accept everywhere else); open for 24h.
        deadline: new Date(Date.now() + 86400000).toISOString().replace(/\.\d+Z$/, 'Z') } } });
      toast(panel.length > 1 ? 'RFQ sent to the dealer panel' : 'Request sent to the counterparty');
      logActivity('Opened a request', `${instrument} x ${quantity}`); // inside the try: only on acceptance
      await refresh();
      if (fromPage) showView('rfqs');
    } catch (e) { toast(e.message, true); }
  });
  // after guarded() re-enabled the button, keep keyboard focus anchored (not on <body>)
  (btn ?? document.getElementById('btn-create-rfq'))?.focus();
}

// Returns true only when the ledger actually accepted the command — the dialogs
// log activity and close on that, never on "the promise resolved".
async function submitQuote(role, rfqCid, bondCid, tpl, priceRaw, btn) {
  if (READONLY) { toast(RO_MSG); return false; }
  const price = posDec(priceRaw);
  if (!price) { toast('ask must be a positive number', true); return false; }
  let ok = false;
  await guarded(btn, async () => {
    try {
      await submit(P[role], { ExerciseCommand: { templateId: tpl, contractId: rfqCid,
        choice: 'SubmitQuote', choiceArgument: { dealer: P[role], price, assetCid: bondCid } } });
      ok = true;
      toast(role + ' quote sealed'); refresh();
    } catch (e) { toast(e.message, true); }
  });
  return ok;
}

// Direct bilateral OTC: buyer hits one dealer's firm quote at its ask price.
// Reuses the Quote's SettleQuote choice (atomic DvP) with clearingPrice = ask —
// no auction, no second-price. The other dealers' quotes stay live (a dealer can
// still WithdrawQuote its escrow), exactly like hitting one counterparty on a desk.
async function acceptQuote(quoteCid, tpl, cashCid, price, btn) {
  if (READONLY) return toast(RO_MSG);
  await guarded(btn, async () => {
    try {
      await submit(P.buyer, { ExerciseCommand: { templateId: tpl, contractId: quoteCid,
        choice: 'SettleQuote', choiceArgument: { cashCid, clearingPrice: price } } });
      toast('Direct OTC settled at ask — atomic DvP'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// Partial bilateral fill: settle `fill` units (<= the quote's size) of one dealer
// at its prorated ask, via the Quote's AcceptPartial choice (atomic DvP). The
// unfilled remainder returns to the dealer.
async function partialFill(quoteCid, tpl, cashCid, fillRaw, btn) {
  if (READONLY) return toast(RO_MSG);
  const fill = posDec(fillRaw);
  if (!fill) return toast('fill quantity must be a positive number', true);
  const max = Number(document.getElementById('fill-' + quoteCid)?.max);
  if (max && Number(fill) > max) return toast('fill exceeds the quote quantity', true);
  await guarded(btn, async () => {
    try {
      await submit(P.buyer, { ExerciseCommand: { templateId: tpl, contractId: quoteCid,
        choice: 'AcceptPartial', choiceArgument: { cashCid, fillQuantity: fill } } });
      toast('Partial fill settled — prorated atomic DvP'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// Selective disclosure: the buyer reveals one sealed quote to the regulator on
// demand (best-execution audit) — without making it public or telling rivals.
async function discloseQuote(quoteCid, tpl, btn) {
  if (READONLY) return toast(RO_MSG);
  await guarded(btn, async () => {
    try {
      await submit(P.buyer, { ExerciseCommand: { templateId: tpl, contractId: quoteCid, choice: 'DiscloseTo',
        choiceArgument: { auditor: P.regulator, reason: 'best-execution audit' } } });
      toast('Quote selectively disclosed to the regulator — rivals still can’t see it'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// Symmetric selective disclosure: the DEALER reveals its OWN sealed quote to the
// regulator — a fair-pricing / dispute defence — without exposing it to rivals or
// the public. Either side of the trade controls its own disclosure (Canton v6).
async function dealerDiscloseQuote(role, quoteCid, tpl, btn) {
  if (READONLY) return toast(RO_MSG);
  await guarded(btn, async () => {
    try {
      await submit(P[role], { ExerciseCommand: { templateId: tpl, contractId: quoteCid, choice: 'DealerDiscloseTo',
        choiceArgument: { auditor: P.regulator, reason: 'fair-pricing defence' } } });
      toast('Dealer disclosed its own quote to the regulator — rivals still can’t see it'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// Dealer walks away from a live (un-awarded) quote: WithdrawQuote archives it and
// returns the escrowed bond to the dealer. Without this, a losing/stale quote's
// collateral stays locked forever.
async function withdrawQuote(role, quoteCid, tpl, btn) {
  if (READONLY) return toast(RO_MSG);
  await guarded(btn, async () => {
    try {
      await submit(P[role], { ExerciseCommand: { templateId: tpl, contractId: quoteCid, choice: 'WithdrawQuote', choiceArgument: {} } });
      toast('Quote withdrawn — escrow released back to the dealer'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// ---- multi-instrument baskets ----
const basketLegs = () => [
  { instrument: 'TBOND30', quantity: '1000.0', assetIssuer: CFG_PARTIES.bondIssuer ?? null },
  { instrument: 'GILT10', quantity: '100.0', assetIssuer: CFG_PARTIES.bondIssuer ?? null },
];
async function createBasketRFQ() {
  if (READONLY) return toast(RO_MSG);
  if (!PKG) return toast('package not discovered yet', true);
  await guarded(document.getElementById('btn-create-basket'), async () => {
    try {
      await submit(P.buyer, { CreateCommand: { templateId: `${PKG}:Tirai:BasketRFQ`, createArguments: {
        buyer: P.buyer, regulator: P.regulator, invitedDealers: [P.dealerA, P.dealerB],
        legs: basketLegs(), payInstrument: 'USDC', payIssuer: CFG_PARTIES.cashIssuer ?? null,
        deadline: new Date(Date.now() + 86400000).toISOString().replace(/\.\d+Z$/, 'Z') } } });
      toast('Basket RFQ sent to the dealer panel'); await refresh();
    } catch (e) { toast(e.message, true); }
  });
  document.getElementById('btn-create-basket')?.focus();
}
async function quoteBasket(role, rfqCid, tpl, assetsCsv, priceRaw, btn) {
  if (READONLY) return toast(RO_MSG);
  const price = posDec(priceRaw);
  if (!price) return toast('basket ask must be a positive number', true);
  await guarded(btn, async () => {
    try {
      await submit(P[role], { ExerciseCommand: { templateId: tpl, contractId: rfqCid, choice: 'SubmitBasketQuote',
        choiceArgument: { dealer: P[role], price, assetCids: assetsCsv.split(',') } } });
      toast(role + ' basket quote sealed'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}
async function settleBasket(quoteCid, tpl, cashCid, btn) {
  if (READONLY) return toast(RO_MSG);
  await guarded(btn, async () => {
    try {
      await submit(P.buyer, { ExerciseCommand: { templateId: tpl, contractId: quoteCid,
        choice: 'SettleBasket', choiceArgument: { cashCid } } });
      toast('Basket settled — atomic multi-leg DvP'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

async function award() {
  if (READONLY) return toast(RO_MSG);
  if (!awardable) return;
  await guarded(document.getElementById('btn-award'), async () => {
    try {
      await submit(P.buyer, { ExerciseCommand: { templateId: awardable.tpl, contractId: awardable.rfqCid,
        choice: 'Award', choiceArgument: { quoteCids: awardable.quoteCids, cashCid: awardable.cashCid } } });
      toast('Awarded — atomic DvP at the Vickrey price'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// Partial-Vickrey: run the same sealed auction, but the buyer takes only
// `fillQuantity` of the winning lot at the 2nd price, prorated (AwardPartial).
async function awardPartial() {
  if (READONLY) return toast(RO_MSG);
  if (!awardable) return;
  const fill = posDec(document.getElementById('award-fill').value);
  if (!fill) return toast('partial award quantity must be a positive number', true);
  if (Number(fill) > awardable.qty) return toast('partial award exceeds the RFQ quantity', true);
  await guarded(document.getElementById('btn-award-partial'), async () => {
    try {
      await submit(P.buyer, { ExerciseCommand: { templateId: awardable.tpl, contractId: awardable.rfqCid,
        choice: 'AwardPartial', choiceArgument: { quoteCids: awardable.quoteCids, cashCid: awardable.cashCid, fillQuantity: fill } } });
      toast('Awarded partially — atomic DvP at the prorated Vickrey price'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// Buyer archives its own live RFQ (sole signatory). Stray/mistaken RFQs.
async function cancelRFQ() {
  if (READONLY) { toast(RO_MSG); return false; }
  if (!cancelableRfq) return false;
  let ok = false;
  await guarded(document.getElementById('btn-cancel-rfq'), async () => {
    try {
      await submit(P.buyer, { ExerciseCommand: { templateId: cancelableRfq.tpl, contractId: cancelableRfq.cid, choice: 'CancelRFQ', choiceArgument: {} } });
      ok = true;
      toast('RFQ cancelled'); refresh();
    } catch (e) { toast(e.message, true); }
  });
  return ok;
}

// Buyer declines a sealed quote — its escrowed bond returns to the dealer.
async function rejectQuote(quoteCid, tpl, btn) {
  if (READONLY) return toast(RO_MSG);
  await guarded(btn, async () => {
    try {
      await submit(P.buyer, { ExerciseCommand: { templateId: tpl, contractId: quoteCid, choice: 'RejectQuote', choiceArgument: {} } });
      toast('Quote rejected — escrow returned to the dealer'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// Dealer withdraws its live basket quote — every escrowed leg returns to it.
async function withdrawBasket(role, quoteCid, tpl, btn) {
  if (READONLY) return toast(RO_MSG);
  await guarded(btn, async () => {
    try {
      await submit(P[role], { ExerciseCommand: { templateId: tpl, contractId: quoteCid, choice: 'WithdrawBasketQuote', choiceArgument: {} } });
      toast('Basket quote withdrawn — all legs released back to the dealer'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// Buyer declines a basket quote — every leg returns to the dealer.
async function rejectBasket(quoteCid, tpl, btn) {
  if (READONLY) return toast(RO_MSG);
  await guarded(btn, async () => {
    try {
      await submit(P.buyer, { ExerciseCommand: { templateId: tpl, contractId: quoteCid, choice: 'RejectBasketQuote', choiceArgument: {} } });
      toast('Basket rejected — all legs returned to the dealer'); refresh();
    } catch (e) { toast(e.message, true); }
  });
}

// ---- production shell: identity, the book, dialogs ----
document.getElementById('acting-as')?.addEventListener('change', (e) => setActing(e.target.value));
document.getElementById('rfq-search')?.addEventListener('input', () => renderActive());
document.getElementById('btn-new-rfq')?.addEventListener('click', () => showView('create'));
document.getElementById('modal-x')?.addEventListener('click', closeModal);
document.getElementById('modal-host')?.addEventListener('click', (e) => { if (e.target.id === 'modal-host') closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); return; }
  // A clickable row must also be an operable one.
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('tr[data-row]')) {
    e.preventDefault();
    openRow(e.target.dataset.row, e.target.dataset.rowact);
  }
});

document.addEventListener('click', (e) => {
  const chip = e.target.closest('.rfq-chip');
  if (chip) { rfqFilter = chip.dataset.filter; renderActive(); return; }

  const act = e.target.closest('.rfq-act');
  if (act) { openRow(act.dataset.rfq, act.dataset.act); return; }

  const row = e.target.closest('tr[data-row]');
  if (row) { openRow(row.dataset.row, row.dataset.rowact); return; }

  const mode = e.target.closest('#create-modes .mode');
  if (mode) { createMode = mode.dataset.mode; renderCreate(); return; }

  const seal = e.target.closest('#modal-submit');
  if (seal) {
    const price = document.getElementById('modal-ask')?.value;
    const role = ACTING;
    submitQuote(role, seal.dataset.rfq, seal.dataset.lot, seal.dataset.tpl, price, seal)
      .then((ok) => { if (!ok) return; logActivity('Sealed a quote', `${price} on ${seal.dataset.rfq.slice(0, 8)}`); closeModal(); });
    return;
  }

  const cancel = e.target.closest('#modal-cancel');
  if (cancel) {
    cancelableRfq = { cid: cancel.dataset.rfq, tpl: cancel.dataset.tpl };
    cancelRFQ().then((ok) => { if (!ok) return; logActivity('Cancelled a request', cancel.dataset.rfq.slice(0, 8)); closeModal(); });
    return;
  }

  const create = e.target.closest('#c-submit');
  if (create) createRFQ(create);
});

// ---- wire up ----
document.getElementById('btn-create-rfq').addEventListener('click', () => createRFQ());
document.getElementById('btn-award').addEventListener('click', award);
document.getElementById('btn-award-partial')?.addEventListener('click', awardPartial);
document.getElementById('btn-cancel-rfq')?.addEventListener('click', cancelRFQ);
document.getElementById('btn-create-basket')?.addEventListener('click', createBasketRFQ);
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-quote]');
  if (!b) return;
  const { quote: role, rfq: rfqCid, bond: bondCid, tpl } = b.dataset;
  const price = document.getElementById(`ask-${role}-${rfqCid}`).value;
  submitQuote(role, rfqCid, bondCid, tpl, price, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-accept]');
  if (!b) return;
  acceptQuote(b.dataset.accept, b.dataset.tpl, b.dataset.cash, b.dataset.price, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-partial]');
  if (!b) return;
  const fill = document.getElementById('fill-' + b.dataset.partial)?.value;
  partialFill(b.dataset.partial, b.dataset.tpl, b.dataset.cash, fill, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-basketquote]');
  if (!b) return;
  const price = document.getElementById(`bask-${b.dataset.basketquote}-${b.dataset.rfq}`).value;
  quoteBasket(b.dataset.basketquote, b.dataset.rfq, b.dataset.tpl, b.dataset.assets, price, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-basketsettle]');
  if (!b) return;
  settleBasket(b.dataset.basketsettle, b.dataset.tpl, b.dataset.cash, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-disclose]');
  if (!b) return;
  discloseQuote(b.dataset.disclose, b.dataset.tpl, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-dealerdisclose]');
  if (!b) return;
  dealerDiscloseQuote(b.dataset.role, b.dataset.dealerdisclose, b.dataset.tpl, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-withdraw]');
  if (!b) return;
  withdrawQuote(b.dataset.role, b.dataset.withdraw, b.dataset.tpl, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-reject]');
  if (!b) return;
  rejectQuote(b.dataset.reject, b.dataset.tpl, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-basketwithdraw]');
  if (!b) return;
  withdrawBasket(b.dataset.role, b.dataset.basketwithdraw, b.dataset.tpl, b);
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-basketreject]');
  if (!b) return;
  rejectBasket(b.dataset.basketreject, b.dataset.tpl, b);
});
// Sidebar view switcher: swap the main area between the 3-column desk and the
// dedicated audit-trail page (external links carry no data-view and navigate away).
document.querySelector('.side-nav')?.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-view]');
  if (!a) return;
  e.preventDefault();
  showView(a.dataset.view);
});
document.getElementById('howto-x')?.addEventListener('click', () => document.getElementById('howto')?.remove());

(async function main() {
  try {
    let cfg = {};
    try { cfg = await (await fetch('/api/config')).json(); } catch {}
    USER_ID = cfg.userId ?? USER_ID;
    CFG_PARTIES = cfg.parties ?? {};
    if (cfg.readOnly) enterReadOnly();
    if (!(await loadParties(cfg.parties))) { setLedger('err', 'demo parties not found — run seed'); return; }
    renderIdentity();
    showView('rfqs');
    await refresh();
    setInterval(refresh, 1800);
    // Near-instant updates when the local server offers an SSE push stream. Skip it
    // on the read-only hosted proxy — /api/stream isn't allow-listed there, so opening
    // it only logs a 403 in the console; the 1.8s poll above already covers updates.
    if (!READONLY) {
      try {
        const es = new EventSource('/api/stream');
        es.onmessage = () => refresh();
        es.onerror = () => es.close();
      } catch { /* no EventSource / no stream — polling covers it */ }
    }
  } catch (e) {
    setLedger('err', 'startup failed: ' + (e?.message ?? e));
  }
})();
