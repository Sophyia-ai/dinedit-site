/**
 * Sophyia Chat Widget
 * Usage: <script src="https://chat.sophyia.io/widget.js" data-bot="la-gare-cully"></script>
 *
 * Attributes:
 *   data-bot       (required) Bot ID
 *   data-color     (optional) Primary color (default: #9A30B3)
 *   data-accent    (optional) Accent color (default: #2d2d2d)
 *   data-position  (optional) "bottom-right" or "bottom-left" (default: bottom-right)
 *   data-mode      (optional) "bubble" (default), "fullpage", "sidebar", "embed", "lateral"
 *   data-target    (optional) ID of container element for "embed" mode
 *   data-api       (optional) API endpoint
 */
(function () {
  "use strict";

  // ── Config from script tag ────────────────────────────────────────────────
  const script = document.currentScript;
  const BOT_ID = script.getAttribute("data-bot");
  const COLOR = script.getAttribute("data-color") || "#9A30B3";
  const ACCENT = script.getAttribute("data-accent") || "#2d2d2d";
  const POSITION = script.getAttribute("data-position") || "bottom-right";
  const MODE = script.getAttribute("data-mode") || "bubble"; // bubble, fullpage, sidebar, embed, lateral
  const TARGET = script.getAttribute("data-target") || "";
  const API_URL = script.getAttribute("data-api") || "https://sophyia-chat-api-b6fbarcsb7chczam.switzerlandnorth-01.azurewebsites.net/api/chat";
  const BADGE_TEXTS = { fr: script.getAttribute("data-badge-fr") || "", en: script.getAttribute("data-badge-en") || "", de: script.getAttribute("data-badge-de") || "", it: script.getAttribute("data-badge-it") || "", ru: script.getAttribute("data-badge-ru") || "", nl: script.getAttribute("data-badge-nl") || "", he: script.getAttribute("data-badge-he") || "" };

  // Fullpage site mode — extra attributes
  const SITE_NAME = script.getAttribute("data-name") || "";
  const SITE_TAGLINE = script.getAttribute("data-tagline") || "";
  const SITE_LOGO = script.getAttribute("data-logo") || "";
  const SITE_HERO = script.getAttribute("data-hero") || "";
  const SITE_PHONE = script.getAttribute("data-phone") || "";
  const SITE_ADDRESS = script.getAttribute("data-address") || "";
  // Timer inactivité (RGPD by design) — configurables via data-attributes
  const INACTIVITY_MS = parseInt(script.getAttribute("data-inactivity-ms") || "240000", 10);  // 4 min
  const COUNTDOWN_SEC = parseInt(script.getAttribute("data-countdown-seconds") || "30", 10);
  // URL du formulaire de réservation (pour balise [BOOK_PREFILL])
  const BOOKING_URL = script.getAttribute("data-booking-url") || "/booking";
  // Si présent : skip le defaultWelcome neutre au boot bulle.
  // Cas d'usage : tenants avec welcome dynamique LLM (Olivia) où le default
  // crée une transition visuelle inutile. Sans cet attribut, comportement
  // historique préservé (La Gare et autres restaurants : defaultWelcome affiché).
  const SKIP_DEFAULT_WELCOME = script.hasAttribute("data-skip-welcome");
  // Auto-open : après ce délai en ms, la bulle s'ouvre toute seule.
  // 0 = désactivé (défaut). Olivia villa : 6000.
  const AUTO_OPEN_MS = parseInt(script.getAttribute("data-auto-open-ms") || "0", 10);
  // Auto-close : après une auto-ouverture, si le visiteur n'a PAS interagi
  // dans ce délai, la bulle se referme gentiment (pas d'effacement).
  // 0 = désactivé (défaut). Olivia villa : 10000.
  const AUTO_CLOSE_MS = parseInt(script.getAttribute("data-auto-close-ms") || "0", 10);
  // Durée de la transition d'ouverture ET de fermeture du panneau chat (en ms).
  // Défaut 300 = comportement historique (La Gare + tout client qui ne passe
  // pas cet attribut → INCHANGÉ byte-pour-byte). Villa/Dinédit : 2000 pour un
  // effet d'ouverture doux, théâtral, cohérent avec le ton prestige.
  const OPEN_DURATION_MS = parseInt(script.getAttribute("data-open-duration-ms") || "300", 10);

  // ── i18n ──────────────────────────────────────────────────────────────────
  const SUPPORTED_LANGS = ["fr", "en", "de", "it", "ru", "nl", "he"];
  // Detection de langue par priorite decroissante :
  //  1. localStorage["sophyia_lang"] — cle officielle du widget (convention)
  //  2. localStorage["preferredLang"] — cle utilisee par le site raoulbaudlez.com
  //  3. navigator.language
  //  4. "fr" (fallback)
  // Pour integrer le widget sur un nouveau site dont le switcher de langue ecrit
  // dans une autre cle localStorage, ajouter cette cle dans _LANG_KEYS.
  // Alternative : demander au site d'ecrire aussi dans "sophyia_lang".
  const _LANG_KEYS = ["sophyia_lang", "preferredLang"];
  const _storedLang = typeof localStorage !== "undefined"
    ? (_LANG_KEYS.map(k => localStorage.getItem(k)).find(v => v && SUPPORTED_LANGS.includes(v)) || "")
    : "";
  const _browserLang = (navigator.language || "fr").split("-")[0].toLowerCase();
  // USER_LANG est `let` (pas const) pour permettre le switch live via applyLanguage()
  let USER_LANG = _storedLang || (SUPPORTED_LANGS.includes(_browserLang) ? _browserLang : "fr");

  const I18N = {
    fr: { placeholder: "Posez votre question...", error: "Connexion impossible. Veuillez réessayer.", send: "Envoyer", powered: "Propulsé par", online: "En ligne — Répond instantanément", close: "Fermer", welcome: "Bienvenue", book: "Réserver", open_chat: "Ouvrir le chat", small: "Petit", medium: "Moyen", large: "Grand", exit: "Sortir",
      privacy_note: "Notre échange reste privé et s'efface en fin de conversation.",
      end_conversation: "Terminer la conversation",
      inactivity_warning: "Je ne vous sens plus parmi nous. Je vais clore notre échange dans",
      seconds_short: "s",
      goodbye: "À très bientôt.",
      finalize_request: "Finaliser ma demande",
      go_to_form: "Aller au formulaire" },
    en: { placeholder: "Ask your question...", error: "Connection failed. Please try again.", send: "Send", powered: "Powered by", online: "Online — Instant replies", close: "Close", welcome: "Welcome", book: "Book", open_chat: "Open chat", small: "Small", medium: "Medium", large: "Large", exit: "Close",
      privacy_note: "Our conversation stays private and is erased when it ends.",
      end_conversation: "End conversation",
      inactivity_warning: "I no longer sense you. I will close our exchange in",
      seconds_short: "s",
      goodbye: "See you soon.",
      finalize_request: "Finalise my request",
      go_to_form: "Go to form" },
    de: { placeholder: "Stellen Sie Ihre Frage...", error: "Verbindung fehlgeschlagen. Bitte erneut versuchen.", send: "Senden", powered: "Betrieben von", online: "Online — Sofortige Antworten", close: "Schliessen", welcome: "Willkommen", book: "Reservieren", open_chat: "Chat öffnen", small: "Klein", medium: "Mittel", large: "Gross", exit: "Schliessen",
      privacy_note: "Unser Gespräch bleibt privat und wird am Ende gelöscht.",
      end_conversation: "Gespräch beenden",
      inactivity_warning: "Ich spüre Sie nicht mehr. Ich werde unseren Austausch in",
      seconds_short: "s",
      goodbye: "Bis bald.",
      finalize_request: "Anfrage abschließen",
      go_to_form: "Zum Formular" },
    it: { placeholder: "Fai la tua domanda...", error: "Connessione fallita. Riprova.", send: "Invia", powered: "Offerto da", online: "Online — Risposte immediate", close: "Chiudi", welcome: "Benvenuti", book: "Prenota", open_chat: "Apri la chat", small: "Piccolo", medium: "Medio", large: "Grande", exit: "Chiudi",
      privacy_note: "La nostra conversazione resta privata e si cancella alla fine.",
      end_conversation: "Termina la conversazione",
      inactivity_warning: "Non vi sento più. Chiuderò il nostro scambio tra",
      seconds_short: "s",
      goodbye: "A presto.",
      finalize_request: "Finalizza la mia richiesta",
      go_to_form: "Vai al modulo" },
    ru: { placeholder: "Задайте ваш вопрос...", error: "Не удалось подключиться. Попробуйте ещё раз.", send: "Отправить", powered: "Работает на", online: "В сети — Мгновенные ответы", close: "Закрыть", welcome: "Здравствуйте", book: "Забронировать", open_chat: "Открыть чат", small: "Малый", medium: "Средний", large: "Большой", exit: "Закрыть",
      privacy_note: "Наша беседа остается приватной и удаляется в конце.",
      end_conversation: "Завершить беседу",
      inactivity_warning: "Я больше не слышу вас. Я завершу наш обмен через",
      seconds_short: "с",
      goodbye: "До скорой встречи.",
      finalize_request: "Завершить мой запрос",
      go_to_form: "К форме" },
    nl: { placeholder: "Stel uw vraag...", error: "Verbinding mislukt. Probeer opnieuw.", send: "Versturen", powered: "Mogelijk gemaakt door", online: "Online — Direct antwoord", close: "Sluiten", welcome: "Welkom", book: "Reserveren", open_chat: "Chat openen", small: "Klein", medium: "Middel", large: "Groot", exit: "Sluiten",
      privacy_note: "Ons gesprek blijft privé en wordt aan het einde gewist.",
      end_conversation: "Gesprek beëindigen",
      inactivity_warning: "Ik voel u niet meer. Ik sluit ons gesprek over",
      seconds_short: "s",
      goodbye: "Tot snel.",
      finalize_request: "Mijn verzoek afronden",
      go_to_form: "Naar het formulier" },
    he: { placeholder: "שאלו את שאלתכם...", error: "ההתחברות נכשלה. אנא נסו שוב.", send: "שליחה", powered: "מופעל על ידי", online: "מקוון — תגובה מיידית", close: "סגירה", welcome: "ברוכים הבאים", book: "הזמנה", open_chat: "פתח צ'אט", small: "קטן", medium: "בינוני", large: "גדול", exit: "סגירה",
      privacy_note: "השיחה שלנו נשארת פרטית ונמחקת בסיומה.",
      end_conversation: "סיים את השיחה",
      inactivity_warning: "אני כבר לא מרגישה אתכם. אסגור את השיחה בעוד",
      seconds_short: "ש׳",
      goodbye: "להתראות בקרוב.",
      finalize_request: "סיים את בקשתי",
      go_to_form: "אל הטופס" },
  };
  let t = I18N[USER_LANG] || I18N.fr;

  // Cache des settings apres fetch get_public_settings — permet re-rendu sur change de langue
  let _cachedSettings = null;
  // Guards pour eviter les leaks lors du re-rendu (setInterval, document listener)
  let _heroRotationInitialized = false;
  let _docClickListenerInitialized = false;

  // Helper: get localized value from i18n object or string (retrocompat)
  function loc(val) {
    if (!val) return "";
    if (typeof val === "string") return val;
    return val[USER_LANG] || val.fr || val.en || Object.values(val)[0] || "";
  }

  // Universal booking prompts (identical for all restaurant clients)
  const BOOK_PROMPTS = {
    fr: "[RUBRIQUE] Je souhaite réserver une table.",
    en: "[RUBRIQUE] I would like to book a table.",
    de: "[RUBRIQUE] Ich möchte einen Tisch reservieren.",
    it: "[RUBRIQUE] Vorrei prenotare un tavolo.",
    ru: "[RUBRIQUE] Я хотел бы забронировать.",
    nl: "[RUBRIQUE] Ik wil graag reserveren.",
    he: "[RUBRIQUE] אני רוצה להזמין."
  };

  const IS_BUBBLE = MODE === "bubble";
  const IS_FULLPAGE = MODE === "fullpage";
  const IS_SIDEBAR = MODE === "sidebar";
  const IS_EMBED = MODE === "embed";
  const IS_LATERAL = MODE === "lateral";

  if (!BOT_ID) {
    console.error("[Sophyia Chat] data-bot attribute is required");
    return;
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let isOpen = !IS_BUBBLE && !IS_LATERAL; // fullpage/sidebar/embed: open by default; bubble/lateral: closed
  let isLoading = false;
  let history = [];
  let welcomeShown = false;
  // Impulsion langue : on prefixe [LANG:xx] uniquement quand la langue du SITE
  // change. Sinon, on laisse le LLM detecter la langue tapee par l'utilisateur.
  // Init = langue de boot. Mis a jour seulement quand on prefixe effectivement.
  let _lastPrefixedLang = USER_LANG;
  // Welcome dynamique (action generate_welcome cote API). Le widget tente de
  // remplacer le welcome statique par un welcome LLM compose a l'instant T,
  // mais uniquement si le user n'a pas encore engage la conversation.
  let _userEngaged = false;
  let _welcomeReplaced = false;
  // Timer inactivité — RGPD by design (effacement auto + bouton explicite)
  let _inactivityTimer = null;
  let _countdownTimer = null;
  let _countdownSecondsLeft = COUNTDOWN_SEC;
  let _warningEl = null;
  // Auto-open / auto-close — bulle qui se présente seule, se replie si ignorée
  let _autoOpenTimer = null;
  let _autoCloseTimer = null;
  let _wasAutoOpened = false;  // true si bulle ouverte par auto-open (vs clic user)

  // ── Styles ────────────────────────────────────────────────────────────────
  const styles = document.createElement("style");
  styles.textContent = `
    #sophyia-chat-widget * {
      margin: 0; padding: 0; box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #sophyia-chat-window,
    #sophyia-chat-window .sophyia-msg,
    #sophyia-chat-window #sophyia-chat-messages,
    #sophyia-chat-window #sophyia-chat-input-area,
    #sophyia-chat-window #sophyia-chat-input,
    #sophyia-chat-window .sophyia-size-bar {
      box-sizing: border-box;
    }

    /* Bubble button */
    #sophyia-chat-bubble {
      position: fixed;
      ${POSITION === "bottom-left" ? "left: 20px" : "right: 20px"};
      bottom: 20px;
      width: 60px; height: 60px;
      border-radius: 50%;
      background: ${COLOR};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 99998;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    #sophyia-chat-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px rgba(0,0,0,0.4);
    }
    #sophyia-chat-bubble svg {
      width: 28px; height: 28px; fill: white;
    }
    #sophyia-chat-bubble .badge {
      position: absolute; top: -2px; right: -2px;
      width: 16px; height: 16px; border-radius: 50%;
      background: ${ACCENT}; border: 2px solid white;
      animation: sophyia-pulse 2s infinite;
    }

    @keyframes sophyia-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.7; }
    }

    /* Chat window */
    #sophyia-chat-window {
      position: fixed;
      ${POSITION === "bottom-left" ? "left: 20px" : "right: 20px"};
      bottom: 90px;
      width: 440px;
      max-width: calc(100vw - 40px);
      height: 650px;
      max-height: calc(100vh - 100px);
      border-radius: 20px;
      background: #1a1a1a;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 10px 50px rgba(0,0,0,0.5);
      z-index: 99999;
      display: none;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: opacity ${OPEN_DURATION_MS}ms ease, transform ${OPEN_DURATION_MS}ms ease;
    }
    #sophyia-chat-window.open {
      display: flex;
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Mobile ≤640px (global, tous modes) — 2 états :
       - normal : 70vh max (bat les valeurs defaults width:440px height:650px)
       - .sophyia-peek : premier coucou auto-open discret à 50vh */
    @media (max-width: 640px) {
      #sophyia-chat-window {
        width: calc(100% - 16px) !important;
        max-width: calc(100% - 16px) !important;
        right: 8px !important;
        ${POSITION === "bottom-left" ? "left: 8px !important;" : ""}
        bottom: 20px !important;
        height: 70vh !important;
        max-height: 70vh !important;
        border-radius: 16px !important;
      }
      #sophyia-chat-window.sophyia-peek {
        height: 50vh !important;
        max-height: 50vh !important;
      }
    }

    /* Mode: fullpage — site immersif, image plein ecran */
    ${IS_FULLPAGE ? `
    #sophyia-chat-bubble { display: none !important; }
    #sophyia-site-wrapper {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column;
      background: #111;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      ${SITE_HERO ? `background: url('${SITE_HERO}') center/cover fixed;` : ''}
    }
    #sophyia-site-wrapper::before {
      content: ''; position: fixed; inset: 0;
      background: rgba(0,0,0,0.05);
      z-index: 0;
    }
    .sophyia-bg-layer {
      position: fixed; inset: 0; z-index: -1;
      background-size: cover; background-position: center;
      transition: opacity 1.2s ease;
    }
    .sophyia-bg-layer.hidden { opacity: 0; }

    /* Header — transparent, over the image */
    #sophyia-site-header {
      display: flex; align-items: center; gap: 16px;
      padding: 8px 32px;
      background: rgba(0,0,0,0.25);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 9999; flex-shrink: 0;
      position: relative;
    }
    #sophyia-site-header .site-logo {
      height: 55px; width: auto;
      filter: drop-shadow(0 0 8px rgba(255,255,255,0.6)) drop-shadow(0 0 2px rgba(255,255,255,0.9));
      position: relative; z-index: 2;
    }
    #sophyia-site-header .site-name { display: none; }
    #sophyia-site-header nav {
      margin-left: auto; display: flex; gap: 2px; align-items: center;
    }
    #sophyia-site-header nav button {
      padding: 6px 14px; border: none; background: transparent;
      color: rgba(255,255,255,0.75); font-size: 13px; cursor: pointer;
      border-radius: 8px; transition: all 0.2s; font-weight: 400;
      letter-spacing: 0.02em;
    }
    #sophyia-site-header nav button:hover {
      color: ${COLOR};
    }
    .sophyia-nav-dropdown-wrap {
      position: static;
    }
    .sophyia-nav-dropdown {
      display: none; position: absolute; top: calc(100% + 1px); left: auto; margin-top: 0;
      background: rgba(0,0,0,0.35); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 0 0 10px 10px;
      overflow: hidden; min-width: 180px; z-index: 10000;
    }
    .sophyia-nav-dropdown-wrap.open .sophyia-nav-dropdown { display: block; }
    .sophyia-nav-sub {
      display: block; width: 100%; padding: 10px 18px; border: none; background: transparent;
      color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; text-align: left;
      transition: all 0.15s; white-space: nowrap;
    }
    .sophyia-nav-sub:hover { background: rgba(255,255,255,0.08); color: white; }
    #sophyia-site-header nav button.accent {
      color: white; background: ${COLOR}; font-weight: 500;
      border-radius: 24px; padding: 8px 20px; margin-left: 10px;
    }
    #sophyia-site-header nav button.accent:hover {
      opacity: 0.9;
    }
    .sophyia-lang-switcher {
      position: relative; margin-left: 8px;
    }
    .sophyia-lang-btn {
      padding: 6px 12px; border: 1px solid rgba(255,255,255,0.15); background: transparent;
      color: rgba(255,255,255,0.75); font-size: 13px; cursor: pointer;
      border-radius: 8px; transition: all 0.2s; font-weight: 400;
    }
    .sophyia-lang-btn:hover { color: white; border-color: rgba(255,255,255,0.3); }
    .sophyia-lang-dropdown {
      display: none; position: absolute; top: 100%; right: 0; margin-top: 6px;
      background: rgba(20,20,20,0.95); backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
      overflow: hidden; min-width: 60px; z-index: 100;
    }
    .sophyia-lang-switcher.open .sophyia-lang-dropdown { display: block; }
    .sophyia-lang-option {
      display: block; width: 100%; padding: 8px 16px; border: none; background: transparent;
      color: rgba(255,255,255,0.7); font-size: 13px; cursor: pointer; text-align: left;
      transition: all 0.15s;
    }
    .sophyia-lang-option:hover { background: rgba(255,255,255,0.08); color: white; }
    .sophyia-lang-option.active { color: ${COLOR}; font-weight: 500; }

    /* Spacer to push footer down (hero is now absolute) */
    #sophyia-site-hero {
      flex: 1; position: relative;
    }
    #sophyia-site-hero h1 {
      position: absolute; top: 24px; left: 32px;
      font-size: 20px; font-weight: 300; color: white;
      letter-spacing: 0.06em; text-transform: uppercase;
      text-shadow: 0 2px 12px rgba(0,0,0,0.7);
      max-width: 400px; text-align: left; line-height: 1.4;
      white-space: pre-line;
    }
    #sophyia-site-hero p { display: none; }

    /* Chat — starts compact bottom-right, expands to fullscreen */
    #sophyia-chat-window {
      position: fixed !important;
      bottom: 50px !important; right: 24px !important;
      top: auto !important; left: auto !important;
      width: 380px !important; height: 360px !important;
      max-width: none !important; max-height: none !important;
      border-radius: 16px !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: 0 8px 40px rgba(0,0,0,0.4) !important;
      display: flex !important; opacity: 1 !important; transform: none !important;
      background: rgba(20,20,20,0.55) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      z-index: 100;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    /* Expanded = taille de lecture (pilotee par admin: compact/moyen/grand) */
    #sophyia-chat-window.sophyia-expanded {
      height: calc(50vh) !important;
      width: 420px !important;
    }
    #sophyia-chat-window.sophyia-expanded.sophyia-size-small {
      height: calc(50vh) !important;
      width: 420px !important;
    }
    #sophyia-chat-window.sophyia-expanded.sophyia-size-medium {
      height: calc(65vh) !important;
      width: 480px !important;
    }
    #sophyia-chat-window.sophyia-expanded.sophyia-size-large {
      height: calc(80vh) !important;
      width: 540px !important;
    }
    #sophyia-chat-header {
      display: none !important;
    }
    .sophyia-size-bar {
      display: flex; align-items: center; justify-content: flex-end;
      padding: 6px 12px;
      background: rgba(20,20,20,0.6);
      border-top: 2px solid ${COLOR};
      border-bottom: 1px solid rgba(255,255,255,0.06);
      gap: 6px; flex-shrink: 0;
    }
    .sophyia-size-btn {
      display: inline-flex; align-items: flex-end; gap: 1px;
      padding: 4px 6px; border-radius: 4px; cursor: pointer;
      border: none; background: transparent;
      transition: background 0.2s;
    }
    .sophyia-size-btn:hover { background: rgba(255,255,255,0.1); }
    .sophyia-size-btn.active { background: rgba(255,255,255,0.15); }
    .sophyia-size-btn span {
      display: block; width: 4px; background: rgba(255,255,255,0.4);
      border-radius: 1px;
    }
    .sophyia-size-btn.active span { background: rgba(255,255,255,0.8); }
    #sophyia-chat-messages {
      padding: 16px 16px !important;
    }
    .sophyia-msg-bot {
      background: rgba(255,255,255,0.1) !important;
      color: rgba(255,255,255,0.95) !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      backdrop-filter: blur(12px) !important;
    }
    .sophyia-msg-bot .sophyia-heading,
    #sophyia-chat-window .sophyia-heading {
      color: white !important;
      font-weight: 800 !important;
      font-size: 16px !important;
      border-bottom: 1px solid rgba(255,255,255,0.40) !important;
      border-image: linear-gradient(to right, rgba(255,255,255,0.40) 60%, transparent 60%) 1 !important;
      padding-bottom: 5px !important;
      margin: 16px 0 8px !important;
      display: block !important;
    }
    .sophyia-msg-bot .sophyia-heading-lg,
    #sophyia-chat-window .sophyia-heading-lg {
      font-size: 18px !important;
    }
    .sophyia-msg-bot .sophyia-list li {
      line-height: 1.45 !important;
      margin-bottom: 2px !important;
    }
    .sophyia-msg-bot .sophyia-price { color: white !important; }
    .sophyia-msg-bot a { color: ${COLOR} !important; }
    .sophyia-msg-bot .sophyia-tel, .sophyia-msg-bot .sophyia-email { color: ${COLOR} !important; background: ${COLOR}20 !important; }
    .sophyia-msg-user {
      background: ${COLOR} !important;
      color: white !important;
    }
    #sophyia-chat-input-area {
      background: rgba(20,20,20,0.6) !important;
      border-top: 1px solid rgba(255,255,255,0.06) !important;
    }
    #sophyia-chat-input {
      background: rgba(255,255,255,0.08) !important;
      border-color: rgba(255,255,255,0.1) !important;
      color: white !important;
    }
    #sophyia-chat-input::placeholder { color: rgba(255,255,255,0.3) !important; }
    #sophyia-chat-footer { display: none !important; }

    /* Footer */
    #sophyia-site-footer {
      padding: 8px 36px;
      background: rgba(0,0,0,0.3);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0; z-index: 1; position: relative;
    }
    #sophyia-site-footer .left {
      color: rgba(255,255,255,0.35); font-size: 12px;
    }
    #sophyia-site-footer .right {
      color: rgba(255,255,255,0.35); font-size: 11px;
    }
    #sophyia-site-footer .right a {
      color: white; font-size: 11px; text-decoration: none; font-weight: 500;
    }
    #sophyia-site-footer .right a:hover { text-decoration: underline; }

    /* Mobile */
    @media (max-width: 640px) {
      #sophyia-site-header { padding: 6px 12px; }
      #sophyia-site-header .site-logo { height: 36px; }
      #sophyia-site-header nav button { padding: 4px 8px; font-size: 10px; }
      #sophyia-site-header nav button.accent { padding: 6px 12px; font-size: 10px; }
      #sophyia-site-hero h1 { top: 12px; left: 12px; font-size: 14px; max-width: 200px; }
      #sophyia-chat-window {
        width: calc(100% - 16px) !important; right: 8px !important;
        bottom: 44px !important; height: 260px !important;
        border-radius: 12px !important;
      }
      #sophyia-chat-window.sophyia-expanded {
        width: calc(100% - 16px) !important;
        height: 65vh !important;
        border-radius: 12px !important;
      }
      #sophyia-site-footer { padding: 6px 12px; }
    }
    ` : ''}

    /* Mode: sidebar */
    ${IS_SIDEBAR ? `
    #sophyia-chat-bubble { display: none !important; }
    #sophyia-chat-window {
      position: fixed !important;
      top: 0 !important; bottom: 0 !important;
      ${POSITION === "bottom-left" ? "left: 0 !important;" : "right: 0 !important;"}
      width: 420px !important; height: 100vh !important;
      max-width: 100vw !important; max-height: none !important;
      border-radius: 0 !important;
      border: none !important;
      border-${POSITION === "bottom-left" ? "right" : "left"}: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: -5px 0 30px rgba(0,0,0,0.3) !important;
      display: flex !important; opacity: 1 !important; transform: none !important;
    }
    ` : ''}

    /* Mode: embed */
    ${IS_EMBED ? `
    #sophyia-chat-bubble { display: none !important; }
    #sophyia-chat-widget {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
      overflow: hidden !important;
    }
    #sophyia-chat-window {
      position: relative !important;
      top: auto !important; bottom: auto !important;
      left: auto !important; right: auto !important;
      z-index: auto !important;
      width: 100% !important; height: 100% !important;
      max-width: none !important; max-height: none !important;
      border-radius: 24px !important;
      display: flex !important; flex-direction: column !important;
      opacity: 1 !important; transform: none !important;
      box-shadow: none !important;
      overflow: hidden !important;
      background: rgba(0,0,0,0.38) !important;
      backdrop-filter: blur(12px) !important;
      -webkit-backdrop-filter: blur(12px) !important;
      border: 1px solid rgba(255,255,255,0.30) !important;
    }
    #sophyia-chat-header { display: none !important; }
    #sophyia-quick-actions {
      padding: 12px 24px !important;
      display: flex !important; flex-direction: row !important; flex-wrap: wrap !important;
      gap: 8px !important; justify-content: center !important;
      border-bottom: none !important;
      flex-shrink: 0 !important;
      overflow: visible !important;
    }
    .sophyia-quick-row { display: contents !important; }
    .sophyia-quick-btn {
      font-size: 11px !important; padding: 5px 10px !important;
      border-radius: 6px !important; border: 1px solid rgba(255,255,255,0.30) !important;
      background: rgba(255,255,255,0.08) !important;
      color: rgba(255,255,255,0.85) !important;
      white-space: nowrap !important;
    }
    .sophyia-quick-btn:hover { color: white !important; }
    .sophyia-quick-btn.accent { display: none !important; }
    .sophyia-embed-book-btn {
      display: inline-flex !important; align-items: center !important;
      padding: 8px 14px !important;
      background: ${COLOR} !important; color: white !important;
      border: none !important; border-radius: 9999px !important;
      font-size: 12px !important; font-weight: 500 !important;
      cursor: pointer !important; white-space: nowrap !important;
    }
    .sophyia-embed-book-btn:hover { opacity: 0.9 !important; }
    .sophyia-nav-dropdown-wrap { position: relative !important; }
    .sophyia-nav-dropdown {
      display: none !important;
      position: absolute !important; top: calc(100% + 4px) !important; left: 0 !important;
      background: rgba(50,50,50,0.95) !important;
      backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important;
      border: 1px solid rgba(255,255,255,0.30) !important; border-radius: 8px !important;
      min-width: 150px !important; z-index: 100 !important;
      padding: 4px 0 !important; overflow: hidden !important;
    }
    .sophyia-nav-dropdown-wrap.open .sophyia-nav-dropdown { display: block !important; }
    .sophyia-nav-sub {
      display: block !important; width: 100% !important; padding: 7px 14px !important;
      font-size: 11px !important; color: rgba(255,255,255,0.85) !important;
      background: transparent !important; border: none !important;
      text-align: left !important; cursor: pointer !important;
    }
    .sophyia-nav-sub:not(:last-child)::after {
      content: '' !important; display: block !important;
      margin: 2px 14px 0 14px !important;
      border-bottom: 1px solid rgba(255,255,255,0.12) !important;
    }
    .sophyia-nav-sub:hover { color: white !important; font-weight: 700 !important; }
    @media (max-width: 768px) {
      #sophyia-quick-actions { padding: 8px 10px !important; gap: 4px !important; }
      .sophyia-quick-btn { font-size: 10px !important; padding: 4px 8px !important; }
      .sophyia-nav-dropdown { min-width: 140px !important; }
      .sophyia-nav-sub { padding: 10px 14px !important; font-size: 14px !important; }
      .sophyia-nav-dropdown { min-width: 180px !important; }
    }
    #sophyia-chat-window #sophyia-chat-messages {
      background: transparent !important;
      min-height: 0 !important;
    }
    #sophyia-chat-window .sophyia-msg-bot {
      background: rgba(255,255,255,0.08) !important;
      border: 1px solid rgba(255,255,255,0.25) !important;
      color: white !important;
    }
    #sophyia-chat-window .sophyia-msg-bot * {
      color: white !important;
    }
    #sophyia-chat-window .sophyia-msg-bot strong {
      font-weight: 700 !important;
      font-size: 1.05em !important;
    }
    #sophyia-chat-window .sophyia-msg-bot .sophyia-heading {
      color: white !important;
      font-weight: 800 !important;
      font-size: 16px !important;
      border-bottom: 1px solid rgba(255,255,255,0.40) !important;
      border-image: linear-gradient(to right, rgba(255,255,255,0.40) 60%, transparent 60%) 1 !important;
      padding-bottom: 5px !important;
      margin: 16px 0 8px !important;
      display: block !important;
    }
    #sophyia-chat-window .sophyia-msg-bot .sophyia-heading-lg {
      font-size: 18px !important;
    }
    #sophyia-chat-window .sophyia-msg-bot .sophyia-list li {
      line-height: 1.45 !important;
      margin-bottom: 2px !important;
    }
    #sophyia-chat-window .sophyia-msg-user {
      background: ${COLOR} !important;
      color: white !important;
      border: none !important;
    }
    #sophyia-chat-window #sophyia-chat-input-area {
      background: transparent !important;
      border-top: none !important;
      padding: 12px 20px !important;
    }
    #sophyia-chat-window #sophyia-chat-input {
      background: rgba(255,255,255,0.07) !important;
      border: 1px solid rgba(255,255,255,0.30) !important;
      color: white !important;
      padding-left: 20px !important;
    }
    #sophyia-chat-window #sophyia-chat-input::placeholder {
      color: rgba(255,255,255,0.3) !important;
    }
    #sophyia-chat-window #sophyia-chat-footer { display: none !important; }
    /* Embed bottom bar: Reserver + TheFork (mobile) + X (mobile fullscreen) */
    .sophyia-embed-bottom {
      display: flex !important; align-items: center !important; gap: 8px !important;
      padding: 4px 20px 12px !important; flex-shrink: 0 !important;
    }
    .sophyia-embed-thefork {
      display: none !important; /* hidden on desktop, shown on mobile */
      padding: 8px 14px !important; border-radius: 9999px !important;
      background: transparent !important; border: 1px solid rgba(255,255,255,0.30) !important;
      color: white !important; font-size: 12px !important; font-weight: 500 !important;
      cursor: pointer !important; text-decoration: none !important;
    }
    .sophyia-embed-exit {
      display: none !important;
      padding: 8px 14px !important; border-radius: 9999px !important;
      background: transparent !important; border: 1px solid rgba(255,255,255,0.30) !important;
      color: white !important; font-size: 12px !important; font-weight: 500 !important;
      cursor: pointer !important; white-space: nowrap !important;
    }
    /* Animation clic quick-menu */
    .sophyia-quick-btn.sophyia-flash {
      background: rgba(255,255,255,0.35) !important;
      transition: background 0.15s !important;
    }
    @media (max-width: 1023px) {
      .sophyia-embed-thefork { display: inline-block !important; }
      .sophyia-embed-exit { display: inline-flex !important; align-items: center !important; gap: 4px !important; }
      #sophyia-chat-widget {
        height: auto !important;
        min-height: 100% !important;
      }
      #sophyia-chat-window {
        height: auto !important;
        min-height: 100% !important;
        border-radius: 20px !important;
      }
      /* Texte courant +1px */
      #sophyia-chat-window .sophyia-msg,
      #sophyia-chat-window .sophyia-msg p,
      #sophyia-chat-window .sophyia-msg li,
      #sophyia-chat-window .sophyia-msg a,
      #sophyia-chat-window .sophyia-msg span,
      #sophyia-chat-window .sophyia-msg strong,
      #sophyia-chat-window .sophyia-msg .sophyia-price,
      #sophyia-chat-window .sophyia-msg .sophyia-heading,
      #sophyia-chat-window .sophyia-msg .sophyia-list li { font-size: 17px !important; line-height: 1.7 !important; font-weight: 450 !important; -webkit-font-smoothing: antialiased !important; }
      /* Override headings et listes — APRES le bloc generique pour gagner */
      #sophyia-chat-window .sophyia-msg-bot .sophyia-heading { font-weight: 800 !important; line-height: 1.3 !important; }
      #sophyia-chat-window .sophyia-msg-bot .sophyia-list li { line-height: 1.45 !important; margin-bottom: 2px !important; }
      #sophyia-chat-window .sophyia-msg-bot strong { font-weight: 700 !important; }
      #sophyia-chat-window .sophyia-msg p { margin-bottom: 10px !important; }
      #sophyia-chat-window .sophyia-msg br { display: block !important; margin-bottom: 6px !important; content: "" !important; }
      /* Input + placeholder */
      #sophyia-chat-window #sophyia-chat-input {
        font-size: 17px !important;
        padding: 12px 18px !important;
        min-height: 46px !important;
      }
      #sophyia-chat-window #sophyia-chat-input::placeholder {
        font-size: 17px !important;
        color: rgba(255,255,255,0.45) !important;
      }
      /* Quick-menus : confort tactile */
      .sophyia-quick-btn {
        font-size: 14px !important;
        padding: 10px 14px !important;
        color: rgba(255,255,255,0.95) !important;
      }
      /* Boutons bas : plus genereux */
      .sophyia-embed-book-btn,
      .sophyia-embed-thefork,
      .sophyia-embed-exit {
        font-size: 14px !important;
        padding: 10px 16px !important;
      }
      /* Quick-menus en bas sur mobile — avant l'input */
      #sophyia-quick-actions {
        order: 10 !important;
      }
      #sophyia-chat-messages {
        order: 1 !important;
      }
      #sophyia-chat-input-area {
        order: 11 !important;
      }
      .sophyia-embed-bottom {
        order: 12 !important;
        flex-wrap: wrap !important;
      }
      .sophyia-nav-dropdown {
        top: auto !important; bottom: calc(100% + 4px) !important;
      }
    }
    }
    ` : ''}

    /* Mode: lateral — panneau lateral retractable */
    ${IS_LATERAL ? `
    #sophyia-chat-bubble { display: none !important; }
    #sophyia-lateral-badge {
      position: fixed;
      ${POSITION === "bottom-left" || POSITION === "left" ? "left: 0" : "right: 0"};
      top: 50%;
      transform: translateY(-50%);
      background: ${COLOR};
      border: 2px solid white;
      color: white;
      writing-mode: vertical-rl;
      text-align: center;
      padding: 16px 12px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.4;
      cursor: pointer;
      ${POSITION === "bottom-left" || POSITION === "left" ? "border-radius: 0 10px 10px 0" : "border-radius: 10px 0 0 10px"};
      z-index: 999999;
      transition: all 0.3s ease;
    }
    #sophyia-lateral-badge:hover {
      padding: 16px 12px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.25);
    }
    #sophyia-chat-window {
      position: fixed !important;
      ${POSITION === "bottom-left" || POSITION === "left" ? "left: 0 !important" : "right: 0 !important"};
      ${POSITION === "bottom-left" || POSITION === "left" ? "right: auto !important" : "left: auto !important"};
      top: 50% !important;
      bottom: auto !important;
      transform: translateY(-50%) translateX(0) !important;
      width: 440px !important;
      max-width: calc(100vw - 20px) !important;
      height: 650px !important;
      max-height: calc(100vh - 40px) !important;
      ${POSITION === "bottom-left" || POSITION === "left" ? "border-radius: 0 20px 20px 0 !important" : "border-radius: 20px 0 0 20px !important"};
      transition: transform 0.3s ease, opacity 0.3s ease !important;
      box-shadow: 0 10px 50px rgba(0,0,0,0.5) !important;
      background: #1a1a1a !important;
      color: rgba(255,255,255,0.9) !important;
    }
    #sophyia-chat-window .sophyia-msg-bot {
      background: rgba(255,255,255,0.08) !important;
      color: rgba(255,255,255,0.9) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
    }
    #sophyia-chat-window .sophyia-msg-bot * { color: rgba(255,255,255,0.9) !important; }
    #sophyia-chat-window .sophyia-msg-bot .sophyia-heading { color: white !important; font-weight: 700 !important; }
    #sophyia-chat-window #sophyia-chat-input {
      background: rgba(255,255,255,0.07) !important;
      border: 1px solid rgba(255,255,255,0.15) !important;
      color: rgba(255,255,255,0.9) !important;
    }
    #sophyia-chat-window #sophyia-chat-input::placeholder { color: rgba(255,255,255,0.3) !important; }
    #sophyia-chat-window #sophyia-chat-messages { background: #1a1a1a !important; }
    #sophyia-chat-window #sophyia-chat-footer a { color: rgba(255,255,255,0.60) !important; }
    #sophyia-chat-window #sophyia-chat-footer span { font-size: 9px !important; }
    #sophyia-chat-window.sophyia-lateral-hidden {
      ${POSITION === "bottom-left" || POSITION === "left" ? "transform: translateY(-50%) translateX(-100%) !important" : "transform: translateY(-50%) translateX(100%) !important"};
      opacity: 0 !important;
      pointer-events: none !important;
    }
    @media (max-width: 480px) {
      #sophyia-chat-window {
        width: 100vw !important;
        height: 85vh !important;
        max-height: 85vh !important;
        top: 0 !important;
        transform: translateX(0) !important;
        border-radius: 0 0 16px 16px !important;
      }
      #sophyia-chat-window.sophyia-lateral-hidden {
        ${POSITION === "bottom-left" || POSITION === "left" ? "transform: translateX(-100%) !important" : "transform: translateX(100%) !important"};
      }
      #sophyia-lateral-badge {
        padding: 10px 5px;
        font-size: 11px;
      }
    }
    ` : ''}

    /* Header */
    #sophyia-chat-header {
      padding: 16px 20px;
      background: ${COLOR};
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    #sophyia-chat-header .avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: white; font-weight: bold;
    }
    #sophyia-chat-header .info h3 {
      color: white; font-size: 15px; font-weight: 600;
    }
    #sophyia-chat-header .info p {
      color: rgba(255,255,255,0.7); font-size: 12px;
    }
    #sophyia-chat-header .close-btn {
      margin-left: auto;
      background: rgba(255,255,255,0.15);
      border: none; cursor: pointer;
      width: 32px; height: 32px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 18px;
      transition: background 0.2s;
    }
    #sophyia-chat-header .close-btn:hover {
      background: rgba(255,255,255,0.25);
    }

    /* Quick actions — two rows */
    #sophyia-quick-actions {
      padding: 10px 16px;
      display: flex; flex-direction: column; gap: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    .sophyia-quick-row {
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .sophyia-quick-btn {
      padding: 6px 12px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: rgba(255,255,255,0.6);
      font-size: 13px; cursor: pointer;
      transition: color 0.2s;
      white-space: nowrap;
    }
    .sophyia-quick-btn + .sophyia-quick-btn::before {
      content: "|";
      margin-right: 12px;
      color: rgba(255,255,255,0.15);
      pointer-events: none;
    }
    .sophyia-quick-btn:hover {
      color: white;
    }
    .sophyia-quick-btn.accent {
      background: none;
      color: white;
      font-weight: 700;
      padding: 6px 12px;
    }
    .sophyia-quick-btn.accent:hover {
      color: ${COLOR};
    }

    /* Messages area */
    #sophyia-chat-messages {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    #sophyia-chat-messages::-webkit-scrollbar {
      width: 4px;
    }
    #sophyia-chat-messages::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
    }

    .sophyia-msg {
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.6;
      word-wrap: break-word;
      overflow-wrap: break-word;
      min-width: 0;
    }
    .sophyia-msg a {
      color: ${COLOR};
      text-decoration: underline;
    }
    .sophyia-msg p {
      margin: 4px 0;
    }
    .sophyia-heading {
      font-weight: 600;
      color: ${COLOR};
      font-size: 13px;
      letter-spacing: 0.02em;
      margin: 14px 0 8px;
      padding-bottom: 5px;
      border-bottom: 1px solid ${COLOR}33;
    }
    .sophyia-heading:first-child {
      margin-top: 0;
    }
    .sophyia-heading-lg {
      font-size: 14px;
    }
    .sophyia-list {
      list-style: none;
      padding: 0;
      margin: 4px 0 8px;
    }
    .sophyia-list li {
      padding: 4px 0;
      font-size: 13px;
      line-height: 1.5;
    }
    .sophyia-price {
      color: ${COLOR};
      font-weight: 600;
    }
    .sophyia-tel, .sophyia-email {
      color: ${COLOR} !important;
      text-decoration: none !important;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 6px;
      background: ${COLOR}15;
      transition: background 0.2s;
    }
    .sophyia-tel:hover, .sophyia-email:hover {
      background: ${COLOR}30;
    }
    .sophyia-msg-bot {
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.85);
      align-self: stretch !important;
      border-radius: 12px !important;
      padding: 20px 28px !important;
      max-width: 100% !important;
      box-sizing: border-box;
    }
    .sophyia-msg-user {
      background: ${COLOR};
      color: white;
      align-self: flex-end;
      max-width: 80%;
      border-bottom-right-radius: 4px !important;
      padding: 14px 24px !important;
    }
    .sophyia-resa-block {
      position: relative; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 14px 18px; margin: 10px 0; font-size: 13px; line-height: 1.6;
      white-space: pre-line;
    }
    .sophyia-resa-copy {
      position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 5px 7px;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
    }
    .sophyia-resa-copy:hover { background: ${COLOR}30; border-color: ${COLOR}50; }
    .sophyia-resa-copy svg { width: 14px; height: 14px; stroke: rgba(255,255,255,0.6); fill: none; stroke-width: 2; }
    .sophyia-resa-copy.copied svg { stroke: #4ade80; }
    .sophyia-msg-typing {
      display: flex; gap: 4px; padding: 14px 18px;
      align-self: flex-start;
      background: rgba(255,255,255,0.06);
      border-radius: 16px;
      border-bottom-left-radius: 4px;
    }
    .sophyia-msg-typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(255,255,255,0.3);
      animation: sophyia-typing 1.4s infinite both;
    }
    .sophyia-msg-typing span:nth-child(2) { animation-delay: 0.2s; }
    .sophyia-msg-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes sophyia-typing {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* Input area */
    #sophyia-chat-input-area {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex; gap: 8px; align-items: center;
      flex-shrink: 0;
    }
    #sophyia-chat-input {
      flex: 1;
      padding: 10px 16px;
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      color: white;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    #sophyia-chat-input::placeholder {
      color: rgba(255,255,255,0.3);
    }
    #sophyia-chat-input:focus {
      border-color: ${COLOR}88;
    }
    #sophyia-chat-send {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: ${COLOR};
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s, transform 0.2s;
      flex-shrink: 0;
    }
    #sophyia-chat-send:hover {
      background: ${ACCENT};
      transform: scale(1.05);
    }
    #sophyia-chat-send:disabled {
      opacity: 0.4; cursor: not-allowed;
      transform: none;
    }
    #sophyia-chat-send svg {
      width: 18px; height: 18px; fill: white;
    }

    /* Footer */
    #sophyia-chat-footer {
      padding: 6px 16px 10px;
      text-align: center;
      flex-shrink: 0;
    }
    #sophyia-chat-footer a {
      color: rgba(255,255,255,0.15);
      font-size: 10px;
      text-decoration: none;
      transition: color 0.2s;
    }
    #sophyia-chat-footer a:hover {
      color: rgba(255,255,255,0.3);
    }

    /* Mobile */
    @media (max-width: 480px) {
      #sophyia-chat-bubble {
        width: 52px; height: 52px;
        bottom: 16px;
        ${POSITION === "bottom-left" ? "left: 16px" : "right: 16px"};
      }
      #sophyia-chat-bubble svg {
        width: 24px; height: 24px;
      }
      #sophyia-chat-window {
        width: 100vw;
        height: calc(100vh - 60px);
        bottom: 0;
        left: 0;
        right: 0;
        border-radius: 20px 20px 0 0;
        max-height: none;
        max-width: none;
      }
      #sophyia-chat-header {
        padding: 14px 16px;
      }
      #sophyia-chat-header .info h3 {
        font-size: 14px;
      }
      #sophyia-quick-actions {
        padding: 10px 12px;
        gap: 6px;
      }
      .sophyia-quick-btn {
        padding: 5px 12px;
        font-size: 11px;
      }
      .sophyia-msg {
        max-width: 90%;
        font-size: 13px;
      }
      .sophyia-heading {
        font-size: 12px;
      }
      .sophyia-list li {
        font-size: 12px;
      }
      #sophyia-chat-input {
        font-size: 16px;
      }
    }

    @media (max-width: 380px) {
      #sophyia-chat-window {
        height: 100vh;
        border-radius: 0;
      }
    }

    /* RTL — Hebrew. Bascule conditionnelle pilotee par USER_LANG. Le widget
       pose dir="rtl" / dir="ltr" sur #sophyia-chat-window apres detection.
       On retourne le sens du texte, l'alignement des bulles et l'icone send. */
    #sophyia-chat-window[dir="rtl"] .sophyia-msg-user {
      align-self: flex-start;
      border-bottom-right-radius: 16px !important;
      border-bottom-left-radius: 4px !important;
    }
    #sophyia-chat-window[dir="rtl"] .sophyia-msg-typing {
      align-self: flex-end;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 4px;
    }
    #sophyia-chat-window[dir="rtl"] #sophyia-chat-send svg {
      transform: scaleX(-1);
    }
    #sophyia-chat-window[dir="rtl"] .sophyia-msg,
    #sophyia-chat-window[dir="rtl"] #sophyia-chat-input {
      text-align: right;
    }

    /* ── Volet B — RGPD by design : bouton terminer + disclaimer + warning + CTA ── */
    /* Bouton "Terminer la conversation" dans le header (à côté du close X) */
    #sophyia-chat-header .sophyia-end-btn {
      background: transparent; border: 1px solid rgba(255,255,255,0.22);
      color: rgba(255,255,255,0.7); font-size: 11px;
      padding: 4px 10px; border-radius: 12px; cursor: pointer;
      margin-right: 8px; transition: all 0.15s;
      white-space: nowrap;
    }
    #sophyia-chat-header .sophyia-end-btn:hover {
      background: rgba(255,255,255,0.1); color: white;
      border-color: rgba(255,255,255,0.4);
    }

    /* Disclaimer statique au pied du chat (sous l'input) */
    .sophyia-privacy-note {
      font-size: 10px;
      color: rgba(255,255,255,0.35);
      text-align: center;
      padding: 6px 16px 8px;
      font-style: italic;
      line-height: 1.4;
    }

    /* Bloc d'avertissement inactivité (apparait dans messages) */
    .sophyia-warning-block {
      align-self: stretch;
      background: rgba(255, 220, 100, 0.08);
      border: 1px solid rgba(255, 220, 100, 0.25);
      border-radius: 12px;
      padding: 14px 18px;
      color: rgba(255, 240, 200, 0.95);
      font-size: 13px;
      line-height: 1.5;
    }
    .sophyia-warning-block .sophyia-countdown {
      font-weight: 700;
      color: rgba(255, 240, 200, 1);
      font-size: 16px;
      margin: 0 4px;
    }

    /* Bouton CTA "Finaliser ma demande" (après interception [BOOK_PREFILL]) */
    .sophyia-book-cta {
      display: inline-block;
      margin-top: 12px;
      padding: 10px 18px;
      background: ${COLOR};
      color: white !important;
      text-decoration: none !important;
      border-radius: 24px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
      border: none;
    }
    .sophyia-book-cta:hover {
      background: ${ACCENT};
      transform: translateY(-1px);
      box-shadow: 0 4px 14px ${COLOR}33;
    }

    /* Fadeout fermeture gracieuse */
    #sophyia-chat-window.sophyia-closing {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: opacity 500ms ease, transform 500ms ease;
    }

    /* Bloc poème (Olivia composition originale) — italique, encadré ton-sur-ton.
       Logical properties : la barre terracotta est à GAUCHE en LTR et à DROITE
       en RTL (hébreu), avec respiration entre la barre et le texte. */
    .sophyia-poem {
      margin-top: 14px;
      padding-block: 16px;
      padding-inline-start: 28px;
      padding-inline-end: 20px;
      background: rgba(255, 248, 230, 0.06);
      border-inline-start: 2px solid ${COLOR};
      border-radius: 8px;
      font-style: italic;
      line-height: 1.65;
    }
    .sophyia-poem-body {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.92);
      white-space: pre-line;
    }
    .sophyia-poem-sig {
      margin-top: 12px;
      font-style: normal;
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.45);
      text-align: right;
    }
  `;
  document.head.appendChild(styles);

  // ── DOM ────────────────────────────────────────────────────────────────────
  const container = document.createElement("div");
  container.id = "sophyia-chat-widget";
  container.innerHTML = `
    <button id="sophyia-chat-bubble" aria-label="${t.open_chat}">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>
      <div class="badge"></div>
    </button>

    <div id="sophyia-chat-window" dir="${USER_LANG === 'he' ? 'rtl' : 'ltr'}">
      <div id="sophyia-chat-header">
        <div class="avatar"></div>
        <div class="info">
          <h3></h3>
          <p>${t.online}</p>
        </div>
        <button class="sophyia-end-btn" aria-label="${t.end_conversation}" title="${t.end_conversation}">${t.end_conversation}</button>
        <button class="close-btn" aria-label="${t.close}">×</button>
      </div>

      <div id="sophyia-quick-actions" style="display:none"></div>

      <div id="sophyia-chat-messages"></div>

      <div id="sophyia-chat-input-area">
        <input id="sophyia-chat-input" type="text" name="sophyia-chat-message" placeholder="${t.placeholder}" autocomplete="new-password" autocorrect="off" autocapitalize="sentences" spellcheck="true" inputmode="text" enterkeyhint="send" data-form-type="other" />
        <button id="sophyia-chat-send" aria-label="${t.send}">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>

      <div class="sophyia-privacy-note">${t.privacy_note}</div>

      <div id="sophyia-chat-footer">
        <a href="https://sophyia.io" target="_blank" rel="noopener">Sophyia.io</a><span style="font-size:10px"> and </span><a href="https://raoulbaudlez.com" target="_blank" rel="noopener">Raoul Baudlez</a>
      </div>
    </div>
  `;
  // Fullpage mode: wrap in site layout
  if (IS_FULLPAGE) {
    const siteWrapper = document.createElement("div");
    siteWrapper.id = "sophyia-site-wrapper";
    siteWrapper.innerHTML = `
      <header id="sophyia-site-header">
        ${SITE_LOGO ? `<img src="${SITE_LOGO}" class="site-logo" alt="" />` : ''}
        <div class="site-name">${SITE_NAME || BOT_ID}</div>
        <nav>
          <span id="sophyia-nav-buttons" style="display:contents"></span>
          <button class="sophyia-site-nav accent" data-msg="${BOOK_PROMPTS[USER_LANG]}">${t.book}</button>
          <div class="sophyia-lang-switcher">
            <button class="sophyia-lang-btn">${USER_LANG.toUpperCase()} ▾</button>
            <div class="sophyia-lang-dropdown">
              ${SUPPORTED_LANGS.map(l => `<button class="sophyia-lang-option${l === USER_LANG ? ' active' : ''}" data-lang="${l}">${l.toUpperCase()}</button>`).join('')}
            </div>
          </div>
        </nav>
      </header>
      <div id="sophyia-site-hero">
        <h1>${SITE_TAGLINE || t.welcome}</h1>
      </div>
    `;
    // Move the chat window inside the site wrapper
    const chatWindow = container.querySelector("#sophyia-chat-window");
    // Hide the built-in quick actions in fullpage (nav is in the header)
    const quickActions = chatWindow.querySelector("#sophyia-quick-actions");
    if (quickActions) quickActions.style.display = "none";
    // Hide built-in footer (site has its own)
    const chatFooter = chatWindow.querySelector("#sophyia-chat-footer");
    if (chatFooter) chatFooter.style.display = "none";

    // Size bar — 3 squares for visitor to resize
    const sizeBar = document.createElement("div");
    sizeBar.className = "sophyia-size-bar";
    sizeBar.innerHTML = `
      <button class="sophyia-size-btn active" data-size="small" aria-label="${t.small}"><span style="height:8px"></span></button>
      <button class="sophyia-size-btn" data-size="medium" aria-label="${t.medium}"><span style="height:12px"></span></button>
      <button class="sophyia-size-btn" data-size="large" aria-label="${t.large}"><span style="height:16px"></span></button>
    `;
    const messagesEl2 = chatWindow.querySelector("#sophyia-chat-messages");
    chatWindow.insertBefore(sizeBar, messagesEl2);

    siteWrapper.appendChild(chatWindow);
    // Site footer
    const siteFooter = document.createElement("footer");
    siteFooter.id = "sophyia-site-footer";
    siteFooter.innerHTML = `
      <div class="left">${SITE_ADDRESS ? SITE_ADDRESS : ''}${SITE_PHONE ? ' — ' + SITE_PHONE : ''}</div>
      <div class="right">${t.powered} <a href="https://sophyia.io" target="_blank" rel="noopener">Sophyia</a> & <a href="https://raoulbaudlez.com" target="_blank" rel="noopener">Raoul Baudlez</a></div>
    `;
    siteWrapper.appendChild(siteFooter);
    document.body.appendChild(siteWrapper);
  } else if (IS_EMBED && TARGET) {
    const targetEl = document.getElementById(TARGET);
    if (targetEl) { targetEl.appendChild(container); } else { document.body.appendChild(container); }
  } else if (IS_LATERAL) {
    document.body.appendChild(container);
    // Create lateral badge (retracted tab)
    const lateralBadge = document.createElement("div");
    lateralBadge.id = "sophyia-lateral-badge";
    lateralBadge.textContent = "..."; // placeholder, replaced by bot name from settings
    document.body.appendChild(lateralBadge);
    // Note: window_ initial state (hidden) is set after const declarations below
    // to avoid TDZ ReferenceError.
  } else {
    document.body.appendChild(container);
  }

  // Non-bubble modes: init is done after DOM elements are ready (see below)

  // ── Elements ──────────────────────────────────────────────────────────────
  const bubble = document.getElementById("sophyia-chat-bubble");
  const window_ = document.getElementById("sophyia-chat-window");
  const closeBtn = window_ ? window_.querySelector(".close-btn") : null;
  const endBtn = window_ ? window_.querySelector(".sophyia-end-btn") : null;
  const messagesEl = document.getElementById("sophyia-chat-messages");
  const inputEl = document.getElementById("sophyia-chat-input");
  const sendBtn = document.getElementById("sophyia-chat-send");
  // quickBtns are generated dynamically by get_public_settings

  // Lateral mode: set initial hidden state (auto-open happens ~100ms later)
  if (IS_LATERAL && window_) {
    window_.style.display = "flex";
    window_.classList.add("sophyia-lateral-hidden");
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function _escHtml(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function mdToHtml(text) {
    // Escape HTML entities first to prevent XSS, then parse markdown
    text = _escHtml(text);
    const lines = text.split("\n");
    let html = "";
    let inList = false;
    for (const line of lines) {
      const s = line.trim();
      if (!s) {
        if (inList) { html += "</ul>"; inList = false; }
        html += "<br>";
        continue;
      }
      if (s.startsWith("#### ")) {
        if (inList) { html += "</ul>"; inList = false; }
        let h = s.slice(5).replace(/ — /g, ' <span class="sophyia-price">— ') + (s.includes(" — ") ? "</span>" : "");
        html += '<div class="sophyia-heading">' + h + "</div>";
      } else if (s.startsWith("### ")) {
        if (inList) { html += "</ul>"; inList = false; }
        let h = s.slice(4).replace(/ — /g, ' <span class="sophyia-price">— ') + (s.includes(" — ") ? "</span>" : "");
        html += '<div class="sophyia-heading">' + h + "</div>";
      } else if (s.startsWith("## ")) {
        if (inList) { html += "</ul>"; inList = false; }
        let h = s.slice(3).replace(/ — /g, ' <span class="sophyia-price">— ') + (s.includes(" — ") ? "</span>" : "");
        html += '<div class="sophyia-heading sophyia-heading-lg">' + h + "</div>";
      } else if (s.startsWith("- ") || s.startsWith("* ")) {
        if (!inList) { html += '<ul class="sophyia-list">'; inList = true; }
        let item = s.slice(2);
        item = item.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        // Separate name and price with em dash
        item = item.replace(/ — /g, ' <span class="sophyia-price">— ') + (item.includes(" — ") ? "</span>" : "");
        html += "<li>" + item + "</li>";
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        let p = s;
        p = p.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        p = p.replace(/\[(.+?)\]\((.+?)\)/g, function(_, label, url) {
          if (/^(https?:|mailto:|tel:)/i.test(url)) return '<a href="' + url + '" target="_blank" rel="noopener">' + label + '</a>';
          return label;
        });
        html += "<p>" + p + "</p>";
      }
    }
    if (inList) html += "</ul>";
    // Phone numbers → clickable tel: links
    html = html.replace(/(\+41[\s.]?\d{2}[\s.]?\d{3}[\s.]?\d{2}[\s.]?\d{2})/g, '<a href="tel:$1" class="sophyia-tel">$1</a>');
    html = html.replace(/(0\d{2}[\s.]\d{3}[\s.]\d{2}[\s.]\d{2})/g, '<a href="tel:$1" class="sophyia-tel">$1</a>');
    // Email → clickable mailto: links
    html = html.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" class="sophyia-email">$1</a>');
    return html;
  }

  // ── Volet B — Inactivity timer + gracious close + BOOK_PREFILL ──
  // Timer 4 min (configurable data-inactivity-ms) → warning + countdown 30s
  // (configurable data-countdown-seconds) → fermeture gracieuse + reset state.
  // Tout geste utilisateur dans la fenêtre chat → reset timer + annule countdown.

  function _resetInactivityTimer() {
    if (!isOpen) return;
    if (_inactivityTimer) { clearTimeout(_inactivityTimer); _inactivityTimer = null; }
    if (_countdownTimer) {
      clearInterval(_countdownTimer);
      _countdownTimer = null;
      if (_warningEl) { _warningEl.remove(); _warningEl = null; }
    }
    _inactivityTimer = setTimeout(_triggerInactivityWarning, INACTIVITY_MS);
  }

  function _stopInactivityTimer() {
    if (_inactivityTimer) { clearTimeout(_inactivityTimer); _inactivityTimer = null; }
    if (_countdownTimer) { clearInterval(_countdownTimer); _countdownTimer = null; }
    if (_warningEl) { _warningEl.remove(); _warningEl = null; }
  }

  function _triggerInactivityWarning() {
    if (!isOpen) return;
    _countdownSecondsLeft = COUNTDOWN_SEC;
    const div = document.createElement("div");
    div.className = "sophyia-warning-block";
    div.innerHTML = t.inactivity_warning + ' <span class="sophyia-countdown">' + _countdownSecondsLeft + '</span>' + t.seconds_short + '.';
    messagesEl.appendChild(div);
    div.scrollIntoView({ behavior: "smooth", block: "end" });
    _warningEl = div;
    _countdownTimer = setInterval(() => {
      _countdownSecondsLeft -= 1;
      if (_countdownSecondsLeft <= 0) {
        clearInterval(_countdownTimer);
        _countdownTimer = null;
        _closeConversation(true);
        return;
      }
      const countEl = _warningEl && _warningEl.querySelector(".sophyia-countdown");
      if (countEl) countEl.textContent = _countdownSecondsLeft;
    }, 1000);
  }

  function _closeConversation(graceful) {
    _stopInactivityTimer();
    const win = document.getElementById("sophyia-chat-window");
    if (graceful && messagesEl) {
      // Message goodbye statique (pas LLM) avant fadeout
      const div = document.createElement("div");
      div.className = "sophyia-msg sophyia-msg-bot";
      div.textContent = t.goodbye;
      messagesEl.appendChild(div);
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    if (win) win.classList.add("sophyia-closing");
    setTimeout(() => {
      isOpen = false;
      history = [];
      welcomeShown = false;
      _userEngaged = false;
      _welcomeReplaced = false;
      _lastPrefixedLang = USER_LANG;
      if (messagesEl) messagesEl.innerHTML = "";
      if (win) {
        win.classList.remove("open", "sophyia-closing");
      }
    }, 500);
  }

  // Parser/intercepteur balise [POEM lang="xx" theme="..."]...[/POEM]
  // Olivia émet ses poèmes dans cette balise. Le widget les rend avec un styling
  // distinct (italique, encadré crème, signature © Villa Olive You en bas).
  // Format strict :
  //   [POEM lang="fr" theme="oliviers"]
  //   Sous les oliviers, la lumière dort.
  //   ...
  //   [/POEM]
  function _parsePoem(text) {
    const m = text.match(/\[POEM([^\]]*)\]([\s\S]*?)\[\/POEM\]/i);
    if (!m) return null;
    const attrs = {};
    const attrRe = /(\w+)\s*=\s*"([^"]*)"/g;
    let am;
    while ((am = attrRe.exec(m[1])) !== null) {
      attrs[am[1].toLowerCase()] = am[2];
    }
    let body = (m[2] || "").trim();
    // Strip [LANG:xx] [RUBRIQUE] possibles à l'intérieur
    body = body.replace(/^\[LANG:\w+\]\s*/i, "").replace(/^\[RUBRIQUE\]\s*/i, "");
    // Garde-fou taille (4-6 vers attendus, max 1500 chars)
    body = body.slice(0, 1500);
    return {
      raw: m[0],
      body,
      lang: attrs.lang || USER_LANG,
      theme: attrs.theme || "",
    };
  }

  // Parser/intercepteur balise [BOOK_PREFILL arrival="..." departure="..." people="..." message="..."]
  // Validation stricte. Fallback (parse-failed ou validation-failed) → bouton "Aller au formulaire" nu.
  function _parseBookPrefill(text) {
    const m = text.match(/\[BOOK_PREFILL([^\]]*)\]\s*\[\/BOOK_PREFILL\]/i);
    if (!m) return null;
    const attrs = {};
    const attrRe = /(\w+)\s*=\s*"([^"]*)"/g;
    let am;
    while ((am = attrRe.exec(m[1])) !== null) {
      attrs[am[1].toLowerCase()] = am[2];
    }
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    const arrival = attrs.arrival && ISO_DATE.test(attrs.arrival) ? attrs.arrival : "";
    const departure = attrs.departure && ISO_DATE.test(attrs.departure) ? attrs.departure : "";
    let people = "";
    if (attrs.people) {
      const n = parseInt(attrs.people, 10);
      if (!isNaN(n) && n >= 1 && n <= 20) people = String(n);
    }
    const message = (attrs.message || "").slice(0, 2000);
    if (arrival && departure && departure < arrival) {
      // Dates invalides logique → fallback
      return { valid: false, raw: m[0], arrival: "", departure: "", people: "", message: "" };
    }
    const hasMinimum = !!(arrival && departure && people);
    return {
      valid: hasMinimum,
      raw: m[0],
      arrival, departure, people, message,
    };
  }

  // Ajuste le salut initial du welcome selon l'heure locale du visiteur.
  // Le welcome tenant est stocké avec un salut figé (« Bonsoir... ») — cette
  // fonction remplace UNIQUEMENT le premier mot si le welcome commence par
  // un salut connu. Si le welcome ne commence pas par un salut (ex.
  // « Bienvenue... » de La Gare), il est renvoyé tel quel.
  function _adjustGreetingByHour(text, lang) {
    if (!text || typeof text !== "string") return text;
    const h = new Date().getHours();
    const morning = h < 12, afternoon = h >= 12 && h < 18, evening = !morning && !afternoon;
    const RULES = {
      fr: { match: /^\s*(Bonjour|Bonsoir|Bonne\s?nuit)\b/i, pick: (h < 18 ? "Bonjour" : "Bonsoir") },
      en: { match: /^\s*(Good\s+morning|Good\s+afternoon|Good\s+evening|Good\s+day)\b/i, pick: (morning ? "Good morning" : (afternoon ? "Good afternoon" : "Good evening")) },
      nl: { match: /^\s*(Goedemorgen|Goedemiddag|Goedenavond)\b/i, pick: (morning ? "Goedemorgen" : (afternoon ? "Goedemiddag" : "Goedenavond")) },
      de: { match: /^\s*(Guten\s+Morgen|Guten\s+Tag|Guten\s+Abend)\b/i, pick: (morning ? "Guten Morgen" : (afternoon ? "Guten Tag" : "Guten Abend")) },
      it: { match: /^\s*(Buongiorno|Buonasera|Buonanotte)\b/i, pick: (h < 18 ? "Buongiorno" : "Buonasera") },
      he: { match: /^\s*(בוקר\s+טוב|צהריים\s+טובים|ערב\s+טוב)\b/, pick: (morning ? "בוקר טוב" : (afternoon ? "צהריים טובים" : "ערב טוב")) },
      ru: { match: /^\s*(Доброе\s+утро|Добрый\s+день|Добрый\s+вечер)\b/i, pick: (morning ? "Доброе утро" : (afternoon ? "Добрый день" : "Добрый вечер")) },
    };
    const rule = RULES[lang];
    if (!rule) return text;
    return text.replace(rule.match, rule.pick);
  }

  // Crée ou met à jour la PREMIÈRE bulle bot (zone welcome).
  // Quand SKIP_DEFAULT_WELCOME est actif, aucune bulle n'est créée au boot ;
  // les fetches (settings + generate_welcome) doivent donc CRÉER la bulle si
  // absente. Pas de push history — c'est juste l'affichage initial.
  function _ensureFirstBotMessage(content, useHtml) {
    if (!messagesEl) return;
    let firstMsg = document.querySelector(".sophyia-msg-bot");
    if (!firstMsg) {
      firstMsg = document.createElement("div");
      firstMsg.className = "sophyia-msg sophyia-msg-bot";
      messagesEl.appendChild(firstMsg);
    }
    if (useHtml) firstMsg.innerHTML = content;
    else firstMsg.textContent = content;
  }

  function _buildBookingUrl(prefill) {
    const params = [];
    if (prefill.arrival) params.push("arrival=" + encodeURIComponent(prefill.arrival));
    if (prefill.departure) params.push("departure=" + encodeURIComponent(prefill.departure));
    if (prefill.people) params.push("people=" + encodeURIComponent(prefill.people));
    if (prefill.message) params.push("message=" + encodeURIComponent(prefill.message));
    return BOOKING_URL + (params.length ? "?" + params.join("&") : "");
  }

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = `sophyia-msg sophyia-msg-${role}`;
    // Hide [RUBRIQUE] prefix from user messages
    let displayText = text.replace(/^\[LANG:\w+\]\s*/i, "").replace(/^\[RUBRIQUE\]\s*/i, "");

    // Intercept [POEM] côté bot — retire la balise, ajoute un bloc poème stylé
    let poemBlock = null;
    if (role === "bot") {
      const poem = _parsePoem(displayText);
      if (poem) {
        displayText = displayText.replace(poem.raw, "").trim();
        const safeBody = _escHtml(poem.body).replace(/\n/g, "<br>");
        const year = new Date().getFullYear();
        const dirAttr = poem.lang === "he" ? ' dir="rtl"' : '';
        poemBlock = '<div class="sophyia-poem"' + dirAttr + '>' +
          '<div class="sophyia-poem-body">' + safeBody + '</div>' +
          '<div class="sophyia-poem-sig">© Villa Olive You ' + year + '</div>' +
          '</div>';
      }
    }
    // Intercept [BOOK_PREFILL] côté bot — retire la balise du texte, ajoute bouton CTA
    let bookCta = null;
    if (role === "bot") {
      const prefill = _parseBookPrefill(displayText);
      if (prefill) {
        displayText = displayText.replace(prefill.raw, "").trim();
        const url = prefill.valid ? _buildBookingUrl(prefill) : BOOKING_URL;
        const label = prefill.valid ? t.finalize_request : t.go_to_form;
        // Construire bouton CTA (sera ajouté après le rendu)
        bookCta = '<a class="sophyia-book-cta" href="' + url + '">' + label + '</a>';
      }
    }
    // Detect [RESA]...[/RESA] block and render with copy button
    if (role === "bot" && displayText.includes("[RESA]")) {
      displayText = displayText.replace(/\[RESA\]([\s\S]*?)\[\/RESA\]/g, function(_, content) {
        const cleanContent = _escHtml(content.trim());
        const escapedContent = cleanContent.replace(/'/g, "\\'").replace(/\n/g, "\\n");
        return '<div class="sophyia-resa-block"><div class="sophyia-resa-copy" onclick="(function(btn){navigator.clipboard.writeText(\'' + escapedContent + '\');btn.classList.add(\'copied\');setTimeout(function(){btn.classList.remove(\'copied\')},2000)})(this)" title="Copier"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></div>' + cleanContent + '</div>';
      });
    }
    div.innerHTML = role === "bot" ? mdToHtml(displayText) : displayText.replace(/</g, "&lt;");
    if (poemBlock) div.innerHTML += poemBlock;
    if (bookCta) div.innerHTML += bookCta;
    messagesEl.appendChild(div);
    // Bot responses: scroll to top of the new message. User messages: scroll to bottom.
    if (role === "bot") {
      if (IS_EMBED) {
        messagesEl.scrollTop = div.offsetTop - messagesEl.offsetTop;
      } else {
        div.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    if (role === "user" || role === "bot") {
      history.push({ role: role === "bot" ? "assistant" : "user", content: text });
    }
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "sophyia-msg-typing";
    div.id = "sophyia-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById("sophyia-typing");
    if (el) el.remove();
  }

  async function sendMessage(text) {
    if (!text.trim() || isLoading) return;

    _userEngaged = true;  // fige le welcome — pas de remplacement apres engagement
    _cancelAutoClose();   // engagement réel → on n'auto-ferme plus
    _resetInactivityTimer();  // tout sendMessage = activité visiteur, ré-arme le timer
    addMessage("user", text);
    inputEl.value = "";
    sendBtn.disabled = true;
    isLoading = true;
    showTyping();

    // Impulsion langue : on prefixe [LANG:xx] uniquement si la langue du site
    // a change depuis le dernier message effectivement prefixe. Sinon on laisse
    // le LLM detecter la langue naturelle de ce que l'utilisateur tape.
    // Si le caller a deja prefixe (quick actions), on ne prefixe pas une deuxieme
    // fois mais on synchronise _lastPrefixedLang quand meme.
    let payloadMessage = text;
    const alreadyPrefixed = /^\[LANG:[a-z]{2}\]\s/.test(text);
    if (alreadyPrefixed) {
      _lastPrefixedLang = USER_LANG;
    } else if (USER_LANG !== _lastPrefixedLang) {
      payloadMessage = `[LANG:${USER_LANG}] ${text}`;
      _lastPrefixedLang = USER_LANG;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_id: BOT_ID,
          message: payloadMessage,
          history: history.slice(-10),
        }),
      });

      hideTyping();

      if (!res.ok) {
        addMessage("bot", t.error);
        return;
      }

      const data = await res.json();
      addMessage("bot", data.reply);
    } catch (err) {
      hideTyping();
      console.error("[Sophyia Chat] Error:", err);
      addMessage("bot", t.error);
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // ── Events ────────────────────────────────────────────────────────────────
  if (bubble) bubble.addEventListener("click", () => {
    // Si user clique avant l'auto-open : annule l'auto-open programmé
    if (_autoOpenTimer) { clearTimeout(_autoOpenTimer); _autoOpenTimer = null; }
    isOpen = !isOpen;
    if (isOpen) {
      // Fix animation d'ouverture : le browser ne sait pas transitionner
      // FROM display:none — il faut d'abord peindre l'élément en état initial
      // (display:flex + opacity:0 + transform initial), PUIS ajouter .open pour
      // que la transition démarre depuis un état visible.
      window_.style.display = "flex";
      // Force reflow : le browser rend l'état initial (opacity:0) sur cette frame,
      // puis on ajoute .open sur la frame suivante pour déclencher la transition.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => window_.classList.add("open"));
      });
      if (bubble) bubble.querySelector(".badge").style.display = "none";
      if (!welcomeShown) {
        welcomeShown = true;
        // SKIP_DEFAULT_WELCOME : pour les tenants avec welcome LLM dynamique
        // (Olivia), on n'affiche pas le default neutre — évite la transition
        // visuelle vers le welcome final.
        if (!SKIP_DEFAULT_WELCOME) {
          const defaultWelcome = { fr: "Bonjour ! Comment puis-je vous aider ?", en: "Hello! How can I help you?", de: "Hallo! Wie kann ich Ihnen helfen?", it: "Ciao! Come posso aiutarvi?", ru: "Здравствуйте! Чем могу помочь?", nl: "Hallo! Hoe kan ik u helpen?", he: "שלום! איך אוכל לעזור?" };
          addMessage("bot", defaultWelcome[USER_LANG] || defaultWelcome.fr);
        }
      }
      _resetInactivityTimer();
      inputEl.focus();
    } else {
      window_.classList.remove("open");
      setTimeout(() => { window_.style.display = "none"; }, OPEN_DURATION_MS);
      _stopInactivityTimer();
    }
  });

  if (closeBtn && !IS_LATERAL) closeBtn.addEventListener("click", () => {
    isOpen = false;
    window_.classList.remove("open");
    setTimeout(() => { window_.style.display = "none"; }, 300);
    _stopInactivityTimer();
  });

  // Bouton "Terminer la conversation" : reset complet + fermeture gracieuse sans goodbye
  if (endBtn) endBtn.addEventListener("click", () => {
    _closeConversation(false);
  });

  // Reset inactivity timer + cancel auto-close sur tout geste utilisateur dans la fenêtre
  if (window_) {
    ["input", "click", "keydown", "scroll"].forEach(evt => {
      window_.addEventListener(evt, () => {
        if (!isOpen) return;
        _cancelAutoClose();  // interaction → on n'auto-ferme plus
        _resetInactivityTimer();
      }, { passive: true, capture: true });
    });
  }

  sendBtn.addEventListener("click", () => { expandChat(); sendMessage(inputEl.value); });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      expandChat();
      sendMessage(inputEl.value);
    }
  });

  // Block paste of images/files/HTML
  inputEl.addEventListener("paste", (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    if (text) {
      // Only allow plain text, strip anything suspicious
      const clean = text.replace(/<[^>]*>/g, "").replace(/data:[a-z]+\/[a-z]+;base64,/gi, "").slice(0, 500);
      document.execCommand("insertText", false, clean);
    }
  });

  // Block drag & drop
  inputEl.addEventListener("drop", (e) => {
    e.preventDefault();
  });
  inputEl.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  // Quick-action click handlers are attached dynamically in get_public_settings

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen && (IS_BUBBLE || IS_LATERAL)) {
      if (IS_LATERAL) { lateralRetract(); } else { closeBtn.click(); }
    }
  });

  // ── Lateral mode: open/retract logic ────────────────────────────────────
  let _lateralAutoOpened = false;
  const lateralBadgeEl = IS_LATERAL ? document.getElementById("sophyia-lateral-badge") : null;

  function lateralOpen() {
    if (!IS_LATERAL || !window_) return;
    isOpen = true;
    window_.classList.remove("sophyia-lateral-hidden");
    window_.classList.add("open");
    if (lateralBadgeEl) lateralBadgeEl.style.display = "none";
    if (!welcomeShown) {
      welcomeShown = true;
      if (!SKIP_DEFAULT_WELCOME) {
        const defaultWelcome = { fr: "Bonjour ! Comment puis-je vous aider ?", en: "Hello! How can I help you?", de: "Hallo! Wie kann ich Ihnen helfen?", it: "Ciao! Come posso aiutarvi?", ru: "Здравствуйте! Чем могу помочь?", nl: "Hallo! Hoe kan ik u helpen?", he: "שלום! איך אוכל לעזור?" };
        addMessage("bot", defaultWelcome[USER_LANG] || defaultWelcome.fr);
      }
    }
    inputEl.focus();
  }

  function lateralRetract() {
    if (!IS_LATERAL || !window_) return;
    isOpen = false;
    window_.classList.add("sophyia-lateral-hidden");
    window_.classList.remove("open");
    if (lateralBadgeEl) lateralBadgeEl.style.display = "";
  }

  if (IS_LATERAL) {
    // Badge click → open
    if (lateralBadgeEl) {
      lateralBadgeEl.addEventListener("click", () => {
        if (isOpen) lateralRetract(); else lateralOpen();
      });
    }
    // Close button → retract
    if (closeBtn) closeBtn.addEventListener("click", () => lateralRetract());

    // Start retracted, auto-open after 12s, NO auto-retract — visitor closes manually
    setTimeout(() => {
      lateralOpen();
      _lateralAutoOpened = true;
    }, 12000);
  }

  // Non-bubble/non-lateral modes: open immediately with welcome message
  if (!IS_BUBBLE && !IS_LATERAL) {
    window_.classList.add("open");
    window_.style.display = "flex";
    if (!SKIP_DEFAULT_WELCOME) {
      const defaultWelcome = { fr: "Bonjour ! Comment puis-je vous aider ?", en: "Hello! How can I help you?", de: "Hallo! Wie kann ich Ihnen helfen?", it: "Ciao! Come posso aiutarvi?", ru: "Здравствуйте! Чем могу помочь?", nl: "Hallo! Hoe kan ik u helpen?", he: "שלום! איך אוכל לעזור?" };
      addMessage("bot", defaultWelcome[USER_LANG] || defaultWelcome.fr);
    }
    welcomeShown = true;
    inputEl.focus();
  }

  // Language switcher
  if (IS_FULLPAGE) {
    const langSwitcher = document.querySelector(".sophyia-lang-switcher");
    const langBtn = document.querySelector(".sophyia-lang-btn");
    if (langSwitcher && langBtn) {
      langBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        langSwitcher.classList.toggle("open");
      });
      document.addEventListener("click", () => langSwitcher.classList.remove("open"));
      document.querySelectorAll(".sophyia-lang-option").forEach(opt => {
        opt.addEventListener("click", () => {
          const newLang = opt.getAttribute("data-lang");
          // Ferme le dropdown puis applique la langue en live (pas de reload)
          if (langSwitcher) langSwitcher.classList.remove("open");
          applyLanguage(newLang);
          // Met a jour le libelle et l'etat actif du dropdown
          if (langBtn) langBtn.firstChild.textContent = newLang.toUpperCase() + " \u25BE";
          document.querySelectorAll(".sophyia-lang-option").forEach(o => {
            o.classList.toggle("active", o.getAttribute("data-lang") === newLang);
          });
        });
      });
    }
  }

  // Fullpage: expand chat on interaction
  function expandChat() {
    if (IS_FULLPAGE && window_ && !window_.classList.contains("sophyia-expanded")) {
      window_.classList.add("sophyia-expanded");
    }
  }
  function collapseChat() {
    if (IS_FULLPAGE && window_) {
      window_.classList.remove("sophyia-expanded");
    }
  }

  // Fullpage size buttons — visitor can resize
  if (IS_FULLPAGE) {
    document.querySelectorAll(".sophyia-size-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const size = btn.getAttribute("data-size");
        window_.classList.remove("sophyia-size-small", "sophyia-size-medium", "sophyia-size-large");
        window_.classList.add("sophyia-size-" + size);
        document.querySelectorAll(".sophyia-size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        if (!window_.classList.contains("sophyia-expanded")) expandChat();
      });
    });
  }

  // Fullpage nav click handlers are attached dynamically in get_public_settings
  // Only the accent button (book) is static — its handler:
  if (IS_FULLPAGE) {
    const accentBtn = document.querySelector(".sophyia-site-nav.accent");
    if (accentBtn) {
      accentBtn.addEventListener("click", () => {
        const msg = accentBtn.getAttribute("data-msg");
        if (msg) {
          const langHint = USER_LANG !== "fr" ? `[LANG:${USER_LANG}] ` : "";
          expandChat();
          sendMessage(langHint + msg);
        }
      });
    }
  }

  // Load settings from API (all modes) — wrappe dans une fn reutilisable pour applyLanguage
  const settingsUrl = API_URL.replace("/api/chat", "/api/auth/admin");
  function _fetchAndApplySettings() {
    return fetch(settingsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_public_settings", bot_id: BOT_ID }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.settings) return;
        _cachedSettings = data.settings;
        const s = data.settings;
        const b = s.branding || {};
      // Update chat header title + avatar from personality.name (AI speaking to visitor)
      const botName = (s.personality && s.personality.name) || s.name || "";
      const headerH3 = document.querySelector("#sophyia-chat-header .info h3");
      if (headerH3) headerH3.textContent = botName;
      const avatarEl = document.querySelector("#sophyia-chat-header .avatar");
      if (avatarEl) {
        if (b.logo_url) {
          avatarEl.innerHTML = `<img src="${b.logo_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        } else if (botName) {
          avatarEl.textContent = botName[0].toUpperCase();
        }
      }
      // Badge lateral: handled below with loc() for i18n
      // Update logo
      if (b.logo_url) {
        const logoEl = document.querySelector("#sophyia-site-header .site-logo");
        if (logoEl) { logoEl.src = b.logo_url; logoEl.style.display = "block"; }
        else {
          const header = document.getElementById("sophyia-site-header");
          if (header) {
            const img = document.createElement("img");
            img.src = b.logo_url; img.className = "site-logo"; img.alt = "";
            header.insertBefore(img, header.firstChild);
          }
        }
      }
      // Update hero images — crossfade rotation (init une seule fois pour eviter leak setInterval)
      if (!_heroRotationInitialized) {
        const heroImages = b.hero_urls || (b.hero_url ? [b.hero_url] : []);
        if (heroImages.length > 0) {
          _heroRotationInitialized = true;
          const wrapper = document.getElementById("sophyia-site-wrapper");
          if (wrapper) {
            wrapper.style.background = '#111';
            const bg1 = document.createElement("div");
            bg1.className = "sophyia-bg-layer";
            bg1.style.backgroundImage = `url('${heroImages[0]}')`;
            const bg2 = document.createElement("div");
            bg2.className = "sophyia-bg-layer hidden";
            wrapper.insertBefore(bg2, wrapper.firstChild);
            wrapper.insertBefore(bg1, wrapper.firstChild);
            if (heroImages.length > 1) {
              let idx = 0;
              let active = bg1, standby = bg2;
              setInterval(() => {
                idx = (idx + 1) % heroImages.length;
                standby.style.backgroundImage = `url('${heroImages[idx]}')`;
                standby.classList.remove("hidden");
                active.classList.add("hidden");
                const tmp = active; active = standby; standby = tmp;
              }, 4000);
            }
          }
          const hero = document.getElementById("sophyia-site-hero");
          if (hero) hero.style.background = 'transparent';
        }
      }
      // Update tagline
      if (s.tagline) {
        const h1 = document.querySelector("#sophyia-site-hero h1");
        if (h1) h1.textContent = loc(s.tagline);
      }
      // Build nav from nav_items (hierarchical, uniform object format)
      const navItems = s.nav_items && (s.nav_items[USER_LANG] || s.nav_items.fr);
      // Fallback: old flat nav_labels format
      const navLabels = !navItems && s.nav_labels && (s.nav_labels[USER_LANG] || s.nav_labels.fr);
      const navPrompts = !navItems && s.nav_prompts && (s.nav_prompts[USER_LANG] || s.nav_prompts.fr);
      const langHint = USER_LANG !== "fr" ? `[LANG:${USER_LANG}] ` : "";

      // Normalize: empty array if no nav configured -> no quick actions (bots generalistes)
      let items = navItems || (navLabels ? navLabels.map((label, i) => ({
        label: label,
        prompt: navPrompts && navPrompts[i] ? navPrompts[i] : `[RUBRIQUE] ${label}`,
        children: [],
      })) : []);

      if (items.length > 0) {
        // Helper: send nav message with flash animation
        function navSend(msg, btnEl) {
          if (btnEl) {
            btnEl.classList.add("sophyia-flash");
            setTimeout(() => btnEl.classList.remove("sophyia-flash"), 300);
          }
          expandChat();
          sendMessage(langHint + msg);
        }

        // Helper: create a nav button (with optional dropdown for children)
        function createNavItem(item, isQuickAction) {
          const hasChildren = item.children && item.children.length > 0;
          if (!hasChildren) {
            // Simple button
            const btn = document.createElement("button");
            btn.className = isQuickAction ? "sophyia-quick-btn" : "sophyia-site-nav";
            btn.textContent = item.label;
            const prompt = item.prompt || `[RUBRIQUE] ${item.label}`;
            btn.addEventListener("click", () => {
              if (isQuickAction && !isOpen) { if (IS_LATERAL) lateralOpen(); else if (bubble) bubble.click(); }
              navSend(prompt, btn);
            });
            return btn;
          }
          // Button with dropdown
          const wrap = document.createElement("div");
          wrap.className = "sophyia-nav-dropdown-wrap";
          const btn = document.createElement("button");
          btn.className = isQuickAction ? "sophyia-quick-btn" : "sophyia-site-nav";
          btn.textContent = item.label + " \u25BE";
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            // Close other open dropdowns
            document.querySelectorAll(".sophyia-nav-dropdown-wrap.open").forEach(w => { if (w !== wrap) w.classList.remove("open"); });
            wrap.classList.toggle("open");
          });
          const dd = document.createElement("div");
          dd.className = "sophyia-nav-dropdown";
          item.children.forEach(child => {
            const sub = document.createElement("button");
            sub.className = "sophyia-nav-sub";
            sub.textContent = child.label;
            const prompt = child.prompt || `[RUBRIQUE] ${child.label}`;
            sub.addEventListener("click", () => {
              wrap.classList.remove("open");
              if (isQuickAction && !isOpen) { if (IS_LATERAL) lateralOpen(); else if (bubble) bubble.click(); }
              navSend(prompt, sub);
            });
            dd.appendChild(sub);
          });
          wrap.appendChild(btn);
          wrap.appendChild(dd);
          return wrap;
        }

        // Fullpage nav — generate into #sophyia-nav-buttons
        const navContainer = document.getElementById("sophyia-nav-buttons");
        if (navContainer) {
          navContainer.innerHTML = "";
          items.forEach(item => { navContainer.appendChild(createNavItem(item, false)); });
        }

        // Quick-actions — bubble/sidebar/embed/lateral (skip if no real items)
        const qa = document.getElementById("sophyia-quick-actions");
        // Filter out empty/placeholder items
        items = items.filter(item => item.label && item.label.trim() && item.id !== '_none');
        if (qa && !IS_FULLPAGE && items.length > 0) {
          qa.innerHTML = "";
          const row1 = document.createElement("div");
          row1.className = "sophyia-quick-row";
          const row2 = document.createElement("div");
          row2.className = "sophyia-quick-row";
          // 3 items or fewer → single row; 4+ → split into 2 rows
          if (items.length <= 3) {
            items.forEach(item => { row1.appendChild(createNavItem(item, true)); });
          } else {
            const half = Math.ceil(items.length / 2);
            items.forEach((item, i) => {
              (i < half ? row1 : row2).appendChild(createNavItem(item, true));
            });
          }
          // Book button — only shown if not suppressed by nav_accent_label="_none"
          const _accentSuppressed = (s.nav_accent_label === "_none");
          if (!_accentSuppressed) {
            // Per-tenant book prompt : settings.book_prompt_<lang> override le BOOK_PROMPTS
            // hardcodé (qui reste fallback pour les bots historiques type La Gare).
            // Pour villa (Olivia) : settings.book_prompt_fr = "Je voudrais composer un séjour..." etc.
            const _tenantBookPrompt = s["book_prompt_" + USER_LANG];
            const bookPrompt = (typeof _tenantBookPrompt === "string" && _tenantBookPrompt.trim())
              ? _tenantBookPrompt
              : BOOK_PROMPTS[USER_LANG];
            const bookBtn = document.createElement("button");
            bookBtn.className = "sophyia-quick-btn accent";
            bookBtn.textContent = t.book;
            bookBtn.setAttribute("data-msg", bookPrompt);
            bookBtn.addEventListener("click", () => {
              if (!isOpen) { if (IS_LATERAL) lateralOpen(); else if (bubble) bubble.click(); }
              navSend(bookPrompt);
            });
            if (!IS_EMBED) {
              row2.appendChild(bookBtn);
            }
            // Embed: bottom bar with Reserver + TheFork + X (fullscreen close)
            if (IS_EMBED) {
              const inputArea = document.getElementById("sophyia-chat-input-area");
              if (inputArea) {
                const bottomBar = document.createElement("div");
                bottomBar.className = "sophyia-embed-bottom";
                bookBtn.className = "sophyia-embed-book-btn";
                bottomBar.appendChild(bookBtn);
                const theforkLink = document.createElement("a");
                theforkLink.className = "sophyia-embed-thefork";
                theforkLink.href = "https://widget.thefork.com/02854d16-abce-4129-92ef-03b6cfeadaac";
                theforkLink.target = "_blank";
                theforkLink.rel = "noopener noreferrer";
                theforkLink.textContent = "TheFork";
                bottomBar.appendChild(theforkLink);
                const exitBtn = document.createElement("button");
                exitBtn.className = "sophyia-embed-exit";
                exitBtn.innerHTML = "✕ " + t.exit;
              exitBtn.addEventListener("click", () => {
                // Scroll to gallery section and collapse chat to initial size
                const gallery = document.getElementById("galerie");
                if (gallery) gallery.scrollIntoView({ behavior: "smooth" });
                // Reset messages scroll to top
                if (messagesEl) messagesEl.scrollTop = 0;
              });
              bottomBar.appendChild(exitBtn);
              inputArea.parentNode.insertBefore(bottomBar, inputArea.nextSibling);
            }
          }
          } // end if (!_accentSuppressed)
          qa.appendChild(row1);
          qa.appendChild(row2);
          qa.style.display = "";
        }

        // Accent button label override
        const accentLabel = s.nav_accent_label;
        if (accentLabel) {
          document.querySelectorAll(".sophyia-site-nav.accent, .sophyia-quick-btn.accent")
            .forEach(btn => { btn.textContent = loc(accentLabel); });
        }

        // Close dropdowns on click outside (init une seule fois pour eviter leak listener)
        if (!_docClickListenerInitialized) {
          _docClickListenerInitialized = true;
          document.addEventListener("click", () => {
            document.querySelectorAll(".sophyia-nav-dropdown-wrap.open").forEach(w => w.classList.remove("open"));
          });
        }
      }
      // Lateral badge: use data-badge-* from script tag, fallback to personality.name
      if (IS_LATERAL && lateralBadgeEl) {
        const badgeFromAttr = BADGE_TEXTS[USER_LANG] || BADGE_TEXTS.fr;
        const badgeText = badgeFromAttr || (s.personality || {}).name || BOT_ID;
        lateralBadgeEl.innerHTML = badgeText.replace(/\n/g, "<br>");
      }
      // Welcome message — en embed, Jade se presente elle-meme (pas de surcharge)
      if (!IS_EMBED) {
        const p = s.personality || {};
        // welcomeI18n must include all 7 languages. The tenant may have:
        //   - personality.welcome as a dict {fr,en,de,it} (auto_translate output)
        //   - personality.welcome as a plain string (fr fallback)
        //   - personality.welcome_<lang> top-level (the only path for ru/nl/he)
        // We merge all three sources, preferring the explicit per-lang fields.
        const welcomeDict = (typeof p.welcome === "object" && p.welcome !== null) ? p.welcome : {};
        const welcomeStr = (typeof p.welcome === "string") ? p.welcome : "";
        const welcomeI18n = {
          fr: p.welcome_fr || welcomeDict.fr || welcomeStr || "",
          en: p.welcome_en || welcomeDict.en || "",
          de: p.welcome_de || welcomeDict.de || "",
          it: p.welcome_it || welcomeDict.it || "",
          ru: p.welcome_ru || welcomeDict.ru || "",
          nl: p.welcome_nl || welcomeDict.nl || "",
          he: p.welcome_he || welcomeDict.he || "",
        };
        const welcomeMsg = _adjustGreetingByHour(loc(welcomeI18n), USER_LANG);
        // Si le welcome dynamique a deja remplace, on ne re-ecrase pas avec
        // la version statique (qui arriverait apres, par malchance d'ordre async).
        // Si l'utilisateur a deja engage la conversation (switch de langue en
        // pleine discussion), on ne re-ecrase pas non plus : la conversation
        // doit POURSUIVRE dans la nouvelle langue, pas repartir de zero.
        if (welcomeMsg && !_welcomeReplaced && !_userEngaged) {
          _ensureFirstBotMessage(welcomeMsg, false);
        }
      }
      // Update footer
      if (s.phone || s.address) {
        const footerLeft = document.querySelector("#sophyia-site-footer .left");
        if (footerLeft) footerLeft.textContent = [s.address, s.phone].filter(Boolean).join(" — ");
      }
      // Apply compact size
      if (b.compact_size && window_) {
        window_.classList.remove("sophyia-size-small", "sophyia-size-medium", "sophyia-size-large");
        window_.classList.add("sophyia-size-" + b.compact_size);
      }
    })
    .catch(() => {});
  }
  _fetchAndApplySettings();

  // ── Welcome dynamique (genere par LLM cote API, gating par personality.type) ──
  // Appel parallele aux settings. Si la reponse arrive dans le timeout ET que
  // le user n'a pas engage la conversation, le welcome statique est remplace
  // par un welcome compose a l'instant T (saison, evenements locaux). Sinon
  // le welcome statique reste affiche. Aucun blocage UX.
  function _fetchDynamicWelcome() {
    if (!BOT_ID) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    fetch(settingsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate_welcome", bot_id: BOT_ID, lang: USER_LANG }),
      signal: controller.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        clearTimeout(timer);
        if (_userEngaged || _welcomeReplaced) return;
        const w = (data && data.welcome) || "";
        if (!w.trim()) return;
        _ensureFirstBotMessage(mdToHtml(w), true);
        _welcomeReplaced = true;
      })
      .catch(() => { clearTimeout(timer); });
  }
  _fetchDynamicWelcome();

  // ── Auto-open / auto-close (data-auto-open-ms / data-auto-close-ms) ──────
  // Olivia (villa) : 6000 / 10000. La Gare : 0 / 0 (désactivé). Configurable
  // par tenant via les data-attributes du <script>.
  //
  // Comportement :
  //  - Si AUTO_OPEN_MS > 0 et bulle fermée → bubble.click() après ce délai.
  //  - Après auto-open, si AUTO_CLOSE_MS > 0 → on programme une fermeture
  //    après ce délai SI le visiteur n'a pas interagi entre temps.
  //  - Toute interaction (clic/touche/scroll) dans la bulle annule l'auto-close.
  //  - Engagement (sendMessage) annule définitivement auto-close (le timer
  //    inactivité 4 min + 30s prend alors le relais).
  function _cancelAutoClose() {
    if (_autoCloseTimer) { clearTimeout(_autoCloseTimer); _autoCloseTimer = null; }
    _wasAutoOpened = false;
    // Retire le mode peek : l'utilisateur interagit → passe à la taille normale (70vh).
    if (window_) window_.classList.remove("sophyia-peek");
  }

  if (AUTO_OPEN_MS > 0 && IS_BUBBLE && bubble) {
    _autoOpenTimer = setTimeout(() => {
      _autoOpenTimer = null;
      if (isOpen) return;
      _wasAutoOpened = true;
      // Coucou discret mobile : classe .sophyia-peek → 50vh au lieu de 70vh
      // sur ≤640px. La classe est retirée dès la 1ère interaction utilisateur
      // (via _cancelAutoClose ci-dessus) ou au sendMessage.
      window_.classList.add("sophyia-peek");
      bubble.click();
      // Programmer auto-close si configuré
      if (AUTO_CLOSE_MS > 0) {
        _autoCloseTimer = setTimeout(() => {
          _autoCloseTimer = null;
          // Ne ferme QUE si toujours auto-opened ET pas d'engagement
          if (_wasAutoOpened && !_userEngaged && isOpen) {
            isOpen = false;
            window_.classList.remove("open");
            setTimeout(() => { window_.style.display = "none"; }, 300);
            _stopInactivityTimer();
            _wasAutoOpened = false;
          }
        }, AUTO_CLOSE_MS);
      }
    }, AUTO_OPEN_MS);
  }

  // ── Switch de langue live (sans reload) ───────────────────────────────────
  // Coupe le widget a la langue detectee par le site. Le site peut declencher
  // en dispatching : window.dispatchEvent(new CustomEvent('sophyia:langchange', { detail: { lang: 'en' } }))
  // Ou appeler directement : window.SophyiaChat.setLang('en')
  function applyLanguage(newLang) {
    if (!SUPPORTED_LANGS.includes(newLang) || newLang === USER_LANG) return;
    USER_LANG = newLang;
    t = I18N[USER_LANG] || I18N.fr;
    try { localStorage.setItem('sophyia_lang', newLang); } catch (e) { /* SSR/private */ }

    // RTL bascule pour HE — chassis de la fenetre uniquement.
    const win = document.getElementById("sophyia-chat-window");
    if (win) win.setAttribute("dir", USER_LANG === "he" ? "rtl" : "ltr");

    // Textes UI statiques (I18N)
    if (inputEl) inputEl.placeholder = t.placeholder;
    const headerP = document.querySelector("#sophyia-chat-header .info p");
    if (headerP) headerP.textContent = t.online;
    if (closeBtn) closeBtn.setAttribute('aria-label', t.close);
    if (sendBtn) sendBtn.setAttribute('aria-label', t.send);
    if (bubble) bubble.setAttribute('aria-label', t.open_chat);
    // Volet B — labels dynamiques
    if (endBtn) {
      endBtn.textContent = t.end_conversation;
      endBtn.setAttribute('aria-label', t.end_conversation);
      endBtn.setAttribute('title', t.end_conversation);
    }
    const privacyNote = document.querySelector(".sophyia-privacy-note");
    if (privacyNote) privacyNote.textContent = t.privacy_note;

    // Re-apply settings-based content (tagline, nav, welcome, accent) — re-fetch
    _fetchAndApplySettings();
  }

  // Event listener cote site : CustomEvent('sophyia:langchange', { detail: { lang } })
  if (typeof window !== "undefined") {
    window.addEventListener('sophyia:langchange', e => {
      if (e && e.detail && typeof e.detail.lang === 'string') applyLanguage(e.detail.lang);
    });
    // API globale imperative (alternative au CustomEvent)
    window.SophyiaChat = window.SophyiaChat || {};
    window.SophyiaChat.setLang = applyLanguage;

    // openWith(message) — ouvre la bulle et envoie un message d'amorce.
    // Utilisé par les liens .olivia-trigger des articles de blog pour déclencher
    // une conversation contextuelle ("Parlez-moi de l'huile pressée à froid", etc.)
    window.SophyiaChat.openWith = function(message) {
      if (typeof message !== 'string' || !message.trim()) return;
      const wasOpen = isOpen;
      if (!wasOpen && bubble) bubble.click();
      setTimeout(() => {
        try { sendMessage(message); } catch (e) { console.warn('[Sophyia] openWith failed', e); }
      }, wasOpen ? 50 : 400);
    };
  }

})();
