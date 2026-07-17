"""Check HTML case files for common issues: missing closing tags, broken refs, etc."""
import glob
import os
import re
import sys
import html.parser

class TagChecker(html.parser.HTMLParser):
    """Simple HTML parser to check tag balance and collect references."""
    def __init__(self):
        super().__init__()
        self.tag_stack = []
        self.errors = []
        self.img_srcs = []
        self.css_urls = []
        self.h1_texts = []
        self.h2_texts = []
        self.void_elements = {'br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'}
        self.optional_closing = {'p', 'li', 'td', 'th', 'tr', 'thead', 'tbody', 'tfoot', 'option', 'dt', 'dd', 'rp', 'rt'}
        
    def handle_starttag(self, tag, attrs):
        if tag not in self.void_elements:
            self.tag_stack.append((tag, self.getpos()[0]))
        if tag == 'img':
            for attr_name, attr_val in attrs:
                if attr_name == 'src':
                    self.img_srcs.append(attr_val)
                    
    def handle_endtag(self, tag):
        if tag in self.void_elements:
            return
        if tag in self.optional_closing:
            # Pop matching tag if it exists, but don't error if not
            for i in range(len(self.tag_stack) - 1, -1, -1):
                if self.tag_stack[i][0] == tag:
                    self.tag_stack = self.tag_stack[:i]
                    break
            return
        if self.tag_stack and self.tag_stack[-1][0] == tag:
            self.tag_stack.pop()
        elif self.tag_stack:
            # Mismatched tag - pop until we find match or give up
            found = False
            for i in range(len(self.tag_stack) - 1, -1, -1):
                if self.tag_stack[i][0] == tag:
                    self.tag_stack = self.tag_stack[:i]
                    found = True
                    break
            if not found:
                self.errors.append(f"Line {self.getpos()[0]}: Unexpected closing tag </{tag}>")
        else:
            self.errors.append(f"Line {self.getpos()[0]}: Closing tag </{tag}> with empty stack")
            
    def handle_data(self, data):
        # Check for AsciiDoc-style markup
        if '%header' in data:
            self.errors.append(f"Line {self.getpos()[0]}: Found AsciiDoc '%header' in text content")
            
    def handle_startendtag(self, tag, attrs):
        if tag == 'img':
            for attr_name, attr_val in attrs:
                if attr_name == 'src':
                    self.img_srcs.append(attr_val)


def check_html_file(filepath):
    """Check a single HTML file and return list of issues."""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return [f"READ ERROR: {e}"]
    
    # Check for AsciiDoc markup in raw content
    if '%header' in content:
        issues.append("Contains AsciiDoc '%header' markup")
    
    # Check for mojibake in raw bytes too (belt and suspenders)
    try:
        with open(filepath, 'rb') as f:
            raw = f.read()
        count = raw.count(b'\xc3\xa2')
        if count > 0:
            issues.append(f"MOJIBAKE: {count} â sequences in raw bytes")
    except:
        pass
    
    # Parse HTML
    checker = TagChecker()
    try:
        checker.feed(content)
    except Exception as e:
        issues.append(f"PARSE ERROR: {e}")
    
    # Report tag balance issues
    if checker.tag_stack:
        for tag, line in checker.tag_stack:
            issues.append(f"Unclosed tag <{tag}> opened at line {line}")
    
    issues.extend(checker.errors)
    
    # Check image references
    base_dir = os.path.dirname(filepath)
    for src in checker.img_srcs:
        if src.startswith('data:') or src.startswith('http'):
            continue
        # Resolve relative to HTML file location
        img_path = os.path.normpath(os.path.join(base_dir, src))
        if not os.path.exists(img_path):
            issues.append(f"Broken image reference: {src} (resolved: {img_path})")
    
    # Check for CSS font-face URL references
    url_pattern = re.findall(r"url\(['\"]?([^'\"()]+\.ttf)['\"]?\)", content)
    for url in url_pattern:
        if url.startswith('data:'):
            continue
        font_path = os.path.normpath(os.path.join(base_dir, url))
        if not os.path.exists(font_path):
            issues.append(f"Broken font reference: {url} (resolved: {font_path})")
    
    # Check for duplicate h1/h2 headings within the same file
    h1_texts = re.findall(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL)
    h1_clean = [re.sub(r'<[^>]+>', '', h).strip() for h in h1_texts]
    seen_h1 = {}
    for h in h1_clean:
        if h in seen_h1:
            issues.append(f"Duplicate H1 heading: '{h}'")
        seen_h1[h] = True
    
    # Check for common HTML issues
    if re.search(r'</br>', content):
        issues.append("Found invalid </br> closing tag")
    if re.search(r'</hr>', content):
        issues.append("Found invalid </hr> closing tag")
    
    return issues


def main():
    html_files = glob.glob('docs/case-files/**/*.html', recursive=True)
    print(f"Checking {len(html_files)} HTML files in case-files...")
    print()
    
    dir_issues = {}
    total_issues = 0
    clean_count = 0
    
    for filepath in sorted(html_files):
        issues = check_html_file(filepath)
        case_dir = os.path.relpath(filepath, 'docs/case-files').split(os.sep)[0]
        
        if case_dir not in dir_issues:
            dir_issues[case_dir] = []
        
        if issues:
            total_issues += len(issues)
            print(f"ISSUES in {filepath}:")
            for issue in issues:
                print(f"  - {issue}")
            dir_issues[case_dir].append((filepath, issues))
        else:
            clean_count += 1
            # Print clean files only if verbose
            # print(f"CLEAN: {filepath}")
    
    print()
    print(f"{'='*60}")
    print(f"Summary: {clean_count} clean, {len(html_files) - clean_count} with issues, {total_issues} total issues")
    
    if dir_issues:
        print()
        print("Issues by case directory:")
        for d in sorted(dir_issues):
            files_with_issues = dir_issues[d]
            issue_count = sum(len(iss) for _, iss in files_with_issues)
            if issue_count > 0:
                print(f"  {d}: {len(files_with_issues)} file(s) with {issue_count} issue(s)")
    
    sys.exit(0 if total_issues == 0 else 1)


if __name__ == '__main__':
    main()
