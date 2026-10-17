import '../dist/core.js';
import assets from '../dist/server/assets.generated.mjs';
import {createHandler} from './handler.js';
import {createOAuthAuth} from './oauth.mjs';

const catalog=JSON.parse(assets['/data.json'].body);
const auth=createOAuthAuth();
const fetch=createHandler(assets,catalog,globalThis.AtlasCore,auth);
export default {fetch};
