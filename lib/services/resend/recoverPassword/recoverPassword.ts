import { sendEmail } from "../resend";

export async function sendEmailRecoverPassword(to: string, password: string) {
  const subject = "Recuperación de contraseña - Minerva Machine Learning";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2>¡Has solicitado la recuperación de tu contraseña!</h2>
      <p>Hola,</p>
      <p>Hemos recibido una solicitud para recuperar la contraseña de tu cuenta.</p>
      <ul>
        <li><b>Correo:</b> ${to}</li>
        <li><b>Nueva contraseña temporal:</b> ${password}</li>
      </ul>
      <p>Por tu seguridad, te recomendamos cambiar la contraseña después de tu primer inicio de sesión.</p>
      <hr />
      <small>Este es un mensaje automático, por favor no respondas a este correo.</small>
    </div>
  `;

  try {
    return await sendEmail({ to, subject, html });
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
