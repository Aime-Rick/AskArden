import SuggestedQuestions from '../SuggestedQuestions';

export default function SuggestedQuestionsExample() {
  const handleQuestionClick = (question: string) => {
    console.log('Question selected:', question);
  };

  return (
    <div className="bg-background min-h-screen">
      <SuggestedQuestions onQuestionClick={handleQuestionClick} />
    </div>
  );
}
