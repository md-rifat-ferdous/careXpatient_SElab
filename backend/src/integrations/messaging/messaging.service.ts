export interface MessagePayload {
  to: string;
  subject?: string;
  body: string;
}

export interface IMessagingProvider {
  send(payload: MessagePayload): Promise<boolean>;
}

export class TwilioSmsProvider implements IMessagingProvider {
  async send(payload: MessagePayload): Promise<boolean> {
    console.log(`[Twilio SMS] Sending to ${payload.to}: ${payload.body}`);
    return true;
  }
}

export class SendGridEmailProvider implements IMessagingProvider {
  async send(payload: MessagePayload): Promise<boolean> {
    console.log(`[SendGrid Email] Sending to ${payload.to}: ${payload.subject}`);
    return true;
  }
}

export class MessagingService {
  private smsProvider: IMessagingProvider;
  private emailProvider: IMessagingProvider;

  constructor() {
    // These could be injected or created based on env
    this.smsProvider = new TwilioSmsProvider();
    this.emailProvider = new SendGridEmailProvider();
  }

  async sendSms(to: string, body: string) {
    return this.smsProvider.send({ to, body });
  }

  async sendEmail(to: string, subject: string, body: string) {
    return this.emailProvider.send({ to, subject, body });
  }

  async sendBroadcast(users: { phone?: string; email?: string }[], body: string) {
    const promises = users.map(user => {
      const p = [];
      if (user.phone) p.push(this.sendSms(user.phone, body));
      if (user.email) p.push(this.sendEmail(user.email, 'careXpatient Update', body));
      return Promise.all(p);
    });
    return Promise.all(promises);
  }
}

export const messagingService = new MessagingService();
