import { useState } from 'react';
import { submitProfile } from '../api';

function Field({ label, hint, children }) {
  return (
    <label className="grid gap-2">
      <span className="editorial-meta">{label}</span>
      {children}
      {hint && <span className="text-xs leading-relaxed text-[color:var(--muted-foreground)]">{hint}</span>}
    </label>
  );
}

function ProfileForm({ onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    state: '',
    age: '',
    gender: '',
    category: '',
    income: '',
    education_level: '',
    disability_status: 'none',
    studying_or_working: 'studying'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formattedData = {
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null,
        income: formData.income ? parseInt(formData.income, 10) : null,
      };
      const recs = await submitProfile(formattedData);
      onSubmitSuccess(recs);
    } catch {
      setError("We couldn’t connect to the benefits service just now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-8 md:py-12">
      <div className="editorial-panel p-6 md:p-8 lg:p-10">
        <div className="flex flex-col gap-4 border-b border-black pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="editorial-kicker">Your Details</p>
            <h2 className="editorial-display mt-3 text-4xl md:text-5xl">Tell Us About You</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[color:var(--muted-foreground)]">
            Share the information that matters most so we can surface benefits that are actually worth your time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="State" hint="Use the state where you currently live or study.">
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="editorial-input"
                placeholder="e.g. Maharashtra"
              />
            </Field>

            <Field label="Age">
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="editorial-input"
                placeholder="e.g. 21"
              />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Gender">
              <select name="gender" value={formData.gender} onChange={handleChange} className="editorial-select">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="Category">
              <select name="category" value={formData.category} onChange={handleChange} className="editorial-select">
                <option value="">Select</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EBC">EBC</option>
                <option value="DNT">DNT</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Annual Family Income (₹)">
              <input
                type="number"
                name="income"
                value={formData.income}
                onChange={handleChange}
                className="editorial-input"
                placeholder="e.g. 250000"
              />
            </Field>

            <Field label="Education Level">
              <select name="education_level" value={formData.education_level} onChange={handleChange} className="editorial-select">
                <option value="">Select</option>
                <option value="high_school">High School (10th)</option>
                <option value="higher_secondary">Higher Secondary (12th)</option>
                <option value="diploma">Diploma</option>
                <option value="degree">Undergraduate Degree</option>
                <option value="post_graduate">Postgraduate</option>
                <option value="phd">PhD/M.Phil</option>
              </select>
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Disability Status">
              <select name="disability_status" value={formData.disability_status} onChange={handleChange} className="editorial-select">
                <option value="none">None</option>
                <option value="benchmark">Benchmark Disability</option>
              </select>
            </Field>

            <Field label="Current Status">
              <select name="studying_or_working" value={formData.studying_or_working} onChange={handleChange} className="editorial-select">
                <option value="studying">Studying</option>
                <option value="working">Working</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </Field>
          </div>

          {error && (
            <div className="editorial-panel editorial-panel-inverse p-4 text-sm leading-relaxed">
              {error}
            </div>
          )}

          <div className="pt-2 md:flex md:justify-end">
            <button type="submit" disabled={loading} className="editorial-button w-full md:w-auto">
              {loading ? 'Checking Options...' : 'Find My Matches'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;
