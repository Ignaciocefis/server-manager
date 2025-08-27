import { Resend } from "resend";
import { SendEmailOptions } from "./resend.types";

const resend = new Resend(process.env.RESEND_API_KEY);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: "Minerva Machine Learning <onboarding@resend.dev>",// TODO: "Minerva Machine Learning <onboarding@resend.dev>",
      to: ["minerva.machine.learning@outlook.es"],// TODO: [to],
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
