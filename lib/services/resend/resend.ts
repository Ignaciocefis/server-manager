import { Resend } from "resend";
import { SendEmailOptions } from "./resend.types";

const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  try {
    const fromAddress = process.env.EMAIL_FROM || "Minerva Machine Learning <onboarding@resend.dev>";
    const recipients = process.env.EMAIL_FROM ? [to] : ["minerva.machine.learning@outlook.es"];

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      subject,
      html,
    });

    if (error) {
      console.error("Error al enviar correo:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error inesperado al enviar correo:", err);
    return false;
  }
}
