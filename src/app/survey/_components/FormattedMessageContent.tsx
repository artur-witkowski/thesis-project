import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const FormattedMessageContent = ({ content }: { content: string }) => {
  return (
    <div className="prose-custom">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </div>
  );
};
