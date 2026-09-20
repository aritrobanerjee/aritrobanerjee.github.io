# How to Measure What Can't Be Tested

*A first-principles guide to causal inference, SUTVA violations, and quasi-experimentation when A/B tests fail in platform ecosystems.*

**By Aritro Banerjee**  
*March 2026 · 12 min read · Causal Inference*

---

## Part I // The Invisible Failure

I've sat in a lot of product reviews where someone pulls up an A/B test dashboard, points at a green p-value badge, and says "ship it." And most of the time, that's fine. If you're testing a new onboarding flow or a button placement on a consumer website, a coin flip works.

But over the past decade — working across enterprise data systems at Deloitte, global commercialization and measurement at Google, and developer platform APIs — the systems I've worked on don't behave like isolated landing pages.

Take a classic example that happens constantly in B2B and commercial tech: you want to roll out a new lead-scoring model that auto-prioritizes accounts for your sales team. The obvious PM intuition is: *"Let's just split our customer accounts 50/50. Give half to the new model and keep the other half on the old workflow."*

It sounds reasonable. In reality, it completely blows up the statistical assumptions:

* **Rep behavioral leakage:** An Account Executive or sales pod manages 20 accounts. If you enable the model on 10, the rep doesn't develop amnesia when talking to the other 10. The sharper discovery prompts, deal structures, and collateral leak into every conversation. Control gets treated by osmosis.
* **Portfolio budget cannibalization:** Enterprise clients operate with fixed quarterly budgets. If the model helps close an aggressive upsell on Brand A (treatment), the client frequently funds it by pulling unspent budget from Brand B (control). Your dashboard shows a massive green lift on treatment and a mysterious drop on control — you didn't create new net revenue, you just shifted dollars inside the same customer balance sheet.
* **Shared agency networks:** Major accounts share the same media holding companies, buying desks, or procurement teams. The moment an agency sees what works on one account, they port the playbook across their entire portfolio.

The A/B test tells you the new workflow drove a +25% lift. When you roll it out to 100% of accounts, the net revenue only moves +2%. The rest was cannibalization and spillover you accidentally manufactured by running a naive test.

It kept happening. Every project, same trap. And none of the PM resources I was reading — the Lenny's Newsletters, the Reforge courses, the interview prep guides — even acknowledged it. They teach you A/B testing as if SUTVA violations don't exist. (SUTVA is the statistical assumption that what happens to one unit doesn't affect another. In connected account networks and platforms, it is almost always violated.)

So I started digging into how economists handle this, because they've been dealing with it for decades. You can't randomly assign a minimum wage hike to half the restaurants in a city without labor spillovers. They had to invent entirely different methods.

---

## Part II // Where A/B Testing Breaks

### Three Ways Real Systems Break Your A/B Test

SUTVA requires two things: *no interference between units*, and *no hidden variations of the treatment*. In platform ecosystems and commercial enterprise workflows, both collapse instantly:

| Failure Mode | Mechanism | Platform / Enterprise Impact |
|:---|:---|:---|
| **01. Rep & Org Spillover** | Human workflows cannot be cleanly partitioned | When a commercial pod learns an optimization on treated accounts, that operational knowledge instantly bleeds into control accounts. |
| **02. Budget Cannibalization** | Enterprise spend is zero-sum within fiscal quarters | If treatment drives higher spend on one account or channel, the client reallocates spend away from control, creating artificial negative lift. |
| **03. Shared Ecosystem Context** | Structural dependencies synchronize behavior | Shared media holding companies, procurement teams, or third-party SDK dependencies synchronize behavior across account clusters, violating unit independence. |

When any of these apply, your p-value is worse than useless — it gives leadership false confidence in an illusion.

---

## Part III // The Part Nobody Warns You About

### Your Experiment Was Dead Before You Launched It

Here's what happened on a project I worked on. We spent quarters building a lead-scoring model that would auto-prioritize accounts and generate outbound sequences for our commercial sales teams. The expected causal revenue lift was around +1.5%. We couldn't run a simple user-level A/B test — account reps share territories, clients cross geographic lines, and sales enablement leaks across regional teams. So we set up a market-level cluster experiment: rolled out the model in a subset of regional markets, and held others back as controls.

Six weeks later: null result. No statistically significant lift detected.

Within an hour, the email thread started. *"So the model doesn't work?"* From someone who wasn't in the room when we scoped it. Leadership quietly deprioritized the next phase.

But the motion *did* work. The productivity gains were real. What went wrong was the experiment design. When you go from randomizing millions of individual users to randomizing a couple hundred sales territories or geographic clusters, your sample size drops by orders of magnitude. The smallest lift you can reliably detect — the Minimum Detectable Effect, or MDE — jumps from ~0.1% to somewhere around 4-8%.

We were trying to detect a +1.5% lift with a test design that was mathematically blind to anything under +6%. It was like trying to read a street sign with binoculars that only focus past a mile.

| Test Design | Sample Size ($N$) | Minimum Detectable Lift |
| :--- | :--- | :--- |
| **User-Level A/B Test** | ~50,000,000 users | Can detect lifts as small as **~0.1%** |
| **Geo-Cluster Experiment** | ~200 markets / clusters | Can only detect lifts above **~4–8%** |

> **The Square-Root Law of Cluster Power:**  
> The minimum detectable effect scales inversely with the square root of your cluster count:  
> `MDE ∝ σ / √N_clusters`  
> When $N$ collapses from 50,000,000 users to 200 DMAs, your denominator shrinks by a factor of 500 — exploding your minimum detectable threshold.  
> *(In practice, Synthetic Control MDE also depends on how well the control tracks your treatment unit during the pre-treatment window and the planned test duration. Better fit and longer tests let you detect smaller effects.)*

---

## Part IV & V // The Triage Framework & Tools [WIP]

*This section is currently being written and refined.*

In the upcoming sections, I will break down:
* **The Platform Measurement Decision Matrix:** A concrete triage framework to choose between cluster holdouts, Synthetic DiD, interrupted time series, and off-policy simulation.
* **Preflight Profiling:** How to automate pre-experiment statistical power calculations before committing engineering resources.
* **Executive Defense Playbooks:** Practical scripts for handling stakeholder pushback on why a 50/50 A/B split isn't viable in interconnected systems.

*Check back soon for the complete release, or connect on [LinkedIn](https://www.linkedin.com/in/aritrobanerjee/) to discuss platform measurement challenges.*

