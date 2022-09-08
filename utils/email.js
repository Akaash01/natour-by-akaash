const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Akaash Varadharajan <${process.env.EMAIL_FROM}>`;
    console.log('hello from constructor');
  }

  newTransport() {
    console.log('hello from new transport');
    // console.log(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
      }
    });

    // return nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: 2525,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD
    //   }
    // });
  }
  async send(template, subject) {
    //1. render template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
    };
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to natours family ');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token vaild for only 10 mins'
    );
  }
};

// const sendmail = async (option) => {
//   //1) Creater a transporter
//   const transporter = await nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: 2525,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//   });
//   console.log(option);
//   //2) define the email options
//   const mailOptions = {
//     from: 'Akaash Varadharajan <akaashr.v007@gmail.com>',
//     to: option.email,
//     subject: option.subject,
//     text: option.message
//     //html:
//   };
//   //3) Actually send the email

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log(
//       `------------------------------------------------------------`,
//       info
//     );
//   } catch (err) {
//     console.log(err);
//   }
// };
// module.exports = sendmail;
