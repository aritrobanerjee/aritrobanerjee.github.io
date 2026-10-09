# How to Measure What Can't Be Tested

*A first-principles guide to causal inference, SUTVA violations, and quasi-experimentation when A/B tests fail in platform ecosystems.*

> **Status: Work in Progress [WIP]**  
> *Drafting thesis, core principles, and operational case studies from developer platforms and distributed systems.*

---

## Part I // The Invisible Failure

I've sat in a lot of product reviews where someone pulls up an A/B test dashboard, points at a green p-value badge, and says "ship it." And most of the time, that's fine. If you're testing a new onboarding flow or a button placement on a consumer website, a coin flip works.

But over the past decade, working across enterprise data systems at Deloitte, global commercialization and measurement at Google, and developer platform APIs, the systems I've worked on don't behave like isolated landing pages.

Take a classic example that happens constantly in B2B and commercial tech: you want to roll out a new lead-scoring model that auto-prioritizes accounts for your sales team. The obvious PM intuition is: *"Let's just split our customer accounts 50/50. Give half to the new model and keep the other half on the old workflow."*

It sounds reasonable. In reality, it completely blows up the statistical assumptions:

* **Rep behavioral leakage:** An Account Executive or sales pod manages 20 accounts. If you enable the model on 10, the rep doesn't develop amnesia when talking to the other 10. The sharper discovery prompts, deal structures, and collateral leak into every conversation. Control gets treated by osmosis.
* **Portfolio budget cannibalization:** Enterprise clients operate with fixed quarterly budgets. If the model helps close an aggressive upsell on Brand A (treatment), the client frequently funds it by pulling unspent budget from Brand B (control). Your dashboard shows a massive green lift on treatment and a mysterious drop on control; you didn't create new net revenue, you just shifted dollars inside the same customer balance sheet.
* **Shared agency networks:** Major accounts share the same media holding companies, buying desks, or procurement teams. The moment an agency sees what works on one account, they port the playbook across their entire portfolio.

The A/B test tells you the new workflow drove a +25% lift. When you roll it out to 100% of accounts, the net revenue only moves +2%. The rest was cannibalization and spillover you accidentally manufactured by running a naive test.

It kept happening. Every project, same trap. And none of the PM resources I was reading (the Lenny's Newsletters, the Reforge courses, the interview prep guides) even acknowledged it. They teach you A/B testing as if SUTVA violations don't exist. (SUTVA is the statistical assumption that what happens to one unit doesn't affect another. In connected account networks and platforms, it is almost always violated.)

So I started digging into how economists handle this, because they've been dealing with it for decades. You can't randomly assign a minimum wage hike to half the restaurants in a city without labor spillovers. They had to invent entirely different methods.

### The Mathematical Boundary: Pearl's "Ladder of Causation"

Why can't we just solve this with bigger datasets, better regressions, or modern AI?

Because of a hard mathematical impossibility theorem. Turing Award winner Judea Pearl proved that causal reasoning is divided into three distinct epistemic tiers: the **Ladder of Causation**:

| Tier | Operation & Question | What It Answers | Technical Mechanism |
| :--- | :--- | :--- | :--- |
| **Rung 1: Association** | `P(Y \| X)`<br>*“Seeing”* | *“What happens when I observe X?”* | Statistical correlation, regression, pattern matching. This is what modern deep learning and LLMs do. |
| **Rung 2: Intervention** | `P(Y \| do(X))`<br>*“Doing”* | *“What happens to Y if I actively force X to change?”* | Randomized Controlled Trials (A/B testing) and physical policy interventions. |
| **Rung 3: Counterfactuals** | `P(Y_{X=1} \| X=0, Y=y)`<br>*“Imagining”* | *“Given that we chose X=0 and saw outcome Y, what would have happened if we had chosen X=1?”* | Structural Causal Models (SCMs), Synthetic Controls, and retrospective causal inference. |

> **The Mathematical Law:**  
> You **cannot compute Rung 2 or Rung 3 quantities solely from Rung 1 data** without introducing external, untestable structural assumptions (a causal graph / DAG) or physically perturbing the world.  
>  
> No amount of transformer parameters can bridge this gap mathematically.

This mathematical reality defines the central dilemma of platform measurement:
* **Rung 1 (Passive Analytics)** is cheap, but can never prove incremental causality or business ROI.
* **Rung 2 (Standard A/B Testing)** physically forces an intervention, but instantly collapses when network spillovers, budget cannibalization, or shared ecosystem context violate unit independence (SUTVA).
* **Rung 3 (Counterfactual Quasi-Experiments)** is the only remaining path: using econometrically grounded structural assumptions to reconstruct the unobserved counterfactual.

---

## Part II // Where A/B Testing Breaks

### Three Ways Real Systems Break Your A/B Test

SUTVA requires two things: *no interference between units*, and *no hidden variations of the treatment*. In platform ecosystems and commercial enterprise workflows, both collapse instantly:

| Failure Mode | Mechanism | Platform / Enterprise Impact |
|:---|:---|:---|
| **01. Rep & Org Spillover** | Human workflows cannot be cleanly partitioned | When a commercial pod learns an optimization on treated accounts, that operational knowledge instantly bleeds into control accounts. |
| **02. Budget Cannibalization** | Enterprise spend is zero-sum within fiscal quarters | If treatment drives higher spend on one account or channel, the client reallocates spend away from control, creating artificial negative lift. |
| **03. Shared Ecosystem Context** | Structural dependencies synchronize behavior | Shared media holding companies, procurement teams, or third-party SDK dependencies synchronize behavior across account clusters, violating unit independence. |

When any of these apply, your p-value is worse than useless: it gives leadership false confidence in an illusion.

---

## Part III // The Part Nobody Warns You About

### Your Experiment Was Dead Before You Launched It

Here's what happened on a project I worked on. We spent quarters building a lead-scoring model that would auto-prioritize accounts and generate outbound sequences for our commercial sales teams. The expected causal revenue lift was around +1.5%. We couldn't run a simple user-level A/B test because account reps share territories, clients cross geographic lines, and sales enablement leaks across regional teams. So we set up a market-level cluster experiment: rolled out the model in a subset of regional markets, and held others back as controls.

Six weeks later: null result. No statistically significant lift detected.

Within an hour, the email thread started. *"So the model doesn't work?"* From someone who wasn't in the room when we scoped it. Leadership quietly deprioritized the next phase.

But the motion *did* work. The productivity gains were real. What went wrong was the experiment design. When you go from randomizing millions of individual users to randomizing a couple hundred sales territories or geographic clusters, your sample size drops by orders of magnitude. The smallest lift you can reliably detect (the Minimum Detectable Effect, or MDE) jumps from ~0.1% to somewhere around 4-8%.

We were trying to detect a +1.5% lift with a test design that was mathematically blind to anything under +6%. It was like trying to read a street sign with binoculars that only focus past a mile.

| Test Design | Sample Size ($N$) | Minimum Detectable Lift |
| :--- | :--- | :--- |
| **User-Level A/B Test** | ~50,000,000 users | Can detect lifts as small as **~0.1%** |
| **Geo-Cluster Experiment** | ~200 markets / clusters | Can only detect lifts above **~4–8%** |

> **The Square-Root Law of Cluster Power:**  
> The minimum detectable effect scales inversely with the square root of your cluster count:  
> `MDE ∝ σ / √N_clusters`  
> When $N$ collapses from 50,000,000 users to 200 DMAs, your denominator shrinks by a factor of 500, exploding your minimum detectable threshold.  
> *(In practice, Synthetic Control MDE also depends on how well the control tracks your treatment unit during the pre-treatment window and the planned test duration. Better fit and longer tests let you detect smaller effects.)*

---

## Part IV // A Practical Triage Framework

When a simple 50/50 A/B split is off the table, what do you actually do?

In traditional randomized trials (Pearl's Rung 2), physical randomization guarantees identification in expectation. But when platform ecosystems violate unit independence, **identification becomes an untestable structural assumption**. You are forced into Pearl's Rung 3: reconstructing the unobserved counterfactual using domain structure and quasi-experimental econometrics.

Over the years, across developer ecosystems, enterprise sales networks, and global commercial platforms, I've found that almost every "un-testable" platform problem maps to one of five structural archetypes.

```triage-console
Platform Causal Triage Console
```

### The Platform Measurement Decision Matrix

| Archetype | Mechanism | Recommended Method | Primary Assumption to Defend |
| :--- | :--- | :--- | :--- |
| **01. 100% Platform Rollout** | Universal policy, breaking API update, or global infrastructure shift with zero unexposed units | **Interrupted Time Series (ITS) / CausalImpact (BSTS)** | **Strict Exogeneity of Control Series:** Regressors ($x_t \perp \text{Intervention}$) are untouched; system transition dynamics are invariant across the rollout date. |
| **02. Regional Panel (Uneven Trends)** | Staggered market rollouts across sales territories or DMAs with diverging baseline growth velocities | **Synthetic Difference-in-Differences (SDID)** | **Latent Factor Linearity:** Unit weights ($\hat{\omega}_i$) and time weights ($\hat{\lambda}_t$) recover parallel trends even when units grow at unequal baseline speeds. |
| **03. Small-$N$ Market Holdout** | Targeted rollout in 1–3 large enterprise accounts or anchor cities, backed by an uncontaminated donor pool | **Synthetic Control Method (SCM)** | **Convex Hull Support:** Treated unit lies within the convex combination of donors ($\sum W_j = 1, W_j \ge 0$); zero spillover or substitution across donor units. |
| **04. Connected Graph / Ecosystem** | Two-sided marketplaces, shared agency networks, or developer ecosystems where direct treatment leaks to peers | **Graph Cluster Randomization & Stabilized Hájek Estimator** | **$k$-Hop Markov Interference:** Spillover is strictly bounded within the observed graph topology; positive exposure overlap ($\pi_i(d) > 0$). |
| **05. Dense Fast-Churn Spillover** | Real-time dispatch, ad auctions, or delivery where local supply is finite and spatial boundaries leak instantly | **Switchback Randomization + Newey-West HAC** | **Finite Carryover Dissipation:** State perturbations dissipate within the wash-out buffer ($b$); no permanent marketplace hysteresis. |

---

### The Field Guide: PM Cheat Sheet by Archetype

#### 01. 100% Platform Rollouts (Mandatory Policy & Global Infra)
* **When to Pick It:** You are shipping a non-optional platform change (e.g., deprecated API migration, global database upgrade, terms of service update) where withholding a control group is commercially or technically impossible.
* **Required Data History:** $T_{\text{pre}} \ge 3 \times T_{\text{post}}$, capturing at least 3 full cycles of the lowest-frequency seasonal component (e.g., $\ge 28$ days for weekly cycles, $\ge 12$ months if holiday seasonality exists).
* **The Exact Refutation Test:** **In-Time Placebo (Pseudo-Intervention Date)**. Split your pre-period at $t^* = T_{\text{int}} / 2$, train the model on $t < t^*$, and predict $[t^*, T_{\text{int}})$. If the estimated placebo effect is non-zero ($p < 0.05$), your model is hallucinating trend drift as treatment effect.

#### 02. Regional Panels with Uneven Trends (Sales Territories & DMAs)
* **When to Pick It:** You are rolling out market-by-market across regional territories (e.g., West Coast vs. Midwest), but baseline growth rates diverge significantly. Classical DiD fails because the parallel trends assumption collapses; classical SCM fails because treated regions fall outside the convex hull of donor pools. Synthetic DiD unifies both by reweighting units ($\hat{\omega}_i$) and time slices ($\hat{\lambda}_t$) with $L_2$ regularization.
* **Required Data History:** A balanced panel across $N_{\text{co}} \ge 20–50$ donor regions and $T_{\text{pre}} \ge 12–24$ reporting periods.
* **The Exact Refutation Test:** **Placebo in Space (Donor Permutation Null Distribution)**. Assign pseudo-treatment status to every untreated donor region and re-estimate $\hat{\tau}_j^{\text{sdid}}$. The actual treatment estimate must land in the extreme tail ($p \le 0.05$) of the empirical donor distribution.

#### 03. Small-$N$ Market Holdouts (Enterprise Outliers & Key Accounts)
* **When to Pick It:** You are deploying a high-touch motion across 1–3 anchor accounts or metro areas with an abundant donor pool of comparable units. SCM constructs a synthetic clone from an unweighted convex combination ($\sum W_j = 1, W_j \ge 0$).
* **Required Data History:** $T_0 \ge 20–40$ pre-intervention intervals to prevent donor overfitting, with a donor pool $J \ge 15–50$.
* **The Exact Refutation Test:** **Post-to-Pre MSPE Ratio Permutation (Fisherian Exact)**. Calculate the ratio of post-intervention Mean Squared Prediction Error to pre-intervention MSPE across every donor unit: $r_j = \text{MSPE}_{\text{post}, j} / \text{MSPE}_{\text{pre}, j}$. If untouched donors exhibit similar or larger MSPE spikes, your post-rollout divergence is noise, not causal lift.

#### 04. Connected Graphs & Ecosystems (Marketplaces & Shared Agencies)
* **When to Pick It:** Direct treatment bleeds into neighboring nodes via shared account reps, media holding agencies, or marketplace supply. Instead of naive Bernoulli splits, partition the graph using community detection (e.g., modularity-based graph clustering) and map exposure states ($D_i \in \{\text{Direct Only}, \text{Direct + Spillover}, \text{Spillover Only}, \text{Pure Control}\}$). Use the stabilized **Hájek estimator** to prevent extreme weight variance.
* **Required Data History:** Pre-intervention network topology audit (degree distribution, conductance) and intra-cluster correlation ($\rho$) to compute effective sample size: $N_{\text{eff}} = N / [1 + (m-1)\rho]$.
* **The Exact Refutation Test:** **Graph Boundary Edge Shuffling & Negative Control Nodes**. Randomly rewire cross-cluster edges while preserving degree distributions; verify that estimated spillover effects vanish on synthetic randomized graphs. Additionally, confirm that nodes at graph distance $k \ge 3$ show zero effect.

#### 05. Dense Fast-Churn Spillovers (Auctions, Dispatch, & Real-Time Supply)
* **When to Pick It:** High-frequency, closed-loop systems (e.g., driver dispatch, ad auctions, local logistics) where units compete for shared real-time capacity. Spatial holdouts leak instantly. The solution is time-slice randomization (Switchback: alternating treatment and control across temporal windows) with explicit **wash-out buffers** ($b$) discarded at the start of each switch to extinguish carryover inertia.
* **Required Data History:** Autocorrelation Function (ACF) analysis of pre-period clearance metrics to compute marketplace mixing time ($\tau_{\text{mix}}$). Assignment blocks must satisfy $\text{Block Length} \gg 2 \times \tau_{\text{mix}}$.
* **The Exact Refutation Test:** **Lead-Treatment Placebo & Buffer Plateau Diagnostics**. Regress current outcomes on future treatment assignments ($W_{t+1}$). Because future policies cannot retroactively cause past outcomes, $\beta_{\text{lead}} = 0$ is required ($p \ge 0.05$). Standard errors must be computed via **Newey-West HAC** to prevent 200–500% variance underestimation from serial correlation.

---

### The Unspoken Rule: Identification is Just a Hypothesis

Notice the common denominator across all five archetypes:

Not a single one relies on standard statistical significance ($p < 0.05$) to prove validity. Instead, every single quasi-experimental design **lives or dies on falsification tests**. In quasi-experiments, the statistical test is inverted: **retaining the null ($p \ge 0.05$) in a placebo or refutation test is the prerequisite for believing your number.**

If you skip falsification, you haven't run a measurement framework. You've just run a regression and hoped for the best.

And this brings us to the single biggest bottleneck in production today: the tooling.

---

## Part V // The Tooling Gap & Where I Want to Help

### The Last Mile Problem in Causal Tooling

When you look at the open-source landscape today, a lot of the heavy lifting is happening in libraries like **DoWhy** (part of PyWhy). What I appreciate about DoWhy is that it doesn't treat causal inference like just another machine learning estimator. It forces you through a disciplined workflow: you state your causal assumptions, see if the effect can even be identified mathematically, estimate it, and then - crucially - you try to refute your own findings.

That last step - refutation - is where I think the real battle is fought in production systems. Plugging data into an algorithm and getting a number back is relatively easy. The terrifying part is asking: *how do I know this number isn't completely bogus?*

Did an unobserved confounder sneak in? What happens if I replace the treatment with random noise? What happens if I drop a chunk of the data?

Yet whenever I've tried to use these tools with real product teams, this is where we run into a wall:
* The diagnostic outputs often look like raw, disconnected terminal prints. If you're trying to share results with an engineering lead or a business partner, you spend half your time manually compiling tables or explaining what the raw numbers mean.
* The statistics feel inverted. In standard A/B testing, people look for $p < 0.05$. In negative-control refutations, retaining the null ($p \ge 0.05$) means your model held up. Watching a room full of smart people get tripped up by that directionality is surprisingly common.
* And if you're dealing with platforms where units leak into each other - which is almost everything I've worked on - there aren't really off-the-shelf primitives to stress-test whether your estimate collapses under network interference or marketplace spillover.

### Where I'm Focusing: Contributing Back to DoWhy

That friction is what got me interested in contributing directly to DoWhy, rather than just writing internal scripts or blogging about it.

I don't think the community needs another bespoke causal package. What feels much more useful is helping make the existing refutation ecosystem friendlier and more resilient for people running real products:

1. **Making Refutation Summaries Human-Readable:** Building standardized, clean summary utilities right into the refutation layer. If someone runs four or five stress tests, they should be able to get a single, clear diagnostic table (for notebooks, docs, or slide decks) that explains stability, effect drift, and sensitivity bounds without needing a statistics PhD to decode the console output.
2. **Bringing Network & SUTVA Stress Tests to Open Source:** Starting to explore refuters that explicitly test for interference. If we can make it simple to plug in an adjacency matrix or cluster layout and test whether an estimate is vulnerable to peer leakage, it gives teams a fighting chance at catching SUTVA collapse before they ship.

I don't have all of this figured out, and measurement in interconnected systems is always messy. But if we can make falsification a little more intuitive and accessible, it saves teams from shipping on false confidence.

---

*I'm actively exploring this space and working through these ideas. If you're wrestling with similar measurement problems or working on open-source causal tools, feel free to connect on [LinkedIn](https://www.linkedin.com/in/aritrobanerjee/).*



