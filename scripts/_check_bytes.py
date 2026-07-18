"""Show actual bytes around corruption in a .adoc file."""
import sys

with open('docs/chapters/01-introduction.adoc', 'rb') as f:
    raw = f.read()

# Find first occurrence of C3 A2 (corrupted â)
idx = raw.find(b'\xc3\xa2')
with open('_bytes_output.txt', 'w', encoding='utf-8') as out:
    if idx >= 0:
        start = max(0, idx - 10)
        end = min(len(raw), idx + 25)
        chunk = raw[start:end]
        hex_str = ' '.join(f'{b:02x}' for b in chunk)
        
        try:
            text = chunk.decode('utf-8')
            out.write(f'Bytes at offset {start}-{end}: {hex_str}\n')
            out.write(f'Decoded as UTF-8: {repr(text)}\n')
        except Exception as e:
            out.write(f'Bytes: {hex_str}\n')
            out.write(f'Error: {e}\n')
    
    # Full double-encoded em dash sequence
    full_seq = b'\xc3\xa2\xe2\x82\xac\xe2\x80\x9d'
    count = raw.count(full_seq)
    out.write(f'\nFull double-encoded em dash sequence count: {count}\n')
    
    if count > 0:
        idx2 = raw.find(full_seq)
        ctx_start = max(0, idx2 - 5)
        ctx_end = min(len(raw), idx2 + len(full_seq) + 15)
        ctx = raw[ctx_start:ctx_end]
        out.write(f'Context bytes: {ctx.hex(" ")}\n')
        out.write(f'Context as UTF-8: {repr(ctx.decode("utf-8", errors="replace"))}\n')

print('Output written to _bytes_output.txt')
