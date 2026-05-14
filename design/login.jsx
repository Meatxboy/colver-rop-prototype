// ── Страница авторизации ─────────────────────────────────────────────────
// В прототипе нет реального бэка — любой логин/пароль (≥3 символа) принимается.
// «Не помню пароль» открывает модалку с инструкцией по обращению в ТП.

function LoginPage({ onLogin }) {
  const [login, setLogin]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError]       = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const submit = () => {
    if (login.trim().length < 3) { setError('Логин должен быть не короче 3 символов'); return; }
    if (password.length < 3)     { setError('Пароль должен быть не короче 3 символов'); return; }
    setError(null);
    setSubmitting(true);
    // Имитация запроса.
    setTimeout(() => {
      setSubmitting(false);
      onLogin && onLogin({ login: login.trim(), remember });
    }, 500);
  };

  return (
    <Fragment>
      <div style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'#FAFAFA',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'24px 16px',
        backgroundImage:'radial-gradient(circle at 20% 10%, rgba(29,78,216,.06), transparent 40%), radial-gradient(circle at 80% 90%, rgba(124,58,237,.06), transparent 40%)'
      }}>
        <div style={{width:'100%', maxWidth:400}}>
          {/* Brand */}
          <div style={{textAlign:'center', marginBottom:24}}>
            <div style={{
              width:48, height:48, margin:'0 auto 12px',
              background:'linear-gradient(135deg, var(--primary), #7C3AED)',
              color:'#fff', fontWeight:800, fontSize:22,
              display:'flex', alignItems:'center', justifyContent:'center',
              borderRadius:12, boxShadow:'0 8px 24px rgba(29,78,216,.25)',
              letterSpacing:'-1px'
            }}>C</div>
            <div style={{fontSize:18, fontWeight:700}}>Вход в Colver</div>
            <div style={{fontSize:13, color:'var(--muted-foreground)', marginTop:4}}>
              Контроль качества звонков
            </div>
          </div>

          {/* Form */}
          <div style={{
            background:'#fff', border:'1px solid var(--border)',
            borderRadius:12, padding:'24px 20px',
            boxShadow:'0 8px 32px rgba(0,0,0,.06)'
          }}>
            <div style={{marginBottom:14}}>
              <label style={{display:'block', fontSize:12, fontWeight:600,
                color:'var(--muted-foreground)', textTransform:'uppercase',
                letterSpacing:.4, marginBottom:6}}>Логин</label>
              <input
                value={login}
                onChange={e => setLogin(e.target.value)}
                placeholder="Имя пользователя или email"
                autoFocus
                autoComplete="username"
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{
                  width:'100%', padding:'10px 12px',
                  border:'1px solid var(--border)', borderRadius:8,
                  fontSize:14, outline:'none', boxSizing:'border-box',
                  fontFamily:'inherit', background:'#fff',
                }}/>
            </div>
            <div style={{marginBottom:6}}>
              <label style={{display:'block', fontSize:12, fontWeight:600,
                color:'var(--muted-foreground)', textTransform:'uppercase',
                letterSpacing:.4, marginBottom:6}}>Пароль</label>
              <div style={{position:'relative'}}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{
                    width:'100%', padding:'10px 40px 10px 12px',
                    border:'1px solid var(--border)', borderRadius:8,
                    fontSize:14, outline:'none', boxSizing:'border-box',
                    fontFamily:'inherit', background:'#fff',
                  }}/>
                <button type="button"
                  onClick={() => setShowPass(s => !s)}
                  title={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                  style={{
                    position:'absolute', right:6, top:'50%',
                    transform:'translateY(-50%)',
                    background:'none', border:0, padding:6, cursor:'pointer',
                    color:'var(--muted-foreground)', display:'inline-flex',
                    alignItems:'center', borderRadius:6,
                  }}>
                  {showPass
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                marginTop:10, padding:'8px 10px', borderRadius:6,
                background:'#FEE2E2', color:'#B91C1C',
                fontSize:12.5, lineHeight:1.4
              }}>{error}</div>
            )}

            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              marginTop:14, marginBottom:18, gap:8, flexWrap:'wrap'
            }}>
              <label style={{display:'inline-flex', alignItems:'center', gap:6,
                fontSize:12.5, cursor:'pointer', color:'var(--foreground)'}}>
                <input type="checkbox" checked={remember}
                  onChange={e => setRemember(e.target.checked)}/>
                Запомнить меня
              </label>
              <button type="button"
                onClick={() => setForgotOpen(true)}
                style={{background:'none', border:0, padding:0, cursor:'pointer',
                  color:'var(--primary)', fontSize:12.5, fontWeight:500,
                  fontFamily:'inherit'}}>
                Не помню пароль
              </button>
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              style={{
                width:'100%', padding:'11px 14px',
                background: submitting ? '#94A3B8' : 'var(--primary)',
                color:'#fff', border:0, borderRadius:8,
                cursor: submitting ? 'default' : 'pointer',
                fontWeight:600, fontSize:14,
                fontFamily:'inherit',
                transition:'background .12s',
              }}>
              {submitting ? 'Входим…' : 'Войти'}
            </button>
          </div>

          <div style={{textAlign:'center', marginTop:18, fontSize:11.5,
            color:'var(--muted-foreground)', lineHeight:1.55}}>
            Учётная запись выдаётся администратором.
            Если у вас нет доступа — обратитесь к РОП.
          </div>
        </div>
      </div>

      {forgotOpen && <ForgotPasswordModal onClose={() => setForgotOpen(false)}/>}
    </Fragment>
  );
}

// ── ForgotPasswordModal: инструкция обращения в техподдержку ────────────
function ForgotPasswordModal({ onClose }) {
  const z = useModalZ();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const supportEmail = 'support@colver.app';
  const supportTg    = '@colver_support';
  const copyEmail = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(supportEmail).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div
      style={{position:'fixed', inset:0, zIndex:z, background:'rgba(9,9,11,.5)',
        backdropFilter:'blur(3px)', display:'flex', alignItems:'center',
        justifyContent:'center', padding:'24px 16px'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{background:'#fff', borderRadius:12, width:'100%',
        maxWidth:440, boxShadow:'0 32px 80px rgba(0,0,0,.22)', overflow:'hidden'}}>
        <div style={{padding:'16px 20px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <span style={{fontSize:16, fontWeight:700}}>Восстановление пароля</span>
          <button onClick={onClose}
            style={{background:'none', border:0, cursor:'pointer', padding:5,
              color:'var(--muted-foreground)', display:'flex', alignItems:'center',
              borderRadius:6}} aria-label="Закрыть">
            <Icon.x size={16}/>
          </button>
        </div>
        <div style={{padding:'18px 20px', display:'flex', flexDirection:'column', gap:14}}>
          <div style={{fontSize:13, lineHeight:1.55, color:'var(--foreground)'}}>
            Пароль восстанавливается через службу технической поддержки.
            Напишите нам, укажите свой логин и название компании — администратор
            сбросит пароль и пришлёт новый.
          </div>

          {/* Email */}
          <div style={{display:'flex', alignItems:'center', gap:10,
            padding:'10px 12px', background:'var(--muted)',
            border:'1px solid var(--border)', borderRadius:8}}>
            <div style={{width:34, height:34, background:'#475569', color:'#fff',
              borderRadius:8, display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:11, color:'var(--muted-foreground)', textTransform:'uppercase',
                letterSpacing:.4, marginBottom:2}}>Email</div>
              <div style={{fontSize:13, fontWeight:600, overflow:'hidden',
                textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{supportEmail}</div>
            </div>
            <button onClick={copyEmail}
              style={{padding:'5px 10px', border:'1px solid var(--border)',
                background:'#fff', borderRadius:6, fontSize:11.5, fontWeight:600,
                cursor:'pointer', color:'var(--primary)',
                display:'inline-flex', alignItems:'center', gap:4}}>
              {copied ? <><Icon.check size={11}/> Скопировано</> : <><Icon.copy size={11}/> Копировать</>}
            </button>
          </div>

          {/* Telegram */}
          <a
            href="https://t.me/colver_support"
            target="_blank"
            rel="noopener"
            style={{display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', background:'var(--muted)',
              border:'1px solid var(--border)', borderRadius:8,
              textDecoration:'none', color:'inherit'}}>
            <div style={{width:34, height:34, background:'#229ED9', color:'#fff',
              borderRadius:8, display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
              </svg>
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:11, color:'var(--muted-foreground)', textTransform:'uppercase',
                letterSpacing:.4, marginBottom:2}}>Telegram</div>
              <div style={{fontSize:13, fontWeight:600}}>{supportTg}</div>
            </div>
            <span style={{fontSize:11.5, fontWeight:600, color:'var(--primary)'}}>Открыть →</span>
          </a>

          <div style={{fontSize:11.5, color:'var(--muted-foreground)', lineHeight:1.55}}>
            Часы работы: ПН–ПТ, 9:00–19:00 МСК. Среднее время ответа — до 1 часа.
          </div>
        </div>
        <div style={{padding:'12px 20px', borderTop:'1px solid var(--border)',
          background:'#FAFAFA', display:'flex', justifyContent:'flex-end'}}>
          <Button variant="default" size="md" onClick={onClose}>Понятно</Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage, ForgotPasswordModal });
