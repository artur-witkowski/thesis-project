import Markdown from "react-markdown";

export const FormattedMessageContent = ({ content }: { content: string }) => {
  return (
    <div className="prose-custom">
      <Markdown>{content}</Markdown>
    </div>
  );
};
