import { NavigateAction, ViewType } from "./ReservationCalendar.types";

export function handleReservationCalendar(
  action: NavigateAction,
  date: Date,
  view: ViewType
): Date {
  const newDate = new Date(date);

  if (action === "TODAY") {
    return new Date();
  }

  if (action === "NEXT") {
    if (view === "month") newDate.setMonth(newDate.getMonth() + 1);
    else if (view === "week") newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
  }

  if (action === "PREV") {
    if (view === "month") newDate.setMonth(newDate.getMonth() - 1);
    else if (view === "week") newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
  }

  return newDate;
}
