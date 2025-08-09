import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

// WelcomeCard Component for initial interaction
interface WelcomeCardProps {
  onMoodSelect: (mood: string) => void;
  onQuestionSelect: (question: string) => void;
}

export default function WelcomeCard({
  onMoodSelect,
  onQuestionSelect,
}: WelcomeCardProps) {
  const moods = [
    {
      text: "Good",
      emoji: "😊",
      color: "bg-success/10 border-success/30 hover:bg-success/20",
    },
    {
      text: "Energetic",
      emoji: "⚡",
      color: "bg-warning/10 border-warning/30 hover:bg-warning/20",
    },
    {
      text: "Tired",
      emoji: "😴",
      color: "bg-primary/10 border-primary/30 hover:bg-primary/20",
    },
    {
      text: "Stressed",
      emoji: "😰",
      color: "bg-warning/10 border-warning/30 hover:bg-warning/20",
    },
    {
      text: "Sick",
      emoji: "🤒",
      color: "bg-destructive/10 border-destructive/30 hover:bg-destructive/20",
    },
  ];

  const commonQuestions = [
    "What are common cold remedies?",
    "How to relieve a headache naturally?",
    "What causes seasonal allergies?",
    "Tips for better sleep",
    "How to boost immunity?",
  ];

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto my-4 sm:my-8 px-2 sm:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-card to-secondary border border-border shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-primary mb-4 sm:mb-6">
          How are you feeling today?
        </h2>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          {moods.map((mood, index) => (
            <motion.button
              key={index}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl w-20 sm:w-28 hover:cursor-pointer text-center border ${mood.color} transition-all flex flex-col items-center`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMoodSelect(mood.text)}
            >
              <span className="text-xl sm:text-2xl mb-1">{mood.emoji}</span>
              <span className="font-medium text-xs sm:text-sm">
                {mood.text}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="mb-2 sm:mb-4">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {commonQuestions.map((question, index) => (
              <motion.button
                key={index}
                className="bg-card border border-border hover:bg-accent text-primary px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm text-center"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onQuestionSelect(question)}
              >
                <span className="line-clamp-2">{question}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
