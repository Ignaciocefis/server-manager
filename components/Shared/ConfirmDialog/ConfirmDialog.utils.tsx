import {
  ConfirmMessageParams,
  ConfirmMessageKey,
  IconType,
} from "./ConfirmDialog.types";

export const confirmMessages: {
  [K in ConfirmMessageKey]: (params: ConfirmMessageParams[K]) => {
    title: string;
    description: string | React.ReactNode;
    confirmLabel: string;
    iconType: IconType;
  };
} = {
  delete_user: ({ userName }) => ({
    title: `Eliminar usuario`,
    description: (
      <>
        ¿Seguro que deseas eliminar al usuario{" "}
        <strong className="font-semibold">{userName}</strong>? Esta acción no se
        puede deshacer.
      </>
    ),
    confirmLabel: "Eliminar usuario",
    iconType: "error",
  }),

  activate_user: ({ userName, active }) => ({
    title: `Cambiar estado del usuario`,
    description: (
      <>
        ¿Seguro que deseas cambiar al usuario{" "}
        <strong className="font-semibold">{userName}</strong> a un estado{" "}
        <strong className="font-semibold">
          {active ? "activo" : "inactivo"}
        </strong>
        ?
      </>
    ),
    confirmLabel: "Activar usuario",
    iconType: "warning",
  }),

  update_server: ({ name }) => ({
    title: `Actualizar servidor`,
    description: (
      <>
        ¿Seguro que deseas modificar el servidor{" "}
        <strong className="font-semibold">{name}</strong>?
      </>
    ),
    confirmLabel: "Actualizar servidor",
    iconType: "warning",
  }),

  server_availability: ({ name, available }) => ({
    title: `Cambiar disponibilidad del servidor`,
    description: (
      <>
        ¿Seguro que deseas{" "}
        <strong className="font-semibold">
          {available ? "habilitar" : "deshabilitar"}
        </strong>{" "}
        el servidor <strong className="font-semibold">{name}</strong>?
      </>
    ),
    confirmLabel: "Cambiar disponibilidad",
    iconType: "warning",
  }),

  delete_server: ({ name }) => ({
    title: `Eliminar servidor`,
    description: (
      <>
        ¿Seguro que deseas eliminar el servidor{" "}
        <strong className="font-semibold">{name}</strong>? Esta acción no se
        puede deshacer.
      </>
    ),
    confirmLabel: "Eliminar servidor",
    iconType: "error",
  }),

  cancel_reservation: ({ gpu, server, date }) => ({
    title: `Cancelar la reserva de GPU`,
    description: (
      <>
        ¿Seguro que deseas cancelar la reserva de la GPU{" "}
        <strong className="font-semibold">{gpu}</strong> en el servidor{" "}
        <strong className="font-semibold">{server}</strong> para la fecha{" "}
        <strong className="font-semibold">{date}</strong>?
      </>
    ),
    confirmLabel: "Cancelar reserva",
    iconType: "error",
  }),

  confirm_reservation: ({ gpus, dateRange }) => ({
    title: `Confirmar reserva de GPUs`,
    description: (
      <>
        ¿Confirmas la reserva de las GPU(s) [
        <strong className="font-semibold">{gpus.join(", ")}</strong>] para{" "}
        <strong className="font-semibold">{dateRange}</strong>?
      </>
    ),
    confirmLabel: "Confirmar reserva",
    iconType: "info",
  }),

  extend_reservation: ({ hours }) => ({
    title: `Extender reserva de GPU`,
    description: (
      <>
        ¿Seguro que deseas extender la reserva de la GPU durante{" "}
        <strong className="font-semibold">{hours} hora(s)</strong> más?
      </>
    ),
    confirmLabel: "Extender reserva",
    iconType: "info",
  }),

  markAllNotificationsRead: () => ({
    title: `Marcar todas las notificaciones como leídas`,
    description: `¿Seguro que deseas marcar todas las notificaciones como leídas?`,
    confirmLabel: "Marcar como leídas",
    iconType: "info",
  }),
};
