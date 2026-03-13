export const signs = [
  { name: 'Aries', symbol: '♈', element: 'Fire', quality: 'Cardinal', dates: 'Mar 21-Apr 19', desc: 'Brave and full of energy. Loves a good challenge.' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', quality: 'Fixed', dates: 'Apr 20-May 20', desc: 'Patient and strong. Loves comfort and nice things.' },
  { name: 'Gemini', symbol: '♊', element: 'Air', quality: 'Mutable', dates: 'May 21-Jun 20', desc: 'Curious and fun. Great at talking to people.' },
  { name: 'Cancer', symbol: '♋', element: 'Water', quality: 'Cardinal', dates: 'Jun 21-Jul 22', desc: 'Caring and warm. Makes everyone feel at home.' },
  { name: 'Leo', symbol: '♌', element: 'Fire', quality: 'Fixed', dates: 'Jul 23-Aug 22', desc: 'Confident and big-hearted. Loves to shine bright.' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', quality: 'Mutable', dates: 'Aug 23-Sep 22', desc: 'Smart and helpful. Good at solving problems.' },
  { name: 'Libra', symbol: '♎', element: 'Air', quality: 'Cardinal', dates: 'Sep 23-Oct 22', desc: 'Kind and fair. Wants peace and balance in life.' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', quality: 'Fixed', dates: 'Oct 23-Nov 21', desc: 'Deep and strong. Good at seeing the truth.' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', quality: 'Mutable', dates: 'Nov 22-Dec 21', desc: 'Fun and free. Always looking for adventure.' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', quality: 'Cardinal', dates: 'Dec 22-Jan 19', desc: 'Hard-working and focused. Never gives up.' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', quality: 'Fixed', dates: 'Jan 20-Feb 18', desc: 'Unique and smart. Dreams of a better world.' },
  { name: 'Pisces', symbol: '♓', element: 'Water', quality: 'Mutable', dates: 'Feb 19-Mar 20', desc: 'Kind and creative. Feels things very deeply.' },
];

export const tarotDeck = [
  { name: 'The Fool', emoji: '🃏', meaning: 'A new start is coming. Be brave and try something new.' },
  { name: 'The Magician', emoji: '✨', meaning: 'You have everything you need. Believe in yourself.' },
  { name: 'High Priestess', emoji: '🌙', meaning: 'Trust your feelings. You know more than you think.' },
  { name: 'The Empress', emoji: '💐', meaning: 'Good things are growing around you. Be creative.' },
  { name: 'The Emperor', emoji: '👑', meaning: 'Be organized and take control. You can lead.' },
  { name: 'The Lovers', emoji: '💕', meaning: 'A big choice is coming. Follow your heart.' },
  { name: 'The Chariot', emoji: '🏆', meaning: 'Keep going! You will win if you stay focused.' },
  { name: 'Strength', emoji: '🦁', meaning: 'Be patient and kind. Quiet strength wins.' },
  { name: 'The Hermit', emoji: '🕯️', meaning: 'Take time alone to think. The answer is inside you.' },
  { name: 'Wheel of Fortune', emoji: '🎰', meaning: 'Things are changing. Good luck is coming your way.' },
  { name: 'Justice', emoji: '⚖️', meaning: 'Be honest and fair. The truth always comes out.' },
  { name: 'The Star', emoji: '🌟', meaning: 'Have hope. Beautiful things are coming.' },
  { name: 'The Moon', emoji: '🌕', meaning: 'Not everything is clear yet. Trust your gut feeling.' },
  { name: 'The Sun', emoji: '☀️', meaning: 'Happy times ahead! This is your moment.' },
  { name: 'The Tower', emoji: '⛈️', meaning: 'Big change is coming. It will help you grow.' },
  { name: 'The World', emoji: '🌍', meaning: 'You did it! Time to celebrate and start fresh.' },
  { name: 'Temperance', emoji: '🕊️', meaning: 'Find balance in your life. Stay calm.' },
  { name: 'Death', emoji: '🦋', meaning: 'Something old is ending. Something new begins.' },
];

export const horoscopes = [
  { title: 'Clear Thinking Day', text: 'Your mind is sharp today. Trust yourself — your ideas are good.' },
  { title: 'Creative Surge', text: 'You are full of new ideas today. Don\'t be afraid to try them.' },
  { title: 'Heart Opening', text: 'Today is about connections. Open your heart to people around you.' },
  { title: 'Momentum Building', text: 'Your hard work is paying off. You are closer to your goal than you think.' },
  { title: 'Peaceful Energy', text: 'Today is calm. Take a moment to relax and enjoy the quiet.' },
  { title: 'Brave New Path', text: 'Today is a good day to be bold. Take that step you\'ve been thinking about.' },
];

export const affirmations = [
  '"I trust the timing of my life."',
  '"I deserve love and good things."',
  '"My feelings show me the way."',
  '"I let go of what hurts me."',
  '"I am on the right path."',
  '"Good things are coming to me."',
  '"I can create the life I want."',
  '"Change helps me grow."',
  '"People love my energy."',
  '"I am connected to something bigger."',
];

export const achievements = [
  { id: 'first_read', name: 'First Reading', emoji: '🃏', desc: 'Do your first tarot reading' },
  { id: 'week_streak', name: 'Week Warrior', emoji: '🔥', desc: 'Use the app 7 days in a row' },
  { id: 'breath_master', name: 'Zen Master', emoji: '🧘', desc: 'Do 10 breathing sessions' },
  { id: 'journal_5', name: 'Word Wizard', emoji: '📝', desc: 'Write 5 journal notes' },
  { id: 'chat_10', name: 'Cosmic Chat', emoji: '💬', desc: 'Send 10 messages' },
  { id: 'read_10', name: 'Card Master', emoji: '🎴', desc: 'Do 10 readings' },
  { id: 'xp_500', name: 'Stargazer', emoji: '🌟', desc: 'Get 500 XP' },
];

export const levels = [
  { name: 'Stardust', min: 0 },
  { name: 'Moonbeam', min: 100 },
  { name: 'Starlight', min: 250 },
  { name: 'Nebula', min: 500 },
  { name: 'Supernova', min: 1000 },
  { name: 'Galaxy', min: 1800 },
  { name: 'Universe', min: 2500 },
];

export function getCompatibilityScore(sign1Idx: number, sign2Idx: number): {
  overall: number;
  love: number;
  mental: number;
  passion: number;
  longTerm: number;
  soul: number;
  title: string;
  text: string;
} {
  const s1 = signs[sign1Idx];
  const s2 = signs[sign2Idx];
  const seed = sign1Idx * 13 + sign2Idx * 7 + 42;

  // Element compatibility matrix
  const elemCompat: Record<string, Record<string, number>> = {
    Fire: { Fire: 85, Earth: 55, Air: 90, Water: 50 },
    Earth: { Fire: 55, Earth: 80, Air: 60, Water: 85 },
    Air: { Fire: 90, Earth: 60, Air: 75, Water: 55 },
    Water: { Fire: 50, Earth: 85, Air: 55, Water: 80 },
  };

  const base = elemCompat[s1.element]?.[s2.element] ?? 65;
  const qualityBonus = s1.quality === s2.quality ? -5 : 5;
  const sameSign = sign1Idx === sign2Idx ? 10 : 0;
  const opposite = Math.abs(sign1Idx - sign2Idx) === 6 ? 15 : 0;
  const trine = Math.abs(sign1Idx - sign2Idx) % 4 === 0 && sign1Idx !== sign2Idx ? 12 : 0;

  const rng = (offset: number) => ((seed + offset * 17) % 20) - 10;

  const love = Math.min(99, Math.max(35, base + qualityBonus + sameSign + opposite + rng(1)));
  const mental = Math.min(99, Math.max(35, base + trine + rng(2)));
  const passion = Math.min(99, Math.max(35, base + opposite + rng(3) + 5));
  const longTerm = Math.min(99, Math.max(35, base + qualityBonus + trine + rng(4)));
  const soul = Math.min(99, Math.max(35, base + sameSign + opposite + trine + rng(5)));
  const overall = Math.round((love + mental + passion + longTerm + soul) / 5);

  let title: string, text: string;
  if (overall >= 80) {
    title = 'Cosmic Soulmates';
    text = `${s1.name} and ${s2.name} share an extraordinary cosmic bond. Your ${s1.element} and ${s2.element} energies create a magnetic harmony that feels destined. This connection transcends the ordinary — you understand each other on a soul level. The stars have woven your paths together with golden threads of fate.`;
  } else if (overall >= 65) {
    title = 'Strong Connection';
    text = `${s1.name} and ${s2.name} have a beautiful and complementary energy. Your ${s1.element} nature meets their ${s2.element} spirit in ways that spark growth and deep understanding. With patience and openness, this bond can deepen into something truly extraordinary.`;
  } else if (overall >= 50) {
    title = 'Growth Together';
    text = `${s1.name} and ${s2.name} bring different energies to the table — and that's the beauty of it. Your ${s1.element} fire meets their ${s2.element} essence, creating opportunities for incredible personal growth. This match teaches both of you something profound.`;
  } else {
    title = 'Karmic Lesson';
    text = `${s1.name} and ${s2.name} represent a karmic challenge — a connection designed to teach deep lessons. Your ${s1.element} and ${s2.element} energies may clash, but within that tension lies transformation. Embrace the differences; they hold hidden gifts.`;
  }

  return { overall, love, mental, passion, longTerm, soul, title, text };
}
