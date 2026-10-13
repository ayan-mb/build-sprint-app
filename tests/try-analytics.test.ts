import test from 'node:test';
import assert from 'node:assert/strict';
import { createTryAnalytics, eventProperties, safeAnalyticsPayload } from '../src/tryAnalytics';

test('tracking stays on home and sends only allowed batch details', async () => {
  let path='/admin'; let loads=0; const sent: unknown[]=[]; let config:any;
  const saved=new Map<string,string>();
  const analytics=createTryAnalytics({path:()=>path,origin:()=> 'https://example.com',storage:()=>({getItem:k=>saved.get(k)??null,setItem:(k,v)=>{saved.set(k,v);}}),load:async()=>{loads++;return {init:(_token,c)=>{config=c;},track:(event,properties)=>{sent.push({event,properties});}};}});
  for (const route of ['/admin','/saved','/try']) { path=route; await analytics.init(); analytics.track('Draft copied'); }
  assert.equal(loads,0);
  path='/'; await analytics.init();
  analytics.batchStarted('local-id',2,'https://www.example.com/private?email=secret');
  analytics.batchStarted('local-id',2,'example.com');
  analytics.batchFinished('local-id',2,1); analytics.batchFinished('local-id',2,1);
  analytics.batchFinished('old-run',2,2);
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.deepEqual(sent,[{event:'Try page viewed',properties:{}},{event:'Batch started',properties:{question_count:2,nbfc_domain:'example.com',mode:'multiple'}},{event:'Batch finished',properties:{question_count:2,result_count:1}}]);
  assert.equal(config.record_sessions_percent,100); assert.equal(config.record_heatmap_data,true);
  assert.equal(config.record_mask_all_text,true); assert.equal(config.record_mask_all_inputs,true);
  assert.equal(config.record_network,false); assert.equal(config.record_console,false); assert.equal(config.ip,false);
  assert.ok(config.record_block_selector.includes('.draft-box'));
  assert.deepEqual(eventProperties('Batch started',{question_count:2,nbfc_domain:'example.com',question:'private',draft:'private',email:'private'}),{question_count:2,nbfc_domain:'example.com'});
  assert.deepEqual(eventProperties('Draft copied',{draft:'private'}),{});
});

test('outgoing heatmaps strip text and links; all events stop outside home',()=>{
  const payload={event:'$mp_click',properties:{$current_url:'https://example.com/?email=private',email:'private',$clientX:10,$clientY:20,$elements:[{$tag_name:'button',$nth_child:1,$text:'private',$attr__href:'private'}]}};
  const result=safeAnalyticsPayload(payload,'/','https://example.com')!;
  assert.deepEqual(result.properties.$elements,[{$tag_name:'button',$nth_child:1}]);
  assert.equal(result.properties.$current_url,'https://example.com/'); assert.equal(result.properties.email,undefined);
  assert.equal(result.properties.$clientX,10);
  assert.equal(safeAnalyticsPayload(payload,'/saved','https://example.com'),null);
  assert.equal(safeAnalyticsPayload({event:'$mp_input_change',properties:{}},'/','https://example.com'),null);
});

 test('chosen mode survives the final analytics filter without sending question text', () => {
  for (const mode of ['single', 'multiple']) {
    const payload = safeAnalyticsPayload({event:'Batch started',properties:{mode,question_count:1,question:'private'}},'/','https://example.com');
    assert.equal(payload?.properties.mode,mode);
    assert.equal(payload?.properties.question,undefined);
  }
  assert.deepEqual(eventProperties('Batch started',{mode:'private'}),{});
});
