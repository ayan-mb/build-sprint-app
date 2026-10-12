import {test} from "node:test";
import assert from "node:assert/strict";
import {act, createElement} from "react";
import {createRoot} from "react-dom/client";
import {parseHTML} from "linkedom";
import ParticleRing from "../src/ParticleRing";

async function simulate(hover: boolean, reduced = false) {
  const {window,document} = parseHTML('<html><body><div id="root"></div></body></html>');
  let points: {x:number;y:number}[] = [];
  let frameId = 0, seed = 42;
  const frames = new Map<number,FrameRequestCallback>();
  const originalRandom = Math.random;
  Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const context = {setTransform(){},clearRect(){points=[];},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(x:number,y:number){points.push({x,y});}};
  const canvasPrototype = Object.getPrototypeOf(document.createElement("canvas"));
  const originalContext = canvasPrototype.getContext;
  canvasPrototype.getContext = () => context;
  const bindings = {
    window,document,innerWidth:390,innerHeight:844,devicePixelRatio:1,scrollY:0,
    matchMedia:()=>({matches:reduced,addEventListener(){},removeEventListener(){}}),
    requestAnimationFrame:(callback:FrameRequestCallback)=>{frames.set(++frameId,callback);return frameId;},
    cancelAnimationFrame:(id:number)=>{frames.delete(id);},
    addEventListener:window.addEventListener.bind(window),removeEventListener:window.removeEventListener.bind(window),
    IS_REACT_ACT_ENVIRONMENT:true,
  };
  const originals = new Map(Object.keys(bindings).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  Object.assign(globalThis, bindings);
  const root = createRoot(document.getElementById("root")!);
  const tick = (time:number) => {const next=frames.entries().next().value; if(next){frames.delete(next[0]);next[1](time);}};
  try {
    await act(async()=>root.render(createElement(ParticleRing)));
    tick(0);
    assert.equal(points.length,480);
    const near = points.map((p,i)=>Math.hypot(p.x-195,p.y-844*.49)<55?i:-1).filter(i=>i>=0);
    if(hover) window.dispatchEvent(Object.assign(new window.Event("pointermove"),{pointerType:"mouse",clientX:195,clientY:844*.49}));
    for(let frame=1;frame<=120;frame++) {
      tick(frame*40);
      for(const p of points) assert.ok(Math.hypot(p.x-195,p.y-844*.49)<=390*.48+.01,"particle escaped the circle");
    }
    return {points:points.map(p=>({...p})),near,queued:frames.size};
  } finally {
    await act(async()=>root.unmount());
    assert.equal(frames.size,0,"animation frame leaked on unmount");
    Math.random=originalRandom;canvasPrototype.getContext=originalContext;
    for(const [key,descriptor] of originals) {if(descriptor) Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
  }
}
test("hover pushes nearby particles away while every particle stays inside the circle",async()=>{
  const baseline=await simulate(false),hovered=await simulate(true);
  const distance=(result:typeof baseline)=>result.near.reduce((sum,i)=>sum+Math.hypot(result.points[i].x-195,result.points[i].y-844*.49),0)/result.near.length;
  assert.ok(distance(hovered)>distance(baseline)+10,"hover did not push particles away");
  assert.notDeepEqual(baseline.points,hovered.points);
});
test("reduced motion keeps the particle field static and does not schedule more frames",async()=>{
  const staticField=await simulate(false,true),hovered=await simulate(true,true);
  assert.deepEqual(staticField.points,hovered.points);
  assert.equal(staticField.queued,0);
});
