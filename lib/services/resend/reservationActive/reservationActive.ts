import { sendEmail } from "../resend";

export async function sendEmailReservationActive(to: string, gpuName: string, serverName: string) {
  const subject = "Tu reserva de GPU ha comenzado";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2>¡Tu reserva ya está activa!</h2>
      <p>La GPU <b>${gpuName}</b> en el servidor <b>${serverName}</b> ya está disponible para su uso.</p>
      <hr />
      <small>Este es un mensaje automático de Minerva Machine Learning.</small>
    </div>
  `;

  try {
    return await sendEmail({ to, subject, html });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
