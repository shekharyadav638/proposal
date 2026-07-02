'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { SECTIONS, PDF_TITLE, PDF_SUBTITLE, TOTAL_PAGES, sectionForPage, findSection } from '../lib/sections';
import pageText from '../lib/pageText.json';
import pageBounds from '../lib/pageBounds.json';
import VoiceAgent from './VoiceAgent';

// Served statically from /public — copied from node_modules/pdfjs-dist/build
// (bundling the worker breaks Next.js production builds).
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PAGE_WIDTH = 960;

function LazyPage({ pageNumber, width, ratio, onVisibleRef }) {
  const [visible, setVisible] = useState(pageNumber <= 3);
  const holderRef = useRef(null);

  useEffect(() => {
    if (visible) return;
    const el = holderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '1200px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  const height = Math.round(width * ratio);
  return (
    <div ref={holderRef}>
      {visible ? (
        <Page
          pageNumber={pageNumber}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          devicePixelRatio={Math.min(1.5, typeof window !== 'undefined' ? window.devicePixelRatio : 1)}
          loading={<div className="page-placeholder" style={{ width, height }}>Seite {pageNumber} wird gerendert…</div>}
        />
      ) : (
        <div className="page-placeholder" style={{ width, height }}>Seite {pageNumber}</div>
      )}
    </div>
  );
}

export default function Viewer() {
  const [numPages, setNumPages] = useState(0);
  const [ratio, setRatio] = useState(0.5625); // updated from page 1 on load
  const [currentPage, setCurrentPage] = useState(1);
  const [spotlight, setSpotlight] = useState(null); // section id or null

  const containerRef = useRef(null);
  const pageRefs = useRef([]);
  const currentPageRef = useRef(1);
  const controllerRef = useRef({});

  const onDocLoad = useCallback(async (doc) => {
    setNumPages(doc.numPages);
    try {
      const p1 = await doc.getPage(1);
      const vp = p1.getViewport({ scale: 1 });
      setRatio(vp.height / vp.width);
    } catch (e) { /* keep default ratio */ }
  }, []);

  // Scroll spy: track which page is centred in the viewport.
  const onScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const mid = container.getBoundingClientRect().top + container.clientHeight / 2;
    let best = 1;
    let bestDist = Infinity;
    pageRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs((r.top + r.bottom) / 2 - mid);
      if (d < bestDist) { bestDist = d; best = i + 1; }
    });
    currentPageRef.current = best;
    setCurrentPage(best);
  }, []);

  const scrollToPage = useCallback((page) => {
    const el = pageRefs.current[page - 1];
    const container = containerRef.current;
    if (!el || !container) return;
    // land just above the content spotlight box of the target page
    const boxY = (pageBounds[page - 1]?.y || 0) * el.offsetHeight;
    const top = el.offsetTop + boxY - 90;
    container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, []);

  // ---- Controller: the API exposed to the ElevenLabs client tools ----
  useEffect(() => {
    const pickName = (params) => {
      if (params == null) return '';
      if (typeof params === 'string' || typeof params === 'number') return String(params);
      for (const k of ['section', 'section_title', 'section_name', 'title', 'name', 'query', 'target', 'page', 'page_number']) {
        if (params[k] != null && params[k] !== '') return String(params[k]);
      }
      const v = Object.values(params).find(x => typeof x === 'string' || typeof x === 'number');
      return v != null ? String(v) : '';
    };

    const sectionList = () =>
      SECTIONS.map(s => `- "${s.title}" (pages ${s.page}${s.endPage > s.page ? '–' + s.endPage : ''})`).join('\n');

    controllerRef.current = {
      listSections: () =>
        `The proposal "${PDF_TITLE}" has ${TOTAL_PAGES} pages with these sections:\n${sectionList()}`,

      getCurrentPage: () => {
        const p = currentPageRef.current;
        const s = sectionForPage(p);
        return `The visitor is currently viewing page ${p} of ${TOTAL_PAGES}${s ? `, in the section "${s.title}"` : ''}.`;
      },

      search: (params) => {
        const q = pickName(params).toLowerCase().trim();
        if (!q) return 'Empty search query. Please provide a search term.';
        const snippetAt = (text, idx, len) =>
          text.slice(Math.max(0, idx - 100), idx + len + 140).replace(/\s+/g, ' ');
        let hits = [];
        // 1) exact phrase match
        pageText.forEach((text, i) => {
          const idx = text.toLowerCase().indexOf(q);
          if (idx >= 0) {
            const s = sectionForPage(i + 1);
            hits.push(`Page ${i + 1}${s ? ` (section "${s.title}")` : ''}: …${snippetAt(text, idx, q.length)}…`);
          }
        });
        // 2) fallback: individual keywords, pages ranked by how many match
        if (!hits.length) {
          const tokens = q.split(/\s+/).filter(w => w.length > 3);
          const scored = [];
          pageText.forEach((text, i) => {
            const lower = text.toLowerCase();
            const found = tokens.filter(t => lower.includes(t));
            if (found.length) scored.push({ i, found, idx: lower.indexOf(found[0]) });
          });
          scored.sort((a, b) => b.found.length - a.found.length);
          hits = scored.slice(0, 5).map(({ i, found, idx }) => {
            const s = sectionForPage(i + 1);
            return `Page ${i + 1}${s ? ` (section "${s.title}")` : ''} (matched: ${found.join(', ')}): …${snippetAt(pageText[i], idx, found[0].length)}…`;
          });
        }
        if (!hits.length) {
          return `No matches for "${q}" anywhere in the proposal. This information is NOT in the proposal — you must answer with the out-of-scope message: "This is out of scope of this proposal. If you want to know anything about this proposal, you can ask me." (German: "Das liegt außerhalb dieses Angebots. Wenn Sie etwas über dieses Angebot wissen möchten, fragen Sie mich gern.")`;
        }
        return `Found ${hits.length} matching page(s) for "${q}" (showing up to 5). Answer ONLY from these snippets — if they do not answer the question, use the out-of-scope message:\n${hits.slice(0, 5).join('\n')}`;
      },

      gotoSection: (params) => {
        const name = pickName(params);
        const match = findSection(name);
        if (!match || !match.section) {
          return `Could not find a section matching "${name}". Valid sections:\n${sectionList()}`;
        }
        scrollToPage(match.page);
        return `Scrolled to "${match.section.title}" (page ${match.page}).`;
      },

      highlightSection: (params) => {
        const name = pickName(params);
        const match = findSection(name);
        if (!match || !match.section) {
          return `Could not find a section matching "${name}". Valid sections:\n${sectionList()}`;
        }
        setSpotlight(match.section.id);
        scrollToPage(match.page);
        return `Now showing and spotlighting "${match.section.title}" (pages ${match.section.page}–${match.section.endPage}). The visitor can see it highlighted — continue with your explanation.`;
      },

      clearHighlight: () => {
        setSpotlight(null);
        return 'Spotlight removed.';
      },
    };
    // Expose for debugging / manual driving from the console.
    if (typeof window !== 'undefined') window.__proposal = controllerRef;
  }, [scrollToPage]);

  const activeSection = sectionForPage(currentPage);
  const spotlitSection = spotlight ? SECTIONS.find(s => s.id === spotlight) : null;

  const handleSidebarClick = (s) => {
    setSpotlight(s.id);
    scrollToPage(s.page);
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-head">
          <h1>{PDF_TITLE}</h1>
          <div className="subtitle">{PDF_SUBTITLE}</div>
          <div className="ready">Bereit — {numPages || TOTAL_PAGES} Seiten</div>
        </div>
        <nav className="section-list">
          {SECTIONS.map((s) => {
            const isSpotlit = spotlight === s.id;
            const isActive = activeSection && activeSection.id === s.id;
            return (
              <button
                key={s.id}
                className={`section-item${isSpotlit ? ' spotlit' : isActive ? ' active' : ''}`}
                onClick={() => handleSidebarClick(s)}
              >
                {s.title}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main" ref={containerRef} onScroll={onScroll}>
        <Document
          file="/proposal.pdf"
          onLoadSuccess={onDocLoad}
          loading={
            <div className="boot" style={{ background: 'transparent', height: '80vh' }}>
              <div className="boot-spinner" />
              <p style={{ color: '#e8ecec' }}>Angebot wird geladen…</p>
            </div>
          }
          error={<div className="boot" style={{ background: 'transparent' }}><p style={{ color: '#fff' }}>PDF konnte nicht geladen werden.</p></div>}
        >
          <div className="pages">
            {Array.from({ length: numPages }, (_, i) => {
              const pageNum = i + 1;
              const sec = sectionForPage(pageNum);
              const isHighlighted = spotlitSection && pageNum >= spotlitSection.page && pageNum <= spotlitSection.endPage;
              const showChip = spotlitSection && pageNum === spotlitSection.page;
              const b = pageBounds[i] || { x: 0.03, y: 0.04, w: 0.94, h: 0.92 };
              return (
                <div
                  key={pageNum}
                  ref={(el) => { pageRefs.current[i] = el; }}
                  className={`page-wrap${isHighlighted ? ' highlighted' : ''}`}
                  data-page={pageNum}
                  data-section={sec ? sec.id : ''}
                >
                  {isHighlighted && (
                    <div
                      className="spotlight-box"
                      style={{
                        left: `${b.x * 100}%`,
                        top: `${b.y * 100}%`,
                        width: `${b.w * 100}%`,
                        height: `${b.h * 100}%`,
                      }}
                    >
                      {showChip && <div className="section-chip">{spotlitSection.title}</div>}
                    </div>
                  )}
                  <LazyPage pageNumber={pageNum} width={PAGE_WIDTH} ratio={ratio} />
                </div>
              );
            })}
          </div>
        </Document>
      </main>

      <VoiceAgent controllerRef={controllerRef} />
    </div>
  );
}
