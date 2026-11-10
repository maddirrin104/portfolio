/**
 * Editorial copy for TASK 01. Authority: docs/FACTS.md, P-007/P-008.
 * CV claims are self-reported, not independently verified credentials.
 * No private values, raw evidence, or deferred claims belong in this module.
 */
export interface Project {
  slug: string;
  title: string;
  category: string;
  status: string;
  summary: string;
  contribution: string;
  focus: string;
  technologies: readonly string[];
  repository: `https://github.com/${string}`;
  factRefs: readonly string[];
  evidenceRefs: readonly string[];
}

export const profile = {
  name: 'Vo Minh An',
  initials: 'MA',
  role: 'Aspiring SOC Analyst',
  focus: 'Blue Team & security operations',
  headline: 'Understanding incidents. Starting with evidence.',
  introduction: 'I’m An, an Information Security student working toward a role in security operations. My focus is on security monitoring, threat detection, and making sense of the traces an incident leaves behind.',
  about: 'I’m studying Information Security at the University of Information Technology, VNU-HCM. My path is toward Blue Team work: understanding systems, reading their logs, and investigating what happened.',
  approach: 'My projects bring that direction into practice, from collecting endpoint and network telemetry in a home lab to researching how incident summaries can stay grounded in their evidence.',
  factRefs: ['F-P01', 'F-P02', 'F-E01', 'F-J01', 'F-J02'],
  social: [
    { label: 'GitHub', href: 'https://github.com/maddirrin104', handle: 'maddirrin104' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/minhanvo104', handle: 'minhanvo104' },
  ],
} as const;

export const navigation = [
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: 'about/' },
  { label: 'Contact', href: '#contact' },
] as const;

export const projects: readonly Project[] = [
  {
    slug: 'soc-homelab',
    title: 'SOC Homelab',
    category: 'Security monitoring & detection engineering',
    status: 'Personal lab',
    summary: 'A home lab for following security events from their source into Splunk, then exploring detection logic and incident investigation.',
    contribution: 'My work centers on a segmented lab and collecting Windows, Linux, firewall, and IDS telemetry in Splunk.',
    focus: 'The repository documents the lab setup and detection workflow. Validation evidence is still being documented; lab behavior does not establish production effectiveness.',
    technologies: ['Splunk / SPL', 'Sysmon', 'OPNsense', 'Suricata'],
    repository: 'https://github.com/maddirrin104/soc-homelab',
    factRefs: ['F-J01', 'F-S01', 'F-S02'],
    evidenceRefs: ['P-002', 'P-004', 'P-006'],
  },
  {
    slug: 'egis',
    title: 'EGIS',
    category: 'Evidence-grounded incident summarization',
    status: 'Research in progress',
    summary: 'How can an incident summary stay faithful to its evidence? EGIS explores cited claims, verification, and missing critical facts in reports for SOC analysts.',
    contribution: 'My research focuses on evidence citations, hybrid rule/NLI verification, and controlled repair of incident summaries.',
    focus: 'The project is in development. The repository describes the research design; empirical outcomes have not yet been established.',
    technologies: ['Python', 'NLI', 'Evidence retrieval'],
    repository: 'https://github.com/maddirrin104/egis-soc',
    factRefs: ['F-J02', 'F-R01', 'F-S03'],
    evidenceRefs: ['P-002', 'P-005'],
  },
];

export const labNote = {
  title: 'Inside the home lab',
  sources: [
    { name: 'Windows', detail: 'Security events / Sysmon' },
    { name: 'Linux', detail: 'Authentication / system logs' },
    { name: 'Network', detail: 'OPNsense / Suricata' },
  ],
  destination: 'Splunk',
  destinationDetail: 'Collect, search, investigate',
  caption: 'Simplified telemetry flow, redrawn from the lab documentation. Network addresses omitted; this is not a validation result.',
  sourceUrl: 'https://github.com/maddirrin104/soc-homelab/blob/c8e80e5fe51643b70dd47f70970c15d907467e0d/README.md',
} as const;

export const site = {
  title: `${profile.name} — SOC & Blue Team Portfolio`,
  description: 'Information Security student pursuing SOC and Blue Team work. Explore a security monitoring homelab and research into evidence-grounded incident summaries.',
  language: 'en',
  // Local review only; final design and public release have not been approved.
  indexable: false,
} as const;
