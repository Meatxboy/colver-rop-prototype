// ── Layout: Sidebar + Topbar + Shell ──────────────────────────────────────
const navItems = [
  { key:'dashboard', label:'Дашборд',       icon: Icon.dashboard },
  { key:'calls',     label:'Звонки',        icon: Icon.phone },
  { key:'tasks',     label:'Задачи',        icon: Icon.calendar },
  { key:'processed', label:'Обработанные',  icon: Icon.archive },
];

// ── Mock notifications ────────────────────────────────────────────────────
function initNotifications() {
  return [
    {
      id:'NF1', priority:1, read:false,
      callId:'1841', manager:'Сидоров А. К.',
      title:'Возражение по цене не отработано',
      body:'Менеджер пропустил ключевые шаги скрипта на этапе работы с ценой.',
      time:'5 мин назад',
    },
    {
      id:'NF2', priority:1, read:false,
      callId:'1842', manager:'Козлов М. О.',
      title:'Не зафиксирован следующий шаг',
      body:'Звонок завершён без договорённости о следующем действии.',
      time:'18 мин назад',
    },
    {
      id:'NF3', priority:2, read:false,
      callId:null, manager:null,
      title:'Дайджест: 2 новых звонка в очереди',
      body:'Приоритет 2 — звонки #1843 и #1844 ожидают разбора.',
      time:'30 мин назад',
    },
    {
      id:'NF4', priority:1, read:true,
      callId:'1839', manager:'Петров И. С.',
      title:'Скрипт не соблюдён',
      body:'Менеджер отклонился от структуры звонка на этапе выявления потребности.',
      time:'1 ч назад',
    },
    {
      id:'NF5', priority:2, read:true,
      callId:null, manager:null,
      title:'Дайджест: 3 звонка обработано за час',
      body:'Обработано: обратная связь ×2, разбор назначен ×1.',
      time:'1 ч 30 мин назад',
    },
    {
      id:'NF6', priority:1, read:true,
      callId:'1837', manager:'Морозова Е. В.',
      title:'Низкий скор звонка — 28 из 100',
      body:'Оценка ниже порога качества. Требуется личный разбор.',
      time:'2 ч назад',
    },
  ];
}

// ── NotificationsDrawer ───────────────────────────────────────────────────
function NotificationsDrawer({ open, notifications, onClose, onMarkAllRead, onMarkRead, onOpenCall, onOpenTask, messengerChannels = { telegram:false, email:null }, bannerHidden = false, onHideBanner, onOpenConnect, onOpenManage }) {
  const unread = notifications.filter(n => !n.read).length;

  if (!open) return null;

  const P1_COLOR  = '#B91C1C';
  const P1_BG     = '#FFF5F5';
  const P1_BORDER = '#FECACA';
  const P2_COLOR  = '#1D4ED8';
  const P2_BG     = '#EFF6FF';
  const P2_BORDER = '#BFDBFE';

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        onClick={onClose}
        style={{position:'fixed',inset:0,zIndex:110,background:'rgba(9,9,11,.25)',
          backdropFilter:'blur(1px)',animation:'fadeIn .15s ease'}}
      />

      {/* Drawer panel */}
      <div style={{
        position:'fixed', left:50, top:0, bottom:0, width:380, zIndex:120,
        background:'#fff', boxShadow:'4px 0 24px rgba(0,0,0,.14)',
        display:'flex', flexDirection:'column',
        animation:'slideInLeft .18s ease',
      }}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'16px 18px 14px',borderBottom:'1px solid var(--border)',flexShrink:0,gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0}}>
            <Icon.bell size={16}/>
            <span style={{fontSize:15,fontWeight:700}}>Уведомления</span>
            {unread > 0 && (
              <span style={{background:'var(--danger)',color:'#fff',borderRadius:10,
                padding:'1px 7px',fontSize:12,fontWeight:700}}>{unread}</span>
            )}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {unread > 0 && (
              <button
                onClick={onMarkAllRead}
                className="notif-mark-all"
              >
                <Icon.check size={11}/> Прочитать все
              </button>
            )}
            <button onClick={onClose}
              style={{background:'none',border:'none',cursor:'pointer',padding:5,
                color:'var(--muted-foreground)',display:'flex',alignItems:'center',borderRadius:6}}>
              <Icon.x size={15}/>
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div style={{flex:1,overflowY:'auto',padding:'8px 0'}}>
          {/* Баннер «Подключите мессенджер» — показывается, пока ни Telegram,
              ни Email не подключены и пользователь не закрыл баннер крестиком. */}
          {!messengerChannels.telegram && !messengerChannels.email && !bannerHidden && (
            <div className="notif-banner">
              <button
                className="notif-banner-close"
                aria-label="Скрыть"
                title="Скрыть"
                onClick={onHideBanner}
              ><Icon.x size={12}/></button>
              <div className="notif-banner-title">
                Подключите мессенджер, чтобы мгновенно получать уведомления
              </div>
              <div className="notif-banner-icons">
                <span title="Telegram" className="notif-banner-icon" style={{background:'#229ED9'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
                </span>
                <span title="Email" className="notif-banner-icon" style={{background:'#475569'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
              </div>
              <button className="notif-banner-btn" onClick={onOpenConnect}>
                Подключить
              </button>
            </div>
          )}

          {notifications.length === 0 && (
            <div style={{textAlign:'center',padding:'40px 20px',color:'var(--muted-foreground)'}}>
              <Icon.bell size={28}/>
              <div style={{marginTop:10,fontSize:13}}>Нет новых уведомлений</div>
            </div>
          )}

          {notifications.map(n => {
            const isP1 = n.priority === 1;
            const bgColor = n.read ? '#fff' : (isP1 ? P1_BG : P2_BG);
            const accentColor = isP1 ? P1_COLOR : P2_COLOR;
            const borderColor = isP1 ? P1_BORDER : P2_BORDER;

            return (
              <div
                key={n.id}
                onClick={() => !n.read && onMarkRead(n.id)}
                style={{
                  display:'flex', gap:0, cursor: n.read ? 'default' : 'pointer',
                  background: bgColor,
                  borderBottom:`1px solid ${n.read ? 'var(--border)' : borderColor}`,
                  transition:'background .1s',
                  position:'relative',
                }}
                onMouseEnter={e => { if (!n.read) e.currentTarget.style.filter='brightness(.97)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter='none'; }}
              >
                {/* Left accent bar */}
                <div style={{width:3,flexShrink:0,background: n.read ? 'transparent' : accentColor,
                  borderRadius:'0 2px 2px 0'}}/>

                {/* Content */}
                <div style={{flex:1,padding:'11px 14px 11px 12px'}}>
                  {/* Priority badge + time */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{
                      background: isP1 ? '#FEE2E2' : '#DBEAFE',
                      color: accentColor,
                      borderRadius:4, padding:'1px 7px', fontSize:11, fontWeight:700,
                      letterSpacing:.2,
                    }}>
                      {isP1 ? 'Приоритет 1' : 'Дайджест'}
                    </span>
                    <span style={{fontSize:12,color:'var(--muted-foreground)',whiteSpace:'nowrap'}}>
                      {n.time}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{fontSize:13,fontWeight: n.read ? 500 : 600,
                    color: n.read ? 'var(--muted-foreground)' : 'var(--foreground)',
                    lineHeight:1.4, marginBottom:3}}>
                    {n.title}
                  </div>

                  {/* Body */}
                  <div style={{fontSize:12,color:'var(--muted-foreground)',lineHeight:1.45,marginBottom:n.callId||n.manager?7:0}}>
                    {n.body}
                  </div>

                  {/* Manager + call/task link */}
                  {(n.manager || n.callId || n.taskId) && (
                    <div style={{display:'flex',alignItems:'center',gap:8,marginTop:5}}>
                      {n.manager && (
                        <div style={{display:'flex',alignItems:'center',gap:5}}>
                          <Avatar name={n.manager} size={16} style={{flexShrink:0}}/>
                          <span style={{fontSize:12,color:'var(--muted-foreground)',fontWeight:500}}>
                            {n.manager}
                          </span>
                        </div>
                      )}
                      {n.callId && (
                        <button
                          onClick={e => { e.stopPropagation(); onMarkRead(n.id); onOpenCall(n.callId); }}
                          style={{background:'none',border:'1px solid var(--border)',cursor:'pointer',
                            padding:'3px 9px',borderRadius:5,fontSize:12,fontWeight:500,
                            color:'var(--primary)',display:'flex',alignItems:'center',gap:5,
                            marginLeft:'auto'}}
                        >
                          <Icon.phone size={10}/> Звонок #{n.callId}
                        </button>
                      )}
                      {n.taskId && !n.callId && (
                        <button
                          onClick={e => { e.stopPropagation(); onMarkRead(n.id); onOpenTask && onOpenTask(n.taskId); onClose && onClose(); }}
                          style={{background:'none',border:'1px solid var(--border)',cursor:'pointer',
                            padding:'3px 9px',borderRadius:5,fontSize:12,fontWeight:500,
                            color:'var(--primary)',display:'flex',alignItems:'center',gap:5,
                            marginLeft:'auto'}}
                        >
                          <Icon.calendar size={10}/> Задача #{n.taskId}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Unread dot */}
                  {!n.read && (
                    <div style={{position:'absolute',top:14,right:14,width:7,height:7,
                      borderRadius:'50%',background:accentColor}}/>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{borderTop:'1px solid var(--border)',padding:'10px 16px',
          flexShrink:0,background:'#FAFAFA'}}>
          <div style={{fontSize:12,color:'var(--muted-foreground)',lineHeight:1.5}}>
            <span style={{fontWeight:600,color:'var(--foreground)'}}>Приоритет 1</span> — мгновенно &nbsp;·&nbsp;
            <span style={{fontWeight:600,color:'var(--foreground)'}}>Дайджест</span> — каждые 30 мин
          </div>
          {/* Подсказка «Также дублируется в Telegram / Почту» появляется
              только когда хотя бы один канал подключён. Клик по подчёркнутому
              каналу → ManageChannelsModal. */}
          {(messengerChannels.telegram || messengerChannels.email) && (
            <div style={{fontSize:11,color:'var(--muted-foreground)',marginTop:3}}>
              Также дублируется в{' '}
              <button onClick={onOpenManage}
                style={{background:'none',border:0,padding:0,cursor:'pointer',
                  textDecoration: messengerChannels.telegram ? 'underline' : 'none',
                  color: messengerChannels.telegram ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontSize:11,fontFamily:'inherit'}}>
                Telegram
              </button>
              {' / '}
              <button onClick={onOpenManage}
                style={{background:'none',border:0,padding:0,cursor:'pointer',
                  textDecoration: messengerChannels.email ? 'underline' : 'none',
                  color: messengerChannels.email ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontSize:11,fontFamily:'inherit'}}>
                почту
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ route, onNavigate, notifUnread, onNotifToggle, notifOpen }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef = useRef(null);
  // Close user menu on outside click.
  useEffect(() => {
    if (!userMenuOpen) return;
    const onDocClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [userMenuOpen]);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" title="Colver">
        <div className="sidebar-logo">C</div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const IconC = item.icon;
          const active = route.page === item.key || (item.key === 'calls' && route.page === 'call');
          return (
            <button key={item.key} className={cn('nav-item', active && 'is-active')} onClick={()=>onNavigate({ page: item.key })} title={item.label}>
              <IconC size={16}/>
              <span className="nav-tooltip">{item.label}</span>
              {null /* queue count removed — handled via notifications drawer */}
            </button>
          );
        })}

        {/* Bell / Notifications */}
        <button
          className={cn('nav-item', notifOpen && 'is-active')}
          title="Уведомления"
          onClick={onNotifToggle}
        >
          <Icon.bell size={16}/>
          <span className="nav-tooltip">Уведомления</span>
          {notifUnread > 0 && (
            <span className="nav-count" style={{background:'var(--danger)',color:'#fff'}}>
              {notifUnread}
            </span>
          )}
        </button>
      </nav>
      <div className="sidebar-footer" ref={userRef} style={{position:'relative'}}>
        <button
          className="user-card"
          title="Алексей Петров · РОП"
          onClick={() => setUserMenuOpen(o => !o)}
        >
          <Avatar name="Алексей Петров" size={32}/>
        </button>
        {userMenuOpen && (
          <div className="user-menu" role="menu">
            <div className="user-menu-head">
              <div className="user-menu-name">Алексей Петров</div>
              <div className="user-menu-role">РОП · Команда А</div>
            </div>
            <button
              type="button"
              className="user-menu-item"
              onClick={() => { setUserMenuOpen(false); /* в прототипе — без реального logout */ alert('Сеанс завершён (прототип)'); }}
            >
              <Icon.logout size={14}/> Выйти
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function Topbar({ title, breadcrumbs, onAiToggle, aiOpen, route, companyName = 'Colver' }) {
  // В верхнем меню вместо названия страницы — название компании.
  // (Активная страница уже подсвечена в Sidebar.)
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="page-title" title="Название компании">{companyName}</div>
      </div>
      <div className="topbar-right">
        {!aiOpen && (
          <button
            className="ai-toggle-btn"
            onClick={onAiToggle}
            title="Нейроаналитик">
            <Icon.ai size={15}/>
            <span>Нейроаналитик</span>
          </button>
        )}
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, Topbar, NotificationsDrawer, initNotifications, navItems });
