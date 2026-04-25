'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import { apiFetch } from '../../lib/api';
import { timeAgo } from '../dashboard/services';
import Link from 'next/link';

const LBC = {
  orange: '#E85C0D', orangeLight: '#FFF4EE', gray50: '#F7F7F7', gray100: '#F2F2F2',
  gray200: '#E5E5E5', gray500: '#888888', gray700: '#444444', gray900: '#1A1A1A',
  white: '#FFFFFF', green: '#1A7A4A', greenLight: '#EAFAF1',
} as const;

interface Participant { id: number; first_name: string; last_name: string; email: string }
interface Conversation {
  id: string;
  listing: { id: number; title: string; slug: string };
  buyer: Participant;
  seller: Participant;
  last_message_at: string;
  is_open: boolean;
}
interface Message {
  id: string;
  content: string;
  sender: number;
  created_at: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    apiFetch<{ results?: Conversation[] } | Conversation[]>('messages/conversations/')
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setConversations(list);
        if (list.length > 0) setActive(list[0]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const loadMessages = useCallback((conv: Conversation) => {
    apiFetch<Message[]>(`messages/conversations/${conv.id}/messages/`)
      .then(setMessages);
  }, []);

  useEffect(() => {
    if (active) loadMessages(active);
  }, [active, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!active || !text.trim()) return;
    setSending(true);
    try {
      const msg = await apiFetch<Message>(`messages/conversations/${active.id}/messages/`, {
        method: 'POST',
        body: JSON.stringify({ content: text.trim() }),
      });
      setMessages(prev => [...prev, msg]);
      setText('');
    } finally { setSending(false); }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 700, margin: '80px auto', textAlign: 'center' }}>
        <p>Connecte-toi pour voir tes messages.</p>
        <Link href="/auth/login?next=/messages" style={{ color: LBC.orange, fontWeight: 700 }}>Se connecter</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', minHeight: '80vh' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 24, color: LBC.gray900 }}>💬 Mes messages</h1>

      {loading ? (
        <p style={{ color: LBC.gray500 }}>Chargement…</p>
      ) : conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: LBC.gray500 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <p>Aucune conversation pour le moment.</p>
          <Link href="/search" style={{ color: LBC.orange, fontWeight: 700 }}>Parcourir les annonces →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 'calc(100vh - 200px)' }}>
          {/* Liste conversations */}
          <div style={{ background: LBC.white, border: `1px solid ${LBC.gray200}`, borderRadius: 10, overflowY: 'auto' }}>
            {conversations.map(conv => {
              const other = conv.buyer.id === user.id ? conv.seller : conv.buyer;
              const isActive = active?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActive(conv)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none',
                    borderBottom: `1px solid ${LBC.gray100}`, cursor: 'pointer',
                    background: isActive ? LBC.orangeLight : LBC.white,
                    borderLeft: isActive ? `3px solid ${LBC.orange}` : '3px solid transparent',
                  }}
                >
                  <div style={{ fontWeight: 700, color: LBC.gray900, fontSize: 14 }}>
                    {other.first_name || other.email}
                  </div>
                  <div style={{ fontSize: 12, color: LBC.gray700, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.listing.title}
                  </div>
                  <div style={{ fontSize: 11, color: LBC.gray500, marginTop: 4 }}>
                    {timeAgo(conv.last_message_at)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Vue conversation */}
          {active ? (
            <div style={{ background: LBC.white, border: `1px solid ${LBC.gray200}`, borderRadius: 10, display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{ padding: '12px 16px', borderBottom: `1px solid ${LBC.gray200}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {(active.buyer.id === user.id ? active.seller : active.buyer).first_name}
                  </div>
                  <Link href={`/annonce/${active.listing.slug}`} style={{ fontSize: 12, color: LBC.orange, textDecoration: 'none' }}>
                    📦 {active.listing.title}
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && <p style={{ color: LBC.gray500, textAlign: 'center' }}>Aucun message. Démarrez la conversation !</p>}
                {messages.map(msg => {
                  const isMine = msg.sender === user.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMine ? LBC.orange : LBC.gray100,
                        color: isMine ? LBC.white : LBC.gray900,
                        fontSize: 14, lineHeight: 1.5,
                      }}>
                        <div>{msg.content}</div>
                        <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: 'right' }}>{timeAgo(msg.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: 12, borderTop: `1px solid ${LBC.gray200}`, display: 'flex', gap: 8 }}>
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
                  placeholder="Écrire un message…"
                  style={{ flex: 1, border: `1px solid ${LBC.gray200}`, borderRadius: 8, padding: '10px 14px', fontSize: 14 }}
                />
                <button
                  onClick={() => { void handleSend(); }}
                  disabled={sending || !text.trim()}
                  style={{ background: LBC.orange, color: LBC.white, border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}
                >
                  {sending ? '…' : 'Envoyer'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: LBC.gray500 }}>
              Sélectionnez une conversation
            </div>
          )}
        </div>
      )}
    </div>
  );
}
