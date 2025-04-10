"use client";

import { CoreMessage } from "ai";
import { generateText, getChatHistory } from "@/app/survey/actions";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { ChatMessage } from "@/app/survey/_components/ChatMessage";

export const AIUnstructured = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    getChatHistory({ accessToken: token! }).then(setMessages);
  }, []);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendChatMessage = async () => {
    if (!input.trim() || !token) return;

    setIsLoading(true);
    const newMessage: CoreMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    try {
      const answer = await generateText({
        accessToken: token,
        newMessage,
      });

      if (!answer) {
        return;
      }

      for await (const textPart of answer) {
        setMessages((prev: CoreMessage[]) => {
          const lastMessage = prev[prev.length - 1];

          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { role: "assistant", content: lastMessage.content + textPart },
            ];
          }

          return [...prev, { role: "assistant", content: textPart }];
        });
      }
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto">
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Welcome to the AI Chat
                </h3>
                <p>Start a conversation by typing a message below.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendChatMessage}
              disabled={isLoading || !input.trim()}
              className="shrink-0"
            >
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
