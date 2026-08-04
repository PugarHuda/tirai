# Tirai — customer validation and differentiation

**Status when this was written: no design partner is signed, and no customer
conversation has taken place.** Nothing below reports a result. Everything is a
plan, a target, or an assumption — and assumptions are marked as such. The
numbers in the tables are thresholds to be tested against, not measurements.

What is real and checkable today: the ledger model (36 Daml scripts green), the
CIP-0056 settlement path against the frozen Splice v1 interfaces, two Canton
DevNet deployments under one package id, a read-only hosted desk at
https://tirai.vercel.app over live DevNet state, and `scripts/devnet.mjs verify`
asserting on the live network that no dealer sees a rival quote and the
regulator sees zero pre-trade contracts. Live cETH/CBTC transactions remain
blocked on the test-token grant.

This document answers the judges' two asks: secure one design partner, and state
the differentiation clearly.

---

## 1. Who the design partner should be

Ranked by reachability for a solo builder with a DevNet deployment and no
institutional cover. Reachability, not size of prize — the wrong ranking is the
one that puts the biggest logo first and burns 90 days in its procurement queue.

### Rank 1 — a digital-asset market maker or prop desk already operating on Canton

**Why they feel the pain.** They already quote size bilaterally over chat and
already lose money to information leakage, but they have no compliance
department that will veto a DevNet experiment. If they are already running a
Canton validator for cETH/CBTC/Canton Coin, the marginal cost of trying Tirai is
one party allocation and one DAR vetting, not a vendor onboarding process.

**What a pilot gives them.** A sealed-quote channel where their axe is not
visible to competing dealers; escrow-on-quote so they are never the one left
carrying counterparty risk; atomic DvP against a real registry asset instead of
a transfer-then-hope sequence; and a second-price (Vickrey) rail that lets them
quote their true level without being picked off.

**What they must give.** A named trading contact, roughly two hours a week for
six weeks, one DevNet party they act as, a realistic instrument list and
plausible sizes (not live positions — anonymised or synthetic is enough for the
protocol test), and a written answer on what they pay today per trade for
execution and settlement.

**Where to find them.** The HackCanton bounty sponsors are the shortest path:
onRails (cETH) and BitSafe (CBTC) both wrote briefs asking for private RFQ /
confidential OTC with atomic DvP — Tirai is a direct response to their own
stated wishlist, which makes the first message a follow-up rather than a cold
pitch. Also: ccview (ecosystem analytics — they can see who is actually
transacting on Canton and is therefore worth approaching), the Canton Network
ecosystem participant listing, Global Synchronizer / Canton Foundation community
channels, Digital Asset developer relations, and validator operators such as
Noders and 5N who know which of their tenants trade rather than merely hold.

*Assumption:* that at least one bounty sponsor treats a working submission
against their brief as a reason to take a call. Untested.

### Rank 2 — a tokenised-bond or RWA issuance platform on Canton

**Why they feel the pain.** Issuance platforms consistently have the same gap:
they can mint and register a bond, and they can settle a pre-agreed trade, but
they have no confidential secondary-market price discovery. Their holders ask
"how do I sell this without telling the market I am selling" and the honest
answer today is a phone call. That is a product hole they cannot fill with more
issuance features.

**What a pilot gives them.** A secondary-market module they did not have to
build, with the regulator view and best-execution attestation already in it —
which is usually the part their own compliance reviewers ask for first. Baskets
settle as one atomic multi-leg DvP, which matters for portfolio trades in
illiquid paper.

**What they must give.** A named product owner, a test instrument definition
(ISIN-shaped identifier, denomination, minimum size), two counterparties from
their own holder base willing to be dealers on DevNet, and an explicit statement
of who inside their organisation would own the budget if this became a paid
component.

**Where to find them.** Canton ecosystem participant lists filtered to RWA and
issuance; Digital Asset's published customer and partner material; conference
speaker lists for tokenised fixed income. LinkedIn strings in section 2.

**Why not rank 1.** Their sales cycle is longer and the pilot needs two of
*their* customers to participate, which is a dependency a solo builder cannot
force.

### Rank 3 — a regional broker-dealer or mid-tier fixed-income desk in Asia

**Why they feel the pain.** Sharpest pain of the three. In a thinner market, a
single enquiry moves the level; mid-tier desks are precisely the ones who cannot
absorb the leakage that a top-five dealer can. Local proximity (Indonesia /
ASEAN) makes an in-person meeting possible, which is worth more than any deck.

**What a pilot gives them.** The thing they cannot buy: a dealer terminal
without a dealer-terminal subscription. Tradeweb/Bloomberg/MarketAxess economics
are built for large flow; a regional desk pays terminal-scale costs for
mid-scale volume.

**What they must give.** A named head of trading or COO, a compliance contact
who will say in writing what would have to be true for them to route a real
trade, historical enquiry counts (how many RFQs a week, to how many dealers),
and time from an operations person to sit through the settlement flow.

**Where to find them.** Local exchange and bond-market association member
directories, regional fintech and capital-markets associations, and warm
introductions through the HackCanton and Canton Foundation network. Cold-calling
a bank in Asia as an individual builder is low-yield; an introduction is not.

**Why rank 3 despite the sharpest pain.** They are the slowest to reach, the
most likely to require an entity rather than an individual on the other side of
the contract, and the least likely to have anything Canton-shaped already
running. Pursue in parallel, but do not let the 90 days depend on them.

### Deliberately not pursued in the first 90 days

Tier-one banks and the incumbent venues themselves. Both are the eventual
market; neither will engage a solo builder with a DevNet deployment inside a
quarter, and pursuing them consumes the whole quarter producing nothing
falsifiable.

### LinkedIn / search strings

Run these as saved searches; message the person, not the company page.

```
("Canton Network" OR "Daml") AND ("market maker" OR "trading" OR "OTC")
("tokenised bond" OR "tokenized bond") AND ("secondary market" OR "RFQ")
("digital assets" OR "digital securities") AND "fixed income" AND "trading desk"
("head of trading" OR "head of markets") AND ("broker" OR "sekuritas" OR "securities") AND Indonesia
("RFQ" OR "request for quote") AND ("information leakage" OR "block trading")
"Canton" AND ("validator" OR "Global Synchronizer") AND ("product" OR "BD" OR "partnerships")
```

Also worth mining: the HackCanton participant and sponsor list itself (people who
already understand Canton privacy need no education), and the commit and issue
history of public Canton/Splice repositories — the engineers there work for the
firms in ranks 1 and 2.

---

## 2. Outreach assets

### Cold email (146 words)

> **Subject: sealed-quote RFQ on Canton — 20 minutes of your view, not a pitch**
>
> Hello,
>
> I built Tirai, a confidential multi-dealer RFQ and OTC desk native to Canton.
> A buyer sends an RFQ to a chosen dealer panel; each quote is sealed, so a
> dealer cannot see a rival's price on-ledger, and the market never sees the
> enquiry. Settlement is atomic delivery-versus-payment in a CIP-0056 asset. A
> regulator sees executed trades only.
>
> It is deployed on Canton DevNet — read-only desk over live state:
> https://tirai.vercel.app — and a script asserts on the network that no quote
> leaks.
>
> I am not selling anything. I am trying to find out whether the problem I built
> for is the problem you actually have. Twenty minutes, five questions, no slides.
> If the answer is "we do not care about enquiry leakage", that is the most useful
> thing you can tell me.
>
> Pugar Huda Mantoro — solo builder, Tirai

### LinkedIn / Telegram DM (58 words)

> I built Tirai: a sealed-quote RFQ desk on Canton — rival dealers cannot see
> each other's prices, settlement is atomic DvP in a CIP-0056 asset. Live on
> DevNet: https://tirai.vercel.app.
>
> Not pitching. I want 20 minutes to test whether enquiry leakage is a real cost
> for you or just a thesis I like. Open to being told it is not.

### Discovery-call script — five questions

Rules for the call: no demo in the first fifteen minutes, no slides, no
describing Tirai beyond one sentence. Ask, shut up, write the exact words down.
A call where they talked less than three quarters of the time was a pitch, not
discovery.

**Q1. "Walk me through the last block trade you did that you did not want the
market to know about. What actually happened, step by step, and who else knew?"**
*Riskiest assumption killed:* that information leakage on the enquiry is a real,
recurring event rather than a plausible-sounding story I built a product around.
If they cannot produce a concrete instance, the whole thesis is theoretical.

**Q2. "When that leaked — or when you assumed it might — what did it cost you?
How would you even know?"**
*Riskiest assumption killed:* that the pain is measurable and therefore
budgetable. A pain nobody quantifies is a pain nobody funds. Watch for whether
they have any internal number at all; "we don't measure it" is a real finding
and a serious warning.

**Q3. "If a system could keep the enquiry and every losing quote invisible, what
would stop you using it tomorrow?"**
*Riskiest assumption killed:* that confidentiality is the binding constraint. It
may well be that credit lines, settlement finality, counterparty onboarding, or
regulatory permission bind first — in which case Tirai solves a problem that is
not on the critical path.

**Q4. "Who in your firm decides what you pay to execute and settle, and what
does that line item look like today?"**
*Riskiest assumption killed:* that there is a named budget owner and an existing
spend to displace. If no one owns the line, there is no sale, only interest.

**Q5. "What would have to be true for you to route one real trade — not a test —
through something like this? Who would have to sign off, and what would they
ask for?"**
*Riskiest assumption killed:* that the distance from DevNet pilot to a real
trade is a technical distance. It is more likely a legal, custody and permission
distance, and this question surfaces the actual gate list.

Closing ask, every call: *"Who else should I be asking these questions to?"*

---

## 3. The 90-day validation plan

Metrics fall into two families: **ledger metrics**, which a DevNet deployment can
genuinely produce today (RFQs opened, sealed quotes, settled trades and baskets,
disclosures served, best-execution attestations, settlement latency from command
submission to `TradeReport`, time-to-first-trade for a newly allocated dealer
party, and `verify` returning green); and **interview metrics**, which come only
from conversations. Neither family alone is evidence.

All thresholds below are targets set in advance so that failure is
recognisable — that is the point of writing them down before starting.

| Phase | Activities | Falsifiable hypothesis | Metric | Continue if | Stop / pivot if |
|---|---|---|---|---|---|
| **Days 1–30 — Discovery** | Build a list of 60 named targets across the three profiles. Send the cold email and DM sequences. Run the five-question script, unchanged, on every call. Record verbatim answers. Ship nothing new except bug fixes. In parallel, chase the onRails/BitSafe test-token grant, since a pilot in mock cash is a weaker pilot. | Desks that trade in size can each describe a specific, recent instance where the *fact of an enquiry* cost them price, and can name who pays for execution. | Calls completed; count who describe a concrete leakage instance unprompted; count who name a budget owner; count who name a hard blocker other than confidentiality. | ≥8 calls completed from 60 approaches; ≥5 describe a concrete instance; ≥2 name a budget owner; ≥1 agrees in writing to a DevNet pilot. | Fewer than 3 of 8 can describe a concrete instance, **or** ≥6 of 8 name the same non-confidentiality blocker first (credit, custody, permission). Then the product to build is that blocker, not this one. |
| **Days 31–60 — DevNet pilot** | Allocate the partner's dealer party on the shared validator. Have them quote against RFQs shaped from their real instrument list. Run all three rails (Vickrey, direct OTC, partial fill) plus one basket. Serve at least one live selective-disclosure request. Run `devnet.mjs verify` in their presence. Sit with their operations person through a settlement end to end. Weekly 30-minute review with the named contact. | A trader with no Daml knowledge can price, quote and settle through Tirai without hand-holding, and the sealed-quote guarantee holds under someone else's use, not just mine. | Time-to-first-trade for the new dealer party (allocation → first sealed quote → first settlement); RFQs run in the pilot; quotes sealed; settlements completed; settlement latency (submission → `TradeReport`); disclosure requests served; `verify` result each week; unassisted-action rate (steps the partner completed without me on the call). | Partner's first sealed quote within one working day of party allocation and first settlement inside the first week; ≥20 RFQs and ≥15 settlements across all three rails; every `verify` green; ≥1 disclosure served on their request; ≥60% of pilot sessions run without my intervention; partner states, unprompted, one workflow they would want on mainnet. | The partner stops initiating sessions for two consecutive weeks; **or** time-to-first-trade exceeds five working days because the flow is unusable rather than because a node was down; **or** any `verify` run shows a quote visible to a rival — a privacy failure ends the pilot immediately and becomes the only thing worth fixing. |
| **Days 61–90 — Decision** | Convert the pilot into a decision: a written commercial conversation (per-trade bps, who signs, what mainnet needs), a compliance conversation with their named reviewer, and a documented gate list from pilot to a real trade. Write the pilot up as a joint artefact the partner is willing to be named in. Re-run the discovery script on 10 fresh targets to test whether the partner is representative or an outlier. | The pilot changes behaviour: the partner will put their name to it, name a price, and name the specific conditions under which they would route real flow. | Willingness to pay (a number, in bps or per trade, said by them); named budget owner confirmed; signed or emailed intent to continue; written gate list; whether they will be named publicly; whether the second cohort of 10 confirms the same pain. | A named price is stated, **and** the partner agrees to be named as a design partner, **and** the gate list contains no item that is impossible for a solo builder or a small team inside a year. | The partner will not name a price, or will not be named publicly, or the gate list requires something structural (a regulated venue licence, an entity with capital requirements, custody permissions) that cannot be reached — in which case the honest conclusion is that Tirai is infrastructure to be sold to a venue, not a venue, and the plan changes accordingly. |

**Sequencing note.** Phase 2 needs one partner, not three. Running three
simultaneous pilots as a solo builder produces three abandoned pilots. Keep the
other two candidates warm with monthly updates and recruit the strongest.

---

## 4. Customer-validation evidence plan

After 90 days, the following is what to bring back — and, equally, what to
refuse to dress up.

**Real signal.**

- A named design partner who consents to be named, and one sentence in their
  words about why they are participating.
- Ledger evidence from the pilot that they generated: RFQs they opened, quotes
  their trader sealed, settlements, latency distribution, disclosures served on
  their request, and every `verify` run green with timestamps. This is
  reproducible from the ledger, not from a slide.
- Time-to-first-trade for their dealer party, measured, including the failures on
  the way.
- A stated price. Any number they say out loud about what they would pay beats
  any amount of enthusiasm.
- A written gate list from their compliance reviewer: what must be true before
  real flow moves.
- Verbatim quotes, including the unflattering ones. The objection they raised
  that I could not answer is more credible evidence of real contact than any
  endorsement.
- Second-cohort confirmation: 10 fresh discovery calls showing the same pain
  independently of the partner.

**Vanity, to be excluded even though it is tempting.**

- Sign-ups, waitlist entries, demo views, GitHub stars, video views.
- "Very interested", "let's stay in touch", "looks impressive" — with no
  subsequent action.
- Trades I ran myself on the ledger and presented as pilot volume. The seeded
  DevNet history (47 settlements, 16 attestations on the shared validator) is a
  functionality demonstration, not traction, and must never be described as
  usage.
- A logo on a slide with no signed permission and no participation behind it.
- Intros that never converted to a call.

**Presentation discipline.** Every number gets a source label: *ledger-measured*,
*partner-stated*, or *my estimate*. Anything in the third category that matters
is an assumption, and gets called one.

---

## 5. Differentiation one-pager

**Positioning.** *Tirai is the dealer terminal, on-ledger: a confidential
multi-dealer RFQ desk where competing dealers never see each other's quotes, the
market never sees the enquiry, and the trade settles as atomic
delivery-versus-payment in a real registry asset — with the regulator seeing
executed trades only.*

**The one-line version.** Confidential price discovery and provable settlement in
the same transaction. Everything else in the market gives you one or the other.

### The three alternatives, and the single axis each fails on

| The buyer's alternative today | What it is good at | The one axis it fails on | What Tirai does instead |
|---|---|---|---|
| **Public order book / on-chain CLOB** | Genuine, continuous, permissionless price discovery; no counterparty selection needed | **Pre-trade confidentiality.** The order *is* the signal. Posting size and direction to a transparent chain is the leak, and no amount of batching fully repairs it. | The enquiry is visible only to the invited dealer panel; each quote is signed dealer-plus-buyer with no other observers; losing quotes are archived without ever being revealed. On Canton this is a `signatory`/`observer` declaration, not cryptography. |
| **Voice or chat broker (phone, IB, Telegram)** | Perfect discretion, human judgement, relationship pricing, works today with no technology change | **Provable settlement and audit.** Nothing is atomic — the bond and the cash move on separate legs with settlement risk in between — and best execution is reconstructed after the fact from chat logs and memory. | Escrow-on-quote removes counterparty risk; `TokenTrade_Settle` moves cash and bond in one transaction or neither; and from disclosed quotes plus trade reports the desk *proves* the clearing price was at or below every disclosed rival ask. |
| **Existing dark pool / electronic RFQ venue (Tradeweb, MarketAxess, bank dark pools)** | Real liquidity, real counterparties, established compliance and market structure — the thing Tirai most conspicuously lacks | **The venue itself sees everything.** Confidentiality is a promise by a trusted intermediary that holds every enquiry and every quote, and settlement happens elsewhere, on separate rails. | Confidentiality is enforced by the ledger's own visibility model rather than by an operator's policy, and settlement is not a downstream process — it is the same transaction, across independently administered registries. |

### Where Tirai is currently weaker — stated plainly

- **No liquidity.** For a venue this is the product, and Tirai has none. Every
  trade on the ledger today was generated by me.
- **No live cETH/CBTC transactions yet.** The CIP-0056 path is built and tested
  against the real Splice v1 interfaces and a mock registry; live settlement is
  blocked on the test-token grant.
- **DevNet only.** No mainnet deployment, no venue hosting arrangement, no
  featured-app markers actually earning.
- **One person.** No SLA, no support rota, no operational cover, no smart-contract
  audit by a third party.
- **No credit, limits, or netting.** Escrow-on-quote is a blunt substitute for
  credit lines and is capital-inefficient for a dealer quoting many RFQs at once.
- **No dealer connectivity.** No FIX, no OMS/EMS integration, no market data, no
  pre-trade analytics. Traders live inside existing systems and Tirai is not in
  them.
- **No onboarding, KYC, or entity layer.** Parties are allocated by node
  operators; there is no membership model, no rulebook, no legal wrapper.
- **The regulator is a ledger party.** Real supervisors do not run validators
  today. The post-trade audit view is architecturally right and operationally
  hypothetical. *(Assumption: that a supervisor would accept an on-ledger
  observer role in place of a reporting file. Untested — Q5 of the discovery
  script is partly aimed at this.)*
- **Reporting formats.** Best-execution attestation is a ledger construct, not a
  regulatory submission in any jurisdiction's required format.
- **Interface.** A three-column hackathon desk, not a trading front end anyone
  would use for eight hours a day.

Listing these is not modesty. Half of them are what a design partner is *for* —
the gate list in phase 3 is precisely the exercise of finding out which of these
weaknesses actually block a real trade and which are cosmetic.

---

## 6. What to say on Wednesday

The honest framing is short, and leads with the gap rather than being caught by
it. Something close to: *"No design partner is signed. I want to be exact about
that rather than describe warm conversations that have not happened. What I have
is a working confidential RFQ desk on DevNet — verifiable, privacy-asserted on
the live network, with a settlement path built against the real CIP-0056
interfaces — and, since the feedback, a written 90-day plan with the thresholds
set in advance so that failure is recognisable. The plan names three candidate
profiles ranked by how reachable they actually are for one person, with the
ecosystem partners whose own briefs asked for confidential RFQ at the top of the
list, because responding to a published brief is a shorter path than a cold
approach. The riskiest assumption is not technical. It is that enquiry leakage is
a costed, budgeted pain rather than a thesis I find persuasive, and the first
thirty days are designed to kill that assumption if it is wrong — I have written
down the number of calls at which I stop."* Then offer the phase-1 kill criterion
as the proof of seriousness: a plan that cannot fail is not a plan.

What not to do: do not imply interest that does not exist, do not name any firm
that has not agreed to be named, and do not present the seeded DevNet history as
usage. The judges asked for validation. Presenting the absence of it accurately,
with a dated plan to obtain it, is a better answer than manufacturing its
appearance.
