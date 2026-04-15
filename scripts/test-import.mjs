/**
 * E2E import test: generates a JWT with our private key, then calls the
 * same Convex mutations the UI uses to import all contacts from the email list.
 * Run: node scripts/test-import.mjs
 */
import { readFileSync } from "fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

// ── Load env ──────────────────────────────────────────────────────────────────
const envContent = readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const CONVEX_URL = env["NEXT_PUBLIC_CONVEX_URL"];
const TARGET_EMAIL = env["TARGET_EMAIL"];
const ADMIN_SECRET = env["ADMIN_IMPORT_SECRET"];

if (!CONVEX_URL) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is missing in .env.local");
}

if (!TARGET_EMAIL) {
  throw new Error("TARGET_EMAIL is missing in .env.local");
}

if (!ADMIN_SECRET) {
  throw new Error("ADMIN_IMPORT_SECRET is missing in .env.local");
}

console.log(`\nImporting as: ${TARGET_EMAIL}`);
console.log(`Convex backend: ${CONVEX_URL}\n`);

// ── Convex client (no user JWT — uses admin secret instead) ──────────────────
const convex = new ConvexHttpClient(CONVEX_URL);

const adminArgs = { adminSecret: ADMIN_SECRET, userEmail: TARGET_EMAIL };

// ── Parse emails (mirrors src/lib/parse-emails.ts) ───────────────────────────
const FREE = new Set([
  "gmail","yahoo","hotmail","outlook","aol","icloud","mail","protonmail",
  "zoho","yandex","gmx","web","t-online","freenet","live","msn","comcast",
  "verizon","att","sbcglobal","me","bellsouth","swbell",
]);
const TLD_COUNTRY = {
  uk:"United Kingdom",gb:"United Kingdom",de:"Germany",fr:"France",
  it:"Italy",es:"Spain",nl:"Netherlands",be:"Belgium",ch:"Switzerland",
  at:"Austria",se:"Sweden",no:"Norway",dk:"Denmark",fi:"Finland",
  pt:"Portugal",ie:"Ireland",pl:"Poland",cz:"Czech Republic",
  jp:"Japan",kr:"South Korea",cn:"China",tw:"Taiwan",hk:"Hong Kong",
  sg:"Singapore",in:"India",au:"Australia",nz:"New Zealand",br:"Brazil",
  mx:"Mexico",ar:"Argentina",cl:"Chile",co:"Colombia",pe:"Peru",
  za:"South Africa",il:"Israel",ae:"UAE",sa:"Saudi Arabia",qa:"Qatar",
  tr:"Turkey",th:"Thailand",ru:"Russia",ca:"Canada",
};
const SPECIAL = {
  "co.uk":"United Kingdom","co.jp":"Japan","co.kr":"South Korea","co.in":"India",
  "co.za":"South Africa","co.nz":"New Zealand","co.il":"Israel","com.au":"Australia",
  "com.br":"Brazil","com.mx":"Mexico","com.ar":"Argentina","com.sg":"Singapore",
  "com.hk":"Hong Kong","com.my":"Malaysia","com.tr":"Turkey","com.pe":"Peru",
  "com.co":"Colombia","com.ph":"Philippines","org.uk":"United Kingdom",
  "ac.uk":"United Kingdom","ac.nz":"New Zealand","ac.za":"South Africa",
};

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
function deriveName(local) {
  const parts = local.split(/[._\-]/).filter(Boolean);
  if (parts.length >= 2) return { firstName: capitalize(parts[0]), lastName: parts.slice(1).map(capitalize).join(" ") };
  const camel = local.match(/[A-Z]?[a-z]+/g);
  if (camel?.length >= 2) return { firstName: capitalize(camel[0]), lastName: camel.slice(1).map(capitalize).join(" ") };
  return { firstName: capitalize(local), lastName: "" };
}
function deriveCompany(domain) {
  const parts = domain.split(".");
  const main = parts[0] === "www" ? parts[1] : parts[0];
  if (!main || FREE.has(main.toLowerCase())) return "";
  return main.split("-").map(capitalize).join("-");
}
function deriveCountry(domain) {
  const tld = domain.split(".").pop()?.toLowerCase() ?? "";
  const sec = domain.split(".").slice(-2).join(".");
  if (SPECIAL[sec]) return SPECIAL[sec];
  return TLD_COUNTRY[tld] ?? "";
}

const EMAIL_LIST = `dashne.jalal@auis.edu.krd,
albaqqal@emirates.ae,
zhangz@bnbm.com.cn,
karwan@vanogroup.com,
blend.kurdo@tiller.com,
dawar@plustheedge.com,
suleymanciliv@77construction.com,
clauspeter.strauss@taurus-rheinlan.de,
ghid@mselect.com,
siham.mamand@gov.krd,
rbalool@deloitte.com,
mohamed.ahmed@fao.org,
musomer@deloitte.com,
sales@gegreklam.com,
syu023x@ceec.net.cn,
info@kurdistanchronicle.com,
sales@boss-furniture.com,
chris@thegreenzonedc.com,
info@krdc.org,
sami.salaheldin@agcocorp.com,
tarek.el-azab@corteva.com,
michael.christensen@agcocorp.com,
raof.sindi@kurd-solar.com,
hanar.marouf@fcdo.gov.uk,
greenacresglobal123@gmsil.com,
lezan.khaled@gmail.com,
basima@keskco.com,
gd@albarhamgroup.com,
turfmountain@bellsouth.net,
erbil@bayad.co,
mohammed.younus@giz.de,
khalid.waleed@presidency.krd,
adam.rogoda@sgh.waw.pl,
greenacresglobal123@gmail.com,
ahmad.okba@roland.de,
ahmed@whitespace.krd,
shwan@fiveonelabs.org,
hawrre@grofin.com,
pary@winsomepro.com,
samerflaifel_hybird@yahoo.vom,
ahmed.aldazdi@jobs.studio,
lutz.scharf@giz.de,
adeline.defer@giz.de,
vijay@americanspecialfoods.com,
sebastian.krull@giz.de,
sherwan804@gmail.com,
nadaelhusseiny@ffinetwork.org,
shahez@wnordic.com,
ceo@aceplan.co,
hojjat@ksjmotor.com,
khalil@ubholding.com,
rwadsworth@sonangoliraq.com,
myles.caggins3@gmail.com,
nicolasmalaplate@faun.com,
jens.rose@rose-gleisbau.de,
sardarmultitex@gmail.com,
halit.acar@acarsan.com.tr,
hqagir@crescent.ae,
bakhtiar.rasheed@erbilbank.com.iq,
mahmood.agha@electromall.net,
info@enlightors.com,
saad@whitespace.krd,
rzgar.faeq@wannet.co,
kawan@knets.co,
hardi@mselect.iq,
zalalebrand@gmail.com,
asso.beg@kge-businessaliances.com,
Aalul@schuco.com,
yama.torabi@undp.org,
rafal.majeed@ideasbeyondborders.org,
ftc@falconiraq.com,
sardar@dbsoft.co,
erbil@patchi.com,
fredrick.toohey@crossboundary.com,
zahi.hilal@iraqiventurepartners.com,
ayman.ahmed2@huawei.com,
fahammad@gaft.gov.sa,
safdar.nazir@huawei.com,
carolina@citiesandcollaboration.com,
mustafa_bajger@cihanmotors.com,
muhamed@hawkary.com,
rami.george@iq.bwr-intl.com,
khalid.agha@electromall.net,
ayad_advocate@yahoo.com,
infp@sunliosolar.com,
slari@theclremontgroup.com,
contact@lezan.work,
brwamohammed@longi.com,
steffen.schnittger@giz.de,
hemin.ferman@grofin.com,
shahad.noori@the-station.iq,
jsun5011@ceec.net.cn,
cto@progress-sun.com,
kayali@hispasur.com,
yehya@ovanya.com,
mounir@stdol.com,
info@bareezgroup.com,
aheng@greiagency.com,
k.luczak@innowatorzywsi.pl,
namo.socks@gmail.com,
niall.ardill@giz.de,
sadraie@martrade-group.com,
j.safadi@bwr-intl.com,
samproadvertisement@gmail.com,
h.mohammed@cabi.org,
info@bmsho.com,
sales@starallianceiraq.com,
dana.kandalan@pwc.com,
avin@click.iq,
hr@korektel.com,
liujianfeng1@anotoil.com,
info@telerik.com,
careers@fast-link.com,
zyp@bnbm.com.cn,
tara@blackace.tech,
barham@plustheedge.com,
aburress@uschamber.com,
catherine.shaw@fcdo.gov.uk,
james.oates@fcdo.gov.uk,
patchsl@state.gov,
satareng@yahoo.com,
j_alabdi@yahoo.com,
rizgar_khidir@yahoo.com,
kovan.co@gmail.com,
rawaz7395@gmail.com,
haval.ismael59@gmail.com,
raqeeb.bahaddin@krso.gov.krd,
ahmad.abdulkhaliq@cihanbank.com.iq,
jegr.mustafa@momt.gov.krd,
serwan.mohamed@krso.gov.krd,
general.postcom@motac.gov.krd,
rezan73@yahoo.com,
christian.disler@eds.admin.ch,
anapaula.bedoya@wfp.org,
bellatorenergie@gmail.com,
mjc-van.schaik@minbuza.nl,
daravan@revge.com,
kamaran@creativespace.com,
james.gallagher2@fcdo.gov.uk,
attoth@mfa.gov.hu,
mikolaj.trunin@investinpomerania.pl,
mhaddad@worldbank.org,
salar@kib.iq,
nashwan@babylongroup.info,
alexandre.decrombrugghe@oecd.org,
mkhidureli@enterprise.gov.ge,
martin.shanhan@ida.ie,
christophe.michels@webuildiraq.org,
lixin@cggcintl.com,
ariquelme@investchile.gob.cl,
lalrashdan@bloomberg.net,
fares.alhussami@oecd.org,
tjaafar@swbell.net,
rami.s@chestnutpub.com,
alexaner.moler@yougov.com,
sura@almiskco.com,
mdjkhayat@yahoo.com,
bsoltoff@mit.edu,
david.foster@taqaglobal.com,
piers@pierssecunda.com,
rasul@almastarabar.com,
dana@erbildelivery.com,
ali.jamal@enkitransport.com,
rashyalaela@gmail.cim,
helin.faidhan@fabyab.com,
adnan.mohammed@expertisefrance.fr,
kaka_ja67@yahoo.com,
mohammed_younus@dai.com,
adeebjarjis@yahoo.co,
ibrahim@state.gov,
soosa_company@yahoo.com,
shobin.thomas@hewa.com,
wherry.stephen@kar-k.com,
fakhir@qaiwangroup.com,
anwarrayis@gmail.com,
matt.martel@crossboundary.com,
ahmed.qadir@hewa.com,
a.abutair@jmeters.com,
haro.majidi@hewa.com,
bilal@retroomedia.com,
omar.khalifa@alsafidanone.com,
ahmed@luviamedical.com,
meer.kamal@bristoria.com,
hoc.erbil@mea.gov.in,
zakaria.jafer@halabjagroup.com,
aso@halabjagroup.com,
nali.bahaulddin@minbuza.nl,
zring@farukholding.com,
info@dmi.gov.krd,
chra@amchamkurdistan.org,
insu.baek@daewooenc.com,
susan.burhan@rwanga.org,
madyanbarzani@gmail.com,
azeen.ali@bureauveritas.com,
design@gegreklam.com,
yousif@nooralanoor.org,
yasameen.khan@fcdo.gov.uk,
m.barazi@salpme.com,
markland.starkie@fma.com,
irfan.ortac@zentralrat.com,
rivan.kunda@pwc.com,
mohamad.shukri@gov.krd,
shadman.karim@giz.de,
sherzad.majeed@giz.de,
amanj@job.studio,
phil.armatage@dhl.com,
savino.dangella@dhl.com,
bilal@kernel.krd,
rafi@hewa.com,
chiwas.chato@sardargroup.iq,
lusan.gardi@gmail.com,
majid.dellah@international.gc.ca,
hari.iyer@hadigy.com,
malek.sarieddine@accaglobal.com,
msaleh@barclaysgedi.com,
yousif.alalousi@alhandal.me,
husensiyan@gmail.com,
ali.khan@firstquantumcapital.com,
nahro.kamal@wannt.co,
samer.alserhan@roi-me.com,
bassam.falah@innovest.com,
sbarwary@deloitte.com,
emillstein@mercycorps.org,
karzan@hi-smart.co,
info@onlineguard.krd,
surjiraid@gmail.com,
erbil@mofcom.gov.cn,
erbil.admin@work-well.org,
john.winkley@alphaplus.co.uk,
alper.inkaya@bgn-int.com,
hyunsuk.jung@daewooenc.com,
dlvanomar81@gmail.com,
mzalzala@cipe.org,
hadyarigifts@gmail.com,
sarhang@sakar-group.com,
nechirvan.lezgin@altunsa.com,
ayhan.ibrahim@akmel.com,
ekhlass.william@khudairigroup.com,
sivar.salar994@gmail.com,
ali.jamal@erbildelivery.com,
zana_sadaf@hotmail.com,
heminali1981@gmail.com,
alrayyandiesel@gmail.com,
info@grandpalacehotelerbil.com,
kakahama447@gmail.com,
info@alsharqcompany.com,
mohammad.khier@spark-iraq.com,
hassan.alnahar73@gmail.com,
parwez.hewler@yahoo.com,
kurdistan.rashad@haval.iq,
mohammed.alsoufi@grofin.com,
horst.matsch@the-counter.info,
rasso.b@masaood.com,
info@aslicompany.com,
bag.msaab@cma-cgm.com,
omer.mahmod@fabyab.co,
karwan.cheecho@dot-future.com,
divan@satprintinghouse.com,
yasser@limak.com.tr,
abdullah.mozaffar@stergroup.com,
ahmadjanat@juhod.com,
sales3@vanafurniture.com,
alan_jouma@maciraq.com,
yasin.taha@enkitransport.com,
harem.hushiar@yougov.com,
kdd.haco@yahoo.com,
ramy_alfeouny@gmail.com,
krabin@kwrintl.com,
mohammedsweety93@gmail.com,
info@londonskyco.com,
sinan.nahar2019@gmail.com,
ziadalnahar@gmail.com,
j.safadi@iq.bwr-intl.com,
nabusuleiman@ifc.org,
dashne.kareem@fcdo.gov.uk,
batool.alezzi@binghatti.com,
jvbassil@byblosbank.com,
adnan.chali@kiinst.org,
karwan.akram@qaiwangroup.com,
hajisalam.realestate@yahoo.com,
adnrea.nasi@bmeia.gov.at,
halo.karim@pmo.gov.krd,
dana.mohammed@dit.gov.krd,
aljobori@junsrsy.com,
rivan.abbas#=@dit.gov.krd,
operations@dietnutrition.life,
usama.agrohealth@gmail.com,
s.alghandour@spark-online.org,
hakky061@gmail.com,
gokhan.sagme@cihanbank.com.iq,
ahmad@beppco.com,
it@beppco.com,
htalabani@yahoo.com`;

// ── Parse emails ──────────────────────────────────────────────────────────────
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const matches = EMAIL_LIST.match(emailRegex) ?? [];
const seen = new Set();
const contacts = [];
for (const email of matches) {
  const lower = email.toLowerCase();
  if (seen.has(lower)) continue;
  seen.add(lower);
  const [local, domain] = email.split("@");
  const { firstName, lastName } = deriveName(local);
  contacts.push({ email: lower, firstName, lastName, company: deriveCompany(domain), country: deriveCountry(domain) });
}
console.log(`Parsed ${contacts.length} unique contacts from email list\n`);

// ── Load existing data ────────────────────────────────────────────────────────
console.log("Fetching existing companies and contacts...");
const existingCompanies = await convex.action(api.adminImport.listCompanies, adminArgs);
const existingContacts = await convex.action(api.adminImport.listContacts, adminArgs);
console.log(`Existing: ${existingCompanies.length} companies, ${existingContacts.length} contacts\n`);

const existingEmailSet = new Set(existingContacts.map((c) => c.email?.toLowerCase()).filter(Boolean));

// ── Import ────────────────────────────────────────────────────────────────────
const companyCache = new Map(existingCompanies.map((c) => [c.name.toLowerCase(), c._id]));
let created = 0, skipped = 0, failed = 0;

for (const contact of contacts) {
  try {
    if (existingEmailSet.has(contact.email)) { skipped++; continue; }

    let companyId;
    if (contact.company) {
      const key = contact.company.toLowerCase();
      if (!companyCache.has(key)) {
        const id = await convex.action(api.adminImport.createCompany, {
          ...adminArgs,
          name: contact.company,
        });
        companyCache.set(key, id);
      }
      companyId = companyCache.get(key);
    }

    await convex.action(api.adminImport.createContact, {
      ...adminArgs,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      companyId: companyId ?? null,
      country: contact.country || null,
    });
    created++;
    process.stdout.write(`\r  Created ${created} | Skipped ${skipped} | Failed ${failed}`);
  } catch (e) {
    failed++;
    console.error(`\n  ✗ ${contact.email}: ${e.message}`);
  }
}

console.log(`\n\n✅ Done: ${created} created, ${skipped} skipped (duplicate), ${failed} failed`);
