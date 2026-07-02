'use client';

import { useState, useCallback } from 'react';
import {
  ConversationProvider,
  useConversationControls,
  useConversationStatus,
  useConversationMode,
  useConversationClientTool,
} from '@elevenlabs/react';

const AGENT_ID =
  process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_6601kwgghty0er9rqj5c2jtyk0db';

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
        <h2>Terms and conditions</h2>
        <p>
          By clicking &quot;Agree,&quot; and each time I interact with this AI agent, I consent
          to the recording, storage, and sharing of my communications with third-party service
          providers, and as described in the Privacy Policy. If you do not wish to have your
          conversations recorded, please refrain from using this service.
        </p>
        <div className="consent-actions">
          <button className="consent-cancel" onClick={onCancel}>Cancel</button>
          <button className="consent-accept" onClick={onAccept}>Accept</button>
        </div>
      </div>
    </div>
  );
}

function Widget({ controllerRef }) {
  const [error, setError] = useState(null);
  const [showConsent, setShowConsent] = useState(false);

  const { startSession, endSession } = useConversationControls();
  const { status, message } = useConversationStatus();
  const { isSpeaking } = useConversationMode();

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
      setError(e?.message || 'Microphone access is required.');
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
              <span className="agent-chip">{isSpeaking ? 'Talk to interrupt' : 'Listening…'}</span>
            </div>
            <button className="agent-end-btn" onClick={() => endSession()}>
              <PhoneIcon hangup /> End
            </button>
          </>
        ) : (
          <>
            <div className="agent-row">
              <div className="agent-orb" />
              <div className="agent-title">Talk to this proposal</div>
            </div>
            <button
              className="agent-btn"
              onClick={() => setShowConsent(true)}
              disabled={connecting}
            >
              <PhoneIcon /> {connecting ? 'Connecting…' : 'Talk to this proposal'}
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
