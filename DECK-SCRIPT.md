# Reading script for the deck

Fourteen slides, four minutes. Written to be spoken, not read off a page, so it is
short sentences and ordinary words. Say it the way you would explain it to one person
sitting next to you.

Two rules while you speak. Pause where the line breaks are, that is where you breathe.
And never rush a number, the numbers are the part they check afterwards.

Timings are a budget, not a stopwatch. If you fall behind, drop a whole slide rather than
speeding up. There is a two minute cut at the bottom for that.

634 spoken words, which is about four and a half minutes at a comfortable pace and four
minutes at a brisk one. Rehearse it once with a timer, then trim whatever you keep
stumbling on. The sentence you stumble on twice is the sentence to cut.

---

## Slide 1 · Cover
**0:00 to 0:10**

> Hi, I'm Pugar. I built Tirai, and it's a confidential trading desk on Canton.
>
> Let me start with why anyone needs one.

*Advance immediately. Don't linger on your own name.*

---

## Slide 2 · Asking for a price is the information
**0:10 to 0:40**

> A bank wants to sell fifty million of bonds. First it has to ask dealers for a price.
>
> But the question is the information. The moment someone sees you asking, they know your
> size and your direction, and the price moves away from you before you've traded.
>
> That's why block trading still happens on the phone.

*Ini pembukaan yang harus mendarat. Pelan, jangan buru-buru ke slide berikutnya.*

---

## Slide 3 · Privacy, or proof. Never both.
**0:40 to 1:00**

> Today you get two options, and both are bad.
>
> A public venue, or an on-chain RFQ, leaks everything. Your request is a transaction.
> So is every quote.
>
> A voice broker stays private, but six months later you can't prove to compliance that
> you got the best price.
>
> Privacy, or proof. Pick one.

*Tunjuk dua kartu itu saat menyebutnya. Jangan dibacakan isinya, mereka bisa baca sendiri.*

---

## Slide 4 · The dealer terminal, on the ledger
**1:00 to 1:20**

> Tirai gives you both.
>
> A buyer picks a panel of dealers. Each one answers with a sealed quote, and answering
> locks their bond into escrow, so a price is a commitment and not a bluff.
>
> The cheapest ask wins and gets paid the second cheapest price. Strange the first time
> you hear it. It means quoting honestly is the dealer's best move.

---

## Slide 5 · Dealer B's node never received dealer A's quote
**1:20 to 1:45**

> Here's the part I care about.
>
> No dealer sees a rival's number, and it isn't the screen hiding it. Their participant
> node never received the contract. Nothing to decrypt, nothing to leak.

---

## Slide 6 · The chain did the hard part.
**1:45 to 2:00**

> To keep one number secret on another chain, you need a trusted enclave, or zero knowledge
> circuits, or threshold encryption, or homomorphic encryption. Heavy machinery, all of it.
>
> On Canton it's a signatory and an observer declaration. About forty lines. That's the
> whole trick.

*Slide ini sengaja menyebut tekniknya, bukan proyeknya. Kalau ada yang bertanya apakah kamu
pernah membangun ini sebelumnya, jawab singkat dan jujur, lalu kembali ke poinnya: yang
menarik itu apa yang dihapus Canton, bukan berapa kali kamu mencoba.*

---

## Slide 7 · Desks whose tickets are big enough to leak
**2:00 to 2:20**

> Who buys it. Fixed income and crypto desks, at banks and asset managers and prop
> shops, moving between one and a hundred million. Below a million the leakage is a
> rounding error and a public venue is fine.
>
> And the venues that would host this as an embedded app.

---

## Slide 8 · A venue fee the settlement can collect
**2:20 to 2:40**

> A per trade venue fee. Basis points of notional, in the settlement asset, taken inside
> the settlement transaction. If the trade settles, the fee settled with it. No invoice,
> no collection risk.
>
> That runs. One settlement on Devnet cleared at four and a quarter million, twenty five
> basis points, ten thousand six hundred and twenty five to the venue. What I haven't got
> is the rate. Blank charges nothing, and I'd rather a design partner argued the number
> than pick one myself.

*Kalau ada yang menekan soal angka bps, jawab persis kalimat terakhir itu: mekanismenya jalan,
angkanya belum diputuskan. Kalau ditanya pendapatan, jawab nol — ini test asset di Devnet.*

---

## Slide 9 · Not a DEX. Not a chat room.
**2:40 to 3:00**

> A public order book gives you proof and no privacy. A voice broker gives you privacy
> and no proof. A dark pool gives you both, if you completely trust the operator.
>
> Tirai doesn't ask you to trust an operator.

---

## Slide 10 · Not a mock-up
**3:00 to 3:15**

> This is all live. Two DevNet participants, the same package.
>
> Fifty settled trades. Five atomic baskets. Sixteen best execution attestations.
> Thirty six Daml test scripts.
>
> One honest note. I generated that trading history myself. It shows the product works.
> It is not customers.

*Kalimat terakhir itu wajib. Justru itu yang membuat sisanya dipercaya.*

---

## Slide 11 · The claim is checked against the live ledger
**3:15 to 3:30**

> Two views do the proving.
>
> One counts what each party's node holds. Every dealer, only its own quotes. The
> regulator, nothing before a trade settles.
>
> The other proves best execution with no public order book. Counterparties disclose
> their sealed asks to the regulator, and it checks the cleared price beat all of them.

---

## Slide 12 · Two assets. Neither of them mine.
**3:30 to 3:50**

> Your feedback asked for settlement in a real asset from a real issuer. Here it is,
> twice.
>
> Six trades in Canton Coin through the DSO's registry. Two in real CBTC through the
> registry BitSafe issues on. I control neither and can't mint into either.
>
> cETH is the same code path. One field changes. It goes live the day the tokens land.

*Ini jawaban langsung atas kritik juri. Ucapkan dengan tenang, jangan seperti menang argumen.*

---

## Slide 13 · One person. Five days.
**3:50 to 4:00**

> That's me. Pugar. Final year student, building this on my own.
>
> Repo created on the twenty second of July. Settlement leg the next day. Second participant
> deployed and verified by the twenty sixth.
>
> And there's a written ninety day validation plan, with the stop criteria set in advance.

---

## Slide 14 · Close
**4:00**

> Tirai means curtain. Price discovery happens behind it.
>
> The desk is live at tirai dot vercel dot app. Thank you.

*Berhenti. Jangan menambah kalimat penutup lagi, biarkan senyap sebentar sebelum tanya jawab.*

---

## If they cut you to two minutes

Say slides 2, 4, 5, 10, 12, 14. In that order. Skip the rest without apologising for it.

The spine is: the question leaks, we seal it, the rival's node genuinely doesn't have it,
it's live, it settles in assets I don't issue, here's the link.

## Three things to avoid

You will be tempted to say "as you can see". Don't, just say what it is.

Don't read a slide out loud. They can read faster than you can speak, and it makes the
whole thing feel like a document.

If you lose your place, stop and look at the slide title. Every title is a full sentence
you can say out loud and continue from.
