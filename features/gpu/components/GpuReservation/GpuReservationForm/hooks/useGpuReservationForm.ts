import { useForm } from "react-hook-form";
import { RawGpuReservationFormData } from "../GpuReservationForm.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { gpuReservationFormSchema } from "@/features/gpu/schemas";
import { useLanguage } from "@/hooks/useLanguage";

export function useGpuReservationForm(serverId: string) {
  const { t } = useLanguage();

  const schema = gpuReservationFormSchema(t);

  const today = new Date();

  const form = useForm<RawGpuReservationFormData>({
    resolver: zodResolver(schema),
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
