export interface GpuInUseTableRow {
  gpuName: string;
  userFullName: string;
  startDate: string | null;
  endDate: string | null;
  status: "ACTIVE" | "EXTENDED";
}