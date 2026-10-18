/* Shared, dependency-free state rules: browser, Worker and regression tests. */
(function (root) {
  'use strict';
  const stages = ['Da valutare', 'In preparazione', 'Inviata', 'Esito ricevuto'];
  const empty = () => ({favorites: [], compare: [], records: {}, favoritesUpdated: {}, compareUpdated: 0, preferences: '', preferencesUpdatedAt: 0, customPrograms: [], customUniversities: [], catalogPrograms: {}, catalogUniversities: {}});
  const timestamp = v => Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : 0;
  const clean = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  const normalizeUniversityKey = value => clean(value, 140).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').toLocaleLowerCase('it');
  function normalizeCustomPrograms(raw) {
    const rows = Array.isArray(raw) ? raw.slice(-100) : [], result = [], seen = new Set();
    for (const item of rows) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !/^custom-[a-z0-9_-]{6,64}$/i.test(item.id) || seen.has(item.id)) continue;
      const name = clean(item.name, 180), university = clean(item.university, 140);
      if (!name || !university) continue;
      let url = clean(item.url, 1200);
      try { if (url && new URL(url).protocol !== 'https:') url = ''; } catch { url = ''; }
      const region = ['Europa', 'Extra-Europa'].includes(item.region) ? item.region : 'Europa';
      result.push({
        id: item.id, name, university, city: clean(item.city, 100), region,
        country: clean(item.country, 100), degree: clean(item.degree, 100), field: clean(item.field, 180),
        url, notes: clean(item.notes, 3000), type: 'Percorso personale', conditions: '—', rank: 999999,
        custom: true, createdAt: timestamp(item.createdAt), updatedAt: timestamp(item.updatedAt),
        deletedAt: timestamp(item.deletedAt)
      });
      seen.add(item.id);
    }
    return result;
  }
  function normalizeCustomUniversities(raw) {
    const rows = Array.isArray(raw) ? raw.slice(-100) : [], result = [], seenIds = new Set(), seenNames = new Set();
    for (const item of rows) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !/^custom-uni-[a-z0-9_-]{6,64}$/i.test(item.id) || seenIds.has(item.id)) continue;
      const name = clean(item.name, 140), key = normalizeUniversityKey(name);
      if (!name || !key || seenNames.has(key)) continue;
      let url = clean(item.url, 1200);
      try { if (url && new URL(url).protocol !== 'https:') url = ''; } catch { url = ''; }
      result.push({id:item.id, name, city:clean(item.city,100), country:clean(item.country,100), region:['Europa','Extra-Europa'].includes(item.region)?item.region:'Europa', url, offer:clean(item.offer,500), createdAt:timestamp(item.createdAt), updatedAt:timestamp(item.updatedAt), deletedAt:timestamp(item.deletedAt)});
      seenIds.add(item.id); seenNames.add(key);
    }
    return result;
  }
  function normalizeCatalogMembership(raw, validIds, legacyIds) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return Object.fromEntries(legacyIds.map(id => [id,{included:true,updatedAt:0}]));
    const result = {};
    for (const [id, value] of Object.entries(raw).slice(-400)) {
      if (!validIds.has(id) || !value || typeof value !== 'object' || typeof value.included !== 'boolean') continue;
      result[id] = {included:value.included,updatedAt:timestamp(value.updatedAt)};
    }
    return result;
  }
  function normalize(raw, catalog) {
    raw = raw && typeof raw === 'object' ? raw : {};
    const result = empty();
    result.preferences = clean(raw.preferences, 2000);
    result.preferencesUpdatedAt = timestamp(raw.preferencesUpdatedAt);
    result.customPrograms = normalizeCustomPrograms(raw.customPrograms);
    result.customUniversities = normalizeCustomUniversities(raw.customUniversities);
    const catalogIds = new Set(catalog.programs.map(p => p.id)), universityIds = new Set(catalog.universities.map(u => u.id));
    result.catalogPrograms = normalizeCatalogMembership(raw.catalogPrograms, catalogIds, catalog.programs.map(p => p.id));
    result.catalogUniversities = normalizeCatalogMembership(raw.catalogUniversities, universityIds, catalog.universities.map(u => u.id));
    const activeCustom = result.customPrograms.filter(p => !p.deletedAt);
    const customIds = new Set(activeCustom.map(p => p.id));
    const ids = new Set([...catalog.programs.map(p => p.id), ...customIds]);
    const map = id => ids.has(id) ? id : catalog.legacyIds?.[id];
    for (const field of ['favorites','compare']) {
      result[field] = [...new Set((Array.isArray(raw[field]) ? raw[field] : []).map(map).filter(id => ids.has(id)))];
    }
    result.compare = result.compare.slice(0,4);
    result.compareUpdated = timestamp(raw.compareUpdated);
    for (const [oldId, r] of Object.entries(raw.records || {})) {
      const id = map(oldId);
      if (!ids.has(id) || !r || typeof r !== 'object') continue;
      result.records[id] = {
        stage: stages.includes(r.stage) ? r.stage : '',
        deadline: typeof r.deadline === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.deadline) ? r.deadline : '',
        deadlineUrl: typeof r.deadlineUrl === 'string' && /^https?:\/\//.test(r.deadlineUrl) ? r.deadlineUrl.slice(0,3000) : '',
        notes: typeof r.notes === 'string' ? r.notes.slice(0,50000) : '',
        checklist: [...new Set((Array.isArray(r.checklist) ? r.checklist : []).filter(i => Number.isInteger(i) && i >= 0 && i <= 4))],
        updatedAt: timestamp(r.updatedAt)
      };
    }
    for (const [oldId, r] of Object.entries(raw.favoritesUpdated || {})) {
      const id = map(oldId);
      if (ids.has(id) && r && typeof r === 'object') result.favoritesUpdated[id] = {selected: r.selected === true, updatedAt: timestamp(r.updatedAt)};
    }
    for (const id of result.favorites) if (!result.favoritesUpdated[id]) result.favoritesUpdated[id] = {selected: true, updatedAt: 0};
    result.favorites = Object.keys(result.favoritesUpdated).filter(id => result.favoritesUpdated[id].selected);
    return result;
  }
  function merge(a, b) {
    const result = empty();
    const newerPreferences = timestamp(b.preferencesUpdatedAt) > timestamp(a.preferencesUpdatedAt) ? b : a;
    result.preferences = newerPreferences.preferences || '';
    result.preferencesUpdatedAt = timestamp(newerPreferences.preferencesUpdatedAt);
    const custom = new Map((a.customPrograms || []).map(p => [p.id, p]));
    for (const item of b.customPrograms || []) {
      const prior = custom.get(item.id);
      if (!prior || timestamp(item.updatedAt) >= timestamp(prior.updatedAt)) custom.set(item.id, item);
    }
    result.customPrograms = [...custom.values()].slice(-100);
    const universities = new Map((a.customUniversities || []).map(item => [item.id,item]));
    for (const item of b.customUniversities || []) {
      const prior = universities.get(item.id);
      if (!prior || timestamp(item.updatedAt) >= timestamp(prior.updatedAt)) universities.set(item.id,item);
    }
    result.customUniversities = [...universities.values()].slice(-100);
    for (const field of ['catalogPrograms','catalogUniversities']) {
      result[field] = {...(a[field] || {})};
      for (const [id,item] of Object.entries(b[field] || {})) if (!result[field][id] || timestamp(item.updatedAt) >= timestamp(result[field][id].updatedAt)) result[field][id] = item;
    }
    result.records = {...a.records};
    for (const [id,r] of Object.entries(b.records)) {
      if (!result.records[id] || timestamp(r.updatedAt) > timestamp(result.records[id].updatedAt)) result.records[id] = r;
    }
    result.favoritesUpdated = {...a.favoritesUpdated};
    for (const [id,r] of Object.entries(b.favoritesUpdated)) {
      if (!result.favoritesUpdated[id] || timestamp(r.updatedAt) > timestamp(result.favoritesUpdated[id].updatedAt)) result.favoritesUpdated[id] = r;
    }
    result.favorites = Object.keys(result.favoritesUpdated).filter(id => result.favoritesUpdated[id].selected);
    const newer = b.compareUpdated > a.compareUpdated ? b : a;
    result.compare = [...newer.compare]; result.compareUpdated = newer.compareUpdated;
    return result;
  }
  function importBackup(current, incoming, replace, now) {
    const result = JSON.parse(JSON.stringify(current));
    if (timestamp(incoming.preferencesUpdatedAt) >= timestamp(result.preferencesUpdatedAt)) {
      result.preferences = incoming.preferences || '';
      result.preferencesUpdatedAt = timestamp(incoming.preferencesUpdatedAt) || now;
    }
    const custom = new Map((result.customPrograms || []).map(p => [p.id, p]));
    for (const item of incoming.customPrograms || []) {
      if (!custom.has(item.id) || replace || timestamp(item.updatedAt) >= timestamp(custom.get(item.id).updatedAt)) custom.set(item.id, item);
    }
    result.customPrograms = [...custom.values()].slice(-100);
    const universities = new Map((result.customUniversities || []).map(item => [item.id,item]));
    for (const item of incoming.customUniversities || []) if (!universities.has(item.id) || replace || timestamp(item.updatedAt) >= timestamp(universities.get(item.id).updatedAt)) universities.set(item.id,item);
    result.customUniversities = [...universities.values()].slice(-100);
    for (const field of ['catalogPrograms','catalogUniversities']) {
      result[field] ||= {};
      for (const [id,item] of Object.entries(incoming[field] || {})) if (!result[field][id] || replace || timestamp(item.updatedAt) >= timestamp(result[field][id].updatedAt)) result[field][id] = item;
    }
    for (const [id,r] of Object.entries(incoming.records)) {
      if (!result.records[id] || replace) result.records[id] = {...r, updatedAt: now};
    }
    for (const id of incoming.favorites) {
      if (!result.favoritesUpdated[id] || replace) result.favoritesUpdated[id] = {selected:true, updatedAt:now};
    }
    result.favorites = Object.keys(result.favoritesUpdated).filter(id => result.favoritesUpdated[id].selected);
    result.compare = [...new Set([...result.compare, ...incoming.compare])].slice(0,4);
    result.compareUpdated = now;
    return result;
  }
  function conflicts(a,b) {
    return Object.keys(b.records).filter(id => a.records[id] && ['notes','stage','deadline','deadlineUrl','checklist'].some(k => JSON.stringify(a.records[id][k]) !== JSON.stringify(b.records[id][k])));
  }
  function belongsTo(program, university) {
    const aliases = {'Queensland — UQ':'UQ','Erasmus University / Erasmus MC':'Erasmus MC'};
    const name = aliases[university] || university;
    return program.university === name || (program.partners || program.university.split(/[–—]/).map(s=>s.trim())).includes(name);
  }
  const api = {empty,normalize,normalizeCustomPrograms,normalizeCustomUniversities,normalizeUniversityKey,merge,importBackup,conflicts,belongsTo,stages};
  root.AtlasCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
