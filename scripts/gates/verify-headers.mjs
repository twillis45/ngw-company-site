// Gate: the LIVE origin sends the response headers a public business site owes.
//
// This one reads production, not the repo, because a header is a property of
// the server and no file in this tree can prove one. render.yaml-style
// reasoning — "the config says so, therefore production does" — is the exact
// inference the spine records as having been wrong twice in one session.
//
// Exit 2 (CANNOT CHECK) when the network is unreachable. A gate that cannot
// reach its subject has not passed and has not failed, and collapsing those
// two into one answer is how a green run comes to mean nothing.

const ORIGIN = process.env.NGWS_ORIGIN || "https://noguessworksystems.com";

const REQUIRED = {
  "strict-transport-security": "no HSTS — a first request can be downgraded to http",
  "content-security-policy": "no CSP — any injected script executes with full privileges",
  "x-content-type-options": "no nosniff — the browser may re-interpret a response's type",
  "referrer-policy": "no referrer policy — full URLs leak to every third party linked",
  "x-frame-options": "no framing policy — the site can be embedded for clickjacking",
};

const res = await fetch(`${ORIGIN}/?cachebust=${Date.now()}`, { redirect: "follow" }).catch(
  (e) => {
    console.error(`CANNOT CHECK — ${ORIGIN} unreachable: ${e.message}`);
    console.error("Not a pass. Re-run where the origin is reachable.");
    process.exit(2);
  }
);

if (!res.ok) {
  console.error(`CANNOT CHECK — ${ORIGIN} returned HTTP ${res.status}`);
  process.exit(2);
}

const failures = [];
for (const [h, why] of Object.entries(REQUIRED)) {
  if (!res.headers.get(h)) failures.push(`${h} — ${why}`);
}

const n = failures.length;
console.log(`\n${n === 0 ? "PASS" : "FAIL"}  security headers on ${ORIGIN}  (${Object.keys(REQUIRED).length} checked, ${n} missing)`);
for (const f of failures) console.log(`  ✗ ${f}`);
process.exit(n === 0 ? 0 : 1);
