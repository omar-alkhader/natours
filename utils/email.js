const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const dotenv = require('dotenv');
dotenv.config();
const pug = require('pug');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Omar Alkhader <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText.htmlToText(html),
      html,
    };
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Natours Familty!');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
};
