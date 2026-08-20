
type AvailabilityRule = {
  day_of_week: number; 
  start_time: string; 
  end_time: string; 
};

type ExistingBooking = {
  start_time: string;
  end_time: string;
};

type GenerateSlotsInput = {
  date: Date;
  serviceDurationMinutes: number;
  rules: AvailabilityRule[];
  existingBookings: ExistingBooking[];
};

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}


export function generateAvailableSlots({
  date,
  serviceDurationMinutes,
  rules,
  existingBookings,
}: GenerateSlotsInput): string[] {
  const dayOfWeek = date.getDay();
  const todaysRules = rules
    .filter((r) => r.day_of_week === dayOfWeek)
    .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time));
  if (todaysRules.length === 0) return [];

  const bookedRanges = existingBookings
    .map((b) => ({ start: toMinutes(b.start_time), end: toMinutes(b.end_time) }))
    .sort((a, b) => a.start - b.start);

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const slots: string[] = [];
  let bookingPointer = 0;

  for (const rule of todaysRules) {
    const windowStart = toMinutes(rule.start_time);
    const windowEnd = toMinutes(rule.end_time);

    for (
      let slotStart = windowStart;
      slotStart + serviceDurationMinutes <= windowEnd;
      slotStart += serviceDurationMinutes
    ) {
      const slotEnd = slotStart + serviceDurationMinutes;

      if (isToday && slotStart <= currentMinutes) continue;

      while (
        bookingPointer < bookedRanges.length &&
        bookedRanges[bookingPointer].end <= slotStart
      ) {
        bookingPointer++;
      }

      const overlaps =
        bookingPointer < bookedRanges.length &&
        bookedRanges[bookingPointer].start < slotEnd;

      if (!overlaps) slots.push(toTimeString(slotStart));
    }
  }

  return slots;
}