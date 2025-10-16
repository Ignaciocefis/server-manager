import React from "react";
import {
  ConfirmMessageParams,
  ConfirmMessageKey,
  IconType,
} from "./ConfirmDialog.types";

export const confirmMessages = (
  t: (path: string, params?: Array<string | number>) => string
): {
  [K in ConfirmMessageKey]: (params: ConfirmMessageParams[K]) => {
    title: string;
    description: string | React.ReactNode;
    confirmLabel: string;
    iconType: IconType;
  };
} => ({
  delete_user: ({ userName }) => ({
    title: t("Shared.ConfirmDialog.delete_user.title"),
    description: (
      <>
        {t("Shared.ConfirmDialog.delete_user.description_part1")}
        <strong className="font-semibold">{userName}</strong>
        {t("Shared.ConfirmDialog.delete_user.description_part2")}
      </>
    ),
    confirmLabel: t("Shared.ConfirmDialog.delete_user.confirmLabel"),
    iconType: "error",
  }),

  activate_user: ({ userName, active }) => ({
    title: t("Shared.ConfirmDialog.activate_user.title"),
    description: (
      <>
        {t("Shared.ConfirmDialog.activate_user.description_part1")}
        <strong className="font-semibold">{userName}</strong>
        {t("Shared.ConfirmDialog.activate_user.description_part2")}
        <strong className="font-semibold">
          {active
            ? t("Shared.ConfirmDialog.activate_user.active")
            : t("Shared.ConfirmDialog.activate_user.inactive")}
        </strong>
        ?
      </>
    ),
    confirmLabel: t("Shared.ConfirmDialog.activate_user.confirmLabel"),
    iconType: "warning",
  }),

  update_server: ({ name }) => ({
    title: t("Shared.ConfirmDialog.update_server.title"),
    description: (
      <>
        {t("Shared.ConfirmDialog.update_server.description_part1")}
        <strong className="font-semibold">{name}</strong>
        {t("Shared.ConfirmDialog.update_server.description_part2")}
      </>
    ),
    confirmLabel: t("Shared.ConfirmDialog.update_server.confirmLabel"),
    iconType: "warning",
  }),

  server_availability: ({ name, available }) => ({
    title: t("Shared.ConfirmDialog.server_availability.title"),
    description: (
      <>
        {t("Shared.ConfirmDialog.server_availability.description_part1")}
        <strong className="font-semibold">
          {available
            ? t("Shared.ConfirmDialog.server_availability.enable")
            : t("Shared.ConfirmDialog.server_availability.disable")}
        </strong>
        {t("Shared.ConfirmDialog.server_availability.description_part2")}
        <strong className="font-semibold">{name}</strong>?
      </>
    ),
    confirmLabel: t("Shared.ConfirmDialog.server_availability.confirmLabel"),
    iconType: "warning",
  }),

  delete_server: ({ name }) => ({
    title: t("Shared.ConfirmDialog.delete_server.title"),
    description: (
      <>
        {t("Shared.ConfirmDialog.delete_server.description_part1")}
        <strong className="font-semibold">{name}</strong>
        {t("Shared.ConfirmDialog.delete_server.description_part2")}
      </>
    ),
    confirmLabel: t("Shared.ConfirmDialog.delete_server.confirmLabel"),
    iconType: "error",
  }),

  cancel_reservation: ({ gpu, server, date }) => ({
    title: `Cancelar la reserva de GPU`,
    description: (
      <>
        {t("Shared.ConfirmDialog.cancel_reservation.description_part1")}
        <strong className="font-semibold">{gpu}</strong>
        {t("Shared.ConfirmDialog.cancel_reservation.description_part2")}
        <strong className="font-semibold">{server}</strong>
        {t("Shared.ConfirmDialog.cancel_reservation.description_part3")}
        <strong className="font-semibold">{date}</strong>
        {t("Shared.ConfirmDialog.cancel_reservation.description_part4")}
      </>
    ),
    confirmLabel: t("Shared.ConfirmDialog.cancel_reservation.confirmLabel"),
    iconType: "error",
  }),

  confirm_reservation: ({ gpus, dateRange }) => ({
    title: t("Shared.ConfirmDialog.confirm_reservation.title"),
    description: (
      <>
        {t("Shared.ConfirmDialog.confirm_reservation.description_part1")}
        <strong className="font-semibold">{gpus.join(", ")}</strong>
        {t("Shared.ConfirmDialog.confirm_reservation.description_part2")}
        <strong className="font-semibold">{dateRange}</strong>?
      </>
    ),
    confirmLabel: t("Shared.ConfirmDialog.confirm_reservation.confirmLabel"),
    iconType: "info",
  }),

  extend_reservation: ({ hours }) => ({
    title: t("Shared.ConfirmDialog.extend_reservation.title"),
    description: (
      <>
        {t("Shared.ConfirmDialog.extend_reservation.description_part1")}
        <strong className="font-semibold">{hours}</strong>
        {t("Shared.ConfirmDialog.extend_reservation.description_part2")}
        {t("Shared.ConfirmDialog.extend_reservation.description_part3")}
      </>
    ),
    confirmLabel: t("Shared.ConfirmDialog.extend_reservation.confirmLabel"),
    iconType: "info",
  }),

  markAllNotificationsRead: () => ({
    title: t("Shared.ConfirmDialog.markAllNotificationsRead.title"),
    description: t("Shared.ConfirmDialog.markAllNotificationsRead.description"),
    confirmLabel: t(
      "Shared.ConfirmDialog.markAllNotificationsRead.confirmLabel"
    ),
    iconType: "info",
  }),
});
