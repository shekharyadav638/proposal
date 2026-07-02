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

const SCOPE_RULES = `STRICT SCOPE RULES (enforced by the application):
You are the voice guide for the OpenSense Labs proposal "bayern-evangelisch.de NEXT" (54 pages). You may ONLY answer with information that is written in this proposal document.
1. Before answering ANY factual question (names, roles, team, prices, dates, technology, references), you MUST call the mdsg_search tool and base your answer strictly on the returned snippets. Then call mdsg_highlight_section to show the visitor the source section.
2. If mdsg_search returns no relevant result, or the question is about anything not written in the proposal (general knowledge, OpenSense Labs beyond what the proposal states, other companies, other topics), you MUST reply exactly: "${OUT_OF_SCOPE_EN}" — or in German: "${OUT_OF_SCOPE_DE}". Use the language the visitor is speaking. Do not add any other information.
3. Never invent or recall from memory any names, roles, numbers or facts. If it is not in the proposal text, it does not exist for you.`;

const PhoneIcon = ({ hangup }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
    style={hangup ? { transform: 'rotate(135deg)' } : undefined}
  >
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z" />
  </svg>
);

function ConsentDialog({ onAccept, onCancel }) {
  return (
    <div className="consent-overlay" onClick={onCancel}>
      <div className="consent-card" onClick={(e) => e.stopPropagation()}>
        <h2>Nutzungsbedingungen</h2>
        <p>
          Indem ich auf „Zustimmen“ klicke, willige ich bei jeder Interaktion mit diesem
          KI-Agenten in die Aufzeichnung, Speicherung und Weitergabe meiner Kommunikation an
          Drittanbieter ein, wie in der Datenschutzerklärung beschrieben. Wenn Sie nicht
          möchten, dass Ihre Gespräche aufgezeichnet werden, nutzen Sie diesen Dienst bitte
          nicht.
        </p>
        <div className="consent-actions">
          <button className="consent-cancel" onClick={onCancel}>Abbrechen</button>
          <button className="consent-accept" onClick={onAccept}>Zustimmen</button>
        </div>
      </div>
    </div>
  );
}

function Widget({ controllerRef }) {
  const [error, setError] = useState(null);
  const [showConsent, setShowConsent] = useState(false);

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
    setShowConsent(false);
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
      {showConsent && <ConsentDialog onAccept={accept} onCancel={() => setShowConsent(false)} />}
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
              onClick={() => setShowConsent(true)}
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
