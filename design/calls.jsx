// ── AG Grid wrapper (vanilla agGrid → React) ─────────────────────────────
// Wraps the vanilla AG Grid with a React lifecycle. Adds:
//   • column-state callbacks (onColumnState / initialColumnState) so the
//     parent can persist user-resized widths between tab switches.
//   • a custom footer (QueuePager) that mimics the dashboard pager —
//     AG Grid's native pagination panel is suppressed.
function AgGridReactLite({
  rowData, columnDefs, onRowClicked,
  pageSize: initialPageSize = 20,
  pageSizes = [10, 20, 50],
  height = '100%',
  onColumnState,
  initialColumnState,
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);
  // Stable refs so grid callbacks always see the latest props/handlers.
  const onColumnStateRef = useRef(onColumnState);
  useEffect(() => { onColumnStateRef.current = onColumnState; }, [onColumnState]);

  const [pag, setPag] = useState({ page: 0, totalPages: 1, pageSize: initialPageSize });

  useEffect(() => {
    if (!containerRef.current || apiRef.current) return;
    const gridOptions = {
      columnDefs,
      rowData,
      // Фиксированная высота строки — сетка не «прыгает» при первом
      // рендере под autoHeight. Высота подобрана под 2 строки текста с
      // учётом padding ячейки. Длинный текст обрезается через line-clamp.
      rowHeight: 64,
      headerHeight: 40,
      suppressCellFocus: true,
      animateRows: false,
      pagination: true,
      paginationPageSize: initialPageSize,
      // We render a custom pager below the grid (matches dashboard style).
      suppressPaginationPanel: true,
      // sortingOrder includes null → 3rd click clears sort and returns to original order (rule 3).
      defaultColDef: { resizable: true, sortable: true, sortingOrder: ['asc', 'desc', null], unSortIcon: false },
      onRowClicked: (e) => {
        if (e.event && e.event.target.closest('button')) return;
        onRowClicked && onRowClicked(e);
      },
      onColumnResized: (e) => {
        // Save state ONLY for user-driven resizes (drag handle).
        // AG Grid also fires this event with source='api'/'flex' during
        // programmatic column-defs swaps — those would corrupt the saved
        // state for the inactive tab, so we filter them out.
        if (e.finished && e.source === 'uiColumnResized' && apiRef.current && onColumnStateRef.current) {
          onColumnStateRef.current(apiRef.current.getColumnState());
        }
      },
      onPaginationChanged: () => {
        if (!apiRef.current) return;
        setPag({
          page: apiRef.current.paginationGetCurrentPage(),
          totalPages: apiRef.current.paginationGetTotalPages(),
          pageSize: apiRef.current.paginationGetPageSize ? apiRef.current.paginationGetPageSize() : initialPageSize,
        });
      },
    };
    apiRef.current = window.agGrid.createGrid(containerRef.current, gridOptions);
    if (initialColumnState) {
      // Defer one tick so AG Grid finishes initial column setup before we
      // overlay user state.
      setTimeout(() => apiRef.current && apiRef.current.applyColumnState({ state: initialColumnState, applyOrder: true }), 0);
    }
    return () => { apiRef.current && apiRef.current.destroy(); apiRef.current = null; };
  }, []);

  useEffect(() => {
    if (apiRef.current) apiRef.current.setGridOption('rowData', rowData);
  }, [rowData]);

  // Note: the parent re-mounts this component on tab switch (via React key),
  // so columnDefs effectively only changes once on initial mount. We still
  // sync if columnDefs identity ever changes.
  useEffect(() => {
    if (!apiRef.current) return;
    apiRef.current.setGridOption('columnDefs', columnDefs);
  }, [columnDefs]);

  const goPage    = (p) => apiRef.current && apiRef.current.paginationGoToPage(p);
  const setSize   = (s) => apiRef.current && apiRef.current.setGridOption('paginationPageSize', s);

  return (
    <div style={{display:'flex', flexDirection:'column', height}}>
      <div ref={containerRef} className="ag-theme-quartz" style={{flex:1, minHeight:0, width:'100%'}}/>
      <QueuePager
        total={rowData.length}
        page={pag.page}
        pageSize={pag.pageSize}
        setPage={goPage}
        setPageSize={setSize}
        totalPages={pag.totalPages}
        pageSizes={pageSizes}
      />
    </div>
  );
}

// ── Calls page ───────────────────────────────────────────────────────────
function CallsPage({ data, onOpenCall, period, setPeriod }) {
  const [selectedTab, setSelectedTab] = useState('targeted');
  const [filters, setFilters] = useState({ manager:'all' });

  // Persisted column state per tab. Lives in a ref to avoid re-render storms
  // when the user drags a column edge.
  const colStateRef = useRef({ targeted: null, nontargeted: null });
  const onColumnState = (state) => { colStateRef.current[selectedTab] = state; };

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

  // Wrapping text cell — отображает текст с переносами и обрезает по 2-3
  // строкам через line-clamp. Высота строки фиксирована (rowHeight: 64),
  // поэтому таблица не «скачет» при первом рендере, а длинный текст
  // мягко обрезается с многоточием.
  const textCellWrap = p => {
    const safe = String(p.value || '—').replace(/</g, '&lt;');
    return `<div style="font-size:12px;color:#52525B;line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;word-break:break-word" title="${safe.replace(/"/g,"'")}">${safe}</div>`;
  };
  // Cell-стиль для wrap-колонок без autoHeight (height фиксирована).
  const wrapStyle = { whiteSpace: 'normal', lineHeight: '1.4', display: 'flex', alignItems: 'center', padding: '6px 12px' };

  // Direction icon for AG Grid (rule 5). Outgoing = ↗, incoming = ↙. Red when not answered.
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

  // Колонки для Целевых (по ТЗ 6). Текстовые колонки тянутся по высоте.
  const targetedCols = useMemo(() => [
    { field:'manager',       headerName:'Специалист',      width:160, cellRenderer: managerCell, pinned:'left', lockPinned:true },
    { field:'status',        headerName:'Результат',       width:140, cellRenderer: statusCell },
    { field:'nextStep',      headerName:'Следующий шаг',   width:200, cellRenderer: textCellWrap, sortable:false, cellStyle: wrapStyle },
    { field:'score',         headerName:'Ср. оценка',      width:100, cellRenderer: scoreCell, cellStyle:{textAlign:'center'} },
    { field:'objectionType', headerName:'Тип возражения',  width:180, cellRenderer: textCellWrap, sortable:false, cellStyle: wrapStyle },
    { field:'scriptOk',      headerName:'Скрипт',          width:80,  cellRenderer: boolCell, cellStyle:{textAlign:'center'}, sortable:false },
    { field:'promoOk',       headerName:'Акции',           width:72,  cellRenderer: boolCell, cellStyle:{textAlign:'center'}, sortable:false },
    { field:'datetime',      headerName:'Время',           width:170, cellRenderer: datetimeCell },
    { field:'content',       headerName:'Содержание',      flex:1, minWidth:240, cellRenderer: textCellWrap, sortable:false, cellStyle: wrapStyle },
    { field:'recommendation',headerName:'Рекомендации',   width:220, cellRenderer: textCellWrap, sortable:false, cellStyle: wrapStyle },
  ], []);

  // Колонки для Нецелевых (по ТЗ 6). Колонка «Содержание» теперь wrap+autoHeight.
  const nonTargetedCols = useMemo(() => [
    { field:'manager',  headerName:'Специалист',   width:160, cellRenderer: managerCell, pinned:'left', lockPinned:true },
    { field:'status',   headerName:'Результат',    width:130,
      cellRenderer: () => `<span class="badge bg-secondary" style="color:#71717A">Нецелевой</span>`
    },
    { field:'datetime', headerName:'Время',        width:180, cellRenderer: datetimeCell },
    { field:'content',  headerName:'Содержание',   flex:1, minWidth:280, cellRenderer: textCellWrap, sortable:false, cellStyle: wrapStyle },
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
          {/* key={selectedTab} → пересоздаём сетку при переключении вкладок,
              но colStateRef хранит сохранённые ширины и они применяются
              как initialColumnState при mount. */}
          <AgGridReactLite
            key={selectedTab}
            rowData={selectedTab === 'targeted' ? targetedRows : nonTargetedRows}
            columnDefs={selectedTab === 'targeted' ? targetedCols : nonTargetedCols}
            pageSize={20}
            pageSizes={[10, 20, 50]}
            onRowClicked={(e)=>onOpenCall(e.data.id)}
            onColumnState={onColumnState}
            initialColumnState={colStateRef.current[selectedTab]}
          />
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { CallsPage, AgGridReactLite });
