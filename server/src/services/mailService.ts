import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

async function send({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    await transporter.sendMail({
        from: "Vigie <no-reply@vigie.app>",
        to,
        subject, 
        html,
    });
}

export default { send };