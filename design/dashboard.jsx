// ── Dashboard page ────────────────────────────────────────────────────────
function Dashboard({ data, onOpenCall, onOpenManager, period, setPeriod, onProcess, onCreateTask }) {
  const { kpis, queue, queueManagement, queuePractices, managers, lossReasons, objections, callsToday, ratings = { byScore:[], byConv:[] } } = data;
  const [queueTab, setQueueTab] = useState('attention');
  const [managerModalId, setManagerModalId] = useState(null);
  const managerModalData = managers.find(m => m.id === managerModalId) || null;
  const queueCounts = { attention: queue.length, management: queueManagement.length, practices: queuePractices.length };

  return (
    <div className="content">
      {/* Header row (no filters apply below queue) */}
      <div className="row-between">
        <div>
          <div className="page-title" style={{fontSize:20}}>Дашборд</div>
          <div className="muted" style={{fontSize:12.5, marginTop:2}}>Команда А · 6 менеджеров · обновлено только что</div>
        </div>
      </div>

      {/* HERO: Очередь (требуют внимания / упр. решения / лучшие практики) */}
      <Card>
        <CardHeader>
          <div style={{display:'flex', alignItems:'center', gap:14, flex:1, flexWrap:'wrap'}}>
            <Tabs
              tabs={[
                {key:'attention', label:'Требуют внимания', count: queueCounts.attention},
                {key:'management', label:'Управленческие решения', count: queueCounts.management},
                {key:'practices', label:'Лучшие практики', count: queueCounts.practices},
              ]}
              active={queueTab}
              onChange={setQueueTab}
            />
            <div className="section-h-sub" style={{margin:0, flex:'1 1 240px', minWidth:0}}>
              {queueTab === 'attention' && 'Звонки с критическими нарушениями — отсортированы AI по приоритету'}
              {queueTab === 'management' && 'Системные сбои и нестандартные кейсы, требующие решения РОП'}
              {queueTab === 'practices' && 'Эталонные приёмы, которые AI рекомендует масштабировать на команду'}
            </div>
          </div>
          <div className="row" style={{gap:10, alignItems:'center'}}>
            <div className="muted" style={{fontSize:11.5, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap'}}>
              <span style={{width:6, height:6, borderRadius:3, background:'#22C55E', display:'inline-block', flexShrink:0}}></span>
              обновлено только что · авто
            </div>
          </div>
        </CardHeader>
        {queueTab === 'attention' && <AttentionQueue items={queue} onOpenCall={onOpenCall} onProcess={onProcess} onCreateTask={onCreateTask}/>}
        {queueTab === 'management' && <ManagementQueue items={queueManagement} onProcess={onProcess}/>}
        {queueTab === 'practices' && <PracticesQueue items={queuePractices}/>}
      </Card>

      {/* Period selector + KPIs */}
      <div className="row-between" style={{marginTop:4}}>
        <div className="section-h" style={{margin:0}}>Аналитика за период</div>
        <PeriodSelector value={period} onChange={setPeriod}/>
      </div>

      <div className="kpi-grid">
        <Card className="kpi-card">
          <div className="kpi-label">Средняя оценка звонка <Tooltip text="Среднее от всех составляющих оценки звонка по критериям AI"/></div>
          <div className="kpi-value-row">
            <div className={cn('kpi-value', kpis.avgScore >= 4 ? 'is-good' : kpis.avgScore >= 3 ? 'is-warn' : 'is-bad')}>{kpis.avgScore.toFixed(1)}</div>
            <span className="kpi-unit">/ 5</span>
          </div>
          <div className="kpi-meta">
            <Delta value={kpis.scoreDelta} suffix=""/>
            <span className="muted" style={{fontSize:11}}>к прошлой неделе</span>
          </div>
        </Card>
        <Card className="kpi-card is-danger">
          <div className="kpi-label">Звонки без целевого действия <Tooltip text="Количество звонков, в которых не зафиксировано целевое действие"/></div>
          <div className="kpi-value-row"><div className="kpi-value">{kpis.noTarget}</div><span className="kpi-unit">звонков</span></div>
          <div className="kpi-meta">
            <Delta value={kpis.noTargetDelta} invertColor suffix="%"/>
            <span className="muted" style={{fontSize:11}}>к прошлой неделе</span>
          </div>
        </Card>
        <Card className="kpi-card is-primary">
          <div className="kpi-label">Конверсия в целевое действие <Tooltip text="Доля звонков с зафиксированным целевым действием"/></div>
          <div className="kpi-value-row"><div className="kpi-value">{kpis.conversion}%</div></div>
          <div className="kpi-meta">
            <Delta value={kpis.convDelta} suffix=" пп"/>
            <span className="muted" style={{fontSize:11}}>к прошлой неделе</span>
          </div>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-label">Звонки без договорённостей <Tooltip text="Звонки, завершённые без фиксации следующего шага или договорённости"/></div>
          <div className="kpi-value-row"><div className="kpi-value">{kpis.noAgreement}</div><span className="kpi-unit">звонков</span></div>
          <div className="kpi-meta">
            <Delta value={kpis.noAgreementDelta} invertColor suffix="%"/>
            <span className="muted" style={{fontSize:11}}>к прошлой неделе</span>
          </div>
        </Card>
      </div>

      {/* Рейтинг сотрудников (4.5 ТЗ) */}
      <RatingTable ratings={ratings} onOpen={onOpenManager}/>

      {/* Аналитика по группе (4.7 ТЗ) */}
      <Card>
        <CardHeader>
          <CardTitle>Аналитика по группе</CardTitle>
        </CardHeader>
        <ManagersTable rows={managers} onOpen={setManagerModalId}/>
      </Card>

      {/* Manager modal */}
      {managerModalData && <ManagerModal manager={managerModalData} queueItems={queue} onClose={() => setManagerModalId(null)} onCreateTask={onCreateTask}/>}

      {/* Возражения + Причины отказа — два фрейма рядом */}
      <div style={{display:'flex', gap:16}}>
        {/* Неотработанные возражения */}
        <Card style={{flex:'1 1 0', minWidth:0}}>
          <CardHeader>
            <CardTitle>Неотработанные возражения <Tooltip text="AI извлекает из транскриптов проваленных звонков"/></CardTitle>
            <Badge variant="muted">{objections.reduce((s,r)=>s+r.count,0)} упом.</Badge>
          </CardHeader>
          <CardContent>
            {objections.map(r => (
              <div key={r.name} className="reason-row">
                <div className="reason-name" title={r.name}>{r.name}</div>
                <div className="reason-count">{r.count}</div>
                <div className="reason-pct">{r.pct}%</div>
                <div className="reason-pct" style={{minWidth:78, color: r.handled>=40?'var(--success-strong)':r.handled>=25?'var(--warning-strong)':'var(--danger-strong)'}}
                  title="Доля отработанных возражений">отраб. {r.handled}%</div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Топ причин отказа */}
        <Card style={{flex:'1 1 0', minWidth:0}}>
          <CardHeader>
            <CardTitle>Топ причин отказа <Tooltip text="AI извлекает из транскриптов проваленных звонков"/></CardTitle>
            <Badge variant="muted">{lossReasons.reduce((s,r)=>s+r.count,0)} звонков</Badge>
          </CardHeader>
          <CardContent>
            {lossReasons.map(r => (
              <div key={r.name} className="reason-row">
                <div className="reason-name" title={r.name}>{r.name}</div>
                <div className="reason-count">{r.count}</div>
                <div className="reason-pct">{r.pct}%</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      {/* Доп. аналитика (перенесено со страницы Аналитика) */}
      <div className="dashboard-row-2">
        <Card>
          <CardHeader><CardTitle>Динамика звонков</CardTitle></CardHeader>
          <CardContent>
            <div className="bar-chart">
              {(() => {
                const trend = kpis.callsTrend.concat(kpis.callsTrend.slice(0,5));
                const days = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
                const max = Math.max(...trend);
                return trend.map((v,i) => (
                  <div key={i} className="bar" style={{height:(v/max*100)+'%'}}>
                    <div className="bar-value">{v}</div>
                    <div className="bar-label">{days[i % 7]}</div>
                  </div>
                ));
              })()}
            </div>
            <div style={{height:24}}></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Распределение по баллам</CardTitle></CardHeader>
          <CardContent>
            {[
              { range: '4.5 – 5.0', count: 42, color: '#16A34A' },
              { range: '3.5 – 4.5', count: 156, color: '#65A30D' },
              { range: '2.5 – 3.5', count: 184, color: '#D97706' },
              { range: '1.5 – 2.5', count: 78, color: '#EA580C' },
              { range: '< 1.5', count: 27, color: '#DC2626' },
            ].map(r => {
              const max = 200;
              return (
                <div key={r.range} style={{display:'flex',alignItems:'center',gap:10, padding:'8px 0'}}>
                  <div style={{width:90, fontSize:12.5, fontFamily:'SF Mono, Menlo, monospace'}}>{r.range}</div>
                  <div style={{flex:1, height:18, background:'var(--secondary)', borderRadius:4, overflow:'hidden'}}>
                    <div style={{height:'100%', width:(r.count/max*100)+'%', background:r.color, borderRadius:4}}></div>
                  </div>
                  <div style={{width:40, textAlign:'right', fontWeight:700, fontVariantNumeric:'tabular-nums'}}>{r.count}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Footer (по ТЗ) */}
      <footer className="dashboard-footer">
        <div className="dashboard-footer-left">
          <div className="sidebar-logo" style={{width:24, height:24, fontSize:12, borderRadius:6}}>C</div>
          <div>
            <div style={{fontWeight:600, fontSize:13}}>Colver — Контроль качества звонков</div>
            <div className="muted" style={{fontSize:11.5}}>v2.4.1 · обновлено 28.04.2026 · команда А · 6 менеджеров</div>
          </div>
        </div>
        <div className="dashboard-footer-right">
          <a href="#" onClick={(e)=>e.preventDefault()}>Документация</a>
          <span className="muted">·</span>
          <a href="#" onClick={(e)=>e.preventDefault()}>Поддержка</a>
          <span className="muted">·</span>
          <a href="#" onClick={(e)=>e.preventDefault()}>Сменить роль</a>
          <span className="muted">·</span>
          <span className="muted" style={{fontSize:11.5}}>© 2026 Colver</span>
        </div>
      </footer>
    </div>
  );
}


const QFrag = ({ children }) => children;

// ── Queue pagination footer ──────────────────────────────────────────────
function QueuePager({ total, page, pageSize, setPage, setPageSize, totalPages }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8,
      padding:'9px 16px', borderTop:'1px solid var(--border)',
      fontSize:12.5, color:'var(--muted-foreground)'
    }}>
      <span>Всего <strong style={{color:'var(--foreground)'}}>{total}</strong></span>
      <div style={{display:'flex', alignItems:'center', gap:5}}>
        <span>Показывать по:</span>
        {[5, 10, 15].map(s => (
          <button key={s} onClick={() => { setPageSize(s); setPage(0); }} style={{
            padding:'2px 9px', borderRadius:5, border:'1px solid',
            borderColor: pageSize === s ? 'var(--primary)' : 'var(--border)',
            background: pageSize === s ? 'var(--primary)' : 'transparent',
            color: pageSize === s ? '#fff' : 'var(--foreground)',
            fontWeight: pageSize === s ? 600 : 400,
            cursor:'pointer', fontSize:12, lineHeight:'20px'
          }}>{s}</button>
        ))}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:4}}>
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{
          padding:'3px 8px', borderRadius:5, border:'1px solid var(--border)',
          background:'transparent', cursor: page === 0 ? 'default' : 'pointer',
          opacity: page === 0 ? 0.35 : 1, display:'flex', alignItems:'center'
        }}><Icon.chevLeft size={12}/></button>
        <span style={{minWidth:52, textAlign:'center', fontVariantNumeric:'tabular-nums', fontSize:12}}>
          {totalPages === 0 ? '—' : `${page + 1} / ${totalPages}`}
        </span>
        <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} style={{
          padding:'3px 8px', borderRadius:5, border:'1px solid var(--border)',
          background:'transparent', cursor: page >= totalPages - 1 ? 'default' : 'pointer',
          opacity: page >= totalPages - 1 ? 0.35 : 1, display:'flex', alignItems:'center'
        }}><Icon.chevRight size={12}/></button>
      </div>
    </div>
  );
}

// ── Attention Queue ──────────────────────────────────────────────────────
function AttentionQueue({ items, onOpenCall, onProcess, onCreateTask }) {
  const [expanded, setExpanded] = useState(items[0]?.id ?? null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Tri-state sort by Приоритет / Менеджер / Балл / Давность (rule 3).
  const { sortKey, sortDir, sortBy } = useTriStateSort();
  const sortedItems = useMemo(
    () => applyTriStateSort(items, sortKey, sortDir),
    [items, sortKey, sortDir]
  );
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const pagedItems = sortedItems.slice(page * pageSize, (page + 1) * pageSize);

  const onSort = (k) => { sortBy(k); setPage(0); setExpanded(null); };
  const handleSetPageSize = (s) => { setPageSize(s); setPage(0); setExpanded(null); };

  if (items.length === 0) {
    return <EmptyState
      icon={<Icon.check size={26}/>}
      title="Очередь пуста"
      desc="Все критичные звонки разобраны. AI продолжает мониторинг новых разговоров."
    />;
  }
  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{width:60}} className="sortable" onClick={()=>onSort('priority')}>Приор.<SortIndicator active={sortKey==='priority'} dir={sortDir}/></th>
            <th>Звонок · проблема</th>
            <th style={{width:130}} className="sortable" onClick={()=>onSort('manager')}>Менеджер<SortIndicator active={sortKey==='manager'} dir={sortDir}/></th>
            <th style={{width:80,textAlign:'center'}} className="sortable" onClick={()=>onSort('score')}>Балл<SortIndicator active={sortKey==='score'} dir={sortDir}/></th>
            <th style={{width:110,textAlign:'right'}} className="sortable" onClick={()=>onSort('ageMin')}>Давность<SortIndicator active={sortKey==='ageMin'} dir={sortDir}/></th>
            <th style={{width:200,textAlign:'right'}}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {pagedItems.map(item => (
            <QFrag key={item.id}>
              <tr className="queue-row is-clickable" onClick={()=>setExpanded(expanded===item.id?null:item.id)}>
                <td><PriorityBadge p={item.priority}/></td>
                <td className="problem-cell">
                  <div className="problem-title">{item.problem}</div>
                  <div className="problem-sub">{item.subTitle || `Клиент ${item.client}`}</div>
                </td>
                <td>
                  <span style={{fontWeight:600}}>{item.manager}</span>
                </td>
                <td className="tac"><ScoreCell value={item.score} max={5}/></td>
                <td className="tar age-cell">
                  <span style={{display:'inline-flex', alignItems:'center', gap:4, justifyContent:'flex-end', whiteSpace:'nowrap'}}>
                    <CallDirectionIcon direction={item.direction} answered={item.answered}/>
                    <span className={item.ageMin <= 30 ? 'age-fresh' : ''}>{item.age}</span>
                  </span>
                </td>
                <td className="tar">
                  <div className="actions-cell">
                    <Button size="md" variant="outline" onClick={(e)=>{e.stopPropagation(); setExpanded(expanded===item.id?null:item.id);}}>
                      Открыть {expanded===item.id ? <Icon.chevUp size={14}/> : <Icon.chevDown size={14}/>}
                    </Button>
                  </div>
                </td>
              </tr>
              {expanded === item.id && (
                <tr>
                  <td colSpan={6} style={{padding:0}}>
                    <div className="queue-expanded">
                      <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:14}}>
                        <div className="recommendation-block">
                          <div className="recommendation-label"><Icon.ai size={11}/> Рекомендация AI</div>
                          <div className="recommendation-text">{item.recommendation}</div>
                        </div>
                        <div>
                          <div className="mdp-section-title">Контекст</div>
                          <div className="mdp-text">{item.context}</div>
                        </div>
                      </div>
                      <div className="expanded-actions">
                        <Button size="lg" variant="default" onClick={()=>onOpenCall(item.callId)}><Icon.phone size={14}/> Открыть звонок</Button>
                        <Button size="lg" variant="outline" onClick={()=>onCreateTask && onCreateTask({ manager: item.manager, callId: item.callId, title: item.problem, priority: item.priority <= 1 ? 'high' : 'medium' })}><Icon.calendar size={14}/> Поставить задачу менеджеру</Button>
                        <div style={{flex:1}}></div>
                        <Button size="lg" variant="success" onClick={()=>onProcess(item.id, 'done')}><Icon.check size={14}/> Отметить решённым</Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </QFrag>
          ))}
        </tbody>
      </table>
      <QueuePager total={items.length} page={page} pageSize={pageSize} setPage={setPage} setPageSize={handleSetPageSize} totalPages={totalPages}/>
    </div>
  );
}

// ── Управленческие решения ───────────────────────────────────────────────
function ManagementQueue({ items, onProcess }) {
  const [expanded, setExpanded] = useState(items[0]?.id ?? null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Tri-state sort by Приоритет / Менеджер (employee) / Давность (rule 3).
  const { sortKey, sortDir, sortBy } = useTriStateSort();
  const sortedItems = useMemo(
    () => applyTriStateSort(items, sortKey, sortDir),
    [items, sortKey, sortDir]
  );
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const pagedItems = sortedItems.slice(page * pageSize, (page + 1) * pageSize);

  const onSort = (k) => { sortBy(k); setPage(0); setExpanded(null); };

  if (!items.length) return <EmptyState icon={<Icon.check size={26}/>} title="Нет открытых решений" desc="Системные сбои и нестандартные кейсы появятся здесь."/>;
  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{width:60}} className="sortable" onClick={()=>onSort('priority')}>Приор.<SortIndicator active={sortKey==='priority'} dir={sortDir}/></th>
            <th>Тип · описание</th>
            <th style={{width:160}} className="sortable" onClick={()=>onSort('employee')}>Затронутые<SortIndicator active={sortKey==='employee'} dir={sortDir}/></th>
            <th style={{width:90,textAlign:'right'}} className="sortable" onClick={()=>onSort('ageMin')}>Давность<SortIndicator active={sortKey==='ageMin'} dir={sortDir}/></th>
            <th style={{width:120,textAlign:'right'}}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {pagedItems.map(item => (
            <QFrag key={item.id}>
              <tr className="queue-row is-clickable" onClick={()=>setExpanded(expanded===item.id?null:item.id)}>
                <td><PriorityBadge p={item.priority}/></td>
                <td className="problem-cell">
                  <div className="problem-title">{item.type}</div>
                  <div className="problem-sub">{item.desc}</div>
                </td>
                <td><span style={{fontWeight:500}}>{item.employee}</span></td>
                <td className="tar age-cell"><span className={item.age && item.age.includes('мин') ? 'age-fresh' : ''}>{item.age}</span></td>
                <td className="tar">
                  <div className="actions-cell">
                    <Button size="sm" variant="ghost" onClick={(e)=>{e.stopPropagation(); setExpanded(expanded===item.id?null:item.id);}}>{expanded===item.id ? <Icon.chevUp size={13}/> : <Icon.chevDown size={13}/>}</Button>
                  </div>
                </td>
              </tr>
              {expanded === item.id && (
                <tr>
                  <td colSpan={5} style={{padding:0}}>
                    <div className="queue-expanded">
                      <div className="recommendation-block">
                        <div className="recommendation-label"><Icon.ai size={11}/> Рекомендация AI</div>
                        <div className="recommendation-text">{item.recommendation}</div>
                      </div>
                      <div className="expanded-actions">
                        <Button size="sm" variant="default" onClick={()=>onProcess(item.id, 'approve')}><Icon.check size={12}/> Принять решение</Button>
                        <Button size="sm" variant="outline" onClick={()=>onProcess(item.id, 'delegate')}><Icon.calendar size={12}/> Делегировать</Button>
                        <div style={{flex:1}}></div>
                        <Button size="sm" variant="ghost" onClick={()=>onProcess(item.id, 'dismiss')}>Отклонить</Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </QFrag>
          ))}
        </tbody>
      </table>
      <QueuePager total={items.length} page={page} pageSize={pageSize} setPage={setPage} setPageSize={(s)=>{setPageSize(s);setPage(0);setExpanded(null);}} totalPages={totalPages}/>
    </div>
  );
}

// ── Лучшие практики ──────────────────────────────────────────────────────
function PracticesQueue({ items }) {
  const [expanded, setExpanded] = useState(items[0]?.id ?? null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const pagedItems = items.slice(page * pageSize, (page + 1) * pageSize);

  if (!items.length) return <EmptyState icon={<Icon.ai size={26}/>} title="Пока нет находок" desc="AI продолжает искать эталонные приёмы в звонках команды."/>;
  return (
    <div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Практика</th>
            <th style={{width:160}}>Автор</th>
            <th style={{width:110,textAlign:'right'}}>Δ конверсии</th>
            <th style={{width:90,textAlign:'right'}}>Звонков</th>
            <th style={{width:120,textAlign:'right'}}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {pagedItems.map(item => (
            <QFrag key={item.id}>
              <tr className="queue-row is-clickable" onClick={()=>setExpanded(expanded===item.id?null:item.id)}>
                <td className="problem-cell">
                  <div className="problem-title">{item.title}</div>
                  <div className="problem-sub">{item.desc}</div>
                </td>
                <td><span style={{fontWeight:500}}>{item.author}</span></td>
                <td className="tar"><Delta value={parseFloat(item.convGrowth)} suffix="%"/></td>
                <td className="tar" style={{fontVariantNumeric:'tabular-nums'}}>{item.calls}</td>
                <td className="tar">
                  <div className="actions-cell">
                    <Button size="sm" variant="ghost" onClick={(e)=>{e.stopPropagation(); setExpanded(expanded===item.id?null:item.id);}}>{expanded===item.id ? <Icon.chevUp size={13}/> : <Icon.chevDown size={13}/>}</Button>
                  </div>
                </td>
              </tr>
              {expanded === item.id && (
                <tr>
                  <td colSpan={5} style={{padding:0}}>
                    <div className="queue-expanded">
                      <div className="recommendation-block">
                        <div className="recommendation-label"><Icon.ai size={11}/> Пример из звонка</div>
                        <div className="recommendation-text" style={{fontStyle:'italic'}}>{item.example}</div>
                      </div>
                      <div className="expanded-actions">
                        <Button size="sm" variant="default"><Icon.calendar size={12}/> Поделиться с командой</Button>
                        <Button size="sm" variant="outline"><Icon.phone size={12}/> Послушать звонок</Button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </QFrag>
          ))}
        </tbody>
      </table>
      <QueuePager total={items.length} page={page} pageSize={pageSize} setPage={setPage} setPageSize={(s)=>{setPageSize(s);setPage(0);setExpanded(null);}} totalPages={totalPages}/>
    </div>
  );
}

// ── Rating Table (4.5 ТЗ) ────────────────────────────────────────────────
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

// Score→colour: red (0) → amber (2.5) → green (5)
function scoreToColor(val, max) {
  if (val == null) return '#A1A1AA';
  const ratio = Math.min(1, Math.max(0, val / max));
  // HSL: 0°=red, 120°=green
  const hue = Math.round(ratio * 120);
  return `hsl(${hue}, 72%, 38%)`;
}

// Single leaderboard card (score or conv)
function RatingCard({ title, rows, valueKey, maxVal, suffix, onOpen }) {
  return (
    <Card style={{flex:'1 1 0', minWidth:0}}>
      <CardHeader>
        <CardTitle style={{fontSize:14}}>{title}</CardTitle>
      </CardHeader>
      <div style={{padding:'2px 0 8px'}}>
        {rows.map(r => {
          const hasRank = r.rank != null;
          const val     = r[valueKey];
          const color   = scoreToColor(val, maxVal);
          const delta   = r.rankDelta;
          return (
            <div key={r.id}
              onClick={() => hasRank && onOpen && onOpen(r.id)}
              style={{display:'flex', alignItems:'center', gap:10, padding:'8px 16px',
                borderBottom:'1px solid var(--border)', cursor: hasRank ? 'pointer' : 'default',
                transition:'background .1s'}}
              onMouseEnter={e => { if(hasRank) e.currentTarget.style.background='var(--secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
            >
              {/* Medal / rank */}
              <div style={{width:32, textAlign:'center', flexShrink:0}}>
                {MEDALS[r.rank]
                  ? <span style={{fontSize:24, lineHeight:1}}>{MEDALS[r.rank]}</span>
                  : <span style={{display:'inline-flex', alignItems:'center', justifyContent:'center',
                      width:24, height:24, borderRadius:6, background:'var(--secondary)',
                      fontWeight:700, fontSize:12, fontVariantNumeric:'tabular-nums',
                      color: hasRank ? 'var(--foreground)' : 'var(--muted-foreground)'}}>
                      {hasRank ? r.rank : '—'}
                    </span>
                }
              </div>

              {/* Name */}
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{r.name}</div>
                <div className="muted" style={{fontSize:11}}>{hasRank ? `${r.calls} зв.` : 'нет звонков'}</div>
              </div>

              {/* Value */}
              <div style={{flexShrink:0, textAlign:'right', minWidth:48}}>
                {hasRank && val != null
                  ? <span style={{fontWeight:800, fontSize:19, fontVariantNumeric:'tabular-nums', color}}>{suffix === '%' ? val + '%' : val.toFixed(1)}</span>
                  : <span className="muted" style={{fontSize:13}}>—</span>
                }
              </div>

              {/* Delta */}
              <div style={{width:26, flexShrink:0, textAlign:'right'}}>
                {hasRank && delta != null && delta !== 0
                  ? <span style={{fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:1,
                      color: delta > 0 ? 'var(--success-strong)' : 'var(--danger-strong)'}}>
                      {delta > 0 ? <Icon.arrowUp size={9}/> : <Icon.arrowDown size={9}/>}{Math.abs(delta)}
                    </span>
                  : <span style={{fontSize:10, color:'var(--muted-foreground)'}}>—</span>
                }
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function RatingTable({ ratings, onOpen }) {
  return (
    <div style={{display:'flex', gap:16}}>
      <RatingCard
        title="Рейтинг · Средняя оценка звонка"
        rows={ratings.byScore}
        valueKey="score"
        maxVal={5}
        suffix="score"
        onOpen={onOpen}
      />
      <RatingCard
        title="Рейтинг · Конверсия в целевое действие"
        rows={ratings.byConv}
        valueKey="conv"
        maxVal={100}
        suffix="%"
        onOpen={onOpen}
      />
    </div>
  );
}

// ── Manager detail modal ─────────────────────────────────────────────────
function ManagerModal({ manager, queueItems, onClose, onCreateTask }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const initials = (manager.name || '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const managerIssues = (queueItems || []).filter(q => q.manager === manager.name);
  const scoreColor = manager.score >= 4 ? 'var(--success-strong)' : manager.score >= 3 ? 'var(--warning-strong)' : 'var(--danger-strong)';

  const stats = [
    { label: 'Звонков', value: `${manager.calls} / ${manager.plan}`, sub: 'план' },
    { label: 'Ср. оценка', value: manager.score != null ? manager.score.toFixed(1) : '—', sub: 'из 5', color: scoreColor },
    { label: 'Конверсия', value: `${manager.conversion ?? '—'}%`, sub: 'в целевое действие',
      color: manager.conversion >= 30 ? 'var(--success-strong)' : manager.conversion >= 20 ? 'var(--warning-strong)' : 'var(--danger-strong)' },
    { label: 'Без цели', value: manager.noTarget ?? '—', sub: 'звонков',
      color: manager.noTarget > 12 ? 'var(--danger-strong)' : 'inherit' },
    { label: 'Без договор.', value: manager.noAgreement ?? '—', sub: 'звонков',
      color: manager.noAgreement > 12 ? 'var(--danger-strong)' : 'inherit' },
    { label: 'Δ конверсии', value: manager.convDelta != null ? (manager.convDelta > 0 ? '+' : '') + manager.convDelta + '%' : '—', sub: 'к прошлому',
      color: manager.convDelta > 0 ? 'var(--success-strong)' : 'var(--danger-strong)' },
  ];

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,.45)', backdropFilter:'blur(3px)',
      zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:24
    }} onClick={onClose}>
      <div style={{
        background:'var(--card)', borderRadius:14, boxShadow:'0 20px 60px rgba(0,0,0,.25)',
        width:'100%', maxWidth:640, maxHeight:'88vh', overflow:'auto',
        display:'flex', flexDirection:'column'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'center', gap:16, padding:'20px 24px', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'var(--card)', zIndex:1}}>
          <div className="avatar" style={{width:48, height:48, fontSize:18, flexShrink:0}}>{initials}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:700, fontSize:17}}>{manager.name}</div>
            <div className="muted" style={{fontSize:12.5}}>{manager.role || 'Менеджер'} · {manager.calls} звонков за период</div>
          </div>
          <ScoreCell value={manager.score} max={5}/>
          <button onClick={onClose} style={{
            background:'none', border:'none', cursor:'pointer', padding:6,
            color:'var(--muted-foreground)', borderRadius:6, marginLeft:8, display:'flex', alignItems:'center'
          }}>
            <Icon.x size={18}/>
          </button>
        </div>

        {/* Stats grid */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, padding:'20px 24px 4px'}}>
          {stats.map(s => (
            <div key={s.label} style={{background:'var(--secondary)', borderRadius:10, padding:'12px 14px'}}>
              <div className="muted" style={{fontSize:11.5, marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:22, fontWeight:700, fontVariantNumeric:'tabular-nums', color: s.color || 'var(--foreground)', lineHeight:1.1}}>{s.value}</div>
              <div className="muted" style={{fontSize:11, marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Sparkline trend */}
        {manager.trend && manager.trend.length > 0 && (
          <div style={{padding:'16px 24px 8px'}}>
            <div className="muted" style={{fontSize:11.5, marginBottom:8, fontWeight:500}}>Динамика конверсии за 7 дней</div>
            <Sparkline data={manager.trend} color={manager.score >= 4 ? '#16A34A' : manager.score >= 3 ? '#D97706' : '#DC2626'} width={560} height={44}/>
          </div>
        )}

        {/* Active issues */}
        {managerIssues.length > 0 && (
          <div style={{padding:'12px 24px 4px'}}>
            <div style={{fontWeight:600, fontSize:13, marginBottom:8}}>
              Активные проблемы
              <span className="badge bg-danger-soft" style={{color:'var(--danger-strong)', marginLeft:8}}>{managerIssues.length}</span>
            </div>
            {managerIssues.slice(0, 4).map(q => (
              <div key={q.id} style={{display:'flex', gap:10, alignItems:'flex-start', padding:'8px 0', borderTop:'1px solid var(--border)'}}>
                <PriorityBadge p={q.priority}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontWeight:600, fontSize:13}}>{q.problem}</div>
                  <div className="muted" style={{fontSize:12, marginTop:2}}>{q.subTitle}</div>
                </div>
                <ScoreCell value={q.score} max={5}/>
              </div>
            ))}
          </div>
        )}
        {managerIssues.length === 0 && (
          <div style={{padding:'12px 24px 4px', display:'flex', alignItems:'center', gap:8, color:'var(--success-strong)'}}>
            <Icon.check size={14}/> <span style={{fontSize:13}}>Нет активных проблем</span>
          </div>
        )}

        {/* Footer */}
        <div style={{display:'flex', gap:10, padding:'16px 24px', borderTop:'1px solid var(--border)', marginTop:8}}>
          <Button variant="default" size="md" onClick={() => onCreateTask && onCreateTask({ manager: manager.name, priority:'medium' })}><Icon.calendar size={13}/> Поставить задачу</Button>
          <Button variant="outline" size="md">Написать в чат</Button>
        </div>
      </div>
    </div>
  );
}

// ── Managers analytics table ─────────────────────────────────────────────
// Red-cell helper
const RedCell = ({ value, isRed, suffix='' }) => (
  <span style={{
    fontVariantNumeric:'tabular-nums', fontWeight: isRed ? 700 : 400,
    color: isRed ? 'var(--danger-strong)' : 'var(--foreground)',
  }}>
    {value != null ? value + suffix : '—'}
  </span>
);

function ManagersTable({ rows, onOpen }) {
  // Tri-state sort (rule 3). Initial: score desc — preserves prior default.
  const { sortKey, sortDir, sortBy } = useTriStateSort('score', 'desc');
  const [page, setPage]       = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const sorted = useMemo(() => applyTriStateSort(rows, sortKey, sortDir), [rows, sortKey, sortDir]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const onSort = (k) => { sortBy(k); setPage(0); };
  const SI = ({ k }) => <SortIndicator active={sortKey===k} dir={sortDir}/>;

  // ТЗ 4.7 red-highlight rules
  const isConvRed    = m => (m.conversion ?? 101) <= 50;
  const isObjHRed    = m => (m.objHandled  ?? 101) <= 50;
  const isScriptRed  = m => m.scriptCompliance === 0 || m.scriptCompliance < (m.objIdent / 2);
  const isScoreRed   = m => m.score != null && m.score <= 3;

  return (
    <div>
      {/* Scrollable table with sticky first column */}
      <div style={{overflowX:'auto', overflowY:'auto', maxHeight:460}}>
        <table className="data-table" style={{minWidth:780}}>
          <thead>
            <tr>
              {/* Sticky first column */}
              <th onClick={()=>onSort('name')} className="sortable"
                style={{position:'sticky', left:0, background:'var(--card)', zIndex:2, minWidth:160, boxShadow:'2px 0 4px rgba(0,0,0,.06)'}}>
                Специалист<SI k="name"/>
              </th>
              <th onClick={()=>onSort('calls')} className="sortable tar" style={{minWidth:80}}>Звонков<SI k="calls"/></th>
              <th onClick={()=>onSort('success')} className="sortable tar" style={{minWidth:80}}>Успешные<SI k="success"/></th>
              <th onClick={()=>onSort('conversion')} className="sortable tar" style={{minWidth:90}}>CR<SI k="conversion"/></th>
              <th onClick={()=>onSort('score')} className="sortable tac" style={{minWidth:100}}>Ср. оценка<SI k="score"/></th>
              <th onClick={()=>onSort('objIdent')} className="sortable tar" style={{minWidth:110}}>Возр. выявлено<SI k="objIdent"/></th>
              <th onClick={()=>onSort('objHandled')} className="sortable tar" style={{minWidth:120}}>Возр. отработано<SI k="objHandled"/></th>
              <th onClick={()=>onSort('scriptCompliance')} className="sortable tar" style={{minWidth:80}}>Скрипт<SI k="scriptCompliance"/></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(m => (
              <tr key={m.id} className="is-clickable" onClick={()=>onOpen(m.id)}>
                {/* Sticky name cell */}
                <td style={{position:'sticky', left:0, background:'var(--card)', zIndex:1, boxShadow:'2px 0 4px rgba(0,0,0,.06)'}}>
                  <div style={{fontWeight:600}}>{m.name}</div>
                  <div className="muted" style={{fontSize:11}}>{m.role || 'Менеджер'}</div>
                </td>
                <td className="tar">
                  <span style={{fontWeight:600, fontVariantNumeric:'tabular-nums'}}>{m.calls}</span>
                  <span className="muted" style={{fontSize:11}}> /{m.plan}</span>
                </td>
                <td className="tar">
                  <span style={{fontVariantNumeric:'tabular-nums'}}>{m.success ?? '—'}</span>
                </td>
                <td className="tar">
                  <RedCell value={m.conversion} isRed={isConvRed(m)} suffix="%"/>
                </td>
                <td className="tac">
                  <span style={{
                    fontWeight:700, fontVariantNumeric:'tabular-nums',
                    color: isScoreRed(m) ? 'var(--danger-strong)' : m.score >= 4 ? 'var(--success-strong)' : 'var(--warning-strong)'
                  }}>
                    {m.score != null ? m.score.toFixed(1) : '—'}
                  </span>
                </td>
                <td className="tar">
                  <span style={{fontVariantNumeric:'tabular-nums'}}>{m.objIdent ?? '—'}</span>
                </td>
                <td className="tar">
                  <RedCell value={m.objHandled} isRed={isObjHRed(m)} suffix="%"/>
                </td>
                <td className="tar">
                  <RedCell value={m.scriptCompliance != null ? m.scriptCompliance + '%' : null} isRed={isScriptRed(m)}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sticky footer with pagination */}
      <QueuePager
        total={sorted.length}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={(s) => { setPageSize(s); setPage(0); }}
        totalPages={totalPages}
      />
    </div>
  );
}

Object.assign(window, { Dashboard, AttentionQueue, ManagementQueue, PracticesQueue, ManagersTable });
