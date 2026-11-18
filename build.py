#!/usr/bin/env python3
"""Собирает index.html: вставляет в template.html заметки из базы «купс группа»
и полные тексты глав из заметки с докладом.

Запуск: python3 build.py
"""
import html
import json
import os
import re

VAULT = os.path.expanduser('~/Downloads/Обсидиан/купс группа')
HERE = os.path.dirname(os.path.abspath(__file__))
REPORT = 'Творчество к смерти — доклад по «Парфюмеру»'

# Заметки, которые открываются на сайте. Черновики сюда не входят.
NOTES = [
    'Игра и переходное пространство',
    'интернализация как усиление когерентности психики (Лёвальд)',
    'Роль "достаточно хорошей матери" для формирования способности к творчеству',
    'лицо матери как зеркало у Винникотта',
    'Отсутствие объектного катексиса — почему внимание не удерживается (Кохут)',
    'частичные объекты',
    'До-символические формы символизации',
    'Связывание-контейнирование-мышление',
    'Гипноз как влюблённость при исключении сексуального удовлетворения (Фрейд, 1921, Групповая психология)',
    'Зависть в аналитическом процессе',
    'Область созидания — третий уровень психики без внешнего объекта (Балинт)',
    'Символическое уравнивание',
    'Интроекция и инкорпорация — работа символа против магии (Абрахам и Торок)',
    'Сублимация — карта области (Фрейд)',
    'Когда кажется, что переноса в работе нет — карта темы',
    'Не отсутствие переноса, а трудность его распознать (Розенфельд, 1952)',
    'Холдинг и страх падения — Винникотт',
]
# Ссылки на эти заметки вычищаются целиком (личные черновики).
HIDE = ['Переноса нет, мой текст']

CHAPTERS = {
    'prolog': 'Пролог',
    'I': 'I.',
    'II': 'II.',
    'III': 'III.',
    'IV': 'IV.',
    'V': 'V.',
    'VI': 'VI.',
    'epilogue': 'Эпилог',
}


def find(name):
    for root, dirs, files in os.walk(VAULT):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        if name + '.md' in files:
            return os.path.join(root, name + '.md')
    raise SystemExit('нет заметки: ' + name)


WIKI = re.compile(r'(!?)\[\[([^\]|#^]+)(?:[#^][^\]|]*)?(?:\|([^\]]+))?\]\]')


def links(text):
    def rep(m):
        embed, name, alias = m.group(1), m.group(2).strip(), m.group(3)
        if embed:
            return ''
        if name in HIDE:
            return ''
        label = (alias or name).strip()
        if name in NOTES:
            return '<a class="note" data-note="%s">%s</a>' % (html.escape(name, quote=True), html.escape(label))
        return label
    return WIKI.sub(rep, text)


def clean_note(name, text):
    text = re.sub(r'\A---\n.*?\n---\n', '', text, flags=re.S)
    out = []
    for line in text.split('\n'):
        s = line.strip()
        if re.match(r'^(Полный-текст|Полный текст)::', s):
            continue
        m = re.match(r'^Источник::\s*(.*)$', s)
        if m:
            src = links(m.group(1)).strip()
            if src:
                out.append('<p class="src">Источник: %s</p>' % src)
            continue
        if re.match(r'^#\s+', s) and s.lstrip('# ').strip() == name:
            continue
        line = re.sub(r'\s\^[\w-]+$', '', line)
        out.append(line)
    text = '\n'.join(out)
    text = links(text)
    text = re.sub(r'==([^=\n]+)==', r'<mark>\1</mark>', text)
    text = re.sub(r'\n{3,}', '\n\n', text).strip()
    return text


def chapters():
    text = open(find(REPORT), encoding='utf-8').read()
    m = re.search(r'^## Текст доклада\s*\n(.*?)^## ', text, flags=re.S | re.M)
    if not m:
        raise SystemExit('в докладе нет раздела «Текст доклада»')
    body = m.group(1)
    parts = re.split(r'^### (.+)$', body, flags=re.M)
    res = {}
    for i in range(1, len(parts), 2):
        title, content = parts[i].strip(), parts[i + 1].strip()
        content = re.sub(r'^---\s*$', '', content, flags=re.M).strip()
        for key, prefix in CHAPTERS.items():
            if title.startswith(prefix) and key not in res:
                res[key] = '### ' + title + '\n\n' + content
                break
    missing = [k for k in CHAPTERS if k not in res]
    if missing:
        raise SystemExit('не нашла главы: %s' % missing)
    return res


IMG_BG = re.compile(r'<img class="bg" src="img/([\w-]+)\.webp"([^>]*)>')


def videos(tpl):
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
    out = IMG_BG.sub(rep, tpl)
    return out, used


def js(obj):
    return json.dumps(obj, ensure_ascii=False).replace('</', '<\\/')


def main():
    notes = {n: clean_note(n, open(find(n), encoding='utf-8').read()) for n in NOTES}
    tpl = open(os.path.join(HERE, 'template.html'), encoding='utf-8').read()
    page, vids = videos(tpl)
    out = page.replace('/*NOTES*/{}', js(notes)).replace('/*TEXTS*/{}', js(chapters()))
    for n in re.findall(r'data-note=(?:"([^"]+)"|\'([^\']+)\')', tpl):
        name = html.unescape(n[0] or n[1])
        if name not in notes:
            raise SystemExit('ссылка на заметку вне списка: ' + name)
    open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(out)
    print('index.html: %d заметок, %d видео%s, %d КБ' % (len(notes), len(vids), (' (' + ', '.join(vids) + ')') if vids else '', len(out.encode()) // 1024))


if __name__ == '__main__':
    main()
