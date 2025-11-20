import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  onQuestionClick: (question: string) => void;
}

const questions = [
  "Who is the founder of Spice World?",
  "Tell me the SPICE WORLD'S CODE OF BUSINESS CONDUCT AND ETHICS",
];

export default function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4" data-testid="suggested-questions">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Welcome to Ask Arden
      </h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Your intelligent assistant for all your questions. Select a question or type your own.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-lg">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start text-left h-auto py-3 px-4 hover-elevate active-elevate-2"
            onClick={() => onQuestionClick(question)}
            data-testid={`button-question-${index}`}
          >
            <Sparkles className="w-4 h-4 mr-3 flex-shrink-0 text-primary" />
            <span className="text-[14px] font-medium">{question}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
