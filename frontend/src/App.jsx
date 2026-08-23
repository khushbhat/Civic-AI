import { useState } from 'react';
import './App.css';
import ProfileForm from './components/ProfileForm';
import Recommendations from './components/Recommendations';
import SchemeDetail from './components/SchemeDetail';

const workflowPanels = [
  {
    label: '01 / Intake',
    title: 'Profile by facts, not guesses.',
    copy: 'The form asks only for the data the eligibility engine can use directly.',
  },
  {
    label: '02 / Match',
    title: 'Read the ranking as a document.',
    copy: 'Eligible, possible, and incomplete matches are separated with strict visual hierarchy.',
  },
  {
    label: '03 / Detail',
    title: 'Inspect the scheme and question the rules.',
    copy: 'Each scheme opens into source-backed details with the built-in assistant beside it.',
  },
];

const featureBlocks = [
  {
    value: 'Mono',
    label: 'pure black, white, and linework',
  },
  {
    value: 'Fast',
    label: 'instant state changes with no ornamental motion',
  },
  {
    value: 'Clear',
    label: 'distinct screens for profile, matches, and detail',
  },
];

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);

  const goHome = () => setCurrentScreen('home');
  const goProfile = () => setCurrentScreen('profile');
  
  const handleProfileSubmit = (recs) => {
    setRecommendations(recs);
    setCurrentScreen('recommendations');
  };

  const handleSchemeSelect = (id) => {
    setSelectedSchemeId(id);
    setCurrentScreen('detail');
  };

  return (
    <div className="page-shell">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-black focus:bg-white focus:px-4 focus:py-3 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-black"
      >
        Skip to content
      </a>

      <header className="border-b-4 border-black bg-white">
        <div className="page-frame flex flex-col gap-4 py-5 md:flex-row md:items-end md:justify-between">
          <button type="button" onClick={goHome} className="text-left">
            <span className="editorial-kicker block">CivicAI</span>
            <span className="mt-2 block font-display text-2xl tracking-tighter md:text-3xl">Monochrome eligibility</span>
          </button>

          <nav className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={goHome} className="editorial-button editorial-button--ghost">
              Home
            </button>
            <button type="button" onClick={goProfile} className="editorial-button editorial-button--ghost">
              My Benefits
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content" className="page-frame">
        {currentScreen === 'home' && (
          <div className="py-12 md:py-16 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:items-start">
              <section className="space-y-8">
                <p className="editorial-kicker">Eligibility / government schemes / verified sources</p>
                <h1 className="editorial-display max-w-5xl text-[clamp(4rem,10vw,10rem)] uppercase">
                  Find
                  <span className="block">Benefits</span>
                  <span className="block">You Can Claim</span>
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-[color:var(--muted-foreground)] md:text-xl">
                  Answer a precise profile form, review ranked matches, and open a scheme detail view with the assistant beside it.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={goProfile} className="editorial-button">
                    Start Profile
                  </button>
                  <button type="button" onClick={goProfile} className="editorial-button editorial-button--outline">
                    Review Matches
                  </button>
                </div>
              </section>

              <aside className="editorial-panel editorial-panel-inverse overflow-hidden">
                <div className="border-b border-white/20 p-6 md:p-8">
                  <p className="editorial-kicker text-white/70">What happens next</p>
                </div>
                <div className="grid divide-y divide-white/20">
                  {workflowPanels.map((panel) => (
                    <div key={panel.label} className="p-6 md:p-8">
                      <p className="editorial-meta text-white/70">{panel.label}</p>
                      <h2 className="mt-4 font-display text-3xl tracking-tighter md:text-4xl">{panel.title}</h2>
                      <p className="mt-4 text-sm leading-relaxed text-white/75">{panel.copy}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        )}

        {currentScreen !== 'home' && (
          <div className="section-rule py-6">
            <p className="editorial-kicker">Current View</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-foreground)] md:text-base">
              Use the buttons below to return to the previous stage or continue through the flow.
            </p>
          </div>
        )}

        {currentScreen === 'profile' && (
          <ProfileForm onSubmitSuccess={handleProfileSubmit} />
        )}

        {currentScreen === 'recommendations' && (
          <Recommendations 
            recommendations={recommendations} 
            onSelectScheme={handleSchemeSelect}
            onBack={() => setCurrentScreen('profile')}
          />
        )}

        {currentScreen === 'detail' && (
          <SchemeDetail 
            schemeId={selectedSchemeId} 
            onBack={() => setCurrentScreen('recommendations')} 
          />
        )}

        {currentScreen === 'home' && (
          <section className="section-rule mt-2 bg-black text-white">
            <div className="grid gap-px md:grid-cols-3">
              {featureBlocks.map((feature, index) => (
                <div key={feature.label} className={`p-6 md:p-8 ${index === 1 ? 'editorial-inverted-grid' : ''}`}>
                  <p className="editorial-meta text-white/70">{feature.value}</p>
                  <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">{feature.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="section-rule mt-12 bg-white">
        <div className="page-frame flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
          <p className="editorial-meta">CivicAI</p>
          <p className="text-sm text-[color:var(--muted-foreground)]">Built for eligibility matching with a stark monochrome editorial system.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
