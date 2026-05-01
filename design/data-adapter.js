// ── Adapter: COLVER_DATA → MOCK_DATA shape used by app ────────────────────
(function(){
  const C = window.COLVER_DATA;
  if (!C) return;

  const empMap = Object.fromEntries(C.EMPLOYEES.map(e => [e.id, e]));

  // KPIs
  const totalCalls = C.CALLS.length;
  const targeted = C.CALLS.filter(c => c.isTargeted).length;
  const avgScore = C.CALLS.reduce((s,c)=>s+c.score,0) / C.CALLS.length;
  const conv = Math.round(targeted / totalCalls * 100);
  const queueAll = [...C.QUEUE_URGENT].sort((a,b) => a.priority - b.priority);
  const queueManagement = [...C.QUEUE_MANAGEMENT].sort((a,b) => a.priority - b.priority);
  const queuePractices = [...C.QUEUE_PRACTICES];

  const noTarget = C.CALLS.filter(c => !c.isTargeted).length;
  const noAgreement = C.CALLS.filter(c => !c.nextStep || c.nextStep === 'нет' || c.nextStep === '—' || c.nextStep === 'Нет договорённости').length;

  const kpis = {
    callsTotal: totalCalls, callsPlan: 200, callsDelta: 8, callsTrend: C.KPI_TREND.noTarget,
    queueCount: queueAll.length, queueDelta: 2,
    avgScore: avgScore, scoreDelta: 0.3, scoreTrend: C.KPI_TREND.score,
    conversion: conv, convDelta: 4, convTrend: C.KPI_TREND.conv,
    noTarget: noTarget, noTargetDelta: -5,
    noAgreement: noAgreement, noAgreementDelta: -8,
  };

  // Queue
  const queue = queueAll.map(q => ({
    id: q.id,
    callId: q.callId || q.id,
    priority: q.priority,
    problem: q.problem,
    subTitle: q.subTitle,
    client: q.clientName || '—',
    duration: '—',
    manager: q.employee,
    score: empMap[q.empId]?.score,
    age: q.age,
    ageMin: parseInt(q.age) || 0,
    recommendation: q.recommendation,
    context: q.content,
  }));

  // Managers
  const managers = C.EMPLOYEES.filter(e => e.calls > 0).map(e => ({
    id: e.id, name: e.name, role: 'Менеджер',
    calls: e.calls, plan: 60, score: e.score,
    conversion: e.conv, issues: queue.filter(q => q.manager === e.name).length,
    success: e.success,
    objIdent: e.objIdent,
    objHandled: e.objHandled,
    scriptCompliance: e.scriptCompliance,
    noTarget: Math.round(e.calls * (100 - e.conv) / 100 * 0.6),
    noAgreement: Math.round(e.calls * (100 - e.conv) / 100 * 0.4),
    convDelta: e.delta,
    trend: e.trend, delta: e.delta,
  }));

  // Loss reasons + objections
  const lossReasons = C.LOSS_REASONS.map(l => ({ name: l.reason, count: l.count, pct: l.pct }));
  const objections = C.TOP_OBJECTIONS.map(o => ({ name: o.reason, count: o.count, pct: o.pct, handled: o.handled }));

  // Calls today (subset)
  const callsToday = C.CALLS.slice(0, 12).map(c => ({
    id: c.id, manager: c.employee, client: c.client,
    time: c.dateTime.slice(11,16),
    duration: c.duration,
    score: c.score, live: false,
  }));
  // mark first one as live
  if (callsToday[0]) { callsToday[0].live = true; callsToday[0].score = null; }

  // Calls (AG Grid rowdata)
  const statusMap = {
    'Целевой':'sale', 'Нецелевой':'noresult', 'Робот':'noresult', 'Ошибся номером':'noresult',
  };
  const calls = C.CALLS.map(c => ({
    id: c.id.replace('C-',''),
    datetime: c.dateTime,
    manager: c.employee,
    client: c.client,
    phone: '+7 9' + (10 + (c.empId * 7) % 90) + ' ' + (100 + (c.empId * 137) % 900) + '-' + (10 + (c.empId * 31) % 90) + '-' + (10 + (c.empId * 53) % 90),
    isTargeted: c.isTargeted,
    duration: c.duration,
    durationSec: c.durationMin * 60,
    score: c.score,
    status: c.score < 4 ? 'refusal' : (c.isTargeted ? (c.score >= 4.5 ? 'sale' : 'deal') : 'noresult'),
    tags: [c.objection !== '—' ? c.objection : null, c.nextStep && c.nextStep !== 'нет' && c.nextStep !== '—' ? 'next: ' + c.nextStep.slice(0,18) : null].filter(Boolean),
    flags: c.score < 3.5 ? ['Слабое закрытие'] : (c.score < 4.5 && c.isTargeted ? ['Возражение не отработано'] : []),
    summary: c.content,
    recommendations: [c.recommendation].filter(r => r && r !== '—'),
    nextStep: c.nextStep || '—',
    objectionType: c.objection !== '—' ? c.objection : '—',
    scriptOk: c.scriptScore >= 3,
    promoOk: c.scriptScore % 2 === 0,
    content: c.content,
    recommendation: c.recommendation !== '—' ? c.recommendation : '—',
  }));

  // Call details
  const callDetails = {};
  calls.forEach(c => {
    const detailed = C.DETAILED_CALL;
    callDetails[c.id] = {
      ...c,
      summary: c.summary || detailed.summary,
      keyPoints: [
        'Клиент уточнял условия и стоимость',
        c.flags.length ? 'Менеджер не отработал ключевое возражение' : 'Менеджер корректно вёл диалог',
        c.status === 'sale' ? 'Закрытие на следующий шаг зафиксировано' : 'Следующий шаг не зафиксирован',
      ],
      transcript: detailed.transcript.map(l => ({ time: l.t, who: l.who, text: l.text })),
      criteria: detailed.criteria.map(cr => ({ name: cr.label, score: cr.value, note: '' })),
      recommendations: (c.recommendations.length ? c.recommendations : [detailed.recommendation]).map((t,i) => ({ title: 'Рекомендация ' + (i+1), text: t })),
      outcomeLabel: { sale:'Продажа', deal:'Договор', offer:'КП отправлено', followup:'Повторный контакт', refusal:'Отказ', noresult:'Без результата' }[c.status] || 'Без результата',
      potential: c.status === 'sale' ? '~ 480 000 ₽' : '—',
      nextStep: c.status === 'sale' ? 'Подготовить договор' : 'Перезвонить с расчётом',
      nextDate: c.status === 'sale' ? '24.04.2026' : '22.04.2026',
    };
  });
  // also include the rich one
  callDetails['1841'] = {
    ...calls.find(c => c.id === '1841') || calls[0],
    ...C.DETAILED_CALL,
    id: '1841',
    durationSec: 8*60+42,
    summary: C.DETAILED_CALL.summary,
    keyPoints: [
      'Клиент трижды спрашивал цену — менеджер уходила от ответа',
      'Не выявлены потребности клиента',
      'Не зафиксирован следующий шаг',
    ],
    transcript: C.DETAILED_CALL.transcript.map(l => ({ time: l.t, who: l.who, text: l.text })),
    criteria: C.DETAILED_CALL.criteria.map(cr => ({ name: cr.label, score: cr.value })),
    recommendations: [{ title: 'Закрытие звонка', text: C.DETAILED_CALL.recommendation }],
    tags: C.DETAILED_CALL.tags,
    flags: ['Слабое закрытие'],
    score: C.DETAILED_CALL.score,
    manager: C.DETAILED_CALL.employee,
    client: C.DETAILED_CALL.client,
    phone: C.DETAILED_CALL.phone,
    datetime: C.DETAILED_CALL.dateTime,
    duration: C.DETAILED_CALL.duration,
    outcomeLabel: 'Без результата',
    potential: '—',
    nextStep: 'Перезвонить с расчётом',
    nextDate: '22.04.2026',
  };

  // Ratings (4.5 ТЗ): нумерованные рейтинги с дельтой позиции
  const activeEmployees = C.EMPLOYEES.filter(e => e.calls > 0);
  const ratingByScore = [...activeEmployees]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((e, i) => ({
      id: e.id, name: e.name, calls: e.calls,
      score: e.score, scoreStr: e.score != null ? e.score.toFixed(1) : '—',
      rank: e.score != null ? i + 1 : null,
      rankDelta: e.delta != null ? Math.round(-e.delta * 0.7) : 0,
    }));
  // append nulls at end
  const nullScoreEmps = C.EMPLOYEES.filter(e => e.calls === 0).map(e => ({
    id: e.id, name: e.name, calls: e.calls, score: null, scoreStr: '—', rank: null, rankDelta: null,
  }));

  const ratingByConv = [...activeEmployees]
    .sort((a, b) => (b.conv || 0) - (a.conv || 0))
    .map((e, i) => ({
      id: e.id, name: e.name, calls: e.calls,
      conv: e.conv, convStr: e.conv != null ? e.conv + '%' : '—',
      rank: e.conv != null ? i + 1 : null,
      rankDelta: e.delta != null ? Math.round(-e.delta * 0.5) : 0,
    }));

  const ratings = {
    byScore: [...ratingByScore, ...nullScoreEmps],
    byConv: [...ratingByConv, ...nullScoreEmps],
  };

  // Processed
  const processed = C.PROCESSED.map(p => ({
    id: p.id,
    callId: '1841',
    problem: p.problem,
    manager: p.employee,
    action: p.resolution === 'irrelevant' ? 'done' : 'feedback',
    rop: 'Алексей П.',
    date: p.closedAt.slice(0,10),
    outcome: p.resolution === 'resolved' ? 'good' : 'pending',
  }));

  window.MOCK_DATA = { kpis, queue, queueManagement, queuePractices, managers, lossReasons, objections, callsToday, calls, callDetails, processed, ratings };
})();
