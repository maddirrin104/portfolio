/**
 * TASK 03 profile copy. Authority: docs/FACTS.md, P-002/P-003.
 * CV statements are self-reported; certificate details are verified only against
 * the supplied image. Do not add private contact values or unreviewed claims.
 */
export interface Experience {
  id: string;
  company: string;
  position: string;
  employmentType: string;
  start: string;
  end: string;
  summary: string;
  responsibilities: readonly string[];
  tools: readonly string[];
  factRefs: readonly string[];
}

export interface Education {
  institution: string;
  program: string;
  status: string;
  expectedGraduation: string;
  factRefs: readonly string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issued: string;
  factRefs: readonly string[];
}

export interface SkillGroup {
  title: string;
  skills: readonly string[];
  context?: { label: string; href: string };
  factRefs: readonly string[];
}

export const professionalProfile = {
  introduction: 'I’m an Information Security student at the University of Information Technology, VNU-HCM, working toward an entry-level SOC Analyst role. My system internship gave me practice with Linux infrastructure and troubleshooting; the SOC homelab lets me work through telemetry and detection logic. I’m also researching how incident summaries can stay tied to evidence.',
  experience: [{
    id: 'experience-vhost',
    company: 'vHost.vn',
    position: 'System Intern',
    employmentType: 'Internship',
    start: '2026-06',
    end: '2026-09',
    summary: 'Infrastructure work focused on Linux systems, connectivity and access issues.',
    responsibilities: [
      'Maintained Ubuntu and AlmaLinux systems and investigated service, routing and DNS issues.',
      'Worked on SSH hardening, iptables, WireGuard VPN and TLS certificates.',
      'Reviewed system, authentication and firewall logs to diagnose access and configuration problems.',
    ],
    tools: ['Ubuntu', 'AlmaLinux', 'SSH', 'iptables', 'WireGuard', 'TLS'],
    factRefs: ['F-X01', 'F-X02', 'F-X03', 'F-X04'],
  }] satisfies readonly Experience[],
  education: {
    institution: 'University of Information Technology, VNU-HCM',
    program: 'Bachelor of Information Security',
    status: 'In progress',
    expectedGraduation: '2027-01',
    factRefs: ['F-E01', 'F-E02'],
  } satisfies Education,
  certifications: [{
    name: 'Certified CyberDefender Level 1 (CCDL1)',
    issuer: 'CyberDefenders',
    issued: '2026-10-04',
    factRefs: ['F-C01'],
  }] satisfies readonly Certification[],
  skillGroups: [
    { title: 'Security monitoring', skills: ['Splunk', 'SPL', 'Windows Security events', 'Sysmon'], context: { label: 'SOC Homelab', href: 'projects/soc-homelab/' }, factRefs: ['F-S01', 'F-J01'] },
    { title: 'Network telemetry', skills: ['OPNsense', 'Suricata'], context: { label: 'SOC Homelab', href: 'projects/soc-homelab/' }, factRefs: ['F-S01', 'F-J01'] },
    { title: 'Systems & access', skills: ['Ubuntu', 'AlmaLinux', 'SSH', 'iptables', 'WireGuard', 'TLS'], context: { label: 'vHost internship', href: 'about/#experience-vhost' }, factRefs: ['F-X02', 'F-X03'] },
    { title: 'Investigation', skills: ['PCAP analysis', 'Wireshark', 'MITRE ATT&CK'], factRefs: ['F-S01', 'F-S02'] },
    { title: 'Programming', skills: ['Python', 'Bash'], factRefs: ['F-S01'] },
    { title: 'Evidence-grounded research', skills: ['Evidence citations', 'Rule and NLI verification design'], context: { label: 'EGIS', href: 'projects/egis/' }, factRefs: ['F-J02', 'F-R01'] },
  ] satisfies readonly SkillGroup[],
} as const;
