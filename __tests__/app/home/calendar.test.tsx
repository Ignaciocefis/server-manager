import React from "react";
import { render, screen } from "@testing-library/react";
import Page from "@/app/(home)/calendar/page";

jest.mock(
  "@/features/gpu/components/ReservationCalendar/ReservationCalendar",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="reservation-calendar">ReservationCalendar</div>
    ),
  })
);

jest.mock("lucide-react", () => ({
  CalendarDays: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="calendar-icon" {...props} />
  ),
}));

describe("Calendar Page", () => {
  it("renders the main elements correctly", () => {
    render(<Page />);

    expect(screen.getByText("Gpu.calendar.title")).toBeInTheDocument();
    expect(screen.getByText("Gpu.calendar.description")).toBeInTheDocument();

    expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();

    expect(screen.getByTestId("reservation-calendar")).toBeInTheDocument();
  });
});
