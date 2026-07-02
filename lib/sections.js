// Sections of the proposal PDF, mapped to page ranges (1-based, inclusive).
// `aliases` are alternative names (German + English) the voice agent may use.
export const PDF_TITLE = 'bayern-evangelisch.de NEXT';
export const PDF_SUBTITLE = 'ELKB × OpenSense Labs — Angebot';
export const TOTAL_PAGES = 54;

export const SECTIONS = [
  { id: 'cover', title: 'Cover', page: 1, endPage: 1,
    aliases: ['title page', 'titelseite', 'front page'] },
  { id: 'inhaltsverzeichnis', title: 'Inhaltsverzeichnis', page: 2, endPage: 2,
    aliases: ['table of contents', 'toc', 'contents'] },
  { id: 'anschreiben', title: 'Anschreiben', page: 3, endPage: 4,
    aliases: ['cover letter', 'letter', 'about us', 'ueber uns'] },
  { id: 'management-summary', title: 'Management Summary', page: 5, endPage: 6,
    aliases: ['executive summary', 'summary', 'zusammenfassung'] },
  { id: 'ausgangslage', title: 'Verständnis der ELKB Ausgangslage', page: 7, endPage: 7,
    aliases: ['starting position', 'initial situation', 'understanding elkb', 'ausgangslage'] },
  { id: 'warum-osl', title: 'Warum OpenSense Labs', page: 8, endPage: 9,
    aliases: ['why opensense labs', 'why osl', 'why us', 'partnerships', 'partnerschaften'] },
  { id: 'fallstudie-allianz', title: 'Fallstudie 1 — Allianz', page: 10, endPage: 10,
    aliases: ['allianz case study', 'alliance case study', 'case study 1', 'case study one', 'allianz', 'alliance', 'fallstudie allianz'] },
  { id: 'fallstudie-aes', title: 'Fallstudie 2 — AES', page: 11, endPage: 11,
    aliases: ['aes case study', 'case study 2', 'case study two', 'aes', 'fallstudie aes'] },
  { id: 'fallstudie-spc', title: 'Fallstudie 3 — SPC FAME', page: 12, endPage: 12,
    aliases: ['spc fame case study', 'spc case study', 'case study 3', 'case study three', 'spc fame', 'spc', 'fame', 'data management platform', 'fallstudie spc'] },
  { id: 'loesungsansatz', title: 'Unser Lösungsansatz', page: 13, endPage: 15,
    aliases: ['solution approach', 'our solution', 'wegweiser', 'loesungsansatz'] },
  { id: 'flowengage', title: 'KI-Dialog-Engine — FlowEngage', page: 16, endPage: 16,
    aliases: ['flowengage', 'flow engage', 'ai dialog engine', 'ki dialog engine', 'dialog engine', 'chatbot'] },
  { id: 'ccms', title: 'CCMS — Zentrales Content-Management', page: 17, endPage: 17,
    aliases: ['ccms', 'central content management', 'zentrales content management'] },
  { id: 'informationsarchitektur', title: 'Informationsarchitektur & Navigation', page: 18, endPage: 19,
    aliases: ['information architecture', 'navigation', 'informationsarchitektur'] },
  { id: 'content-migration', title: 'Content-Strategie & Migration', page: 20, endPage: 20,
    aliases: ['content strategy', 'migration', 'content migration'] },
  { id: 'design-ux', title: 'Design & User Experience', page: 21, endPage: 22,
    aliases: ['design', 'user experience', 'ux', 'design system'] },
  { id: 'technischer-ansatz', title: 'Unser technischer Ansatz', page: 23, endPage: 24,
    aliases: ['technical approach', 'architecture', 'technischer ansatz', 'tech stack', 'drupal architecture'] },
  { id: 'drag-drop', title: 'Drag-&-Drop-Seitengestaltung', page: 25, endPage: 25,
    aliases: ['drag and drop', 'page building', 'page composition', 'drupal canvas', 'seitengestaltung'] },
  { id: 'content-governance', title: 'Content-Governance: Rollen & Workflows', page: 26, endPage: 26,
    aliases: ['governance', 'roles and workflows', 'editorial control', 'content governance', 'workflow'] },
  { id: 'api-integrationen', title: 'API-Integrationen & Schnittstellen', page: 27, endPage: 28,
    aliases: ['api integrations', 'integrations', 'interfaces', 'schnittstellen', 'external systems'] },
  { id: 'ki-delivery', title: 'KI-gestütztes Delivery-Framework', page: 28, endPage: 29,
    aliases: ['ai delivery framework', 'delivery framework', 'ai powered delivery', 'ki delivery'] },
  { id: 'deployment-hosting', title: 'Deployment und Hosting', page: 29, endPage: 29,
    aliases: ['deployment', 'hosting', 'spacenet'] },
  { id: 'continuous-compliance', title: 'Continuous Compliance', page: 30, endPage: 31,
    aliases: ['compliance', 'drupalfit', 'continuous compliance'] },
  { id: 'umsetzungsprozess', title: '6-Phasen-Umsetzungsprozess', page: 32, endPage: 34,
    aliases: ['implementation process', 'six phase process', '6 phase process', 'phases', 'delivery process', 'umsetzungsprozess'] },
  { id: 'support', title: 'Support nach der Übergabe', page: 35, endPage: 35,
    aliases: ['support', 'after handover', 'maintenance', 'sla'] },
  { id: 'vielfalt-nachhaltigkeit', title: 'Vielfalt, Inklusion & Nachhaltigkeit', page: 36, endPage: 37,
    aliases: ['diversity', 'inclusion', 'sustainability', 'equality', 'nachhaltigkeit', 'chancengleichheit'] },
  { id: 'teamstruktur', title: 'Teamstruktur & Ansprechpartner', page: 38, endPage: 42,
    aliases: ['team structure', 'contact persons', 'ansprechpartner', 'team setup'] },
  { id: 'teamprofil', title: 'Teamprofil Projekt ELKB', page: 43, endPage: 52,
    aliases: ['team profile', 'team profiles', 'cv', 'cvs', 'profiles', 'team members'] },
  { id: 'projektplan', title: 'ELKB BEV Relaunch — Projektplan', page: 53, endPage: 53,
    aliases: ['project plan', 'timeline', 'roadmap', 'projektplan', 'schedule'] },
  { id: 'danke', title: 'Vielen Dank!', page: 54, endPage: 54,
    aliases: ['thank you', 'thanks', 'closing', 'danke'] },
];

// Find the section a given page belongs to (first match wins).
export function sectionForPage(page) {
  return SECTIONS.find(s => page >= s.page && page <= s.endPage) || null;
}

function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fuzzy-match a spoken/written section name to a section.
// Returns { section, page } — `page` is the specific page to scroll to.
export function findSection(query) {
  const q = normalize(query);
  if (!q) return null;

  // Direct page number reference ("page 25", "seite 25")?
  const pageMatch = q.match(/(?:page|seite)\s*(\d+)/) || q.match(/^(\d+)$/);
  if (pageMatch) {
    const p = parseInt(pageMatch[1], 10);
    if (p >= 1 && p <= TOTAL_PAGES) return { section: sectionForPage(p), page: p };
  }

  let best = null;
  let bestScore = 0;
  for (const s of SECTIONS) {
    const candidates = [s.title, s.id.replace(/-/g, ' '), ...(s.aliases || [])]
      .map(normalize)
      .filter(Boolean);
    let score = 0;
    for (const c of candidates) {
      let sc = 0;
      if (c === q) sc = 100;
      // Query is contained in the candidate name.
      else if (c.includes(q)) sc = 85;
      // Candidate name appears inside the query — longer (more specific)
      // candidates score higher, so "aes case study" beats a generic hit.
      else if (q.includes(c)) sc = 60 + Math.min(25, c.length);
      else {
        const qTokens = q.split(' ').filter(w => w.length > 2 || /^\d+$/.test(w));
        const cTokens = c.split(' ');
        const hits = qTokens.filter(w => cTokens.some(t => t.startsWith(w) || w.startsWith(t))).length;
        if (qTokens.length) sc = (hits / qTokens.length) * 55;
      }
      if (sc > score) score = sc;
    }
    if (score > bestScore) { bestScore = score; best = s; }
  }
  return bestScore >= 30 ? { section: best, page: best.page } : null;
}
