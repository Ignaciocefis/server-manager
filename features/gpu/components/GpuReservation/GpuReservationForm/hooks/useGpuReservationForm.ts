import { useForm } from "react-hook-form";
import { RawGpuReservationFormData } from "../GpuReservationForm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { gpuReservationFormSchema } from "@/features/gpu/schemas";
import { useLanguage } from "@/hooks/useLanguage";
import { pad } from "@/features/gpu/utils";

export function useGpuReservationForm(serverId: string) {
  const { t } = useLanguage();

  const schema = gpuReservationFormSchema(t);

  const today = new Date();
  const nowTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

  const form = useForm<RawGpuReservationFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      serverId: serverId,
      range: { from: today, to: today },
      startHour: nowTime,
      endHour: "23:59",
      selectedGpuIds: [],
    },
  });

  return { form };
}
