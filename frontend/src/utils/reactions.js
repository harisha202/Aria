/**
 * priority order (apology/error first, generic excitement/question last)
 * 1. Apology: 🙏 ("sorry", "my mistake", "unfortunately")
 * 2. Error: ⚠️ ("error", "failed", "went wrong", "couldn't")
 * 3. Celebration: 🎉 ("congrats", "well done", "you did it")
 * 4. Success / done: ✅ ("done", "fixed", "here you go")
 * 5. Greeting: 👋 ("hello", "welcome", "good morning")
 * 6. Farewell: 👋 ("goodbye", "see you", "take care")
 * 7. Idea / suggestion: 💡 ("suggest", "tip", "recommend", "how about")
 * 8. Empathy / support: ❤️ ("i understand", "sounds hard")
 * 9. Code: 💻 ("```")
 * 10. Sourced info: 📚 ("/wiki", "wikipedia")
 * 11. Excitement: ✨ ("!")
 * 12. Question: 🤔 ("?")
 * 13. Neutral: 🙂
 */

export function getReactionEmoji(text) {
  if (!text) return '🙂';
  const lower = text.toLowerCase();

  if (lower.includes('sorry') || lower.includes('my mistake') || lower.includes('unfortunately')) {
    return '🙏';
  }
  if (lower.includes('error') || lower.includes('failed') || lower.includes('went wrong') || lower.includes("couldn't")) {
    return '⚠️';
  }
  if (lower.includes('congrats') || lower.includes('well done') || lower.includes('you did it')) {
    return '🎉';
  }
  if (lower.includes('done') || lower.includes('fixed') || lower.includes('here you go')) {
    return '✅';
  }
  if (lower.includes('hello') || lower.includes('welcome') || lower.includes('good morning') || lower.includes('hi there')) {
    return '👋';
  }
  if (lower.includes('goodbye') || lower.includes('see you') || lower.includes('take care') || lower.includes('bye')) {
    return '👋';
  }
  if (lower.includes('suggest') || lower.includes('tip') || lower.includes('recommend') || lower.includes('how about')) {
    return '💡';
  }
  if (lower.includes('i understand') || lower.includes('sounds hard') || lower.includes("i hear you")) {
    return '❤️';
  }
  if (text.includes('```')) {
    return '💻';
  }
  if (lower.includes('/wiki') || lower.includes('wikipedia') || lower.includes('source:')) {
    return '📚';
  }
  if (text.includes('!')) {
    return '✨';
  }
  if (text.includes('?')) {
    return '🤔';
  }
  return '🙂';
}
