import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
//   throw new Error("Email credentials are missing in .env");
// }
 interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

const transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  // port: 587,
  // secure: false,
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendEmail = async (options: EmailOptions):Promise<any> => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error:any) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};