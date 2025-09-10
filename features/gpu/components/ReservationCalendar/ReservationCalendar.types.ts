import { reservationForCalendar } from "@/features/gpu/types";
import {
  Event as RBCEvent,
  ToolbarProps,
} from "react-big-calendar";

export interface CalendarEvent extends RBCEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: reservationForCalendar;
}

export interface ControlledToolbarProps extends ToolbarProps<CalendarEvent, object> {
  view: "month" | "week" | "day" | "agenda";
  onViewChange: (view: "month" | "week" | "day" | "agenda") => void;
  date: Date;
  onNavigateChange: (date: Date) => void;
}

export type NavigateAction = "PREV" | "NEXT" | "TODAY";
export type ViewType = "month" | "week" | "day" | "agenda";
