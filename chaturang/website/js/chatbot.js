// Chaturanga Website — Chatbot JS
// Rule-based Q&A bot for the Chaturanga website

(function () {
  'use strict';

  // ── DOM ───────────────────────────────────────────────────────────────
  const fab        = document.getElementById('chatbotFab');
  const panel      = document.getElementById('chatbotPanel');
  const closeBtn   = document.getElementById('chatbotClose');
  const messages   = document.getElementById('chatbotMessages');
  const input      = document.getElementById('chatbotInput');
  const sendBtn    = document.getElementById('chatbotSend');
  const quickReplies = document.getElementById('quickReplies');

  if (!fab || !panel) return;

  // ── Open / Close ───────────────────────────────────────────────────────
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input && input.focus();
  });
  if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== fab) {
      panel.classList.remove('open');
    }
  });

  // ── Append message ─────────────────────────────────────────────────────
  function appendMsg(text, isUser) {
    const wrap = document.createElement('div');
    wrap.className = isUser ? 'user-msg' : 'bot-msg';
    const bubble = document.createElement('span');
    bubble.className = isUser ? 'user-bubble' : 'bot-bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br/>');
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'bot-msg';
    wrap.id = 'typingIndicator';
    const bubble = document.createElement('span');
    bubble.className = 'bot-bubble typing-bubble';
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  // ── Send Message ───────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (!text.trim()) return;
    
    // Hide quick replies
    if (quickReplies) quickReplies.style.display = 'none';
    
    appendMsg(text, true);
    showTyping();
    
    try {
      // Use the new Sarvam AI powered RAG API
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: text })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      hideTyping();
      
      if (data.success && data.answer) {
        appendMsg(data.answer, false);
      } else {
        appendMsg("Forgive me, warrior. My knowledge seems obscured at the moment. Please try again later.", false);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      hideTyping();
      appendMsg("I am unable to reach the scholars at the moment. Please check your connection and try again.", false);
    }
  }

  if (sendBtn) sendBtn.addEventListener('click', () => { sendMessage(input.value); input.value = ''; });
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { sendMessage(input.value); input.value = ''; }
    });
  }

  // Quick reply buttons
  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => { sendMessage(btn.dataset.q); });
  });

})();
