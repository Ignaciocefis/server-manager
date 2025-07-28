import { useForm } from "react-hook-form";
import { RawGpuReservationFormData } from "../GpuReservationForm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { gpuReservationFormSchema } from "@/features/gpu/schemas";

export function useGpuReservationForm(serverId: string) {
  const today = new Date();

  const form = useForm<RawGpuReservationFormData>({
    resolver: zodResolver(gpuReservationFormSchema),
    defaultValues: {
      serverId: serverId,
      range: { from: today, to: today },
      startHour: "09:00",
      endHour: "18:00",
      selectedGpuIds: [],
    },
  });

  return { form };
}
