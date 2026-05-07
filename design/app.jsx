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

  // ── @mention handler: упоминание сотрудника в комментарии задачи ───────
  // Создаёт push-уведомление с taskId — клик на нём открывает деталь задачи.
  const handleMention = ({ managerName, taskId, taskTitle, comment }) => {
    const id = 'NF-MEN-' + Date.now() + '-' + Math.floor(Math.random()*1000);
    const snippet = comment.length > 80 ? comment.slice(0, 80) + '…' : comment;
    setNotifications(ns => [
      {
        id, priority: 1, read: false,
        callId: null, manager: managerName, taskId,
        title: 'Вас упомянули в задаче',
        body: `«${taskTitle}» · ${snippet}`,
        time: 'только что',
      },
      ...ns,
    ]);
    showToast(`Уведомление отправлено: ${managerName}`);
  };

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
    setData(d => {
      // Look up the item across all three queues.
      const inAttention  = d.queue.find(i => i.id === queueItemId);
      const inManagement = d.queueManagement?.find(i => i.id === queueItemId);
      const inPractices  = d.queuePractices?.find(i => i.id === queueItemId);
      const src = inAttention || inManagement || inPractices;

      const next = { ...d };
      if (inAttention)  next.queue           = d.queue.filter(i => i.id !== queueItemId);
      if (inManagement) next.queueManagement = d.queueManagement.filter(i => i.id !== queueItemId);
      if (inPractices)  next.queuePractices  = d.queuePractices.filter(i => i.id !== queueItemId);

      // Only attention-queue actions go into the Processed list. Management
      // and practices decisions are recorded server-side as AI-suggestion
      // outcomes — for the MVP they just disappear from the queue.
      if (inAttention && src) {
        next.processed = [
          {
            id: 'P' + Date.now(),
            callId:  src.callId,
            problem: src.problem,
            manager: src.manager,
            action,
            comment: comment || undefined,
            rop: 'Алексей П.',
            date: 'сейчас',
            outcome: 'pending',
          },
          ...d.processed,
        ];
      }
      return next;
    });

    const baseMsg = action === 'feedback' ? 'Обратная связь отправлена менеджеру'
      : action === 'meeting' ? 'Разбор назначен на завтра 14:00'
      : action === 'approve' ? 'Решение принято · AI-предложение учтено'
      : action === 'apply'   ? 'Практика принята · AI-предложение внедрено'
      : action === 'dismiss' ? 'AI-предложение отклонено'
      : 'Кейс закрыт';
    showToast(comment ? `${baseMsg} · комментарий сохранён` : baseMsg);
  };

  // ── Modal visibility rules ─────────────────────────────────────────────
  // Стекинг модалок через useModalZ — каждая новая модалка получает
  // z-index выше предыдущей, так что любую можно открыть поверх любой.

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
    pageContent = <TasksPage data={data} tasks={tasks} setTasks={setTasks} onOpenCall={openCall} onCreateTask={openCreateTask} onMention={handleMention} onTaskClosed={(t) => showToast(`Задача «${t.title}» перенесена в «Выполнено»`)}/>;
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

  // Контекстное приветствие для нейроаналитика — зависит от текущей страницы.
  // Используется при первом открытии и при «Начать заново».
  const aiWelcome = (() => {
    const attentionCount = data.queue?.length ?? 0;
    const callsCount     = data.calls?.length ?? 0;
    const openTasksCount = tasks.filter(t => t.status !== 'done' && t.status !== 'partial').length;
    const plural = (n, [one, few, many]) => {
      const m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return one;
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
      return many;
    };
    if (route.page === 'tasks') {
      return `Привет! Я Виртуальный РОП, помогу с задачами команды. Сейчас в работе ${openTasksCount} ${plural(openTasksCount, ['открытая задача','открытые задачи','открытых задач'])}. С чего начнём?`;
    }
    if (route.page === 'calls') {
      return `Привет! Я Виртуальный РОП, помогу разобрать звонки команды. На текущей странице ${callsCount} ${plural(callsCount, ['звонок','звонка','звонков'])}. С чего начнём?`;
    }
    if (route.page === 'processed') {
      return `Привет! Я Виртуальный РОП, помогу с аналитикой обработанных кейсов. Подскажу тренды и закономерности. С чего начнём?`;
    }
    // dashboard / прочие
    return `Привет! Я Виртуальный РОП, помогу проанализировать звонки команды. Вижу, у вас ${attentionCount} ${plural(attentionCount, ['звонок требует','звонка требуют','звонков требуют'])} внимания. С чего начнём?`;
  })();

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
        onOpenTask={openTaskDetail}
      />

      {/* Call modal — z-index динамический через useModalZ, поэтому
          новый CallModal всегда поверх предыдущей модалки. */}
      {callModalId && (
        <CallModal callId={callModalId} data={data} tasks={tasks} onOpenTask={openTaskDetail}
          onClose={()=>setCallModalId(null)} onCreateTask={openCreateTask}
          onResolveCall={(qid, comment)=>{ handleProcess(qid, 'done', comment); setCallModalId(null); }}/>
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

      {/* Task detail modal — global, opened from queue task indicator
          и из уведомлений/CallModal. Принимает динамический z-index, чтобы
          корректно стекаться поверх предыдущих модалок. */}
      {taskDetailObj && (
        <TaskDetailModal
          task={taskDetailObj}
          managers={data.managers}
          onClose={closeTaskDetail}
          onSave={handleUpdateTask}
          onDelete={() => { handleDeleteTask(taskDetailObj.id); }}
          onOpenCall={openCall}
          onMention={handleMention}
          onCloseTask={(t) => showToast(`Задача «${t.title}» перенесена в «Выполнено»`)}
        />
      )}

      {aiOpen && <Fragment>
        {/* Backdrop is hidden by default; CSS shows it only when viewport
            is too narrow to keep the panel inline (≤1230px). */}
        <div className="ai-panel-backdrop" onClick={()=>setAiOpen(false)}/>
        <AiPanel
          onClose={()=>setAiOpen(false)}
          onCollapse={()=>setAiOpen(false)}
          messages={aiMessages}
          setMessages={setAiMessages}
          initialWelcome={aiWelcome}
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
