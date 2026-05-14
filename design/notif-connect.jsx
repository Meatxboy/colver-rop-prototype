// ── Подключение мессенджеров для уведомлений ────────────────────────────
// Прототипный flow: выбор канала → Telegram (генерация кода + qr + кнопка
// «Подтвердить») → Email (ввод адреса + код из «письма»). Также окно
// «Управление каналами» открывается из футера дровера.
//
// Для прототипа реальной интеграции нет: код «отправляется» только в
// state, для подтверждения достаточно нажать «Я ввёл код в боте» (для
// Telegram) или ввести любые 12 символов кода, совпадающего с
// сгенерированным (для Email).

// 12-символьный одноразовый код (латиница + цифры + символы).
function generateConnectCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
  let out = '';
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// ── Шаг 1: выбор канала ──────────────────────────────────────────────────
function ChooseChannelModal({ onClose, onPickTelegram, onPickEmail }) {
  const z = useModalZ();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  return (
    <div
      style={{position:'fixed',inset:0,zIndex:z,background:'rgba(9,9,11,.5)',
        backdropFilter:'blur(3px)',display:'flex',alignItems:'center',
        justifyContent:'center',padding:'24px 16px'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:480,
        boxShadow:'0 32px 80px rgba(0,0,0,.22)',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',
          display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:16,fontWeight:700}}>Выбор канала уведомлений</span>
          <button onClick={onClose} style={{background:'none',border:0,cursor:'pointer',
            padding:5,color:'var(--muted-foreground)',display:'flex',alignItems:'center',borderRadius:6}}
            aria-label="Закрыть">
            <Icon.x size={16}/>
          </button>
        </div>
        <div style={{padding:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <button onClick={onPickTelegram} className="channel-card">
            <div className="channel-icon" style={{background:'#229ED9'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
            </div>
            <div style={{fontSize:14,fontWeight:600,marginTop:10}}>Telegram bot</div>
            <div style={{fontSize:12,color:'var(--muted-foreground)',marginTop:4,lineHeight:1.4}}>
              Мгновенные пуши прямо в мессенджер
            </div>
          </button>
          <button onClick={onPickEmail} className="channel-card">
            <div className="channel-icon" style={{background:'#475569'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div style={{fontSize:14,fontWeight:600,marginTop:10}}>Email</div>
            <div style={{fontSize:12,color:'var(--muted-foreground)',marginTop:4,lineHeight:1.4}}>
              Дублирование уведомлений на почту
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Telegram bot ─────────────────────────────────────────────────────────
function TelegramConnectModal({ onClose, onSuccess }) {
  const z = useModalZ();
  const [code, setCode] = useState(() => generateConnectCode());
  // Симулированная «ошибка» — для демонстрации flow.
  const [errorState, setErrorState] = useState(null); // null | 'expired' | 'wrong' | 'tech'
  // Для прототипа: 10 минут не успеют истечь в реальном времени, поэтому
  // эмуляция «истечения» — отдельная кнопка.
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const regenerate = () => { setCode(generateConnectCode()); setErrorState(null); setCopied(false); };
  const copyCode = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:z,background:'rgba(9,9,11,.5)',
        backdropFilter:'blur(3px)',display:'flex',alignItems:'center',
        justifyContent:'center',padding:'24px 16px'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:480,
        boxShadow:'0 32px 80px rgba(0,0,0,.22)',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',
          display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:16,fontWeight:700}}>Подключение Telegram bot</span>
          <button onClick={onClose} style={{background:'none',border:0,cursor:'pointer',
            padding:5,color:'var(--muted-foreground)',display:'flex',alignItems:'center',borderRadius:6}}>
            <Icon.x size={16}/>
          </button>
        </div>
        <div style={{padding:'18px 20px',display:'flex',flexDirection:'column',gap:14}}>

          {errorState === 'expired' ? (
            <div style={{padding:'12px 14px',background:'#FEE2E2',color:'#B91C1C',
              borderRadius:8,fontSize:13,lineHeight:1.5}}>
              Код устарел, запросите новый.
              <button onClick={regenerate} style={{display:'block',marginTop:8,
                padding:'6px 12px',background:'#fff',border:'1px solid var(--border)',
                borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                Сгенерировать новый код
              </button>
            </div>
          ) : errorState === 'tech' ? (
            <div style={{padding:'12px 14px',background:'#FEE2E2',color:'#B91C1C',
              borderRadius:8,fontSize:13}}>
              Не удалось подключить, попробуйте позже.
            </div>
          ) : (
            <>
              {/* QR-плейсхолдер */}
              <div style={{display:'flex',justifyContent:'center'}}>
                <div style={{width:140,height:140,background:'#fff',
                  border:'1px solid var(--border)',borderRadius:8,padding:8,
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {/* SVG-плейсхолдер вместо реального QR */}
                  <svg width="120" height="120" viewBox="0 0 100 100">
                    <rect x="0" y="0" width="100" height="100" fill="#fff"/>
                    {Array.from({length:25}).map((_,i)=>(
                      <rect key={i}
                        x={(i%7)*14} y={Math.floor(i/7)*14}
                        width={10} height={10}
                        fill={[3,7,11,12,15,17,19,23].includes(i) ? '#000' : '#222'}
                        opacity={[1,5,9,13,16,20].includes(i) ? 0 : 1}/>
                    ))}
                    <rect x="6" y="6" width="22" height="22" fill="none" stroke="#000" strokeWidth="3"/>
                    <rect x="72" y="6" width="22" height="22" fill="none" stroke="#000" strokeWidth="3"/>
                    <rect x="6" y="72" width="22" height="22" fill="none" stroke="#000" strokeWidth="3"/>
                  </svg>
                </div>
              </div>

              <div style={{fontSize:13,color:'var(--muted-foreground)',lineHeight:1.5,textAlign:'center'}}>
                Отсканируйте QR-код с камеры мобильного телефона или перейдите по ссылке.
                В открывшемся боте нажмите «Старт» и введите код.
              </div>

              {/* Код */}
              <div style={{display:'flex',alignItems:'center',gap:8,
                background:'var(--muted)',border:'1px solid var(--border)',
                padding:'10px 14px',borderRadius:8,justifyContent:'space-between'}}>
                <span style={{fontFamily:'SF Mono, Menlo, monospace',fontSize:15,
                  fontWeight:700,letterSpacing:'.05em'}}>{code}</span>
                <button onClick={copyCode} style={{background:'none',border:0,
                  cursor:'pointer',padding:4,color:'var(--primary)',display:'flex',
                  alignItems:'center',gap:5,fontSize:12,fontWeight:600}}
                  title="Скопировать код">
                  {copied ? <><Icon.check size={13}/> Скопировано</> : <><Icon.copy size={13}/> Копировать</>}
                </button>
              </div>

              <a href="https://t.me/colver_demo_bot" target="_blank" rel="noopener"
                style={{display:'inline-flex',justifyContent:'center',alignItems:'center',gap:6,
                  padding:'8px 14px',background:'#229ED9',color:'#fff',
                  borderRadius:8,fontWeight:600,fontSize:13,textDecoration:'none'}}>
                Перейти в Telegram
              </a>

              {errorState === 'wrong' && (
                <div style={{padding:'8px 12px',background:'#FEF3C7',color:'#92400E',
                  borderRadius:6,fontSize:12}}>
                  Неверный код или срок действия кода истёк. Попробуйте снова.
                </div>
              )}
            </>
          )}
        </div>

        <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',
          background:'#FAFAFA',display:'flex',gap:8,justifyContent:'space-between',alignItems:'center'}}>
          {/* Прототипный «симулятор» для демонстрации ошибок */}
          <div style={{display:'flex',gap:6}}>
            <button onClick={() => setErrorState('expired')}
              style={{fontSize:11,padding:'4px 8px',background:'none',
                border:'1px dashed var(--border)',borderRadius:4,
                color:'var(--muted-foreground)',cursor:'pointer'}}
              title="Прототип: симулировать истёкший код">
              demo: expired
            </button>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Button variant="outline" size="md" onClick={onClose}>Отмена</Button>
            <Button variant="default" size="md"
              onClick={() => { onSuccess(); }}>
              <Icon.check size={13}/> Я ввёл код в боте
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Email ────────────────────────────────────────────────────────────────
function EmailConnectModal({ onClose, onSuccess }) {
  const z = useModalZ();
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'success'
  const [email, setEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const sendCode = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Введите корректный email');
      return;
    }
    setError(null);
    const code = generateConnectCode();
    setGeneratedCode(code);
    setStep('code');
    // В реальном проекте здесь POST на бэк, который отправит письмо.
    // Для прототипа выводим код в console, чтобы можно было ввести.
    console.info('[Prototype] Email code:', code);
  };

  const resend = () => {
    const code = generateConnectCode();
    setGeneratedCode(code);
    setEnteredCode('');
    setError(null);
    console.info('[Prototype] Email code resent:', code);
  };

  const confirm = () => {
    if (enteredCode.trim() === generatedCode) {
      onSuccess(email);
    } else {
      setError('Неверный код или срок действия кода истёк. Попробуйте снова.');
    }
  };

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:z,background:'rgba(9,9,11,.5)',
        backdropFilter:'blur(3px)',display:'flex',alignItems:'center',
        justifyContent:'center',padding:'24px 16px'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:440,
        boxShadow:'0 32px 80px rgba(0,0,0,.22)',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',
          display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:16,fontWeight:700}}>Подключение Email</span>
          <button onClick={onClose} style={{background:'none',border:0,cursor:'pointer',
            padding:5,color:'var(--muted-foreground)',display:'flex',alignItems:'center',borderRadius:6}}>
            <Icon.x size={16}/>
          </button>
        </div>

        <div style={{padding:'18px 20px',display:'flex',flexDirection:'column',gap:14}}>
          {step === 'email' && (
            <>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:'var(--muted-foreground)',
                  textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>Адрес почты</div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{width:'100%',padding:'10px 12px',border:'1px solid var(--border)',
                    borderRadius:6,fontSize:14,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && sendCode()}
                />
              </div>
              {error && (
                <div style={{padding:'8px 12px',background:'#FEF3C7',color:'#92400E',
                  borderRadius:6,fontSize:12}}>{error}</div>
              )}
            </>
          )}

          {step === 'code' && (
            <>
              <div style={{fontSize:13,color:'var(--muted-foreground)',lineHeight:1.5}}>
                На адрес <strong style={{color:'var(--foreground)'}}>{email}</strong> отправлено
                письмо с кодом подтверждения. Введите код. Если письма с кодом нет, проверьте
                папку «Спам».
              </div>
              <div style={{padding:'8px 10px',background:'#EFF6FF',color:'#1D4ED8',
                borderRadius:6,fontSize:11,lineHeight:1.5}}>
                <strong>Прототип:</strong> в реальном проекте код приходит письмом. Здесь же
                код для теста: <code style={{fontFamily:'SF Mono,Menlo,monospace',fontWeight:700}}>{generatedCode}</code>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:'var(--muted-foreground)',
                  textTransform:'uppercase',letterSpacing:.4,marginBottom:5}}>Код из письма</div>
                <input
                  value={enteredCode}
                  onChange={e => setEnteredCode(e.target.value)}
                  placeholder="12-символьный код"
                  style={{width:'100%',padding:'10px 12px',border:'1px solid var(--border)',
                    borderRadius:6,fontSize:14,outline:'none',boxSizing:'border-box',
                    fontFamily:'SF Mono, Menlo, monospace',letterSpacing:'.05em'}}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && confirm()}
                />
              </div>
              {error && (
                <div style={{padding:'8px 12px',background:'#FEF3C7',color:'#92400E',
                  borderRadius:6,fontSize:12}}>{error}</div>
              )}
              <button onClick={resend} style={{background:'none',border:0,padding:0,
                color:'var(--primary)',cursor:'pointer',fontSize:12,textAlign:'left',
                textDecoration:'underline'}}>
                Отправить код повторно
              </button>
            </>
          )}
        </div>

        <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',
          background:'#FAFAFA',display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Button variant="outline" size="md" onClick={onClose}>Отмена</Button>
          {step === 'email' && (
            <Button variant="default" size="md" onClick={sendCode}
              disabled={!email.trim()}
              style={!email.trim() ? {opacity:.5,pointerEvents:'none'} : {}}>
              Отправить код
            </Button>
          )}
          {step === 'code' && (
            <Button variant="default" size="md" onClick={confirm}
              disabled={!enteredCode.trim()}
              style={!enteredCode.trim() ? {opacity:.5,pointerEvents:'none'} : {}}>
              <Icon.check size={13}/> Подтвердить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Управление подключёнными каналами ────────────────────────────────────
function ManageChannelsModal({ channels, onClose, onDisconnect, onConnectMore }) {
  const z = useModalZ();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const items = [];
  if (channels.telegram) items.push({ key:'telegram', label:'Telegram bot', subtitle:'@colver_demo_bot', color:'#229ED9' });
  if (channels.email)    items.push({ key:'email', label:'Email', subtitle: channels.email, color:'#475569' });

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:z,background:'rgba(9,9,11,.5)',
        backdropFilter:'blur(3px)',display:'flex',alignItems:'center',
        justifyContent:'center',padding:'24px 16px'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:460,
        boxShadow:'0 32px 80px rgba(0,0,0,.22)',overflow:'hidden'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',
          display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:16,fontWeight:700}}>Подключение уведомлений</span>
          <button onClick={onClose} style={{background:'none',border:0,cursor:'pointer',
            padding:5,color:'var(--muted-foreground)',display:'flex',alignItems:'center',borderRadius:6}}>
            <Icon.x size={16}/>
          </button>
        </div>
        <div style={{padding:'14px 20px',display:'flex',flexDirection:'column',gap:10}}>
          {items.length === 0 && (
            <div style={{fontSize:13,color:'var(--muted-foreground)'}}>Каналы не подключены.</div>
          )}
          {items.map(item => (
            <div key={item.key} style={{display:'flex',alignItems:'center',gap:12,
              padding:'10px 12px',border:'1px solid var(--border)',borderRadius:8}}>
              <div style={{width:32,height:32,borderRadius:8,background:item.color,
                display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',
                flexShrink:0,fontSize:14,fontWeight:700}}>
                {item.key === 'telegram' ? 'TG' : '@'}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600}}>{item.label}</div>
                <div style={{fontSize:12,color:'var(--muted-foreground)',overflow:'hidden',
                  textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.subtitle}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => onDisconnect(item.key)}>
                Отключить
              </Button>
            </div>
          ))}
        </div>
        <div style={{padding:'12px 20px',borderTop:'1px solid var(--border)',
          background:'#FAFAFA',display:'flex',gap:8,justifyContent:'space-between'}}>
          <Button variant="outline" size="md" onClick={onConnectMore}>
            <Icon.plus size={13}/> Подключить ещё
          </Button>
          <Button variant="default" size="md" onClick={onClose}>Готово</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ChooseChannelModal, TelegramConnectModal, EmailConnectModal, ManageChannelsModal,
  generateConnectCode,
});
