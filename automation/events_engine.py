#!/usr/bin/env python3
"""
events_engine.py — Moteur événementiel Dinédit

Lit les fiches `events/upcoming/*.json` (source de vérité, saisie Dinédit).
Génère :
  - 1 HTML statique par event × 3 langues (FR canonique, EN, NL) avec JSON-LD `Event`
  - `public/agenda_data.json` (index lu par la page <Agenda /> React)
  - `public/sitemap.xml` (multilingue avec hreflang)
  - Auto-déplacement upcoming → past quand date_end < now

Pas de RSS, pas de LLM. Le contenu est curé par Dinédit ; le moteur ne fait que
publier ce qui est saisi, en générant les pages SEO + index agenda.

Usage :
    python3 automation/events_engine.py            # génère tout
    python3 automation/events_engine.py --dry-run  # liste sans écrire
"""

import os, sys, json, re, argparse, shutil
from datetime import datetime, timezone
from pathlib import Path

# ── Chemins ─────────────────────────────────────────────────────────────
APP_ROOT      = Path(__file__).resolve().parent.parent
EVENTS_UP     = APP_ROOT / "events" / "upcoming"
EVENTS_PAST   = APP_ROOT / "events" / "past"
ARTICLES_DIR  = APP_ROOT / "articles"                    # carnet éditorial (JSON manuels curés)
PUBLIC_DIR    = APP_ROOT / "public"
EVENTS_OUT    = PUBLIC_DIR / "events"
AGENDA_INDEX  = PUBLIC_DIR / "agenda_data.json"
CARNET_INDEX  = PUBLIC_DIR / "carnet_data.json"          # index carnet lu par <CarnetInline />
SITEMAP_PATH  = PUBLIC_DIR / "sitemap.xml"
TEMPLATE_PATH = Path(__file__).resolve().parent / "template_event.html"

# Rubriques du carnet éditorial (alignées Phase 4)
CARNET_RUBRICS = ("portraits", "carnet-de-cave", "comment-se-rendre", "agenda-quartier")

BASE_URL      = "https://www.dinedit.events"
TARGET_LANGS  = ("fr", "en", "nl")


# ── Helpers date ────────────────────────────────────────────────────────
def _parse_iso(s):
    if not s: return None
    try:
        # supporte avec ou sans Z final
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


def _format_date_human(iso_str, lang):
    dt = _parse_iso(iso_str)
    if not dt: return ""
    months = {
        "fr": ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
        "en": ["January","February","March","April","May","June","July","August","September","October","November","December"],
        "nl": ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],
    }
    weekdays = {
        "fr": ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"],
        "en": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
        "nl": ["maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag","zondag"],
    }
    wd = weekdays[lang][dt.weekday()].capitalize()
    if lang == "en":
        return f"{wd}, {months[lang][dt.month-1]} {dt.day}, {dt.year}"
    return f"{wd} {dt.day} {months[lang][dt.month-1]} {dt.year}"


# ── Markdown léger (inspiré blog_engine Villa, simplifié) ──────────────
def _md_to_html(md, accent_color="#C9A063"):
    if not md: return ""
    out, in_list = [], False
    for raw in md.split("\n"):
        line = raw.rstrip()
        if not line:
            if in_list: out.append("</ul>"); in_list = False
            continue
        if line.startswith("## "):
            if in_list: out.append("</ul>"); in_list = False
            out.append(f"<h2>{_inline(line[3:], accent_color)}</h2>")
        elif line.startswith("### "):
            if in_list: out.append("</ul>"); in_list = False
            out.append(f"<h3>{_inline(line[4:], accent_color)}</h3>")
        elif re.match(r"^\s*[-*]\s+", line):
            if not in_list: out.append("<ul>"); in_list = True
            item = re.sub(r"^\s*[-*]\s+", "", line)
            out.append(f"<li>{_inline(item, accent_color)}</li>")
        else:
            if in_list: out.append("</ul>"); in_list = False
            out.append(f"<p>{_inline(line, accent_color)}</p>")
    if in_list: out.append("</ul>")
    return "\n".join(out)


def _inline(text, accent_color):
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", text)
    # liens markdown standards
    text = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        rf'<a href="\2" style="color:{accent_color};text-decoration:underline;text-underline-offset:2px">\1</a>',
        text,
    )
    return text


# ── Slug helper ─────────────────────────────────────────────────────────
def slugify(s):
    s = re.sub(r"[^\w\s-]", "", s.lower())
    s = re.sub(r"[\s_-]+", "-", s).strip("-")
    return s[:80]


# ── Lecture des events ─────────────────────────────────────────────────
def load_events(directory):
    if not directory.exists(): return []
    events = []
    for f in sorted(directory.glob("*.json")):
        try:
            ev = json.loads(f.read_text(encoding="utf-8"))
            ev["_path"] = f
            events.append(ev)
        except Exception as e:
            print(f"[ERROR] {f.name}: {e}")
    return events


# ── Transition upcoming → past ──────────────────────────────────────────
def transition_past(events):
    EVENTS_PAST.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc)
    moved = 0
    for ev in events:
        dt_end = _parse_iso(ev.get("date_end"))
        if dt_end and dt_end < now:
            dst = EVENTS_PAST / ev["_path"].name
            shutil.move(str(ev["_path"]), str(dst))
            ev["_path"] = dst
            ev["status"] = "past"
            # Retire la clé interne _path (PosixPath, non sérialisable) avant dump.
            serializable = {k: v for k, v in ev.items() if k != "_path"}
            dst.write_text(json.dumps(serializable, ensure_ascii=False, indent=2), encoding="utf-8")
            moved += 1
            print(f"[MOVE] {ev['slug']} → past/")
    return moved


# ── Génération HTML par event × 3 langues ──────────────────────────────
def generate_html(event):
    if not TEMPLATE_PATH.exists():
        print(f"[ERROR] template manquant : {TEMPLATE_PATH}")
        return 0
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    slug = event["slug"]
    accent = "#C9A063"
    written = 0

    for lang in TARGET_LANGS:
        title = (event.get("title") or {}).get(lang) or (event.get("title") or {}).get("fr", "")
        excerpt = (event.get("excerpt") or {}).get(lang) or (event.get("excerpt") or {}).get("fr", "")
        body_md = (event.get("body_md") or {}).get(lang) or (event.get("body_md") or {}).get("fr", "")
        body_html = _md_to_html(body_md, accent)

        # Bios des guests dans la langue
        guest_html = ""
        for g in event.get("guests", []):
            bio = g.get(f"bio_short_{lang}") or g.get("bio_short_fr") or ""
            role = g.get("role", "")
            guest_html += f'<div class="guest"><h3>{g.get("name","")}</h3><p class="role">{role}</p><p>{bio}</p></div>\n'

        # Hreflang
        hreflang_links = "\n  ".join(
            f'<link rel="alternate" hreflang="{l}" href="{BASE_URL}{_event_url_path(slug, l)}" />'
            for l in TARGET_LANGS
        ) + f'\n  <link rel="alternate" hreflang="x-default" href="{BASE_URL}{_event_url_path(slug, "fr")}" />'

        # JSON-LD Event (SEO Google)
        jsonld_event = _build_jsonld_event(event, lang, title, excerpt)
        jsonld_html = '<script type="application/ld+json">' + json.dumps(jsonld_event, ensure_ascii=False) + '</script>'

        # Breadcrumb structuré
        breadcrumb = {
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Dinédit", "item": BASE_URL},
                {"@type": "ListItem", "position": 2, "name": "Agenda", "item": f"{BASE_URL}/agenda"},
                {"@type": "ListItem", "position": 3, "name": title, "item": f"{BASE_URL}{_event_url_path(slug, lang)}"},
            ],
        }
        breadcrumb_html = '<script type="application/ld+json">' + json.dumps(breadcrumb, ensure_ascii=False) + '</script>'

        # Replacements
        flyer = event.get("flyer_image", "")
        date_human = _format_date_human(event.get("date_start"), lang)
        canonical = f"{BASE_URL}{_event_url_path(slug, lang)}"
        location_str = event.get("location_name") or {
            "fr": "Lieu insolite révélé après réservation",
            "en": "Secret venue revealed at booking",
            "nl": "Geheime locatie onthuld bij reservering",
        }[lang]
        price = event.get("price_btoc_eur")
        price_str = f"À partir de {price} € / personne" if (price and lang == "fr") else \
                    f"From €{price} per person" if (price and lang == "en") else \
                    f"Vanaf € {price} per persoon" if (price and lang == "nl") else \
                    {"fr": "Tarif à confirmer", "en": "Price to be confirmed", "nl": "Prijs nog te bevestigen"}[lang]

        cta_book = {"fr": "Réservez votre place", "en": "Book your seat",
                    "nl": "Reserveer uw plek"}.get(lang, "Réservez votre place")
        cta_intro = {"fr": "Réservez votre place pour cette édition.",
                     "en": "Book your seat for this edition.",
                     "nl": "Reserveer uw plek voor deze editie."}.get(lang, "Réservez votre place pour cette édition.")

        html = template
        for k, v in {
            "{{LANG}}": lang,
            "{{SLUG}}": event.get("slug", ""),
            "{{CTA_BOOK}}": cta_book,
            "{{CTA_INTRO}}": cta_intro,
            "{{TITLE}}": title,
            "{{EXCERPT}}": excerpt,
            "{{META_DESC}}": (event.get("seo") or {}).get(f"meta_description_{lang}") or excerpt,
            "{{DATE_HUMAN}}": date_human,
            "{{DATE_ISO}}": event.get("date_start", ""),
            "{{LOCATION}}": location_str,
            "{{PRICE}}": price_str,
            "{{CAPACITY}}": str(event.get("capacity", 20)),
            "{{FLYER}}": flyer,
            "{{BODY}}": body_html,
            "{{GUESTS}}": guest_html,
            "{{CANONICAL}}": canonical,
            "{{HREFLANG}}": hreflang_links,
            "{{JSONLD_EVENT}}": jsonld_html,
            "{{JSONLD_BREADCRUMB}}": breadcrumb_html,
            "{{BASE_URL}}": BASE_URL,
        }.items():
            html = html.replace(k, v)

        # Écriture sur disque
        out_dir = EVENTS_OUT if lang == "fr" else EVENTS_OUT / lang
        out_dir.mkdir(parents=True, exist_ok=True)
        out_file = out_dir / f"{slug}.html"
        out_file.write_text(html, encoding="utf-8")
        written += 1

    print(f"[HTML] {slug} × {written} langues")
    return written


def _event_url_path(slug, lang):
    return f"/events/{slug}.html" if lang == "fr" else f"/events/{lang}/{slug}.html"


def _build_jsonld_event(event, lang, title, excerpt):
    js = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": title,
        "description": excerpt,
        "startDate": event.get("date_start"),
        "endDate": event.get("date_end"),
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "inLanguage": lang,
        "organizer": {
            "@type": "Organization", "name": "Dinédit", "url": BASE_URL,
        },
    }
    # location
    if event.get("location_name"):
        loc = {"@type": "Place", "name": event["location_name"]}
        if event.get("location_address") or event.get("location_city"):
            loc["address"] = {
                "@type": "PostalAddress",
                "streetAddress": event.get("location_address", ""),
                "addressLocality": event.get("location_city", "Bruxelles"),
                "addressCountry": event.get("location_country", "BE"),
            }
        js["location"] = loc
    else:
        js["location"] = {
            "@type": "Place",
            "name": "Lieu insolite révélé après réservation",
            "address": {"@type": "PostalAddress", "addressLocality": "Bruxelles", "addressCountry": "BE"},
        }
    # performer
    if event.get("guests"):
        js["performer"] = [{"@type": "Person", "name": g.get("name", "")} for g in event["guests"] if g.get("name")]
    # offers (BtoC public price)
    if event.get("price_btoc_eur"):
        js["offers"] = {
            "@type": "Offer",
            "price": str(event["price_btoc_eur"]),
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock",
            "url": f"{BASE_URL}{_event_url_path(event['slug'], lang)}",
        }
    if event.get("flyer_image"):
        js["image"] = BASE_URL + event["flyer_image"]
    return js


# ── Index carnet_data.json (articles éditoriaux, 4 rubriques) ─────────
def build_carnet_index():
    """Compile les articles JSON du dossier articles/ en carnet_data.json.
    Chaque article est classé par rubrique. Ordre : date décroissante par rubrique.
    """
    articles = []
    if ARTICLES_DIR.exists():
        for f in sorted(ARTICLES_DIR.glob("*.json")):
            try:
                a = json.loads(f.read_text(encoding="utf-8"))
                if a.get("type") == "article":
                    articles.append(a)
            except Exception as e:
                print(f"[ERROR] article {f.name}: {e}")

    # Sérialisation minimale pour la page React
    def serialize(a):
        return {
            "slug": a.get("slug"),
            "rubric": a.get("rubric"),
            "date": a.get("date"),
            "linked_event": a.get("linked_event"),
            "hero_image": a.get("hero_image"),
            "title": a.get("title", {}),
            "excerpt": a.get("excerpt", {}),
            "tags": a.get("tags", []),
            "author": a.get("author", "Dinédit"),
        }

    by_rubric = {}
    for rub in CARNET_RUBRICS:
        by_rubric[rub] = sorted(
            [serialize(a) for a in articles if a.get("rubric") == rub],
            key=lambda x: x.get("date") or "",
            reverse=True,
        )
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "by_rubric": by_rubric,
        "rubrics": list(CARNET_RUBRICS),
    }
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    CARNET_INDEX.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    total = sum(len(v) for v in by_rubric.values())
    print(f"[CARNET] {total} articles répartis sur {len(CARNET_RUBRICS)} rubriques → {CARNET_INDEX.name}")


# ── Index agenda_data.json (lu par la page React Agenda) ─────────────
def build_agenda_index(upcoming, past):
    def serialize(ev, status):
        return {
            "slug": ev["slug"],
            "status": status,
            "date_start": ev.get("date_start"),
            "date_end": ev.get("date_end"),
            "flyer": ev.get("flyer_image"),
            "capacity": ev.get("capacity", 20),
            "price_btoc_eur": ev.get("price_btoc_eur"),
            "city": ev.get("location_city") or "Bruxelles",
            "title": ev.get("title", {}),
            "excerpt": ev.get("excerpt", {}),
            "guests": [{"name": g.get("name", ""), "role": g.get("role", "")} for g in ev.get("guests", [])],
            "tags": ev.get("tags", []),
        }
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "upcoming": [serialize(ev, "upcoming") for ev in sorted(upcoming, key=lambda e: e.get("date_start", ""))],
        "past":     [serialize(ev, "past")     for ev in sorted(past,     key=lambda e: e.get("date_start", ""), reverse=True)],
    }
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    AGENDA_INDEX.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[INDEX] {len(data['upcoming'])} upcoming + {len(data['past'])} past → {AGENDA_INDEX.name}")


# ── Sitemap multilingue avec hreflang ─────────────────────────────────
STATIC_PAGES = [
    {"path": "/",               "priority": "1.0", "changefreq": "weekly"},
    {"path": "/agenda",         "priority": "0.9", "changefreq": "daily"},
    {"path": "/devenir-membre", "priority": "0.8", "changefreq": "monthly"},
    {"path": "/entreprises",    "priority": "0.8", "changefreq": "monthly"},
    {"path": "/a-propos",       "priority": "0.7", "changefreq": "monthly"},
    {"path": "/faq",            "priority": "0.6", "changefreq": "monthly"},
    {"path": "/contact",        "priority": "0.6", "changefreq": "monthly"},
    # NB: /architectes → 301 vers /a-propos (staticwebapp.config.json) → hors sitemap.
]


def _lang_url(base_path, lang):
    base_path = base_path.lstrip("/")
    if lang == "fr":
        return f"{BASE_URL}/{base_path}" if base_path else f"{BASE_URL}/"
    return f"{BASE_URL}/{lang}/{base_path}" if base_path else f"{BASE_URL}/{lang}"


def regenerate_sitemap(upcoming, past):
    today = datetime.now(timezone.utc).date().isoformat()
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ]
    def add(loc, lastmod, changefreq, priority, alternates):
        lines.append("  <url>")
        lines.append(f"    <loc>{loc}</loc>")
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append(f"    <changefreq>{changefreq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        for lc, alt in alternates:
            lines.append(f'    <xhtml:link rel="alternate" hreflang="{lc}" href="{alt}" />')
        lines.append(f'    <xhtml:link rel="alternate" hreflang="x-default" href="{alternates[0][1]}" />')
        lines.append("  </url>")

    # Pages statiques × langues
    for page in STATIC_PAGES:
        alts = [(l, _lang_url(page["path"], l)) for l in TARGET_LANGS]
        for _, url in alts:
            add(url, today, page["changefreq"], page["priority"], alts)

    # Events × langues
    for ev in (upcoming + past):
        slug = ev["slug"]
        last = (ev.get("date_start") or today)[:10]
        alts = [(l, BASE_URL + _event_url_path(slug, l)) for l in TARGET_LANGS]
        for _, url in alts:
            add(url, last, "monthly", "0.6", alts)

    # Recommendations × langues (générées par recommendations_engine.py, GHA cron).
    # Merge ici pour que le build Azure SWA préserve l'index reco dans le sitemap.
    reco_path = PUBLIC_DIR / "reco_data.json"
    if reco_path.exists():
        try:
            recos = json.loads(reco_path.read_text(encoding="utf-8"))
        except Exception:
            recos = []
        for p in recos:
            slug = p.get("slug")
            if not slug: continue
            last = p.get("published", today)[:10]
            alts = []
            for l in TARGET_LANGS:
                url = f"{BASE_URL}/recommendations/{slug}.html" if l == "fr" else f"{BASE_URL}/recommendations/{l}/{slug}.html"
                alts.append((l, url))
            for _, url in alts:
                add(url, last, "weekly", "0.7", alts)

    lines.append("</urlset>")
    SITEMAP_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"[SITEMAP] {sum(1 for l in lines if l.strip().startswith('<loc>'))} URLs → {SITEMAP_PATH.name}")


# ── Main ────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Dinédit events engine")
    parser.add_argument("--dry-run", action="store_true", help="Liste les events sans écrire de fichiers")
    args = parser.parse_args()

    EVENTS_UP.mkdir(parents=True, exist_ok=True)
    upcoming = load_events(EVENTS_UP)
    past     = load_events(EVENTS_PAST)
    print(f"[LOAD] {len(upcoming)} upcoming + {len(past)} past")

    if not args.dry_run:
        moved = transition_past(upcoming)
        if moved:
            upcoming = load_events(EVENTS_UP)
            past     = load_events(EVENTS_PAST)

    if args.dry_run:
        for ev in upcoming + past:
            print(f"  - {ev.get('status','?'):8} {ev['slug']}")
        return

    EVENTS_OUT.mkdir(parents=True, exist_ok=True)
    total_html = 0
    for ev in upcoming + past:
        total_html += generate_html(ev)

    build_agenda_index(upcoming, past)
    build_carnet_index()
    regenerate_sitemap(upcoming, past)

    print(f"\n[DONE] {len(upcoming)+len(past)} events × {len(TARGET_LANGS)} langues = {total_html} HTML générés")


if __name__ == "__main__":
    main()
