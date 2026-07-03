'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ConversationProvider,
  useConversationControls,
  useConversationStatus,
  useConversationMode,
  useConversationClientTool,
} from '@elevenlabs/react';

const AGENT_ID =
  process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_6601kwgghty0er9rqj5c2jtyk0db';

const OUT_OF_SCOPE_EN =
  'This is out of scope of this proposal. If you want to know anything about this proposal, you can ask me.';
const OUT_OF_SCOPE_DE =
  'Das liegt außerhalb dieses Angebots. Wenn Sie etwas über dieses Angebot wissen möchten, fragen Sie mich gern.';

const SCOPE_RULES = `SCOPE RULES (enforced by the application):
You are the voice guide for the OpenSense Labs proposal "bayern-evangelisch.de NEXT" (54 pages). Answer using the information written in this proposal document.
1. For any factual question (names, roles, team, prices, dates, technology, references), FIRST call the mdsg_search tool and read the returned snippets. Base your answer on them. When a snippet lists a role directly followed by a name (a team roster, e.g. "Engagement Lead Christoph Mangold Delivery Manager Florian Bunk …"), the name after each role IS the person in that role — read it out. After answering you MAY call mdsg_highlight_section to show the visitor the source section.
2. Answer confidently whenever the snippets contain the information, even partially. This proposal DOES include the full team structure and named people — Engagement Lead, Delivery Manager, Project Manager, Tech Lead, Delivery Lead, developers and DevOps, with names, seniority and locations (pages 38–52). Never refuse a team, role or "who is …" question when search returns team pages.
3. Only reply that something is out of scope when mdsg_search explicitly reports NO matches, OR when the question is clearly unrelated to this proposal (general knowledge, other companies, other topics). In that case reply exactly: "${OUT_OF_SCOPE_EN}" — or in German: "${OUT_OF_SCOPE_DE}". Use the language the visitor is speaking. Do not add any other information.
4. Never invent or recall from memory any names, roles, numbers or facts. If it is not in the returned snippets, do not state it.`;

const PhoneIcon = ({ hangup }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
    style={hangup ? { transform: 'rotate(135deg)' } : undefined}
  >
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z" />
  </svg>
);

function Widget({ controllerRef }) {
  const [error, setError] = useState(null);

  const { startSession, endSession, sendContextualUpdate } = useConversationControls();
  const { status, message } = useConversationStatus();
  const { isSpeaking } = useConversationMode();

  // Push the scope guardrails into the conversation as soon as it connects.
  const rulesSentRef = useRef(false);
  useEffect(() => {
    if (status === 'connected' && !rulesSentRef.current) {
      rulesSentRef.current = true;
      try {
        sendContextualUpdate(SCOPE_RULES);
      } catch (e) {
        console.warn('Could not send scope rules:', e);
      }
    }
    if (status === 'disconnected') rulesSentRef.current = false;
  }, [status, sendContextualUpdate]);

  useConversationClientTool('mdsg_list_sections', async () =>
    controllerRef.current.listSections()
  );
  useConversationClientTool('mdsg_get_current_page', async () =>
    controllerRef.current.getCurrentPage()
  );
  useConversationClientTool('mdsg_search', async (params) =>
    controllerRef.current.search(params)
  );
  useConversationClientTool('mdsg_goto_section', async (params) =>
    controllerRef.current.gotoSection(params)
  );
  useConversationClientTool('mdsg_highlight_section', async (params) =>
    controllerRef.current.highlightSection(params)
  );
  useConversationClientTool('mdsg_clear_highlight', async () =>
    controllerRef.current.clearHighlight()
  );

  const connected = status === 'connected';
  const connecting = status === 'connecting';

  const accept = useCallback(async () => {
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      startSession({ agentId: AGENT_ID, connectionType: 'websocket' });
    } catch (e) {
      console.error(e);
      setError('Mikrofonzugriff ist erforderlich.');
    }
  }, [startSession]);

  return (
    <>
      <div className="agent-widget">
        {connected ? (
          <>
            <div className="agent-row">
              <div className={`agent-orb${isSpeaking ? ' speaking' : ' listening'}`} />
              <span className="agent-chip">{isSpeaking ? 'Sprechen zum Unterbrechen' : 'Ich höre zu…'}</span>
            </div>
            <button className="agent-end-btn" onClick={() => endSession()}>
              <PhoneIcon hangup /> Beenden
            </button>
          </>
        ) : (
          <>
            <div className="agent-row">
              <div className="agent-orb" />
              <div className="agent-title">FlowEngage AI</div>
            </div>
            <button
              className="agent-btn"
              onClick={accept}
              disabled={connecting}
            >
              <PhoneIcon /> {connecting ? 'Verbindung wird hergestellt…' : 'Mit diesem Angebot sprechen'}
            </button>
          </>
        )}
        {(error || (status === 'error' && message)) && (
          <div className="agent-error">{error || message}</div>
        )}
      </div>
    </>
  );
}

export default function VoiceAgent({ controllerRef }) {
  return (
    <ConversationProvider>
      <Widget controllerRef={controllerRef} />
    </ConversationProvider>
  );
}
