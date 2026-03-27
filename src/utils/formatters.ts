// ============================================================
// SyncUs - Utility: Formatters
// ============================================================

/**
 * Format a timestamp to a human-readable date string.
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Format a score as a percentage string.
 */
export const formatScore = (score: number): string => {
  return `${Math.round(score)}%`;
};

/**
 * Get a compatibility label based on score.
 */
export const getCompatibilityLabel = (score: number): string => {
  if (score >= 90) {
    return 'Soulmates! 💫';
  }
  if (score >= 75) {
    return 'Highly Compatible! 💕';
  }
  if (score >= 60) {
    return 'Great Match! ✨';
  }
  if (score >= 45) {
    return 'Good Vibes! 🌟';
  }
  if (score >= 30) {
    return 'Interesting Mix! 🎲';
  }
  return 'Opposites Attract! 🔥';
};

/**
 * Get the insight text for a compatibility score.
 */
export const getInsightText = (score: number): string => {
  if (score >= 90) {
    return 'You two are practically reading each other\'s minds! Your answers reveal an incredible alignment in values and preferences.';
  }
  if (score >= 75) {
    return 'You\'re on the same wavelength! While you have your unique perspectives, your core values align beautifully.';
  }
  if (score >= 60) {
    return 'You share a solid foundation of common ground. Your differences add spice to the relationship!';
  }
  if (score >= 45) {
    return 'You balance each other out nicely. Your different perspectives bring richness to your bond.';
  }
  if (score >= 30) {
    return 'You bring diverse viewpoints to the table. This can be a strength when you embrace your differences!';
  }
  return 'Variety is the spice of life! Your contrasting views make for exciting conversations and growth.';
};

/**
 * Truncate text to a max length.
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
};
