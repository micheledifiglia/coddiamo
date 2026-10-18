import '../dist/core.js';
import assets from '../dist/server/assets.generated.mjs';
import {createHandler} from './handler.js';
import {createPasskeyAuth} from './passkeys.mjs';
import {createMcpHandler} from './mcp.js';
import * as WebAuthn from '@simplewebauthn/server';

const catalog=JSON.parse(assets['/data.json'].body);
const auth=createPasskeyAuth(WebAuthn);
const mcp=createMcpHandler(auth,globalThis.AtlasCore,catalog);
const fetch=createHandler(assets,catalog,globalThis.AtlasCore,auth,mcp);
export default {fetch};
