import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export default function PromptEditor({value,onChange,disabled,inputRef}:{value:string;onChange:(value:string)=>void;disabled:boolean;inputRef:RefObject<HTMLTextAreaElement|null>}) {
  const mirror=useRef<HTMLDivElement>(null);
  const gutter=useRef<HTMLDivElement>(null);
  const [heights,setHeights]=useState<number[]>([]);
  const lines=value.split(/\r?\n/);
  useLayoutEffect(()=>{
    const element=mirror.current;
    if(!element) return;
    const measure=()=>{
      if(inputRef.current) element.style.width=`${inputRef.current.clientWidth-80}px`;
      const next=[...element.children].map(child=>child.getBoundingClientRect().height);
      setHeights(previous=>previous.length===next.length&&previous.every((height,index)=>height===next[index])?previous:next);
    };
    measure();
    const observer=new ResizeObserver(measure); observer.observe(element); if(inputRef.current) observer.observe(inputRef.current);
    return ()=>observer.disconnect();
  },[value]);
  return <>
    <div className="prompt-glass numbered-prompts">
      <div className="prompt-line-numbers" aria-hidden="true"><div ref={gutter}>{lines.map((_,index)=><div key={index} style={{height:heights[index]||26}}>{index+1}</div>)}</div></div>
      <div className="prompt-line-mirror" ref={mirror} aria-hidden="true">{lines.map((line,index)=><div key={index}>{line||"\u200b"}</div>)}</div>
      <textarea ref={inputRef} id="batch-questions" value={value} onChange={event=>onChange(event.target.value)} onScroll={event=>{if(gutter.current) gutter.current.style.transform=`translateY(-${event.currentTarget.scrollTop}px)`;}} rows={8} required disabled={disabled} aria-describedby="question-helper prompt-limits prompt-enter-hint" />
    </div>
    <p className="prompt-enter-hint" id="prompt-enter-hint"><svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><path d="M15 4v7H4m4-4-4 4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>Press Enter for next line</p>
  </>;
}
