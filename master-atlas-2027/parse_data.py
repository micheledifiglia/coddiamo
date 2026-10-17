import re,json,pathlib,hashlib,argparse
root=pathlib.Path(__file__).parent
parser=argparse.ArgumentParser(description='Rigenera il catalogo dal dossier versionato.')
parser.add_argument('--source',type=pathlib.Path,default=root/'data'/'dossier.md')
parser.add_argument('--output',type=pathlib.Path,default=root/'dist'/'data.json')
args=parser.parse_args()
src=args.source.read_text(encoding='utf-8-sig')
legacy=json.loads((root/'data'/'legacy-ids.json').read_text(encoding='utf-8'))
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
        identity='|'.join(('program' if section>2 else 'university',cells[2] if section>2 else '',name)).casefold()
        stable=('p-' if section>2 else 'u-')+hashlib.sha256(identity.encode()).hexdigest()[:20]
        item={'id':stable,'rank':rank,'name':name,'region':'Europa' if section in (1,3) else 'Extra-Europa','url':link[2] if link else ''}
        if section<3: item.update(city=cells[2],offer=cells[3])
        else: item.update(university=cells[2],city=cells[3],type=cells[4],conditions=cells[5])
        groups[section].append(item)
    elif section==5 and len(cells)==4 and cells[0].startswith('['):
        m=re.match(r'\[(.+)\]\((.+)\)',cells[0]); archived.append({'name':m[1],'url':m[2],'university':cells[1],'city':cells[2],'status':cells[3]})
assert all(groups[n] for n in range(1,5)), 'Una classifica è vuota'
programs=groups[3]+groups[4]
for p in programs:
    base=p['university'].split('–')[0]
    p['partners']=[s.strip() for s in re.split('[–—]',p['university'])]
    p['notes']=[n['text'] for n in notes if n['key'].startswith(base+' — ') and n['key'][len(base)+3:].strip().lower()==p['name'].lower()]
    if not p['notes']:
        p['notes']=[n['text'] for n in notes if n['key'].startswith(base+' — ') and p['name'].lower().startswith(n['key'][len(base)+3:].strip().lower())]
assert len({p['id'] for p in programs})==len(programs), 'Identificativi duplicati'
updated=re.search(r'Aggiornamento: ([^.]+)\.',src)
data={'schemaVersion':2,'legacyIds':legacy,'updated':updated[1] if updated else 'Non indicato','universities':groups[1]+groups[2],'programs':programs,'archived':archived,'notes':notes,'source':src}
args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'programs':len(programs),'universities':len(data['universities']),'archived':len(archived),'notes':len(notes),'programs_with_notes':sum(bool(p['notes']) for p in programs)}))
