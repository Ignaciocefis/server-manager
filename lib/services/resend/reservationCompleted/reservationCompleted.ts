import { sendEmail } from "../resend";

export async function sendEmailReservationCompleted(to: string, gpuName: string, serverName: string) {
  const subject = "Tu reserva de GPU ha sido completada";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2>¡Tu reserva ha finalizado!</h2>
      <p>El tiempo de uso de la GPU <b>${gpuName}</b> en el servidor <b>${serverName}</b> ha terminado.</p>
      <hr />
      <small>Este es un mensaje automático de Minerva Machine Learning.</small>
    </div>
  `;

  try {
    await sendEmail({ to, subject, html });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
