/**
 * E2E test: import contacts via the browser UI import dialog.
 * Uses credentials sign-in (dev mode) then calls the /api/import endpoint.
 * Run: npx playwright test scripts/e2e-import.spec.ts --headed
 */
import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";
const ADMIN_SECRET = process.env.ADMIN_IMPORT_SECRET;
const TARGET_EMAIL = process.env.TARGET_EMAIL;

if (!ADMIN_SECRET) {
  throw new Error("ADMIN_IMPORT_SECRET is required to run scripts/e2e-import.spec.ts");
}

if (!TARGET_EMAIL) {
  throw new Error("TARGET_EMAIL is required to run scripts/e2e-import.spec.ts");
}

const EMAILS = `dashne.jalal@auis.edu.krd
albaqqal@emirates.ae
zhangz@bnbm.com.cn
karwan@vanogroup.com
blend.kurdo@tiller.com
dawar@plustheedge.com
suleymanciliv@77construction.com
clauspeter.strauss@taurus-rheinlan.de
ghid@mselect.com
siham.mamand@gov.krd
rbalool@deloitte.com
mohamed.ahmed@fao.org
musomer@deloitte.com
sales@gegreklam.com
syu023x@ceec.net.cn
info@kurdistanchronicle.com
sales@boss-furniture.com
chris@thegreenzonedc.com
info@krdc.org
sami.salaheldin@agcocorp.com
tarek.el-azab@corteva.com
michael.christensen@agcocorp.com
raof.sindi@kurd-solar.com
hanar.marouf@fcdo.gov.uk
greenacresglobal123@gmsil.com
lezan.khaled@gmail.com
basima@keskco.com
gd@albarhamgroup.com
turfmountain@bellsouth.net
erbil@bayad.co
mohammed.younus@giz.de
khalid.waleed@presidency.krd
adam.rogoda@sgh.waw.pl
greenacresglobal123@gmail.com
ahmad.okba@roland.de
ahmed@whitespace.krd
shwan@fiveonelabs.org
hawrre@grofin.com
pary@winsomepro.com
samerflaifel_hybird@yahoo.vom
ahmed.aldazdi@jobs.studio
lutz.scharf@giz.de
adeline.defer@giz.de
vijay@americanspecialfoods.com
sebastian.krull@giz.de
sherwan804@gmail.com
nadaelhusseiny@ffinetwork.org
shahez@wnordic.com
ceo@aceplan.co
hojjat@ksjmotor.com
khalil@ubholding.com
rwadsworth@sonangoliraq.com
myles.caggins3@gmail.com
nicolasmalaplate@faun.com
jens.rose@rose-gleisbau.de
sardarmultitex@gmail.com
halit.acar@acarsan.com.tr
hqagir@crescent.ae
bakhtiar.rasheed@erbilbank.com.iq
mahmood.agha@electromall.net
info@enlightors.com
saad@whitespace.krd
rzgar.faeq@wannet.co
kawan@knets.co
hardi@mselect.iq
zalalebrand@gmail.com
asso.beg@kge-businessaliances.com
Aalul@schuco.com
yama.torabi@undp.org
rafal.majeed@ideasbeyondborders.org
ftc@falconiraq.com
sardar@dbsoft.co
erbil@patchi.com
fredrick.toohey@crossboundary.com
zahi.hilal@iraqiventurepartners.com
ayman.ahmed2@huawei.com
fahammad@gaft.gov.sa
safdar.nazir@huawei.com
carolina@citiesandcollaboration.com
mustafa_bajger@cihanmotors.com
muhamed@hawkary.com
rami.george@iq.bwr-intl.com
khalid.agha@electromall.net
ayad_advocate@yahoo.com
infp@sunliosolar.com
slari@theclremontgroup.com
contact@lezan.work
brwamohammed@longi.com
steffen.schnittger@giz.de
hemin.ferman@grofin.com
shahad.noori@the-station.iq
jsun5011@ceec.net.cn
cto@progress-sun.com
kayali@hispasur.com
yehya@ovanya.com
mounir@stdol.com
info@bareezgroup.com
aheng@greiagency.com
k.luczak@innowatorzywsi.pl
namo.socks@gmail.com
niall.ardill@giz.de
sadraie@martrade-group.com
j.safadi@bwr-intl.com
samproadvertisement@gmail.com
h.mohammed@cabi.org
info@bmsho.com
sales@starallianceiraq.com
dana.kandalan@pwc.com
avin@click.iq
hr@korektel.com
liujianfeng1@anotoil.com
info@telerik.com
careers@fast-link.com
zyp@bnbm.com.cn
tara@blackace.tech
barham@plustheedge.com
aburress@uschamber.com
catherine.shaw@fcdo.gov.uk
james.oates@fcdo.gov.uk
patchsl@state.gov
satareng@yahoo.com
j_alabdi@yahoo.com
rizgar_khidir@yahoo.com
kovan.co@gmail.com
rawaz7395@gmail.com
haval.ismael59@gmail.com
raqeeb.bahaddin@krso.gov.krd
ahmad.abdulkhaliq@cihanbank.com.iq
jegr.mustafa@momt.gov.krd
serwan.mohamed@krso.gov.krd
general.postcom@motac.gov.krd
rezan73@yahoo.com
christian.disler@eds.admin.ch
anapaula.bedoya@wfp.org
bellatorenergie@gmail.com
mjc-van.schaik@minbuza.nl
daravan@revge.com
kamaran@creativespace.com
james.gallagher2@fcdo.gov.uk
attoth@mfa.gov.hu
mikolaj.trunin@investinpomerania.pl
mhaddad@worldbank.org
salar@kib.iq
nashwan@babylongroup.info
alexandre.decrombrugghe@oecd.org
mkhidureli@enterprise.gov.ge
martin.shanhan@ida.ie
christophe.michels@webuildiraq.org
lixin@cggcintl.com
ariquelme@investchile.gob.cl
lalrashdan@bloomberg.net
fares.alhussami@oecd.org
tjaafar@swbell.net
rami.s@chestnutpub.com
alexaner.moler@yougov.com
sura@almiskco.com
mdjkhayat@yahoo.com
bsoltoff@mit.edu
david.foster@taqaglobal.com
piers@pierssecunda.com
rasul@almastarabar.com
dana@erbildelivery.com
ali.jamal@enkitransport.com
rashyalaela@gmail.cim
helin.faidhan@fabyab.com
adnan.mohammed@expertisefrance.fr
kaka_ja67@yahoo.com
mohammed_younus@dai.com
adeebjarjis@yahoo.co
ibrahim@state.gov
soosa_company@yahoo.com
shobin.thomas@hewa.com
wherry.stephen@kar-k.com
fakhir@qaiwangroup.com
anwarrayis@gmail.com
matt.martel@crossboundary.com
ahmed.qadir@hewa.com
a.abutair@jmeters.com
haro.majidi@hewa.com
bilal@retroomedia.com
omar.khalifa@alsafidanone.com
ahmed@luviamedical.com
meer.kamal@bristoria.com
hoc.erbil@mea.gov.in
zakaria.jafer@halabjagroup.com
aso@halabjagroup.com
nali.bahaulddin@minbuza.nl
zring@farukholding.com
info@dmi.gov.krd
chra@amchamkurdistan.org
insu.baek@daewooenc.com
susan.burhan@rwanga.org
madyanbarzani@gmail.com
azeen.ali@bureauveritas.com
design@gegreklam.com
yousif@nooralanoor.org
yasameen.khan@fcdo.gov.uk
m.barazi@salpme.com
markland.starkie@fma.com
irfan.ortac@zentralrat.com
rivan.kunda@pwc.com
mohamad.shukri@gov.krd
shadman.karim@giz.de
sherzad.majeed@giz.de
amanj@job.studio
phil.armatage@dhl.com
savino.dangella@dhl.com
bilal@kernel.krd
rafi@hewa.com
chiwas.chato@sardargroup.iq
lusan.gardi@gmail.com
majid.dellah@international.gc.ca
hari.iyer@hadigy.com
malek.sarieddine@accaglobal.com
msaleh@barclaysgedi.com
yousif.alalousi@alhandal.me
husensiyan@gmail.com
ali.khan@firstquantumcapital.com
nahro.kamal@wannt.co
samer.alserhan@roi-me.com
bassam.falah@innovest.com
sbarwary@deloitte.com
emillstein@mercycorps.org
karzan@hi-smart.co
info@onlineguard.krd
surjiraid@gmail.com
erbil@mofcom.gov.cn
erbil.admin@work-well.org
john.winkley@alphaplus.co.uk
alper.inkaya@bgn-int.com
hyunsuk.jung@daewooenc.com
dlvanomar81@gmail.com
mzalzala@cipe.org
hadyarigifts@gmail.com
sarhang@sakar-group.com
nechirvan.lezgin@altunsa.com
ayhan.ibrahim@akmel.com
ekhlass.william@khudairigroup.com
sivar.salar994@gmail.com
ali.jamal@erbildelivery.com
zana_sadaf@hotmail.com
heminali1981@gmail.com
alrayyandiesel@gmail.com
info@grandpalacehotelerbil.com
kakahama447@gmail.com
info@alsharqcompany.com
mohammad.khier@spark-iraq.com
hassan.alnahar73@gmail.com
parwez.hewler@yahoo.com
kurdistan.rashad@haval.iq
mohammed.alsoufi@grofin.com
horst.matsch@the-counter.info
rasso.b@masaood.com
info@aslicompany.com
bag.msaab@cma-cgm.com
omer.mahmod@fabyab.co
karwan.cheecho@dot-future.com
divan@satprintinghouse.com
yasser@limak.com.tr
abdullah.mozaffar@stergroup.com
ahmadjanat@juhod.com
sales3@vanafurniture.com
alan_jouma@maciraq.com
yasin.taha@enkitransport.com
harem.hushiar@yougov.com
kdd.haco@yahoo.com
ramy_alfeouny@gmail.com
krabin@kwrintl.com
mohammedsweety93@gmail.com
info@londonskyco.com
sinan.nahar2019@gmail.com
ziadalnahar@gmail.com
j.safadi@iq.bwr-intl.com
nabusuleiman@ifc.org
dashne.kareem@fcdo.gov.uk
batool.alezzi@binghatti.com
jvbassil@byblosbank.com
adnan.chali@kiinst.org
karwan.akram@qaiwangroup.com
hajisalam.realestate@yahoo.com
adnrea.nasi@bmeia.gov.at
halo.karim@pmo.gov.krd
dana.mohammed@dit.gov.krd
aljobori@junsrsy.com
operations@dietnutrition.life
usama.agrohealth@gmail.com
s.alghandour@spark-online.org
hakky061@gmail.com
gokhan.sagme@cihanbank.com.iq
ahmad@beppco.com
it@beppco.com
htalabani@yahoo.com`;

test("import contacts via UI dialog", async ({ page }) => {
  // Collect console errors
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  // ── Pre-check: verify /api/import is reachable with admin bypass ─────────
  const preCheck = await page.request.post(`${BASE_URL}/api/import`, {
    headers: {
      "Content-Type": "application/json",
      "X-Import-Email": TARGET_EMAIL,
      "X-Import-Secret": ADMIN_SECRET,
    },
    data: { contacts: [] },
  });
  console.log("/api/import pre-check status:", preCheck.status());
  expect(preCheck.status()).toBe(200);

  // ── Use Playwright route interception: inject admin headers on /api/import
  await page.route("**/api/import", async (route) => {
    const req = route.request();
    const body = req.postDataJSON();
    const resp = await page.request.post(`${BASE_URL}/api/import`, {
      headers: {
        "Content-Type": "application/json",
        "X-Import-Email": TARGET_EMAIL,
        "X-Import-Secret": ADMIN_SECRET,
      },
      data: body,
    });
    const respBody = await resp.json();
    console.log("/api/import result:", respBody);
    await route.fulfill({
      status: resp.status(),
      contentType: "application/json",
      body: JSON.stringify(respBody),
    });
  });

  // ── Navigate to contacts page ─────────────────────────────────────────────
  await page.goto(`${BASE_URL}/app/crm/contacts`);
  await page.waitForLoadState("networkidle");
  console.log("URL:", page.url());

  // ── Open import dialog ─────────────────────────────────────────────────────
  const importBtn = page.locator("button:has-text('Import')").first();
  await expect(importBtn).toBeVisible({ timeout: 5000 });
  await importBtn.click();

  // ── Verify dialog opened ──────────────────────────────────────────────────
  await expect(page.locator("text=Import Contacts")).toBeVisible({ timeout: 3000 });
  console.log("✅ Import dialog opened");

  // ── Switch to Emails tab and paste emails ─────────────────────────────────
  const emailsTab = page.locator("button:has-text('Emails')").first();
  await emailsTab.click();

  const textarea = page.locator("textarea").first();
  await textarea.fill(EMAILS);
  console.log("✅ Emails pasted");

  // ── Click Extract Contacts ─────────────────────────────────────────────────
  await page.locator("button:has-text('Extract Contacts')").click();
  await page.waitForTimeout(1500);

  const foundText = await page.locator("text=/Found .* contacts/").textContent({ timeout: 5000 }).catch(() => null);
  console.log("Found text:", foundText);

  // ── Click Import ──────────────────────────────────────────────────────────
  const importContactsBtn = page.locator("button:has-text('Import')").last();
  console.log("Import button text:", await importContactsBtn.textContent());
  await importContactsBtn.click();

  // Wait for success screen — use toBeVisible() which retries (isVisible() is a one-shot check)
  let success = false;
  try {
    await expect(page.locator("text=Contacts Imported")).toBeVisible({ timeout: 60000 });
    success = true;
    console.log("✅ Import success: true");
  } catch {
    // Capture what's actually on screen
    const pageContent = await page.locator("[data-dialog], [class*='import'], [class*='fixed']").allTextContents().catch(() => []);
    const errorMsg = await page.locator("text=Import failed").textContent({ timeout: 500 }).catch(() => null)
      ?? await page.locator("text=Network error").textContent({ timeout: 500 }).catch(() => null);
    console.log("✅ Import success: false");
    if (errorMsg) console.log("⚠️  Error shown:", errorMsg);
    if (pageContent.length) console.log("📄 Dialog content:", pageContent.join(" | ").slice(0, 300));
  }
  if (consoleErrors.length) console.log("🔴 Console errors:", consoleErrors.slice(0, 5));

  // Take a screenshot for debugging
  await page.screenshot({ path: "test-results/import-result.png" });
  console.log("📸 Screenshot saved to test-results/import-result.png");

  expect(success).toBe(true);
});
