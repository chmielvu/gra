
type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

const TIME_PROGRESSION: TimeOfDay[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

export function advanceTime(currentDay: number, currentTime: TimeOfDay): { day: number, timeOfDay: TimeOfDay } {
    const currentIndex = TIME_PROGRESSION.indexOf(currentTime);
    if (currentIndex === -1) {
        // Should not happen
        return { day: currentDay, timeOfDay: 'Morning' };
    }

    const nextIndex = (currentIndex + 1) % TIME_PROGRESSION.length;
    
    let nextDay = currentDay;
    if (nextIndex === 0) { // Wrapped around from Night to Morning
        nextDay += 1;
    }

    return {
        day: nextDay,
        timeOfDay: TIME_PROGRESSION[nextIndex],
    };
}
