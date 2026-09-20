# How to Build What Can't Be Defined

*Engineering velocity, boundary-first scoping, and tracer-bullet execution when specifications are impossible.*

> **Status: Work in Progress [WIP]**  
> *Drafting thesis, core principles, and operational case studies from developer platforms and distributed systems.*

---

## Part I // The Tyranny of the PRD

Every standard product management playbook starts with the same comfortable lie: *write the spec, align the stakeholders, define the acceptance criteria, and execute.*

This works cleanly when you are building a known quantity: a checkout funnel, a dashboard, a CRUD API, or an established SaaS pattern. The requirements can be interrogated, the metrics can be scoped, and "done" has a binary definition.

Then you step into the frontier.

When you are tasked with building non-deterministic AI pipelines, autonomous multi-agent runtimes, high-concurrency auction engines, or novel platform primitives, you run headfirst into a brutal paradox: **you cannot define what success looks like until the system is already running.**

* The requirements cannot be specified because the underlying primitives are probabilistic, not deterministic.
* The customer cannot tell you what they want because they have never interacted with the capability before.
* The edge cases cannot be enumerated because they emerge dynamically from the interaction of millions of independent entities.

If you demand an exhaustive PRD before writing code, you end up with 40 pages of fiction. Teams spend six months debating hypothetical abstractions, only for reality to shatter the spec within five minutes of production traffic.

So then: **how do you build when writing a specification is fundamentally impossible?**

---

## Part II // The Illusion of the Comprehensive Spec

When leaders encounter radical ambiguity, their default defense mechanism is process. They request more research, more stakeholder interviews, and tighter specifications.

In frontier systems, this makes the problem worse:

* **The Specification Trap:** The more detailed an upfront spec is for an undefined problem, the more brittle it becomes. Every sentence in the PRD is an unvalidated bet disguised as a requirement.
* **Analysis Paralysis by Committee:** Without working software to ground the discussion, product reviews devolve into debates over personal taste and hypothetical edge cases that will never occur in practice.
* **The Trap of Deterministic Acceptance Criteria:** Trying to apply deterministic QA tests ("given input X, system must return exact output Y") to probabilistic systems guarantees infinite failure or crippled functionality.

The antidote is not "vibes" or hacking without direction. The antidote is shifting from **spec-first engineering** to **boundary-first engineering**.

---

## Part III // Principles for Building in the Dark

### 01. Define the Negative Space (Boundary-First Scoping)
When you cannot define what the system *should* do, define what it must *never* do.
* Instead of specifying exact behavior: specify maximum latency, strict memory bounds, non-negotiable security boundaries, and data invariant rules.
* Treat the system like a river: you cannot control every droplet of water, but you can build reinforced concrete banks. As long as the banks hold, the system can explore the solution space safely.

### 02. Tracer Bullets Over Architectural Monoliths
Do not build the infrastructure layer for six months before exposing a single capability.
* Fire a "tracer bullet": a paper-thin, end-to-end path through all layers of the architecture (client SDK -> API runtime -> backend -> telemetry).
* Even if every component is mocked or hardcoded, the tracer bullet confirms physical reality: it tests network hops, serialization, deployment pipelines, and basic developer ergonomics.
* Reality gives you faster, harsher, and more accurate feedback than 100 design reviews.

### 03. Build the Evaluation Harness Before the Product
In probabilistic and frontier systems, the measurement harness is more important than the feature code itself.
* If you cannot measure regression, you cannot iterate.
* Build automated benchmarking suites, synthetic shadow traffic runners, and counterfactual simulation pipelines before writing the core logic.
* When the harness is robust, the team can move with extreme velocity because they have instant ground truth on whether a change made the system better or worse.

### 04. The Scaffolding Principle (Disposable Architecture)
Accept that v1 of an undefined product exists solely to teach you what v2 needs to be.
* Separate *foundational invariants* (which must remain rock-solid) from *operational scaffolding* (which is designed to be discarded).
* Make the scaffolding modular, pluggable, and deliberately cheap to throw away.

---

## Part IV // The Field Manual [In Progress]

*Currently documenting production lessons from shipping non-deterministic AI features, platform runtime primitives, and emerging developer APIs across billions of devices.*

*Check back soon for the complete essay, or connect on [LinkedIn](https://www.linkedin.com/in/aritrobanerjee/) to discuss building at the edge.*
