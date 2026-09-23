#!/usr/bin/env node
// Is the entity domain actually protected? Reads the LIVE registry, not a
// dashboard screenshot and not anyone's memory of what they clicked.
//
// Written 2026-09-23, when noguessworksystems.com carried status ["active"] —
// no transfer lock, no delete lock, no update lock, delegationSigned false,
// 138 days to expiry — while every other domain checked alongside it carried
// at least a transfer lock and ran years longer. A lapse takes the entity
// name, info@, admin@, every product subdomain and the Apple enrollment site
// at once, and it is the only item in this project's record with a hard
// deadline and an unrecoverable failure mode.
//
//   node scripts/watch-domain-posture.mjs [domain ...]
//
// It lives OUTSIDE scripts/gates/ on purpose: verify:coverage claims
// everything in there and requires it in verify:all, which would make a
// second permanently-red blocking gate. One is already enough to make a
// green CI mean less than it looks. This is a watch on a countdown, and it
// runs in the daily origin job that already reads the live world.
//
// Exit 0 = every asserted property holds. Exit 1 = something is open.
// Exit 2 = could not read the registry, which is NOT a pass.

const DOMAINS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["noguessworksystems.com"];

// clientRenewProhibited is deliberately NOT required: it BLOCKS renewal, which
// is the opposite of what protects a domain 138 days from expiry.
const WANT_LOCKS = ["client transfer prohibited", "client delete prohibited", "client update prohibited"];
const MIN_DAYS = 180;

let failed = false;

for (const name of DOMAINS) {
  let d;
  try {
    const r = await fetch(`https://rdap.verisign.com/com/v1/domain/${name}`, {
      headers: { Accept: "application/rdap+json" },
      signal: AbortSignal.timeout(25000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    d = await r.json();
  } catch (e) {
    console.error(`CANNOT CHECK  ${name} — ${e.message}`);
    console.error("Not a pass. A guard that cannot read its subject has not run.");
    process.exit(2);
  }

  const status = (d.status || []).map((s) => s.toLowerCase());
  const signed = d.secureDNS?.delegationSigned === true;
  const exp = (d.events || []).find((e) => e.eventAction === "expiration");
  const days = exp ? Math.floor((new Date(exp.eventDate) - Date.now()) / 86400000) : null;

  const open = [];
  for (const lock of WANT_LOCKS) if (!status.includes(lock)) open.push(`missing ${lock}`);
  if (!signed) open.push("DNSSEC not signed (delegationSigned: false)");
  if (days !== null && days < MIN_DAYS) open.push(`expires in ${days} days (want > ${MIN_DAYS})`);

  console.log(`\n${open.length ? "OPEN" : "OK  "}  ${name}`);
  console.log(`      status   ${JSON.stringify(d.status)}`);
  console.log(`      dnssec   ${signed}`);
  console.log(`      expires  ${exp ? exp.eventDate.slice(0, 10) : "?"}${days !== null ? ` (${days} days)` : ""}`);
  for (const o of open) console.log(`      ✗ ${o}`);
  if (open.length) failed = true;
}

console.log(failed ? "\nFAIL  the entity domain is not protected" : "\nPASS  every asserted property holds");
process.exit(failed ? 1 : 0);
