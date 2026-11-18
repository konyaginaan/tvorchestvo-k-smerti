#!/usr/bin/env python3
"""Собирает сайт «Творчество к смерти».

  index.html   — лендинг (template.html)
  article.html — статья (article-template.html + article.md)
  show.html    — режим показа на докладе (show-template.html)
  notes.js     — все заметки и боковая панель, в которой они открываются

Заметки берутся из базы Obsidian «купс группа» (только чтение) и из папки notes/
(заметки, написанные для сайта). Ссылки вида {{L:Название заметки|текст}} в article.md
и data-note="…" в шаблонах становятся ссылками на заметки.

Запуск: python3 build.py
"""
import html
import json
import os
import re

VAULT = os.path.expanduser('~/Downloads/Обсидиан/купс группа')
HERE = os.path.dirname(os.path.abspath(__file__))
SITE_NOTES_DIR = os.path.join(HERE, 'notes')

# Личные черновики: никогда не публикуются, ссылки на них вычищаются.
HIDE = ['Переноса нет, мой текст', 'Парфюмер — что есть в базе', 'Парфюмер — заготовки к докладу']
# Строки с этими словами — из другого доклада, на сайт не попадают.
DROP_LINES = re.compile(r'Солярис|Соляриса|Солярисе|Солярису|Solaris', re.I)

CHAPTER_KEYS = ['prolog', 'I', 'II', 'III', 'IV', 'V', 'VI', 'epilogue']

PLACEHOLDER = re.compile(r'\{\{L:([^|}]+)\|([^}]+)\}\}')
WIKI = re.compile(r'(!?)\[\[([^\]|#^]+)(?:[#^][^\]|]*)?(?:\|([^\]]+))?\]\]')


def read(p):
    return open(p, encoding='utf-8').read()


def vault_index():
    idx = {}
    for root, dirs, files in os.walk(VAULT):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for f in files:
            if f.endswith('.md'):
                idx.setdefault(f[:-3], os.path.join(root, f))
    return idx


def site_notes():
    res = {}
    for f in sorted(os.listdir(SITE_NOTES_DIR)):
        if f.endswith('.md'):
            res[f[:-3]] = read(os.path.join(SITE_NOTES_DIR, f))
    return res


def anchor(name, label):
    return '<a class="note" data-note="%s">%s</a>' % (html.escape(name, quote=True), label)


def wikilinks(text, published):
    def rep(m):
        embed, name, alias = m.group(1), m.group(2).strip(), m.group(3)
        if embed or name in HIDE:
            return ''
        label = (alias or name).strip()
        label = re.sub(r' — (конспект|полный текст)', '', label)
        return anchor(name, html.escape(label)) if name in published else html.escape(label)
    return WIKI.sub(rep, text)


def clean_note(name, text, published):
    text = re.sub(r'\A---\n.*?\n---\n', '', text, flags=re.S)
    out = []
    for line in text.split('\n'):
        s = line.strip()
        if DROP_LINES.search(s):
            continue
        if re.match(r'^(Полный-текст|Полный текст|Конспект)::', s):
            continue
        m = re.match(r'^Источник::\s*(.*)$', s)
        if m:
            src = wikilinks(m.group(1), published).strip()
            if src:
                out.append('<p class="src">Источник: %s</p>' % src)
            continue
        if re.match(r'^#\s+', s) and s.lstrip('# ').strip() == name:
            continue
        if re.match(r'^(#[\w-]+\s*)+$', s):          # строка из одних тегов
            continue
        line = re.sub(r'\s\^[\w-]+$', '', line)       # якоря блоков Obsidian
        out.append(line)
    text = '\n'.join(out)
    text = wikilinks(text, published)
    text = re.sub(r'==([^=\n]+)==', r'<mark>\1</mark>', text)
    text = re.sub(r'\n{3,}', '\n\n', text).strip()
    return text


def placeholders(text, published, where):
    def rep(m):
        name, label = m.group(1).strip(), m.group(2)
        if name not in published:
            raise SystemExit('%s: ссылка на неизвестную заметку: %s' % (where, name))
        return anchor(name, label)
    return PLACEHOLDER.sub(rep, text)


def referenced(*texts):
    names = set()
    for t in texts:
        names.update(n.strip() for n, _ in PLACEHOLDER.findall(t))
        for a, b in re.findall(r'data-note=(?:"([^"]+)"|\'([^\']+)\')', t):
            names.add(html.unescape(a or b))
    return names


def article_sections(md):
    parts = re.split(r'^## (.+)$', md, flags=re.M)
    secs = []
    for i in range(1, len(parts), 2):
        title, body = parts[i].strip(), parts[i + 1]
        img = re.search(r'<!--\s*img:\s*([\w-]+)\s*-->', body)
        body = re.sub(r'<!--.*?-->', '', body).strip()
        secs.append({'title': title, 'img': img.group(1) if img else None, 'body': body})
    if len(secs) != len(CHAPTER_KEYS):
        raise SystemExit('в article.md должно быть %d глав, а не %d' % (len(CHAPTER_KEYS), len(secs)))
    return secs


IMG_BG = re.compile(r'<img class="bg" src="img/([\w-]+)\.webp"([^>]*)>')


def videos(page):
    """Если рядом с картинкой лежит vid/<имя>.mp4 — сцена играет видео, картинка становится постером."""
    used = []

    def rep(m):
        name, attrs = m.group(1), m.group(2)
        alt = re.search(r'alt="([^"]*)"', attrs)
        if not alt or not alt.group(1) or not os.path.exists(os.path.join(HERE, 'vid', name + '.mp4')):
            return m.group(0)
        used.append(name)
        rest = re.sub(r'\s*alt="[^"]*"', '', attrs)
        return ('<video class="bg" src="vid/%s.mp4" poster="img/%s.webp" muted loop playsinline preload="metadata" '
                'aria-label="%s"%s></video>' % (name, name, alt.group(1), rest))
    return IMG_BG.sub(rep, page), used


def js(obj):
    return json.dumps(obj, ensure_ascii=False).replace('</', '<\\/')


NOTES_RUNTIME = r"""// Заметки и боковая панель, в которой они открываются. Собирается build.py.
(function () {
const NOTES = __NOTES__;
const SITE = new Set(__SITE__);
const css = `
a.note { text-decoration: none; cursor: pointer; transition: color .2s; }
a.note::after { content: '°'; display: inline-block; font-family: 'Lora', serif; font-style: normal; font-weight: 600; font-size: .62em; line-height: 1; vertical-align: super; color: #E3A781; margin-left: .12em; transition: transform .2s; }
a.note:hover, a.note:focus-visible { color: #E3A781; outline: none; }
a.note:hover::after { transform: scale(1.35); }
#overlay { position: fixed; inset: 0; background: rgba(8,6,5,0.55); opacity: 0; pointer-events: none; transition: opacity .35s; z-index: 60; }
#overlay.open { opacity: 1; pointer-events: auto; }
#drawer { --paper: #EEE4D1; --ink: #2A211C; --ink-soft: #4B3F37; --ink-muted: #6B5C51; --rust: #9A4528; position: fixed; top: 0; right: 0; height: 100%; width: min(600px, 100vw); background: var(--paper); color: var(--ink); z-index: 70; transform: translateX(102%); transition: transform .45s cubic-bezier(.2,.7,.2,1); display: flex; flex-direction: column; box-shadow: none; font-family: 'Lora', Georgia, serif; text-align: left; visibility: hidden; transition: transform .45s cubic-bezier(.2,.7,.2,1), visibility 0s linear .45s; }
#drawer.open { transform: none; visibility: visible; box-shadow: -20px 0 60px rgba(0,0,0,0.45); transition: transform .45s cubic-bezier(.2,.7,.2,1), visibility 0s; }
#drawer header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 18px; border-bottom: 1px solid #D8C9B0; }
#drawer header .lbl { font-family: 'Caveat', cursive; font-size: 24px; color: var(--rust); }
#drawer header .btns { display: flex; gap: 6px; }
#drawer header button { background: none; border: 1px solid #D8C9B0; border-radius: 50%; width: 38px; height: 38px; cursor: pointer; color: var(--ink); font-size: 18px; }
#drawer header button:hover { background: #E4D7BE; }
#drawer header button[hidden] { display: none; }
#drawer .body { overflow-y: auto; padding: 22px 30px 60px; -webkit-overflow-scrolling: touch; }
#drawer h2.ntitle { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; line-height: 1.15; font-weight: 600; margin: 0 0 18px; color: var(--ink); }
#drawer .md { font-size: 17px; line-height: 1.7; color: var(--ink-soft); }
#drawer .md p, #drawer .md ul, #drawer .md ol, #drawer .md blockquote { margin: 0 0 1em; }
#drawer .md h1, #drawer .md h2, #drawer .md h3, #drawer .md h4 { font-family: 'Cormorant Garamond', Georgia, serif; color: var(--ink); line-height: 1.2; margin: 1.3em 0 .5em; }
#drawer .md h1 { font-size: 30px; } #drawer .md h2 { font-size: 27px; } #drawer .md h3 { font-size: 23px; } #drawer .md h4 { font-size: 20px; }
#drawer .md strong { color: var(--ink); }
#drawer .md blockquote { border-left: 3px solid var(--rust); padding-left: 14px; font-style: italic; }
#drawer .md mark { background: #EBCFB8; color: inherit; padding: 0 2px; }
#drawer .md .src { font-size: 14px; color: var(--ink-muted); font-style: italic; }
#drawer .md table { border-collapse: collapse; font-size: 15px; margin: 0 0 1em; }
#drawer .md th, #drawer .md td { border: 1px solid #D8C9B0; padding: 6px 8px; text-align: left; }
#drawer a.note { text-decoration: underline; text-decoration-color: rgba(154,69,40,.45); text-underline-offset: .15em; }
#drawer a.note::after { color: var(--rust); }
#drawer a.note:hover { color: var(--rust); }
@media (max-width: 760px) { #drawer .body { padding: 18px 20px 60px; } }
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
const overlay = document.createElement('div'); overlay.id = 'overlay';
const drawer = document.createElement('aside'); drawer.id = 'drawer'; drawer.setAttribute('aria-hidden', 'true'); drawer.setAttribute('aria-label', 'Заметка');
drawer.innerHTML = '<header><span class="lbl"></span><span class="btns"><button class="back" title="Назад" hidden>←</button><button class="close" title="Закрыть">✕</button></span></header><div class="body"></div>';
document.body.append(overlay, drawer);
const body = drawer.querySelector('.body'), backBtn = drawer.querySelector('.back'), lbl = drawer.querySelector('.lbl');
const md = s => window.marked ? marked.parse(s) : '<p>' + s.replace(/\n\n/g, '</p><p>') + '</p>';
let stack = [];
function render(name) {
  const n = NOTES[name]; if (n === undefined) return;
  lbl.textContent = name.startsWith('Цитата:') ? 'цитата' : (SITE.has(name) ? 'заметка к статье' : 'заметка из рабочей базы');
  body.innerHTML = '<h2 class="ntitle"></h2><div class="md"></div>';
  body.querySelector('.ntitle').textContent = name;
  body.querySelector('.md').innerHTML = md(n);
  if (window.typo) typo(body);
  body.scrollTop = 0;
  backBtn.hidden = stack.length < 2;
}
function openNote(name) {
  if (NOTES[name] === undefined) return;
  stack.push(name); render(name);
  drawer.classList.add('open'); overlay.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
}
function closeNote() { drawer.classList.remove('open'); overlay.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); stack = []; }
document.addEventListener('click', e => {
  const a = e.target.closest('a.note'); if (!a) return;
  e.preventDefault(); e.stopPropagation(); openNote(a.dataset.note);
}, true);
document.querySelectorAll('a.note').forEach(a => { a.setAttribute('href', '#'); a.setAttribute('role', 'button'); });
overlay.addEventListener('click', closeNote);
drawer.querySelector('.close').addEventListener('click', closeNote);
backBtn.addEventListener('click', () => { stack.pop(); render(stack[stack.length - 1]); });
addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) { e.stopPropagation(); closeNote(); } }, true);
window.NOTES_UI = { openNote, closeNote, isOpen: () => drawer.classList.contains('open') };
})();
"""


def main():
    vidx = vault_index()
    snotes = site_notes()
    article_md = read(os.path.join(HERE, 'article.md'))
    templates = {n: read(os.path.join(HERE, n)) for n in ('template.html', 'article-template.html', 'show-template.html')}

    wanted = referenced(article_md, *templates.values())
    # заметки, на которые ссылаются заметки сайта, тоже публикуем, если они есть в базе
    for t in snotes.values():
        wanted.update(n.strip() for _, n, _ in WIKI.findall(t) if n.strip() in vidx or n.strip() in snotes)
    wanted -= set(HIDE)
    missing = [n for n in wanted if n not in snotes and n not in vidx]
    if missing:
        raise SystemExit('нет заметок: %s' % missing)
    published = set(wanted)
    notes = {}
    for n in sorted(published):
        raw = snotes[n] if n in snotes else read(vidx[n])
        notes[n] = clean_note(n, raw, published)

    secs = article_sections(article_md)
    texts = {k: '### ' + s['title'] + '\n\n' + placeholders(s['body'], published, 'article.md') for k, s in zip(CHAPTER_KEYS, secs)}

    # index.html
    page, vids = videos(templates['template.html'])
    page = page.replace('/*TEXTS*/{}', js(texts))
    open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(page)

    # article.html
    blocks = []
    for k, s in zip(CHAPTER_KEYS, secs):
        fig = ('<figure class="fig"><img src="img/%s.webp" alt="" loading="lazy"></figure>' % s['img']) if s['img'] else ''
        blocks.append({'id': k, 'title': s['title'], 'fig': fig, 'md': placeholders(s['body'], published, 'article.md')})
    art = templates['article-template.html'].replace('/*SECTIONS*/[]', js(blocks))
    open(os.path.join(HERE, 'article.html'), 'w', encoding='utf-8').write(art)

    # show.html
    show, svids = videos(templates['show-template.html'])
    open(os.path.join(HERE, 'show.html'), 'w', encoding='utf-8').write(show)

    # notes.js
    runtime = NOTES_RUNTIME.replace('__NOTES__', js(notes)).replace('__SITE__', js(sorted(n for n in published if n in snotes)))
    open(os.path.join(HERE, 'notes.js'), 'w', encoding='utf-8').write(runtime)

    links = len(PLACEHOLDER.findall(article_md))
    print('заметок: %d (из базы %d, написано для сайта %d); ссылок в статье: %d; видео: %d'
          % (len(notes), len([n for n in notes if n not in snotes]), len([n for n in notes if n in snotes]), links, len(set(vids + svids))))
    leaks = [n for n, t in notes.items() if 'obsidian://' in t or DROP_LINES.search(t)]
    if leaks:
        raise SystemExit('в заметках остались ссылки на базу или «Солярис»: %s' % leaks)


if __name__ == '__main__':
    main()
