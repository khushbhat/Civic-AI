function Recommendations({ recommendations, onSelectScheme, onBack }) {
  
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="mx-auto max-w-4xl py-10 text-center md:py-16">
        <div className="editorial-panel p-8 md:p-12">
          <p className="editorial-kicker">No Results</p>
          <h2 className="editorial-display mt-4 text-4xl md:text-5xl">No matching schemes found.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[color:var(--muted-foreground)]">
            The current profile does not meet enough criteria for a confident match. Go back and widen the profile details if needed.
          </p>
          <button onClick={onBack} className="editorial-button editorial-button--outline mt-8">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'likely_eligible': return 'bg-black text-white border-black';
      case 'possibly_eligible': return 'bg-white text-black border-black';
      case 'insufficient_data': return 'bg-[var(--muted)] text-black border-black';
      default: return 'bg-white text-black border-black';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'likely_eligible': return 'Likely Eligible';
      case 'possibly_eligible': return 'Possibly Eligible';
      case 'insufficient_data': return 'Need More Info';
      default: return 'Not Eligible';
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-8 md:py-12">
      <div className="flex flex-col gap-4 border-b border-black pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="editorial-kicker">Step 2 / Match</p>
          <h2 className="editorial-display mt-3 text-4xl md:text-5xl">Your Matches</h2>
        </div>
        <button onClick={onBack} className="editorial-button editorial-button--ghost justify-start px-0 md:justify-end">
          Edit Profile
        </button>
      </div>
      
      <div className="mt-8 grid gap-6">
        {recommendations.map(rec => (
          <button 
            key={rec.scheme_id} 
            type="button"
            className="editorial-card block w-full text-left p-6 md:p-8"
            onClick={() => onSelectScheme(rec.scheme_id)}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl space-y-4 pr-0 lg:pr-8">
                <p className="editorial-meta text-[color:var(--muted-foreground)]">Scheme</p>
                <h3 className="font-display text-3xl leading-none tracking-tighter md:text-4xl">{rec.name}</h3>
                <p className="text-sm leading-relaxed text-inherit opacity-80 md:text-base">
                  Tap through to read the official details, eligibility summary, and supporting documents.
                </p>
              </div>

              <div className="grid gap-3 border-t border-black pt-5 lg:border-t-0 lg:pt-0 lg:text-right">
                <span className="editorial-display text-4xl md:text-5xl">{rec.match_percentage}%</span>
                <span className="editorial-meta">Match</span>
                <span className={`inline-flex w-fit border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${getStatusColor(rec.status)}`}>
                  {getStatusLabel(rec.status)}
                </span>
              </div>
            </div>
            
            {rec.verification_status === "needs_verification" && (
              <div className="mt-6 inline-flex border border-black bg-black px-3 py-2 text-xs font-mono uppercase tracking-[0.18em] text-white">
                Eligibility not fully confirmed — some criteria pending verification.
              </div>
            )}
            
            <div className="mt-6 border-t border-black pt-6 text-base leading-relaxed italic">
              <span className="editorial-meta not-italic">AI Analysis</span>
              <p className="mt-3 text-inherit">{rec.ai_explanation || "No explanation available."}</p>
            </div>

            <div className="mt-6 flex justify-end border-t border-black pt-5">
              <span className="editorial-button editorial-button--outline">
                View Details <span aria-hidden="true">→</span>
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
