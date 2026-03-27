type ServiceCardProps = {
  title: string;
  body: string;
};

export function ServiceCard({ title, body }: ServiceCardProps) {
  return (
    <div className="rounded-xl border border-border-dark bg-slate-surface p-8 border-t-[3px] border-t-accent hover:border-accent transition-colors duration-200">
      <h3 className="text-[22px] font-semibold leading-7 text-white mb-3">
        {title}
      </h3>
      <p className="text-[16px] leading-7 text-cool-gray">{body}</p>
    </div>
  );
}
