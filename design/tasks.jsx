// ── Tasks (Kanban) page ───────────────────────────────────────────────────

const KANBAN_COLS = [
  { key:'planned',     label:'В планах',          dot:'#94A3B8' },
  { key:'queued',      label:'В очереди',          dot:'#60A5FA' },
  { key:'in_progress', label:'В работе',           dot:'#2563EB' },
  { key:'paused',      label:'Приостановлено',     dot:'#D97706' },
  { key:'partial',     label:'Выполнено частично', dot:'#7C3AED' },
  { key:'done',        label:'Выполнено',          dot:'#16A34A' },
];

const TASK_PRIO = {
  high:   { label:'Срочно',   bg:'#FEE2E2', color:'#B91C1C' },
  medium: { label:'Важно',    bg:'#FEF9C3', color:'#92400E' },
  low:    { label:'Обычная',  bg:'#F4F4F5', color:'#71717A' },
};

function initTasks(data) {
  const m = data.managers || [];
  const g = i => m[i]?.name || null;
  // creator: 'manager' | 'rop' — кто создал задачу. Влияет на иконку
  // в очереди внимания и на логику «решено» при закрытии задачи.
  // withObserver: true → второй роль наблюдает за задачей (приходят уведомления).
  return [
    { id:'T-01', title:'Провести разбор: возражение по цене не отработано',           text:'Менеджер дважды пропустил стандартный скрипт ответа на «дорого». Послушать звонок и разобрать конкретные моменты.',     manager:g(0), priority:'high',   status:'planned',     callId:'1841', dueDate:'2026-05-02', createdAt:'2026-04-28', creator:'rop' },
    { id:'T-02', title:'Проверить соблюдение скрипта за последние 7 дней',            text:'',                                                                                                                              manager:g(1), priority:'medium', status:'planned',     callId:null,   dueDate:'2026-05-05', createdAt:'2026-04-28', creator:'rop' },
    { id:'T-03', title:'Назначить тренинг по работе с возражением «Дорого»',          text:'',                                                                                                                              manager:g(2), priority:'high',   status:'queued',      callId:null,   dueDate:'2026-05-03', createdAt:'2026-04-27', creator:'rop' },
    { id:'T-04', title:'Отправить письменную обратную связь по итогам недели',        text:'',                                                                                                                              manager:g(0), priority:'low',    status:'queued',      callId:null,   dueDate:'2026-05-07', createdAt:'2026-04-27', creator:'rop' },
    { id:'T-05', title:'Прослушать 5 случайных звонков — выставить ручную оценку',   text:'',                                                                                                                              manager:g(3), priority:'medium', status:'in_progress', callId:null,   dueDate:'2026-05-01', createdAt:'2026-04-26', creator:'rop' },
    { id:'T-06', title:'Подготовить материалы к еженедельному разбору провалов',      text:'',                                                                                                                              manager:g(1), priority:'high',   status:'in_progress', callId:null,   dueDate:'2026-05-02', createdAt:'2026-04-26', creator:'rop' },
    { id:'T-07', title:'Согласовать обновлённый скрипт с командой',                   text:'',                                                                                                                              manager:g(4), priority:'medium', status:'paused',      callId:null,   dueDate:'2026-05-04', createdAt:'2026-04-25', creator:'rop' },
    // T-08: задача менеджера по звонку C-1841 — добавлена с РОП-наблюдателем.
    // По этому звонку в очереди внимания будет показано 2 иконки задач.
    { id:'T-08', title:'Перезвонить клиенту с предложением',                          text:'Связаться с клиентом, предложить решение со скидкой 7%.',                                                                       manager:g(0), priority:'high',   status:'in_progress', callId:'1841', dueDate:'2026-04-30', createdAt:'2026-04-25', creator:'manager', withObserver:true },
    { id:'T-09', title:'Встреча 1-на-1: низкая конверсия за апрель',                  text:'',                                                                                                                              manager:g(5), priority:'medium', status:'partial',     callId:null,   dueDate:'2026-04-29', createdAt:'2026-04-24', creator:'rop' },
    { id:'T-10', title:'Выгрузить сводный отчёт по звонкам за апрель',                text:'',                                                                                                                              manager:null, priority:'low',    status:'partial',     callId:null,   dueDate:'2026-05-07', createdAt:'2026-04-24', creator:'rop' },
    { id:'T-11', title:'Итоговая оценка всех менеджеров за апрель',                   text:'',                                                                                                                              manager:null, priority:'medium', status:'done',        callId:null,   dueDate:'2026-04-30', createdAt:'2026-04-23', creator:'rop' },
    { id:'T-12', title:'Обратная связь после тренинга по скрипту (апрель)',            text:'',                                                                                                                              manager:g(3), priority:'low',    status:'done',        callId:null,   dueDate:'2026-04-28', createdAt:'2026-04-22', creator:'rop' },
  ];
}

// ── TaskCreateModal ───────────────────────────────────────────────────────
function TaskCreateModal({ prefill = {}, managers = [], onClose, onSave, onOpenCall }) {
  const z = useModalZ();
  const [form, setForm] = useState({
    title:    prefill.title    || '',
    text:     prefill.text     || '',
    manager:  prefill.manager  || '',
    priority: prefill.priority || 'medium',
    status:   prefill.status   || 'planned',
    dueDate:  '',
    callId:   prefill.callId   || '',
    creator:  prefill.creator  || 'rop',   // 'manager' | 'rop'
    withObserver: prefill.withObserver !== false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleClear = () => setForm({
    title:'', text:'', manager:'', priority:'medium', status:'planned', dueDate:'', callId:'', creator:'rop', withObserver:true,
  });

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      id:        'T-' + Date.now(),
      title:     form.title.trim(),
      text:      form.text.trim(),
      manager:   form.manager || null,
      priority:  form.priority,
      status:    form.status,
      callId:    form.callId || null,
      dueDate:   form.dueDate || null,
      createdAt: '2026-05-01',
      creator:   form.creator,
      withObserver: form.withObserver,
    });
    onClose();
  };

  const managerOpts = [
    { value:'', label:'Не назначен' },
    ...managers.map(m => ({ value:m.name, label:m.name })),
  ];

  const fieldLabel = txt => (
    <div style={{fontSize:12, fontWeight:600, color:'var(--muted-foreground)',
      textTransform:'uppercase', letterSpacing:.4, marginBottom:5}}>{txt}</div>
  );

  const inputStyle = {
    width:'100%', padding:'8px 10px', border:'1px solid var(--border)',
    borderRadius:6, fontSize:13, outline:'none', boxSizing:'border-box',
    fontFamily:'inherit', background:'#fff',
  };

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:z,background:'rgba(9,9,11,.45)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',
        justifyContent:'center',padding:'24px 16px'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:480,
        boxShadow:'0 24px 64px rgba(0,0,0,.18)',overflow:'hidden'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'16px 20px',borderBottom:'1px solid var(--border)'}}>
          <span style={{fontSize:15,fontWeight:700}}>Новая задача</span>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',
            padding:4,color:'var(--muted-foreground)',display:'flex',alignItems:'center',borderRadius:6}}>
            <Icon.x size={18}/>
          </button>
        </div>

        {/* Body */}
        <div style={{padding:'18px 20px',display:'flex',flexDirection:'column',gap:13}}>

          {/* Название */}
          <div>
            {fieldLabel('Название задачи *')}
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Краткое описание задачи"
              style={inputStyle}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </div>

          {/* Текст */}
          <div>
            {fieldLabel('Текст задачи')}
            <textarea
              value={form.text}
              onChange={e => set('text', e.target.value)}
              placeholder="Подробное описание: что нужно сделать и зачем..."
              rows={3}
              style={{...inputStyle, resize:'vertical'}}
            />
          </div>

          {/* Ответственный + Приоритет */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              {fieldLabel('Ответственный')}
              <select value={form.manager} onChange={e => set('manager', e.target.value)} style={inputStyle}>
                {managerOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              {fieldLabel('Приоритет')}
              <select value={form.priority} onChange={e => set('priority', e.target.value)} style={inputStyle}>
                <option value="high">Срочно</option>
                <option value="medium">Важно</option>
                <option value="low">Обычная</option>
              </select>
            </div>
          </div>

          {/* Статус + Срок */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              {fieldLabel('Статус')}
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                {KANBAN_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              {fieldLabel('Срок выполнения')}
              <input type="date" value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)} style={inputStyle}/>
            </div>
          </div>

          {/* Звонок */}
          <div>
            {fieldLabel('Звонок')}
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <input
                value={form.callId}
                onChange={e => set('callId', e.target.value)}
                placeholder="ID звонка"
                style={{...inputStyle, flex:1}}
              />
              {form.callId && (
                <button
                  onClick={() => onOpenCall && onOpenCall(form.callId)}
                  style={{padding:'7px 8px',border:'1px solid var(--border)',borderRadius:6,
                    background:'none',cursor:'pointer',color:'var(--primary)',
                    display:'flex',alignItems:'center',flexShrink:0}}
                  title="Открыть звонок"
                >
                  <Icon.phone size={13}/>
                </button>
              )}
            </div>
          </div>

          {/* Роль создателя + наблюдатель */}
          <div>
            {fieldLabel('Создаю задачу как')}
            <div style={{display:'flex', gap:8}}>
              <button type="button" onClick={() => set('creator', 'rop')}
                style={{flex:1, padding:'8px 10px', border: form.creator==='rop' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius:6, background: form.creator==='rop' ? 'var(--primary-soft)' : '#fff',
                  color: form.creator==='rop' ? 'var(--primary-strong)' : 'var(--foreground)',
                  fontWeight:600, fontSize:12.5, cursor:'pointer'}}>
                РОП
              </button>
              <button type="button" onClick={() => set('creator', 'manager')}
                style={{flex:1, padding:'8px 10px', border: form.creator==='manager' ? '1px solid #D97706' : '1px solid var(--border)',
                  borderRadius:6, background: form.creator==='manager' ? '#FED7AA' : '#fff',
                  color: form.creator==='manager' ? '#92400E' : 'var(--foreground)',
                  fontWeight:600, fontSize:12.5, cursor:'pointer'}}>
                Менеджер
              </button>
            </div>
            <label style={{display:'flex', alignItems:'center', gap:8, marginTop:8, fontSize:12.5, cursor:'pointer'}}>
              <input type="checkbox" checked={form.withObserver}
                onChange={e => set('withObserver', e.target.checked)}/>
              <span>
                {form.creator === 'manager'
                  ? 'Добавить РОП наблюдателем (РОП увидит задачу в очереди внимания)'
                  : 'Добавить менеджера наблюдателем'}
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'13px 20px',borderTop:'1px solid var(--border)'}}>
          <Button variant="ghost" size="md" onClick={handleClear}>Очистить</Button>
          <div style={{display:'flex',gap:8}}>
            <Button variant="outline" size="md" onClick={onClose}>Закрыть</Button>
            <Button
              variant="default" size="md"
              onClick={handleSave}
              disabled={!form.title.trim()}
              style={!form.title.trim() ? {opacity:.5,pointerEvents:'none'} : {}}
            >
              <Icon.check size={13}/> Создать задачу
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TaskDetailModal ───────────────────────────────────────────────────────
function TaskDetailModal({ task, managers = [], onClose, onSave, onDelete, onOpenCall, onMention, onCloseTask }) {
  const z = useModalZ();
  const [form, setForm] = useState({
    title:    task.title    || '',
    text:     task.text     || '',
    manager:  task.manager  || '',
    priority: task.priority || 'medium',
    status:   task.status   || 'planned',
    dueDate:  task.dueDate  || '',
    callId:   task.callId   || '',
  });
  const [comments, setComments] = useState(Array.isArray(task.comments) ? task.comments : []);
  const [commentDraft, setCommentDraft] = useState('');
  const [mentionQuery, setMentionQuery] = useState(null); // null = popup closed
  const commentRef = useRef(null);
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  const persist = (extra = {}) => {
    onSave({
      ...task,
      ...form,
      manager: form.manager || null,
      callId: form.callId || null,
      dueDate: form.dueDate || null,
      comments,
      ...extra,
    });
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    persist();
    onClose();
  };

  // «Закрыть задачу» — переводит задачу в статус «Выполнено» и сохраняет.
  // Toast выводится через onCloseTask коллбэк в App.
  const handleCloseTask = () => {
    if (!form.title.trim()) return;
    const updated = {
      ...task,
      ...form,
      status: 'done',
      manager: form.manager || null,
      callId: form.callId || null,
      dueDate: form.dueDate || null,
      comments,
    };
    onSave(updated);
    onCloseTask && onCloseTask(updated);
    onClose();
  };

  // ── Mentions in comment input ──────────────────────────────────────────
  // Detect `@<query>` at the cursor; show a manager picker; on click, insert
  // the manager name into the draft and remember the mention.
  const [pendingMentions, setPendingMentions] = useState([]);
  const onCommentChange = (e) => {
    const v = e.target.value;
    setCommentDraft(v);
    const cursor = e.target.selectionStart || v.length;
    const upToCursor = v.slice(0, cursor);
    const at = upToCursor.lastIndexOf('@');
    if (at < 0) { setMentionQuery(null); return; }
    const after = upToCursor.slice(at + 1);
    // Allow letters, digits, hyphen, dot, space — stop at newline.
    if (/^[\wА-Яа-яЁё .\-]*$/.test(after) && !after.includes('\n')) {
      setMentionQuery(after);
    } else {
      setMentionQuery(null);
    }
  };
  const insertMention = (manager) => {
    if (!commentRef.current) return;
    const v = commentDraft;
    const cursor = commentRef.current.selectionStart || v.length;
    const upToCursor = v.slice(0, cursor);
    const at = upToCursor.lastIndexOf('@');
    if (at < 0) return;
    // Use last name for compact display, but track full name for notification.
    const lastName = (manager.name || '').split(' ')[0];
    const next = v.slice(0, at) + '@' + lastName + ' ' + v.slice(cursor);
    setCommentDraft(next);
    setMentionQuery(null);
    setPendingMentions(prev => prev.includes(manager.name) ? prev : [...prev, manager.name]);
    // Restore focus + put cursor after inserted mention.
    setTimeout(() => {
      if (commentRef.current) {
        const pos = at + lastName.length + 2;
        commentRef.current.focus();
        commentRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  };
  const matchedManagers = mentionQuery !== null
    ? managers.filter(m => (m.name || '').toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 6)
    : [];

  const sendComment = () => {
    const text = commentDraft.trim();
    if (!text) return;
    // Re-detect mentions present in the final text (covers user-typed @Name).
    const finalMentions = pendingMentions.filter(name => text.toLowerCase().includes('@' + (name.split(' ')[0] || '').toLowerCase()));
    const newComment = {
      id: 'C-' + Date.now(),
      author: 'Алексей П.', // РОП по умолчанию
      text,
      mentions: finalMentions,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    const nextComments = [...comments, newComment];
    setComments(nextComments);
    setCommentDraft('');
    setPendingMentions([]);
    setMentionQuery(null);
    // Persist into task immediately so comments survive close/reopen.
    onSave({
      ...task,
      ...form,
      manager: form.manager || null,
      callId: form.callId || null,
      dueDate: form.dueDate || null,
      comments: nextComments,
    });
    // Notify mentioned managers.
    if (finalMentions.length && onMention) {
      finalMentions.forEach(name => onMention({ managerName: name, taskId: task.id, taskTitle: form.title.trim() || task.title, comment: text }));
    }
  };

  const managerOpts = [
    { value:'', label:'Не назначен' },
    ...managers.map(m => ({ value:m.name, label:m.name })),
  ];

  const col = KANBAN_COLS.find(c => c.key === form.status) || KANBAN_COLS[0];
  const prio = TASK_PRIO[form.priority] || TASK_PRIO.low;

  const today = '2026-05-01';
  const isDone = form.status === 'done' || form.status === 'partial';
  const isOverdue = form.dueDate && form.dueDate < today && !isDone;

  const inputStyle = {
    width:'100%', padding:'8px 10px', border:'1px solid var(--border)',
    borderRadius:6, fontSize:13, outline:'none', boxSizing:'border-box',
    fontFamily:'inherit', background:'#fff', transition:'border-color .15s',
  };
  const fieldLabel = txt => (
    <div style={{fontSize:12, fontWeight:600, color:'var(--muted-foreground)',
      textTransform:'uppercase', letterSpacing:.4, marginBottom:5}}>{txt}</div>
  );

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:z,background:'rgba(9,9,11,.50)',
        backdropFilter:'blur(3px)',display:'flex',alignItems:'center',
        justifyContent:'center',padding:'24px 16px'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Окно ограничено высотой экрана; скроллится тело, шапка и футер
          закреплены — кнопки удалить/отмена/закрыть задачу всегда видны. */}
      <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:760,
        maxHeight:'calc(100vh - 48px)',
        boxShadow:'0 32px 80px rgba(0,0,0,.22)',overflow:'hidden',
        display:'flex',flexDirection:'column',
        animation:'slideUp .18s ease'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'14px 18px',borderBottom:'1px solid var(--border)',background:'#FAFAFA'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {/* Status dot + col name */}
            <div style={{width:8,height:8,borderRadius:'50%',background:col.dot,flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:600,color:'var(--muted-foreground)'}}>{col.label}</span>
            <span style={{fontSize:12,color:'var(--muted-foreground)',marginLeft:4,opacity:.5}}>#{task.id}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <button onClick={onClose}
              style={{background:'none',border:'none',cursor:'pointer',padding:5,
                color:'var(--muted-foreground)',display:'flex',alignItems:'center',borderRadius:6}}>
              <Icon.x size={17}/>
            </button>
          </div>
        </div>

        {/* Body — скроллится, шапка и футер закреплены. */}
        <div style={{padding:'18px 20px',display:'flex',flexDirection:'column',gap:14,
          flex:'1 1 auto',minHeight:0,overflowY:'auto'}}>

          {/* Title — большое поле */}
          <div>
            <textarea
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Название задачи"
              rows={2}
              style={{...inputStyle, fontSize:16, fontWeight:600, resize:'none',
                lineHeight:1.4, padding:'10px 12px', border:'1.5px solid var(--border)'}}
            />
          </div>

          {/* Description */}
          <div>
            {fieldLabel('Описание')}
            <textarea
              value={form.text}
              onChange={e => set('text', e.target.value)}
              placeholder="Что нужно сделать, зачем, какой ожидается результат..."
              rows={4}
              style={{...inputStyle, resize:'vertical', lineHeight:1.5}}
            />
          </div>

          {/* Status + Priority */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              {fieldLabel('Статус')}
              <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                {KANBAN_COLS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div>
              {fieldLabel('Приоритет')}
              <select value={form.priority} onChange={e => set('priority', e.target.value)} style={inputStyle}>
                <option value="high">Срочно</option>
                <option value="medium">Важно</option>
                <option value="low">Обычная</option>
              </select>
            </div>
          </div>

          {/* Assignee + Due date */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              {fieldLabel('Ответственный')}
              <select value={form.manager} onChange={e => set('manager', e.target.value)} style={inputStyle}>
                {managerOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              {fieldLabel('Срок')}
              <input type="date" value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                style={{...inputStyle, color: isOverdue ? '#B91C1C' : 'inherit'}}/>
              {isOverdue && (
                <div style={{fontSize:12,color:'#B91C1C',marginTop:4,fontWeight:500}}>
                  ⚠ Просрочена
                </div>
              )}
            </div>
          </div>

          {/* Call link */}
          <div>
            {fieldLabel('Связанный звонок')}
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <input
                value={form.callId}
                onChange={e => set('callId', e.target.value)}
                placeholder="ID звонка"
                style={{...inputStyle, flex:1}}
              />
              {form.callId && (
                <button
                  onClick={() => onOpenCall && onOpenCall(form.callId)}
                  style={{padding:'8px 10px',border:'1px solid var(--border)',borderRadius:6,
                    background:'#EFF6FF',cursor:'pointer',color:'var(--primary)',
                    display:'flex',alignItems:'center',gap:5,flexShrink:0,
                    fontSize:12,fontWeight:500}}
                  title="Открыть звонок"
                >
                  <Icon.phone size={12}/> Звонок #{form.callId}
                </button>
              )}
            </div>
          </div>

          {/* Meta */}
          <div style={{display:'flex',alignItems:'center',gap:16,paddingTop:2}}>
            <span style={{fontSize:12,color:'var(--muted-foreground)'}}>
              Создана: <strong>{task.createdAt || '—'}</strong>
            </span>
            <span style={{fontSize:12,color:'var(--muted-foreground)'}}>
              ID: <strong>{task.id}</strong>
            </span>
            {/* Priority badge preview */}
            <span style={{background:prio.bg,color:prio.color,borderRadius:4,
              padding:'2px 7px',fontSize:11,fontWeight:600,marginLeft:'auto'}}>
              {prio.label}
            </span>
          </div>

          {/* Комментарии — отдельная область со своим вертикальным скроллом.
              По умолчанию показаны последние комментарии (auto-scroll вниз). */}
          <div>
            {fieldLabel(`Комментарии${comments.length ? ` · ${comments.length}` : ''}`)}
            <div ref={el => {
              // Один-разовая прокрутка вниз при mount/обновлении списка.
              if (el) el.scrollTop = el.scrollHeight;
            }}
              style={{display:'flex', flexDirection:'column', gap:8, marginBottom:10,
                maxHeight:240, overflowY:'auto', padding: comments.length ? 8 : 0,
                background: comments.length ? '#FAFAFA' : 'transparent',
                borderRadius: comments.length ? 8 : 0,
                border: comments.length ? '1px solid var(--border)' : 0}}>
              {comments.length === 0 && (
                <div style={{fontSize:12, color:'var(--muted-foreground)', fontStyle:'italic'}}>
                  Пока нет комментариев
                </div>
              )}
              {comments.map(c => (
                <div key={c.id} style={{background:'var(--muted)', borderRadius:8, padding:'8px 10px',
                  border:'1px solid var(--border)'}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4}}>
                    <span style={{fontSize:12, fontWeight:600}}>{c.author}</span>
                    <span style={{fontSize:11, color:'var(--muted-foreground)'}}>{c.createdAt}</span>
                  </div>
                  <div style={{fontSize:12.5, lineHeight:1.5, whiteSpace:'pre-wrap', wordBreak:'break-word'}}>
                    {/* Подсветка @mentions */}
                    {c.text.split(/(@\S+)/g).map((part, i) =>
                      part.startsWith('@')
                        ? <span key={i} style={{color:'var(--primary)', fontWeight:600}}>{part}</span>
                        : <Fragment key={i}>{part}</Fragment>
                    )}
                  </div>
                  {c.mentions && c.mentions.length > 0 && (
                    <div style={{fontSize:11, color:'var(--muted-foreground)', marginTop:4}}>
                      Упомянуты: {c.mentions.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{position:'relative'}}>
              <textarea
                ref={commentRef}
                value={commentDraft}
                onChange={onCommentChange}
                placeholder="Добавьте комментарий... Используйте @ для упоминания сотрудника"
                rows={2}
                style={{...inputStyle, resize:'vertical', lineHeight:1.5, paddingRight:80}}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendComment(); }}
              />
              <button
                type="button"
                onClick={sendComment}
                disabled={!commentDraft.trim()}
                style={{position:'absolute', right:8, bottom:8,
                  padding:'5px 10px', fontSize:12, fontWeight:600,
                  border:'1px solid var(--primary)', background:'var(--primary)', color:'#fff',
                  borderRadius:6, cursor: commentDraft.trim() ? 'pointer' : 'default',
                  opacity: commentDraft.trim() ? 1 : 0.5}}
                title="Отправить (Ctrl+Enter)"
              >
                Отправить
              </button>
              {/* Mention picker */}
              {mentionQuery !== null && matchedManagers.length > 0 && (
                <div style={{position:'absolute', left:0, bottom:'100%', marginBottom:4,
                  background:'#fff', border:'1px solid var(--border)', borderRadius:8,
                  boxShadow:'0 8px 24px rgba(0,0,0,.12)', zIndex:1, minWidth:240, maxWidth:'100%',
                  overflow:'hidden'}}>
                  <div style={{padding:'6px 10px', fontSize:11, color:'var(--muted-foreground)',
                    background:'#FAFAFA', borderBottom:'1px solid var(--border)'}}>
                    Упомянуть менеджера{mentionQuery ? ` · «${mentionQuery}»` : ''}
                  </div>
                  {matchedManagers.map(m => (
                    <button
                      key={m.id || m.name}
                      type="button"
                      onClick={() => insertMention(m)}
                      style={{display:'block', width:'100%', textAlign:'left',
                        padding:'7px 10px', background:'#fff', border:0, cursor:'pointer',
                        fontSize:12.5, color:'var(--foreground)'}}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--secondary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{fontSize:11, color:'var(--muted-foreground)', marginTop:4}}>
              Ctrl+Enter — отправить · @ — упомянуть
            </div>
          </div>
        </div>

        {/* Footer: Удалить слева, Отмена/Закрыть задачу справа */}
        <div style={{display:'flex',alignItems:'center',gap:8,
          padding:'13px 20px',borderTop:'1px solid var(--border)',background:'#FAFAFA'}}>
          <Button
            variant="ghost" size="md"
            onClick={() => onDelete && onDelete()}
            style={{color:'#B91C1C'}}
          >
            <Icon.trash size={13}/> Удалить
          </Button>
          <div style={{flex:1}}></div>
          <Button variant="outline" size="md" onClick={onClose}>Отмена</Button>
          <Button
            variant="default" size="md"
            onClick={dirty ? handleSave : handleCloseTask}
            disabled={!form.title.trim()}
            style={!form.title.trim() ? {opacity:.5,pointerEvents:'none'} : {}}
            title={dirty ? 'Сохранить и закрыть модальное окно' : 'Перевести задачу в статус «Выполнено»'}
          >
            <Icon.check size={13}/> {dirty ? 'Сохранить изменения' : 'Закрыть задачу'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── TaskCard ──────────────────────────────────────────────────────────────
function TaskCard({ task, onDragStart, onDragEnd, onDragOverCard, onDropOnCard, onOpenCall, onDelete, onOpenDetail, dropIndicator }) {
  const prio = TASK_PRIO[task.priority] || TASK_PRIO.low;

  const parts = (task.manager || '').split(' ').filter(Boolean);
  const lastName = parts[0] || '';
  const inits = parts.slice(1).map(w => w[0] ? w[0].toUpperCase() + '.' : '').join('');
  const managerShort = inits ? `${lastName} ${inits}` : lastName;

  const today = '2026-05-01';
  const isDone = task.status === 'done' || task.status === 'partial';
  const isOverdue = task.dueDate && task.dueDate < today && !isDone;
  const dueFmt = task.dueDate ? task.dueDate.slice(5).replace('-', '.') : null;

  // Distinguish click vs drag: if mouse moves > 4px after mousedown → it's a drag
  const mouseDownPos = React.useRef(null);
  const wasDrag = React.useRef(false);

  const handleMouseDown = e => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    wasDrag.current = false;
  };
  const handleMouseMove = e => {
    if (!mouseDownPos.current) return;
    const dx = Math.abs(e.clientX - mouseDownPos.current.x);
    const dy = Math.abs(e.clientY - mouseDownPos.current.y);
    if (dx > 4 || dy > 4) wasDrag.current = true;
  };
  const handleClick = e => {
    if (wasDrag.current) return;
    mouseDownPos.current = null;
    onOpenDetail && onOpenDetail(task.id);
  };

  return (
    <Fragment>
      {/* Drop-индикатор сверху от карточки (вертикальный реордеринг). */}
      {dropIndicator === 'before' && (
        <div style={{height:2, background:'var(--primary)', borderRadius:1, margin:'0 2px'}}/>
      )}
      <div
        draggable
        onDragStart={e => { wasDrag.current = true; onDragStart(task.id); }}
        onDragEnd={onDragEnd}
        onDragOver={e => { e.preventDefault(); onDragOverCard && onDragOverCard(e, task); }}
        onDrop={e => { e.stopPropagation(); onDropOnCard && onDropOnCard(task); }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{background:'#fff',border:'1px solid var(--border)',borderRadius:8,
          padding:'9px 10px',cursor:'pointer',userSelect:'none',
          boxShadow:'0 1px 2px rgba(0,0,0,.05)',transition:'box-shadow .1s,border-color .1s'}}
        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 3px 10px rgba(0,0,0,.10)'; e.currentTarget.style.borderColor='#C7D2FE'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 2px rgba(0,0,0,.05)'; e.currentTarget.style.borderColor='var(--border)'; }}
      >
        {/* Priority + delete */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
          <span style={{background:prio.bg,color:prio.color,borderRadius:4,
            padding:'2px 6px',fontSize:11,fontWeight:600}}>{prio.label}</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(task); }}
            style={{background:'none',border:'none',padding:2,cursor:'pointer',
              color:'var(--muted-foreground)',display:'flex',alignItems:'center',
              borderRadius:4,opacity:.5}}
            title="Удалить"
          ><Icon.x size={11}/></button>
        </div>

        {/* Description */}
        <div style={{fontSize:12,fontWeight:500,lineHeight:1.45,color:'var(--foreground)',marginBottom:9}}>
          {task.title}
        </div>

        {/* Footer: call + responsible (без аватара) + due */}
        <div style={{display:'flex',alignItems:'center',gap:4,minWidth:0}}>
          {task.callId && (
            <button onClick={e => {e.stopPropagation(); onOpenCall && onOpenCall(task.callId);}}
              style={{background:'none',border:'none',padding:0,cursor:'pointer',
                color:'var(--primary)',display:'flex',alignItems:'center',flexShrink:0}}
              title={`Звонок #${task.callId}`}>
              <Icon.phone size={11}/>
            </button>
          )}
          <div style={{flex:1,minWidth:0}}>
            {task.manager
              ? <span style={{fontSize:12,color:'var(--muted-foreground)',fontWeight:500,
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',display:'block'}}>
                  {managerShort}
                </span>
              : <span style={{fontSize:12,color:'var(--muted-foreground)',fontStyle:'italic'}}>—</span>
            }
          </div>
          {dueFmt && (
            <span style={{fontSize:11,fontWeight:isOverdue?600:400,flexShrink:0,
              color:isOverdue?'#B91C1C':'#71717A',marginLeft:4}}>
              {isOverdue?'⚠ ':''}{dueFmt}
            </span>
          )}
        </div>
      </div>
      {dropIndicator === 'after' && (
        <div style={{height:2, background:'var(--primary)', borderRadius:1, margin:'0 2px'}}/>
      )}
    </Fragment>
  );
}

// ── KanbanColumn ──────────────────────────────────────────────────────────
function KanbanColumn({ col, tasks, onDragStart, onDragEnd, onDragOverCol, onDropOnCol, onDragOverCard, onDropOnCard, isOver, dropTargetCardId, dropPosition, onOpenCall, onDelete, onOpenDetail, onAddTask }) {
  return (
    <div style={{flex:'1 1 0',minWidth:160,display:'flex',flexDirection:'column',gap:7}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'0 2px'}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:col.dot,flexShrink:0}}/>
        <span style={{fontWeight:600,fontSize:12,whiteSpace:'nowrap'}}>{col.label}</span>
        <span style={{background:'var(--secondary)',color:'var(--muted-foreground)',
          borderRadius:10,padding:'1px 6px',fontSize:11,fontWeight:600}}>{tasks.length}</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); onDragOverCol(col.key); }}
        onDrop={() => onDropOnCol(col.key)}
        style={{flex:1,borderRadius:8,padding:7,
          background:isOver?'#EFF6FF':'var(--secondary)',
          border:`2px dashed ${isOver?'var(--primary)':'transparent'}`,
          display:'flex',flexDirection:'column',gap:6,
          minHeight:180,transition:'background .12s,border-color .12s'}}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task}
            onDragStart={onDragStart} onDragEnd={onDragEnd}
            onDragOverCard={onDragOverCard} onDropOnCard={onDropOnCard}
            dropIndicator={dropTargetCardId === task.id ? dropPosition : null}
            onOpenCall={onOpenCall} onDelete={onDelete} onOpenDetail={onOpenDetail}/>
        ))}
        {tasks.length === 0 && (
          <div style={{textAlign:'center',color:'var(--muted-foreground)',
            fontSize:12,padding:'20px 0',opacity:.4}}>Нет задач</div>
        )}
      </div>

      {/* + Добавить */}
      <button
        onClick={() => onAddTask({ status: col.key })}
        style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',
          cursor:'pointer',padding:'5px 8px',borderRadius:6,fontSize:12,
          color:'var(--muted-foreground)',width:'100%',
          transition:'background .1s,color .1s'}}
        onMouseEnter={e => { e.currentTarget.style.background='var(--secondary)'; e.currentTarget.style.color='var(--foreground)'; }}
        onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--muted-foreground)'; }}
      >
        <Icon.plus size={12}/> Добавить
      </button>
    </div>
  );
}

// ── TasksPage ─────────────────────────────────────────────────────────────
function TasksPage({ tasks, setTasks, onOpenCall, onCreateTask, onMention, onTaskClosed, onUpdateTask, data }) {
  const [draggingId, setDraggingId]   = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  // Drop-target card для вертикального реордеринга внутри колонки.
  const [dropTarget, setDropTarget]   = useState({ id: null, position: null });
  const [search, setSearch]           = useState('');
  const [filters, setFilters]         = useState({ manager:'all', priority:'all' });
  const [detailTaskId, setDetailTaskId] = useState(null);
  // Подтверждение удаления.
  const [confirmDelete, setConfirmDelete] = useState(null); // {id, title} | null

  const managerOpts = [
    { value:'all', label:'Все менеджеры' },
    ...(data.managers || []).map(m => ({ value:m.name, label:m.name })),
  ];
  const prioOpts = [
    { value:'all',    label:'Любой приоритет' },
    { value:'high',   label:'Срочно' },
    { value:'medium', label:'Важно' },
    { value:'low',    label:'Обычная' },
  ];

  const visible = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.manager !== 'all' && t.manager !== filters.manager) return false;
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;
    return true;
  });

  const byCol = {};
  KANBAN_COLS.forEach(c => { byCol[c.key] = visible.filter(t => t.status === c.key); });

  const totalOpen = tasks.filter(t => t.status !== 'done' && t.status !== 'partial').length;

  // Drop в пустое место колонки — переносим в конец и меняем статус.
  const handleDropOnCol = colKey => {
    if (!draggingId) return;
    setTasks(ts => {
      const moving = ts.find(t => t.id === draggingId);
      if (!moving) return ts;
      const others = ts.filter(t => t.id !== draggingId);
      const updated = { ...moving, status: colKey };
      // Append at the end of the new column → put after all tasks of that col.
      const colTasks = others.filter(t => t.status === colKey);
      const lastColTaskId = colTasks.length ? colTasks[colTasks.length-1].id : null;
      if (!lastColTaskId) return [...others, updated];
      const idx = others.findIndex(t => t.id === lastColTaskId);
      return [...others.slice(0, idx+1), updated, ...others.slice(idx+1)];
    });
    setDraggingId(null); setDragOverCol(null); setDropTarget({id:null, position:null});
  };

  // Drop на конкретную карточку — определяем before/after по hovered position.
  const handleDragOverCard = (e, targetTask) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height/2;
    const position = e.clientY < midY ? 'before' : 'after';
    if (dropTarget.id !== targetTask.id || dropTarget.position !== position) {
      setDropTarget({ id: targetTask.id, position });
    }
  };

  const handleDropOnCard = targetTask => {
    if (!draggingId || draggingId === targetTask.id) {
      setDraggingId(null); setDragOverCol(null); setDropTarget({id:null, position:null});
      return;
    }
    setTasks(ts => {
      const moving = ts.find(t => t.id === draggingId);
      if (!moving) return ts;
      const others = ts.filter(t => t.id !== draggingId);
      const updated = { ...moving, status: targetTask.status };
      const targetIdx = others.findIndex(t => t.id === targetTask.id);
      const insertAt = dropTarget.position === 'after' ? targetIdx + 1 : targetIdx;
      return [...others.slice(0, insertAt), updated, ...others.slice(insertAt)];
    });
    setDraggingId(null); setDragOverCol(null); setDropTarget({id:null, position:null});
  };

  const handleDragEnd = () => { setDraggingId(null); setDragOverCol(null); setDropTarget({id:null, position:null}); };

  // Trigger удаления из карточки или TaskDetailModal — открывает confirm.
  const requestDelete = (task) => setConfirmDelete({ id: task.id, title: task.title });
  const performDelete = () => {
    if (!confirmDelete) return;
    setTasks(ts => ts.filter(t => t.id !== confirmDelete.id));
    setDetailTaskId(prev => prev === confirmDelete.id ? null : prev);
    setConfirmDelete(null);
  };

  const handleSaveDetail = updatedTask => {
    // Делегируем в app-handler чтобы запустить side-эффекты
    // (например, автозакрытие звонка при выполнении РОП-задачи).
    if (onUpdateTask) onUpdateTask(updatedTask);
    else setTasks(ts => ts.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const detailTask = detailTaskId ? tasks.find(t => t.id === detailTaskId) : null;

  return (
    <div className="content" onDragEnd={handleDragEnd}>

      {/* Header */}
      <div className="row-between">
        <div>
          <div className="page-title" style={{fontSize:20}}>Задачи</div>
          <div className="muted" style={{fontSize:12.5,marginTop:2}}>
            Канбан-доска · {totalOpen} открытых · {tasks.length} всего
          </div>
        </div>
        <Button variant="default" size="md" onClick={() => onCreateTask({})}>
          <Icon.plus size={13}/> Новая задача
        </Button>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:'0 0 220px'}}>
          <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',
            color:'var(--muted-foreground)',pointerEvents:'none',display:'flex'}}>
            <Icon.search size={13}/>
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Найти задачу..."
            style={{width:'100%',paddingLeft:30,paddingRight: search ? 30 : 10,paddingTop:7,paddingBottom:7,
              border:'1px solid var(--border)',borderRadius:6,fontSize:13,outline:'none',
              boxSizing:'border-box',background:'#fff',fontFamily:'inherit'}}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              title="Очистить"
              aria-label="Очистить поиск"
              style={{position:'absolute', right:6, top:'50%', transform:'translateY(-50%)',
                background:'none', border:0, padding:4, cursor:'pointer',
                color:'var(--muted-foreground)', display:'inline-flex', alignItems:'center',
                borderRadius:4}}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.background = 'var(--secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon.x size={12}/>
            </button>
          )}
        </div>
        <Select value={filters.manager}  onChange={v => setFilters(f=>({...f,manager:v}))}  options={managerOpts}/>
        <Select value={filters.priority} onChange={v => setFilters(f=>({...f,priority:v}))} options={prioOpts}/>
      </div>

      {/* Kanban board */}
      <div style={{display:'flex',gap:10,alignItems:'flex-start',paddingBottom:12}}>
        {KANBAN_COLS.map(col => (
          <KanbanColumn
            key={col.key} col={col} tasks={byCol[col.key]}
            onDragStart={setDraggingId} onDragEnd={handleDragEnd}
            onDragOverCol={setDragOverCol}
            onDropOnCol={handleDropOnCol}
            onDragOverCard={handleDragOverCard}
            onDropOnCard={handleDropOnCard}
            isOver={dragOverCol === col.key && draggingId !== null}
            dropTargetCardId={dropTarget.id}
            dropPosition={dropTarget.position}
            onOpenCall={onOpenCall} onDelete={requestDelete}
            onOpenDetail={setDetailTaskId}
            onAddTask={onCreateTask}
          />
        ))}
      </div>

      {/* Task detail modal */}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          managers={data.managers || []}
          onClose={() => setDetailTaskId(null)}
          onSave={handleSaveDetail}
          onDelete={() => requestDelete(detailTask)}
          onOpenCall={onOpenCall}
          onMention={onMention}
          onCloseTask={onTaskClosed}
        />
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <ConfirmDeleteTaskModal
          title={confirmDelete.title}
          onConfirm={performDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// ── ConfirmDeleteTaskModal ────────────────────────────────────────────────
function ConfirmDeleteTaskModal({ title, onConfirm, onCancel }) {
  const z = useModalZ();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  return (
    <div
      style={{position:'fixed',inset:0,zIndex:z,background:'rgba(9,9,11,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',
        justifyContent:'center',padding:'24px 16px'}}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:420,
        boxShadow:'0 24px 64px rgba(0,0,0,.22)',overflow:'hidden'}}>
        <div style={{padding:'18px 20px 14px'}}>
          <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Удалить задачу?</div>
          <div style={{fontSize:13,color:'var(--muted-foreground)',lineHeight:1.5}}>
            Вы уверены, что хотите удалить задачу <strong style={{color:'var(--foreground)'}}>«{title}»</strong>?
            Это действие нельзя отменить.
          </div>
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',
          padding:'12px 20px',borderTop:'1px solid var(--border)',background:'#FAFAFA'}}>
          <Button variant="outline" size="md" onClick={onCancel}>Отмена</Button>
          <Button variant="destructive" size="md" onClick={onConfirm}>
            <Icon.trash size={13}/> Удалить
          </Button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TasksPage, TaskCreateModal, TaskDetailModal, ConfirmDeleteTaskModal, initTasks });
