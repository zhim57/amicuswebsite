const nodemailer = require('nodemailer');

const mailboxPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/;

function mailError(code) {
  return Object.assign(new Error('Contact mail delivery is unavailable.'), { code });
}

function createMailer({ environment = {}, recipient, transport, createTransport = nodemailer.createTransport } = {}) {
  const from = environment.SMTP_FROM || '';
  const to = environment.CONTACT_TO || recipient || '';
  const port = Number(environment.SMTP_PORT || 587);
  const secure = environment.SMTP_SECURE === 'true';
  const hasCredentials = Boolean(environment.SMTP_USER || environment.SMTP_PASS);
  const missing = !environment.SMTP_HOST || !from;
  const invalid = !mailboxPattern.test(from) || !mailboxPattern.test(to)
    || !Number.isInteger(port) || port < 1 || port > 65535
    || (environment.SMTP_SECURE !== undefined && !['true', 'false'].includes(environment.SMTP_SECURE))
    || (hasCredentials && (!environment.SMTP_USER || !environment.SMTP_PASS))
    || (port === 465 && !secure);
  // Do not connect during page rendering/startup. Unconfigured delivery fails safely
  // on submission while the existing public email fallback stays available.
  let activeTransport = transport;
  return {
    configured: !missing && !invalid,
    async sendMail(values) {
      if (missing) throw mailError('CONTACT_MAIL_UNAVAILABLE');
      if (invalid) throw mailError('CONTACT_MAIL_CONFIGURATION');
      if (!activeTransport) {
        activeTransport = createTransport({
          host: environment.SMTP_HOST,
          port,
          secure,
          requireTLS: !secure,
          ...(hasCredentials ? { auth: { user: environment.SMTP_USER, pass: environment.SMTP_PASS } } : {}),
          tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 20000,
          logger: false,
          debug: false,
          disableFileAccess: true,
          disableUrlAccess: true,
          maxRecipients: 1,
        });
      }
      const text = [
        `Name: ${values.name}`, `Email: ${values.email}`, `Company: ${values.company || 'Not provided'}`,
        `Visitor type: ${values.visitorType || 'Not provided'}`, `Interested in: ${values.interest}`,
        `Phone / WhatsApp: ${values.phone || 'Not provided'}`, '', values.message,
      ].join('\n');
      const info = await activeTransport.sendMail({
        from: { name: 'Amicus website', address: from },
        to: [{ address: to }],
        replyTo: { name: values.name, address: values.email },
        // Only allowlisted interest values reach the subject. Visitor input stays
        // in plain text and a structured Reply-To, never in raw SMTP headers.
        subject: `Amicus inquiry: ${values.interest}`,
        text,
        envelope: { from, to: [to] },
        disableFileAccess: true,
        disableUrlAccess: true,
      });
      const accepted = info && Array.isArray(info.accepted)
        && info.accepted.some(address => typeof address === 'string' && address.toLowerCase() === to.toLowerCase());
      if (!accepted || (Array.isArray(info.rejected) && info.rejected.length > 0)) throw mailError('CONTACT_MAIL_REJECTED');
      // Provider acceptance is the submission milestone. It does not prove inbox placement.
      return { accepted: true };
    },
  };
}

module.exports = { createMailer };
