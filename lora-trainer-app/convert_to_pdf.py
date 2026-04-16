#!/usr/bin/env python3
"""Convert markdown files to PDF - Simple approach with built-in fonts"""

import re
from pathlib import Path
from fpdf import FPDF

def clean_markdown_to_text(content: str) -> str:
    """Convert markdown to plain text suitable for PDF"""
    lines = content.split('\n')
    output_lines = []
    in_code_block = False
    in_table = False

    for line in lines:
        # Skip code blocks
        if line.startswith('```'):
            if in_code_block:
                in_code_block = False
                output_lines.append('')
            else:
                in_code_block = True
                output_lines.append('--- CODE BLOCK ---')
            continue

        if in_code_block:
            continue

        # Process headers
        if line.startswith('# '):
            output_lines.append('')
            output_lines.append('=== ' + line[2:].strip().upper() + ' ===')
            output_lines.append('')
        elif line.startswith('## '):
            output_lines.append('')
            output_lines.append('--- ' + line[3:].strip().upper() + ' ---')
            output_lines.append('')
        elif line.startswith('### '):
            output_lines.append('')
            output_lines.append(line[4:].strip().upper())
            output_lines.append('')
        elif line.startswith('#### '):
            output_lines.append(line[5:].strip())
            output_lines.append('')
        # Horizontal rule
        elif line.startswith('---') or line.startswith('***'):
            output_lines.append('')
            output_lines.append('-' * 50)
            output_lines.append('')
        # Bullet points
        elif line.strip().startswith('- ') or line.strip().startswith('* '):
            text = line.strip()[2:]
            text = clean_inline(text)
            output_lines.append('  * ' + text)
        # Table rows
        elif line.startswith('|'):
            if not in_table:
                in_table = True
                output_lines.append('')
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if cells and not all(c.startswith('-') for c in cells):
                row = '  | '.join(clean_inline(c) for c in cells[:4])
                output_lines.append(row)
        # Empty lines
        elif not line.strip():
            if not in_table:
                output_lines.append('')
            in_table = False
        # Regular text
        else:
            text = clean_inline(line)
            if text.strip():
                output_lines.append(text)

    return '\n'.join(output_lines)


def clean_inline(text: str) -> str:
    """Clean inline markdown formatting"""
    # Remove bold/italic
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'__(.+?)__', r'\1', text)
    text = re.sub(r'_(.+?)_', r'\1', text)
    # Remove inline code
    text = re.sub(r'`(.+?)`', r'\1', text)
    # Convert links to just text
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    # Remove image syntax
    text = re.sub(r'!\[([^\]]*)\]\([^)]+\)', r'\1', text)
    # Remove box-drawing characters
    for char in '\u2500\u2502\u250c\u2510\u2514\u2518\u251c\u2524\u252c\u2534\u253c':
        text = text.replace(char, '+')
    for char in '\u2550\u2551\u2554\u2557\u255a\u255d\u2560\u2563\u2566\u2569\u256c':
        text = text.replace(char, '+')
    # Replace other problematic unicode
    text = text.replace('\u2014', '-')  # em dash
    text = text.replace('\u2013', '-')  # en dash
    text = text.replace('\u2018', "'")  # left single quote
    text = text.replace('\u2019', "'")  # right single quote
    text = text.replace('\u201c', '"')  # left double quote
    text = text.replace('\u201d', '"')  # right double quote
    return text


def convert_md_to_pdf(md_path: str, output_path: str):
    """Convert a markdown file to PDF"""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    title = Path(md_path).stem.replace('_', ' ').replace('-', ' ')
    text_content = clean_markdown_to_text(content)

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_margins(15, 15, 15)

    # Title
    pdf.set_font('Helvetica', 'B', 20)
    pdf.set_text_color(41, 128, 185)
    pdf.cell(0, 15, title, new_x='LMARGIN', new_y='NEXT', align='C')
    pdf.set_text_color(0, 0, 0)
    pdf.set_font('Helvetica', '', 11)
    pdf.ln(10)

    # Add content line by line
    lines = text_content.split('\n')
    for line in lines:
        # Check page break
        if pdf.get_y() > 270:
            pdf.add_page()

        # Handle section markers
        if line.startswith('=== ') and line.endswith(' ==='):
            pdf.set_font('Helvetica', 'B', 16)
            pdf.set_text_color(41, 128, 185)
            pdf.cell(0, 12, line[4:-4], new_x='LMARGIN', new_y='NEXT')
            pdf.set_text_color(0, 0, 0)
            pdf.set_font('Helvetica', '', 11)
            pdf.ln(5)
        elif line.startswith('--- ') and line.endswith(' ---'):
            pdf.set_font('Helvetica', 'B', 13)
            pdf.cell(0, 10, line[4:-4], new_x='LMARGIN', new_y='NEXT')
            pdf.set_font('Helvetica', '', 11)
            pdf.ln(3)
        elif line.startswith('  * '):
            # Bullet point
            pdf.set_x(20)
            text = line[4:]
            if len(text) > 115:
                text = text[:112] + '...'
            pdf.cell(5, 6, '-', new_x='RIGHT', new_y='TOP')
            pdf.cell(0, 6, text, new_x='LMARGIN', new_y='NEXT')
        elif line.startswith('  | '):
            # Table row
            text = line[4:]
            if len(text) > 115:
                text = text[:112] + '...'
            pdf.cell(0, 6, text, new_x='LMARGIN', new_y='NEXT')
        elif line == '-' * 50:
            # Horizontal rule
            y = pdf.get_y()
            pdf.line(15, y, 195, y)
            pdf.ln(8)
        elif line == '--- CODE BLOCK ---':
            pdf.set_font('Courier', '', 9)
            pdf.set_fill_color(240, 240, 240)
            pdf.cell(0, 8, '[Code block content omitted - see original markdown]', border=1, fill=True, new_x='LMARGIN', new_y='NEXT')
            pdf.set_font('Helvetica', '', 11)
        elif line.strip() == '':
            pdf.ln(3)
        else:
            # Regular text - wrap if needed
            if len(line) > 120:
                words = line.split()
                current = []
                current_len = 0
                for word in words:
                    if current_len + len(word) + 1 > 115:
                        pdf.cell(0, 6, ' '.join(current), new_x='LMARGIN', new_y='NEXT')
                        current = [word]
                        current_len = len(word)
                    else:
                        current.append(word)
                        current_len += len(word) + 1
                if current:
                    pdf.cell(0, 6, ' '.join(current), new_x='LMARGIN', new_y='NEXT')
            else:
                if line.strip():
                    pdf.cell(0, 6, line, new_x='LMARGIN', new_y='NEXT')

    pdf.output(str(output_path))
    print(f"Created: {output_path}")


if __name__ == '__main__':
    base_dir = Path(r'E:\Claude\.claude\lora-trainer-app')

    files_to_convert = [
        ('PRD.md', 'PRD.pdf'),
        ('DEVELOPMENT_PROMPT.md', 'DEVELOPMENT_PROMPT.pdf'),
    ]

    for md_file, pdf_file in files_to_convert:
        md_path = base_dir / md_file
        pdf_path = base_dir / pdf_file

        try:
            convert_md_to_pdf(str(md_path), pdf_path)
        except Exception as e:
            print(f"Error converting {md_file}: {e}")

    print("\nConversion complete!")
