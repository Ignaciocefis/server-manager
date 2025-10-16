"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Gpu, PlusCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function GpuForm() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "gpus",
  });

  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Gpu className="w-6 h-6 text-blue-app" />
          <h3 className="text-lg font-semibold">
            {t("Server.CreateServer.gpuTitle")}
          </h3>
        </div>
        <Button
          type="button"
          onClick={() => append({ name: "", type: "", ramGB: 1 })}
          className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer w-40"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("Server.CreateServer.addGpu")}
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="pt-4 space-y-4">
              <FormField
                name={`gpus.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Server.CreateServer.gpuName")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name={`gpus.${index}.ramGB`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RAM (GB)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          value={field.value ?? 1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`gpus.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Server.CreateServer.gpuType")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center items-center pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (fields.length > 1) remove(index);
                  }}
                  disabled={fields.length === 1}
                  className={`w-40 ${
                    fields.length === 1
                      ? "bg-gray-app-100 text-gray-app-600 font-bold shadow-md cursor-not-allowed w-40"
                      : "bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer w-40"
                  }`}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {t("Server.CreateServer.removeGPU")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
