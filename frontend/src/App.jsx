import { useState } from 'react';
import './App.css';
import ProfileForm from './components/ProfileForm';
import Recommendations from './components/Recommendations';
import SchemeDetail from './components/SchemeDetail';

const workflowPanels = [
  {
    label: '01 / Share',
    title: 'Tell us the basics with confidence.',
    copy: 'We only ask for details that help us find benefits you may actually qualify for.',
  },
  {
    label: '02 / Review',
    title: 'See the best matches first.',
    copy: 'Your options are arranged clearly so the strongest opportunities are easy to spot.',
  },
  {
    label: '03 / Confirm',
    title: 'Open any scheme for the full picture.',
    copy: 'Each result includes clear next steps, documents, and helpful guidance if you need it.',
  },
];

const featureBlocks = [
  {
    value: 'Clear',
    label: 'simple, readable, and easy to trust',
  },
  {
    value: 'Helpful',
    label: 'friendly guidance at every step',
  },
  {
    value: 'Reliable',
    label: 'built to keep your search focused and calm',
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
            <span className="mt-2 block font-display text-2xl tracking-tighter md:text-3xl">Helpful benefits guidance</span>
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
                  <span className="block">That Fit You</span>
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-[color:var(--muted-foreground)] md:text-xl">
                  Share a few details, review your matches, and open any scheme for a clear explanation of the next step.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={goProfile} className="editorial-button">
                    Get Started
                  </button>
                  <button type="button" onClick={goProfile} className="editorial-button editorial-button--outline">
                    See My Matches
                  </button>
                </div>
              </section>

              <aside className="editorial-panel editorial-panel-inverse overflow-hidden">
                <div className="border-b border-white/20 p-6 md:p-8">
                  <p className="editorial-kicker text-white/70">How it works</p>
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
            <p className="editorial-kicker">Where You Are</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted-foreground)] md:text-base">
              Move back whenever you need to adjust your information, or continue to see more detail.
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
          <p className="text-sm text-[color:var(--muted-foreground)]">A calm, trustworthy way to check benefits and move forward with confidence.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
