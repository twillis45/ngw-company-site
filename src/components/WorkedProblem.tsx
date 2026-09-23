// Every figure in a worked problem traces to a PROVEN row in
// ngw-consulting/case-studies/CLAIM-LEDGER.md, and carries the qualifier that
// ledger attaches to it. The ledger's own framing governs: these are WORKED
// PROBLEMS, not client engagements. The words "client", "engagement" and
// "delivered to" are prohibited in any phrasing, because no external party has
// received either body of work.
//
// `limit` is not a disclaimer bolted on. The ledger lists the anti-claims and
// says to leave them in, and they are the most credible thing on the page: a
// site whose promise is "evidence you can check" has to show the reader where
// the evidence stops.

export function WorkedProblem({
  number,
  title,
  removed,
  evidence,
  limit,
}: {
  number: string;
  title: string;
  removed: string;
  evidence: { claim: string; check: string }[];
  limit: string;
}) {
  return (
    <div className="border-t border-hair pt-8">
      <p className="mb-2 font-mono text-[13px] text-faint">{number}</p>
      <h3 className="mb-3 text-[22px] font-semibold leading-7 text-ink">{title}</h3>
      <p className="mb-6 text-[16px] leading-7 text-muted">{removed}</p>

      <dl className="mb-6 space-y-3">
        {evidence.map((e) => (
          <div key={e.claim} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <dt className="text-[15px] text-ink sm:w-1/2">{e.claim}</dt>
            <dd className="font-mono text-[13px] leading-6 text-faint sm:w-1/2">{e.check}</dd>
          </div>
        ))}
      </dl>

      <p className="border-l-2 border-hair-strong pl-4 text-[15px] leading-7 text-faint">
        <span className="text-muted">What it does not show. </span>
        {limit}
      </p>
    </div>
  );
}
