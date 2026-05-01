// ── Tweaks panel (custom in-page) ────────────────────────────────────
function Tweaks({ tweaks, setTweaks, visible, setVisible }) {
  if (!visible) return null;
  return (
    <div className="tweaks-panel">
      <div className="tweaks-header">
        <div className="tweaks-header-title">Tweaks</div>
        <button className="icon-btn" style={{width:24, height:24, border:0, background:'transparent'}} onClick={()=>{
          setVisible(false);
          window.parent.postMessage({type:'__edit_mode_dismissed'}, '*');
        }}><Icon.x size={12}/></button>
      </div>
      <div className="tweaks-body">
        <div className="tweak-row">
          <span className="tweak-label">Очередь внимания</span>
          <Switch checked={tweaks.queueFull} onChange={v => setTweaks({queueFull: v})}/>
        </div>
        <div className="tweak-row">
          <span className="tweak-label">AI-панель открыта</span>
          <Switch checked={tweaks.aiOpen} onChange={v => setTweaks({aiOpen: v})}/>
        </div>
        <div className="tweak-row">
          <span className="tweak-label">Плотность таблиц</span>
          <Select value={tweaks.density} onChange={v => setTweaks({density: v})} options={[
            {value:'comfortable', label:'Комфортная'},
            {value:'compact', label:'Компактная'},
          ]}/>
        </div>
        <div className="tweak-row">
          <span className="tweak-label">Тон фона</span>
          <Select value={tweaks.bgTone} onChange={v => setTweaks({bgTone: v})} options={[
            {value:'gray', label:'Серый'},
            {value:'white', label:'Белый'},
            {value:'cool', label:'Холодный'},
          ]}/>
        </div>
        <div className="tweak-row">
          <span className="tweak-label">Период по умолчанию</span>
          <Select value={tweaks.period} onChange={v => setTweaks({period: v})} options={[
            {value:'today', label:'Сегодня'},
            {value:'week', label:'Неделя'},
            {value:'month', label:'Месяц'},
          ]}/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Tweaks });
