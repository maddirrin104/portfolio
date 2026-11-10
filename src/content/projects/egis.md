---
title: EGIS
subtitle: Evidence-grounded Incident Summarization for SOC Analysts
description: An ongoing research project about incident summaries whose claims can be traced to evidence and checked by an analyst.
category: Applied security research
status: Research in progress; Week 1 design and synthetic prototype documented
role: Research design and early implementation
technologies: [Incident schema, Evidence lineage, Retrieval design, Claim verification]
repository: https://github.com/maddirrin104/egis-soc
diagram: egis
visibility: preview
factRefs: [F-J02, F-R01]
---

## The problem

An incident summary condenses alerts, logs and analyst notes into a short account of what happened. Compression creates two risks: a claim can be written without supporting evidence, or an important piece of evidence can be left out. EGIS asks how a summary could expose the basis for each claim so an analyst can review it. The [project brief](https://github.com/maddirrin104/egis-soc/blob/main/docs/context/PROJECT_BRIEF.md) frames this as a research problem, not a finished SOC product.

## Research objective and boundaries

The [research protocol](https://github.com/maddirrin104/egis-soc/blob/main/docs/research-protocol.md) defines questions around evidence grounding, unsupported claims, omissions and analyst review. The intended comparison is methodological: prepare incident evidence, generate a structured summary, verify claims against cited evidence, and evaluate what the process misses or gets wrong. These are study objectives. The public materials do not yet establish an evaluation score, model improvement or field performance.

## A proposed workflow

The [Week 1 architecture](https://github.com/maddirrin104/egis-soc/blob/main/docs/architecture-v1.md) lays out a scoped incident bundle, an evidence store with provenance, retrieval, a structured draft, atomic claim verification and analyst review. It also describes an optional repair path for missing or unsupported content. The diagram above compresses that *design* into four stages; it should not be read as a screenshot of a running pipeline.

The design choice that matters most is traceability. A final sentence should be connected to a specific piece of permitted evidence, not only to a model's fluent wording. The protocol also keeps human review in the loop: a verifier's decision would help prioritize inspection, while the analyst remains responsible for the final account.

## What has been documented so far

The public [task board](https://github.com/maddirrin104/egis-soc/blob/main/docs/context/TASK_BOARD.md) records Week 1 approval of the research protocol, schema contracts and architecture design. It also records a synthetic in-memory prototype for evidence lineage, split and integrity checks. These are early foundation artifacts. The task board does not show a complete ingestion-to-summary system or results from an incident evaluation.

The schema and synthetic prototype matter because they establish how an incident, evidence item and citation can be identified before generation is added. They also make data separation and provenance explicit in the design. The actual behavior of future retrieval, drafting and verification modules still needs implementation and testing.

## Evaluation questions still open

The protocol proposes assessing whether generated claims are supported, whether relevant evidence was omitted, and how analyst review handles disagreements. Those checks require a governed incident set, a fixed protocol and reviewable outputs. No such results are claimed here. Data quality, permitted use of incident material and reliable citation links remain practical constraints for future work.

The next public milestone should be a sanitized, reproducible example that traces one incident bundle through the implemented stages, including a claim, its citation, the verifier's decision and an analyst correction if needed. Until then, the case study documents research direction and the implemented foundation, rather than empirical effectiveness.
