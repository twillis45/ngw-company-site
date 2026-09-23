import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-carbon pt-40 pb-32 md:pt-44">
      <div className="mx-auto max-w-[680px] px-6 md:px-12 text-center">
        <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-faint">
          404
        </p>
        <h1 className="mb-5 text-[28px] font-semibold leading-tight text-ink md:text-[40px] md:leading-[48px]">
          That page doesn&rsquo;t exist
        </h1>
        <p className="mb-8 text-[17px] leading-7 text-muted">
          The link may be out of date, or the address mistyped.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-steel px-7 py-3.5 text-[15px] font-medium text-carbon transition-colors duration-200 hover:bg-steel-hover"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
