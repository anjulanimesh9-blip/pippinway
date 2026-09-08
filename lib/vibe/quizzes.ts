export type QuizOption = {
  id: string;
  label: string;
  score?: Record<string, number>;
  correct?: boolean;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};

export type QuizResult = {
  id: string;
  title: string;
  blurb: string;
};

export type VibeQuiz = {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  kind: "personality" | "trivia";
  questions: QuizQuestion[];
  results?: QuizResult[];
};

export const VIBE_QUIZZES: VibeQuiz[] = [
  {
    slug: "what-kind-of-person",
    title: "What kind of person are you?",
    emoji: "🌈",
    description: "A light personality snapshot. For fun, not a diagnosis.",
    kind: "personality",
    questions: [
      {
        id: "q1",
        prompt: "Saturday morning, you would rather…",
        options: [
          { id: "a", label: "Plan the day and tick things off", score: { steady: 2 } },
          { id: "b", label: "See where the mood takes you", score: { spark: 2 } },
          { id: "c", label: "Check on friends first", score: { warm: 2 } },
          { id: "d", label: "Stay in and recharge", score: { calm: 2 } },
        ],
      },
      {
        id: "q2",
        prompt: "When a friend is stressed, you…",
        options: [
          { id: "a", label: "Help them make a plan", score: { steady: 2 } },
          { id: "b", label: "Distract them with something fun", score: { spark: 2 } },
          { id: "c", label: "Listen for as long as they need", score: { warm: 2 } },
          { id: "d", label: "Give space, then check in later", score: { calm: 2 } },
        ],
      },
      {
        id: "q3",
        prompt: "Your feed should feel…",
        options: [
          { id: "a", label: "Useful", score: { steady: 2 } },
          { id: "b", label: "Entertaining", score: { spark: 2 } },
          { id: "c", label: "Supportive", score: { warm: 2 } },
          { id: "d", label: "Peaceful", score: { calm: 2 } },
        ],
      },
    ],
    results: [
      { id: "steady", title: "The Steady Builder", blurb: "You like progress you can see. People trust you with the practical stuff." },
      { id: "spark", title: "The Spark", blurb: "You lift the room. Just remember to rest the battery you give away so freely." },
      { id: "warm", title: "The Warm Anchor", blurb: "You notice people. Your gift is making others feel less alone." },
      { id: "calm", title: "The Calm Centre", blurb: "You protect your peace — and that helps everyone around you slow down too." },
    ],
  },
  {
    slug: "career-personality",
    title: "Which career suits your personality?",
    emoji: "💼",
    description: "Playful career energy, not a job application.",
    kind: "personality",
    questions: [
      {
        id: "q1",
        prompt: "You feel proudest when you…",
        options: [
          { id: "a", label: "Solve a messy problem", score: { maker: 2 } },
          { id: "b", label: "Help someone get unstuck", score: { guide: 2 } },
          { id: "c", label: "Create something people talk about", score: { voice: 2 } },
          { id: "d", label: "Keep a team moving", score: { lead: 2 } },
        ],
      },
      {
        id: "q2",
        prompt: "Your ideal workday has…",
        options: [
          { id: "a", label: "Focus time and a clear puzzle", score: { maker: 2 } },
          { id: "b", label: "Conversations that matter", score: { guide: 2 } },
          { id: "c", label: "Room to try a new idea", score: { voice: 2 } },
          { id: "d", label: "Decisions and momentum", score: { lead: 2 } },
        ],
      },
      {
        id: "q3",
        prompt: "People usually ask you to…",
        options: [
          { id: "a", label: "Fix it", score: { maker: 2 } },
          { id: "b", label: "Explain it", score: { guide: 2 } },
          { id: "c", label: "Make it interesting", score: { voice: 2 } },
          { id: "d", label: "Decide it", score: { lead: 2 } },
        ],
      },
    ],
    results: [
      { id: "maker", title: "The Maker", blurb: "You belong near problems that can be built, repaired or improved." },
      { id: "guide", title: "The Guide", blurb: "Teaching, support, health or customer care would use your patience well." },
      { id: "voice", title: "The Voice", blurb: "Media, design, marketing or community work would let your ideas travel." },
      { id: "lead", title: "The Organiser", blurb: "Operations, business and team lead roles fit how you move people forward." },
    ],
  },
  {
    slug: "zimbabwe-trivia",
    title: "How well do you know Zimbabwe?",
    emoji: "🇿🇼",
    description: "A short, friendly trivia round — not a news briefing.",
    kind: "trivia",
    questions: [
      {
        id: "q1",
        prompt: "Victoria Falls sits on the border of Zimbabwe and which country?",
        options: [
          { id: "a", label: "Zambia", correct: true },
          { id: "b", label: "Mozambique" },
          { id: "c", label: "Botswana" },
          { id: "d", label: "Namibia" },
        ],
      },
      {
        id: "q2",
        prompt: "Harare is Zimbabwe’s…",
        options: [
          { id: "a", label: "Largest lake" },
          { id: "b", label: "Capital city", correct: true },
          { id: "c", label: "Highest mountain" },
          { id: "d", label: "Oldest mine" },
        ],
      },
      {
        id: "q3",
        prompt: "Sadza is best described as…",
        options: [
          { id: "a", label: "A dance" },
          { id: "b", label: "A river" },
          { id: "c", label: "A staple food", correct: true },
          { id: "d", label: "A football club" },
        ],
      },
      {
        id: "q4",
        prompt: "Great Zimbabwe is known as…",
        options: [
          { id: "a", label: "A stone-built historic city", correct: true },
          { id: "b", label: "A modern shopping mall" },
          { id: "c", label: "A desert oasis" },
          { id: "d", label: "A coastal fort" },
        ],
      },
    ],
  },
  {
    slug: "love-language",
    title: "What's your love language?",
    emoji: "💌",
    description: "A light take on how you like to give and receive care.",
    kind: "personality",
    questions: [
      {
        id: "q1",
        prompt: "You feel most appreciated when someone…",
        options: [
          { id: "a", label: "Says it clearly", score: { words: 2 } },
          { id: "b", label: "Shows up with time", score: { time: 2 } },
          { id: "c", label: "Helps without being asked", score: { service: 2 } },
          { id: "d", label: "Gives a thoughtful little gift", score: { gifts: 2 } },
        ],
      },
      {
        id: "q2",
        prompt: "After a long day you want…",
        options: [
          { id: "a", label: "A kind message", score: { words: 2 } },
          { id: "b", label: "Unhurried company", score: { time: 2 } },
          { id: "c", label: "Someone to handle a chore", score: { service: 2 } },
          { id: "d", label: "A small treat", score: { gifts: 2 } },
        ],
      },
      {
        id: "q3",
        prompt: "You show care by…",
        options: [
          { id: "a", label: "Encouraging words", score: { words: 2 } },
          { id: "b", label: "Being present", score: { time: 2 } },
          { id: "c", label: "Doing the helpful thing", score: { service: 2 } },
          { id: "d", label: "Remembering what they like", score: { gifts: 2 } },
        ],
      },
    ],
    results: [
      { id: "words", title: "Words of affirmation", blurb: "Clear kindness lands with you. Say it — and let people say it back." },
      { id: "time", title: "Quality time", blurb: "Presence is your currency. Phones down, eyes up." },
      { id: "service", title: "Acts of service", blurb: "Love looks like follow-through. The help is the hug." },
      { id: "gifts", title: "Thoughtful gifts", blurb: "You notice the details. A small, well-chosen thing can say a lot." },
    ],
  },
];

export function quizBySlug(slug: string): VibeQuiz | undefined {
  return VIBE_QUIZZES.find((quiz) => quiz.slug === slug);
}

export function scorePersonality(
  quiz: VibeQuiz,
  answers: Record<string, string>
): QuizResult | null {
  if (!quiz.results?.length) return null;
  const totals: Record<string, number> = {};
  for (const question of quiz.questions) {
    const selected = question.options.find((option) => option.id === answers[question.id]);
    if (!selected?.score) continue;
    for (const [key, value] of Object.entries(selected.score)) {
      totals[key] = (totals[key] ?? 0) + value;
    }
  }
  let winner = quiz.results[0];
  let best = -1;
  for (const result of quiz.results) {
    const score = totals[result.id] ?? 0;
    if (score > best) {
      best = score;
      winner = result;
    }
  }
  return winner;
}

export function scoreTrivia(
  quiz: VibeQuiz,
  answers: Record<string, string>
): { correct: number; total: number } {
  let correct = 0;
  for (const question of quiz.questions) {
    const selected = question.options.find((option) => option.id === answers[question.id]);
    if (selected?.correct) correct += 1;
  }
  return { correct, total: quiz.questions.length };
}
