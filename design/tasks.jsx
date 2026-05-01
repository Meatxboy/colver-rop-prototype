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
  return [
    { id:'T-01', title:'Провести разбор: возражение по цене не отработано',           text:'Менеджер дважды пропустил стандартный скрипт ответа на «дорого». Послушать звонок и разобрать конкретные моменты.',     manager:g(0), priority:'high',   status:'planned',     callId:'1841', dueDate:'2026-05-02', createdAt:'2026-04-28' },
    { id:'T-02', title:'Проверить соблюдение скрипта за последние 7 дней',            text:'',                                                                                                                              manager:g(1), priority:'medium', status:'planned',     callId:null,   dueDate:'2026-05-05', createdAt:'2026-04-28' },
    { id:'T-03', title:'Назначить тренинг по работе с возражением «Дорого»',          text:'',                                                                                                                              manager:g(2), priority:'high',   status:'queued',      callId:null,   dueDate:'2026-05-03', createdAt:'2026-04-27' },
    { id:'T-04', title:'Отправить письменную обратную связь по итогам недели',        text:'',                                                                                                                              manager:g(0), priority:'low',    status:'queued',      callId:null,   dueDate:'2026-05-07', createdAt:'2026-04-27' },
    { id:'T-05', title:'Прослушать 5 случайных звонков — выставить ручную оценку',   text:'',                                                                                                                              manager:g(3), priority:'medium', status:'in_progress', callId:null,   dueDate:'2026-05-01', createdAt:'2026-04-26' },
    { id:'T-06', title:'Подготовить материалы к еженедельному разбору провалов',      text:'',                                                                                                                              manager:g(1), priority:'high',   status:'in_progress', callId:null,   dueDate:'2026-05-02', createdAt:'2026-04-26' },
    { id:'T-07', title:'Согласовать обновлённый скрипт с командой',                   text:'',                                                                                                                              manager:g(4), priority:'medium', status:'paused',      callId:null,   dueDate:'2026-05-04', createdAt:'2026-04-25' },
    { id:'T-08', title:'Разобрать: менеджер не зафиксировал следующий шаг',           text:'',                                                                                                                              manager:g(2), priority:'high',   status:'paused',      callId:'1841', dueDate:'2026-04-30', createdAt:'2026-04-25' },
    { id:'T-09', title:'Встреча 1-на-1: низкая конверсия за апрель',                  text:'',                                                                                                                              manager:g(5), priority:'medium', status:'partial',     callId:null,   dueDate:'2026-04-29', createdAt:'2026-04-24' },
    { id:'T-10', title:'Выгрузить сводный отчёт по звонкам за апрель',                text:'',                                                                                                                              manager:null, priority:'low',    status:'partial',     callId:null,   dueDate:'2026-05-07', createdAt:'2026-04-24' },
    { id:'T-11', title:'Итоговая оценка всех менеджеров за апрель',                   text:'',                                                                                                                              manager:null, priority:'medium', status:'done',        callId:null,   dueDate:'2026-04-30', createdAt:'2026-04-23' },
    { id:'T-12', title:'Обратная связь после тренинга по скрипту (апрель)',            text:'',                                                                                                                              manager:g(3), priority:'low',    status:'done',        callId:null,   dueDate:'2026-04-28', createdAt:'2026-04-22' },
  ];
}

// ── TaskCreateModal ───────────────────────────────────────────────────────
function TaskCreateModal({ prefill = {}, managers = [], onClose, onSave, onOpenCall }) {
  const [form, setForm] = useState({
    title:    prefill.title    || '',
    text:     '',
    manager:  prefill.manager  || '',
    priority: prefill.priority || 'medium',
    status:   prefill.status   || 'planned',
    dueDate:  '',
    callId:   prefill.callId   || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleClear = () => setForm({
    title:'', text:'', manager:'', priority:'medium', status:'planned', dueDate:'', callId:'',
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
    });
    onClose();
  };

  const managerOpts = [
    { value:'', label:'Не назначен' },
    ...managers.map(m => ({ value:m.name, label:m.name })),
  ];

  const fieldLabel = txt => (
    <div style={{fontSize:11, fontWeight:600, color:'var(--muted-foreground)',
      textTransform:'uppercase', letterSpacing:.4, marginBottom:5}}>{txt}</div>
  );

  const inputStyle = {
    width:'100%', padding:'8px 10px', border:'1px solid var(--border)',
    borderRadius:6, fontSize:13, outline:'none', boxSizing:'border-box',
    fontFamily:'inherit', background:'#fff',
  };

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:400,background:'rgba(9,9,11,.45)',
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
function TaskDetailModal({ task, managers = [], onClose, onSave, onDelete, onOpenCall }) {
  const [form, setForm] = useState({
    title:    task.title    || '',
    text:     task.text     || '',
    manager:  task.manager  || '',
    priority: task.priority || 'medium',
    status:   task.status   || 'planned',
    dueDate:  task.dueDate  || '',
    callId:   task.callId   || '',
  });
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setDirty(true); };

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ ...task, ...form, manager: form.manager || null, callId: form.callId || null, dueDate: form.dueDate || null });
    onClose();
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
    <div style={{fontSize:11, fontWeight:600, color:'var(--muted-foreground)',
      textTransform:'uppercase', letterSpacing:.4, marginBottom:5}}>{txt}</div>
  );

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:400,background:'rgba(9,9,11,.50)',
        backdropFilter:'blur(3px)',display:'flex',alignItems:'flex-start',
        justifyContent:'center',padding:'40px 16px 24px',overflowY:'auto'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{background:'#fff',borderRadius:12,width:'100%',maxWidth:560,
        boxShadow:'0 32px 80px rgba(0,0,0,.22)',overflow:'hidden',
        animation:'slideUp .18s ease'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'14px 18px',borderBottom:'1px solid var(--border)',background:'#FAFAFA'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            {/* Status dot + col name */}
            <div style={{width:8,height:8,borderRadius:'50%',background:col.dot,flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:600,color:'var(--muted-foreground)'}}>{col.label}</span>
            <span style={{fontSize:11,color:'var(--muted-foreground)',marginLeft:4,opacity:.5}}>#{task.id}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            <button
              onClick={() => { if (window.confirm('Удалить задачу?')) { onDelete(task.id); onClose(); } }}
              style={{background:'none',border:'none',cursor:'pointer',padding:'5px 8px',
                borderRadius:6,color:'#B91C1C',fontSize:12,fontWeight:500,
                display:'flex',alignItems:'center',gap:5,opacity:.7}}
              title="Удалить задачу"
            >
              <Icon.trash size={13}/> Удалить
            </button>
            <button onClick={onClose}
              style={{background:'none',border:'none',cursor:'pointer',padding:5,
                color:'var(--muted-foreground)',display:'flex',alignItems:'center',borderRadius:6}}>
              <Icon.x size={17}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{padding:'18px 20px',display:'flex',flexDirection:'column',gap:14}}>

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
                <div style={{fontSize:11,color:'#B91C1C',marginTop:4,fontWeight:500}}>
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
            <span style={{fontSize:11,color:'var(--muted-foreground)'}}>
              Создана: <strong>{task.createdAt || '—'}</strong>
            </span>
            <span style={{fontSize:11,color:'var(--muted-foreground)'}}>
              ID: <strong>{task.id}</strong>
            </span>
            {/* Priority badge preview */}
            <span style={{background:prio.bg,color:prio.color,borderRadius:4,
              padding:'2px 7px',fontSize:10.5,fontWeight:600,marginLeft:'auto'}}>
              {prio.label}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:8,
          padding:'13px 20px',borderTop:'1px solid var(--border)',background:'#FAFAFA'}}>
          <Button variant="outline" size="md" onClick={onClose}>Отмена</Button>
          <Button
            variant="default" size="md"
            onClick={handleSave}
            disabled={!form.title.trim()}
            style={!form.title.trim() ? {opacity:.5,pointerEvents:'none'} : {}}
          >
            <Icon.check size={13}/> {dirty ? 'Сохранить изменения' : 'Закрыть'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── TaskCard ──────────────────────────────────────────────────────────────
function TaskCard({ task, onDragStart, onDragEnd, onOpenCall, onDelete, onOpenDetail }) {
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
    <div
      draggable
      onDragStart={e => { wasDrag.current = true; onDragStart(task.id); }}
      onDragEnd={onDragEnd}
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
          padding:'2px 6px',fontSize:10,fontWeight:600}}>{prio.label}</span>
        <button
          onClick={e => { e.stopPropagation(); onDelete(task.id); }}
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

      {/* Footer: call + responsible + due */}
      <div style={{display:'flex',alignItems:'center',gap:4,minWidth:0}}>
        {task.callId && (
          <button onClick={e => {e.stopPropagation(); onOpenCall && onOpenCall(task.callId);}}
            style={{background:'none',border:'none',padding:0,cursor:'pointer',
              color:'var(--primary)',display:'flex',alignItems:'center',flexShrink:0}}
            title={`Звонок #${task.callId}`}>
            <Icon.phone size={11}/>
          </button>
        )}
        <div style={{flex:1,minWidth:0,display:'flex',alignItems:'center',gap:4}}>
          {task.manager
            ? <><Avatar name={task.manager} size={16} style={{flexShrink:0}}/>
                <span style={{fontSize:11,color:'var(--muted-foreground)',
                  overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',minWidth:0}}>
                  {managerShort}</span></>
            : <span style={{fontSize:11,color:'var(--muted-foreground)',fontStyle:'italic'}}>—</span>
          }
        </div>
        {dueFmt && (
          <span style={{fontSize:10.5,fontWeight:isOverdue?600:400,flexShrink:0,
            color:isOverdue?'#B91C1C':'#71717A',marginLeft:4}}>
            {isOverdue?'⚠ ':''}{dueFmt}
          </span>
        )}
      </div>
    </div>
  );
}

// ── KanbanColumn ──────────────────────────────────────────────────────────
function KanbanColumn({ col, tasks, onDragStart, onDragEnd, onDragOver, onDrop, isOver, onOpenCall, onDelete, onOpenDetail, onAddTask }) {
  return (
    <div style={{flex:'1 1 0',minWidth:160,display:'flex',flexDirection:'column',gap:7}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'0 2px'}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:col.dot,flexShrink:0}}/>
        <span style={{fontWeight:600,fontSize:12,whiteSpace:'nowrap'}}>{col.label}</span>
        <span style={{background:'var(--secondary)',color:'var(--muted-foreground)',
          borderRadius:10,padding:'1px 6px',fontSize:10.5,fontWeight:600}}>{tasks.length}</span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); onDragOver(col.key); }}
        onDrop={() => onDrop(col.key)}
        style={{flex:1,borderRadius:8,padding:7,
          background:isOver?'#EFF6FF':'var(--secondary)',
          border:`2px dashed ${isOver?'var(--primary)':'transparent'}`,
          display:'flex',flexDirection:'column',gap:6,
          minHeight:180,transition:'background .12s,border-color .12s'}}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task}
            onDragStart={onDragStart} onDragEnd={onDragEnd}
            onOpenCall={onOpenCall} onDelete={onDelete} onOpenDetail={onOpenDetail}/>
        ))}
        {tasks.length === 0 && (
          <div style={{textAlign:'center',color:'var(--muted-foreground)',
            fontSize:11.5,padding:'20px 0',opacity:.4}}>Нет задач</div>
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
function TasksPage({ tasks, setTasks, onOpenCall, onCreateTask, data }) {
  const [draggingId, setDraggingId]   = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [search, setSearch]           = useState('');
  const [filters, setFilters]         = useState({ manager:'all', priority:'all' });
  const [detailTaskId, setDetailTaskId] = useState(null);

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

  const handleDrop = colKey => {
    if (!draggingId) return;
    setTasks(ts => ts.map(t => t.id === draggingId ? { ...t, status: colKey } : t));
    setDraggingId(null); setDragOverCol(null);
  };

  const handleDragEnd = () => { setDraggingId(null); setDragOverCol(null); };

  const handleDelete = id => setTasks(ts => ts.filter(t => t.id !== id));

  const handleSaveDetail = updatedTask => {
    setTasks(ts => ts.map(t => t.id === updatedTask.id ? updatedTask : t));
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
            style={{width:'100%',paddingLeft:30,paddingRight:10,paddingTop:7,paddingBottom:7,
              border:'1px solid var(--border)',borderRadius:6,fontSize:13,outline:'none',
              boxSizing:'border-box',background:'#fff',fontFamily:'inherit'}}
          />
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
            onDragOver={setDragOverCol}
            onDrop={handleDrop}
            isOver={dragOverCol === col.key && draggingId !== null}
            onOpenCall={onOpenCall} onDelete={handleDelete}
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
          onDelete={handleDelete}
          onOpenCall={onOpenCall}
        />
      )}
    </div>
  );
}

Object.assign(window, { TasksPage, TaskCreateModal, initTasks });
