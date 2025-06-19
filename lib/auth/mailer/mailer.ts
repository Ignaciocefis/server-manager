import nodemailer from "nodemailer";
import { sendEmailCreateAccountProps } from "./mailer.types";

export async function sendEmailCreateAccount({
  to,
  password,
}: sendEmailCreateAccountProps): Promise<boolean> {
  const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "¡Bienvenido a Minerva Machine Learning!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <img src="cid:logo" alt="Minerva Machine Learning" style="width: 120px; margin-bottom: 20px;" />
          <h2>¡Tu cuenta ha sido creada exitosamente!</h2>
          <p>Hola,</p>
          <p>Nos alegra darte la bienvenida a <b>Minerva Machine Learning</b>. Aquí tienes los datos de acceso a tu cuenta:</p>
          <ul>
            <li><b>Correo:</b> ${to}</li>
            <li><b>Contraseña temporal:</b> ${password}</li>
          </ul>
          <p>Por tu seguridad, te recomendamos cambiar la contraseña después de tu primer inicio de sesión.</p>
          <p>¡Esperamos que disfrutes de la experiencia!</p>
          <hr />
          <small>Este es un mensaje automático, por favor no respondas a este correo.</small>
        </div>
      `,
      attachments: [
        {
          filename: "logo-minerva.png",
          path: "public/logo-minerva.png",
          cid: "logo",
        },
      ],
    });

    return true;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    return false;
  }
}
