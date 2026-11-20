from pathlib import Path
import base64
import gzip
import subprocess
from bs4 import BeautifulSoup
from weasyprint import HTML

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "pdf"
SOURCE_B64 = PDF_DIR / "lecon-01-content.md.gz.b64"
MD = gzip.decompress(base64.b64decode(SOURCE_B64.read_text(encoding="ascii"))).decode("utf-8")

result = subprocess.run(
    ["pandoc", "--from=markdown+pipe_tables", "--to=html5", "--standalone",
     "--toc", "--toc-depth=2", "--metadata",
     "title=Leçon 01 — Découvrir Python | PythonSchool", "--highlight-style=pygments"],
    input=MD, check=True, capture_output=True, text=True
)
soup = BeautifulSoup(result.stdout, "html.parser")
print_starts = {
    "4. Préparer Pydroid 3 sur Android",
    "7. Le texte et les guillemets",
    "10. Comprendre l'ordre d'exécution",
    "12. Lire et corriger les erreurs",
    "15. Exercices progressifs",
    "16. Corrigés détaillés",
}
for heading in soup.find_all("h2"):
    if heading.get_text(" ", strip=True) in print_starts:
        heading["class"] = list(heading.get("class", [])) + ["print-start"]

body = soup.body
topline = soup.new_tag("div", attrs={"class": "reader-topline"})
topline.string = "PYTHONSCHOOL  /  FORMATION PYTHON  /  LEÇON 01"
body.insert(0, topline)
footer = soup.new_tag("footer", attrs={"class": "reader-footer"})
footer.string = "©pythonschool  •  Leçon 01 — Découvrir Python et écrire ses premières instructions"
body.append(footer)

css = """
:root{--paper:#fff7ef;--ink:#432018;--muted:#82675d;--orange:#ed741f;--line:#efdfd1}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:"DejaVu Sans",Arial,sans-serif;font-size:15px;line-height:1.72}
.reader-topline{max-width:960px;margin:0 auto;padding:22px 26px 8px;color:#c85c16;font-size:11px;font-weight:800;letter-spacing:1.4px}
#TOC,.lesson-shell{max-width:960px;margin:10px auto 34px;padding:40px 58px;border:1px solid #f1e4d9;border-radius:24px;background:#fff}
#TOC{margin-top:28px;padding:23px 27px;background:#fff8f1}#TOC::before{content:"PLAN DE LA LEÇON";display:block;margin-bottom:12px;color:#a65321;font-size:11px;font-weight:900;letter-spacing:1.1px}
#TOC ul{padding-left:21px}#TOC li{margin:5px 0;font-size:13px}#TOC a{color:#694133;text-decoration:none}
h1{font-size:34px;line-height:1.18;color:#3c1a12}h2{margin:2.1em 0 .75em;padding-bottom:9px;border-bottom:2px solid #f4d7c1;color:#6c2c14;font-size:23px}
h3{margin:1.6em 0 .5em;color:#9e4c1c;font-size:18px}h4{color:#9e4c1c}p{margin:.65em 0 1em}
pre{padding:16px;border-radius:12px;background:#2b2522;color:#fff8ef;font-size:12px;white-space:pre-wrap;overflow-wrap:anywhere}
code{padding:2px 5px;border-radius:5px;background:#fff0e4;color:#a44413;font-family:"DejaVu Sans Mono",monospace;font-size:.9em}
pre code{padding:0;background:transparent;color:inherit}blockquote{padding:13px 17px;border-left:4px solid #ed741f;background:#fff5ec}
table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:8px;border:1px solid #eedfd1;text-align:left;vertical-align:top}th{background:#fff0e3}
.reader-footer{text-align:center;color:#9a7767;font-size:10px}
@page{size:A4;margin:17mm 16mm 19mm 16mm;@top-left{content:"PYTHONSCHOOL / FORMATION PYTHON";color:#a65321;font-size:8pt}@top-right{content:"LEÇON 01";color:#a65321;font-size:8pt}@bottom-left{content:"©pythonschool";color:#9a7767;font-size:8pt}@bottom-right{content:"Page " counter(page) " / " counter(pages);color:#9a7767;font-size:8pt}}
@media print{body{background:#fff;font-size:10.4pt;line-height:1.58}.reader-topline{padding:0 0 7mm}.lesson-shell{max-width:none;margin:0;padding:0;border:0;border-radius:0}h1{font-size:25pt}h2{font-size:16pt;margin-top:1.7em}h3{font-size:12.5pt}h2.print-start{break-before:page;page-break-before:always}h2,h3{break-after:avoid}pre,blockquote,tr{break-inside:avoid}#TOC{break-after:page}a{color:#753313;text-decoration:none}}
@media(max-width:640px){body{font-size:14px}.reader-topline{padding:15px 16px}.lesson-shell,#TOC{margin:8px;padding:22px 18px;border-radius:16px}h1{font-size:28px}h2{font-size:20px}pre{font-size:11px;padding:12px}}
"""
style = soup.new_tag("style")
style.string = css
soup.head.append(style)
if not soup.head.find("meta", attrs={"name": "viewport"}):
    meta = soup.new_tag("meta", attrs={"name": "viewport", "content": "width=device-width, initial-scale=1"})
    soup.head.append(meta)
if soup.title:
    soup.title.string = "Leçon 01 — Découvrir Python | PythonSchool"

HTML(string="<!doctype html>\n" + str(soup), base_url=str(ROOT)).write_pdf(str(PDF_DIR / "lecon-01-python-school.pdf"))
print("PDF généré :", PDF_DIR / "lecon-01-python-school.pdf")
