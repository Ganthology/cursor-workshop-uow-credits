export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export type AssignmentPair = {
  participantId: string;
  creditLinkId: string;
};

export function buildAssignmentPairs(
  participants: { id: string }[],
  creditLinks: { id: string }[],
): AssignmentPair[] | { error: string } {
  if (participants.length === 0) {
    return { error: "No unassigned participants to assign." };
  }

  if (creditLinks.length === 0) {
    return { error: "No available credit links to assign." };
  }

  if (participants.length > creditLinks.length) {
    return {
      error: `Not enough credit links. Need ${participants.length}, have ${creditLinks.length}.`,
    };
  }

  const shuffledLinks = fisherYatesShuffle(creditLinks);

  return participants.map((participant, index) => ({
    participantId: participant.id,
    creditLinkId: shuffledLinks[index].id,
  }));
}
