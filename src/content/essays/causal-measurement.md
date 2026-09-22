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

## Part IV // The Platform Measurement Triage Framework

When a simple 50/50 split is ruled out due to interference or sample size constraints, the engineering question becomes: *what is the minimum viable quasi-experimental design that preserves causal validity?*

* **Interrupted Time Series (ITS) / CausalImpact:** Best when an intervention hits 100% of the platform simultaneously (such as a mandatory developer policy or platform-wide API change), provided there is a sufficiently long, stationary pre-intervention window and no concurrent macro shocks.
* **Difference-in-Differences (DiD) & Synthetic DiD (SDID):** Ideal when you have panel data across regional clusters or sales territories. Where classic DiD relies on the strict parallel trends assumption, Synthetic DiD relaxes this by reweighting control units and pre-periods to match the treated unit trajectory.
* **Synthetic Control Methods (SCM):** The gold standard for aggregate market holdouts when you have a small number of treated units (e.g., 3-5 regional markets) and a rich donor pool of unaffected control markets.
* **Peer Exposure Mapping & Network Holdouts:** When graph topology is known (e.g., connected account networks or local marketplace clusters), partitioning by community structure allows you to estimate direct effects while explicitly modeling local spillover dosage.

---

## Part V // The Tooling Gap & The Ideal Landing Zone for Open Source

### Where Modern Tooling Falls Short

Over the past few years, the open-source causal inference ecosystem has matured significantly. The preeminent standard in Python is **DoWhy** (hosted under the Linux Foundation's PyWhy organization), which formalized the four-step causal workflow: **Model $\rightarrow$ Identify $\rightarrow$ Estimate $\rightarrow$ Refute**.

Libraries like DoWhy and EconML have done remarkable work making advanced estimators (Double Machine Learning, Instrumental Variables, Causal Forests) accessible. But for product teams operating at scale, the biggest operational bottleneck isn't estimation: it is **falsification and executive interpretability**.

In production, an unrefuted causal estimate is dangerous. You need to know whether your estimate survives placebo treatments, random unobserved confounders, data subsetting, and sensitivity analysis. Yet this is precisely where existing tools hit usability hurdles:
* Diagnostic outputs often produce raw, unaggregated terminal dumps rather than structured tabular summaries that product and engineering leaders can review together.
* Interpreting p-values in falsification tests is counter-intuitive: in negative-control refutations, retaining the null ($p \ge 0.05$) represents robustness, which frequently confuses cross-functional stakeholders trained on standard A/B testing.
* Existing toolchains focus heavily on unobserved confounding, but have limited native primitives to test for **platform network interference and SUTVA collapse** before an experiment ships.

### The Ideal Landing Zone: Contributing Back to PyWhy / DoWhy

This defines the ideal landing zone for contributing back to the open-source causal ecosystem. Rather than writing isolated, proprietary internal scripts or publishing another theoretical essay, the highest-leverage contribution is meeting practitioners where they already work: inside foundational frameworks like DoWhy.

The goal is to help bridge the gap between academic econometrics and production platform engineering through two key fronts:

1. **Standardized Diagnostic Summaries & Falsification UX:** Bringing first-class, standardized summary primitives and interpretable diagnostic tables to DoWhy's refutation ecosystem. Teams should be able to run a battery of refutations and immediately inspect an aggregated, defensible report that clearly articulates model stability, effect drift, and sensitivity bounds in a format suitable for executive decision-making.
2. **Platform & Network Interference Diagnostics:** Expanding the refutation toolkit to natively test for SUTVA violations. By introducing stress tests that simulate marketplace spillovers, peer exposure cannibalization, and networked interference, platform teams can systematically evaluate whether their causal estimates are vulnerable to ecosystem leakage before rolling out global policy or algorithmic changes.

By grounding platform-scale measurement realities into open-source primitives, we can help teams measure what cannot be simply A/B tested: with the statistical rigor of an econometrician and the clarity required for product execution.

---

*Connect on [LinkedIn](https://www.linkedin.com/in/aritrobanerjee/) to discuss platform measurement challenges or collaborate on open-source causal tooling.*


