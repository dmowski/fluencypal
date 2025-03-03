import { Stack, Typography } from "@mui/material";
import { LegalContainer } from "./LegalContainer";
import Markdown from "markdown-to-jsx";
import { LEGAL_DATA } from "./data";

export const PrivacyPolicy = () => {
  return (
    <LegalContainer page="privacy">
      <Typography variant="h1">Privacy Policy</Typography>
      <Typography>Effective Date: Feb 17, 2025</Typography>
      <Stack
        sx={{
          fontSize: "20px",
          fontFamily: "Intel, Roboto, Arial, sans-serif",
          color: "rgba(222, 222, 222, 0.9)",
          hr: {
            opacity: 0.1,
          },
        }}
      >
        <Markdown>
          {`
### 1. Introduction

Welcome to **${LEGAL_DATA.appName}**, operated by **${LEGAL_DATA.companyName}** (hereinafter, “we,” “us,” or “our”). We respect your privacy and are committed to protecting your personal data in compliance with the General Data Protection Regulation (GDPR) and other applicable laws.

This Privacy Policy explains what personal data we collect, how we use it, how we protect it, and your rights concerning that data. By using our website or services, you agree to the practices described in this Privacy Policy.

---

### 2. Who We Are

- **Company Name**: ${LEGAL_DATA.companyName}  
- **Registered Office**: ${LEGAL_DATA.companyAddress}  
- **KRS No.**: ${LEGAL_DATA.KRS}  
- **NIP**: ${LEGAL_DATA.NIP}

For privacy-related matters, please contact **[${LEGAL_DATA.owner}]** at:  
**Email**: ${LEGAL_DATA.email}

---

### 3. Personal Data We Collect

We may collect and process the following categories of personal data:

1. **Email Address**: Used for account creation, login, and communication.  
2. **Conversation Transcripts**: AI-generated dialogue, including messages you type or speak, which may be processed by OpenAI.  
3. **Usage / Balance Information**: Includes your account balance, records of the free balance you receive, and usage history.  
4. **Role-play Data**: Information about your role-play interactions, including messages, forms data and AI responses.

**No Additional User Content**: We do not collect or store any uploaded files or images.

---

### 4. Children’s Privacy

Our service is not intended for individuals under the age of 16. We do not knowingly collect personal data from children. If you are under 16 (or a different minimum age based on local legislation), please do not use our services.

---

### 5. How We Use Your Personal Data

1. **Account Creation & Maintenance**:  
   - We use your email to create and manage your user account.  
   - We maintain information on your balance to ensure you have the correct free or paid credits.

2. **Language Tutoring & AI Conversations**:  
   - We process your conversation transcripts to provide real-time AI tutoring and to maintain conversation histories.  
   - These transcripts may be sent temporarily to OpenAI’s servers (located in the US) for language processing.

3. **Preventing Abuse of Free Balance**:  
   - We retain minimal information about your account (including balance and your email) for up to one year after last platform visit or account deletion to prevent re-claiming the free welcome balance.

4. **Analytics & Performance**:  
   - We use Google Analytics (data stored within the EU) to understand user interactions and improve our platform.  
   - Where required by law, we will request your consent for analytics cookies via a banner or pop-up.

5. **Legal & Compliance**:  
   - We may process your data to comply with applicable laws, regulations, or court orders.

---

### 6. Lawful Basis for Processing

Under the GDPR, we rely primarily on the following lawful bases:

1. **Consent**:  
   - We obtain your consent for optional cookies, certain analytics activities, and for processing conversation transcripts.  
2. **Contractual Necessity**:  
   - We process your email, AI transcripts, and balance information to deliver the service you have signed up for (i.e., language tutoring).

---

### 7. International Data Transfers

- **Location of Servers**: We store user data on servers located in the European Union (EU/EEA).  
- **OpenAI**: Some conversation data is processed in the United States via OpenAI, which states it is GDPR compliant. According to our current understanding, OpenAI does not store your data beyond the immediate processing required.  
- **Safeguards**: We use secure connections (HTTPS) for all data transmissions. For any transfers outside the EU, we rely on measures such as Standard Contractual Clauses (where applicable) or similar legal frameworks.

---

### 8. Data Retention

1. **Active Users**: We retain your personal data for as long as your account is active.  
2. **Inactive Accounts**: If you do not use our platform for one (1) year, we delete your personal data, including conversation transcripts.  
3. **Account Deletion**: If you request to delete your account from the app interface, we will remove your personal data, except for minimal balance-related data necessary to prevent repeated claims of the free balance. This limited data is also deleted one (1) year after your last platform visit or deletion request.  
4. **Legal Obligations**: We may retain certain data for a longer period if required to do so by law or for legitimate business interests such as fraud prevention.

---

### 9. Your Rights Under GDPR

You have the following rights regarding your personal data, subject to certain legal limitations:

1. **Right of Access**: You can request a copy of your personal data we hold.  
2. **Right to Rectification**: You can ask us to correct inaccuracies in your data.  
3. **Right to Erasure**: You can request deletion of your data.  
4. **Right to Restrict Processing**: You can ask to limit how we use your data.  
5. **Right to Data Portability**: You can request your data in a commonly used, machine-readable format.  
6. **Right to Object**: You can object to data processing based on legitimate interests or direct marketing.  

To exercise these rights, please email: **[${LEGAL_DATA.email}]**. We will respond within the statutory timeframe (usually one month).

---

### 10. Cookies & Tracking

- **Essential Cookies**: Necessary for site functionality (e.g., session management).  
- **Analytics Cookies**: Used to analyze and improve our platform. We use Google Analytics with data stored in the EU.  
- **Opt-Out**: You can opt out of non-essential cookies via the banner or pop-up that appears on our site.

---

### 11. Payment Processing

We use third-party payment processors such as **Stripe** and **PayPal**. We do not store your credit card or bank details; payment information is transmitted directly to these processors over secure connections and subject to their privacy policies.

---

### 12. Security Measures

We implement appropriate technical and organizational measures to safeguard your data:

- **Encryption (HTTPS)**: All data in transit uses secure TLS/SSL encryption.  
- **Access Controls**: Our data storage is isolated, and access is limited to authorized personnel only.  
- **Single Database with Logical Separation**: We store user data in a single database. However, each user’s data is kept in distinct records or documents, protected by secure access controls to help prevent unauthorized cross-access

---

### 13. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our services or legal requirements. If we make significant changes, we will notify you via email or a prominent notice on our website. By continuing to use our services after these updates, you acknowledge and agree to the revised Privacy Policy.

---

### 14. Contact Us

If you have any questions, concerns, or requests regarding your personal data or this Privacy Policy, please contact us at:

**${LEGAL_DATA.companyName}**  
${LEGAL_DATA.companyAddress}  
**Email**: [${LEGAL_DATA.email}]

We are committed to working with you to obtain a fair resolution of any complaint or concern about privacy.

---

## Final Notes

- This Privacy Policy covers only our ${LEGAL_DATA.appName} and does not apply to third-party services beyond our control.  
- We do not offer our services to individuals under 16 years of age.  
- This document is for informational purposes and may need further legal review to ensure full compliance with GDPR and other applicable laws in your jurisdiction.

---

**By using ${LEGAL_DATA.appName}, you confirm that you have read and understood this Privacy Policy.**
`}
        </Markdown>
      </Stack>
    </LegalContainer>
  );
};
