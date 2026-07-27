export interface SentGmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  leadId: string;
}

let cachedGmailToken: string | null = null;
let connectedGmailAddress: string | null = null;

export const gmailService = {
  getAccessToken(): string | null {
    return cachedGmailToken || localStorage.getItem('_gmail_mock_token');
  },

  setAccessToken(token: string) {
    cachedGmailToken = token;
    if (token) {
      localStorage.setItem('_gmail_mock_token', token);
    } else {
      localStorage.removeItem('_gmail_mock_token');
    }
  },

  getConnectedEmail(): string | null {
    return connectedGmailAddress || localStorage.getItem('_gmail_mock_email');
  },

  setConnectedEmail(email: string | null) {
    connectedGmailAddress = email;
    if (email) {
      localStorage.setItem('_gmail_mock_email', email);
    } else {
      localStorage.removeItem('_gmail_mock_email');
    }
  },

  async connectGmail(): Promise<{ accessToken: string; email: string }> {
    // Fast, responsive simulated Gmail connect popup wrapper
    const simulatedEmail = "merchant@gmail.com";
    const simulatedToken = "simulated_oauth_secret_abc123";
    this.setAccessToken(simulatedToken);
    this.setConnectedEmail(simulatedEmail);
    return { accessToken: simulatedToken, email: simulatedEmail };
  },

  async getGmailProfile(token: string): Promise<{ emailAddress: string; messagesTotal: number }> {
    return { emailAddress: this.getConnectedEmail() || "merchant@gmail.com", messagesTotal: 241 };
  },

  async sendGmailMessage(token: string, to: string, subject: string, body: string): Promise<any> {
    console.log(`[GMAIL SIMULATION] Dispatching secure message to ${to}. Subject: ${subject}. Body: ${body}`);
    return { status: "sent", id: `msg-${Date.now()}` };
  },

  // Log store list helpers
  getSentLogs(leadId?: string): SentGmailLog[] {
    const logsStr = localStorage.getItem('_gmail_dispatch_history');
    if (!logsStr) return [];
    try {
      const all: SentGmailLog[] = JSON.parse(logsStr);
      if (leadId) {
        return all.filter(l => l.leadId === leadId);
      }
      return all;
    } catch {
      return [];
    }
  },

  saveSentLog(log: Omit<SentGmailLog, 'id' | 'timestamp'>): SentGmailLog {
    const completeLog: SentGmailLog = {
      ...log,
      id: `gml-${Date.now()}`,
      timestamp: new Date().toLocaleString()
    };
    const current = this.getSentLogs();
    localStorage.setItem('_gmail_dispatch_history', JSON.stringify([completeLog, ...current]));
    return completeLog;
  }
};
