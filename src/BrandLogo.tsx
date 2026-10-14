import { useEffect, useState } from "react";
export type IconResolver = (args:{domain:string})=>Promise<string[]>;
const cache=new Map<string,Promise<string[]>>();
export default function BrandLogo({domain,name,resolveIcons}:{domain:string|null;name:string;resolveIcons?:IconResolver}) {
  const [icons,setIcons]=useState<string[]>([]);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let active=true;setAttempt(0);setIcons([]);
    if(!domain) return;
    if(resolveIcons) {
      if(!cache.has(domain)) cache.set(domain,resolveIcons({domain}).catch(()=>{cache.delete(domain);return [`https://${domain}/favicon.ico`];}));
      void cache.get(domain)!.then(found=>{if(active){setIcons(found);setAttempt(0);}});
    } else setIcons([`https://${domain}/favicon.ico`]);
    return ()=>{active=false;};
  },[domain,resolveIcons]);
  return <span className="result-brand-logo">{attempt<icons.length?<img src={icons[attempt]} alt={`${name} logo`} onError={()=>setAttempt(current=>current+1)} />:<span aria-label={`${name} logo unavailable`}>{name.charAt(0).toUpperCase()}</span>}</span>;
}
