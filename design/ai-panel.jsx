// ── AI Assistant panel ─────────────────────────────────────────────────
function AiPanel({ onClose, onCollapse, context, initialWelcome, messages: extMessages, setMessages: extSetMessages }) {
  const welcome = initialWelcome || 'Привет! Я Виртуальный РОП, помогу проанализировать звонки команды. С чего начнём?';
  const initial = [{ role: 'assistant', content: welcome }];
  const [localMessages, setLocalMessages] = useState(extMessages || initial);
  const messages = localMessages;
  const setMessages = (updater) => {
    setLocalMessages(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (extSetMessages) extSetMessages(next);
      return next;
    });
  };
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const resetChat = () => {
    setMessages([{ role: 'assistant', content: welcome }]);
    setInput('');
    setThinking(false);
  };
  const hasUserSent = messages.some(m => m.role === 'user');

  const send = (text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const responses = {
        'почему упали продажи': 'По данным AI-анализа за неделю основные причины снижения:\n\n1. Возражение «Дорого» — не отрабатывается в 38% кейсов (vs 12% у топ-менеджеров)\n2. Не выясняется бюджет клиента — пропущено в 24 звонках\n3. Слабое закрытие: только 41% звонков заканчивается next step\n\nРекомендую провести разбор по технике SPIN с командой.',
        'кто худший': 'За последние 7 дней наибольшее количество критических замечаний у:\n\n• Сидоров К. — 6 проблемных звонков, ср. балл 4.2\n• Михайлова Е. — 4 проблемных звонка, ср. балл 5.1\n\nОбоим нужна индивидуальная работа. Хотите, чтобы я составил план разбора?',
        'обучение': 'На основе анализа звонков предлагаю 3 темы для обучения:\n\n1. **Работа с возражением «Дорого»** (актуально для 4 менеджеров)\n2. **Выявление потребностей и бюджета** (5 менеджеров)\n3. **Закрытие звонка с next step** (вся команда)\n\nГотов сгенерировать сценарий тренинга?',
      };
      const lower = text.toLowerCase();
      let response = 'Хороший вопрос. Чтобы дать точный ответ, проанализирую звонки команды… В среднем команда показывает 6.8/10. Узкие места — отработка возражений и закрытие звонка. Хотите углубиться в какой-то конкретный аспект?';
      for (const k in responses) if (lower.includes(k)) { response = responses[k]; break; }
      setMessages(m => [...m, { role: 'assistant', content: response }]);
      setThinking(false);
    }, 1100);
  };

  const quickPrompts = [
    'Почему упали продажи на этой неделе?',
    'Кому из менеджеров нужна помощь?',
    'Какие темы обучения актуальны?',
    'Сравни с прошлым месяцем',
  ];

  return (
    <aside className="ai-panel">
      <div className="ai-header">
        <div className="ai-header-info">
          <div className="ai-logo"><Icon.ai size={16}/></div>
          <div className="ai-title-stack">
            <div className="ai-title">Нейроаналитик</div>
            <div className="ai-subtitle"><span className="live-dot"></span> Анализирует команду А</div>
          </div>
        </div>
        <div style={{display:'flex', gap:6}}>
          <button className="icon-btn" onClick={onCollapse} title="Свернуть — диалог сохранится" style={{width:30, height:30}}><Icon.chevDown size={14} style={{transform:'rotate(-90deg)'}}/></button>
          <button className="icon-btn" onClick={onClose} title="Закрыть" style={{width:30, height:30}}><Icon.x size={14}/></button>
        </div>
      </div>

      <div className="ai-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <Fragment key={i}>
            {m.role === 'user' ? (
              <div className="ai-msg-user">{m.content}</div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:6, alignSelf:'flex-start', maxWidth:'92%'}}>
                <div className="ai-msg-assistant">{m.content}</div>
                {i > 0 && <div className="ai-msg-actions">
                  <button className="ai-action-btn"><Icon.copy size={11}/></button>
                  <button className="ai-action-btn"><Icon.thumbsUp size={11}/></button>
                  <button className="ai-action-btn"><Icon.thumbsDown size={11}/></button>
                </div>}
              </div>
            )}
          </Fragment>
        ))}
        {thinking && <div className="ai-msg-assistant"><div className="ai-typing"><span className="ai-typing-dot"></span><span className="ai-typing-dot" style={{animationDelay:'.15s'}}></span><span className="ai-typing-dot" style={{animationDelay:'.3s'}}></span><span style={{fontSize:12,color:'#6366F1',marginLeft:4}}>Анализирую данные...</span></div></div>}
      </div>

      {messages.length <= 2 && (
        <div className="ai-quick">
          <div style={{fontSize:12, fontWeight:700, color:'var(--muted-foreground)', textTransform:'uppercase', letterSpacing:'0.06em', padding:'4px 0 2px'}}>Подсказки</div>
          {quickPrompts.map(q => (
            <button key={q} className="ai-quick-btn" onClick={()=>send(q)}>{q}</button>
          ))}
        </div>
      )}

      {hasUserSent && (
        <div style={{display:'flex', justifyContent:'flex-start', padding:'4px 12px 0'}}>
          <button
            type="button"
            onClick={resetChat}
            className="ai-reset-btn"
            title="Очистить диалог и начать заново">
            <Icon.refresh size={12}/> Начать заново
          </button>
        </div>
      )}
      <div className="ai-input-wrap">
        <div className="ai-input-bar">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(input); }}
            placeholder="Спросите Нейроаналитика..."
          />
          <button className="player-btn" onClick={()=>send(input)} style={{width:28, height:28}}>
            <Icon.send size={12}/>
          </button>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11, color:'var(--muted-foreground)'}}>
          <span>Контекст: команда А · {context || 'дашборд'}</span>
          <span>⏎ отправить</span>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { AiPanel });
