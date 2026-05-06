// ── AG Grid wrapper (vanilla agGrid → React) ─────────────────────────────
function AgGridReactLite({ rowData, columnDefs, onRowClicked, pageSize=20, pageSizeOptions=[10,20,50,100], height='100%' }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || apiRef.current) return;
    const gridOptions = {
      columnDefs,
      rowData,
      rowHeight: 64,
      headerHeight: 48,
      suppressCellFocus: true,
      animateRows: true,
      pagination: true,
      paginationPageSize: pageSize,
      paginationPageSizeSelector: pageSizeOptions,
      // sortingOrder includes null → 3rd click clears sort and returns to original order (rule 3).
      defaultColDef: { resizable: true, sortable: true, sortingOrder: ['asc', 'desc', null], unSortIcon: false },
      onRowClicked: (e) => {
        if (e.event && e.event.target.closest('button')) return;
        onRowClicked && onRowClicked(e);
      },
    };
    apiRef.current = window.agGrid.createGrid(containerRef.current, gridOptions);
    return () => { apiRef.current && apiRef.current.destroy(); apiRef.current = null; };
  }, []);

  useEffect(() => {
    if (apiRef.current) apiRef.current.setGridOption('rowData', rowData);
  }, [rowData]);

  useEffect(() => {
    if (apiRef.current) apiRef.current.setGridOption('columnDefs', columnDefs);
  }, [columnDefs]);

  return <div ref={containerRef} className="ag-theme-quartz" style={{height, width:'100%'}}></div>;
}

// ── Calls page ───────────────────────────────────────────────────────────
function CallsPage({ data, onOpenCall, period, setPeriod }) {
  const [selectedTab, setSelectedTab] = useState('targeted');
  const [filters, setFilters] = useState({ manager:'all' });

  const targetedRows = useMemo(() => {
    let rows = data.calls.filter(r => r.isTargeted);
    if (filters.manager !== 'all') rows = rows.filter(r => r.manager === filters.manager);
    return rows;
  }, [data.calls, filters]);

  const nonTargetedRows = useMemo(() => {
    let rows = data.calls.filter(r => !r.isTargeted);
    if (filters.manager !== 'all') rows = rows.filter(r => r.manager === filters.manager);
    return rows;
  }, [data.calls, filters]);

  const tabs = [
    { key:'targeted',    label:'Целевые',    count: data.calls.filter(r => r.isTargeted).length },
    { key:'nontargeted', label:'Нецелевые',  count: data.calls.filter(r => !r.isTargeted).length },
  ];

  // Рендер менеджера: Фамилия И.О. (без аватара)
  const managerCell = p => {
    const parts = (p.value||'').split(' ').filter(Boolean);
    const lastName = parts[0] || '';
    const initials = parts.slice(1).map(w => w[0] ? w[0].toUpperCase() + '.' : '').join('');
    const display = initials ? `${lastName} ${initials}` : lastName;
    return `<span style="font-weight:500;white-space:nowrap">${display}</span>`;
  };

  const statusCell = p => {
    const map = { sale:['bg-success-soft','#15803D','Продажа'], deal:['bg-primary-soft','#1E3FAF','Договор'], offer:['bg-primary-soft','#1E3FAF','КП отправлено'], followup:['bg-warning-soft','#B45309','Повтор. контакт'], refusal:['bg-danger-soft','#B91C1C','Отказ'], noresult:['bg-secondary','#71717A','Без результата'] };
    const v = map[p.value] || map.noresult;
    return `<span class="badge ${v[0]}" style="color:${v[1]}">${v[2]}</span>`;
  };

  const scoreCell = p => {
    if (p.value == null) return '<span style="color:#A1A1AA">—</span>';
    const v10 = p.value * 2;
    const cls = v10 >= 8 ? 'is-good' : v10 >= 6 ? 'is-warn' : v10 >= 4 ? 'is-default' : 'is-bad';
    return `<span class="score ${cls}">${p.value.toFixed(1)}</span>`;
  };

  const boolCell = p => p.value
    ? '<span style="color:#16A34A;font-weight:600">+</span>'
    : '<span style="color:#DC2626;font-weight:600">−</span>';

  const textCell = p => `<span style="font-size:16px;color:#52525B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;max-width:240px" title="${(p.value||'').replace(/"/g,"'")}">${p.value||'—'}</span>`;

  // Direction icon for AG Grid (rule 5). Outgoing = ↗, incoming = ↙. Red when not answered.
  // SVG paths mirror the lucide arrow-up-right / arrow-down-left used by Icon.* in ui.jsx.
  const directionCell = p => {
    const dir = p.data?.direction === 'in' ? 'in' : 'out';
    const ok  = p.data?.answered !== false;
    const label = (dir === 'in' ? 'Входящий ' : 'Исходящий ') + (ok ? 'успешный' : 'неуспешный');
    const color = ok ? '#71717A' : '#DC2626';
    const path = dir === 'in'
      ? '<line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/>'
      : '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>';
    return `<span title="${label}" aria-label="${label}" style="display:inline-flex;align-items:center;justify-content:center;color:${color};line-height:0;vertical-align:middle">`
      + `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`
      + `</span>`;
  };

  // Combine direction icon + datetime in a single cell so we don't burn an extra column.
  const datetimeCell = p => {
    const icon = directionCell({ data: p.data });
    const text = p.value || '';
    return `<span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap">${icon}<span>${text}</span></span>`;
  };

  // Колонки для Целевых (по ТЗ 6)
  const targetedCols = useMemo(() => [
    { field:'manager',       headerName:'Специалист',      width:160, cellRenderer: managerCell, pinned:'left', lockPinned:true },
    { field:'status',        headerName:'Результат',       width:140, cellRenderer: statusCell },
    { field:'nextStep',      headerName:'Следующий шаг',   width:190, cellRenderer: textCell, sortable:false },
    { field:'score',         headerName:'Ср. оценка',      width:100, cellRenderer: scoreCell, cellStyle:{textAlign:'center'} },
    { field:'objectionType', headerName:'Тип возражения',  width:170, cellRenderer: textCell, sortable:false },
    { field:'scriptOk',      headerName:'Скрипт',          width:80,  cellRenderer: boolCell, cellStyle:{textAlign:'center'}, sortable:false },
    { field:'promoOk',       headerName:'Акции',           width:72,  cellRenderer: boolCell, cellStyle:{textAlign:'center'}, sortable:false },
    { field:'datetime',      headerName:'Время',           width:170, cellRenderer: datetimeCell },
    { field:'content',       headerName:'Содержание',      flex:1,    cellRenderer: textCell, sortable:false },
    { field:'recommendation',headerName:'Рекомендации',   width:200, cellRenderer: textCell, sortable:false },
  ], []);

  // Колонки для Нецелевых (по ТЗ 6)
  const nonTargetedCols = useMemo(() => [
    { field:'manager',  headerName:'Специалист',   width:160, cellRenderer: managerCell, pinned:'left', lockPinned:true },
    { field:'status',   headerName:'Результат',    width:130,
      cellRenderer: () => `<span class="badge bg-secondary" style="color:#71717A">Нецелевой</span>`
    },
    { field:'datetime', headerName:'Время',        width:180, cellRenderer: datetimeCell },
    { field:'content',  headerName:'Содержание',   flex:1,   cellRenderer: textCell, sortable:false },
  ], []);

  const managerOptions = [{value:'all',label:'Все менеджеры'}, ...[...new Set(data.calls.map(r=>r.manager))].map(m => ({value:m,label:m}))];

  return (
    <div className="content">
      <div className="row-between">
        <div>
          <div className="page-title" style={{fontSize:20}}>Звонки</div>
          <div className="muted" style={{fontSize:12.5, marginTop:2}}>Все разговоры команды с AI-оценкой · клик по строке открывает карточку</div>
        </div>
        <div className="row" style={{gap:8}}>
          <PeriodSelector value={period} onChange={setPeriod}/>
        </div>
      </div>

      <Card>
        <div style={{padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
          <Tabs tabs={tabs} active={selectedTab} onChange={setSelectedTab}/>
          <div className="row" style={{gap:8}}>
            <Select value={filters.manager} onChange={v=>setFilters({...filters,manager:v})} options={managerOptions}/>
          </div>
        </div>
        <div style={{height:600}}>
          <AgGridReactLite
            key={selectedTab}
            rowData={selectedTab === 'targeted' ? targetedRows : nonTargetedRows}
            columnDefs={selectedTab === 'targeted' ? targetedCols : nonTargetedCols}
            pageSize={20}
            onRowClicked={(e)=>onOpenCall(e.data.id)}
          />
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { CallsPage, AgGridReactLite });
