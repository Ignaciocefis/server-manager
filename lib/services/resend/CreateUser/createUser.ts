import { sendEmail } from "../resend";

export async function sendEmailCreateUser(to: string, password: string) {
  const subject = "¡Bienvenido a Minerva Machine Learning!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2>¡Tu cuenta ha sido creada exitosamente!</h2>
      <p>Hola,</p>
      <p>Nos alegra darte la bienvenida a <b>Minerva Machine Learning</b>. Aquí tienes los datos de acceso a tu cuenta:</p>
      <ul>
        <li><b>Correo:</b> ${to}</li>
        <li><b>Contraseña temporal:</b> ${password}</li>
      </ul>
      <p>Por tu seguridad, te recomendamos cambiar la contraseña después de tu primer inicio de sesión.</p>
      <hr />
      <small>Este es un mensaje automático, por favor no respondas a este correo.</small>
    </div>
  `;

  return sendEmail({ to, subject, html });
}
