"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSearchParams } from "next/navigation";
import { CoreMessage } from "ai";
import { generateText, goToTheStep } from "@/app/survey/actions";
import { ChatMessage } from "@/app/survey/_components/ChatMessage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const steps = [
  {
    phase: "Explore",
    userPrompt: `Let's start by generating as many business ideas as possible. Think fast and don't worry about quality yet!`,
    target: "Fluency",
  },
  {
    phase: "Shift Perspectives",
    userPrompt:
      "Now let's look at this from new angles — can you think of different types of ideas, or target groups, or even crazy ones?",
    target: "Flexibility",
  },
  {
    phase: "Be Unique",
    userPrompt:
      "Pick your favorite 1-2 ideas. How could you make them stand out more? Think of a twist, innovation, or bold change.",
    target: "Originality",
  },
  {
    phase: "Deepen One",
    userPrompt:
      "Now take your best idea and go deeper. Who is it for? How does it work? What problem does it solve?",
    target: "Elaboration",
  },
];

export const AIStructured = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>("");
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendChatMessage = async () => {
    if (!userInput.trim() || !token) return;
    setIsLoading(true);

    if (messages.length === 0) {
      try {
        await goToTheStep({
          accessToken: token,
          step: 1,
        });
      } catch (error) {
        console.error("Error saving system message:", error);
      }
    }

    const newMessage: CoreMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");

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

  // Show confirmation dialog before proceeding to next step
  const handleShowNextConfirmation = () => {
    setShowConfirmDialog(true);
  };

  // Proceed to next step after confirmation
  const handleNext = async () => {
    setShowConfirmDialog(false);
    setCurrentStep((prev) => prev + 1);
    if (!token) return;
    try {
      await goToTheStep({
        accessToken: token,
        step: currentStep + 1,
      });
    } catch (error) {
      console.error("Error saving system message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  const currentProgress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto">
      <Card className="flex-1 overflow-hidden flex flex-col">
        {/* Header with Step Info and Progress */}
        <div className="px-4 py-2 border-b">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">
              Step {currentStep + 1} of {steps.length}:{" "}
              {steps[currentStep].phase}
            </div>
            <div className="text-sm font-medium">
              Target: {steps[currentStep].target}
            </div>
          </div>
          <Progress value={currentProgress} className="h-2" />
          <p className="text-muted-foreground mt-2">
            {steps[currentStep].userPrompt}
          </p>
        </div>

        {/* Chat Messages */}
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

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendChatMessage}
              disabled={isLoading || !userInput.trim()}
              className="shrink-0"
            >
              {isLoading ? "Loading..." : "Send"}
            </Button>
          </div>

          {/* Next Step Button */}
          {currentStep < steps.length - 1 && (
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleShowNextConfirmation}
                disabled={isLoading}
                variant="outline"
              >
                Next Step:{" "}
                {currentStep < steps.length - 1
                  ? steps[currentStep + 1].phase
                  : ""}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proceed to Next Step?</DialogTitle>
            <DialogDescription>
              You are about to proceed to the next step:{" "}
              <strong>
                {currentStep < steps.length - 1
                  ? steps[currentStep + 1].phase
                  : ""}
              </strong>
              .
              <br />
              <br />
              <span className="text-red-500 font-semibold">Warning:</span> Once
              you proceed, you cannot go back to the current step. Are you sure
              you want to continue?
              <br />
              (Your chat history will stay.)
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleNext}>Proceed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
