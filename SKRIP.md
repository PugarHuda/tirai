# Skrip Tirai, Canton Builders Office Hours

**Satu file. Semua yang kamu ucapkan ada di sini**, urut dari awal sampai penutup.
Kamu tetap bicara bahasa Inggris. Baris Inggris adalah yang kamu baca, di bawahnya
artinya, lalu kenapa kalimat itu yang dipilih, supaya kalau pertanyaannya datang beda
dari yang tertulis kamu masih bisa menyusun sendiri.

Yang **kamu kerjakan** (pesan yang harus dikirim, boot, jadwal) ada di file lain,
`OFFICE-HOURS-PREP.md`. File ini murni yang kamu **baca**.

Deck ada di `deck/office-hours.html`, sebelas slide. Cadangan `deck/tirai-office-hours.pdf`.

---

## Cara maju di deck

Lima slide menyorot screenshot-nya **satu kotak setiap tekan panah kanan**. Panah kanan
baru pindah slide setelah semua kotak di slide itu muncul. Panah kiri mundur, dan
mendarat di slide sebelumnya dengan semua kotaknya sudah tampil.

| Slide | Kotaknya | Tekan untuk pindah |
|---|---|---|
| 4, momen inti | A menyegel 4.210.000, lalu node B tidak menerima apa pun | 3 |
| 6, escrow dan bug | obligasinya ditahan, lalu satu quote ditolak | 3 |
| 7, verifier | Dealer A, Dealer B, regulator | 4 |
| 8, best execution | vonisnya, lalu baris pemenang | 3 |
| 9, catatan panel | jarak dalam bps, lalu diam pun terlihat | 3 |

Slide lain cukup sekali tekan. `Home` balik ke slide 1. Angka di pojok selalu nomor
slide, bukan nomor kotak.

**Latih ini sekali sebelum naik.** Kalau kamu tidak tahu ada tahapannya, kamu akan
mengira deck-nya macet waktu menekan panah dan slide tidak berganti.

---

# Bagian 1. Sebelas slide, 4 menit

Semua screenshot di deck diambil dari desk asli yang jalan di node Canton hidup, bukan
mockup. Kalau ada yang bertanya, itu foto, bukan gambaran.

## Slide 1, sampul, 0:00

> *"Thanks Jason. In four minutes I want to show you one thing, and it is the thing that
> made me build this on Canton rather than anywhere else. A dealer's node not receiving a
> price. Everything else in Tirai follows from that."*

**Artinya.** "Makasih Jason. Dalam empat menit aku mau menunjukkan satu hal, dan itu hal
yang membuatku membangun ini di Canton dan bukan di tempat lain. Node seorang dealer yang
tidak menerima sebuah harga. Semua yang lain di Tirai mengikuti dari situ."

**Kenapa begini.** Jason baru saja membaca intro panjang, jadi mengulanginya membuang
waktu. Dan jangan buka dengan alasan. Kredensial 5N yang mati itu masalah nyata, tapi
kalau kalimat pertamamu menjelaskan kenapa demonya bukan live, hal pertama yang mereka
dengar tentang Tirai adalah sesuatu yang rusak. Jason sudah tahu duluan karena kamu sudah
mengabarinya, jadi tidak perlu diumumkan lagi.

**Kalau ada yang bertanya kenapa ini screenshot dan bukan live**, baru kamu jawab, dan
jawabnya enteng.

> *"The 5N sandbox validator rotated its client keys last week, so like Samuel I lost
> access. Every screenshot here came off the real desk on a live node, and `npm run demo`
> gives you the same desk on your own machine in about two minutes."*

**Artinya.** "Validator sandbox 5N merotasi client key-nya minggu lalu, jadi seperti
Samuel aku kehilangan akses. Semua screenshot di sini diambil dari desk asli di node
hidup, dan `npm run demo` memberimu desk yang sama di mesinmu sendiri dalam sekitar dua
menit."

Menyebutnya sebagai peristiwa yang sama dengan Umbra membuatnya jadi kabar infrastruktur,
bukan kegagalanmu. Tapi tunggu ditanya.

## Slide 2, masalahnya, 0:20

> *"An institution wants to move a block of bonds. Before it can trade, it has to ask
> several dealers what they'd pay. And the moment anyone sees you asking, they know your
> size and your direction, so the price moves against you before you trade. Which is why
> block trading in 2026 still happens on the telephone."*

**Artinya.** "Sebuah institusi mau memindahkan satu blok obligasi. Sebelum bisa trade,
dia harus bertanya ke beberapa dealer berapa mereka mau bayar. Dan begitu ada yang
melihat kamu bertanya, mereka tahu ukuranmu dan arahmu, jadi harganya bergerak melawanmu
sebelum kamu sempat trade. Itulah kenapa block trading di tahun 2026 masih terjadi lewat
telepon."

**Kenapa begini.** Kalimat terakhir bukan lelucon, itu argumen pasar. Kalau produkmu
tidak lebih baik dari telepon, tidak ada gunanya. Menyebut telepon membuat pesaingmu
jelas, dan pesaingmu bukan blockchain lain.

## Slide 3, mekanismenya, 0:45

> *"Four steps. The buyer invites a panel it chooses. Each dealer answers sealed, and
> quoting moves that dealer's bond into escrow, so a price is a commitment rather than a
> bluff. The cheapest ask wins and is paid the second cheapest price. Bond and cash then
> move in one transaction, both legs or neither."*

**Artinya.** "Empat langkah. Buyer mengundang panel yang dia pilih sendiri. Tiap dealer
menjawab tersegel, dan memberi quote memindahkan obligasi dealer itu ke escrow, jadi
harga adalah komitmen, bukan gertakan. Ask termurah menang dan dibayar harga termurah
kedua. Obligasi dan uang lalu bergerak dalam satu transaksi, dua kaki sekaligus atau
tidak sama sekali."

**Kenapa begini.** "Both legs or neither" itu bahasa orang settlement. Artinya tidak ada
jendela waktu di mana satu pihak sudah menyerahkan dan pihak lain belum. Itu justru
alasan meja institusi mau melihat chain sama sekali.

## Slide 4, momen inti, 1:10

**Tekan panah kanan sekali, kotak hijau muncul di angka 4.210.000.**

> *"Two dealers, same auction, same moment. On the left, Dealer A has sealed four million
> two hundred and ten thousand. On the right is Dealer B's own session, reading Dealer
> B's own participant node."*

**Tekan lagi, kotak oranye muncul di kolom Dealer B. Lalu diam tiga detik penuh.**

> *"Not a masked row. Not a commitment hash waiting to be revealed. Nothing. And that
> line in Dealer B's column is the product telling you why. Rival dealers' quotes are
> never sent to your node."*

**Artinya.** "Dua dealer, lelang yang sama, saat yang sama. Di kiri, Dealer A sudah
menyegel empat juta dua ratus sepuluh ribu. Di kanan, sesi milik Dealer B sendiri,
membaca node participant milik Dealer B sendiri."
"Bukan baris yang disamarkan. Bukan commitment hash yang menunggu dibuka. Tidak ada
apa-apa. Dan kalimat di kolom Dealer B itu produknya sendiri yang menjelaskan kenapa.
Quote dealer pesaing tidak pernah dikirim ke node-mu."

**Kenapa begini.** Tiga penyangkalan itu ada tujuannya. Penonton teknis akan otomatis
menebak "pasti di-hash lalu di-reveal", karena begitulah transparent chain
menyelesaikannya. Kamu harus menutup tebakan itu sebelum sempat muncul di kepala mereka.
Dan kalimat terakhir kuat karena bukan kamu yang mengklaim, produknya yang menulis itu di
layar dan mereka bisa membacanya sendiri.

**Ini satu-satunya slide yang mereka ingat besok. Jangan buru-buru.**

## Slide 5, dua barisnya, 1:50

> *"Jason said about forty lines of Daml. Honestly, the part that does this is two. The
> quote template declares `signatory dealer, buyer`, and then it stops. There's no
> observer clause at all."*
>
> *"Look at the regulator. Its party id is written on that contract as a field, and the
> regulator still cannot see it, because being named in a contract isn't the same as
> being a stakeholder in it. On a transparent chain this costs you a TEE, a ZK circuit,
> or an FHE scheme. Here there's no third party to hide from, so there's nothing to
> encrypt. I've built this product four times on transparent chains, and every time the
> cryptography was most of the work."*

**Artinya.** "Jason bilang sekitar empat puluh baris Daml. Jujurnya, bagian yang
melakukan ini cuma dua. Template quote mendeklarasikan `signatory dealer, buyer`, lalu
berhenti. Tidak ada klausa observer sama sekali."
"Lihat regulatornya. Party id-nya tertulis di kontrak itu sebagai sebuah field, dan
regulator tetap tidak bisa melihatnya, karena disebut namanya di dalam kontrak tidak sama
dengan menjadi stakeholder-nya. Di chain transparan ini membuatmu bayar TEE, sirkuit ZK,
atau skema FHE. Di sini tidak ada pihak ketiga untuk disembunyikan, jadi tidak ada yang
perlu dienkripsi. Aku sudah membangun produk ini empat kali di chain transparan, dan tiap
kali kriptografinya yang menghabiskan sebagian besar pekerjaan."

**Kenapa begini.** Ini momen terbaikmu di seluruh sesi. Kamu mengoreksi host ke arah yang
membuat proyekmu terdengar lebih kuat, bukan lebih lemah. Beri jeda sesudah "the part
that does this is two", biarkan angkanya mendarat.

## Slide 6, escrow dan bugnya, 2:35

**Kotak 1 di tombol escrow, kotak 2 di paragraf penolakan.**

> *"Quoting locks the dealer's bond in escrow, so the buyer never awards into a bluff.
> And on the right, this is the worst bug I've shipped. With one quote there's no second
> price, and awarding used to fall back to the winner's own ask. First price wearing a
> Vickrey label, chosen after the buyer had seen every sealed number. The ledger refuses
> it outright now, and the regression test is named after the bug."*

**Artinya.** "Memberi quote mengunci obligasi dealer di escrow, jadi buyer tidak pernah
meng-award ke gertakan. Dan di kanan, ini bug terburuk yang pernah kukirim. Dengan satu
quote tidak ada harga kedua, dan meng-award dulu jatuh balik ke ask si pemenang sendiri.
First price yang memakai label Vickrey, dipilih sesudah buyer melihat semua angka
tersegel. Ledger menolaknya mentah sekarang, dan regression test-nya dinamai persis
seperti bugnya."

**Kenapa begini.** Orang yang pernah membangun sistem uang akan langsung mengenali kelas
bug itu, dan Ales termasuk. Mengakuinya duluan menjual keinsinyuranmu jauh lebih keras
daripada klaim apa pun. Ini juga jawaban Q3 moderator, jadi kalau sudah kamu tanam di
sini, jawabanmu nanti tinggal melanjutkan.

## Slide 7, verifier, 3:00

**Tiga kotak, satu per baris node.**

> *"You shouldn't trust a demo about privacy. This view opens one read per party,
> addressed to that party's node, and counts what came back. Each dealer's node holds its
> own quote and none of the rival's. The regulator holds nothing at all before the trade
> executes. Four reads, four parties, four different answers, visible in your own
> devtools. The claim is checkable from your side of the screen, not mine."*

**Artinya.** "Kamu memang tidak seharusnya percaya pada demo soal privasi. View ini
membuka satu pembacaan per party, dialamatkan ke node party itu, lalu menghitung apa yang
kembali. Node tiap dealer memegang quote-nya sendiri dan tidak satu pun milik lawannya.
Regulator tidak memegang apa-apa sebelum trade-nya eksekusi. Empat pembacaan, empat
party, empat jawaban berbeda, bisa dilihat di devtools-mu sendiri. Klaimnya bisa dicek
dari sisi layarmu, bukan sisiku."

**Kenapa begini.** "From your side of the screen" memindahkan beban pembuktian ke
penonton. Itu inti seluruh posisimu, dan itu juga jawaban Q4 moderator.

## Slide 8, best execution, 3:20

**Kotak 1 di vonisnya, kotak 2 di baris pemenang.**

> *"A public exchange proves best execution against a visible order book. There's no book
> here, and it still proves it, from the sealed asks either side chose to reveal to the
> regulator. The winner quoted the lowest ask and the buyer paid no worse than anyone.
> Confidential before the trade, auditable after it, and everyone says you have to pick
> one."*

**Artinya.** "Bursa publik membuktikan best execution dengan membandingkan ke order book
yang terlihat. Di sini tidak ada order book, dan tetap terbukti, dari ask tersegel yang
salah satu pihak pilih untuk dibuka ke regulator. Pemenangnya menawar paling rendah dan
buyer tidak membayar lebih buruk dari siapa pun. Rahasia sebelum trade, bisa diaudit
sesudahnya, padahal semua orang bilang kamu harus memilih salah satu."

**Kenapa begini.** *Best execution* itu kewajiban regulatoris membuktikan nasabah dapat
harga terbaik yang wajar. Ini bahasa compliance, bukan bahasa crypto, dan justru itu yang
menempel di telinga orang institusi.

## Slide 9, jawaban soal front-running, 3:35

**Kotak 1 di tabelnya, kotak 2 di catatannya.**

> *"A judge asked me this at the grand final. An invited dealer does see the enquiry, and
> no ledger stops that. What changed is that every award now writes a record the buyer
> keeps. Who was invited, who answered, and how far each ask was from the winner's, in
> basis points, never the ask itself. A losing price stays unrevealed even in the buyer's
> own record. And a dealer who takes the look and never prices is on the ledger,
> timestamped, attributable."*

**Artinya.** "Seorang juri menanyakan ini di grand final. Dealer yang diundang memang
melihat enquiry-nya, dan tidak ada ledger yang bisa mencegah itu. Yang berubah, tiap
award sekarang menulis satu catatan yang dipegang buyer. Siapa diundang, siapa menjawab,
dan seberapa jauh tiap ask dari ask pemenang, dalam basis point, bukan ask-nya. Harga
yang kalah tetap tak terungkap bahkan di catatan buyer sendiri. Dan dealer yang mengambil
kesempatan melihat lalu tidak pernah memberi harga tercatat di ledger, bertanda waktu,
bisa diatribusikan."

**Kenapa begini.** Mengulang pertanyaan juri menunjukkan kamu tidak berhenti sesudah
menang. Itu persis yang Ales bilang ingin dia lihat dari builder pasca-hackathon.

## Slide 10 dan 11, status lalu serahkan balik, 3:50

> *"Fifty settled trades on Devnet, cash legs in real Canton Coin and BitSafe's CBTC
> through registries I don't control, shipped as a package upgrade rather than a
> redeploy. What I won't claim. No design partner, no revenue, and the fee doesn't work
> on a registry rail. Jason, over to you."*

**Artinya.** "Lima puluh trade settled di Devnet, kaki uangnya pakai Canton Coin asli dan
CBTC-nya BitSafe lewat registry yang bukan aku yang kendalikan, dirilis sebagai upgrade
paket bukan deploy ulang. Yang tidak akan kuklaim. Belum ada design partner, belum ada
pendapatan, dan fee-nya tidak jalan di rail registry. Jason, kembali ke kamu."

**Kenapa begini.** Menyebut yang belum ada, dengan suara sendiri, sebelum ada yang
bertanya, adalah cara termurah membuat semua klaim lain terdengar bisa dipercaya.

**JANGAN sampaikan permintaan design partner di sini.** Kamu punya slot 30 detik sendiri
di menit 58.

---

# Bagian 2. Empat pertanyaan moderator

Mereka sudah mempublikasikan pertanyaannya, jadi jangan improvisasi. Format sama seperti
slide, baris Inggris yang kamu ucapkan, lalu artinya, lalu kenapa.

## Q1. Kenapa model signatory dan observer menangani ini secara native

**Yang ditanya.**

> The forty lines of Daml point is striking. On a transparent chain, you'd need TEEs, ZK
> circuits, or FHE to get dealer blindness. Walk us through why Canton's signatory and
> observer model handles this natively.

**Artinya.** Poin empat puluh baris Daml itu mencolok. Di chain transparan kamu butuh TEE, sirkuit ZK, atau FHE untuk membuat dealer buta. Jelaskan kenapa model signatory dan observer milik Canton menangani ini secara bawaan.

**Jawabmu.**

> *"Because on a transparent chain, privacy is something you add on top of a ledger that
> has already broadcast everything. You encrypt, or you prove in zero knowledge, or you
> compute inside hardware you have to trust. All three are machinery for hiding data from
> people who already received it."*
>
> *"Canton never sends it. A contract goes to its stakeholders and to nobody else, and
> stakeholders are declared in the template. My quote template declares dealer and buyer
> and stops. There is no third party to hide from, so there is nothing to encrypt."*
>
> *"The honest version of the forty lines line is that the privacy isn't forty lines of
> work. It's the absence of a line. What the forty lines actually buy is the mechanism.
> The escrow, the second price, the disclosure path."*

**Artinya.** "Karena di chain transparan, privasi itu sesuatu yang kamu tambahkan di atas
ledger yang sudah terlanjur menyiarkan segalanya. Kamu enkripsi, atau kamu buktikan dalam
zero knowledge, atau kamu hitung di dalam hardware yang harus kamu percaya. Ketiganya
mesin untuk menyembunyikan data dari orang yang sudah menerimanya."
"Canton tidak pernah mengirimnya. Kontrak pergi ke stakeholder-nya dan tidak ke siapa
pun lain, dan stakeholder dideklarasikan di template. Template quote-ku mendeklarasikan
dealer dan buyer lalu berhenti. Tidak ada pihak ketiga untuk disembunyikan, jadi tidak
ada yang perlu dienkripsi."
"Versi jujur dari kalimat empat puluh baris itu, privasinya bukan empat puluh baris
kerja. Privasinya justru ketiadaan satu baris. Yang dibeli empat puluh baris itu adalah
mekanismenya. Escrow, harga kedua, jalur disclosure."

**Kenapa begini.** Kalimat kuncinya "there is no third party to hide from, so there is
nothing to encrypt". Kalau kamu cuma ingat satu kalimat dari seluruh sesi, ingat itu.
Dan paragraf ketiga penting karena kamu mengoreksi host tanpa membuatnya salah.

## Q2. Kenapa mengunci jaminan dealer di escrow saat quote

**Yang ditanya.**

> You lock dealer collateral into escrow when they submit a quote. What problem were you
> solving with that mechanism, why is a commitment necessary rather than just a price
> indication?

**Artinya.** Kamu mengunci jaminan dealer ke escrow waktu mereka mengirim quote. Masalah apa yang kamu selesaikan dengan mekanisme itu, kenapa harus komitmen dan bukan sekadar indikasi harga?

**Jawabmu.**

> *"Because an indication is free, and anything free gets abused in a sealed auction. If
> quoting costs nothing, the winning move is to quote aggressively everywhere and decide
> later whether to honour it, which is exactly the behaviour that makes desks distrust
> electronic RFQ and go back to the phone."*
>
> *"Submitting a quote here moves the dealer's bond into escrow. The price is backed by
> the asset before the buyer ever sees it. So the buyer is never awarding into a bluff,
> and the dealer is never left holding a counterparty who changed their mind. It also
> makes quote spam self limiting, because your inventory is finite, so the number of live
> quotes you can carry is finite."*

**Artinya.** "Karena indikasi itu gratis, dan apa pun yang gratis akan disalahgunakan di
lelang tersegel. Kalau memberi quote tidak ada ongkosnya, langkah menangnya adalah
menawar agresif di mana-mana lalu memutuskan belakangan apakah mau ditepati, dan justru
perilaku itu yang bikin meja institusi tidak percaya RFQ elektronik lalu balik ke
telepon."
"Mengirim quote di sini memindahkan obligasi si dealer ke escrow. Harganya dijamin aset
sebelum buyer melihatnya. Jadi buyer tidak pernah meng-award ke gertakan, dan dealer
tidak pernah ditinggal memegang lawan yang berubah pikiran. Itu juga bikin spam quote
membatasi diri sendiri, karena inventarismu terbatas, jadi jumlah quote hidup yang bisa
kamu pegang juga terbatas."

**Kenapa begini.** Kalimat "go back to the phone" mengikat jawaban ini ke slide 2. Kamu
menjawab pertanyaan mekanisme dengan bahasa pasar, bukan bahasa kode.

## Q3. Kenapa harga kedua, bukan ask pemenang sendiri

**Yang ditanya.**

> You chose a second price auction structure. Why does that change the strategic behaviour
> of dealers compared to settling at the winning dealer's original price?

**Artinya.** Kamu memilih struktur lelang harga kedua. Kenapa itu mengubah perilaku strategis dealer dibanding settle di ask asli si pemenang?

**Jawabmu.**

> *"Because at first price, your best strategy is never to quote your real level. You
> shade it, and how much you shade depends on guessing the other dealers. That guessing
> is where the information games live."*
>
> *"At second price the winner is paid the runner up's number, so shading costs you deals
> without ever improving your margin. Quoting your true level becomes the profitable
> strategy rather than the naive one. And it composes with the sealing. Rivals are blind,
> so you cannot infer the field, and second price means you don't need to."*
>
> *"I'll add the thing I got wrong, because it's the sharpest edge here. Awarding a one
> quote auction used to fall back to the winner's own ask. First price wearing a Vickrey
> label, chosen after the buyer had seen every sealed number. That's rejected outright
> now, with a regression test named after it. A buyer who wants to take a single ask uses
> the direct path, where it is called what it is."*

**Artinya.** "Karena di first price, strategi terbaikmu adalah tidak pernah menawar di
level sebenarnya. Kamu menaikkan sedikit, dan seberapa banyak tergantung menebak dealer
lain. Tebak-tebakan itulah tempat permainan informasi hidup."
"Di second price pemenang dibayar angka runner-up, jadi menaikkan harga cuma bikin kamu
kehilangan deal tanpa pernah menambah margin. Menawar di level sebenarnya jadi strategi
yang menguntungkan, bukan sekadar yang naif. Dan itu menyatu dengan penyegelannya. Lawan
buta, jadi kamu tidak bisa menyimpulkan lapangan, dan second price berarti kamu memang
tidak perlu."
"Aku tambahkan yang kusalah, karena ini sisi paling tajamnya. Meng-award lelang berisi
satu quote dulu jatuh balik ke ask si pemenang sendiri. First price yang memakai label
Vickrey, dipilih sesudah buyer melihat semua angka tersegel. Sekarang itu ditolak mentah,
dengan regression test yang dinamai persis seperti bugnya. Buyer yang mau mengambil satu
ask pakai jalur direct, di mana namanya memang itu."

**Kenapa begini.** Paragraf ketiga adalah yang paling menjualmu. Mengakui bug terburuk
yang kamu temukan sendiri, di panggung publik, lebih meyakinkan daripada klaim apa pun.
Dan kamu sudah menanamnya di slide 6, jadi ini terdengar konsisten, bukan defensif.

## Q4. Bagaimana verifier dipakai meyakinkan institusi yang skeptis

**Yang ditanya.**

> The privacy verifier is a remarkable feature, it counts what each party's node actually
> holds while the audience watches. How do you use that as a demonstration tool for
> institutional counterparties who are skeptical about whether the privacy claim is real?

**Artinya.** Privacy verifier itu fitur yang mengesankan, dia menghitung apa yang sebenarnya dipegang node tiap party sementara penonton melihat. Bagaimana kamu memakainya sebagai alat demonstrasi ke lawan institusional yang skeptis apakah klaim privasinya nyata?

**Jawabmu.**

> *"I don't ask them to believe it, and I don't demo it to them. I get them to run it.
> The verifier issues one read per party, addressed to that party's node, and counts what
> comes back by template. A skeptic can watch the four requests in their own devtools and
> see four different parties getting four different answers."*
>
> *"But the real answer is that a hosted page is the weakest possible evidence, because I
> control the server. So the artifact is the repo. `npm run demo` boots a Canton sandbox,
> seeds it, and serves the desk in about two minutes on their machine, and
> `scripts/devnet.mjs verify` asserts the same properties against the live network."*
>
> *"The pitch to a skeptical desk is not look at my screen. It's you have a validator, so
> allocate one party, vet one DAR, and check it yourself."*

**Artinya.** "Aku tidak meminta mereka percaya, dan aku tidak mendemokannya ke mereka.
Aku menyuruh mereka yang menjalankan. Verifier mengeluarkan satu pembacaan per party,
dialamatkan ke node party itu, lalu menghitung apa yang kembali per template. Orang yang
skeptis bisa melihat empat request itu di devtools mereka sendiri dan melihat empat party
berbeda mendapat empat jawaban berbeda."
"Tapi jawaban sesungguhnya, halaman yang aku hosting adalah bukti paling lemah, karena
servernya aku yang pegang. Jadi artefaknya adalah repo. `npm run demo` mem-boot sandbox
Canton, mengisinya, dan menyajikan desk-nya dalam sekitar dua menit di mesin mereka, dan
`scripts/devnet.mjs verify` menegakkan properti yang sama di jaringan hidup."
"Rayuan ke meja yang skeptis bukan lihat layarku. Tapi kamu punya validator, jadi
alokasikan satu party, vetting satu DAR, dan cek sendiri."

**Kenapa begini.** Ini berakhir di `npm run demo`, yang juga CTA-mu. Jadi jawaban teknis
dan ajakan jadi satu kalimat, dan tidak terdengar seperti jualan.

## Q&A cadangan. Bagaimana membuktikan isi node tanpa membuka isinya

Jason menyiapkan ini kalau chat sepi.

**Yang ditanya.**

> How does the privacy verifier work technically, how do you prove what a node holds
> without revealing the contents?

**Artinya.** "Secara teknis privacy verifier itu bekerja bagaimana, bagaimana kamu
membuktikan apa yang dipegang sebuah node tanpa membuka isinya?"

**Jawabmu.**

> *"To be precise, I don't prove the contents. I prove absence, which is the claim that
> matters. Each read is an active contract query submitted as one party, and what comes
> back is that party's own view. The rival's view is empty, and it is empty at the source,
> not filtered on the way out."*
>
> *"The limitation I'd want stated is that those reads go through my node's API, so this
> is convincing to someone reading the network tab and not to a formal verifier. If you
> want it stronger, you run the participant. That's the whole design. The proof lives on
> the counterparty's infrastructure, not mine."*

**Artinya.** "Tepatnya, aku tidak membuktikan isinya. Aku membuktikan ketiadaan, dan itu
justru klaim yang penting. Tiap pembacaan adalah query active contract yang dikirim
sebagai satu party, dan yang kembali adalah pandangan party itu sendiri. Pandangan
lawannya kosong, dan kosong di sumbernya, bukan disaring di jalan keluar."
"Batasan yang mau kusebut sendiri, pembacaan itu lewat API node-ku, jadi ini meyakinkan
buat orang yang membaca network tab dan bukan buat verifier formal. Kalau mau lebih kuat,
kamu yang menjalankan participant-nya. Itu justru seluruh desainnya. Buktinya hidup di
infrastruktur lawan, bukan di infrastrukturku."

**Kenapa begini.** Menyebut batas dari mulutmu sendiri lebih kuat daripada dibongkar
orang lain. Dan kalimat penutupnya membalik kelemahan jadi desain.

---

# Bagian 3. Group discussion, enam pertanyaan

Sekitar 2 menit per pertanyaan, empat pembicara. **Jangan ambil semua.** Tiga jawaban
bagus mengalahkan enam yang tipis. Yang paling kuat buatmu Q5 dan Q6.

## Q1. Di mana privasi mengubah ekonomi produkmu

**Yang ditanya.**

> All three projects use privacy as part of the actual market mechanism rather than simply
> as a compliance feature. Where does privacy materially change the economics or usability
> of what you're building?

**Artinya.** Ketiga proyek memakai privasi sebagai bagian dari mekanisme pasarnya, bukan sekadar fitur compliance. Di mana privasi benar-benar mengubah ekonomi atau kebergunaan yang kamu bangun?

**Jawabmu.**

> *"It isn't a compliance wrapper on the product, it is the product. Remove the blindness
> and the second price auction stops working, because everyone can see the field. The
> privacy and the pricing mechanism are one thing."*

**Artinya.** "Ini bukan pembungkus compliance di atas produk, ini produknya. Hilangkan
kebutaannya dan lelang harga kedua berhenti bekerja, karena semua orang bisa melihat
lapangan. Privasi dan mekanisme harganya itu satu hal."

## Q2. Apa yang rusak duluan kalau semua transaksi terlihat global

**Yang ditanya.**

> If you had to rebuild your application on a blockchain where every transaction and
> contract was globally visible, what part of your architecture would become the hardest to
> reproduce?

**Artinya.** Kalau kamu harus membangun ulang aplikasimu di blockchain yang tiap transaksi dan kontraknya terlihat global, bagian arsitektur mana yang paling sulit ditiru?

**Jawabmu.**

> *"The mechanism, immediately. I'd have to rebuild sealed quoting as commit reveal, and
> commit reveal leaks timing and lets a dealer simply not reveal. Every version of that
> fix is worse than the thing it replaces. I've built this product four times on
> transparent chains, and the cryptography was always most of the work."*

**Artinya.** "Mekanismenya, langsung. Aku harus membangun ulang sealed quote jadi commit
reveal, dan commit reveal membocorkan waktu serta membiarkan dealer sekadar tidak membuka.
Tiap versi perbaikan itu lebih buruk dari yang digantinya. Aku sudah membangun produk ini
empat kali di chain transparan, dan kriptografinya selalu jadi sebagian besar kerjanya."

## Q3. Apa yang kamu pelajari soal menyusun dengan infrastruktur orang lain

**Yang ditanya.**

> Your applications increasingly need to work with assets, registries, wallets, and
> infrastructure you don't control. What have you learned about building something that can
> compose with the rest of the Canton ecosystem?

**Artinya.** Aplikasimu makin harus bekerja dengan aset, registry, wallet, dan infrastruktur yang bukan kamu yang kendalikan. Apa yang kamu pelajari soal membangun sesuatu yang bisa menyatu dengan sisa ekosistem Canton?

**Jawabmu.**

> *"Three scars. Registry choice contexts are round scoped, so a retry has to refetch and
> never replay. A replay comes back as UNKNOWN_CONTRACT_SYNCHRONIZERS and reads exactly
> like your own bug. A transfer to a receiver with no pre approval is two phases, not one.
> And my venue fee cannot be taken on a registry rail at all, because those settle by
> issuer allocation rather than by splitting a holding I hold. I'd rather say that out
> loud than have someone find it."*

**Artinya.** "Tiga luka. Choice context registry itu round scoped, jadi retry harus
fetch ulang dan tidak boleh replay. Replay muncul sebagai UNKNOWN_CONTRACT_SYNCHRONIZERS
dan terbaca persis seperti bug sendiri. Transfer ke penerima tanpa pre approval itu dua
fase, bukan satu. Dan venue fee-ku sama sekali tidak bisa dipungut di rail registry,
karena rail itu settle lewat alokasi issuer, bukan dengan memecah holding yang kupegang.
Aku lebih suka menyebutnya sendiri daripada ada yang menemukannya."

## Q4. Apa yang masih harus terjadi sebelum institusi memakainya di produksi

**Yang ditanya.**

> HackCanton demonstrated that these systems can work technically. What still needs to
> happen before an institution would be comfortable using one of these workflows in
> production?

**Artinya.** HackCanton membuktikan sistem ini bisa jalan secara teknis. Apa yang masih harus terjadi sebelum sebuah institusi nyaman memakai alur kerja ini di produksi?

**Jawabmu.**

> *"A design partner, honestly. The code is further along than the evidence. After that,
> a custody story that isn't my key, and the fee working on registry rails."*

**Artinya.** "Design partner, jujurnya. Kodenya lebih maju daripada buktinya. Sesudah
itu, cerita kustodi yang bukan kunciku sendiri, dan fee yang jalan di rail registry."

## Q5. Asumsi apa yang tidak selamat kena ledger sungguhan

**Yang ditanya.**

> What was one assumption or architectural decision you had to rethink while building your
> HackCanton project, something that didn't survive contact with the actual Canton ledger?

**Artinya.** Apa satu asumsi atau keputusan arsitektur yang harus kamu pikir ulang waktu membangun proyek HackCanton-mu, sesuatu yang tidak selamat kena ledger Canton yang sebenarnya?

**Jawabmu.**

> *"Two. I assumed I could reconstruct dealer behaviour from ledger history. The updates
> endpoint gave me a live pipe and zero historical events across six request shapes, so I
> stopped needing history and made the award write the record instead. And I assumed an
> active contract wildcard read would just work. The node caps it at two hundred elements,
> my buyer went past it, and a whole column of the hosted desk went dark. Neither is in
> any tutorial."*

**Artinya.** "Dua. Aku mengira bisa merekonstruksi perilaku dealer dari riwayat ledger.
Endpoint updates memberiku pipa hidup dan nol event historis di enam bentuk request, jadi
aku berhenti butuh riwayat dan membuat award yang menulis catatannya. Dan aku mengira
pembacaan wildcard active contract akan jalan begitu saja. Node membatasinya di dua ratus
elemen, buyer-ku lewat batas, dan satu kolom penuh di desk hosted padam. Dua-duanya tidak
ada di tutorial mana pun."

**Kenapa begini.** Kalimat penutup "neither is in any tutorial" itu yang membuat jawaban
ini berguna buat orang lain di ruangan, bukan sekadar cerita.

## Q6. Apa yang masih hilang dari ekosistem

**Yang ditanya.**

> Having now built deeply on Canton, what is something you think is still missing from the
> ecosystem that another builder could go and create?

**Artinya.** Setelah membangun cukup dalam di Canton, apa yang menurutmu masih hilang dari ekosistemnya dan bisa dibuat builder lain?

**Jawabmu.**

> *"Read side developer experience. Historical event replay that actually returns events,
> an active contract read that pages instead of refusing at two hundred, and a shared
> client library for the Token Standard allocation flow. I hand rolled the two phase
> transfer and the choice context refetch, and so has everyone else on this call. That's
> a library somebody should just write."*

**Artinya.** "Developer experience di sisi baca. Replay event historis yang benar-benar
mengembalikan event, pembacaan active contract yang mem-paging alih-alih menolak di dua
ratus, dan satu library klien bersama untuk alur allocation Token Standard. Aku menulis
sendiri transfer dua fase dan refetch choice context, dan semua orang di call ini juga.
Itu library yang seharusnya tinggal ditulis seseorang."

**Kenapa begini.** Ini jawaban yang Ales bilang secara eksplisit ingin dia dengar dari
builder pasca-hackathon. Jangan lewatkan Q6.

---

# Bagian 4. Slot 30 detik, menit 58

**Yang ditanya.**

> Before we close, I want to give each of you 30 seconds to make one very specific ask to
> this community. If someone watching today could make one introduction for you, who would
> you want to meet?

**Artinya.** "Sebelum kita tutup, aku mau memberi kalian masing-masing 30 detik untuk
menyampaikan satu permintaan yang sangat spesifik ke komunitas ini. Kalau ada yang menonton
hari ini bisa membuat satu perkenalan buatmu, siapa yang mau kamu temui?"

**Jawabmu.** Tempel di kertas. Ini satu-satunya bagian yang boleh kamu baca kata per kata.

> *"One introduction. A desk, a dealer, or a fund administrator that runs block enquiries
> over chat today, and will put ten of them through this and tell me where it breaks. Not
> a contract, ten enquiries. I've written down in advance the point where I stop. If they
> go quiet for two weeks, or if the privacy verifier ever shows a quote visible to a
> rival, the pilot ends there."*
>
> *"And second, if you're building on the Canton Token Standard, I'm a second
> implementation you can test your registry against. Being that has already found two
> developer experience problems in other people's registries. hudapugar@gmail.com."*

**Artinya.** "Satu perkenalan. Sebuah meja, dealer, atau fund administrator yang hari ini
menjalankan enquiry blok lewat chat, dan mau memasukkan sepuluh di antaranya ke sini lalu
memberitahuku di mana ini patah. Bukan kontrak, sepuluh enquiry. Aku sudah menuliskan di
muka titik di mana aku berhenti. Kalau mereka diam dua minggu, atau kalau privacy
verifier sampai pernah menunjukkan satu quote terlihat oleh pesaing, pilot-nya selesai di
situ."
"Dan kedua, kalau kamu sedang membangun di atas Canton Token Standard, aku implementasi
kedua yang bisa kamu pakai menguji registry-mu. Menjadi itu sudah menemukan dua masalah
developer experience di registry orang lain."

**Kenapa begini.** Menyebut kill criteria membuatmu terdengar seperti orang yang
mengelola risiko, bukan orang yang sedang jualan. Ty sudah bereaksi positif ke ini di DM,
dan logikanya sama di ruangan penuh orang.

---

# Bagian 5. Kalau ditanya soal Umbra

Samuel tampil tepat sebelum kamu dengan produk yang beririsan, dan dia Silver. Kalau ada
yang menyinggung, akui terang-terangan.

> *"Samuel and I attacked the same leak from different ends. Umbra makes the venue blind.
> Tirai makes the price provable, with the second price mechanism, the best execution
> attestation, and a panel record that scores how dealers behaved. His question is who can
> see the quote. Mine is whether the number was fair, and whether you can show a regulator
> that it was without ever revealing a losing price."*
>
> *"And the ecosystem needs more than one implementation of confidential RFQ. We've each
> been a free integration test for the other's registry assumptions."*

**Artinya.** "Samuel dan aku menyerang kebocoran yang sama dari ujung berbeda. Umbra
membuat venue-nya buta. Tirai membuat harganya terbukti, dengan mekanisme harga kedua,
atestasi best execution, dan catatan panel yang menilai perilaku dealer. Pertanyaannya
siapa yang bisa melihat quote. Pertanyaanku apakah angkanya adil, dan apakah kamu bisa
menunjukkannya ke regulator tanpa pernah membuka harga yang kalah."
"Dan ekosistem ini butuh lebih dari satu implementasi RFQ rahasia. Kami masing-masing
sudah jadi integration test gratis buat asumsi registry yang lain."

**Kenapa begini.** Klaim wilayah membuatmu kecil. Mengakui irisan lalu menunjuk garis
pembeda yang nyata membuat kalian berdua terlihat lebih besar.

---

# Bagian 6. Kata yang gampang keseleo

| Kata | Cara aman | Artinya |
|---|---|---|
| *signatory* | SIG-nə-tor-i | pihak yang menandatangani kontrak, penentu siapa menerima kontraknya |
| *observer* | əb-ZER-vər | pihak yang boleh melihat tapi tidak menandatangani |
| *Vickrey* | VIK-ree | lelang tersegel harga kedua |
| *escrow* | ES-kro | titipan terkunci |
| *attestation* | a-tes-TAY-shən | pernyataan terverifikasi, di sini bukti best execution |
| *basis points* | "bips" | 1 bps sama dengan 0,01 persen |
| *delivery versus payment* | dee-vee-pee | barang dan uang berpindah bersamaan |
| *participant node* | par-TI-si-pant | node peserta, kalimat andalanmu, jangan tertukar dengan validator |

**Kalau blank di tengah kalimat.** Berhenti, tunjuk layar, bilang *"look at Dealer B's
column."* Layarnya yang bicara. Diam sambil menunjuk jauh lebih baik daripada mengisi
dengan kata yang tidak kamu maksud, dan di demo ini diam justru isi ceritanya.

**Kalau ada yang bertanya dan kamu tidak paham pertanyaannya.** *"Can you say that again,
do you mean X or Y?"* Meminta pengulangan itu normal di call teknis, dan jauh lebih aman
daripada menjawab pertanyaan yang salah selama dua menit.
