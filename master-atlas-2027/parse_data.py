import re,json,pathlib
root=pathlib.Path(__file__).parent
src=pathlib.Path(r'C:\Users\miche\Downloads\Quattro_classifiche_complete_universita_Master_2027 (2).md').read_text(encoding='utf-8-sig')
groups={1:[],2:[],3:[],4:[]}; archived=[]; section=0; notes=[]
for line in src.splitlines():
    m=re.match(r'## ([1-4])\.',line)
    if m: section=int(m[1])
    if line.startswith('## Offerte storiche'): section=5
    if line.startswith('## Note sui programmi'): section=6
    if section==6 and line.startswith('- **'):
        m=re.match(r'- \*\*(.+?):\*\* (.*)',line)
        if m: notes.append({'key':m[1],'text':m[2]})
    if not line.startswith('|'): continue
    cells=[c.strip() for c in line.strip('|').split('|')]
    if section in groups and cells[0].isdigit():
        rank=int(cells[0]); link=re.match(r'\[(.+)\]\((https?://.+)\)$',cells[1]); name=link[1] if link else cells[1]
        item={'id':f'{section}-{rank}','rank':rank,'name':name,'region':'Europa' if section in (1,3) else 'Extra-Europa','url':link[2] if link else ''}
        if section<3: item.update(city=cells[2],offer=cells[3])
        else: item.update(university=cells[2],city=cells[3],type=cells[4],conditions=cells[5])
        groups[section].append(item)
    elif section==5 and len(cells)==4 and cells[0].startswith('['):
        m=re.match(r'\[(.+)\]\((.+)\)',cells[0]); archived.append({'name':m[1],'url':m[2],'university':cells[1],'city':cells[2],'status':cells[3]})
assert [len(groups[n]) for n in range(1,5)]==[20,7,146,62]
programs=groups[3]+groups[4]
for p in programs:
    base=p['university'].split('–')[0]
    p['notes']=[n['text'] for n in notes if n['key'].startswith(base+' — ') and n['key'][len(base)+3:].strip().lower()==p['name'].lower()]
    if not p['notes']:
        p['notes']=[n['text'] for n in notes if n['key'].startswith(base+' — ') and p['name'].lower().startswith(n['key'][len(base)+3:].strip().lower())]
data={'updated':'16 ottobre 2026','universities':groups[1]+groups[2],'programs':programs,'archived':archived,'notes':notes,'source':src}
(root/'dist'/'data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'programs':len(programs),'universities':len(data['universities']),'archived':len(archived),'notes':len(notes),'programs_with_notes':sum(bool(p['notes']) for p in programs)}))
