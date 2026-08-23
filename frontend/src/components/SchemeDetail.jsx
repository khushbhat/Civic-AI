import { useState, useEffect } from 'react';
import { getSchemeDetails } from '../api';
import AIChatPanel from './AIChatPanel';

function DetailSection({ title, children }) {
  return (
    <section className="grid gap-4 border-t border-black pt-6 first:border-t-0 first:pt-0">
      <h3 className="editorial-kicker">{title}</h3>
      {children}
    </section>
  );
}

function DropCapParagraph({ text }) {
  if (!text) {
    return <p className="editorial-copy text-base">A full description is not available right now.</p>;
  }

  const firstLetter = text.slice(0, 1);
  const rest = text.slice(1);

  return (
    <p className="text-base leading-relaxed text-[color:var(--foreground)] md:text-lg">
      <span className="mr-4 mt-1 inline-flex h-12 w-12 items-center justify-center border border-black font-display text-2xl leading-none">
        {firstLetter}
      </span>
      <span>{rest}</span>
    </p>
  );
}

function SchemeDetail({ schemeId, onBack }) {
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getSchemeDetails(schemeId);
        setScheme(data);
      } catch {
        setError("Failed to load scheme details.");
      } finally {
        setLoading(false);
      }
    };
    if (schemeId) fetchDetails();
  }, [schemeId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center md:py-24">
        <div className="editorial-panel p-8 md:p-12">
          <p className="editorial-kicker">Preparing Details</p>
          <h2 className="editorial-display mt-4 text-4xl md:text-5xl">We’re bringing the scheme details together.</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center md:py-24">
        <div className="editorial-panel editorial-panel-inverse p-8 md:p-12">
          <p className="editorial-kicker text-white/70">Something Went Wrong</p>
          <h2 className="editorial-display mt-4 text-4xl md:text-5xl">{error}</h2>
        </div>
      </div>
    );
  }

  if (!scheme) return null;

  return (
    <div className="mx-auto max-w-6xl py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.85fr)] lg:items-start">
        <div className="space-y-6">
          <button onClick={onBack} className="editorial-button editorial-button--ghost px-0">
            Back to Matches
          </button>

          <article className="editorial-panel p-6 md:p-8 lg:p-10">
            <div className="border-b border-black pb-6">
              <p className="editorial-kicker">Scheme Details</p>
              <h2 className="editorial-display mt-3 text-4xl md:text-5xl lg:text-6xl">{scheme.name}</h2>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex border border-black px-3 py-1 text-xs font-mono uppercase tracking-[0.18em]">
                  {scheme.ministry}
                </span>
                <span className="inline-flex border border-black px-3 py-1 text-xs font-mono uppercase tracking-[0.18em]">
                  {scheme.government_level} Government
                </span>
                <span className="inline-flex border border-black px-3 py-1 text-xs font-mono uppercase tracking-[0.18em]">
                  Last verified {scheme.last_verified_date}
                </span>
              </div>
            </div>

            {scheme.verification_status === "needs_verification" && (
              <div className="mt-6 border border-black bg-black p-4 text-sm leading-relaxed text-white">
                <h4 className="editorial-meta text-white/70">Needs a Quick Review</h4>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  A few eligibility details still need confirmation from official sources. Please review the requirements before you apply.
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-8">
              <DetailSection title="Benefits">
                <DropCapParagraph text={scheme.benefits} />
              </DetailSection>

              <DetailSection title="Documents Required">
                <ul className="grid gap-3">
                  {scheme.documents_required.map((doc, idx) => (
                    <li key={idx} className="flex gap-3 text-base leading-relaxed text-[color:var(--foreground)]">
                      <span className="font-mono text-xs tracking-[0.2em]">{String(idx + 1).padStart(2, '0')}</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </DetailSection>

              <DetailSection title="Application Process">
                <ol className="grid gap-3">
                  {scheme.application_process.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-base leading-relaxed text-[color:var(--foreground)]">
                      <span className="font-mono text-xs tracking-[0.2em]">{String(idx + 1).padStart(2, '0')}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </DetailSection>
            </div>

            <div className="mt-10 border-t border-black pt-6">
              <a
                href={scheme.official_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-button"
              >
                Visit Official Portal
              </a>
              <p className="mt-4 text-xs font-mono uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
                Last verified: {scheme.last_verified_date}
              </p>
            </div>
          </article>
        </div>

        <div className="lg:pt-14">
          <AIChatPanel schemeId={schemeId} schemeName={scheme.name} />
        </div>
      </div>
    </div>
  );
}

export default SchemeDetail;
