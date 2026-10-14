import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
export default function RichAnswer({text}:{text:string}) {
  return <div className="rich-answer"><Markdown remarkPlugins={[remarkGfm]} skipHtml components={{a:({children,...props})=><a {...props} target="_blank" rel="noreferrer">{children}</a>}}>{text}</Markdown></div>;
}
