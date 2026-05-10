/**
 * Life Stages Data Module
 * Defines the 10 stages of the memory journey.
 */

export const stages = [
  {
    id: 'before-i-remember',
    title: 'Before I Remember',
    subtitle: 'Birth, family roots, village, first home, naming stories',
    icon: '\u{1F331}',
    color: '#d4a574',
    prompts: [
      'What stories has your family told you about the day you were born?',
      'Where did your mother live when she was carrying you?',
      'Who named you, and what does your name mean to your family?',
      'What was your first home like? Describe it from stories you have heard.',
      'What sacrifices did your mother make before you could even remember?'
    ]
  },
  {
    id: 'childhood',
    title: 'Childhood / First Home',
    subtitle: 'Toys, first school, mother feeding you, sleeping beside mother, backyard games',
    icon: '\u{1F3E0}',
    color: '#c69963',
    prompts: [
      'What is your earliest memory of your mother?',
      'Describe the room where you slept as a child. Who was beside you?',
      'What games did you play in or around your home?',
      'What did your mother feed you when you refused to eat?',
      'What lullaby or story did she tell you at bedtime?'
    ]
  },
  {
    id: 'school-days',
    title: 'School Days',
    subtitle: 'Uniforms, lunchboxes, school bus, exams, tiffin memories, PTM days',
    icon: '\u{1F4DA}',
    color: '#b8860b',
    prompts: [
      'What did your mother pack in your lunchbox?',
      'How did she prepare you for school every morning?',
      'What happened on parent-teacher meeting days?',
      'How did she help you through exam season?',
      'What did she say when you came home with a bad grade or a scraped knee?'
    ]
  },
  {
    id: 'teenage',
    title: 'Teenage Years',
    subtitle: 'Rebellion, identity, arguments, emotional growth, silent understanding',
    icon: '\u{1F30A}',
    color: '#8b7355',
    prompts: [
      'What was your biggest argument with your mother during your teenage years?',
      'When did you first feel she did not understand you?',
      'Looking back, what did she see in you that you could not see in yourself?',
      'How did she handle your rebellious phase?',
      'What moment made you realize she was giving you space to grow?'
    ]
  },
  {
    id: 'college',
    title: 'College / First Distance',
    subtitle: 'Hostel life, homesickness, late-night calls, missing home food, independence',
    icon: '\u{1F682}',
    color: '#6b5340',
    prompts: [
      'Describe the day you left home for the first time.',
      'What did your mother pack in your bag that you did not ask for?',
      'When did homesickness hit you the hardest?',
      'What food did you miss the most?',
      'How often did you call home, and what did those calls sound like?'
    ]
  },
  {
    id: 'first-job',
    title: 'First Job / Office Life',
    subtitle: 'City life, office stress, loneliness, food delivery replacing home food, growth',
    icon: '\u{1F3D9}\u{FE0F}',
    color: '#5a4a3a',
    prompts: [
      'What was it like eating alone in a new city for the first time?',
      'When did you first send money home, and how did it feel?',
      'What did your mother say when you got your first job?',
      'How did distance change the way you talked to her?',
      'What moment at work made you wish she was nearby?'
    ]
  },
  {
    id: 'hometown',
    title: 'Home / Village / Town Memories',
    subtitle: 'Railway station, bus stand, hometown roads, tea shops, neighborhood sounds',
    icon: '\u{1F333}',
    color: '#7a9a5a',
    prompts: [
      'Describe the feeling of arriving at your hometown station or bus stop.',
      'What sounds and smells define your hometown?',
      'Where did your mother wait for you when you came home?',
      'What is the one place in your town that holds the most memories?',
      'How has your hometown changed since you left?'
    ]
  },
  {
    id: 'mothers-hands',
    title: "Mother's Hands",
    subtitle: 'Sacrifices, cooking, waiting, worrying, saving money, quiet love',
    icon: '\u{1F932}',
    color: '#d4a574',
    prompts: [
      'Describe your mother\'s hands. What have they done for you?',
      'What is the biggest sacrifice she made that you only understood later?',
      'How does she show love without words?',
      'What does she worry about even now?',
      'What is the one thing she always saved money for?'
    ]
  },
  {
    id: 'festivals-food',
    title: 'Festivals & Food Memories',
    subtitle: 'Homemade food, lunchbox dishes, festival cooking, kitchen aromas, family recipes',
    icon: '\u{1F372}',
    color: '#c69963',
    prompts: [
      'What dish does your mother make that no one else can replicate?',
      'Describe a festival morning in your home.',
      'What was the kitchen like when she cooked for a celebration?',
      'What food makes you feel closest to home?',
      'Is there a recipe you wish you had written down?'
    ]
  },
  {
    id: 'letters-to-mom',
    title: 'Letters To Mom',
    subtitle: 'Write letters, record messages, express gratitude, say the unsaid',
    icon: '\u{2709}\u{FE0F}',
    color: '#d4a574',
    prompts: [
      'If you could write one letter to your mother, what would it say?',
      'What have you never thanked her for?',
      'What do you wish you could go back and say differently?',
      'What does she need to hear from you right now?',
      'How would you describe her to someone who has never met her?'
    ]
  }
];

export default stages;
