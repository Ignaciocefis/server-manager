export interface GpuInUseTableRow {
  gpuName: string;
  userFullName: string;
  startTime: string;
  endTime: string | null;
  status: "ACTIVE" | "EXTENDED";
}