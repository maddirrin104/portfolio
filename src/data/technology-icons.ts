/** Visual aids for technologies already named in profile or project data.
 * Neutral symbols describe a tool's role; they are not vendor logos.
 */
export type TechnologyIcon = 'python' | 'monitor' | 'endpoint' | 'network' | 'system' | 'inspect' | 'code';

const icons: Readonly<Record<string, TechnologyIcon>> = {
  'Splunk Enterprise': 'monitor',
  'Splunk / SPL': 'monitor',
  SPL: 'code',
  'Windows Security events': 'endpoint',
  Sysmon: 'endpoint',
  OPNsense: 'network',
  Suricata: 'network',
  Ubuntu: 'system',
  AlmaLinux: 'system',
  Wireshark: 'inspect',
  Python: 'python',
  Bash: 'code',
};

export function technologyIcon(name: string): TechnologyIcon | undefined {
  return icons[name];
}
