#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""화면에 실제로 그려진 한국어 문자열을 모읍니다(다국어 사전 재료).

  python3 tools/i18n_extract.py [--port 8123] [--out tools/i18n_ui_strings.json]

정적 HTML 만 훑으면 app.js 가 그리는 문장(내비게이션, 시황표 머리글, 버튼 …)을
놓치므로, 로컬 서버를 띄우고 Playwright 로 각 페이지를 렌더링한 뒤
텍스트 노드와 aria-label·placeholder·title·alt, 메타 태그를 모읍니다.
"""
import json, os, sys, argparse, re, subprocess, time, urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
HANGUL = re.compile(r"[가-힣]")

# 렌더링을 기다려야 하는 페이지들: (경로, 기다릴 선택자, 추가 대기초)
PAGES = [
    ("index.html", "#latest-grid article", 1.2),
    ("index.html?cat=economy", "#latest-grid article", 0.8),
    ("market.html", "#market-board:not([hidden])", 2.5),
    ("sourcing.html", "#sc-b-out", 1.4),
    ("resell.html", "#rs-out .rs-card", 1.4),
    ("creator.html", "#cs-ex1", 1.2),
    ("biz.html", "main", 1.0),
    ("seller.html", "main", 1.0),
    ("links.html", "main", 0.8),
    ("experts.html", "main", 0.8),
    ("about.html", "#site-footer .f-note", 0.6),
    ("contact.html", "main", 0.8),
    ("ad.html", "main", 0.8),
    ("salary.html", "main", 0.8),
    ("insurance.html", "main", 1.0),
    ("lotto.html", "main", 0.8),
    ("saju.html", "main", 0.8),
    ("forms.html", "main", 0.8),
    ("404.html", "main", 0.4),
    ("exhibitions.html", "#ex-cal .ex-chip", 1.6),
]

JS_COLLECT = r"""
() => {
  const HANGUL = /[가-힣]/;
  const out = [];
  const push = (kind, s) => {
    if (!s) return;
    const t = String(s).replace(/\s+/g, ' ').trim();
    if (!t || !HANGUL.test(t)) return;
    out.push({ kind, text: t });
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  const skipped = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE']);
  let n;
  while ((n = walker.nextNode())) {
    let p = n.parentElement;
    let skip = false;
    while (p) { if (skipped.has(p.tagName)) { skip = true; break; } p = p.parentElement; }
    if (skip) continue;
    push('text', n.nodeValue);
  }
  document.querySelectorAll('[placeholder],[aria-label],[title],[alt],[value]').forEach(el => {
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(a => {
      const v = el.getAttribute(a);
      if (v) push('attr:' + a, v);
    });
    if (el.tagName === 'INPUT' && /^(submit|button)$/i.test(el.type || '')) push('attr:value', el.value);
  });
  document.querySelectorAll('meta[name="description"],meta[property^="og:"],meta[name^="twitter:"]').forEach(m => {
    push('meta', m.getAttribute('content'));
  });
  const t = document.title; if (t) push('meta', t);
  return out;
}
"""


STATIC_TAGS_SKIP = {"script", "style", "noscript"}
STATIC_ATTRS = {"placeholder", "aria-label", "title", "alt"}
HANGUL_RE = re.compile(r"[가-힣]")


def collect_static(found, pages):
    """원본 HTML 의 텍스트 노드도 모읍니다.
    화면(렌더링 후)과 원본 마크업의 문장 경계가 다른 경우가 있어(스크립트가 문단을
    다시 그리는 페이지) 둘 다 사전 재료로 씁니다."""
    from html.parser import HTMLParser

    class P(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=True)
            self.skip = 0

        def handle_starttag(self, tag, attrs):
            if tag in STATIC_TAGS_SKIP:
                self.skip += 1
            for k, v in attrs:
                if k in STATIC_ATTRS and v and HANGUL_RE.search(v):
                    add(v, "attr:" + k, "static")

        def handle_endtag(self, tag):
            if tag in STATIC_TAGS_SKIP and self.skip:
                self.skip -= 1

        def handle_data(self, data):
            if self.skip or not HANGUL_RE.search(data):
                return
            t = re.sub(r"\s+", " ", data).strip()
            if t:
                add(t, "text", "static")

    def add(text, kind, src):
        rec = found.setdefault(text, {"text": text, "kinds": [], "pages": [], "count": 0})
        rec["count"] += 1
        if kind not in rec["kinds"]:
            rec["kinds"].append(kind)
        if src not in rec["pages"]:
            rec["pages"].append(src)

    for name in pages:
        path = os.path.join(ROOT, name)
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            html = f.read()
        P().feed(html)
    return found


PAGE_LIST = ["index.html", "market.html", "sourcing.html", "resell.html", "biz.html", "seller.html", "links.html", "lotto.html",
             "saju.html", "salary.html", "insurance.html", "forms.html", "experts.html", "about.html", "contact.html",
             "ad.html", "article.html", "404.html", "exhibitions.html"]


def ensure_server(port):
    try:
        urllib.request.urlopen(f"http://127.0.0.1:{port}/index.html", timeout=2).read(200)
        return None
    except Exception:
        proc = subprocess.Popen([sys.executable, "-m", "http.server", str(port)], cwd=ROOT,
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(30):
            time.sleep(0.3)
            try:
                urllib.request.urlopen(f"http://127.0.0.1:{port}/index.html", timeout=2).read(200)
                return proc
            except Exception:
                continue
        raise SystemExit("로컬 서버를 띄우지 못했습니다.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8123)
    ap.add_argument("--out", default=os.path.join(ROOT, "tools", "i18n_ui_strings.json"))
    ap.add_argument("--shots", default="", help="스크린샷을 남길 폴더(선택)")
    args = ap.parse_args()

    proc = ensure_server(args.port)
    from playwright.sync_api import sync_playwright

    found = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 1000})
        page = ctx.new_page()
        for path, sel, wait in PAGES:
            url = f"http://127.0.0.1:{args.port}/{path}"
            try:
                page.goto(url, wait_until="networkidle", timeout=45000)
            except Exception as e:
                print(f"  ! {path}: {e}")
                continue
            try:
                page.wait_for_selector(sel, timeout=15000)
            except Exception:
                pass
            page.wait_for_timeout(int(wait * 1000))
            try:
                items = page.evaluate(JS_COLLECT)
            except Exception as e:
                print(f"  ! {path} 수집 실패: {e}")
                continue
            for it in items:
                key = it["text"]
                rec = found.setdefault(key, {"text": key, "kinds": [], "pages": [], "count": 0})
                rec["count"] += 1
                if it["kind"] not in rec["kinds"]:
                    rec["kinds"].append(it["kind"])
                if path not in rec["pages"]:
                    rec["pages"].append(path)
            print(f"  {path:<24} {len(items):>5}개 문자열")
            if args.shots:
                os.makedirs(args.shots, exist_ok=True)
                name = re.sub(r"[^a-zA-Z0-9]+", "-", path).strip("-")
                page.screenshot(path=os.path.join(args.shots, name + ".png"), full_page=False)
        browser.close()

    # 기사 페이지도 한 편 훑습니다(본문·요약·관련기사 라벨).
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        arts = json.load(open(os.path.join(ROOT, "data", "articles.json"), encoding="utf-8"))
        for a in arts[:2]:
            url = f"http://127.0.0.1:{args.port}/a/{a['id']}.html"
            try:
                page.goto(url, wait_until="networkidle", timeout=45000)
                page.wait_for_selector("#article-body", timeout=15000)
                page.wait_for_timeout(800)
                items = page.evaluate(JS_COLLECT)
            except Exception as e:
                print(f"  ! a/{a['id']}: {e}")
                continue
            for it in items:
                key = it["text"]
                rec = found.setdefault(key, {"text": key, "kinds": [], "pages": [], "count": 0})
                rec["count"] += 1
                if it["kind"] not in rec["kinds"]:
                    rec["kinds"].append(it["kind"])
                if "a/*.html" not in rec["pages"]:
                    rec["pages"].append("a/*.html")
            print(f"  a/{a['id'][:28]:<24} {len(items):>5}개 문자열")
        browser.close()

    collect_static(found, PAGE_LIST)

    strings = sorted(found.values(), key=lambda r: (-r["count"], r["text"]))
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(strings, f, ensure_ascii=False, indent=1)
    chars = sum(len(r["text"]) for r in strings)
    print(f"\n고유 문자열 {len(strings)}개 · {chars:,}자 → {os.path.relpath(args.out, ROOT)}")
    if proc:
        proc.terminate()


if __name__ == "__main__":
    main()
