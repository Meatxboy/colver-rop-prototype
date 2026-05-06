// ── Cookie consent banner (rule 6) ────────────────────────────────────────
// Simple bottom strip — Принять / Отклонить. Choice persists in localStorage
// under COOKIE_KEY; banner hides on subsequent loads. Per CONVENTIONS this is
// the prototype's first localStorage write — kept tight and self-contained.

const COOKIE_KEY = 'colver_cookie_consent';

const readCookieConsent = () => {
  try { return localStorage.getItem(COOKIE_KEY); } catch { return null; }
};
const writeCookieConsent = (v) => {
  try { localStorage.setItem(COOKIE_KEY, v); } catch {}
};

function CookieBanner() {
  const [visible, setVisible] = useState(() => readCookieConsent() == null);

  if (!visible) return null;

  const decide = (choice) => {
    writeCookieConsent(choice);
    setVisible(false);
  };

  return (
    <div className="cookie-banner" role="dialog" aria-label="Использование cookies">
      <div className="cookie-banner-text">
        Мы используем cookies, чтобы запоминать ваши настройки и улучшать работу сервиса.
        Подробнее — в <a href="#" onClick={(e) => e.preventDefault()}>Политике конфиденциальности</a>.
      </div>
      <div className="cookie-banner-actions">
        <Button variant="outline" size="md" onClick={() => decide('rejected')}>Отклонить</Button>
        <Button variant="default" size="md" onClick={() => decide('accepted')}>Принять</Button>
      </div>
    </div>
  );
}

Object.assign(window, { CookieBanner });
