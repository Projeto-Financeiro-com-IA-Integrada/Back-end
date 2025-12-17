import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true para 465, false para 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  toEmail: string,
  userName: string,
  verificationCode: string
) {
  try {
    const message = await transporter.sendMail({
      from: `"App Financeiro" <${process.env.SMTP_FROM}>`,
      to: toEmail,
      subject: "Confirme seu e-mail - Código de verificação",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Bem-vindo, ${userName}! 👋</h2>
          <p style="font-size: 16px; color: #555;">
            Obrigado por se cadastrar no <strong>App Financeiro</strong>. 
            Para confirmar seu e-mail e ativar sua conta, use o código abaixo:
          </p>
          
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #888; margin: 0;">Código de verificação:</p>
            <h1 style="font-size: 36px; color: #2c3e50; margin: 10px 0; letter-spacing: 5px;">
              ${verificationCode}
            </h1>
          </div>
          
          <p style="font-size: 14px; color: #888;">
            Este código expira em <strong>15 minutos</strong>.
          </p>
          
          <p style="font-size: 14px; color: #555;">
            Se não solicitou este código, ignore este e-mail.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            © 2024 App Financeiro. Todos os direitos reservados.
          </p>
        </div>
      `,
      text: `Seu código de verificação é: ${verificationCode}\n\nEste código expira em 15 minutos.`,
    });

    console.log(`Email enviado para ${toEmail}:`, message.messageId);
    return true;
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return false;
  }
}
