import Link from "next/link";

type ButtonProps = {
  href: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
  external?: boolean;
};

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
  external,
}: ButtonProps) {
  const base =
    "inline-block rounded-lg px-7 py-3.5 text-[15px] font-medium transition-colors duration-200 text-center";

  const variants = {
    primary: "bg-steel text-carbon hover:bg-steel-hover",
    secondary: "border-[1.5px] border-white text-ink hover:bg-ink/[0.08]",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
