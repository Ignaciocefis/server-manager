import { sendEmail } from "../resend";

export async function sendEmailAvailabilityChange(to: string, serverName: string, newState: string) {
  const subject = "Cambio en la disponibilidad del servidor";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2>¡El estado del servidor ha cambiado!</h2>
      <p>El servidor <b>${serverName}</b> ha cambiado su estado de disponibilidad a <b>${newState}</b>.</p>
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
