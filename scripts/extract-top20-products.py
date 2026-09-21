import json
from pathlib import Path

SOURCE = Path('/home/ubuntu/.mcp/tool-results/2026-09-21_08-12-26.518933031_supabase_execute_sql_6be6d37a.json')
OUTPUT = Path('/home/ubuntu/mofuhavenhk/top20-products-source.json')

data = json.loads(SOURCE.read_text())
text = data['result']
start = text.find('[{')
end = text.rfind('}]') + 2
if start < 0 or end <= start:
    raise RuntimeError('Could not locate JSON array in MCP result')
rows = json.loads(text[start:end])
OUTPUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2))
print(f'extracted {len(rows)} products to {OUTPUT}')
for row in rows:
    print(row.get('mofu_sku'), row.get('name_zh'))

if __name__ == '__main__':
    pass

# No database writes are performed by this script.
