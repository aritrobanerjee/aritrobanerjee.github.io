import React, { useState } from 'react';

interface ArchetypeData {
  id: string;
  number: string;
  title: string;
  tag: string;
  estimator: string;
  citations: string;
  mechanism: string;
  identifiabilityAssumption: string;
  fatalTrap: string;
  prePeriodRequirement: string;
  refutationTestName: string;
  refutationMetric: string;
  refutationNullRule: string;
  passStats: {
    statistic: string;
    pValue: string;
    status: 'PASSED' | 'FAILED';
    summary: string;
  };
  failStats: {
    statistic: string;
    pValue: string;
    status: 'PASSED' | 'FAILED';
    summary: string;
  };
}

const archetypes: ArchetypeData[] = [
  {
    id: 'universal-rollout',
    number: '01',
    title: '100% Platform Rollout',
    tag: 'Global Policy / Infra',
    estimator: 'Bayesian Structural Time Series (BSTS) / CausalImpact',
    citations: 'Brodersen et al. (2015)',
    mechanism: 'Platform-wide mandatory API deprecation, infra migration, or TOS update with zero untreated units.',
    identifiabilityAssumption: 'Strict exogeneity of control series (x_t ⟂ Intervention) + temporal state-space invariance across intervention date.',
    fatalTrap: 'Canary/opt-in testing suffers severe self-selection confounding: high-velocity teams migrate first, masking true infra latency.',
    prePeriodRequirement: 'T_pre ≥ 3 × T_post with at least 3 complete seasonal cycles (e.g., 28+ days for weekly seasonality).',
    refutationTestName: 'In-Time Placebo (Pseudo-Intervention Date)',
    refutationMetric: 'Cumulative effect at artificial midpoint t* = T_int / 2',
    refutationNullRule: 'p ≥ 0.05 required (95% credible interval must span 0)',
    passStats: {
      statistic: 'Δ_placebo = +0.04% [-0.8%, +0.9%]',
      pValue: 'p = 0.82',
      status: 'PASSED',
      summary: 'Pre-period baseline is stationary. Counterfactual projection is unconfounded by seasonal drift.',
    },
    failStats: {
      statistic: 'Δ_placebo = +4.12% [+2.1%, +6.2%]',
      pValue: 'p = 0.002',
      status: 'FAILED',
      summary: 'Spurious pre-period lift detected. Model is picking up unmodeled seasonality or simultaneous macro shocks.',
    },
  },
  {
    id: 'regional-panel',
    number: '02',
    title: 'Regional Panel (Uneven Trends)',
    tag: 'Staggered Markets',
    estimator: 'Synthetic Difference-in-Differences (SDID)',
    citations: 'Arkhangelsky, Athey, Hirshberg, Imbens, Wager (AER 2021)',
    mechanism: 'Staggered market rollouts across enterprise sales territories or DMAs with diverging baseline growth velocities.',
    identifiabilityAssumption: 'Latent factor linearity: unit weights (ω_i) and time weights (λ_t) recover parallel pre-trends without convex hull restriction.',
    fatalTrap: 'Standard DiD fails parallel trends due to disparate regional macro momentum; naive OLS yields false positives or blown standard errors.',
    prePeriodRequirement: 'Balanced panel with N_co ≥ 20–50 donor regions and T_pre ≥ 12–24 periods to avoid point-mass time weight collapse.',
    refutationTestName: 'Placebo in Space (Donor Permutation Test)',
    refutationMetric: 'Empirical rank of |τ_sdid| across all untreated donor units',
    refutationNullRule: 'p ≥ 0.05 required in pseudo-treatment permutations',
    passStats: {
      statistic: 'Rank: 1/48 donors | τ_sdid = +3.4%',
      pValue: 'p = 0.021 (Actual) / p_placebo = 0.74',
      status: 'PASSED',
      summary: 'Treatment effect sits in the extreme 2% tail of donor permutations. Estimated lift is genuine, not random regional drift.',
    },
    failStats: {
      statistic: 'Rank: 18/48 donors | τ_sdid = +1.1%',
      pValue: 'p = 0.38 (Actual)',
      status: 'FAILED',
      summary: 'Effect size is indistinguishable from untreated donor noise. 37% of untouched regions showed equal or larger swings.',
    },
  },
  {
    id: 'small-n-scm',
    number: '03',
    title: 'Small-N Market Holdout',
    tag: 'Enterprise Outliers',
    estimator: 'Synthetic Control Method (SCM)',
    citations: 'Abadie, Diamond, Hainmueller (JASA 2010); Abadie (JEL 2021)',
    mechanism: 'Targeted rollout in 1–3 large enterprise accounts or anchor cities, backed by an uncontaminated donor pool.',
    identifiabilityAssumption: 'Convex hull membership (treated unit lies within donor convex combination) + zero donor substitution/spillover.',
    fatalTrap: 'Extrapolating outside the donor convex hull causes severe interpolation bias. User-level splits inside enterprise accounts leak instantly.',
    prePeriodRequirement: 'T_0 ≥ 20–40 pre-intervention time slices; donor pool J ≥ 15–50 structurally comparable entities.',
    refutationTestName: 'Post-to-Pre MSPE Ratio Permutation (Fisherian Exact)',
    refutationMetric: 'r_j = MSPE_post / MSPE_pre across donor pool',
    refutationNullRule: 'Exact permutation p = rank / (J + 1) ≤ 0.05 (Inverted: Placebos must yield p_null ≥ 0.05)',
    passStats: {
      statistic: 'MSPE Ratio: 14.8x (Donor Max: 2.1x)',
      pValue: 'p = 0.024 (1/42 donors)',
      status: 'PASSED',
      summary: 'Pre-period tracking is airtight (MSPE_pre = 0.003). Post-period divergence is uniquely isolated to the treated account.',
    },
    failStats: {
      statistic: 'MSPE Ratio: 1.4x (Donor Max: 3.8x)',
      pValue: 'p = 0.45 (19/42 donors)',
      status: 'FAILED',
      summary: 'Synthetic counterfactual failed to track pre-period trajectory. Post-intervention gap is within donor variance envelope.',
    },
  },
  {
    id: 'connected-graph',
    number: '04',
    title: 'Connected Graph / Ecosystem',
    tag: 'Marketplace / Social',
    estimator: 'Graph Cluster Randomization & Stabilized Hájek Estimator',
    citations: 'Ugander et al. (KDD 2013); Aronow & Samii (2017)',
    mechanism: 'Two-sided marketplaces, shared agency networks, or developer ecosystems where direct treatment leaks to neighbors.',
    identifiabilityAssumption: 'Correct graph specification + k-hop neighborhood Markov interference + positivity overlap across exposure conditions (π_i(d) > 0).',
    fatalTrap: 'Naive Bernoulli A/B testing treats controls via neighbor exposure; control baseline rises artificially, suppressing measured lift.',
    prePeriodRequirement: 'Graph topology audit (conductance, modularity) + effective sample size N_eff = N / [1 + (m-1)ρ] based on intra-cluster correlation.',
    refutationTestName: 'Graph Boundary Edge Shuffling & Distant Negative Control',
    refutationMetric: 'Spillover estimate τ_spillover on rewired synthetic graph',
    refutationNullRule: 'p ≥ 0.05 required on rewired edges; τ_distant(k ≥ 3) = 0',
    passStats: {
      statistic: 'τ_spillover(rewired) = -0.02% | Distant k≥3 = +0.01%',
      pValue: 'p = 0.89 (Null Maintained)',
      status: 'PASSED',
      summary: 'Spillover vanishes on permuted network topologies. Treatment effect decomposes cleanly into direct vs indirect components.',
    },
    failStats: {
      statistic: 'τ_distant(k≥3) = +3.8% [Significant]',
      pValue: 'p = 0.008 (Rejection)',
      status: 'FAILED',
      summary: 'Spillover detected on nodes 3+ hops away. The assumed network graph is missing unobserved communication or business channels.',
    },
  },
  {
    id: 'switchback-temporal',
    number: '05',
    title: 'Dense Fast-Churn Spillover',
    tag: 'Auctions / Dispatch',
    estimator: 'Switchback (Time-Slice) Randomization + Newey-West HAC',
    citations: 'Bojinov, Simchi-Levi, Zhao (Oper. Res. 2023)',
    mechanism: 'Real-time dispatch, ad auctions, or delivery where local supply is finite and spatial boundaries leak instantly.',
    identifiabilityAssumption: 'Carryover dissipation within wash-out buffer b + system state recoverability (no permanent hysteresis) + stratified cycle stationarity.',
    fatalTrap: 'Naive user randomization creates supply cannibalization (treated users hog inventory). Standard OLS underestimates SEs by 200–500% due to autocorrelation.',
    prePeriodRequirement: 'Autocorrelation Function (ACF) to calculate market mixing time τ_mix; block length must satisfy Block Length ≫ 2 × τ_mix.',
    refutationTestName: 'Wash-Out Buffer Plateau & Lead-Treatment Placebo',
    refutationMetric: 'Lead effect coefficient β_lead (Future treatment predicting past outcome)',
    refutationNullRule: 'β_lead = 0 (p ≥ 0.05 required by causal arrow of time)',
    passStats: {
      statistic: 'β_lead = +0.03 | Buffer Plateau reached at b = 15m',
      pValue: 'p = 0.78 (Null Maintained)',
      status: 'PASSED',
      summary: 'Future treatment does not predict past outcomes. 15-minute wash-out buffer successfully extinguished carryover inertia.',
    },
    failStats: {
      statistic: 'β_lead = +2.45 [P < 0.01] | Carryover unbounded',
      pValue: 'p = 0.003 (Causality Inverted)',
      status: 'FAILED',
      summary: 'Future assignments predict current metrics. Wash-out window is too short; state hysteresis is bleeding between alternating blocks.',
    },
  },
];

export const TriageDiagnosticConsole: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('universal-rollout');
  const [refutationMode, setRefutationMode] = useState<'pass' | 'fail'>('pass');

  const current = archetypes.find((a) => a.id === activeId) || archetypes[0];
  const activeStats = refutationMode === 'pass' ? current.passStats : current.failStats;

  return (
    <div className="not-prose my-8 rounded-2xl border border-[#222226] bg-[#0c0c0e] p-4 md:p-6 shadow-2xl overflow-hidden font-sans">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1c1c20] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8e8e93]">
            Platform Causal Triage Console
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18181c] border border-[#27272a] text-zinc-400">
            Interactive Diagnostic Engine
          </span>
        </div>
        <div className="font-mono text-[11px] text-[#71717a]">
          Select an archetype to inspect topology & refutation diagnostics
        </div>
      </div>

      {/* Archetype Selector Tab Rail */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-4 pb-5">
        {archetypes.map((archetype) => {
          const isActive = archetype.id === activeId;
          return (
            <button
              key={archetype.id}
              onClick={() => setActiveId(archetype.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 select-none ${
                isActive
                  ? 'bg-[#18181d] border-[#3f3f46] text-white shadow-lg'
                  : 'bg-[#101013] border-[#1f1f23] text-[#a1a1aa] hover:bg-[#141418] hover:border-[#2e2e33] hover:text-[#d4d4d8]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-500">
                  {archetype.number}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                    isActive
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
                      : 'border-zinc-800 text-zinc-500 bg-zinc-900/40'
                  }`}
                >
                  {archetype.tag}
                </span>
              </div>
              <div className="mt-2 text-[12.5px] font-medium leading-tight">
                {archetype.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
        {/* Left Column: Interactive Structural Topology Canvas (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-[#1e1e23] bg-[#101013] p-4.5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1c1c20]">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-zinc-400">
                System Topology & Exposure Model
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                SVG Canvas
              </span>
            </div>

            {/* Topology SVG Renderers per Archetype */}
            <div className="relative h-56 w-full flex items-center justify-center my-3 bg-[#0a0a0c] rounded-lg border border-[#18181c] overflow-hidden p-2">
              {activeId === 'universal-rollout' && (
                <svg viewBox="0 0 320 180" className="w-full h-full">
                  <defs>
                    <linearGradient id="wedgeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="30" y1="150" x2="300" y2="150" stroke="#222" strokeWidth="1" />
                  <line x1="160" y1="20" x2="160" y2="150" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="165" y="32" fill="#f59e0b" fontSize="8.5" fontFamily="monospace">T_int (Rollout)</text>

                  {/* Pre-period actual line */}
                  <path d="M 40 120 Q 80 110, 110 95 T 160 85" fill="none" stroke="#94a3b8" strokeWidth="2" />
                  
                  {/* Counterfactual Projection Wedge (BSTS Credible Interval) */}
                  <path d="M 160 85 Q 210 80, 290 75 L 290 115 Q 210 100, 160 85 Z" fill="url(#wedgeGrad)" />
                  <path d="M 160 85 Q 210 90, 290 95" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="235" y="112" fill="#60a5fa" fontSize="8" fontFamily="monospace">Counterfactual ŷ^(0)</text>

                  {/* Post-period treated line */}
                  <path d="M 160 85 Q 200 60, 290 40" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  <text x="235" y="35" fill="#10b981" fontSize="8" fontFamily="monospace">Actual y_t (+Lift)</text>

                  {/* Labels */}
                  <text x="45" y="142" fill="#64748b" fontSize="8" fontFamily="monospace">T_pre (BSTS Training)</text>
                  <text x="190" y="142" fill="#64748b" fontSize="8" fontFamily="monospace">T_post (MCMC Inference)</text>
                </svg>
              )}

              {activeId === 'regional-panel' && (
                <svg viewBox="0 0 320 180" className="w-full h-full">
                  <line x1="30" y1="150" x2="300" y2="150" stroke="#222" strokeWidth="1" />
                  <line x1="160" y1="20" x2="160" y2="150" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="165" y="32" fill="#f59e0b" fontSize="8.5" fontFamily="monospace">T_post</text>

                  {/* Donor trajectory lines (raw unweighted) */}
                  <path d="M 40 140 Q 100 135, 160 130 T 290 120" fill="none" stroke="#27272a" strokeWidth="1" />
                  <path d="M 40 125 Q 100 115, 160 105 T 290 95" fill="none" stroke="#333338" strokeWidth="1" />
                  <path d="M 40 110 Q 100 95, 160 80 T 290 65" fill="none" stroke="#27272a" strokeWidth="1" />

                  {/* Synthetic Control Line (Reweighted parallel trend) */}
                  <path d="M 40 100 Q 100 85, 160 70" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
                  <path d="M 160 70 Q 220 55, 290 40" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
                  <text x="210" y="60" fill="#38bdf8" fontSize="8" fontFamily="monospace">SDID Reweighted Synth</text>

                  {/* Treated Territory Line */}
                  <path d="M 40 85 Q 100 70, 160 55" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  <path d="M 160 55 Q 220 30, 290 15" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  <text x="175" y="20" fill="#10b981" fontSize="8" fontFamily="monospace">Treated DMA Panel (Y_tr)</text>

                  {/* Weight badges */}
                  <text x="40" y="165" fill="#94a3b8" fontSize="8" fontFamily="monospace">Weights: Unit (ω_i) + Time (λ_t) Regularized</text>
                </svg>
              )}

              {activeId === 'small-n-scm' && (
                <svg viewBox="0 0 320 180" className="w-full h-full">
                  <line x1="30" y1="150" x2="300" y2="150" stroke="#222" strokeWidth="1" />
                  <line x1="170" y1="20" x2="170" y2="150" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
                  <text x="175" y="32" fill="#f59e0b" fontSize="8.5" fontFamily="monospace">T_0 (Intervention)</text>

                  {/* Donor Pool Cloud Points */}
                  <circle cx="60" cy="110" r="3.5" fill="#3f3f46" />
                  <circle cx="100" cy="125" r="3.5" fill="#3f3f46" />
                  <circle cx="130" cy="95" r="3.5" fill="#3f3f46" />
                  <circle cx="210" cy="105" r="3.5" fill="#3f3f46" />
                  <circle cx="260" cy="120" r="3.5" fill="#3f3f46" />
                  <text x="65" y="138" fill="#52525b" fontSize="7.5" fontFamily="monospace">Donor Pool J=42</text>

                  {/* Synthetic Convex Combination Line */}
                  <path d="M 40 100 Q 110 80, 170 70" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />
                  <path d="M 170 70 Q 230 65, 290 60" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="195" y="75" fill="#a855f7" fontSize="8" fontFamily="monospace">Synthetic Target ∑ W_j Y_j</text>

                  {/* Treated Enterprise Outlier */}
                  <path d="M 40 100 Q 110 80, 170 70" fill="none" stroke="#10b981" strokeWidth="2" />
                  <path d="M 170 70 Q 230 35, 290 15" fill="none" stroke="#10b981" strokeWidth="2.5" />
                  <text x="210" y="24" fill="#10b981" fontSize="8.5" fontFamily="monospace">Treated Unit Y_1t</text>

                  {/* Simplex Condition note */}
                  <text x="40" y="165" fill="#94a3b8" fontSize="8" fontFamily="monospace">Simplex: ∑ W_j = 1, W_j ≥ 0 (No Extrapolation)</text>
                </svg>
              )}

              {activeId === 'connected-graph' && (
                <svg viewBox="0 0 320 180" className="w-full h-full">
                  {/* Graph Edges */}
                  <line x1="80" y1="80" x2="140" y2="60" stroke="#3f3f46" strokeWidth="1.5" />
                  <line x1="140" y1="60" x2="190" y2="100" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 2" />
                  <line x1="140" y1="60" x2="110" y2="130" stroke="#3f3f46" strokeWidth="1.5" />
                  <line x1="190" y1="100" x2="250" y2="80" stroke="#3f3f46" strokeWidth="1.5" />
                  <line x1="190" y1="100" x2="240" y2="140" stroke="#3f3f46" strokeWidth="1.5" />
                  <line x1="250" y1="80" x2="290" y2="110" stroke="#27272a" strokeWidth="1" />

                  {/* Nodes */}
                  {/* Cluster A (Treated) */}
                  <circle cx="140" cy="60" r="16" fill="#15803d" stroke="#22c55e" strokeWidth="2" />
                  <text x="140" y="63" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Z=1</text>
                  <text x="140" y="38" fill="#4ade80" fontSize="7.5" textAnchor="middle" fontFamily="monospace">Direct Treated</text>

                  {/* Cluster B (Control but Spillover-Exposed) */}
                  <circle cx="190" cy="100" r="15" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                  <text x="190" y="103" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Z=0</text>
                  <text x="195" y="127" fill="#f87171" fontSize="7.5" textAnchor="middle" fontFamily="monospace">Spillover (0,1)</text>

                  {/* Pure Control Node */}
                  <circle cx="290" cy="110" r="13" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
                  <text x="290" y="113" fill="#a1a1aa" fontSize="7.5" textAnchor="middle" fontFamily="monospace">Z=0</text>
                  <text x="290" y="135" fill="#a1a1aa" fontSize="7" textAnchor="middle" fontFamily="monospace">Pure Control</text>

                  {/* Spillover Ripple Indicator */}
                  <text x="175" y="70" fill="#ef4444" fontSize="8" fontFamily="monospace">Leakage Edge</text>
                  <text x="40" y="165" fill="#94a3b8" fontSize="8" fontFamily="monospace">Stabilized Hájek Estimator: Normalizes Exposure π_i(d)</text>
                </svg>
              )}

              {activeId === 'switchback-temporal' && (
                <svg viewBox="0 0 320 180" className="w-full h-full">
                  <text x="30" y="25" fill="#a1a1aa" fontSize="8.5" fontFamily="monospace">Temporal Assignment Blocks (Time Slices):</text>

                  {/* Block A1 (Control) */}
                  <rect x="30" y="40" width="60" height="45" rx="4" fill="#1e1e24" stroke="#3f3f46" />
                  <text x="60" y="65" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">A (Ctrl)</text>

                  {/* Block B1 (Treated) with Washout */}
                  <rect x="95" y="40" width="65" height="45" rx="4" fill="#064e3b" stroke="#10b981" />
                  <rect x="95" y="40" width="16" height="45" rx="2" fill="#e11d48" opacity="0.4" />
                  <text x="135" y="65" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontFamily="monospace">B (Treat)</text>

                  {/* Block A2 (Control) with Washout */}
                  <rect x="165" y="40" width="65" height="45" rx="4" fill="#1e1e24" stroke="#3f3f46" />
                  <rect x="165" y="40" width="16" height="45" rx="2" fill="#e11d48" opacity="0.4" />
                  <text x="205" y="65" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">A (Ctrl)</text>

                  {/* Block B2 (Treated) */}
                  <rect x="235" y="40" width="60" height="45" rx="4" fill="#064e3b" stroke="#10b981" />
                  <rect x="235" y="40" width="16" height="45" rx="2" fill="#e11d48" opacity="0.4" />
                  <text x="270" y="65" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontFamily="monospace">B (Treat)</text>

                  {/* Wash-out Buffer Annotation */}
                  <line x1="103" y1="90" x2="103" y2="120" stroke="#f43f5e" strokeWidth="1.5" />
                  <text x="110" y="115" fill="#fb7185" fontSize="8" fontFamily="monospace">Wash-Out Buffer (b)</text>
                  <text x="110" y="125" fill="#94a3b8" fontSize="7" fontFamily="monospace">Discards carryover inertia</text>

                  <text x="30" y="165" fill="#94a3b8" fontSize="8" fontFamily="monospace">Variance: Must report Newey-West HAC (Handles Autocorrelation)</text>
                </svg>
              )}
            </div>
          </div>

          {/* Operational Pre-period Metric */}
          <div className="pt-3 border-t border-[#1c1c20] text-[11px] font-mono text-[#a1a1aa] space-y-1">
            <span className="text-[#71717a] block uppercase text-[9.5px]">Required Preflight Data:</span>
            <span className="text-[#ededed]">{current.prePeriodRequirement}</span>
          </div>
        </div>

        {/* Right Column: Architectural Inspector & Refutation Scorecard (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-[#1e1e23] bg-[#101013] p-4.5 space-y-4">
          {/* Method Specs & Theoretical Citations */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1c1c20]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] block">
                  Recommended Estimator
                </span>
                <span className="text-[13.5px] font-semibold text-white font-mono">
                  {current.estimator}
                </span>
              </div>
              <span className="text-[10.5px] font-mono text-zinc-400 bg-[#16161a] px-2 py-0.5 rounded border border-[#27272a]">
                {current.citations}
              </span>
            </div>

            {/* Core Identification Assumption */}
            <div className="mt-3 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8e8e93] block">
                Primary Identifiability Assumption to Defend:
              </span>
              <p className="text-[12.5px] text-[#ededed] leading-relaxed font-mono bg-[#141418] p-2.5 rounded-lg border border-[#222226]">
                {current.identifiabilityAssumption}
              </p>
            </div>

            {/* The Fatal A/B Trap */}
            <div className="mt-3 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                <span>⚠</span> The Fatal Trap Under Naive A/B Testing:
              </span>
              <p className="text-[12.5px] text-[#d4d4d8] leading-relaxed">
                {current.fatalTrap}
              </p>
            </div>
          </div>

          {/* The Refutation Telemetry Scorecard */}
          <div className="rounded-xl border border-[#242429] bg-[#0c0c0e] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#71717a] block">
                  Canonical Falsification Stress Test:
                </span>
                <span className="text-[12.5px] font-mono font-medium text-white">
                  {current.refutationTestName}
                </span>
              </div>

              {/* Simulation Mode Toggle (Pass vs Fail) */}
              <div className="flex items-center gap-1 bg-[#141418] p-0.5 rounded-lg border border-[#26262b]">
                <button
                  onClick={() => setRefutationMode('pass')}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                    refutationMode === 'pass'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Pass (Robust)
                </button>
                <button
                  onClick={() => setRefutationMode('fail')}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                    refutationMode === 'fail'
                      ? 'bg-rose-950/40 text-rose-300 border border-rose-500/40 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Fail (Collapse)
                </button>
              </div>
            </div>

            {/* Inverted P-Value Directionality Indicator */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#16161c] border border-[#232328] text-[10.5px] font-mono">
              <span className="text-zinc-400">Directionality Invariant:</span>
              <span className="text-amber-300 font-semibold">{current.refutationNullRule}</span>
            </div>

            {/* Telemetry Result Banner */}
            <div
              className={`p-3 rounded-lg border flex items-start justify-between gap-3 ${
                activeStats.status === 'PASSED'
                  ? 'bg-emerald-950/15 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="space-y-1">
                <div className="font-mono text-[11px] font-semibold flex items-center gap-2">
                  <span>{activeStats.statistic}</span>
                  <span className="text-zinc-400 font-normal">({activeStats.pValue})</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-[#d4d4d8]">
                  {activeStats.summary}
                </p>
              </div>

              <span
                className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-semibold tracking-wider ${
                  activeStats.status === 'PASSED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {activeStats.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation Note */}
      <div className="mt-4 pt-3 border-t border-[#1a1a1e] flex items-center justify-between text-[10.5px] font-mono text-[#71717a]">
        <span>Theoretical Foundation: Rubin Causal Model & Pearlian Structural SCMs</span>
        <span className="text-zinc-400">PyWhy / DoWhy Compliant Refutation Taxonomy</span>
      </div>
    </div>
  );
};
