const {test}=require('node:test');
const assert=require('node:assert/strict');
const Core=require('../dist/core.js');
const AI=require('../dist/ai.js');
const fs=require('node:fs');
const catalog={legacyIds:{},retiredProgramIds:[],programs:[{id:'p-example-002',name:'Secondo percorso di prova',university:'Ateneo di prova',city:'Città di prova',region:'Europa',type:'M',conditions:'—',notes:[],partners:['Ateneo di prova']},{id:'p-example-001',name:'Percorso di prova',university:'Ateneo di prova',city:'Città di prova',region:'Europa',type:'M',conditions:'—',notes:[],partners:['Ateneo di prova']}],universities:[{id:'u-example-001',name:'Ateneo di prova',city:'Città di prova',region:'Europa',offer:'',custom:false}]};

test('Prompt personale: include il catalogo e convalida un piano importato prima del salvataggio',()=>{
  const program=catalog.programs[0],other=catalog.programs[1];
  const state={...Core.empty(),preferences:'Ricerca sperimentale',favorites:[program.id],compare:[other.id],records:{[program.id]:{stage:'In preparazione',deadline:'2027-03-20',notes:'Laboratorio da verificare'}},customPrograms:[{id:'custom-abcdef12',name:'Cell Therapy',university:'Ateneo personale',city:'Perugia',region:'Europa',field:'Biotecnologie',notes:'Promemoria',createdAt:1,updatedAt:2}]};
  const prompt=AI.createPrompt(catalog,Core.normalize(state,catalog),'en');
  assert.match(prompt,/Reply in the language of this message/);
  assert.ok(prompt.includes(program.id));assert.ok(prompt.includes('custom-abcdef12'));
  assert.match(prompt,/apply_atlas_plan/);
  const imported=AI.parseResponse('```json\n'+JSON.stringify({preferences:'Neuroscienze e ricerca',selectedProgramIds:[program.id,other.id],compareProgramIds:[other.id],customProgramsToAdd:[{name:'Neurobiology',university:'Università nuova',country:'Italia',notes:'Da verificare'}],applicationUpdates:[{programId:program.id,stage:'Inviata',deadline:'2027-06-01',notes:'Invio deciso',checklist:[0,2]}]})+'\n```',catalog,state);
  assert.deepEqual(imported.selectedProgramIds,[program.id,other.id]);
  assert.equal(imported.preferences,'Neuroscienze e ricerca');
  assert.deepEqual(imported.compareProgramIds,[other.id]);
  assert.equal(imported.customProgramsToAdd[0].university,'Università nuova');
  assert.deepEqual(imported.applicationUpdates[0].checklist,[0,2]);
});

test('Il piano IA rifiuta ID inventati, link non HTTPS e stati non previsti',()=>{
  const empty=Core.empty(),base={selectedProgramIds:[]};
  assert.throws(()=>AI.parseResponse(JSON.stringify({...base,selectedProgramIds:['programma-inventato']}),catalog,empty),/ID presenti nel catalogo/);
  assert.throws(()=>AI.parseResponse(JSON.stringify({...base,customProgramsToAdd:[{name:'Master',university:'Ateneo',url:'http://example.org'}]}),catalog,empty),/HTTPS/);
  assert.throws(()=>AI.parseResponse(JSON.stringify({...base,applicationUpdates:[{programId:catalog.programs[0].id,stage:'Ammesso'}]}),catalog,empty),/stato candidatura/);
  assert.throws(()=>AI.parseResponse('testo non JSON',catalog,empty),/JSON valido/);
});
