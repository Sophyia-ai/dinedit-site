#!/usr/bin/env python3
"""
recommendations_engine.py — Moteur "Nos recommandations" Dinédit

Scanne les offices du tourisme belges et portails curés (Wallonie, Flandre, national)
→ extrait les événements insolites via LLM → réécrit en note éditoriale Dinédit
   (constellation Dinédit obligatoire) → HTML statique 3 langues (FR/EN/NL).

Usage :
    python3 recommendations_engine.py --initial-burst 20       # premier chargement
    python3 recommendations_engine.py --per-source 2           # cadence hebdo (2/semaine)
    python3 recommendations_engine.py --source visit.brussels  # une seule source
    python3 recommendations_engine.py --rebuild-index
    python3 recommendations_engine.py --purge                  # retire les événements passés (>30j)

Variables d'environnement :
    AZURE_OPENAI_API_KEY
    AZURE_OPENAI_ENDPOINT     https://sophyia.cognitiveservices.azure.com/
    AZURE_OPENAI_API_VERSION  2024-12-01-preview
"""

import os, sys, json, re, argparse, subprocess, urllib.request, ssl, time, random
from datetime import date, datetime, timedelta
from pathlib import Path

ssl._create_default_https_context = ssl._create_unverified_context


def _ensure(package, import_name=None):
    import importlib
    try: importlib.import_module(import_name or package)
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q", "--break-system-packages"],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


_ensure("openai")
_ensure("beautifulsoup4", "bs4")
_ensure("python-slugify", "slugify")

from bs4 import BeautifulSoup
from openai import AzureOpenAI

try:
    from slugify import slugify
except ImportError:
    def slugify(text):
        text = text.lower().strip()
        for src, dst in [('àâä','a'),('éèêë','e'),('ïî','i'),('ôö','o'),('ùûü','u'),('ç','c')]:
            for c in src: text = text.replace(c, dst)
        return re.sub(r'[^a-z0-9]+', '-', text).strip('-')


# ── Config ──────────────────────────────────────────────────────────────
APP_ROOT       = Path(__file__).resolve().parent.parent
RECO_DIR       = APP_ROOT / "public" / "recommendations"
DATA_PATH      = APP_ROOT / "public" / "reco_data.json"
SITEMAP_PATH   = APP_ROOT / "public" / "sitemap.xml"
TEMPLATE_PATH  = Path(__file__).resolve().parent / "template_reco.html"
SOURCES_PATH   = Path(__file__).resolve().parent / "reco_sources.json"

BASE_URL       = "https://www.dinedit.events"
GPT_MODEL      = "gpt-4o-mini"
TARGET_LANGS   = ("fr", "en", "nl")
CATEGORY_LABEL = {"fr": "Nos recommandations", "en": "Our picks", "nl": "Onze tips"}

USER_AGENT = "Mozilla/5.0 (compatible; DineditBot/1.0; +https://www.dinedit.events)"

# .env
_env = APP_ROOT / ".env"
if _env.exists():
    for _l in _env.read_text().splitlines():
        if '=' in _l and not _l.startswith('#'):
            _k, _v = _l.split('=', 1)
            os.environ[_k.strip()] = _v.strip()


# ── Prompts ─────────────────────────────────────────────────────────────
EXTRACT_PROMPT = """\
Tu es assistant éditorial pour Dinédit — dîners inédits curés à Bruxelles.
On te soumet le texte d'une page d'agenda d'un office du tourisme belge (ou portail curé).

MISSION : extrais jusqu'à {max_candidates} événements FUTURS qui pourraient intéresser
l'audience Dinédit — art, gastronomie, artisanat, patrimoine vivant, expositions
confidentielles, marchés d'art, festivals littéraires, concerts intimistes,
soirées atypiques. Écarte : concerts stadium, salons commerciaux, marchés génériques,
sport de masse, événements sponsorisés grand public.

Retourne UNIQUEMENT un JSON valide :
{{
  "candidates": [
    {{
      "title": "titre de l'événement (verbatim de la source)",
      "date_start": "YYYY-MM-DD ou null si non trouvée",
      "location": "ville, lieu si précisé, sinon ville",
      "url": "URL de la page événement si visible dans le texte, sinon vide",
      "raw_excerpt": "extrait de description brute copié depuis la source (max 400 chars)"
    }}
  ]
}}

Si aucun événement pertinent n'est trouvé, retourne {{"candidates": []}}.

SOURCE :
Nom : {source_name}
Région : {region}
URL page listing : {source_url}
Contenu texte de la page :
{page_text}
"""


REWRITE_PROMPT = """\
Tu écris pour la rubrique « Nos recommandations » de Dinédit — Meeting Alchemy,
dîners inédits curés à Bruxelles (Serge Vanmol, fondateur, indépendant belge).
On te confie un événement repéré sur une source tierce ; tu dois en tirer une
note éditoriale courte, chaleureuse et éditorialisée.

PORTE DE REJET — AVANT TOUT, retourne {{"reject": true, "reason": "..."}} si :
- Événement mainstream (concert stadium, salon commercial, marché générique, foire aux vins industrielle).
- Événement passé ou sans date exploitable.
- Événement qui empiète frontalement sur un dîner Dinédit (dîner privé, gastronomie curée à Bruxelles avec table d'hôte).
- Sujet politique, polémique, catastrophe, drame, publicité pure.
- Sujet hors Belgique.

VOIX ÉDITORIALE DINÉDIT :
- 1ʳᵉ personne pluriel : « nous avons repéré », « on aime », « nous vous emmenons ».
- Ton chaleureux, curé, jamais promotionnel ni tape-à-l'œil.
- Court : 150-250 mots, un seul flux (pas de listes à puces mécaniques).
- Vocabulaire précis, sensoriel. Pas d'emojis, pas d'italique ornemental.
- Pas de superlatifs vides : « unique », « incontournable », « à ne pas manquer ».
- Pas de clichés : « au cœur de », « plongez dans », « laissez-vous », « magie de ».

CONSTELLATION DINÉDIT — RÈGLES ABSOLUES (SEO cross-brand) :
1. Le mot « Dinédit » doit apparaître EXPLICITEMENT au moins 2 fois dans le contenu.
2. Le contenu contient OBLIGATOIREMENT ces 3 liens markdown intégrés naturellement :
   - Vers l'agenda Dinédit : [nos prochains dîners inédits](https://www.dinedit.events/#agenda)
   - Vers la home Dinédit : [Dinédit — Meeting Alchemy](https://www.dinedit.events)
   - Vers Anaïs (chatbot) : [Anaïs](anais:Bonjour, je viens de lire la reco sur {seed_title} — dis-moi si un dîner Dinédit pourrait s'accorder avec ce moment.)
     Le préfixe « anais: » est OBLIGATOIRE. Le message est contextualisé.
3. Attribution source à la fin du texte, format markdown : [{source_name}]({source_url}).
4. La note doit établir un pont éditorial : pourquoi ce moment fait écho à la démarche
   Dinédit (art × gastronomie × lieux insolites × Bruxelles/Belgique).

STRUCTURE :
- Un titre reformulé en voix Dinédit (60-100 caractères, pas verbatim de la source).
- Un excerpt de 2 phrases sensorielles.
- Contenu markdown : 1 paragraphe d'ouverture (l'événement en 2-3 phrases), 1 paragraphe
  de résonance Dinédit (pont éditorial + lien(s) Dinédit), 1 paragraphe pratique
  (dates, lieu, comment y aller, attribution + trigger Anaïs).

MÉTA SEO :
- meta_fr : 155-160 caractères, contient « Dinédit » ET la ville/région.
- tags_fr : 5 tags, dont OBLIGATOIREMENT « Dinédit » et « Belgique ». Les autres reflètent
  la thématique (« expo confidentielle », « gastronomie », « artisanat », etc.).

Retourne UNIQUEMENT un objet JSON valide :
{{
  "title_fr": "...",
  "excerpt_fr": "... (2 phrases sensorielles, mentionne l'événement et Dinédit)",
  "content_fr": "... (markdown, 150-250 mots, 3 paragraphes, 3 liens Dinédit + attribution)",
  "tags_fr": ["Dinédit", "Belgique", "tag3", "tag4", "tag5"],
  "meta_fr": "... (155-160 chars, contient Dinédit + ville)",
  "read_time": "X min"
}}

ÉVÉNEMENT REPÉRÉ :
Titre source : {seed_title}
Date : {seed_date}
Lieu : {seed_location}
Extrait brut : {seed_excerpt}
Source : {source_name} ({source_url})
Région : {region}
"""


TRANSLATE_PROMPT = """\
Tu traduis une note éditoriale « Nos recommandations » Dinédit du français vers
2 langues : anglais (en), néerlandais (nl).

RÈGLES :
1. Traduction naturelle, ton curé chaleureux préservé.
2. NE PAS traduire : Dinédit, Meeting Alchemy, Bruxelles/Brussels/Brussel selon la langue
   (fr→Bruxelles, en→Brussels, nl→Brussel), Anaïs, Serge Vanmol.
3. Liens markdown : préserve l'URL exacte, traduis seulement le texte du lien.
   Le format spécial [Anaïs](anais:Message FR) → traduit le texte du lien ET le message,
   mais conserve le préfixe « anais: » dans l'href.
4. Structure markdown intacte : paragraphes, **bold**, listes.
5. Excerpts courts (2 phrases), mention Dinédit préservée.
6. Meta descriptions 155-160 chars, contiennent Dinédit + Brussels/Brussel selon la langue.
7. Tags : « Dinédit » et « Belgique » restent tels quels ou traduits (« Belgium », « België »).

Retourne UNIQUEMENT un objet JSON valide :
{{
  "title_en": "...", "title_nl": "...",
  "excerpt_en": "...", "excerpt_nl": "...",
  "content_en": "...", "content_nl": "...",
  "tags_en": [...], "tags_nl": [...],
  "meta_en": "...", "meta_nl": "..."
}}

NOTE FR :
Titre : {title_fr}
Excerpt : {excerpt_fr}
Meta : {meta_fr}
Tags : {tags_fr}
Contenu :
{content_fr}
"""


# ── OpenAI ──────────────────────────────────────────────────────────────
def get_client():
    return AzureOpenAI(
        api_key=os.environ["AZURE_OPENAI_API_KEY"],
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT", "https://sophyia.cognitiveservices.azure.com/"),
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
    )


def _extract_json(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = re.sub(r'^```\w*\n?', '', raw).rstrip('`').strip()
    return json.loads(raw)


class RecoRejected(Exception):
    """Le LLM a jugé l'événement source hors scope Dinédit."""


# ── Fetch HTML ──────────────────────────────────────────────────────────
def fetch_page_text(url: str, timeout: int = 20) -> str:
    """Fetch la page + extrait le texte utile (BeautifulSoup)."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        html = resp.read().decode("utf-8", errors="replace")
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg", "iframe"]):
        tag.decompose()
    text = soup.get_text(" ", strip=True)
    text = re.sub(r'\s+', ' ', text)
    return text[:12000]  # cap pour tokens


# ── LLM : extraction candidats depuis la page listing ────────────────────
def extract_candidates(source: dict, max_candidates: int = 4) -> list:
    """LLM parse la page listing d'un office du tourisme → JSON candidats."""
    client = get_client()
    try:
        page_text = fetch_page_text(source["url"])
    except Exception as e:
        print(f"  [FETCH FAIL] {source['name']} → {type(e).__name__}: {e}")
        return []
    if not page_text or len(page_text) < 200:
        print(f"  [EMPTY] {source['name']} → page vide ou bloquée")
        return []
    prompt = EXTRACT_PROMPT.format(
        source_name=source["name"],
        region=source.get("region", ""),
        source_url=source["url"],
        page_text=page_text,
        max_candidates=max_candidates,
    )
    try:
        resp = client.chat.completions.create(
            model=GPT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1500,
        )
        out = _extract_json(resp.choices[0].message.content)
        candidates = out.get("candidates", []) or []
        # Garde ceux avec un titre non vide
        candidates = [c for c in candidates if (c.get("title") or "").strip()]
        return candidates[:max_candidates]
    except Exception as e:
        print(f"  [EXTRACT FAIL] {source['name']} → {type(e).__name__}: {e}")
        return []


# ── LLM : réécriture note Dinédit ────────────────────────────────────────
def rewrite_reco_fr(candidate: dict, source: dict) -> dict:
    """Passe FR : réécrit la note dans la voix Dinédit avec constellation."""
    client = get_client()
    prompt = REWRITE_PROMPT.format(
        seed_title=candidate.get("title", ""),
        seed_date=candidate.get("date_start", "") or "à confirmer",
        seed_location=candidate.get("location", "") or source.get("region", ""),
        seed_excerpt=(candidate.get("raw_excerpt") or "")[:600],
        source_name=source["name"],
        source_url=candidate.get("url") or source["url"],
        region=source.get("region", ""),
    )
    resp = client.chat.completions.create(
        model=GPT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.75,
        max_tokens=2000,
    )
    out = _extract_json(resp.choices[0].message.content)
    if out.get("reject") is True:
        raise RecoRejected(out.get("reason", "(pas de motif fourni)"))
    return out


def translate_reco(article_fr: dict) -> dict:
    """Passe EN/NL : traduit la note FR."""
    client = get_client()
    prompt = TRANSLATE_PROMPT.format(
        title_fr=article_fr.get("title_fr", ""),
        excerpt_fr=article_fr.get("excerpt_fr", ""),
        meta_fr=article_fr.get("meta_fr", ""),
        tags_fr=", ".join(article_fr.get("tags_fr", [])),
        content_fr=article_fr.get("content_fr", ""),
    )
    resp = client.chat.completions.create(
        model=GPT_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=4000,
    )
    return _extract_json(resp.choices[0].message.content)


def _empty_translations() -> dict:
    out = {}
    for lang in ("en", "nl"):
        out[f"title_{lang}"] = ""
        out[f"excerpt_{lang}"] = ""
        out[f"content_{lang}"] = ""
        out[f"tags_{lang}"] = []
        out[f"meta_{lang}"] = ""
    return out


def _verify_constellation(article: dict) -> tuple:
    """Vérifie que les règles de constellation Dinédit sont bien présentes en FR.

    Retourne (ok: bool, missing: list[str]).
    """
    content = article.get("content_fr", "") or ""
    missing = []
    if content.count("Dinédit") < 2:
        missing.append("dinedit_mentions<2")
    if "https://www.dinedit.events/#agenda" not in content:
        missing.append("agenda_link")
    if "https://www.dinedit.events" not in content:
        missing.append("home_link")
    if "anais:" not in content:
        missing.append("anais_trigger")
    return (not missing, missing)


# ── Markdown → HTML (déclencheur Anaïs spécial) ──────────────────────────
def _inline(text: str) -> str:
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)', r'<em>\1</em>', text)
    text = re.sub(r'(?<!_)_(?!\s)(.+?)(?<!\s)_(?!_)', r'<em>\1</em>', text)

    def _link(m):
        label, href = m.group(1), m.group(2)
        if href.lower().startswith("anais:"):
            msg = href[6:].strip()
            esc = msg.replace('"', '&quot;').replace("'", "&#39;")
            return f'<a href="#chat" class="anais-trigger" data-anais-message="{esc}">{label}</a>'
        external = not (href.startswith("/") or href.startswith(BASE_URL) or href.startswith("#"))
        target_attr = ' target="_blank" rel="noopener noreferrer"' if external else ''
        return f'<a href="{href}"{target_attr}>{label}</a>'

    text = re.sub(r'\[(.+?)\]\((.+?)\)', _link, text)
    return text


def _md_to_html(md: str) -> str:
    out, in_list = [], False
    for raw in md.split("\n"):
        line = raw.strip()
        if not line:
            if in_list: out.append("</ul>"); in_list = False
            continue
        if line.startswith("## "):
            if in_list: out.append("</ul>"); in_list = False
            out.append(f"<h2>{_inline(line[3:])}</h2>")
        elif line.startswith("### "):
            if in_list: out.append("</ul>"); in_list = False
            out.append(f"<h3>{_inline(line[4:])}</h3>")
        elif line.startswith("- ") or line.startswith("* "):
            if not in_list: out.append("<ul>"); in_list = True
            item = re.sub(r"^\s*[-*]\s+", "", line)
            out.append(f"<li>{_inline(item)}</li>")
        else:
            if in_list: out.append("</ul>"); in_list = False
            out.append(f"<p>{_inline(line)}</p>")
    if in_list: out.append("</ul>")
    return "\n".join(out)


# ── Anaïs trigger initializer script (injecté dans HTML) ─────────────────
ANAIS_TRIGGER_JS = """
<script>
  document.addEventListener('DOMContentLoaded', function() {
    var triggers = document.querySelectorAll('.anais-trigger');
    triggers.forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        var msg = el.getAttribute('data-anais-message') || '';
        if (window.SophyiaChat && typeof window.SophyiaChat.openWith === 'function') {
          window.SophyiaChat.openWith(msg);
        } else {
          var tries = 0;
          var poll = setInterval(function() {
            tries += 1;
            if (window.SophyiaChat && typeof window.SophyiaChat.openWith === 'function') {
              clearInterval(poll);
              window.SophyiaChat.openWith(msg);
            } else if (tries > 30) {
              clearInterval(poll);
            }
          }, 200);
        }
      });
    });
  });
</script>
"""


# ── HTML Generation ──────────────────────────────────────────────────────
def _format_date_human(iso_str: str, lang: str) -> str:
    if not iso_str: return ""
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
    except Exception:
        return iso_str
    months = {
        "fr": ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
        "en": ["January","February","March","April","May","June","July","August","September","October","November","December"],
        "nl": ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],
    }
    m = months.get(lang, months["fr"])
    if lang == "en":
        return f"{m[dt.month-1]} {dt.day}, {dt.year}"
    return f"{dt.day} {m[dt.month-1]} {dt.year}"


def generate_html(slug: str, article: dict, source: dict, candidate: dict):
    RECO_DIR.mkdir(parents=True, exist_ok=True)
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    today_iso = date.today().isoformat()

    event_date_iso = candidate.get("date_start") or ""
    source_url = candidate.get("url") or source["url"]

    for lang in TARGET_LANGS:
        title      = article.get(f"title_{lang}")   or article.get("title_fr", "")
        content_md = article.get(f"content_{lang}") or article.get("content_fr", "")
        meta_desc  = article.get(f"meta_{lang}")    or article.get("meta_fr", "")
        excerpt    = article.get(f"excerpt_{lang}") or article.get("excerpt_fr", "")
        tags_list  = article.get(f"tags_{lang}")    or article.get("tags_fr", []) or []

        content_html = _md_to_html(content_md)
        tags_html = "".join(f'<span>#{t}</span>' for t in tags_list)

        # Canonical multilangue
        if lang == "fr":
            canonical = f"{BASE_URL}/recommendations/{slug}.html"
        else:
            canonical = f"{BASE_URL}/recommendations/{lang}/{slug}.html"

        # hreflang
        hreflangs = []
        for l in TARGET_LANGS:
            url = f"{BASE_URL}/recommendations/{slug}.html" if l == "fr" else f"{BASE_URL}/recommendations/{l}/{slug}.html"
            hreflangs.append(f'<link rel="alternate" hreflang="{l}" href="{url}" />')
        hreflangs.append(f'<link rel="alternate" hreflang="x-default" href="{BASE_URL}/recommendations/{slug}.html" />')

        # JSON-LD Event (attribué à la source, pas à Dinédit)
        jsonld_event = None
        if event_date_iso:
            jsonld_event = {
                "@context": "https://schema.org",
                "@type": "Event",
                "name": candidate.get("title", title),
                "startDate": event_date_iso,
                "location": {
                    "@type": "Place",
                    "name": candidate.get("location", source.get("region", "")),
                    "address": {"@type": "PostalAddress", "addressRegion": source.get("region", ""), "addressCountry": "BE"},
                },
                "organizer": {"@type": "Organization", "name": source["name"], "url": source_url},
                "url": source_url,
                "description": meta_desc,
                "inLanguage": lang,
            }
        jsonld_event_html = ('<script type="application/ld+json">' + json.dumps(jsonld_event, ensure_ascii=False) + '</script>') if jsonld_event else ""

        breadcrumb = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Dinédit", "item": BASE_URL},
                {"@type": "ListItem", "position": 2, "name": "Nos recommandations", "item": f"{BASE_URL}/recommendations/"},
                {"@type": "ListItem", "position": 3, "name": title, "item": canonical},
            ],
        }
        breadcrumb_html = '<script type="application/ld+json">' + json.dumps(breadcrumb, ensure_ascii=False) + '</script>'

        # Injection Anaïs trigger script AVANT </body>
        html = template
        for k, v in {
            "{{LANG}}": lang,
            "{{TITLE}}": title,
            "{{META_DESC}}": meta_desc,
            "{{CATEGORY_LABEL}}": CATEGORY_LABEL.get(lang, "Nos recommandations"),
            "{{DATE_ISO}}": today_iso,
            "{{DATE_DISPLAY}}": _format_date_human(today_iso, lang),
            "{{READ_TIME}}": article.get("read_time", "3 min"),
            "{{CONTENT}}": content_html,
            "{{EXCERPT}}": excerpt,
            "{{TAGS}}": tags_html,
            "{{CANONICAL}}": canonical,
            "{{HREFLANG}}": "\n  ".join(hreflangs),
            "{{JSONLD_EVENT}}": jsonld_event_html,
            "{{JSONLD_BREADCRUMB}}": breadcrumb_html,
            "{{BASE_URL}}": BASE_URL,
            "{{SOURCE_NAME}}": source["name"],
            "{{SOURCE_URL}}": source_url,
            "{{REGION}}": source.get("region", ""),
            "{{EVENT_DATE_HUMAN}}": _format_date_human(event_date_iso, lang) or "À confirmer",
        }.items():
            html = html.replace(k, v)

        html = html.replace("</body>", ANAIS_TRIGGER_JS + "\n</body>")

        if lang == "fr":
            out = RECO_DIR / f"{slug}.html"
        else:
            out_dir = RECO_DIR / lang
            out_dir.mkdir(parents=True, exist_ok=True)
            out = out_dir / f"{slug}.html"
        out.write_text(html, encoding="utf-8")
        print(f"  [HTML] {out.relative_to(APP_ROOT)}")


# ── Index reco_data.json + sitemap ───────────────────────────────────────
def _load_index() -> list:
    if not DATA_PATH.exists():
        return []
    try:
        return json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []


def _save_index(posts: list):
    posts.sort(key=lambda p: (p.get("event_date") or "9999", p.get("published", "")), reverse=False)
    # tri : évé. futurs d'abord, croissant par date. Récent en fallback.
    def sort_key(p):
        ed = p.get("event_date") or ""
        pub = p.get("published") or ""
        return (0 if ed else 1, ed, pub)
    posts.sort(key=sort_key)
    DATA_PATH.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")


def add_to_index(slug: str, article: dict, source: dict, candidate: dict):
    posts = _load_index()
    posts = [p for p in posts if p["slug"] != slug]
    posts.append({
        "slug": slug,
        "published": date.today().isoformat(),
        "event_date": candidate.get("date_start") or "",
        "source_name": source["name"],
        "source_url": candidate.get("url") or source["url"],
        "region": source.get("region", ""),
        "title": {lang: article.get(f"title_{lang}") or article.get("title_fr", "") for lang in TARGET_LANGS},
        "excerpt": {lang: article.get(f"excerpt_{lang}") or article.get("excerpt_fr", "") for lang in TARGET_LANGS},
        "tags": {lang: article.get(f"tags_{lang}") or article.get("tags_fr", []) for lang in TARGET_LANGS},
    })
    _save_index(posts)


def rebuild_index_from_data():
    posts = _load_index()
    _save_index(posts)
    print(f"[INDEX] {len(posts)} recos in {DATA_PATH.name}")
    return posts


def purge_past(days_after: int = 30):
    """Retire les recos dont event_date est passé de > N jours."""
    posts = _load_index()
    threshold = (date.today() - timedelta(days=days_after)).isoformat()
    kept, removed = [], []
    for p in posts:
        ed = p.get("event_date") or ""
        if ed and ed < threshold:
            removed.append(p)
            # supprime les HTML
            for lang in TARGET_LANGS:
                path = RECO_DIR / f"{p['slug']}.html" if lang == "fr" else RECO_DIR / lang / f"{p['slug']}.html"
                if path.exists():
                    path.unlink()
        else:
            kept.append(p)
    _save_index(kept)
    print(f"[PURGE] {len(removed)} recos passées retirées (seuil {threshold}), {len(kept)} conservées")


def update_sitemap():
    """Régénère sitemap.xml en incluant events + recommendations."""
    posts = _load_index()
    today = date.today().isoformat()

    # Recharge le sitemap existant si présent, sinon crée le squelette
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]

    def add_url(loc, lastmod, changefreq, priority, alternates=None):
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append(f"    <changefreq>{changefreq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        if alternates:
            for lc, url in alternates:
                lines.append(f'    <xhtml:link rel="alternate" hreflang="{lc}" href="{url}" />')
            lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{alternates[0][1]}" />')
        lines.append("  </url>")

    # Pages statiques
    static_pages = [
        ("/", "1.0", "weekly"),
        ("/agenda", "0.8", "daily"),
        ("/devenir-membre", "0.8", "monthly"),
        ("/entreprises", "0.8", "monthly"),
        ("/a-propos", "0.7", "monthly"),
        ("/faq", "0.6", "monthly"),
        ("/contact", "0.6", "monthly"),
        # /architectes → 301 vers /a-propos → hors sitemap.
    ]
    for path, priority, changefreq in static_pages:
        alts = []
        for lang in TARGET_LANGS:
            url = f"{BASE_URL}{path}" if lang == "fr" else f"{BASE_URL}/{lang}{path}"
            alts.append((lang, url))
        for lc, url in alts:
            add_url(url, today, changefreq, priority, alts)

    # Events (fichiers HTML statiques)
    events_up = APP_ROOT / "events" / "upcoming"
    events_past = APP_ROOT / "events" / "past"
    for events_dir in (events_up, events_past):
        if not events_dir.exists(): continue
        for f in sorted(events_dir.glob("*.json")):
            slug = f.stem
            alts = []
            for lang in TARGET_LANGS:
                url = f"{BASE_URL}/events/{slug}.html" if lang == "fr" else f"{BASE_URL}/events/{lang}/{slug}.html"
                alts.append((lang, url))
            for lc, url in alts:
                add_url(url, today, "weekly", "0.8", alts)

    # Recommendations
    for p in posts:
        slug = p["slug"]
        last = p.get("published", today)
        alts = []
        for lang in TARGET_LANGS:
            url = f"{BASE_URL}/recommendations/{slug}.html" if lang == "fr" else f"{BASE_URL}/recommendations/{lang}/{slug}.html"
            alts.append((lang, url))
        for lc, url in alts:
            add_url(url, last, "weekly", "0.7", alts)

    lines.append("</urlset>")
    SITEMAP_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    n = sum(1 for ln in lines if ln.strip().startswith("<loc>"))
    print(f"[SITEMAP] {n} URLs → {SITEMAP_PATH.name}")


# ── Process une source ──────────────────────────────────────────────────
def process_source(source: dict, quota: int, dry_run: bool = False) -> int:
    """Traite une source : extrait candidats, filtre, produit N recos."""
    print(f"\n[SOURCE] {source['name']} ({source.get('region', '')}) — quota {quota}")
    candidates = extract_candidates(source, max_candidates=max(quota * 3, 4))
    print(f"  [CAND] {len(candidates)} candidats extraits")

    published_slugs = {p["slug"] for p in _load_index()}
    generated = 0
    for cand in candidates:
        if generated >= quota:
            break
        title = (cand.get("title") or "").strip()
        if not title:
            continue
        slug = slugify(title)[:60]
        if not slug or slug in published_slugs:
            print(f"  [SKIP] {slug or '(slug vide)'} déjà publié")
            continue
        if (RECO_DIR / f"{slug}.html").exists():
            print(f"  [SKIP] {slug} (HTML existe)")
            continue

        print(f"\n  [RECO] {title[:70]}...")
        if dry_run:
            print(f"  [DRY-RUN] serait généré : {slug}")
            generated += 1
            continue

        try:
            article = rewrite_reco_fr(cand, source)
            ok, missing = _verify_constellation(article)
            if not ok:
                print(f"  [CONSTELLATION FAIL] {slug} manque : {', '.join(missing)}")
                # Retry une fois avec un rappel explicite
                cand["raw_excerpt"] = (cand.get("raw_excerpt", "") + f"\n\n[RAPPEL] Constellation manquante : {', '.join(missing)}").strip()
                article = rewrite_reco_fr(cand, source)
                ok, missing = _verify_constellation(article)
                if not ok:
                    print(f"  [REJECT] {slug} — constellation Dinédit non vérifiée après retry ({', '.join(missing)})")
                    continue
            try:
                article.update(translate_reco(article))
            except Exception as e:
                print(f"  [WARN] traduction ratée ({type(e).__name__}: {e}) — FR seul conservé")
                article.update(_empty_translations())
            generate_html(slug, article, source, cand)
            add_to_index(slug, article, source, cand)
            print(f"  [OK] {slug}")
            generated += 1
        except RecoRejected as e:
            print(f"  [REJECT] {slug} — {e}")
        except Exception as e:
            print(f"  [ERROR] {type(e).__name__}: {e}")

    return generated


# ── Main ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Recommendations engine Dinédit")
    parser.add_argument("--initial-burst", type=int, help="Vise N recos total au premier chargement")
    parser.add_argument("--per-source", type=int, default=1, help="Recos voulues par source en cadence normale (default 1)")
    parser.add_argument("--source", help="Nom d'une seule source à traiter")
    parser.add_argument("--max", type=int, default=25, help="Cap total de recos par run (default 25)")
    parser.add_argument("--dry-run", action="store_true", help="Fetch + extraction candidats sans LLM rewrite")
    parser.add_argument("--rebuild-index", action="store_true", help="Reconstruit reco_data.json (tri)")
    parser.add_argument("--rebuild-sitemap", action="store_true", help="Régénère sitemap.xml seul")
    parser.add_argument("--purge", action="store_true", help="Retire les recos passées (>30 jours)")
    parser.add_argument("--push", action="store_true", help="Git commit + push après génération (opt-in)")
    args = parser.parse_args()

    if args.rebuild_index:
        rebuild_index_from_data()
        return

    if args.rebuild_sitemap:
        update_sitemap()
        return

    if args.purge:
        purge_past(days_after=30)
        update_sitemap()
        return

    sources_cfg = json.loads(SOURCES_PATH.read_text(encoding="utf-8"))
    all_sources = sources_cfg.get("sources", [])
    # Filtre : ignore les sources désactivées (SPA / timeout persistants)
    sources = [s for s in all_sources if not s.get("disabled")]
    if args.source:
        sources = [s for s in all_sources if s["name"] == args.source]
        if not sources:
            print(f"[ERROR] source '{args.source}' introuvable")
            return
    print(f"[SOURCES] {len(sources)} actives sur {len(all_sources)}")

    # Calcule le quota par source
    if args.initial_burst:
        target = min(args.initial_burst, args.max)
        per_source_map = {s["name"]: 0 for s in sources}
        # Garantit min 1 par source active, puis distribue le reste pondéré priorité
        for s in sources:
            per_source_map[s["name"]] = 1
        remaining = max(0, target - len(sources))
        # Répartition pondérée par priorité (priorité 1 → poids 3, priorité 2 → poids 2, …)
        weighted = []
        for s in sources:
            w = 4 - int(s.get("priority", 2))
            weighted.extend([s] * max(w, 1))
        random.shuffle(weighted)
        i = 0
        while remaining > 0 and i < len(weighted) * 6:
            s = weighted[i % len(weighted)]
            per_source_map[s["name"]] += 1
            remaining -= 1
            i += 1
        print(f"[BURST] cible {target} recos — répartition : {per_source_map}")
    else:
        target = args.max
        per_source_map = {s["name"]: args.per_source for s in sources}

    total = 0
    for src in sources:
        if total >= target:
            break
        quota = min(per_source_map.get(src["name"], 0), target - total)
        if quota <= 0:
            continue
        try:
            n = process_source(src, quota, args.dry_run)
        except Exception as e:
            print(f"[SOURCE ERROR] {src['name']} → {type(e).__name__}: {e}")
            n = 0
        total += n

    print(f"\n[TOTAL] {total} recos générées")

    if total > 0 and not args.dry_run:
        update_sitemap()

    if total > 0 and not args.dry_run and args.push:
        print("\n[GIT] Commit + push (--push) ...")
        os.chdir(APP_ROOT)
        subprocess.run(["git", "add", "public/recommendations", "public/reco_data.json", "public/sitemap.xml"], check=True)
        subprocess.run(["git", "commit", "-m", f"reco: {total} nouvelles recommandations"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("[DONE]")


if __name__ == "__main__":
    main()
