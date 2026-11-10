---
title: SOC Homelab
subtitle: Security Monitoring & Detection Engineering
description: A personal lab that connects endpoint and network telemetry to Splunk searches, with detection logic and validation limits shown separately.
category: Security operations
status: Lab and ingestion documented; detection validation not yet published
role: Lab design, telemetry collection and detection work
technologies: [Splunk Enterprise, SPL, Sysmon, OPNsense, Suricata]
repository: https://github.com/maddirrin104/soc-homelab
diagram: soc
visibility: preview
factRefs: [F-J01, F-S01, F-S02]
---

## Why build this lab?

A detection rule is only as useful as the events that reach it. This lab gives me a place to follow a security event from an endpoint or network source into Splunk, inspect its fields, and ask whether a search expresses the behavior I intended to detect. The public [lab documentation](https://github.com/maddirrin104/soc-homelab/blob/main/README.md) describes a segmented environment and collection from Windows, Ubuntu, OPNsense and Suricata. This is a personal learning environment; it is not evidence of production SOC performance.

## System boundary and telemetry

The lab documentation describes a Windows domain environment, Linux host, OPNsense firewall, Suricata sensor and Splunk Enterprise. Windows Security events and Sysmon provide endpoint context; Linux and firewall logs add host and network context; Suricata supplies IDS alerts. Splunk Universal Forwarder appears in the documented forwarding path. The diagram above is a logical flow only: exact network placement, IP addresses and sensor mode are deliberately omitted.

These sources answer different questions. Authentication events can show which account and host were involved in a logon attempt. Sysmon can add process or connection context. Firewall and IDS data can help correlate activity across the network. A source being listed here does not establish that every event type was received reliably or that every rule was tested against it.

## Detection work: two documented searches

The repository contains SPL files for Windows detections. The examples below describe *implemented search logic* visible in those files. Neither example is presented as a validated alert or a measured attack outcome.

### Repeated failed logons — DET-01

**Objective.** Surface a short burst of failed Windows logons associated with the same account, source address and destination host. The [DET-01 source](https://github.com/maddirrin104/soc-homelab/blob/main/detections/windows/DET-01.spl) searches Security Event 4625, normalizes account and source fields, then groups events into five-minute windows. Its final condition is three or more failures per group.

```spl
index=windows (source="XmlWinEventLog:Security" OR source="WinEventLog:Security") EventCode=4625
| eval account=coalesce(TargetUserName, mvindex(Account_Name,1))
| eval src_ip=coalesce(IpAddress, Source_Network_Address, src)
| eval dest_host=host
| bin _time span=5m
| stats count AS failed_logons BY _time account src_ip dest_host
| where failed_logons>=3
```

This is a shortened excerpt of the repository query; the source also filters missing fields and retains logon types. **Expected behavior:** matching failures appear as grouped candidates for investigation. **Observed result:** no public test record is linked to this rule yet. Shared accounts, field extraction differences and expected admin activity can affect interpretation; the threshold alone does not identify an attack.

### Failures followed by success — DET-02

**Objective.** Highlight a successful network or remote logon after repeated failures for the same account, source, destination and logon type. The [DET-02 source](https://github.com/maddirrin104/soc-homelab/blob/main/detections/windows/DET-02.spl) reads Windows Security Events 4624 and 4625, restricts logon types to 3 or 10, and uses a ten-minute `streamstats` window to count failures before a success. It keeps successful events when the preceding count reaches three.

**Expected behavior:** a qualifying success becomes an investigation lead, with its preceding failures as context. **Observed result:** the public repository does not yet provide a reproducible validation record for this search. A successful logon is not proof of compromise; an analyst would need to inspect the account, host and surrounding activity.

## What the evidence supports

The [public README](https://github.com/maddirrin104/soc-homelab/blob/main/README.md) documents the lab and ingestion setup, and the linked SPL files show concrete detection logic. Those sources support a case study about design and method. They do not currently support a count of tested detections, a detection rate, or a claim that a simulated attack was caught. The repository's scenario and validation materials need populated, reviewable records before those results can be described here.

## Next evidence to add

The most useful follow-up would be a sanitized test record for each selected rule: input event type, test procedure, query version, expected match, observed match or non-match, false-positive notes and a screenshot with sensitive identifiers removed. That would turn the current search walkthrough into a reproducible account of what the lab actually detected.
