# Tirai — Q&A rehearsal pack (EN / ID)

HackCanton Season #2 Grand Final · Wednesday 5 August 2026, 14:00 UTC · 4 minutes plus
judges' questions. Builder: Pugar Huda Mantoro (team **Diam**), solo.

Twenty questions, wider and deeper than the Q&A block in `PITCH.md`. Every answer is
grounded in this repository. Answer, then stop — do not fill silence. Anything not
checkable in the repo is marked `[assumption]` / `[asumsi]`.

Rehearsal rule: read the English aloud once and the Indonesian once. If a sentence is hard
to say out loud, cut it rather than speed up.

---

## 1. Where does the confidentiality actually come from?
**ID —** Kerahasiaannya sebenarnya datang dari mana?

**Answer (EN).** From the ledger model, not from encryption. A quote is a Daml contract
whose signatories are the dealer and the buyer, and it has no observers at all. On Canton, a
participant node only receives the contracts its own parties are party to. So Dealer B's node
never receives Dealer A's quote. There is nothing to decrypt and nothing to leak. The RFQ
itself carries the invited dealers as observers, so the market never sees the enquiry either.
The regulator is an observer on `TradeReport` only. That is a few lines of a template.

**Jawaban (ID).** Dari model ledger-nya, bukan dari enkripsi. Sebuah quote adalah contract
Daml yang signatory-nya hanya dealer dan buyer, tanpa observer sama sekali. Di Canton, satu
participant node hanya menerima contract yang menyangkut party-nya sendiri. Jadi node Dealer
B memang tidak pernah menerima quote Dealer A. Tidak ada yang perlu didekripsi, dan tidak ada
yang bisa bocor. RFQ-nya sendiri hanya memasang dealer yang diundang sebagai observer, jadi
pasar tidak pernah melihat permintaan itu. Regulator hanya observer di `TradeReport`. Semua
itu beberapa baris di dalam template.

**If they push back:** If you do not want to trust the template, `node scripts/devnet.mjs verify`
asserts it on the live network and exits non-zero if a single quote ever leaks.

---

## 2. Why Canton, and not ZK, a TEE, or FHE? You could have built this anywhere.
**ID —** Kenapa Canton, bukan ZK, TEE, atau FHE? Ini bisa dibangun di mana saja.

**Answer (EN).** I did build it everywhere — four times, and this is the fifth. Diam on
Arbitrum with iExec TEEs. Segel on Stellar with two Groth16 circuits and hand-rolled
Poseidon. Sealed Pair on Sui with Walrus commitments and Seal threshold encryption. Samar on
Ethereum with Zama's fhEVM. In every one, most of the work was cryptography fighting the
chain's transparency, and every one added a trust assumption or a performance ceiling. On
Canton the same guarantee is a `signatory` and `observer` declaration. The privacy-machinery
column for Canton in my README says "none".

**Jawaban (ID).** Saya memang sudah membangunnya di mana-mana — empat kali, dan ini yang
kelima. Diam di Arbitrum dengan TEE iExec. Segel di Stellar dengan dua circuit Groth16 dan
Poseidon yang ditulis tangan. Sealed Pair di Sui dengan commitment Walrus dan threshold
encryption Seal. Samar di Ethereum dengan fhEVM Zama. Di semuanya, sebagian besar pekerjaan
adalah kriptografi yang melawan transparansi chain-nya, dan semuanya menambah satu asumsi
kepercayaan atau satu batas performa. Di Canton, jaminan yang sama cukup deklarasi
`signatory` dan `observer`. Kolom privacy machinery untuk Canton di README saya isinya
"none".

**If they push back:** ZK would still be needed to hide a party's data from the node operator
that hosts it — Canton hides contracts between parties, not from the participant hosting them.

---

## 3. What does submitting a quote actually commit the dealer to?
**ID —** Saat dealer mengirim quote, sebenarnya dia terikat pada apa?

**Answer (EN).** Quoting is a commitment, not a message. `SubmitQuote` checks the dealer was
invited, that the RFQ has not expired, and that the dealer really holds a lot of exactly the
requested instrument and quantity, from the expected issuer. Then it locks that lot into an
`EscrowedHolding`. Releasing the escrow requires both the dealer and the buyer, so a dealer
cannot quietly pull its collateral back while its quote is still live and sell the same bond
twice. A standard wallet reads that escrow as a locked position through the `HoldingV1`
interface.

**Jawaban (ID).** Memberi quote itu komitmen, bukan sekadar pesan. `SubmitQuote` memeriksa
bahwa dealer memang diundang, RFQ-nya belum lewat deadline, dan dealer benar-benar memegang
lot dengan instrument dan quantity yang persis diminta, dari issuer yang diharapkan. Setelah
itu lot tersebut dikunci menjadi `EscrowedHolding`. Untuk melepas escrow dibutuhkan otoritas
dealer dan buyer sekaligus, jadi dealer tidak bisa diam-diam menarik collateral-nya selagi
quote masih hidup lalu menjual bond yang sama dua kali. Di wallet standar, escrow itu terbaca
sebagai posisi terkunci lewat interface `HoldingV1`.

**If they push back:** The honest cost is capital efficiency — quoting ten clients means
locking ten lots, where a real desk works on credit and netting.

---

## 4. How is the Vickrey second price computed, and what enforces it on-ledger?
**ID —** Bagaimana second price Vickrey dihitung, dan apa yang menegakkannya di ledger?

**Answer (EN).** The buyer awards with a list of quote contract ids. The choice fetches each
one, asserts its `rfqId` is this RFQ, rejects duplicate ids, and asserts one quote per dealer
so nobody can stuff the book. It sorts on price with the dealer as tie-break, so the winner
is deterministic whatever order the buyer listed them in. The head of that sort wins; the
clearing price is the second entry's price, or the winner's own price if there is only one
quote. Losers are exercised with `RejectQuote` and archived unrevealed.

**Jawaban (ID).** Buyer melakukan award dengan mengirim daftar contract id quote. Choice-nya
fetch satu per satu, memastikan `rfqId`-nya memang RFQ ini, menolak id yang duplikat, dan
memastikan satu dealer hanya punya satu quote, supaya buku tidak bisa dijejali. Lalu diurutkan
berdasarkan harga dengan dealer sebagai tie-break, sehingga pemenangnya deterministik, tidak
peduli urutan yang dikirim buyer. Yang teratas menang; clearing price-nya adalah harga entry
kedua, atau harga si pemenang sendiri kalau quote-nya cuma satu. Yang kalah dieksekusi dengan
`RejectQuote` dan diarsipkan tanpa pernah dibuka.

**If they push back:** The buyer cannot game it by leaving a cheap quote out of the list —
omitting a quote only ever raises the price the buyer pays. `Award`, `AwardPartial` and
`AwardWithAllocation` share the identical selection logic.

---

## 5. How do I know the desk is not simply hiding rows in the browser?
**ID —** Bagaimana saya tahu desk ini bukan sekadar menyembunyikan baris di browser?

**Answer (EN).** Two answers, both inside the product. **Verify privacy** counts what each
party's node actually holds, live, and shows the regulator holding zero pre-trade contracts.
**Side-by-side proof** puts every party's own view on one screen at once — which no deployed
venue could show you, because no single session can read four nodes. Off the desk,
`scripts/devnet.mjs verify` runs the same assertions against DevNet and exits non-zero if a
dealer ever sees a rival's quote. It is green on both participants.

**Jawaban (ID).** Ada dua jawaban, dua-duanya ada di dalam produknya. **Verify privacy**
menghitung apa yang benar-benar dipegang node masing-masing party, live, dan menunjukkan
regulator memegang nol contract pre-trade. **Side-by-side proof** menampilkan view milik semua
party sekaligus dalam satu layar — sesuatu yang tidak mungkin ditampilkan venue mana pun yang
sudah live, karena satu sesi tidak bisa membaca empat node. Di luar desk,
`scripts/devnet.mjs verify` menjalankan assertion yang sama di DevNet dan keluar non-zero
kalau ada satu quote saja yang terlihat oleh rival. Hasilnya hijau di dua participant.

**If they push back:** The "Signed in as" control is not a filter — it changes which
participant's contracts are read, so the browser never received the other quote in the first place.

---

## 6. Canton Coin is on the same validator you use. Does that really count as an external issuer?
**ID —** Canton Coin ada di validator yang sama. Apa itu benar-benar dihitung issuer eksternal?

**Answer (EN).** Yes. Canton Coin is issued and administered by the DSO. I do not run that
registry, I cannot mint into it, and I wrote none of it. My side calls its transfer factory
and its allocation factory over HTTP, takes the choice context and the disclosed contracts it
returns, and forwards them to the JSON Ledger API. Then `TokenTrade_Settle` exercises
`Allocation_ExecuteTransfer` on the registry's own allocation contract. Six trades settled
that way — four reverse-Vickrey, two direct OTC, 60,900 Canton Coin moved to the winning
dealers.

**Jawaban (ID).** Ya. Canton Coin diterbitkan dan diadministrasikan oleh DSO. Registry itu
bukan saya yang jalankan, saya tidak bisa mint ke dalamnya, dan tidak satu baris pun kodenya
saya tulis. Sisi saya memanggil transfer factory dan allocation factory milik registry lewat
HTTP, mengambil choice context dan disclosed contract yang dikembalikan, lalu meneruskannya ke
JSON Ledger API. Setelah itu `TokenTrade_Settle` meng-exercise `Allocation_ExecuteTransfer`
di allocation contract milik registry sendiri. Enam trade sudah settle seperti itu — empat
reverse-Vickrey, dua direct OTC, 60.900 Canton Coin berpindah ke dealer pemenang.

**If they push back:** If it were still my own mock I could mint the cash. I cannot — the
buyer had to be funded from the validator's own wallet party through the registry's transfer
factory first.

---

## 7. What actually changes when the cETH grant arrives?
**ID —** Apa yang benar-benar berubah begitu grant cETH turun?

**Answer (EN).** One field. `cashInstrument` is an `InstrumentId` — an admin plus an id — so
cETH is the same code path with a different administrator. The award, the allocation, the
atomic settlement and the tests do not change. `testCbtcDvp` already proves the path against
a second, differently administered registry, and the Canton Coin run proves it against a live
external one. What is missing is the test tokens from onRails and BitSafe. It is a grant, not
a build. I will not claim a live cETH trade until one exists.

**Jawaban (ID).** Satu field saja. `cashInstrument` itu `InstrumentId` — admin plus id — jadi
cETH adalah code path yang sama dengan administrator yang berbeda. Proses award, allocation,
settlement atomiknya, dan test-nya tidak berubah. `testCbtcDvp` sudah membuktikan jalur ini
melawan registry kedua dengan admin berbeda, dan run Canton Coin membuktikannya melawan
registry eksternal yang hidup. Yang belum ada hanyalah test token dari onRails dan BitSafe.
Itu urusan grant, bukan urusan membangun. Saya tidak akan mengklaim ada trade cETH live
sebelum trade itu benar-benar ada.

**If they push back:** The residual risk is a registry that implements the standard
differently — that would be a day of integration work, not a redesign `[assumption]`.

---

## 8. What breaks if the registry misbehaves, or is simply down?
**ID —** Apa yang rusak kalau registry-nya bermasalah, atau sekadar mati?

**Answer (EN).** Settlement is one atomic transaction, so if `Allocation_ExecuteTransfer`
fails the whole thing rolls back: the dealer keeps its bond, the buyer keeps its cash, nothing
settles half way. If the registry is merely unavailable, the trade waits until `allocateBefore`
or `settleBefore` passes, and then `TokenTrade_Cancel` or `TokenTrade_Expire` returns the
dealer's collateral. What I cannot compensate for is a registry that censors or freezes a
party. That risk belongs to whoever issues the cash, exactly as it does off-chain.

**Jawaban (ID).** Settlement-nya satu transaksi atomik, jadi kalau
`Allocation_ExecuteTransfer` gagal, semuanya di-roll back: bond tetap di dealer, cash tetap di
buyer, tidak ada yang settle setengah jalan. Kalau registry-nya cuma tidak bisa dihubungi,
trade-nya menunggu sampai `allocateBefore` atau `settleBefore` lewat, lalu `TokenTrade_Cancel`
atau `TokenTrade_Expire` mengembalikan collateral dealer. Yang tidak bisa saya kompensasi
adalah registry yang menyensor atau membekukan satu party. Risiko itu melekat pada penerbit
cash-nya, persis seperti di dunia off-chain.

**If they push back:** One practical lesson from the live run: the registry's choice contexts
are round-scoped, so a retry must refetch the context rather than replay it.

---

## 9. What stops a trade settling in the wrong asset, or against an impostor registry?
**ID —** Apa yang mencegah trade settle di aset yang salah, atau ke registry palsu?

**Answer (EN).** Instrument identity is bound end to end. The RFQ names the pay instrument and
optionally the pay issuer. `ConvertToTokenTrade` asserts the cash instrument's id matches the
quoted pay instrument and its admin matches the RFQ's pay issuer. At settlement, the
allocation is compared against a specification rebuilt from the trade's own fields, including
the settlement reference of the consumed quote. So a quote priced in cETH cannot settle in
CBTC, and it cannot settle against a registry that reuses the id under a different
administrator. `testWrongInstrumentRejected` covers exactly that.

**Jawaban (ID).** Identitas instrument-nya diikat dari ujung ke ujung. RFQ menyebutkan pay
instrument, dan opsional juga pay issuer-nya. `ConvertToTokenTrade` memastikan id cash
instrument sama dengan pay instrument yang di-quote, dan admin-nya sama dengan pay issuer di
RFQ. Saat settlement, allocation-nya dibandingkan dengan spesifikasi yang dibangun ulang dari
field milik trade itu sendiri, termasuk settlement reference dari quote yang dikonsumsi. Jadi
quote berharga cETH tidak bisa settle di CBTC, dan tidak bisa settle ke registry yang memakai
id sama dengan administrator berbeda. `testWrongInstrumentRejected` menguji persis itu.

**If they push back:** A forged or repointed allocation fails the same equality check. That is
a test in the suite, not a claim.

---

## 10. Who pays, and how much?
**ID —** Siapa yang membayar, dan berapa?

**Answer (EN).** A per-trade venue fee, basis points of notional, in the settlement asset,
collected inside the settlement transaction. If the trade settles, the fee is paid — no
invoicing and no collection risk. That is built and it has collected: the RFQ carries a venue
and a rate, the cut is split off before the dealer is paid, and the trade report records the
amount, so the audit trail states it rather than the venue having to claim it. One settlement
on DevNet cleared 4,250,000 at 25 bps: 10,625 to the venue, 4,239,375 to the winning dealer,
and the buyer paid exactly what it cleared at. On top, CIP-0047 featured-app markers would
accrue network rewards on every settlement — those are *not* in the code.

Three honest points. The rate is not set, deliberately: blank charges nothing, and 25 bps is
the number that settlement used, not a price list. On the registry rail — Canton Coin, CBTC —
no fee is taken, because that cash moves through the issuer's allocation rather than a holding
this desk can split. And revenue is zero: test assets, my own parties, no paying customer.

**Jawaban (ID).** Venue fee per trade, dalam basis point dari notional, dibayar dalam
settlement asset dan dipungut di dalam transaksi settlement itu sendiri. Kalau trade-nya
settle, fee-nya terbayar — tanpa invoice, tanpa risiko penagihan. Di atas itu, featured-app
marker CIP-0047 seharusnya mengakumulasi network reward di setiap settlement — bagian itu
belum dibangun. Dua hal yang jujur harus
saya sampaikan. Mekanismenya sudah jalan dan sudah memungut: satu settlement di Devnet cleared
4.250.000 pada 25 bps, 10.625 ke venue, 4.239.375 ke dealer pemenang, dan buyer tetap membayar
persis harga clearing-nya. Tapi tarifnya sengaja belum saya tetapkan — kosong berarti tidak
memungut apa pun, dan 25 bps itu angka di settlement tersebut, bukan daftar harga. Di rail
registry (Canton Coin, CBTC) fee tidak diambil, karena kas-nya bergerak lewat alokasi issuer,
bukan lewat holding yang bisa dipecah desk ini. Marker CIP-0047 belum ada di kode. Dan
pendapatannya nol: test asset, party milik saya sendiri.

**If they push back:** I would rather be caught with an unset price than with an invented one.

---

## 11. How big is this market?
**ID —** Sebesar apa pasarnya?

**Answer (EN).** I will give you the shape, not a figure. There is no market-size number in my
repository, and I am not going to invent one on this call. The target ticket is one to a
hundred million notional; below a million, leakage is a rounding error and a public venue is
fine. Revenue is basis points on that notional, so a single desk clearing institutional size
is already a real business, and tokenised bond issuance is the growth curve underneath it
`[assumption]`. I would rather size it with a design partner than guess.

**Jawaban (ID).** Saya akan memberi bentuknya, bukan angkanya. Tidak ada angka ukuran pasar di
repo saya, dan saya tidak akan mengarang satu pun di sini. Ticket yang disasar satu sampai
seratus juta notional; di bawah satu juta, kebocoran informasi cuma pembulatan dan venue
publik sudah cukup. Pendapatannya basis point dari notional itu, jadi satu desk saja yang
clearing di ukuran institusional sudah jadi bisnis yang nyata, dan penerbitan obligasi
ter-tokenisasi adalah kurva pertumbuhan di bawahnya `[asumsi]`. Saya lebih memilih mengukurnya
bersama design partner daripada menebak.

**If they push back:** If a partner tells me enquiry leakage is not a costed, budgeted pain,
that kills the thesis — and my first thirty days are designed to find that out.

---

## 12. Why not just use a public order book or an on-chain RFQ?
**ID —** Kenapa tidak pakai order book publik atau RFQ on-chain saja?

**Answer (EN).** On a public book the order is the signal. Posting size and direction to a
transparent chain is the leak itself, and batching does not fully repair it. In Tirai the
enquiry reaches only the invited panel, each quote is signed dealer plus buyer with no other
observers, and losing quotes are archived without ever having been transmitted. What a public
book gives you that I do not is continuous, permissionless liquidity. I am request-driven: no
market making, no matching engine. For a one-million ticket, a public venue is the right
answer.

**Jawaban (ID).** Di order book publik, order itu sendiri adalah sinyalnya. Menaruh ukuran dan
arah di chain yang transparan sudah merupakan kebocoran, dan batching tidak sepenuhnya
memperbaikinya. Di Tirai, permintaannya hanya sampai ke panel yang diundang, tiap quote
di-sign dealer plus buyer tanpa observer lain, dan quote yang kalah diarsipkan tanpa pernah
dikirim ke siapa pun. Yang dipunya order book publik dan tidak saya punya adalah likuiditas
yang kontinu dan permissionless. Tirai digerakkan oleh request: tidak ada market making,
tidak ada matching engine. Untuk ticket satu juta, venue publik justru jawaban yang benar.

**If they push back:** The two are complements, not rivals — small tickets belong on a book,
large ones do not.

---

## 13. A voice or chat broker is already private and already works. Why replace it?
**ID —** Broker suara atau chat sudah privat dan sudah jalan. Kenapa harus diganti?

**Answer (EN).** The broker wins on discretion, judgement and relationships, and it works
today with no technology change. It loses on proof. Nothing is atomic: the bond and the cash
move on separate legs with settlement risk in between, and best execution is reconstructed
months later from chat logs and memory. Tirai escrows on quote, moves both legs in one
transaction or neither, and produces a machine-checkable attestation that the clearing price
was no worse than every disclosed rival ask. Sixteen of those sit on the ledger.

**Jawaban (ID).** Broker unggul di kebijaksanaan, penilaian manusia, dan relasi — dan hari ini
sudah jalan tanpa perlu ganti teknologi. Kalahnya di pembuktian. Tidak ada yang atomik: bond
dan cash bergerak di dua leg terpisah dengan settlement risk di antaranya, dan best execution
baru direkonstruksi berbulan-bulan kemudian dari log chat dan ingatan. Tirai mengunci escrow
saat quote dibuat, memindahkan dua leg dalam satu transaksi atau tidak sama sekali, dan
menghasilkan attestation yang bisa diperiksa mesin bahwa clearing price-nya tidak lebih buruk
dari setiap ask rival yang di-disclose. Enam belas attestation seperti itu ada di ledger.

**If they push back:** The broker also brings the counterparties, which is exactly the part I
do not have yet.

---

## 14. Canton gives you privacy for free. What makes this different from the other privacy demos?
**ID —** Canton memberi privasi gratis. Apa bedanya ini dengan demo privasi lain?

**Answer (EN).** Sub-transaction privacy is Canton's, not mine, and I say so plainly. The
difference is what sits on top. Most privacy demonstrations stop at showing that Canton can
keep a secret, usually with one bilateral contract. Tirai runs a real price-discovery
mechanism — reverse-Vickrey second price, direct OTC at the ask, partial fills on both rails —
settles multi-instrument baskets atomically, gives either side selective disclosure to a
regulator, and settles the cash leg through an external Token Standard registry I do not
control. Private price discovery with a receipt.

**Jawaban (ID).** Sub-transaction privacy itu milik Canton, bukan milik saya, dan saya
katakan itu terang-terangan. Bedanya ada di lapisan di atasnya. Kebanyakan demo privasi
berhenti di menunjukkan bahwa Canton bisa menyimpan rahasia, biasanya dengan satu contract
bilateral. Tirai menjalankan mekanisme price discovery yang sungguhan — reverse-Vickrey second
price, direct OTC di harga ask, dan partial fill di kedua rail — menyelesaikan basket
multi-instrument secara atomik, memberi kedua sisi selective disclosure ke regulator, dan
menyelesaikan cash leg lewat registry Token Standard eksternal yang bukan saya kendalikan.
Price discovery yang rahasia, tapi ada kuitansinya.

**If they push back:** Take the privacy for granted and the question becomes whether the
mechanism is right — and that is precisely what a design partner is for.

---

## 15. What happens if no dealer ever quotes? You have no liquidity.
**ID —** Bagaimana kalau tidak ada dealer yang memberi quote? Anda tidak punya likuiditas.

**Answer (EN).** Then the request expires or the buyer cancels it, and nothing is lost — no
escrow was taken and nothing was revealed to anyone. But you are pointing at the real
weakness. For a venue, liquidity is the product, and Tirai has none: every trade on that
ledger is one I generated. That is why my first ask is one design-partner desk rather than
money. A dealer panel is the minimum viable market, and a panel is five names, not five
thousand.

**Jawaban (ID).** Kalau begitu, request-nya kedaluwarsa atau dibatalkan buyer, dan tidak ada
yang hilang — tidak ada escrow yang diambil dan tidak ada yang terungkap ke siapa pun. Tapi
Anda memang sedang menunjuk kelemahan yang nyata. Bagi sebuah venue, likuiditas itu produknya,
dan Tirai belum punya: setiap trade di ledger itu saya sendiri yang membuat. Karena itu
permintaan pertama saya adalah satu desk sebagai design partner, bukan uang. Panel dealer
adalah pasar minimum yang layak, dan satu panel itu lima nama, bukan lima ribu.

**If they push back:** The honest possibility is that Tirai is infrastructure to be sold to a
venue that already has the panel, rather than a venue itself — the 90-day plan is written to
surface that.

---

## 16. What stops a buyer stalling after the award, leaving the dealer's collateral locked?
**ID —** Apa yang mencegah buyer mengulur waktu setelah award dan mengunci collateral dealer?

**Answer (EN).** The dealer is never stranded. `TokenTrade` carries two deadlines,
`allocateBefore` and `settleBefore`. If the buyer never funds the allocation, the dealer
exercises `TokenTrade_Expire` once the settle deadline passes and its escrowed bond comes
straight back. The buyer can also abort deliberately with `TokenTrade_Cancel`, which releases
its own allocation and returns the collateral, and the wallet-facing `AllocationRequest_Reject`
does the same from the wallet side. All three are tested. What is not modelled is any penalty
for stalling.

**Jawaban (ID).** Dealer tidak pernah ditinggal menggantung. `TokenTrade` membawa dua
deadline, `allocateBefore` dan `settleBefore`. Kalau buyer tidak pernah mendanai
allocation-nya, dealer meng-exercise `TokenTrade_Expire` begitu settle deadline lewat, dan
bond yang di-escrow langsung kembali. Buyer juga bisa membatalkan secara sengaja lewat
`TokenTrade_Cancel`, yang melepas allocation-nya sendiri dan mengembalikan collateral, dan
`AllocationRequest_Reject` dari sisi wallet melakukan hal yang sama. Ketiganya ada test-nya.
Yang belum dimodelkan adalah sanksi untuk buyer yang mengulur waktu.

**If they push back:** A real venue would price that as a fee or a reputation consequence.
That is a rulebook question, and a rulebook needs a venue `[assumption]`.

---

## 17. A private venue is the opposite of what a regulator wants. And who holds the assets?
**ID —** Venue privat itu justru lawan dari keinginan regulator. Lalu siapa yang memegang asetnya?

**Answer (EN).** The regulator is a party in the model, not an afterthought — one of the four
identities you can sign in to the desk as. It observes trade reports only: zero pre-trade,
complete post-trade. That is the shape of existing block-trading rules, which permit pre-trade
opacity for large-in-scale orders and then demand full post-trade reporting. Selective
disclosure lets either side open one sealed quote to it on demand. What I do not have is
custody, KYC, onboarding or a legal wrapper. A hosting venue brings those, and real supervisors
do not run validators today `[assumption]`.

**Jawaban (ID).** Regulator adalah party di dalam model, bukan tempelan — salah satu dari
empat identitas yang bisa dipakai untuk masuk ke desk. Dia hanya melihat trade report: nol
pre-trade, lengkap post-trade. Itu persis bentuk aturan block trading yang sudah ada, yang
mengizinkan keburaman pre-trade untuk order berukuran besar lalu menuntut pelaporan post-trade
yang penuh. Selective disclosure memungkinkan salah satu pihak membuka satu sealed quote
kepadanya kapan pun diminta. Yang belum saya punya adalah custody, KYC, onboarding, dan
pembungkus hukum. Itu dibawa oleh venue yang menghosting, dan sampai hari ini regulator
sungguhan tidak menjalankan validator `[asumsi]`.

**If they push back:** The best-execution attestation is a ledger construct, not a filing in
any jurisdiction's required format. That is honest work still to do.

---

## 18. What breaks at scale?
**ID —** Apa yang jebol kalau skalanya naik?

**Answer (EN).** Three things, in order. Escrow on quote is fully collateralised, so a dealer
quoting ten clients locks ten lots — real desks use credit and netting, and that is the
capital-efficiency ceiling. The award passes an explicit list of quote contract ids, which is
fine for a panel of five or ten and would need rethinking at a hundred. And operationally,
every dealer must run or rent a participant node, which is onboarding more than engineering.
None of those is a privacy problem: the privacy model is per transaction and does not degrade
with volume.

**Jawaban (ID).** Tiga hal, berurutan. Escrow saat quote itu ter-collateral penuh, jadi dealer
yang memberi quote ke sepuluh klien harus mengunci sepuluh lot — desk sungguhan bekerja dengan
credit dan netting, dan di situlah batas efisiensi modalnya. Award-nya mengirim daftar
contract id quote secara eksplisit; itu wajar untuk panel lima atau sepuluh dealer, tapi perlu
dipikirkan ulang untuk seratus. Lalu secara operasional, tiap dealer harus menjalankan atau
menyewa participant node, dan itu soal onboarding, bukan soal teknik. Tidak satu pun dari itu
masalah privasi: model privasinya per transaksi dan tidak melemah seiring volume.

**If they push back:** One read path did break with growth — a wildcard active-contracts query
is capped at two hundred rows by the node — and the fix was to read per template and re-join.

---

## 19. You are one person. Why can you execute this?
**ID —** Anda sendirian. Kenapa Anda bisa mengeksekusi ini?

**Answer (EN).** Because the hard part is behind me. This is the fifth implementation of the
same thesis, so the product design, the auction mechanics and the failure modes are not
hypotheses any more. The journal shows the pace: repo created 22 July, the whole CIP-0056
settlement leg landed 23 July, hosted desk 24 July, second participant deployed and verified
26 July, and real Canton Coin settlement after that. What I cannot do alone is get an
institutional desk into a room. That is why my first ask is an introduction.

**Jawaban (ID).** Karena bagian tersulitnya sudah lewat. Ini implementasi kelima dari tesis
yang sama, jadi desain produknya, mekanika lelangnya, dan mode kegagalannya bukan hipotesis
lagi. Journal-nya menunjukkan kecepatannya: repo dibuat 22 Juli, seluruh settlement leg
CIP-0056 mendarat 23 Juli, hosted desk 24 Juli, participant kedua ter-deploy dan terverifikasi
26 Juli, lalu settlement Canton Coin yang sungguhan setelah itu. Yang tidak bisa saya lakukan
sendirian adalah membawa satu desk institusional ke dalam ruangan. Karena itu permintaan
pertama saya adalah perkenalan.

**If they push back:** For a venue, one person is a genuine risk — no SLA, no support rota, no
third-party audit. For a DevNet design-partner pilot, it is not the binding constraint.

---

## 20. Those numbers on the ledger — is any of that traction?
**ID —** Angka-angka di ledger itu — apakah itu traction?

**Answer (EN).** No, and I want to be exact about it. Nothing there is faked or mocked, and
none of it is customer flow. Forty-seven settled trades, five atomic baskets, twenty-five open
requests, twenty-nine sealed quotes and sixteen attestations — I generated every one. They
demonstrate that the code works, not that anyone wants it. The parties are mine and the bonds
are desk-issued. The one thing I did not generate is the Canton Coin, which comes from a
registry I do not control. No paying customer, no signed design partner.

**Jawaban (ID).** Bukan, dan saya ingin persis di titik ini. Tidak ada yang dipalsukan atau
di-mock di sana, tapi tidak ada satu pun yang berasal dari customer. Empat puluh tujuh settled
trade, lima basket atomik, dua puluh lima open request, dua puluh sembilan sealed quote, dan
enam belas attestation — semuanya saya sendiri yang membuat. Itu membuktikan kodenya jalan,
bukan membuktikan ada yang menginginkannya. Party-nya milik saya dan bond-nya diterbitkan desk
sendiri. Satu-satunya yang bukan buatan saya adalah Canton Coin-nya, yang datang dari registry
yang tidak saya kendalikan. Belum ada customer yang membayar, belum ada design partner yang
tanda tangan.

**If they push back:** What is verifiable rather than seeded: 41 Daml scripts, e2e 28/28,
actions 16/16, best-exec 8/8, shell 14/14, hosted QA 87/87 across three engines, MCP 25/25,
proxy self-test 14/14 — and `verify` green on both participants.

---

## "Kalimat penyelamat" / "Rescue lines"

Five sentences for when you do not know, when the number does not exist, or when the clock has
run out. Say one of them and stop. None of them is evasive — each one gives the judge something
true.

**1 — You do not know the answer.**
*EN:* "I do not know, and I would rather say so than guess. I will send you an exact answer
within the hour."
*ID:* "Saya tidak tahu, dan lebih baik saya bilang begitu daripada menebak. Jawaban yang persis
akan saya kirim dalam satu jam."

**2 — They ask for a number that does not exist.**
*EN:* "That number is not in my repository. I have not measured it, so anything I say now would
be invented — here is the shape of it instead."
*ID:* "Angka itu tidak ada di repo saya. Saya belum pernah mengukurnya, jadi apa pun yang saya
sebut sekarang cuma karangan — tapi saya bisa beri gambarannya."

**3 — You are half sure.**
*EN:* "The part I can verify is this; beyond that it is an assumption, and I will mark it as
one."
*ID:* "Bagian yang bisa saya verifikasi adalah ini; selebihnya asumsi, dan saya sebut itu
asumsi."

**4 — You are running out of time.**
*EN:* "I will stop there. The rest is in the repo, and I would rather answer your next question
than finish my sentence."
*ID:* "Saya berhenti di situ. Sisanya ada di repo, dan saya lebih memilih menjawab pertanyaan
Anda berikutnya daripada menghabiskan kalimat saya."

**5 — They press on customers or traction.**
*EN:* "There is no customer yet. What there is, is a working desk on DevNet and a dated plan
with the thresholds set in advance so that failure is recognisable."
*ID:* "Belum ada customer. Yang ada adalah desk yang berjalan di DevNet dan rencana bertanggal
dengan ambang yang sudah ditetapkan di depan, supaya kegagalannya bisa dikenali."
