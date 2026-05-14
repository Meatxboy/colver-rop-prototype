// ── Call Detail Page ──────────────────────────────────────────────────────
function CallDetail({ call, data, onBack, onOpenManager }) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0.18);

  if (!call) {
    return <div className="content"><EmptyState title="Звонок не найден" desc="Возможно, он был архивирован."/></div>;
  }

  const scoreV10 = (call.score || 0) * 2;
  const scoreClass = scoreV10 >= 8 ? 'is-good' : scoreV10 >= 6 ? 'is-warn' : scoreV10 >= 4 ? 'is-default' : 'is-bad';
  const mainRec = (call.recommendations || [])[0];
  const otherClient = call.client === call.manager ? '—' : call.client;

  return (
    <div className="content">
      <div className="row-between">
        <Button variant="ghost" size="md" onClick={onBack}><Icon.back size={14}/> К списку звонков</Button>
        <div className="row" style={{gap:6}}>
          <Button variant="outline" size="md"><Icon.download size={13}/> Экспорт</Button>
          <Button variant="default" size="md"><Icon.send size={13}/> Обратная связь</Button>
        </div>
      </div>

      <div className="call-detail-page">
        {/* Header: meta слева, оценка справа */}
        <div className="cd-header">
          <div className="cd-header-meta">
            <div className="cd-title">Звонок {call.id}</div>
            <div className="cd-meta-row">
              <span style={{display:'inline-flex', alignItems:'center', gap:4}}>
                <CallDirectionIcon direction={call.direction} answered={call.answered} size={14}/>
                <span>{call.datetime}</span>
              </span>
              <span className="cd-dot">·</span>
              <span>{call.duration}</span>
              <span className="cd-dot">·</span>
              <button onClick={()=>onOpenManager(call.manager)} className="cd-link">{call.manager}</button>
              <span className="cd-arrow">→</span>
              <span style={{fontWeight:500}}>{otherClient}</span>
            </div>
            <div className="cd-tags">
              {(call.flags||[]).map(f => <Badge key={f} variant="danger">⚠ {f}</Badge>)}
              {(call.tags||[]).slice(0,3).map(t => <Badge key={t} variant="default">{t}</Badge>)}
            </div>
          </div>
          <div className="cd-score-card">
            <div className={cn('cd-score-big', 'score', scoreClass)}>{call.score?.toFixed(1) || '—'}</div>
            <div className="cd-score-label">оценка звонка</div>
          </div>
        </div>

        {/* Двухколоночный grid: критерии слева, ИИ-резюме справа */}
        <div className="cd-grid">
          <Card>
            <CardContent>
              <div className="cd-section-title">Оценка по критериям</div>
              <div style={{height:6}}></div>
              {(call.criteria || []).map((c) => {
                const v10 = c.score;
                const cls = v10 >= 8 ? 'is-good' : v10 >= 6 ? 'is-warn' : v10 >= 4 ? 'is-default' : 'is-bad';
                return (
                  <div key={c.name} className="cd-criterion">
                    <div className="cd-criterion-head">
                      <span className="cd-criterion-name">{c.name}</span>
                      <span className={cn('cd-criterion-score', cls)}>{c.score}/10</span>
                    </div>
                    <div className={cn('cd-criterion-bar', cls)}>
                      <div className="cd-criterion-fill" style={{width: (c.score*10)+'%'}}></div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="cd-section-title">Резюме ИИ</div>
              <div className="cd-summary-text">{call.summary}</div>
              {mainRec && (
                <div className="cd-recommendation">
                  <div className="cd-recommendation-label">РЕКОМЕНДАЦИЯ</div>
                  <div className="cd-recommendation-text">{mainRec.text}</div>
                </div>
              )}
              <div className="cd-summary-actions">
                <Button variant="default" size="md"><Icon.calendar size={13}/> Создать задачу</Button>
                <Button variant="outline" size="md"><Icon.phone size={13}/> Перезвонить</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Транскрипт ниже на всю ширину */}
        <Card>
          <CardContent>
            <div className="cd-transcript-head">
              <div className="cd-section-title" style={{margin:0}}>Транскрипция</div>
              <span className="muted" style={{fontSize:12.5}}>{(call.transcript||[]).length} реплик</span>
            </div>
            <div className="audio-player" style={{marginBottom:16}}>
              <button className="player-btn" onClick={()=>setPlaying(!playing)}>
                {playing ? <Icon.x size={14}/> : <Icon.play size={12}/>}
              </button>
              <div className="player-track" onClick={(e)=>{
                const rect = e.currentTarget.getBoundingClientRect();
                setPosition((e.clientX - rect.left) / rect.width);
              }}>
                <div className="player-fill" style={{width: (position*100)+'%'}}></div>
              </div>
              <div className="player-time">{formatTime(position * call.durationSec)} / {call.duration}</div>
            </div>
            <div className="cd-transcript">
              {(call.transcript || []).map((line, i) => (
                <div key={i} className={cn('cd-transcript-line', 'who-' + line.who)}>
                  <div className="cd-transcript-time">{line.time}</div>
                  <div className={cn('cd-transcript-who', 'who-' + line.who)}>{line.who}</div>
                  <div className="cd-transcript-text">{line.text}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Call Modal (открывает карточку звонка поверх текущей страницы) ────────
const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 2, 0.75];

function CallModal({ callId, data, tasks, onOpenTask, onClose, onCreateTask, onResolveCall, zIndex }) {
  const baseCall = data.calls.find(c => c.id === callId) || data.calls[0];
  const detail   = data.callDetails[callId] || data.callDetails[data.calls[0]?.id] || {};
  const call     = { ...baseCall, ...detail };

  // Динамический z — каждая новая модалка поверх предыдущей.
  const dynZ = useModalZ();
  const effZ = zIndex || dynZ;

  // Блокировать скролл страницы пока модалка открыта
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0.18);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  if (!call) return null;

  const scoreV10  = (call.score || 0) * 2;
  const scoreClass = scoreV10 >= 8 ? 'is-good' : scoreV10 >= 6 ? 'is-warn' : scoreV10 >= 4 ? 'is-default' : 'is-bad';
  const mainRec   = (call.recommendations || [])[0];
  const otherClient = call.client;
  // Open-task indicator (matches the dashboard one). Strip C- prefix like adapter does.
  const norm = (id) => String(id || '').replace(/^C-/, '');
  const openTask = (tasks || []).find(t => norm(t.callId) === norm(callId) && t.status !== 'done' && t.status !== 'partial') || null;
  // Find queue item for this call (used to enable "Отметить решённым").
  // Use the raw callId param (not the resolved fallback) so queue C-1841 still matches.
  const queueItem = (data.queue || []).find(q => norm(q.callId) === norm(callId)) || null;
  const taskPrefillTitle = queueItem?.problem || (mainRec && mainRec.text ? mainRec.text.slice(0, 80) : '') || `Разобрать звонок ${call.id || callId}`;
  const taskPrefillText  = queueItem?.recommendation || (mainRec && mainRec.text) || call.summary || '';

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:effZ,display:'flex',alignItems:'flex-start',justifyContent:'center',
        background:'rgba(9,9,11,.45)',backdropFilter:'blur(2px)',overflowY:'auto',padding:'32px 16px'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:900,boxShadow:'0 24px 64px rgba(0,0,0,.18)',
        position:'relative',overflow:'hidden'}}>

        {/* Шапка модалки */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',
          borderBottom:'1px solid var(--border)',background:'#fff',position:'sticky',top:0,zIndex:10}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:15,fontWeight:700}}>Звонок {call.id || callId}</span>
            <span style={{fontSize:12,color:'var(--muted-foreground)'}}>
              {call.datetime} · {call.duration}
            </span>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {openTask && (
              <button type="button" className="task-indicator is-chip"
                title={`Перейти к задаче · ${openTask.id}`}
                onClick={() => onOpenTask && onOpenTask(openTask)}>
                <Icon.taskBadge size={13}/>
                <span>Есть задача</span>
              </button>
            )}
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',padding:6,
              borderRadius:6,color:'var(--muted-foreground)',display:'flex',alignItems:'center'}}
              aria-label="Закрыть">
              <Icon.x size={18}/>
            </button>
          </div>
        </div>

        {/* Тело модалки */}
        <div style={{padding:20,display:'flex',flexDirection:'column',gap:14}}>

          {/* Хедер: метаданные + оценка */}
          <div className="cd-header" style={{margin:0}}>
            <div className="cd-header-meta">
              <div className="cd-title">Звонок {call.id || callId}</div>
              <div className="cd-meta-row">
                <span style={{display:'inline-flex', alignItems:'center', gap:4}}>
                  <CallDirectionIcon direction={call.direction} answered={call.answered} size={14}/>
                  <span>{call.datetime}</span>
                </span>
                <span className="cd-dot">·</span>
                <span>{call.duration}</span>
                <span className="cd-dot">·</span>
                <span style={{fontWeight:500}}>{call.manager}</span>
                <span className="cd-arrow">→</span>
                <span style={{fontWeight:500}}>{otherClient}</span>
                {call.phone && <>
                  <span className="cd-dot">·</span>
                  <span style={{display:'inline-flex',alignItems:'center',gap:4}}>
                    <Icon.phone size={12}/>{call.phone}
                  </span>
                </>}
              </div>
              <div className="cd-tags">
                {(call.flags||[]).map(f => <Badge key={f} variant="danger">⚠ {f}</Badge>)}
                {(call.tags||[]).slice(0,3).map(t => <Badge key={t} variant="default">{t}</Badge>)}
              </div>
            </div>
            <div className="cd-score-card">
              <div className={cn('cd-score-big','score',scoreClass)}>{call.score?.toFixed(1) || '—'}</div>
              <div className="cd-score-label">оценка звонка</div>
            </div>
          </div>

          {/* Двухколоночный grid: критерии (узкие, без прогресс-бара) + резюме нейроаналитика (шире) */}
          <div className="cd-grid">
            <Card>
              <CardContent>
                <div className="cd-section-title">Оценка по критериям</div>
                <div style={{height:6}}/>
                {(call.criteria||[]).map(c => {
                  const v10 = c.score;
                  const cls = v10 >= 8 ? 'is-good' : v10 >= 6 ? 'is-warn' : v10 >= 4 ? 'is-default' : 'is-bad';
                  return (
                    <div key={c.name} className="cd-criterion is-compact">
                      <div className="cd-criterion-head">
                        <span className="cd-criterion-name">{c.name}</span>
                        <span className={cn('cd-criterion-score',cls)}>{c.score}/10</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="cd-section-title">Резюме нейроаналитика</div>
                <div className="cd-summary-text">{call.summary}</div>
                {mainRec && (
                  <div className="cd-recommendation">
                    <div className="cd-recommendation-label">РЕКОМЕНДАЦИЯ</div>
                    <div className="cd-recommendation-text">{mainRec.text}</div>
                  </div>
                )}
                <div className="cd-summary-actions">
                  {openTask
                    ? <Button variant="default" size="md" onClick={() => onOpenTask && onOpenTask(openTask)}><Icon.calendar size={13}/> Перейти в задачу</Button>
                    : <Button variant="default" size="md" onClick={() => onCreateTask && onCreateTask({ manager: call.manager, callId: call.id, title: taskPrefillTitle, text: taskPrefillText, priority:'medium' })}><Icon.calendar size={13}/> Создать задачу</Button>
                  }
                  {queueItem && (
                    <Button variant="success" size="md" onClick={() => setResolveOpen(true)}><Icon.check size={13}/> Отметить решённым</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Аудио + скрываемая транскрипция */}
          <Card>
            <CardContent>
              <div className="cd-transcript-head">
                <div className="cd-section-title" style={{margin:0}}>Аудио звонка</div>
                <span className="muted" style={{fontSize:12.5}}>{(call.transcript||[]).length} реплик</span>
              </div>
              <div className="audio-player" style={{marginBottom:12}}>
                <button className="player-btn" onClick={()=>setPlaying(!playing)}>
                  {playing ? <Icon.x size={14}/> : <Icon.play size={12}/>}
                </button>
                <div className="player-track" onClick={e=>{
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPosition((e.clientX - rect.left) / rect.width);
                }}>
                  <div className="player-fill" style={{width:(position*100)+'%'}}/>
                </div>
                <div className="player-time">{formatTime(position*(call.durationSec||0))} / {call.duration}</div>
                <button
                  type="button"
                  className="player-speed"
                  title="Скорость воспроизведения"
                  onClick={() => setSpeedIdx((speedIdx + 1) % PLAYBACK_SPEEDS.length)}>
                  {PLAYBACK_SPEEDS[speedIdx]}×
                </button>
              </div>
              <div style={{display:'flex', justifyContent:'flex-start'}}>
                <Button variant="ghost" size="sm" onClick={() => setTranscriptOpen(o => !o)}>
                  {transcriptOpen
                    ? <><Icon.chevUp size={14}/> Скрыть транскрибацию</>
                    : <><Icon.chevDown size={14}/> Показать транскрибацию</>}
                </Button>
              </div>
              {transcriptOpen && (
                <div className="cd-transcript" style={{marginTop:12}}>
                  {(call.transcript||[]).map((line,i) => (
                    <div key={i} className={cn('cd-transcript-line','who-'+line.who)}>
                      <div className="cd-transcript-time">{line.time}</div>
                      <div className={cn('cd-transcript-who','who-'+line.who)}>{line.who}</div>
                      <div className="cd-transcript-text">{line.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {resolveOpen && queueItem && (() => {
        const RM = window.ResolveModal;
        return RM ? (
          <RM
            item={queueItem}
            onClose={() => setResolveOpen(false)}
            onConfirm={(comment) => {
              setResolveOpen(false);
              onResolveCall && onResolveCall(queueItem.id, comment);
            }}
          />
        ) : null;
      })()}
    </div>
  );
}

function KV({ label, value }) {
  return <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
    <span className="muted" style={{fontSize:12}}>{label}</span>
    <span style={{fontSize:12.5, fontWeight:500, textAlign:'right'}}>{value}</span>
  </div>;
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec/60), s = Math.floor(sec%60);
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// ── Processed page ──────────────────────────────────────────────────────
function ProcessedPage({ data, onOpenCall }) {
  const items = data.processed || [];
  // Pagination state — futer like dashboard/calls.
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const paged = items.slice(page * pageSize, (page + 1) * pageSize);

  // Текст в колонке «Действие»: комментарий РОПа → последний комментарий
  // задачи по звонку (через data.tasks, если будет проброшен) → дефолт «Решено».
  const tasksByCallId = (data.tasks || []).reduce((m, t) => {
    const k = String(t.callId || '').replace(/^C-/, '');
    if (k && (!m[k] || (Array.isArray(t.comments) && t.comments.length))) m[k] = t;
    return m;
  }, {});
  const actionText = (p) => {
    if (p.comment && p.comment.trim()) return p.comment.trim();
    const t = tasksByCallId[String(p.callId || '').replace(/^C-/, '')];
    if (t && Array.isArray(t.comments) && t.comments.length) {
      return t.comments[t.comments.length - 1].text;
    }
    return 'Решено';
  };

  return (
    <div className="content">
      <div className="row-between">
        <div>
          <div className="page-title" style={{fontSize:20}}>Обработанные</div>
          <div className="muted" style={{fontSize:12.5, marginTop:2}}>История разобранных звонков из очереди внимания</div>
        </div>
        <div className="row"><PeriodSelector value="month" onChange={()=>{}}/></div>
      </div>
      <Card>
        <table className="data-table">
          <thead><tr>
            <th style={{width:90}}>Дата</th>
            <th style={{width:'30%'}}>Проблема</th>
            <th style={{width:200}}>Менеджер</th>
            <th>Действие</th>
          </tr></thead>
          <tbody>
            {paged.map(p => (
              <tr key={p.id} className="is-clickable" onClick={()=>onOpenCall(p.callId)}>
                <td className="muted" style={{fontSize:12}}>{p.date}</td>
                <td>
                  <div style={{fontWeight:500}}>{p.problem}</div>
                  <div className="muted" style={{fontSize:12, marginTop:2}}>Звонок #{p.callId}</div>
                </td>
                <td>
                  <span style={{fontWeight:500}}>{p.manager}</span>
                </td>
                <td>
                  <span style={{fontSize:13, color:'var(--foreground)', lineHeight:1.45}}>
                    {actionText(p)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <QueuePager
          total={items.length}
          page={page}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={(s) => { setPageSize(s); setPage(0); }}
          totalPages={totalPages}
          pageSizes={[10, 20, 50]}
        />
      </Card>
    </div>
  );
}

// ── Analytics page ─────────────────────────────────────────────────────
function AnalyticsPage({ data, period, setPeriod }) {
  const trend = data.kpis.callsTrend.concat(data.kpis.callsTrend.slice(0,5));
  return (
    <div className="content">
      <div className="row-between">
        <div>
          <div className="page-title" style={{fontSize:20}}>Аналитика</div>
          <div className="muted" style={{fontSize:12.5, marginTop:2}}>Глубокий разбор работы команды</div>
        </div>
        <PeriodSelector value={period} onChange={setPeriod}/>
      </div>

      <div className="kpi-grid">
        <Card className="kpi-card">
          <div className="kpi-label">Звонков за период</div>
          <div className="kpi-value-row"><div className="kpi-value">487</div></div>
          <div className="kpi-meta"><Delta value={12} suffix="%"/><span className="muted" style={{fontSize:12}}>vs пред. период</span></div>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-label">Ср. длительность</div>
          <div className="kpi-value-row"><div className="kpi-value">6:24</div></div>
          <div className="kpi-meta"><Delta value={-8} suffix="%"/><span className="muted" style={{fontSize:12}}>сократилась</span></div>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-label">Воронка → продажа</div>
          <div className="kpi-value-row"><div className="kpi-value">38%</div></div>
          <div className="kpi-meta"><Delta value={4} suffix=" пп"/></div>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-label">NPS клиента (AI)</div>
          <div className="kpi-value-row"><div className="kpi-value">7.8</div></div>
          <div className="kpi-meta"><Delta value={3}/></div>
        </Card>
      </div>

      <div className="dashboard-row-2">
        <Card>
          <CardHeader><CardTitle>Динамика звонков</CardTitle></CardHeader>
          <CardContent>
            <div className="bar-chart">
              {trend.map((v, i) => {
                const max = Math.max(...trend);
                const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
                return <div key={i} className="bar" style={{height: (v/max*100)+'%'}}>
                  <div className="bar-value">{v}</div>
                  <div className="bar-label">{days[i % 7]}</div>
                </div>;
              })}
            </div>
            <div style={{height: 24}}></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Распределение по баллам</CardTitle></CardHeader>
          <CardContent>
            {[
              { range: '9.0 – 10.0', count: 42, color: '#16A34A' },
              { range: '7.0 – 8.9', count: 156, color: '#65A30D' },
              { range: '5.0 – 6.9', count: 184, color: '#D97706' },
              { range: '3.0 – 4.9', count: 78, color: '#EA580C' },
              { range: '< 3.0', count: 27, color: '#DC2626' },
            ].map(r => {
              const max = 200;
              return <div key={r.range} style={{display:'flex',alignItems:'center',gap:10, padding:'8px 0'}}>
                <div style={{width:90, fontSize:12.5, fontFamily:'SF Mono, Menlo, monospace'}}>{r.range}</div>
                <div style={{flex:1, height:18, background:'var(--secondary)', borderRadius:4, overflow:'hidden'}}>
                  <div style={{height:'100%', width:(r.count/max*100)+'%', background:r.color, borderRadius:4}}></div>
                </div>
                <div style={{width:40, textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{r.count}</div>
              </div>;
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Сравнение менеджеров</CardTitle></CardHeader>
        <ManagersTable rows={data.managers} onOpen={()=>{}}/>
      </Card>
    </div>
  );
}

// ── Offline: нет интернета ───────────────────────────────────────────────
// Полноэкранный overlay поверх приложения. Появляется автоматически по
// `offline`-событию браузера или вручную через demo-флаг (для прототипа).
function OfflinePage({ onRetry }) {
  const [retrying, setRetrying] = useState(false);
  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      onRetry && onRetry();
    }, 600);
  };
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9000,
      background:'rgba(250,250,250,.96)',
      backdropFilter:'blur(4px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'24px 16px'
    }}>
      <div style={{textAlign:'center', maxWidth:480}}>
        {/* Wi-Fi off icon */}
        <div style={{display:'flex', justifyContent:'center', marginBottom:16}}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
            stroke="#71717A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
        </div>
        <div style={{fontSize:22, fontWeight:700, marginBottom:8}}>
          Нет подключения к интернету
        </div>
        <div style={{fontSize:14, color:'var(--muted-foreground)', lineHeight:1.55, marginBottom:24}}>
          Проверьте Wi-Fi или мобильную сеть и попробуйте обновить страницу.
          Часть последних данных может быть устаревшей.
        </div>
        <button
          onClick={handleRetry}
          disabled={retrying}
          style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'10px 18px', borderRadius:8,
            background: 'var(--primary)', color:'#fff',
            border:0, cursor: retrying ? 'default' : 'pointer',
            fontSize:14, fontWeight:600,
            opacity: retrying ? .6 : 1,
            transition:'background .12s, box-shadow .12s, transform .05s',
          }}
          onMouseEnter={e => { if(!retrying) e.currentTarget.style.boxShadow = '0 4px 14px rgba(29,78,216,.28)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{animation: retrying ? 'spin 1s linear infinite' : 'none'}}>
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {retrying ? 'Проверяем…' : 'Повторить'}
        </button>
        <div style={{fontSize:11.5, color:'var(--muted-foreground)', marginTop:14}}>
          Если связь восстановится автоматически — окно закроется само.
        </div>
      </div>
    </div>
  );
}

// ── 404: страница не найдена ─────────────────────────────────────────────
function NotFoundPage({ onGoHome }) {
  return (
    <div className="content" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'70vh'}}>
      <div style={{textAlign:'center', maxWidth:480, padding:'40px 20px'}}>
        <div style={{fontSize:120, fontWeight:800, lineHeight:1,
          background:'linear-gradient(135deg, var(--primary), #7C3AED)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text', letterSpacing:'-4px', marginBottom:12}}>
          404
        </div>
        <div style={{fontSize:22, fontWeight:700, marginBottom:10}}>
          Страница не найдена
        </div>
        <div style={{fontSize:14, color:'var(--muted-foreground)', lineHeight:1.55, marginBottom:24}}>
          Возможно, ссылка устарела или раздел был перемещён. Проверьте адрес
          или вернитесь на главную.
        </div>
        <div style={{display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap'}}>
          <Button variant="default" size="md" onClick={onGoHome}>
            <Icon.back size={14}/> На дашборд
          </Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CallDetail, CallModal, ProcessedPage, AnalyticsPage, NotFoundPage, OfflinePage });
