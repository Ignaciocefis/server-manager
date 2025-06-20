import { Resend } from "resend";
import { sendEmailCreateAccountProps } from "./resend.types";

export async function sendEmailCreateAccount({
  to,
  password,
}: sendEmailCreateAccountProps): Promise<boolean> {
  
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: "Minerva Machine Learning <onboarding@resend.dev>",
      to: ["minerva.machine.learning@outlook.es"],
      // to, TODO: Cambiar a la variable to cuando tenga el dominio de Minerva Machine Learning
      subject: "¡Bienvenido a Minerva Machine Learning!",
      html: `
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
      `,
    });

    if (error) {
      console.error("Error al enviar el correo:", error);
      return false;
    }
    return true;

  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return false;
  }
}
