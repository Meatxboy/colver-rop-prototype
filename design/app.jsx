// ── Main app ────────────────────────────────────────────────────────────
function App() {
  const [route, setRoute] = useState({ page: 'dashboard' });
  const [period, setPeriod] = useState('week');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState(null);
  const [data, setData] = useState(window.MOCK_DATA);
  const [ratingsTab, setRatingsTab] = useState('best');
  const [tweaksVisible, setTweaksVisible] = useState(false);
  const [toast, setToast] = useState(null);
  const [callModalId, setCallModalId] = useState(null);

  // ── Tasks state (lifted so modal is accessible from Dashboard + CallModal) ──
  const [tasks, setTasks] = useState(() => initTasks(window.MOCK_DATA));
  const [createTaskPrefill, setCreateTaskPrefill] = useState(null); // null = closed
  const [taskDetailId, setTaskDetailId] = useState(null);            // null = closed

  const openCreateTask = (prefill = {}) => setCreateTaskPrefill(prefill);
  const closeCreateTask = () => setCreateTaskPrefill(null);
  const openTaskDetail = (taskOrId) => setTaskDetailId(typeof taskOrId === 'string' ? taskOrId : taskOrId?.id);
  const closeTaskDetail = () => setTaskDetailId(null);
  const taskDetailObj = tasks.find(t => t.id === taskDetailId) || null;
  const handleSaveTask = (task) => {
    setTasks(ts => [task, ...ts]);
    showToast('Задача создана');
  };
  const handleUpdateTask = (task) => {
    setTasks(ts => ts.map(t => t.id === task.id ? task : t));
  };
  const handleDeleteTask = (id) => {
    setTasks(ts => ts.filter(t => t.id !== id));
  };

  // ── Notifications ──────────────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => initNotifications());
  const notifUnread = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = id => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  // Auto-close notifications drawer when any modal opens
  useEffect(() => {
    if (callModalId !== null) setNotifOpen(false);
  }, [callModalId]);
  useEffect(() => {
    if (createTaskPrefill !== null) setNotifOpen(false);
  }, [createTaskPrefill]);

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "queueFull": true,
    "aiOpen": false,
    "density": "comfortable",
    "bgTone": "gray",
    "period": "week"
  }/*EDITMODE-END*/;
  const [tweaks, setTweaksState] = useState(TWEAK_DEFAULTS);
  const setTweaks = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaksState(next);
    window.parent.postMessage({type:'__edit_mode_set_keys', edits: patch}, '*');
  };

  useEffect(() => {
    setAiOpen(tweaks.aiOpen);
    setPeriod(tweaks.period);
    document.body.style.background = tweaks.bgTone === 'white' ? '#fff' : tweaks.bgTone === 'cool' ? '#F5F8FF' : '#FAFAFA';
    document.documentElement.style.setProperty('--row-h', tweaks.density === 'compact' ? '40px' : '48px');
    document.documentElement.style.setProperty('--row-padding-y', tweaks.density === 'compact' ? '8px' : '12px');
    document.documentElement.style.setProperty('--table-font-size', tweaks.density === 'compact' ? '13px' : '14px');
    document.documentElement.style.setProperty('--table-secondary-font-size', '12px'); // hard floor per spec
  }, [tweaks]);

  useEffect(() => {
    const handler = (e) => {
      const t = e.data?.type;
      if (t === '__activate_edit_mode') setTweaksVisible(true);
      if (t === '__deactivate_edit_mode') setTweaksVisible(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({type:'__edit_mode_available'}, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const queueData = useMemo(() => {
    return tweaks.queueFull ? data.queue : [];
  }, [data.queue, tweaks.queueFull]);

  const ratings = useMemo(() => {
    const sorted = [...data.managers].sort((a,b)=> ratingsTab === 'best' ? b.score - a.score : a.score - b.score);
    return { tab: ratingsTab, setTab: setRatingsTab, list: sorted };
  }, [data.managers, ratingsTab]);

  // Period filter (object form { kind, … } or legacy string) → swap KPIs.
  const periodKind = (typeof period === 'string' ? period : period?.kind) || 'week';
  const dashboardKpis = data.kpisByPeriod?.[periodKind] || data.kpis;
  const dashboardData = { ...data, queue: queueData, kpis: dashboardKpis };

  const openCall = (id) => { setCallModalId(id); setNotifOpen(false); };
  const openManager = (id) => setRoute({ page:'manager', managerId: id });

  const showToast = (text) => {
    setToast(text);
    setTimeout(()=>setToast(null), 2400);
  };

  const handleProcess = (queueItemId, action, comment = null) => {
    setData(d => ({
      ...d,
      queue: d.queue.filter(i => i.id !== queueItemId),
      processed: [
        {
          id: 'P' + Date.now(),
          callId: d.queue.find(i => i.id === queueItemId)?.callId,
          problem: d.queue.find(i => i.id === queueItemId)?.problem,
          manager: d.queue.find(i => i.id === queueItemId)?.manager,
          action,
          comment: comment || undefined,
          rop: 'Алексей П.',
          date: 'сейчас',
          outcome: 'pending',
        },
        ...d.processed,
      ]
    }));
    const baseMsg = action === 'feedback' ? 'Обратная связь отправлена менеджеру'
      : action === 'meeting' ? 'Разбор назначен на завтра 14:00'
      : 'Кейс закрыт';
    showToast(comment ? `${baseMsg} · комментарий сохранён` : baseMsg);
  };

  // ── Modal visibility rules ─────────────────────────────────────────────
  // When TaskCreateModal is open over CallModal — hide CallModal content
  // (TaskCreateModal backdrop already covers it, but we remove scroll-lock conflict)
  const callModalHidden = createTaskPrefill !== null && callModalId !== null;

  // Routing
  let pageContent = null;
  let breadcrumbs = null;
  if (route.page === 'dashboard') {
    pageContent = <Dashboard data={dashboardData} onOpenCall={openCall} onOpenManager={openManager} period={period} setPeriod={setPeriod} onProcess={handleProcess} onCreateTask={openCreateTask} tasks={tasks} onOpenTask={openTaskDetail}/>;
  } else if (route.page === 'calls') {
    pageContent = <CallsPage data={data} onOpenCall={openCall} period={period} setPeriod={setPeriod}/>;
    breadcrumbs = [{ label:'Звонки' }];
  } else if (route.page === 'processed') {
    pageContent = <ProcessedPage data={data} onOpenCall={openCall}/>;
    breadcrumbs = [{ label:'Обработанные' }];
  } else if (route.page === 'tasks') {
    pageContent = <TasksPage data={data} tasks={tasks} setTasks={setTasks} onOpenCall={openCall} onCreateTask={openCreateTask}/>;
    breadcrumbs = [{ label:'Задачи' }];
  } else if (route.page === 'manager' || route.page === 'settings' || route.page === 'analytics') {
    pageContent = <div className="content"><EmptyState
      icon={<Icon.user size={26}/>}
      title={route.page === 'settings' ? 'Настройки' : 'Карточка менеджера'}
      desc="Этот раздел будет реализован на следующем спринте."
      action={<Button variant="default" onClick={()=>setRoute({page:'dashboard'})}>Назад на дашборд</Button>}
    /></div>;
  }

  const aiContext = callModalId ? `звонок #${callModalId}` : route.page === 'calls' ? 'список звонков' : route.page;

  return (
    <div className="app">
      <Sidebar
        route={route} onNavigate={setRoute}
        notifUnread={notifUnread} notifOpen={notifOpen}
        onNotifToggle={() => setNotifOpen(o => !o)}
      />
      <main className="main">
        <Topbar
          title={navItems.find(n => n.key === route.page)?.label || 'Colver'}
          breadcrumbs={breadcrumbs}
          aiOpen={aiOpen}
          onAiToggle={()=>setAiOpen(!aiOpen)}
          route={route}
        />
        {pageContent}
      </main>

      {/* Notifications drawer — lowest modal layer (z:120) */}
      <NotificationsDrawer
        open={notifOpen}
        notifications={notifications}
        onClose={() => setNotifOpen(false)}
        onMarkAllRead={markAllRead}
        onMarkRead={markRead}
        onOpenCall={openCall}
      />

      {/* Call modal (z:300) — hidden when TaskCreateModal is on top */}
      {callModalId && (
        <div style={callModalHidden ? {visibility:'hidden',pointerEvents:'none'} : {}}>
          <CallModal callId={callModalId} data={data} tasks={tasks} onOpenTask={openTaskDetail}
            onClose={()=>setCallModalId(null)} onCreateTask={openCreateTask}/>
        </div>
      )}

      {/* Task create modal (z:400) — global, triggered from 3 places */}
      {createTaskPrefill !== null && (
        <TaskCreateModal
          prefill={createTaskPrefill}
          managers={data.managers}
          onClose={closeCreateTask}
          onSave={handleSaveTask}
          onOpenCall={openCall}
        />
      )}

      {/* Task detail modal — global, opened from queue task indicator */}
      {taskDetailObj && (
        <TaskDetailModal
          task={taskDetailObj}
          managers={data.managers}
          onClose={closeTaskDetail}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
          onOpenCall={openCall}
        />
      )}

      {aiOpen && <Fragment>
        {/* Backdrop is hidden by default; CSS shows it only when viewport
            is too narrow to keep the panel inline (≤1230px). */}
        <div className="ai-panel-backdrop" onClick={()=>setAiOpen(false)}/>
        <AiPanel
          onClose={()=>{ setAiOpen(false); setAiMessages(null); }}
          onCollapse={()=>setAiOpen(false)}
          messages={aiMessages}
          setMessages={setAiMessages}
          context={aiContext}/>
      </Fragment>}
      <Tweaks tweaks={tweaks} setTweaks={setTweaks} visible={tweaksVisible} setVisible={setTweaksVisible}/>

      {toast && <div style={{
        position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
        background:'#18181B', color:'#fff', padding:'10px 18px', borderRadius:8,
        fontSize:13, fontWeight:500, zIndex:700, boxShadow:'0 8px 24px rgba(0,0,0,.2)',
        animation:'slideUp .2s ease', display:'flex', alignItems:'center', gap:8
      }}>
        <Icon.check size={14}/> {toast}
      </div>}

      <CookieBanner/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
