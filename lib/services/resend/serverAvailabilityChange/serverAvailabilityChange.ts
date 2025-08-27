import { sendEmail } from "../resend";

export async function sendEmailAvailabilityChange(
  to: string,
  gpus: string[],
  serverName: string,
  newState: string
) {
  const subject = "Cambio en la disponibilidad del servidor";

  const gpusHtml = gpus.length
    ? `<ul>${gpus.map(gpu => `<li>${gpu}</li>`).join("")}</ul>`
    : `<p>No tienes reservas activas en este servidor.</p>`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 10px;">
      <h2 style="color: #2c3e50;">¡El estado del servidor ha cambiado!</h2>
      <p>El servidor <b>${serverName}</b> ha cambiado su estado de disponibilidad a <b>${newState}</b>.</p>

      <h3 style="margin-top: 20px;">Tus GPUs reservadas en este servidor:</h3>
      ${gpusHtml}

      <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
      <small style="color: #555;">Este es un mensaje automático de Minerva Machine Learning.</small>
    </div>
  `;

  try {
    return await sendEmail({ to, subject, html });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
