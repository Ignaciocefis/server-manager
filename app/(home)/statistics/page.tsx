import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatisticsCharts } from "@/features/statistics/components/StatisticsCharts";
import { StatisticsDateFilter } from "@/features/statistics/components/StatisticsDateFilter";
import { type StatisticsOverview } from "@/features/statistics/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import axios from "axios";
import {
  Activity,
  ArrowUpRight,
  CircleCheckBig,
  CircleSlash,
  Cpu,
  Server,
  Users,
  WifiOff,
} from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type StatisticsSearchParams = {
  startDate?: string;
  endDate?: string;
};

const parseDateInput = (value?: string) => {
  if (!value) return undefined;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatDateInput = (date?: Date) => {
  if (!date) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().split("T")[0];
};

type StatisticsOverviewApiData = Omit<StatisticsOverview, "recentEvents"> & {
  recentEvents: Array<
    Omit<StatisticsOverview["recentEvents"][number], "createdAt"> & {
      createdAt: string;
    }
  >;
};

type StatisticsOverviewApiResponse = {
  success: boolean;
  data: StatisticsOverviewApiData | null;
  error: string | null;
};

const categoryOrder: Record<string, number> = {
  JUNIOR: 0,
  RESEARCHER: 1,
  ADMIN: 2,
};

function getCategoryLabel(category: string, t: (path: string) => string) {
  if (category === "ADMIN") return t("User.ProfileSheet.admin");
  if (category === "RESEARCHER") return t("User.ProfileSheet.researcher");
  if (category === "JUNIOR") return t("User.ProfileSheet.junior");
  return category;
}

function getStatusLabel(status: string, t: (path: string) => string) {
  if (status === "PENDING") return t("app.statistics.pending");
  if (status === "ACTIVE") return t("app.statistics.active");
  if (status === "EXTENDED") return t("app.statistics.extended");
  if (status === "COMPLETED") return t("app.statistics.completed");
  if (status === "CANCELLED") return t("app.statistics.cancelled");
  return status;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  accentClassName,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accentClassName: string;
}) {
  return (
    <Card className="border border-gray-app-200 shadow-md bg-white">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-gray-app-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-app-700">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accentClassName}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: StatisticsSearchParams | Promise<StatisticsSearchParams>;
}) {
  const { t, language } = await getServerLanguage();

  const resolvedSearchParams = await searchParams;
  const selectedStartDate = parseDateInput(resolvedSearchParams?.startDate);
  const selectedEndDate = parseDateInput(resolvedSearchParams?.endDate);
  const hasDateFilter = Boolean(selectedStartDate || selectedEndDate);
  const normalizedStartDate =
    selectedStartDate && selectedEndDate && selectedStartDate > selectedEndDate
      ? selectedEndDate
      : selectedStartDate;
  const normalizedEndDate =
    selectedStartDate && selectedEndDate && selectedStartDate > selectedEndDate
      ? selectedStartDate
      : selectedEndDate;

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const cookie = requestHeaders.get("cookie") ?? undefined;

  if (!host) {
    throw new Error("Missing host header for statistics request.");
  }

  const endpoint = `${protocol}://${host}/api/statistics/overview`;

  let payload: StatisticsOverviewApiResponse;

  try {
    const response = await axios.get<StatisticsOverviewApiResponse>(endpoint, {
      params: {
        startDate: normalizedStartDate
          ? formatDateInput(normalizedStartDate)
          : undefined,
        endDate: normalizedEndDate
          ? formatDateInput(normalizedEndDate)
          : undefined,
      },
      headers: cookie ? { cookie } : undefined,
    });

    payload = response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      redirect("/unauthorized");
    }

    const errorMessage =
      axios.isAxiosError(error) &&
      typeof error.response?.data?.error === "string"
        ? error.response.data.error
        : error instanceof Error
          ? error.message
          : "Unable to load statistics overview.";

    throw new Error(errorMessage);
  }

  if (!payload.success || !payload.data) {
    throw new Error(payload.error || "Unable to load statistics overview.");
  }

  const overview: StatisticsOverview = {
    ...payload.data,
    recentEvents: payload.data.recentEvents.map((event) => ({
      ...event,
      createdAt: new Date(event.createdAt),
    })),
  };

  const dateFormatter = new Intl.DateTimeFormat(
    language === "es" ? "es-ES" : "en-US",
    {
      day: "2-digit",
      month: "short",
    },
  );

  const activityFormatter = new Intl.DateTimeFormat(
    language === "es" ? "es-ES" : "en-US",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const reservationStatus = overview.reservationStatus.map((item) => ({
    name: item.status,
    label: getStatusLabel(item.status, t),
    value: item.count,
    fill:
      item.status === "ACTIVE"
        ? "#2563eb"
        : item.status === "EXTENDED"
          ? "#0f766e"
          : item.status === "PENDING"
            ? "#f59e0b"
            : item.status === "COMPLETED"
              ? "#16a34a"
              : "#dc2626",
  }));

  const activitySeries = overview.activitySeries.map((item) => ({
    date: item.date,
    label: dateFormatter.format(new Date(`${item.date}T00:00:00`)),
    count: item.count,
  }));

  const activityTitle = hasDateFilter
    ? t("app.statistics.activityTrendTitleRange")
    : t("app.statistics.activityTrendTitle");
  const activitySummary = hasDateFilter
    ? t("app.statistics.activityTrendSummaryRange")
    : t("app.statistics.activityTrendSummary");

  const totalUsers = overview.usersByCategory.reduce(
    (total, item) => total + item.count,
    0,
  );

  const orderedUsersByCategory = [...overview.usersByCategory].sort(
    (left, right) =>
      (categoryOrder[left.category] ?? Number.MAX_SAFE_INTEGER) -
      (categoryOrder[right.category] ?? Number.MAX_SAFE_INTEGER),
  );

  return (
    <div className="mx-auto flex w-11/12 flex-col gap-4">
      <Card className="overflow-hidden border border-gray-app-200 shadow-md bg-white">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-app" />
              <div>
                <h1 className="text-3xl font-bold text-gray-app-700">
                  {t("app.statistics.title")}
                </h1>
                <p className="mt-1 max-w-3xl text-sm text-gray-app-500 md:text-base">
                  {t("app.statistics.description")}
                </p>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className="w-fit border-blue-200 bg-blue-50 text-blue-700"
          >
            {overview.scope === "global"
              ? t("app.statistics.scopeAll")
              : t("app.statistics.scopeAccessible")}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={t("app.statistics.totalServers")}
          value={overview.totalServers}
          icon={Server}
          accentClassName="bg-blue-app"
        />
        <SummaryCard
          title={t("app.statistics.availableServers")}
          value={overview.availableServers}
          icon={CircleCheckBig}
          accentClassName="bg-emerald-600"
        />
        <SummaryCard
          title={t("app.statistics.totalGpus")}
          value={overview.totalGpus}
          icon={Cpu}
          accentClassName="bg-slate-700"
        />
        <SummaryCard
          title={t("app.statistics.activeReservations")}
          value={overview.activeReservations}
          icon={ArrowUpRight}
          accentClassName="bg-amber-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={t("app.statistics.pendingReservations")}
          value={overview.pendingReservations}
          icon={CircleSlash}
          accentClassName="bg-orange-500"
        />
        <SummaryCard
          title={t("app.statistics.completedReservations")}
          value={overview.completedReservations}
          icon={CircleCheckBig}
          accentClassName="bg-green-600"
        />
        <SummaryCard
          title={t("app.statistics.cancelledReservations")}
          value={overview.cancelledReservations}
          icon={WifiOff}
          accentClassName="bg-red-600"
        />
        <SummaryCard
          title={t("app.statistics.totalUsers")}
          value={totalUsers}
          icon={Users}
          accentClassName="bg-indigo-600"
        />
      </div>

      <Card className="border border-gray-app-200 shadow-md bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-gray-app-700">
            {t("app.statistics.usersByCategory")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {orderedUsersByCategory.length > 0 ? (
            orderedUsersByCategory.map((item) => (
              <div
                key={item.category}
                className="rounded-xl border border-gray-app-200 bg-gray-50 p-4"
              >
                <p className="text-sm font-medium text-gray-app-500">
                  {getCategoryLabel(item.category, t)}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-app-700">
                  {item.count}
                </p>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-gray-app-500 md:col-span-3">
              {t("app.statistics.noData")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-app-200 shadow-md bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-gray-app-700">
            {t("app.statistics.dateFilterTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatisticsDateFilter
            startDateValue={formatDateInput(selectedStartDate)}
            endDateValue={formatDateInput(selectedEndDate)}
            hasDateFilter={hasDateFilter}
            applyFilterLabel={t("app.statistics.applyFilter")}
            resetFilterLabel={t("app.statistics.resetFilter")}
            filterAppliedLabel={t("app.statistics.filterApplied")}
            filterHintLabel={t("app.statistics.filterHint")}
            startDateLabel={t("app.statistics.startDate")}
            endDateLabel={t("app.statistics.endDate")}
          />
        </CardContent>
      </Card>

      <StatisticsCharts
        reservationStatus={reservationStatus}
        activitySeries={activitySeries}
        activityTitle={activityTitle}
        activitySummary={activitySummary}
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Card className="border border-gray-app-200 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-gray-app-700">
              {t("app.statistics.topServers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("app.statistics.server")}</TableHead>
                  <TableHead>{t("app.statistics.gpus")}</TableHead>
                  <TableHead>{t("app.statistics.reservations")}</TableHead>
                  <TableHead>{t("app.statistics.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.topServers.length > 0 ? (
                  overview.topServers.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell className="font-medium text-gray-app-700">
                        {server.name}
                        <div className="text-xs text-gray-app-500">
                          {server.ramGB} GB · {server.diskCount}{" "}
                          {t("app.statistics.disks")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {server.availableGpus}/{server.installedGpus}
                      </TableCell>
                      <TableCell>{server.activeReservations}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            server.available ? "secondary" : "destructive"
                          }
                          className={
                            server.available
                              ? "bg-emerald-100 text-emerald-700"
                              : ""
                          }
                        >
                          {server.available
                            ? t("app.statistics.available")
                            : t("app.statistics.unavailable")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-gray-app-500"
                    >
                      {t("app.statistics.noData")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border border-gray-app-200 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-gray-app-700">
              {t("app.statistics.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.recentEvents.length > 0 ? (
              overview.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-gray-app-200 bg-gray-50 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-app-500">
                    <span className="font-semibold text-gray-app-700">
                      {event.eventType}
                    </span>
                    {event.serverName ? <span>{event.serverName}</span> : null}
                    {event.userName ? <span>{event.userName}</span> : null}
                    <span>{activityFormatter.format(event.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-app-600">
                    {t("app.statistics.eventMessagePrefix")} {event.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-gray-app-500">
                {t("app.statistics.noData")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-app-200 shadow-md bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-gray-app-700">
            {t("app.statistics.topUsers")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("User.ProfileSheet.name")}</TableHead>
                <TableHead>{t("User.ProfileSheet.category")}</TableHead>
                <TableHead>{t("app.statistics.reservations")}</TableHead>
                <TableHead>{t("app.statistics.userStatus")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.topUsers.length > 0 ? (
                overview.topUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-app-700">
                      {user.name} {user.firstSurname}
                      {user.secondSurname ? ` ${user.secondSurname}` : ""}
                    </TableCell>
                    <TableCell>{getCategoryLabel(user.category, t)}</TableCell>
                    <TableCell>{user.reservations}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "secondary" : "destructive"}
                        className={
                          user.isActive ? "bg-emerald-100 text-emerald-700" : ""
                        }
                      >
                        {user.isActive
                          ? t("app.statistics.userActive")
                          : t("app.statistics.userInactive")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-gray-app-500"
                  >
                    {t("app.statistics.noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
