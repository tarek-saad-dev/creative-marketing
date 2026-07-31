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
      className="card-glow rounded-2xl card-glass px-5 py-4"
    >
      <p className="body-text">“{testimonial.quote}”</p>
      <p className="body-text-muted mt-2 font-semibold">
        — {testimonial.clientName}
        {testimonial.projectName ? ` · ${testimonial.projectName}` : ""}
      </p>
    </aside>
  );
}
