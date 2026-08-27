# X post: HackCanton S2 / Tirai

Mention **@appsfactory_cc**, tag **#HackCanton**. Images live in `media/`, regenerate them
any time from the live desk with `npm run social`.

Two things to keep straight before posting. The trading history on the desk is a book I
seeded myself to exercise the flows, so it is not usage and the copy never calls it that.
And the Grand Final is Wednesday 5 August, so "made the final" is true, "won" is not.

---

## The post (single, long)

Attach four images, in this order. X shows the first one biggest.

1. `media/x-2-privacy.png`
2. `media/x-1-book.png`
3. `media/x-3-verify.png`
4. `media/x-4-registry.png`

---

> Made the Grand Final at #HackCanton S2 with Tirai, a confidential multi dealer RFQ desk
> on Canton.
>
> Here's the problem it solves. A desk wants to move fifty million of bonds, so it asks a
> few dealers for a price. That question is itself the information. The moment anyone sees
> you asking, they know your size and your direction, and the price moves before you've
> traded. Today you pick your poison. Use a public venue or an on chain RFQ and everything
> leaks, because your request is a transaction and so is every quote. Use a voice broker
> or a chat room and it stays private, but six months later you can't prove to compliance
> that you got the best price. Privacy or proof, never both. That's why block trading in
> 2026 still happens on the phone.
>
> Tirai gives you both.
>
> A buyer invites a panel of dealers. Each dealer answers with a sealed quote, and quoting
> locks that dealer's bond into escrow, so a price is a commitment rather than a bluff.
> The cheapest ask wins and gets paid the second cheapest price, which means quoting
> honestly is the dealer's best move. Losing quotes are archived and never revealed to
> anyone. The regulator sees executed trades, and only executed trades.
>
> The part I care about: no dealer can see a rival's number, and that isn't the interface
> hiding it. Their participant node never receives the contract. There is nothing there to
> decrypt and nothing to leak.
>
> You can build this on other chains. I've tried. It takes a TEE, or zero knowledge
> circuits, or homomorphic encryption, all of it bolted on to fight the chain's own
> transparency, just to keep one number secret. On Canton it's a signatory and observer
> declaration. About forty lines of Daml. Privacy is the ledger model here, not a layer
> you add on top.
>
> What's actually live on DevNet:
>
> A verifier built into the app that queries what each party's node holds, right now, and
> counts it. Every dealer has only its own quotes. The regulator has zero pre trade
> contracts. You don't have to believe me, the app checks it against the ledger in front
> of you.
>
> Provable best execution without a public order book. The buyer or the dealer can reveal
> one sealed quote to the regulator on demand, and from those the regulator confirms the
> cleared price beat every competing ask. Confidential going in, provable coming out.
>
> A cash leg that isn't play money. Trades settle in real Canton Coin through the DSO run
> Token Standard registry on the validator, an issuer I don't control and can't mint into.
> Six trades settled that way, 60,900 CC moved to the dealers that won them. cETH and CBTC
> are the same code path, one field changes.
>
> Three execution rails: a sealed second price auction, direct bilateral OTC at the ask,
> and partial fills on both. Multi instrument baskets settle every leg atomically or not
> at all.
>
> Since @appsfactory_cc asked for real feedback and not nice words, here it is.
>
> What worked. NODERS uploaded my DAR and allocated six parties within about four hours of
> me asking, which is faster than most companies I've worked with. The Token Standard is
> genuinely usable today, I read the registry's own instrument list, asked its factories
> for choice contexts, and settled against it with no special access. And the model stayed
> small enough to reason about, 44 Daml test scripts cover the whole thing.
>
> What didn't. DAR upload and party allocation on the hackathon node are admin only, so
> without the operator you are simply stuck, and that isn't in the materials anywhere. My
> account is Google SSO, so the Keycloak password grant never worked for me, and the
> browser token only lasts three hours, which makes hosting a public read only site
> impossible on that node. I ended up hosting from a different validator.
>
> The single biggest time sink, and the thing I'd put on page one of the node docs: a DAR
> whose package name already exists on the node uploads successfully and then sits
> unvetted forever. Upgrade validation runs at vetting, not at upload. You find out much
> later when submissions fail with NO_SYNCHRONIZER_FOR_SUBMISSION ... has not vetted,
> which reads like a queue when it's actually a rejection. I lost most of a day to that.
>
> For S3: per team M2M credentials, or a self service endpoint for DAR upload and party
> allocation. And make it obvious which gates are platform side, the mana and the daily
> diary, versus which are technical. I found the diary requirement far too late.
>
> Code, including the deployer that puts it on DevNet:
> https://github.com/PugarHuda/tirai
>
> Desk: https://tirai.vercel.app
> It's read only, so clone it and run npm run demo if you want to actually drive it.
>
> Final is Wednesday. Thanks @appsfactory_cc for running a hackathon where the hard part
> was the product and not the paperwork.

---

## The images

| Order | Image | Why it earns a slot |
|---|---|---|
| 1 | `media/x-2-privacy.png` | The whole thesis in one frame. Same request, two dealer sessions, one price. |
| 2 | `media/x-1-book.png` | The product, full of real instruments. Reads as a desk, not a demo. |
| 3 | `media/x-3-verify.png` | The verifier, plus the panel showing what a transparent chain would leak. |
| 4 | `media/x-4-registry.png` | Canton Coin balances with issuer DSO. Somebody else's asset. |

`media/x-5-bestexec.png` is the spare. Swap it in for the registry shot if you'd rather
lead on best execution than on the cash leg.
