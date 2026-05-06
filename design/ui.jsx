// ── shadcn-flavored UI primitives для Colver РОП ───────────────────────────
const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;

// Утилиты
const cn = (...c) => c.filter(Boolean).join(' ');

// ── Иконки (lucide-style) ──────────────────────────────────────────────────
const Icon = {
  dashboard: (p={}) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  phone: (p={}) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  archive: (p={}) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="5" rx="1"/><path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>,
  chart: (p={}) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 6-6"/></svg>,
  settings: (p={}) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ai: (p={}) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z" opacity=".95"/><circle cx="19" cy="17" r="2.4"/><circle cx="6" cy="18" r="1.6" opacity=".7"/></svg>,
  search: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  bell: (p={}) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  calendar: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>,
  chevDown: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  chevRight: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevLeft: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevUp: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  arrowUp: (p={}) => <svg width={p.size||12} height={p.size||12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  arrowDown: (p={}) => <svg width={p.size||12} height={p.size||12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  // Direction icons (rule 5): outgoing = up-right diagonal, incoming = down-left diagonal.
  arrowUpRight: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  arrowDownLeft: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>,
  check: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  play: (p={}) => <svg width={p.size||12} height={p.size||12} viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>,
  back: (p={}) => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  plus: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  more: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
  filter: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  download: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  refresh: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  send: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  copy: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  trash: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  thumbsUp: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
  thumbsDown: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>,
  info: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  alert: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  inbox: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  star: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  trending: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  user: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  edit: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  clock: (p={}) => <svg width={p.size||13} height={p.size||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  // Open-task indicator: clipboard + check
  taskBadge: (p={}) => <svg width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 14l2 2 4-4"/></svg>,
};

// ── Age formatter (rounded display) ──────────────────────────────────────
// < 60 min → "X мин."   ; < 24h → "X ч."  (math-rounded) ; else → "X день/дня/дней"
function ruDayWord(n) {
  const m100 = n % 100, m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return 'дней';
  if (m10 === 1) return 'день';
  if (m10 >= 2 && m10 <= 4) return 'дня';
  return 'дней';
}
function formatAge(min) {
  const m = Math.max(0, Math.round(min || 0));
  if (m < 60) return `${m} мин.`;
  if (m < 60 * 24) return `${Math.round(m / 60)} ч.`;
  const d = Math.round(m / (60 * 24));
  return `${d} ${ruDayWord(d)}`;
}

// ── Atoms ──────────────────────────────────────────────────────────────────
const Button = ({ variant='default', size='md', className='', children, ...props }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border',
    outline: 'bg-white text-foreground border border-border hover:bg-secondary',
    ghost: 'bg-transparent text-foreground hover:bg-secondary',
    destructive: 'bg-destructive text-white hover:bg-destructive-hover',
    success: 'bg-success-soft text-success-strong hover:bg-success-soft-hover',
  };
  const sizes = { sm: 'h-7 px-2.5 text-xs', md: 'h-8 px-3 text-[13px]', lg: 'h-9 px-4 text-sm' };
  return <button className={cn('btn', variants[variant], sizes[size], className)} {...props}>{children}</button>;
};

const Badge = ({ variant='default', children, className='' }) => {
  const variants = {
    default: 'bg-secondary text-foreground border border-border',
    primary: 'bg-primary-soft text-primary-strong',
    danger:  'bg-danger-soft text-danger-strong',
    warning: 'bg-warning-soft text-warning-strong',
    success: 'bg-success-soft text-success-strong',
    muted:   'bg-secondary text-muted-foreground',
    p1: 'bg-danger-soft text-danger-strong',
    p2: 'bg-warning-soft text-warning-strong',
    p3: 'bg-secondary text-muted-foreground',
  };
  return <span className={cn('badge', variants[variant], className)}>{children}</span>;
};

const PriorityBadge = ({ p }) => {
  const titleMap = { 1: 'Высокий приоритет', 2: 'Средний приоритет', 3: 'Низкий приоритет' };
  return <span className={cn('prio-chip', 'is-p'+p)} title={titleMap[p] || titleMap[3]}>{p}</span>;
};

const Card = ({ children, className='', ...props }) => <div className={cn('card', className)} {...props}>{children}</div>;
const CardHeader = ({ children, className='' }) => <div className={cn('card-header', className)}>{children}</div>;
const CardTitle = ({ children, className='' }) => <div className={cn('card-title', className)}>{children}</div>;
const CardContent = ({ children, className='' }) => <div className={cn('card-content', className)}>{children}</div>;

const Tabs = ({ tabs, active, onChange, className='' }) => (
  <div className={cn('tabs-list', className)}>
    {tabs.map(t => (
      <button key={t.key} onClick={() => onChange(t.key)} className={cn('tabs-trigger', active === t.key && 'is-active')}>
        {t.label}
        {t.count != null && <span className="tabs-count">{t.count}</span>}
      </button>
    ))}
  </div>
);

const Avatar = ({ name, size=28, color }) => {
  const initials = (name||'').split(' ').filter(Boolean).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  return <div className="avatar" style={{ width:size, height:size, fontSize: Math.max(10, size*0.36), background: color || undefined }}>{initials}</div>;
};

const Progress = ({ value, max=10, tone='auto' }) => {
  const pct = Math.max(0, Math.min(100, (value/max)*100));
  let cls = 'progress-bar';
  if (tone === 'auto') {
    if (value >= 8) cls += ' is-good'; else if (value >= 6) cls += ' is-warn'; else cls += ' is-bad';
  } else cls += ' is-' + tone;
  return <div className="progress"><div className={cls} style={{ width: pct + '%' }}></div></div>;
};

const ScoreCell = ({ value, max=10 }) => {
  if (value == null) return <span className="text-muted">—</span>;
  // Normalize to 10-pt scale for thresholds: ≥8 green, ≥6 amber, ≥4 default, <4 red
  const v10 = max === 5 ? value * 2 : value;
  let cls = 'score';
  if (v10 >= 8) cls += ' is-good';
  else if (v10 >= 6) cls += ' is-warn';
  else if (v10 >= 4) cls += ' is-default';
  else cls += ' is-bad';
  return <span className={cls}>{value.toFixed(1)}</span>;
};

const PercentCell = ({ value, thresholds=[60,40] }) => {
  if (value == null) return <span className="text-muted">—</span>;
  const [hi, mid] = thresholds;
  let cls = 'pct';
  if (value >= hi) cls += ' is-good'; else if (value >= mid) cls += ' is-warn'; else cls += ' is-bad';
  return <span className={cls}>{value}%</span>;
};

const Delta = ({ value, suffix='', invertColor=false }) => {
  if (value == null || value === 0) return <span className="delta is-zero">±0{suffix}</span>;
  const up = value > 0;
  const isBad = invertColor ? up : !up;
  return <span className={cn('delta', isBad ? 'is-down' : 'is-up')}>
    {up ? <Icon.arrowUp size={11}/> : <Icon.arrowDown size={11}/>}
    {Math.abs(value)}{suffix}
  </span>;
};

// Inline спарклайн
const Sparkline = ({ data, w=72, h=22, color='currentColor' }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v,i)=>`${i*step},${h - ((v-min)/range)*(h-2) - 1}`).join(' ');
  return <svg width={w} height={h} className="sparkline"><polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points}/></svg>;
};

// Tooltip (lightweight, fixed-position so it escapes overflow:hidden ancestors)
const Tooltip = ({ text, children }) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const onEnter = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ x: r.left + r.width/2, y: r.top });
    }
    setShow(true);
  };
  return <span className="tooltip-host" ref={ref} onMouseEnter={onEnter} onMouseLeave={()=>setShow(false)}>
    {children || <span className="tooltip-trigger"><Icon.info size={13}/></span>}
    {show && <span className="tooltip-pop" style={{ left: pos.x, top: pos.y }}>{text}</span>}
  </span>;
};

// Switch
const Switch = ({ checked, onChange, label }) => (
  <label className="switch">
    <input type="checkbox" checked={!!checked} onChange={e=>onChange(e.target.checked)}/>
    <span className="switch-track"><span className="switch-thumb"></span></span>
    {label && <span className="switch-label">{label}</span>}
  </label>
);

// Select (simple)
const Select = ({ value, onChange, options, className='' }) => (
  <div className={cn('select-wrap', className)}>
    <select value={value} onChange={e=>onChange(e.target.value)} className="select">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <span className="select-caret"><Icon.chevDown size={12}/></span>
  </div>
);

// ── Period selector with calendar popover ─────────────────────────────────
// Trigger button shows the current period label; clicking opens a popover
// with 5 top tabs (День / Неделя / Месяц / Квартал / Год), each with its
// own sub-tabs and body. Value can be a legacy string ('week', 'month' …)
// or the object form { kind, … } described in normalizePeriodState.
const PERIOD_TABS = [
  { key:'day', label:'День' },
  { key:'week', label:'Неделя' },
  { key:'month', label:'Месяц' },
  { key:'quarter', label:'Квартал' },
  { key:'year', label:'Год' },
];
const MONTHS_LONG = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONTHS_SHORT = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAY_PRESETS = [7, 30, 90, 365];
// Hardcoded "today" — stays in sync with the data baseline (data.js:77 — 21.04.2026).
const PERIOD_TODAY = new Date(2026, 4, 6);

const dowMonFirst = (d) => (d.getDay() + 6) % 7;
const daysInMonth = (y, m0) => new Date(y, m0 + 1, 0).getDate();

function monthGrid(year, month0) {
  const startDow = dowMonFirst(new Date(year, month0, 1));
  const total = daysInMonth(year, month0);
  const cells = [];
  const prevTotal = daysInMonth(year, month0 - 1);
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ d: prevTotal - i, m: month0 === 0 ? 11 : month0 - 1, y: month0 === 0 ? year - 1 : year, out: true });
  }
  for (let d = 1; d <= total; d++) cells.push({ d, m: month0, y: year, out: false });
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ d: nextDay++, m: month0 === 11 ? 0 : month0 + 1, y: month0 === 11 ? year + 1 : year, out: true });
  }
  return cells;
}

function normalizePeriodState(v) {
  if (typeof v === 'string') {
    const map = {
      today: { kind:'day', preset:7 },
      day:   { kind:'day', preset:7 },
      week:  { kind:'week', current:true },
      month: { kind:'month', current:true, year:PERIOD_TODAY.getFullYear(), monthIdx:PERIOD_TODAY.getMonth() },
      custom:{ kind:'day', preset:30 },
    };
    return map[v] || { kind:'week', current:true };
  }
  return v || { kind:'week', current:true };
}

const fmtDayShort = (d) => `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`;

function periodLabel(s) {
  switch (s.kind) {
    case 'day':
      if (s.customStart && s.customEnd) {
        return `${fmtDayShort(new Date(s.customStart))} — ${fmtDayShort(new Date(s.customEnd))}`;
      }
      return `${s.preset || 7} дн.`;
    case 'week': return s.current ? 'Эта неделя' : 'Прошлая неделя';
    case 'month': return s.current ? 'Этот месяц' : `${MONTHS_SHORT[s.monthIdx ?? PERIOD_TODAY.getMonth()]} ${s.year ?? PERIOD_TODAY.getFullYear()}`;
    case 'quarter': return s.current ? 'Этот квартал' : `Q${s.quarter} ${s.year}`;
    case 'year': return s.current ? 'Этот год' : String(s.year);
    default: return 'Период';
  }
}

function rangeFor(s) {
  if (s.kind === 'day') {
    if (s.customStart && s.customEnd) {
      return { start: new Date(s.customStart), end: new Date(s.customEnd) };
    }
    const end = PERIOD_TODAY;
    const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (s.preset || 7) + 1);
    return { start, end };
  }
  if (s.kind === 'week') {
    const offset = s.current ? 0 : 7;
    const dow = dowMonFirst(PERIOD_TODAY);
    const start = new Date(PERIOD_TODAY.getFullYear(), PERIOD_TODAY.getMonth(), PERIOD_TODAY.getDate() - dow - offset);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    return { start, end };
  }
  return null;
}

const inRange = (c, r) => {
  if (!r) return false;
  const t = new Date(c.y, c.m, c.d).getTime();
  return t >= r.start.getTime() && t <= r.end.getTime();
};
const sameDay = (c, d) => d && c.y === d.getFullYear() && c.m === d.getMonth() && c.d === d.getDate();
const isWeekend = (c) => {
  const dow = new Date(c.y, c.m, c.d).getDay();
  return dow === 0 || dow === 6;
};

const CalendarMonth = ({ year, month, range, pickStart, onPick }) => {
  const cells = monthGrid(year, month);
  return <div className="period-month">
    {cells.map((c, i) => {
      const sel = inRange(c, range);
      const isPick = sameDay(c, pickStart);
      const Tag = onPick && !c.out ? 'button' : 'span';
      return <Tag key={i}
        className={cn('period-day', c.out && 'is-out', sel && 'is-sel', isPick && 'is-pick-start', !c.out && isWeekend(c) && 'is-weekend', onPick && !c.out && 'is-clickable')}
        onClick={onPick && !c.out ? () => onPick(new Date(c.y, c.m, c.d)) : undefined}>
        {c.d}
      </Tag>;
    })}
  </div>;
};

const CalendarTwoMonths = ({ year, month, range, onNav, pickStart, onPick }) => {
  const navYear = (delta) => onNav({ year: year + delta, month });
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };
  return <div className="period-calendar">
    <div className="period-calendar-header">
      <span>{MONTHS_LONG[month]}</span>
      <span className="period-year-nav">
        <button onClick={() => navYear(-1)} aria-label="Предыдущий год"><Icon.chevLeft size={11}/></button>
        <span>{year}</span>
        <button onClick={() => navYear(1)} aria-label="Следующий год"><Icon.chevRight size={11}/></button>
      </span>
    </div>
    <CalendarMonth year={year} month={month} range={range} pickStart={pickStart} onPick={onPick}/>
    <div className="period-calendar-month-label">{MONTHS_LONG[next.m]}</div>
    <CalendarMonth year={next.y} month={next.m} range={range} pickStart={pickStart} onPick={onPick}/>
  </div>;
};

// День: presets (7/30/90/365) OR free-pick range. Click any day → set start;
// click another day → set end (auto-orders if you click earlier date second).
// Clicking a preset chip clears the custom range.
function DayBody({ state, onChange }) {
  const preset = state.kind === 'day' ? (state.preset || 7) : 7;
  const hasCustom = state.kind === 'day' && state.customStart && state.customEnd;
  const [cal, setCal] = useState({ year: PERIOD_TODAY.getFullYear(), month: PERIOD_TODAY.getMonth() });
  const [pickStart, setPickStart] = useState(null);

  const handlePick = (d) => {
    if (!pickStart) { setPickStart(d); return; }
    let s = pickStart, e = d;
    if (e.getTime() < s.getTime()) [s, e] = [e, s];
    setPickStart(null);
    const iso = (x) => `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
    onChange({ kind:'day', customStart: iso(s), customEnd: iso(e) });
  };

  const range = pickStart && !hasCustom
    ? { start: pickStart, end: pickStart }
    : rangeFor(state.kind === 'day' ? state : { kind:'day', preset });

  return <Fragment>
    <div className="period-subtabs">
      {DAY_PRESETS.map(n => (
        <button key={n}
          className={cn('period-subtab-btn', !hasCustom && preset === n && 'is-active')}
          onClick={() => { setPickStart(null); onChange({ kind:'day', preset:n }); }}>
          {n} дней
        </button>
      ))}
    </div>
    <div className="period-pick-hint">
      {pickStart && !hasCustom
        ? `Выбрано начало: ${fmtDayShort(pickStart)}. Кликните конечную дату.`
        : hasCustom
          ? `Период: ${fmtDayShort(new Date(state.customStart))} — ${fmtDayShort(new Date(state.customEnd))}`
          : 'Или выберите даты в календаре'}
    </div>
    <CalendarTwoMonths year={cal.year} month={cal.month}
      range={range} pickStart={pickStart} onNav={setCal} onPick={handlePick}/>
  </Fragment>;
}

function WeekBody({ state, onChange }) {
  const current = state.kind === 'week' ? state.current !== false : true;
  const [cal, setCal] = useState({ year: PERIOD_TODAY.getFullYear(), month: PERIOD_TODAY.getMonth() });
  return <Fragment>
    <div className="period-subtabs">
      <button className={cn('period-subtab-btn', current && 'is-active')} onClick={() => onChange({ kind:'week', current:true })}>Текущая</button>
      <button className={cn('period-subtab-btn', !current && 'is-active')} onClick={() => onChange({ kind:'week', current:false })}>Прошедшая</button>
    </div>
    <CalendarTwoMonths year={cal.year} month={cal.month} range={rangeFor({ kind:'week', current })} onNav={setCal}/>
  </Fragment>;
}

function MonthBody({ state, onChange }) {
  const current = state.kind === 'month' ? state.current !== false : true;
  const sel = state.kind === 'month' && state.year != null
    ? { y: state.year, m: state.monthIdx ?? PERIOD_TODAY.getMonth() }
    : { y: PERIOD_TODAY.getFullYear(), m: PERIOD_TODAY.getMonth() };
  const years = [2026, 2027, 2028];
  return <Fragment>
    <div className="period-subtabs">
      <button className={cn('period-subtab-btn', current && 'is-active')} onClick={() => onChange({ kind:'month', current:true, year:PERIOD_TODAY.getFullYear(), monthIdx:PERIOD_TODAY.getMonth() })}>Текущий</button>
      <button className={cn('period-subtab-btn', !current && 'is-active')} onClick={() => onChange({ kind:'month', current:false, year:sel.y, monthIdx:sel.m })}>Прошедший</button>
    </div>
    <div className="period-list">
      {years.map(y => (
        <div key={y} className="period-list-year">
          <div className="period-year-label">{y}</div>
          <div className="period-month-grid">
            {MONTHS_SHORT.map((m, i) => (
              <button key={m}
                className={cn('period-cell', sel.y === y && sel.m === i && 'is-active')}
                onClick={() => onChange({ kind:'month', current: y === PERIOD_TODAY.getFullYear() && i === PERIOD_TODAY.getMonth(), year:y, monthIdx:i })}>
                {m}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Fragment>;
}

function QuarterBody({ state, onChange }) {
  const todayQ = Math.floor(PERIOD_TODAY.getMonth() / 3) + 1;
  const current = state.kind === 'quarter' ? state.current !== false : true;
  const sel = state.kind === 'quarter' && state.year != null
    ? { y: state.year, q: state.quarter || todayQ }
    : { y: PERIOD_TODAY.getFullYear(), q: todayQ };
  const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
  return <Fragment>
    <div className="period-subtabs">
      <button className={cn('period-subtab-btn', current && 'is-active')} onClick={() => onChange({ kind:'quarter', current:true, year:PERIOD_TODAY.getFullYear(), quarter:todayQ })}>Текущий</button>
      <button className={cn('period-subtab-btn', !current && 'is-active')} onClick={() => onChange({ kind:'quarter', current:false, year:sel.y, quarter:sel.q })}>Прошедший</button>
    </div>
    <div className="period-list">
      {years.map(y => (
        <div key={y} className="period-list-row">
          <div className="period-year-label-inline">{y}</div>
          <div className="period-quarter-row">
            {[1,2,3,4].map(q => (
              <button key={q}
                className={cn('period-cell', sel.y === y && sel.q === q && 'is-active')}
                onClick={() => onChange({ kind:'quarter', current: y === PERIOD_TODAY.getFullYear() && q === todayQ, year:y, quarter:q })}>
                Q{q}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Fragment>;
}

function YearBody({ state, onChange }) {
  const current = state.kind === 'year' ? state.current !== false : true;
  const sel = state.kind === 'year' && state.year != null ? state.year : PERIOD_TODAY.getFullYear();
  const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
  return <Fragment>
    <div className="period-subtabs">
      <button className={cn('period-subtab-btn', current && 'is-active')} onClick={() => onChange({ kind:'year', current:true, year:PERIOD_TODAY.getFullYear() })}>Текущий</button>
      <button className={cn('period-subtab-btn', !current && 'is-active')} onClick={() => onChange({ kind:'year', current:false, year:sel })}>Прошедший</button>
    </div>
    <div className="period-list">
      {years.map(y => (
        <button key={y}
          className={cn('period-year-btn', y === sel && 'is-active')}
          onClick={() => onChange({ kind:'year', current: y === PERIOD_TODAY.getFullYear(), year:y })}>
          {y}
        </button>
      ))}
    </div>
  </Fragment>;
}

function PeriodPopover({ state, onChange }) {
  const [tab, setTab] = useState(state.kind);
  return <div className="period-popover" onClick={(e) => e.stopPropagation()}>
    <div className="period-tabs">
      {PERIOD_TABS.map(t => (
        <button key={t.key}
          className={cn('period-tab-btn', tab === t.key && 'is-active')}
          onClick={() => setTab(t.key)}>
          {t.label}
        </button>
      ))}
    </div>
    <div className="period-popover-body">
      {tab === 'day' && <DayBody state={state} onChange={onChange}/>}
      {tab === 'week' && <WeekBody state={state} onChange={onChange}/>}
      {tab === 'month' && <MonthBody state={state} onChange={onChange}/>}
      {tab === 'quarter' && <QuarterBody state={state} onChange={onChange}/>}
      {tab === 'year' && <YearBody state={state} onChange={onChange}/>}
    </div>
  </div>;
}

const PeriodSelector = ({ value, onChange }) => {
  const state = normalizePeriodState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return <div ref={ref} className="period-selector">
    <button className="period-trigger" onClick={() => setOpen(o => !o)} aria-haspopup="dialog" aria-expanded={open}>
      <Icon.calendar size={13}/>
      <span>{periodLabel(state)}</span>
      <Icon.chevDown size={11}/>
    </button>
    {open && <PeriodPopover state={state} onChange={(v) => { onChange(v); setOpen(false); }}/>}
  </div>;
};

// Pagination
const Pagination = ({ page, totalPages, onChange, perPage, onPerPageChange, total }) => {
  const pages = [];
  const max = Math.min(totalPages, 5);
  let start = Math.max(1, page - 2);
  let end = Math.min(totalPages, start + max - 1);
  start = Math.max(1, end - max + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return <div className="pagination">
    <div className="pagination-info">Всего {total} · Показывать по
      <select className="pp-select" value={perPage} onChange={e=>onPerPageChange(parseInt(e.target.value))}>
        {[10,20,50,100].map(n=> <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
    <div className="pagination-controls">
      <button className="pg-btn" disabled={page===1} onClick={()=>onChange(page-1)}><Icon.chevLeft size={13}/></button>
      {start>1 && <><button className="pg-btn" onClick={()=>onChange(1)}>1</button>{start>2 && <span className="pg-dots">…</span>}</>}
      {pages.map(p => <button key={p} className={cn('pg-btn', p===page && 'is-active')} onClick={()=>onChange(p)}>{p}</button>)}
      {end<totalPages && <>{end<totalPages-1 && <span className="pg-dots">…</span>}<button className="pg-btn" onClick={()=>onChange(totalPages)}>{totalPages}</button></>}
      <button className="pg-btn" disabled={page===totalPages} onClick={()=>onChange(page+1)}><Icon.chevRight size={13}/></button>
    </div>
  </div>;
};

// Empty state
const EmptyState = ({ icon, title, desc, action }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon || <Icon.inbox size={26}/>}</div>
    <div className="empty-title">{title}</div>
    {desc && <div className="empty-desc">{desc}</div>}
    {action}
  </div>
);

// Modal / Dialog (simple)
const Modal = ({ open, onClose, title, children, footer, size='md' }) => {
  if (!open) return null;
  return <div className="modal-overlay" onClick={onClose}>
    <div className={cn('modal', 'modal-' + size)} onClick={e=>e.stopPropagation()}>
      <div className="modal-header">
        <div className="modal-title">{title}</div>
        <button className="icon-btn" onClick={onClose}><Icon.x/></button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>;
};

// ── Tri-state column sort (rule 3) ─────────────────────────────────────────
// Cycle on the same key: (current dir) → asc → desc → none → asc …
// none = sortKey/sortDir both null → caller renders items in original order.
function useTriStateSort(initialKey = null, initialDir = null) {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDir, setSortDir] = useState(initialDir);
  const sortBy = (k) => {
    if (sortKey !== k) { setSortKey(k); setSortDir('asc'); return; }
    if (sortDir === 'asc')  { setSortDir('desc'); return; }
    if (sortDir === 'desc') { setSortKey(null); setSortDir(null); return; }
    setSortDir('asc');
  };
  return { sortKey, sortDir, sortBy };
}

// Sort indicator: arrow when active, nothing when inactive (rule 3 — "no arrow" for unsorted).
const SortIndicator = ({ active, dir }) => {
  if (!active || !dir) return null;
  return <span className="sort-ind is-active">
    {dir === 'asc' ? <Icon.arrowUp size={9}/> : <Icon.arrowDown size={9}/>}
  </span>;
};

// Apply tri-state sort to an array; returns the same reference when no sort is active.
const applyTriStateSort = (items, sortKey, sortDir) => {
  if (!sortKey || !sortDir) return items;
  const sign = sortDir === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    // Strings compare with localeCompare so Cyrillic sorts correctly.
    if (typeof va === 'string' || typeof vb === 'string') {
      return String(va ?? '').localeCompare(String(vb ?? ''), 'ru') * sign;
    }
    const na = va ?? -Infinity, nb = vb ?? -Infinity;
    return (na < nb ? -1 : na > nb ? 1 : 0) * sign;
  });
};

// ── Call direction icon (rule 5) ───────────────────────────────────────────
// direction: 'in' | 'out'. answered: boolean. Renders a small diagonal arrow
// with a native tooltip; non-answered calls render in the danger color.
const CallDirectionIcon = ({ direction, answered, size = 13 }) => {
  const dir = direction === 'in' ? 'in' : 'out';
  const success = answered !== false;
  const label = (dir === 'in' ? 'Входящий ' : 'Исходящий ') + (success ? 'успешный' : 'неуспешный');
  const color = success ? 'var(--muted-foreground)' : 'var(--danger)';
  const Glyph = dir === 'in' ? Icon.arrowDownLeft : Icon.arrowUpRight;
  return (
    <span title={label} aria-label={label} style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      color, lineHeight:0, verticalAlign:'middle'
    }}>
      <Glyph size={size}/>
    </span>
  );
};

// Export to global
Object.assign(window, {
  cn, Icon, Button, Badge, PriorityBadge, Card, CardHeader, CardTitle, CardContent,
  Tabs, Avatar, Progress, ScoreCell, PercentCell, Delta, Sparkline, Tooltip,
  Switch, Select, PeriodSelector, Pagination, EmptyState, Modal,
  useTriStateSort, SortIndicator, applyTriStateSort, CallDirectionIcon,
  formatAge,
});
