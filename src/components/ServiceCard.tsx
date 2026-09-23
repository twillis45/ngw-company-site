type ServiceCardProps = {
  title: string;
  body: string;
};

export function ServiceCard({ title, body }: ServiceCardProps) {
  return (
    <div className="rounded-xl border border-hair bg-surface-2 p-8 border-t-[3px] border-t-hair-strong hover:border-steel transition-colors duration-200">
      <h3 className="text-[22px] font-semibold leading-7 text-ink mb-3">
        {title}
      </h3>
      <p className="text-[16px] leading-7 text-muted">{body}</p>
    </div>
  );
}
