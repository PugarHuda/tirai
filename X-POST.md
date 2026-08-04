# X post: HackCanton S2 / Tirai

Mention **@appsfactory_cc**, tag **#HackCanton**. Images live in `media/`, regenerate them
any time from the live desk with `npm run social`.

Two things to keep straight before posting. The trading history on the desk is a book I
seeded myself to exercise the flows, so it is not usage and the copy never calls it that.
And the Grand Final is Wednesday 5 August, so "made the final" is true, "won" is not.

---

## The one long tweet

> Made the Grand Final at #HackCanton S2 with Tirai, a confidential multi dealer RFQ desk
> on Canton.
>
> The idea is simple. A desk wants a price on a bond, so it asks a few dealers. Each one
> answers with a sealed quote. No dealer can see what the others bid. It isn't hidden in
> the UI either, their node never receives the contract at all.
>
> I've built this same product four times before. Arbitrum with a TEE, Stellar with ZK
> circuits, Sui with Seal, Ethereum with FHE. All that machinery just to keep one number
> secret. On Canton it's a signatory and observer declaration, and that's the whole trick.
>
> It's live on DevNet. There's a verifier inside the app that counts what each party's
> node actually holds, so you don't have to take my word for it. Best execution gets
> proven from selective disclosures instead of a public order book. And the cash leg
> settles in real Canton Coin through the DSO registry, not mock money.
>
> https://tirai.vercel.app
> https://github.com/PugarHuda/tirai
>
> Thanks @appsfactory_cc. Feedback for S3 in the replies.

Attach `media/x-2-privacy.png` to this one. It carries the whole point in one image.

Then reply to yourself with the two feedback tweets below.

---

## The thread, if you want the longer version

**1/9** attach `media/x-1-book.png`

> Tirai made the Grand Final at #HackCanton S2, so here's what it is.
>
> A confidential multi dealer RFQ desk on Canton. A buy side desk asks several dealers for
> a price on a bond. Every dealer answers with a sealed quote. No dealer sees a rival's
> number, and the market never sees the request at all.
>
> Live: https://tirai.vercel.app
>
> @appsfactory_cc

**2/9** attach `media/x-2-privacy.png`

> Same request, same moment, in each dealer's own session.
>
> Dealer A sees its sealed ask. Dealer B sees the request and no price.
>
> Dealer B isn't looking at a redacted view. Its participant node never received the quote
> contract, so there's nothing there to hide.

**3/9**

> This is the fifth time I've built this exact product.
>
> Diam on Arbitrum, with an iExec TEE.
> Segel on Stellar, two Circom circuits.
> Sealed Pair on Sui, Walrus plus Seal.
> Samar on Ethereum, Zama FHE.
> Tirai on Canton.
>
> The first four needed real cryptography to hide a price. Canton needed a signatory and
> observer declaration. Privacy is the ledger model here, not something you bolt on.

**4/9** attach `media/x-3-verify.png`

> That's an easy claim to make, so the desk ships a verifier.
>
> It queries what each party's node actually holds, live, and counts it. Every dealer has
> only its own quotes. The regulator has zero pre trade contracts and the full post trade
> record.
>
> It isn't the UI filtering rows. It's the ledger.

**5/9** attach `media/x-5-bestexec.png`

> Obvious objection: if nobody can see the quotes, how do you prove best execution?
>
> The buyer or the dealer can reveal one sealed quote to the regulator on demand. From
> those the regulator checks the cleared price beat every competing ask.
>
> Private before the trade, provable after it, with no public order book anywhere.

**6/9** attach `media/x-4-registry.png`

> The cash leg isn't play money.
>
> Trades settle in real Canton Coin, through the DSO run Token Standard registry on the
> DevNet validator. That's an issuer I don't control and can't mint into. Six trades
> settled that way so far, 60,900 CC moved to the dealers who won them.
>
> cETH and CBTC are the same code path. One field changes, the instrument admin.

**7/9**

> What worked, since @appsfactory_cc asked for real feedback.
>
> NODERS uploaded my DAR and allocated six parties in about four hours of me asking.
>
> The Token Standard is usable right now. I read the registry's own instrument list, asked
> its factories for choice contexts, and settled against it. No special access needed.
>
> And the model stayed small enough to reason about. 36 Daml test scripts cover it.

**8/9**

> What didn't, and what I'd change for S3.
>
> DAR upload and party allocation on the hackathon node are admin only. Without the
> operator you're stuck, and that isn't in the materials. Per team M2M credentials would
> fix it.
>
> My account is Google SSO, so the Keycloak password grant never worked. The browser token
> lasts three hours, which makes a public read only site impossible on that node.
>
> Biggest time sink by far: a DAR whose package name already exists on the node uploads
> fine and then sits unvetted forever. You find out much later, as
> NO_SYNCHRONIZER_FOR_SUBMISSION ... has not vetted, which reads like a queue instead of a
> rejection. That one belongs on page one of the node docs.
>
> Last thing, make it obvious which gates are platform side (mana, the daily diary) and
> which are technical. I found the diary requirement way too late.

**9/9**

> Code and the deployer that puts it on DevNet:
> https://github.com/PugarHuda/tirai
>
> Desk: https://tirai.vercel.app (read only, clone it and run npm run demo to drive it
> yourself)
>
> Final is Wednesday. Thanks @appsfactory_cc for running a hackathon where the hard part
> was the product and not the paperwork. #HackCanton

---

## Which image goes where

| Tweet | Image | Why |
|---|---|---|
| 1 | `media/x-1-book.png` | The product, full of real instruments. Reads as a desk, not a demo. |
| 2 | `media/x-2-privacy.png` | The whole thesis in one frame. Same request, two sessions, one price. |
| 4 | `media/x-3-verify.png` | Proof, plus the panel showing what a transparent chain would leak. |
| 5 | `media/x-5-bestexec.png` | The part institutions actually care about. |
| 6 | `media/x-4-registry.png` | Canton Coin balances with issuer DSO. Somebody else's asset. |

Tweets 3, 7, 8 and 9 stay text only on purpose. The feedback is what Ramil asked for and
an image would just compete with it.
