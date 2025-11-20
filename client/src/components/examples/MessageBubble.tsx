import MessageBubble from '../MessageBubble';

export default function MessageBubbleExample() {
  return (
    <div className="p-6 space-y-4 bg-background">
      <MessageBubble 
        message="Hello! How can I help you today?" 
        isUser={false}
        timestamp="14:32"
      />
      <MessageBubble 
        message="I would like to know what the customer service hours are?" 
        isUser={true}
        timestamp="14:33"
      />
      <MessageBubble 
        message="Customer service is available Monday to Friday from 9am to 6pm. Can I help you with anything else?" 
        isUser={false}
        timestamp="14:33"
      />
    </div>
  );
}
