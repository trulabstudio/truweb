type SectionHeadingProps = {
  kicker: string;
  title: string;
  description?: string;
  className?: string;
};

export default function SectionHeading({ kicker, title, description, className = "" }: SectionHeadingProps) {
  return (
    <div className={`max-w-3xl ${className}`.trim()}>
      <span className="section-kicker">{kicker}</span>
      <h2 className="mt-5 text-3xl font-semibold leading-tight text-trulab-ink sm:text-5xl">{title}</h2>
      {description ? <p className="mt-5 text-base leading-8 text-trulab-muted">{description}</p> : null}
    </div>
  );
}
