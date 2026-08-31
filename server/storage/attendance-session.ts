type AttendanceActionRecord = {
  check_in_time?: Date | string | null;
  check_out_time?: Date | string | null;
  lunch_start_time?: Date | string | null;
  lunch_end_time?: Date | string | null;
  created_at?: Date | string | null;
};

export function filterAttendanceRecordsByWindow<
  T extends AttendanceActionRecord,
>(
  records: T[],
  window?: { start: Date; end: Date; checkoutEnd?: Date },
): T[] {
  if (!window) return records;
  return records.filter((record) => {
    if (record.check_out_time) {
      const checkoutTimestamp = new Date(record.check_out_time).getTime();
      return (
        checkoutTimestamp >= window.start.getTime() &&
        checkoutTimestamp <
          (window.checkoutEnd?.getTime() ?? window.end.getTime() + 1)
      );
    }
    const actionTime =
      record.check_in_time ||
      record.lunch_start_time ||
      record.lunch_end_time ||
      record.created_at;
    if (!actionTime) return false;
    const timestamp = new Date(actionTime).getTime();
    return timestamp >= window.start.getTime() && timestamp < window.end.getTime();
  });
}