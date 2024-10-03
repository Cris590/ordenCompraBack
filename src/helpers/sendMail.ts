const nodemailer = require("nodemailer");
import Knex from 'knex';
import config from '../../knexfile';
const db = Knex(config.development);

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.USER_GMAIL,
    pass: process.env.PASS_GMAIL,
  },
});

export const sendMail = async (to:string, subject:string, html:string) => {
    // Configuración del correo
    let mailOptions = {
        from: '"Inversiones BRT" <inversiones@example.com>', // Cambia esto con tu información
        to: to,
        subject: subject,
        html: html,
      };
    try {
      
      // Enviar el correo
      let info = await transporter.sendMail(mailOptions);
      console.log('Correo enviado: %s', info.messageId);
      await crearLogEmail(to,mailOptions, info, true)
    } catch (error) {
        
      console.error('Error al enviar el correo:', error);
      await crearLogEmail(to,mailOptions, error, true)
    }
  };

  export const crearLogEmail = async (correo:string,request:any,response:any,enviado:boolean) => {
    return db('log_email').insert({
        correo,
        request:JSON.stringify(request),
        response:JSON.stringify(response),
        enviado
    });
}
