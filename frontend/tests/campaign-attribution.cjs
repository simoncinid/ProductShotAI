const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('../node_modules/typescript');
const source=fs.readFileSync('frontend/lib/ga.ts','utf8');const exportsObject={};vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:exportsObject,URLSearchParams});
const valid='?utm_source=instagram&utm_medium=organic_social&utm_campaign=free_prompt_builder_launch';
assert.deepEqual(JSON.parse(JSON.stringify(exportsObject.publicCampaign(valid+'&email=private@example.com&token=secret'))),{campaign_source:'instagram',campaign_medium:'organic_social',campaign_name:'free_prompt_builder_launch'});
assert.equal(exportsObject.publicCampaign(valid.replace('instagram','facebook')).campaign_source,'facebook');
for(const query of ['', '?email=private@example.com',valid.replace('instagram','private%40example.com'),valid.replace('organic_social','private'),valid.replace('free_prompt_builder_launch','secret-token'),'?utm_source=instagram'])assert.equal(exportsObject.publicCampaign(query),null);
console.log('PASS known public campaign retained; incomplete, unknown and private values ignored');
