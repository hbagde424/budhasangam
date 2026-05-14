// components/forms/BiodataForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  "Personal Info",
  "Buddhist Profile",
  "Education & Career",
  "Family Background",
  "Lifestyle & Hobbies",
  "Partner Preferences",
];

const HOBBIES = [
  "📚 Reading","✈️ Traveling","🎵 Music","🎨 Art","⚽ Sports",
  "🍳 Cooking","🌱 Gardening","🧘 Meditation","🤝 Volunteering",
  "📷 Photography","🎬 Cinema","🏔️ Trekking","🌿 Nature",
];

export function BiodataForm({ initialData = {} }: { initialData?: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    // Personal
    fullName: "", dob: "", birthTime: "", birthPlace: "",
    heightCm: "", weightKg: "", bloodGroup: "", maritalStatus: "NEVER_MARRIED",
    haveChildren: false, childrenCount: 0, workLocation: "",
    // Buddhist
    buddhistTradition: "NAVAYANA", subTradition: "", dhammaName: "",
    refugeTaken: false, refugeYear: "", meditationPractice: "NONE",
    meditationLevel: "BEGINNER", dailyPractice: false, vipassanaCourse: "NONE",
    alcoholConsumption: "NEVER", smokingConsumption: "NEVER", templeAffiliation: "",
    // Education
    education: "", occupation: "", company: "", annualIncome: "",
    employmentType: "PRIVATE", willingToRelocate: false,
    // Family
    fatherName: "", fatherOccupation: "", motherName: "", motherOccupation: "",
    brothersCount: 0, brothersMarried: 0, sistersCount: 0, sistersMarried: 0,
    familyType: "NUCLEAR", familyValues: "MODERATE", familyLocation: "", familyIncome: "",
    // Lifestyle
    diet: "VEGETARIAN", exerciseHabit: "", hobbies: [] as string[],
    motherTongue: "", aboutMe: "", partnerExpectation: "",
    // Preferences
    partnerPreferences: {
      minAge: 24, maxAge: 34, tradition: "ANY", diet: "NO_PREFERENCE",
      locationPreference: "ANYWHERE", minEducation: "GRADUATE",
      horoscopeRequired: false,
    },
    ...initialData,
  });

  const update = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const pct = Math.round((step / STEPS.length) * 100);

  const toggleHobby = (h: string) => {
    setForm((p: any) => ({
      ...p,
      hobbies: p.hobbies.includes(h) ? p.hobbies.filter((x: string) => x !== h) : [...p.hobbies, h],
    }));
  };

  const save = async (final = false) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: form }),
      });
      const data = await res.json();
      if (data.success && final) router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const LabelEl = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-bold text-mahogany-mid mb-2 uppercase tracking-wide">{children}</label>
  );
  const SelectEl = ({ field, opts, placeholder = "Select" }: { field: string; opts: [string, string][]; placeholder?: string }) => (
    <select className="input-field"
      value={(form as any)[field] ?? ""}
      onChange={e => update(field, e.target.value)}>
      <option value="">{placeholder}</option>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
  const InputEl = ({ field, ...props }: { field: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <input className="input-field" value={(form as any)[field] ?? ""}
      onChange={e => update(field, e.target.value)} {...props} />
  );

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Left sidebar */}
      <div className="w-64 bg-gradient-to-b from-mahogany to-mahogany-mid p-8 flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-saffron/25 rounded-xl flex items-center justify-center text-xl">☸</div>
          <span className="font-serif text-xl font-bold text-white">BuddhaSangam</span>
        </div>
        <h2 className="font-serif text-xl font-semibold text-white mb-2">Complete Your Biodata</h2>
        <p className="text-xs text-white/50 leading-relaxed mb-8">Complete profiles get 3× more connections</p>

        <div className="space-y-1 flex-1">
          {STEPS.map((label, i) => (
            <button key={i} type="button"
              onClick={() => i < step - 1 && setStep(i + 1)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                ${step === i + 1 ? "bg-saffron/15" : "hover:bg-white/5"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                ${step > i + 1 ? "bg-jade text-white" : step === i + 1 ? "bg-saffron text-white ring-4 ring-saffron/25" : "bg-white/10 text-white/40"}`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-medium transition-colors
                ${step === i + 1 ? "text-saffron font-bold" : step > i + 1 ? "text-white/80" : "text-white/35"}`}>
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Completion</span><span className="text-saffron font-bold">{pct}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-saffron to-lotus-gold rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 overflow-y-auto p-10">
        <div className="max-w-2xl">
          <div className="mb-8">
            <p className="text-xs text-saffron font-bold uppercase tracking-widest mb-2">Step {step} of {STEPS.length}</p>
            <h1 className="font-serif text-4xl font-semibold text-mahogany mb-2">{STEPS[step - 1]}</h1>
            <p className="text-muted-foreground text-sm">
              {["Your basic personal information","Your spiritual journey and practice","Education and professional life","Family background and values","Daily lifestyle and interests","What you are looking for in a partner"][step - 1]}
            </p>
          </div>

          {/* STEP 1 - Personal */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div><LabelEl>Full Name *</LabelEl><InputEl field="fullName" placeholder="As per documents" /></div>
                <div><LabelEl>Date of Birth *</LabelEl><InputEl field="dob" type="date" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><LabelEl>Height</LabelEl>
                  <SelectEl field="heightCm" opts={Array.from({length:31},(_,i)=>[String(150+i*2),`${150+i*2} cm`] as [string,string])} />
                </div>
                <div><LabelEl>Weight</LabelEl>
                  <SelectEl field="weightKg" opts={Array.from({length:41},(_,i)=>[String(40+i*2),`${40+i*2} kg`] as [string,string])} />
                </div>
                <div><LabelEl>Blood Group</LabelEl>
                  <SelectEl field="bloodGroup" opts={["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=>[b,b] as [string,string])} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div><LabelEl>Marital Status *</LabelEl>
                  <SelectEl field="maritalStatus" opts={[["NEVER_MARRIED","Never Married"],["DIVORCED","Divorced"],["WIDOWED","Widowed"],["ANNULLED","Annulled"]]} />
                </div>
                <div><LabelEl>Current City *</LabelEl><InputEl field="workLocation" placeholder="e.g. Nagpur, Maharashtra" /></div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div><LabelEl>Birth Time (Optional)</LabelEl><InputEl field="birthTime" type="time" /></div>
                <div><LabelEl>Birth Place (Optional)</LabelEl><InputEl field="birthPlace" placeholder="City of birth" /></div>
              </div>
            </div>
          )}

          {/* STEP 2 - Buddhist */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <LabelEl>Buddhist Tradition *</LabelEl>
                <div className="grid grid-cols-5 gap-2">
                  {[["THERAVADA","Theravada"],["MAHAYANA","Mahayana"],["VAJRAYANA","Vajrayana"],["NAVAYANA","Navayana"],["OTHER","Other"]].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => update("buddhistTradition", v)}
                      className={`py-3 px-2 rounded-xl border-2 text-xs font-bold text-center transition-all
                        ${form.buddhistTradition === v ? "border-saffron bg-saffron/8 text-saffron" : "border-ivory-dark text-mahogany-mid hover:border-saffron/40"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div><LabelEl>Meditation Practice</LabelEl>
                  <SelectEl field="meditationPractice" opts={[["VIPASSANA","Vipassana"],["SAMATHA","Samatha"],["METTA","Metta"],["ZEN","Zen"],["OTHER","Other"],["NONE","None"]]} />
                </div>
                <div><LabelEl>Experience Level</LabelEl>
                  <SelectEl field="meditationLevel" opts={[["BEGINNER","Beginner"],["INTERMEDIATE","Intermediate"],["ADVANCED","Advanced"],["TEACHER","Teacher"]]} />
                </div>
                <div><LabelEl>Vipassana Course</LabelEl>
                  <SelectEl field="vipassanaCourse" opts={[["NONE","None"],["TEN_DAY","10-day course"],["TWENTY_DAY","20-day course"],["THIRTY_DAY","30-day course"],["SERVED","Served as Server"]]} />
                </div>
                <div><LabelEl>Refuge Taken</LabelEl>
                  <SelectEl field="refugeTaken" opts={[["false","No"],["true","Yes"]]} />
                </div>
              </div>
              <div><LabelEl>Dhamma Name (Optional)</LabelEl>
                <InputEl field="dhammaName" placeholder="If you have taken refuge" />
              </div>
              <div><LabelEl>Temple / Vihara Affiliation</LabelEl>
                <InputEl field="templeAffiliation" placeholder="Name and city (optional)" />
              </div>
            </div>
          )}

          {/* STEP 3 - Education */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div><LabelEl>Highest Education *</LabelEl>
                  <SelectEl field="education" opts={[["10TH","10th"],["12TH","12th"],["DIPLOMA","Diploma"],["GRADUATE","Graduate"],["POSTGRADUATE","Postgraduate"],["DOCTORATE","Doctorate / PhD"]]} />
                </div>
                <div><LabelEl>College / University</LabelEl><InputEl field="college" placeholder="Institution name" /></div>
                <div><LabelEl>Occupation *</LabelEl><InputEl field="occupation" placeholder="e.g. Software Engineer" /></div>
                <div><LabelEl>Company</LabelEl><InputEl field="company" placeholder="e.g. TCS, DRDO" /></div>
                <div><LabelEl>Employment Type *</LabelEl>
                  <SelectEl field="employmentType" opts={[["GOVERNMENT","Government"],["PRIVATE","Private Sector"],["BUSINESS","Business"],["FREELANCE","Freelance"],["SELF_EMPLOYED","Self-employed"],["STUDENT","Student"],["HOMEMAKER","Homemaker"],["NOT_WORKING","Not working"]]} />
                </div>
                <div><LabelEl>Annual Income</LabelEl>
                  <SelectEl field="annualIncome" opts={[["0-3L","Up to ₹3 LPA"],["3-6L","₹3–6 LPA"],["6-10L","₹6–10 LPA"],["10-15L","₹10–15 LPA"],["15-25L","₹15–25 LPA"],["25L+","₹25 LPA+"]]} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div><LabelEl>Work Location</LabelEl><InputEl field="workLocation" placeholder="City" /></div>
                <div><LabelEl>Willing to Relocate?</LabelEl>
                  <SelectEl field="willingToRelocate" opts={[["true","Yes"],["false","No"],["discuss","After marriage, discuss"]]} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 - Family */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div><LabelEl>Father's Name</LabelEl><InputEl field="fatherName" placeholder="Full name" /></div>
                <div><LabelEl>Father's Occupation</LabelEl><InputEl field="fatherOccupation" placeholder="e.g. Retired Govt. Officer" /></div>
                <div><LabelEl>Mother's Name</LabelEl><InputEl field="motherName" placeholder="Full name" /></div>
                <div><LabelEl>Mother's Occupation</LabelEl><InputEl field="motherOccupation" placeholder="If working (optional)" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><LabelEl>Brothers</LabelEl>
                  <SelectEl field="brothersCount" opts={["0","1","2","3","4+"].map(n=>[n,n] as [string,string])} />
                </div>
                <div><LabelEl>Brothers Married</LabelEl>
                  <SelectEl field="brothersMarried" opts={["0","1","2","3","All"].map(n=>[n,n] as [string,string])} />
                </div>
                <div><LabelEl>Sisters</LabelEl>
                  <SelectEl field="sistersCount" opts={["0","1","2","3","4+"].map(n=>[n,n] as [string,string])} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><LabelEl>Family Type</LabelEl>
                  <SelectEl field="familyType" opts={[["NUCLEAR","Nuclear"],["JOINT","Joint"],["EXTENDED","Extended"]]} />
                </div>
                <div><LabelEl>Family Values</LabelEl>
                  <SelectEl field="familyValues" opts={[["TRADITIONAL","Traditional"],["MODERATE","Moderate"],["LIBERAL","Liberal"]]} />
                </div>
                <div><LabelEl>Family Location</LabelEl><InputEl field="familyLocation" placeholder="City, State" /></div>
              </div>
            </div>
          )}

          {/* STEP 5 - Lifestyle */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div><LabelEl>Diet *</LabelEl>
                  <SelectEl field="diet" opts={[["VEGETARIAN","Vegetarian"],["VEGAN","Vegan"],["EGGETARIAN","Eggetarian"],["NON_VEGETARIAN","Non-vegetarian"],["ONLY_SEAFOOD","Only Seafood"]]} />
                </div>
                <div><LabelEl>Alcohol</LabelEl>
                  <SelectEl field="alcoholConsumption" opts={[["NEVER","Never"],["OCCASIONALLY","Occasionally"],["SOCIALLY","Socially"],["REGULARLY","Regularly"]]} />
                </div>
                <div><LabelEl>Smoking</LabelEl>
                  <SelectEl field="smokingConsumption" opts={[["NEVER","Never"],["OCCASIONALLY","Occasionally"],["REGULARLY","Regularly"]]} />
                </div>
              </div>
              <div><LabelEl>Mother Tongue *</LabelEl>
                <SelectEl field="motherTongue" opts={[["Marathi","Marathi"],["Hindi","Hindi"],["Tamil","Tamil"],["Bengali","Bengali"],["Telugu","Telugu"],["Sinhala","Sinhala"],["Burmese","Burmese"],["Thai","Thai"],["Tibetan","Tibetan"],["English","English"],["Other","Other"]]} />
              </div>
              <div>
                <LabelEl>Hobbies & Interests</LabelEl>
                <div className="flex flex-wrap gap-2">
                  {HOBBIES.map(h => (
                    <button key={h} type="button" onClick={() => toggleHobby(h)}
                      className={`filter-chip text-sm ${form.hobbies.includes(h) ? "active" : ""}`}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <LabelEl>About Me *</LabelEl>
                <textarea className="input-field min-h-[120px]"
                  placeholder="Write 200–500 words about your personality, values, Dhamma practice, and what you're looking for..."
                  value={form.aboutMe} onChange={e => update("aboutMe", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1 text-right">{form.aboutMe?.length ?? 0} / 1000</p>
              </div>
            </div>
          )}

          {/* STEP 6 - Preferences */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div><LabelEl>Partner Min Age</LabelEl>
                  <SelectEl field="partnerPreferences.minAge"
                    opts={Array.from({length:20},(_,i)=>[(21+i).toString(),`${21+i} years`] as [string,string])} />
                </div>
                <div><LabelEl>Partner Max Age</LabelEl>
                  <SelectEl field="partnerPreferences.maxAge"
                    opts={Array.from({length:20},(_,i)=>[(25+i).toString(),`${25+i} years`] as [string,string])} />
                </div>
                <div><LabelEl>Tradition Preference</LabelEl>
                  <SelectEl field="partnerPreferences.tradition"
                    opts={[["ANY","Any Buddhist"],["SAME","Same as mine"],["THERAVADA","Theravada"],["MAHAYANA","Mahayana"],["VAJRAYANA","Vajrayana"],["NAVAYANA","Navayana"]]} />
                </div>
                <div><LabelEl>Diet Preference</LabelEl>
                  <SelectEl field="partnerPreferences.diet"
                    opts={[["NO_PREFERENCE","No Preference"],["VEGETARIAN_ONLY","Vegetarian Only"],["VEGAN_PREFERRED","Vegan Preferred"]]} />
                </div>
                <div><LabelEl>Min Education</LabelEl>
                  <SelectEl field="partnerPreferences.minEducation"
                    opts={[["ANY","No Preference"],["GRADUATE","Graduate+"],["POSTGRADUATE","Postgraduate+"],["DOCTORATE","Doctorate"]]} />
                </div>
                <div><LabelEl>Location Preference</LabelEl>
                  <SelectEl field="partnerPreferences.locationPreference"
                    opts={[["ANYWHERE","Anywhere in India"],["SAME_CITY","Same City"],["SAME_STATE","Same State"],["ABROAD","Abroad Considered"]]} />
                </div>
                <div><LabelEl>Living After Marriage</LabelEl>
                  <SelectEl field="partnerPreferences.livingPreference"
                    opts={[["DOESNT_MATTER","Doesn't Matter"],["WITH_FAMILY","With Family"],["NUCLEAR","Nuclear Family"],["INDEPENDENT","Independent"]]} />
                </div>
                <div><LabelEl>Horoscope Required?</LabelEl>
                  <SelectEl field="partnerPreferences.horoscopeRequired"
                    opts={[["false","No — not required"],["true","Yes — must match"],["open","Open to discussing"]]} />
                </div>
              </div>
              <div className="bg-jade/6 border border-jade/20 rounded-2xl p-5">
                <div className="flex gap-3">
                  <span className="text-xl mt-0.5">☸</span>
                  <div>
                    <p className="font-serif text-base font-bold text-jade mb-1">Dhamma Reminder</p>
                    <p className="text-sm text-mahogany-mid leading-relaxed">
                      Many of our most successful matches came from those who kept preferences broad
                      and focused on shared values over specific criteria. An open heart finds better companions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-10">
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)}
                className="btn-outline-saffron px-8 py-3 text-sm">
                ← Previous
              </button>
            )}
            <button type="button" disabled={saving}
              onClick={() => {
                save(false);
                step < STEPS.length ? setStep(s => s + 1) : save(true);
              }}
              className="btn-saffron flex-1 py-3 text-sm">
              {saving ? "Saving..." : step === STEPS.length ? "Save & Go to Dashboard →" : `Continue to ${STEPS[step]} →`}
            </button>
          </div>
          <p className="text-center mt-3 text-xs text-muted-foreground">Progress is saved automatically</p>
        </div>
      </div>
    </div>
  );
}
