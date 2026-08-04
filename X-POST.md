# X post — HackCanton S2 / Tirai

Mention **@appsfactory_cc**, tag **#HackCanton**. Images are in `media/`, regenerate any
time from the live desk with `node scripts/make-social.mjs`.

Every number below is checkable in the repo or on the ledger. The trading history is a
book I seeded myself to exercise the flows — it is not usage, and the thread says so.

---

## Thread

**1/9** 📎 *attach `media/x-1-book.png`*

I spent HackCanton S2 building **Tirai** — a confidential multi-dealer RFQ desk on Canton.

A buy-side desk asks several dealers for a price on a bond. Every dealer answers with a
sealed quote. No dealer ever sees a rival's number. The market never sees the request.

Live on DevNet: https://tirai.vercel.app

@appsfactory_cc #HackCanton

---

**2/9** 📎 *attach `media/x-2-privacy.png`*

Here is the same request, at the same moment, in each dealer's own session.

Dealer A sees its sealed ask. Dealer B sees the request — and no price at all.

That is not a redacted view. Dealer B's participant node never received the quote
contract. There is nothing there to hide.

---

**3/9**

This is the fifth time I have built this exact product.

Diam → Arbitrum + iExec TEE
Segel → Stellar, two Circom circuits
Sealed Pair → Sui, Walrus + Seal
Samar → Ethereum, Zama FHE
**Tirai → Canton**

The first four needed heavy cryptography to hide a number. Canton needed a `signatory`
and `observer` declaration. Privacy is the ledger model, not a layer on top of it.

---

**4/9** 📎 *attach `media/x-3-verify.png`*

Because that claim is easy to make and hard to believe, the desk ships a verifier.

It queries what each party's node actually holds, live, and counts it. Each dealer: only
its own quotes. The regulator: zero pre-trade contracts, full post-trade record.

Not the UI filtering rows. The ledger.

---

**5/9** 📎 *attach `media/x-5-bestexec.png`*

The obvious objection: if nobody can see the quotes, how does anyone prove best execution?

Buyer or dealer can disclose one sealed quote to the regulator on demand. From those
disclosures the regulator confirms the cleared price beat every competing ask.

Confidential pre-trade. Provable post-trade. No public order book.

---

**6/9** 📎 *attach `media/x-4-registry.png`*

The cash leg is not mock money.

Trades settle in **real Canton Coin**, through the DSO-run Canton Token Standard registry
on the DevNet validator — an issuer I do not control and cannot mint into. Six settled
that way, 60,900 CC moved to the winning dealers.

cETH and CBTC are the same code path: one field, the instrument admin, changes.

---

**7/9**

What worked, honestly:

— NODERS turned around my DAR upload and six party allocations in about four hours.
— The Token Standard is genuinely usable today. I read the registry's own instrument
list, asked its factories for choice contexts, and settled against it. No special access.
— 36 Daml test scripts. The model is small enough to actually reason about.

---

**8/9**

What did not, and what I would fix for S3:

— DAR upload and party allocation on the hackathon node are admin-only. Without the
operator you stop dead, and that is not in the materials. Per-team M2M credentials, or a
self-service endpoint, would remove the single biggest blocker.
— My account is Google SSO, so the Keycloak password grant never worked; the browser
token lasts three hours, which makes a public read-only site impossible on that node.
— The trap that cost me the most: **a DAR whose package name already exists on the node
uploads successfully and then sits unvetted forever.** It surfaces later as
`NO_SYNCHRONIZER_FOR_SUBMISSION … has not vetted`, which reads like a queue rather than
the rejection it is. Put that on page one.
— Make it clearer which gates are platform (mana, daily diary) and which are technical. I
found the diary requirement far too late.

---

**9/9**

Code, and the deployer that puts it on DevNet:
https://github.com/PugarHuda/tirai

Desk: https://tirai.vercel.app (read-only — clone it and `npm run demo` to drive it)

Grand Final is Wednesday. Thanks @appsfactory_cc for running a hackathon where the
hard part was the product, not the paperwork. #HackCanton

---

## If you would rather post one long tweet than a thread

> Built **Tirai** at #HackCanton S2: a confidential multi-dealer RFQ desk on Canton.
>
> Dealers answer a bond enquiry with sealed quotes. No dealer sees a rival's price — not
> hidden by the interface, their node never receives it. On four other chains I needed a
> TEE, ZK circuits, Seal or FHE to do this. On Canton it is a `signatory`/`observer`
> declaration.
>
> Live on DevNet, with a verifier that counts what each party's node actually holds, best
> execution proven from selective disclosures rather than a public order book, and a cash
> leg that settles in real Canton Coin through the DSO's Token Standard registry.
>
> https://tirai.vercel.app · https://github.com/PugarHuda/tirai
>
> Thanks @appsfactory_cc — feedback for S3 in the replies.

*(then reply to yourself with tweets 7 and 8 above)*

---

## Attachment order, at a glance

| Tweet | Image | Why it earns its place |
|---|---|---|
| 1 | `media/x-1-book.png` | The product, full of real instruments — reads as a desk, not a demo |
| 2 | `media/x-2-privacy.png` | The whole thesis in one frame: same request, two sessions, one price |
| 4 | `media/x-3-verify.png` | Proof, with the "what a transparent chain would leak" contrast |
| 5 | `media/x-5-bestexec.png` | The institutional payoff |
| 6 | `media/x-4-registry.png` | Canton Coin balances, issuer `DSO` — someone else's asset |

Tweets 3, 7, 8 and 9 are text only, on purpose: the feedback is the part Ramil asked for,
and an image would only compete with it.
