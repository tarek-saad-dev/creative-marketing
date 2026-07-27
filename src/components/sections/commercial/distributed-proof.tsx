type DistributedProofProps = {
  testimonial: {
    clientName: string;
    quote: string;
    projectName?: string | null;
  };
  slot: string;
};

export function DistributedProof({ testimonial, slot }: DistributedProofProps) {
  return (
    <aside
      data-proof-slot={slot}
      className="rounded-2xl border border-border/40 bg-background-elevated/50 px-5 py-4"
    >
      <p className="text-sm leading-7 text-foreground">“{testimonial.quote}”</p>
      <p className="mt-2 text-xs font-semibold text-foreground-muted">
        — {testimonial.clientName}
        {testimonial.projectName ? ` · ${testimonial.projectName}` : ""}
      </p>
    </aside>
  );
}
