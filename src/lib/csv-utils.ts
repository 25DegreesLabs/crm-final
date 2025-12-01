import { type Lead } from './supabase-queries';

export function generateCampaignCSV(leads: Lead[], campaignName: string): void {
  const headers = [
    'WhatsApp Number(with country code)',
    'First Name',
    'Last Name',
    'icebreaker'
  ];

  const rows = leads.map(lead => {
    const phone = lead.phone_number.startsWith('+')
      ? lead.phone_number
      : `+353${lead.phone_number}`;

    return [
      phone,
      lead.first_name || '',
      lead.last_name || '',
      ''
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  const filename = `wasender_${campaignName.replace(/\s+/g, '_')}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
