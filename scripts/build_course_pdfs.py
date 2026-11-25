from __future__ import annotations

import io
import re
import subprocess
from pathlib import Path

from bs4 import BeautifulSoup
from pypdf import PdfReader
from weasyprint import HTML

ROOT = Path(__file__).resolve().parents[1]
PDF_ROOT = ROOT / "pdf"
OUTPUT_DIR = PDF_ROOT / "courses"

CSS = """
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;color:#39241d;background:#fff8f1;font-family:"DejaVu Sans",Arial,sans-serif;font-size:9.8pt;line-height:1.5}
.course-topline{margin:0 auto 7mm;padding:6mm 0 2mm;max-width:175mm;color:#b95a25;font-size:8pt;font-weight:800;letter-spacing:1.2px}
h1{margin:0 0 8mm;color:#432018;font-size:24pt;line-height:1.17}
h2{margin:10mm 0 3.5mm;padding:0 0 2mm;border-bottom:1.5pt solid #f0d6c3;color:#713114;font-size:15pt;line-height:1.3}
h2.page-start{break-before:page;page-break-before:always}
h3{margin:6mm 0 2mm;color:#a34f1e;font-size:11.5pt;line-height:1.3;break-after:avoid}
h4{color:#93471c;font-size:10.5pt;break-after:avoid}
p{margin:2.3mm 0 3.2mm}
ul,ol{padding-left:7mm}
li{margin:1.1mm 0}
pre{margin:2.5mm 0;padding:3.5mm;border-radius:3mm;background:#272220;color:#fff5eb;font-size:8.4pt;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere;break-inside:avoid}
code{font-family:"DejaVu Sans Mono",monospace;font-size:.9em;color:#a44c1b}
pre code{color:inherit}
blockquote{margin:3mm 0;padding:3mm 4mm;border-left:3pt solid #ec7a39;background:#fff2e8;break-inside:avoid}
table{width:100%;border-collapse:collapse;margin:3mm 0;font-size:8.5pt;break-inside:avoid}
th,td{padding:2.2mm;border:.6pt solid #ead9cd;text-align:left;vertical-align:top}
th{background:#fff0e4;color:#60301b}
hr{border:0;border-top:.6pt solid #ead9cd;margin:5mm 0}
.course-footer{margin-top:12mm;text-align:center;color:#92776a;font-size:8pt}
#TOC{margin:0 0 7mm;padding:5mm 7mm;border:.7pt solid #f0dfd2;background:#fffaf6;break-after:page}
#TOC::before{content:"SOMMAIRE";display:block;margin-bottom:3mm;color:#a65321;font-size:9pt;font-weight:900;letter-spacing:1px}
#TOC ul{padding-left:6mm}
#TOC li{margin:1.5mm 0;font-size:9pt}
#TOC a{color:#633b2a;text-decoration:none}
@page{size:A4;margin:16mm 17mm 18mm 17mm;@top-left{content:"ACADÉMIQUE · FORMATION";color:#a65321;font-size:7.5pt}@top-right{content:string(courseTitle);color:#a65321;font-size:7.5pt}@bottom-left{content:"©pythonschool";color:#92776a;font-size:7.5pt}@bottom-right{content:"Page " counter(page) " / " counter(pages);color:#92776a;font-size:7.5pt}}
@media print{h2,h3{break-after:avoid}pre,blockquote,table{break-inside:avoid}}
"""

def source_files() -> list[tuple[str, int, Path]]:
    found: list[tuple[str, int, Path]] = []
    for number in (2, 3, 4):
        source = PDF_ROOT / f"lecon-{number:02}.md"
        if source.exists():
            found.append(("python", number, source))
    for subject in ("python", "ia", "discord", "web"):
        folder = ROOT / "courses" / subject
        if not folder.exists():
            continue
        for source in sorted(folder.glob("lesson-*.md")):
            match = re.fullmatch(r"lesson-(\d+)", source.stem)
            if match:
                found.append((subject, int(match.group(1)), source))
    return found

def render_one(subject: str, number: int, source: Path) -> Path:
    markdown = source.read_text(encoding="utf-8")
    title = f"{subject.upper()} — Leçon {number:02}"
    result = subprocess.run(
        [
            "pandoc", "--from=markdown+pipe_tables", "--to=html5", "--standalone",
            "--toc", "--toc-depth=2", "--metadata", f"title={title}",
            "--highlight-style=pygments",
        ],
        input=markdown,
        check=True,
        capture_output=True,
        text=True,
    )
    soup = BeautifulSoup(result.stdout, "html.parser")
    headings = soup.find_all("h2")
    for heading in headings[1:]:
        heading["class"] = list(heading.get("class", [])) + ["page-start"]

    body = soup.body
    topline = soup.new_tag("div", attrs={"class": "course-topline"})
    topline.string = f"ACADÉMIQUE  /  {subject.upper()}  /  LEÇON {number:02}"
    body.insert(0, topline)
    footer = soup.new_tag("footer", attrs={"class": "course-footer"})
    footer.string = f"©pythonschool  •  {subject.upper()} — Leçon {number:02}"
    body.append(footer)
    style = soup.new_tag("style")
    style.string = CSS
    soup.head.append(style)
    if soup.title:
        soup.title.string = title
    if not soup.head.find("meta", attrs={"name": "viewport"}):
        soup.head.append(soup.new_tag("meta", attrs={"name": "viewport", "content": "width=device-width, initial-scale=1"}))

    pdf_bytes = HTML(string="<!doctype html>\n" + str(soup), base_url=str(ROOT)).write_pdf()
    page_count = len(PdfReader(io.BytesIO(pdf_bytes)).pages)
    if not 10 <= page_count <= 20:
        raise RuntimeError(
            f"{subject} leçon {number:02}: {page_count} pages produites. "
            "La contrainte est de 10 à 20 pages ; adapte la source ou la mise en page."
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUTPUT_DIR / f"{subject}-{number:02}.pdf"
    output.write_bytes(pdf_bytes)
    print(f"OK {output.relative_to(ROOT)} — {page_count} pages — {len(pdf_bytes)} octets")
    return output

def main() -> None:
    sources = source_files()
    if not sources:
        raise SystemExit("Aucune source de cours disponible.")
    print(f"{len(sources)} source(s) de cours à convertir en PDF.")
    for subject, number, source in sources:
        render_one(subject, number, source)

if __name__ == "__main__":
    main()
