import { Stack, Typography } from "@mui/material";
import { LegalContainer } from "./LegalContainer";
import { LEGAL_DATA } from "./data";
import Markdown from "markdown-to-jsx";
import { SupportedLanguage } from "@/common/lang";
interface PageProps {
  lang: SupportedLanguage;
}
export const TermsOfUse = ({ lang }: PageProps) => {
  return (
    <LegalContainer page="terms" lang={lang}>
      <Typography variant="h1">Terms of Use</Typography>
      <Typography>Effective Date: Mar 17, 2025</Typography>
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

Welcome to **${LEGAL_DATA.appName}**, operated by **${LEGAL_DATA.companyName}** (“Company,” “we,” “us,” or “our”). These Terms of Use (“Terms”) govern your access to and use of the ${LEGAL_DATA.appName} website, services, and related products (collectively, the “Service”). By creating an account or otherwise using our Service, you agree to be bound by these Terms. If you do not agree, please discontinue use immediately.

---

### 2. Eligibility

1. **Age Requirement**: You must be at least 16 years old (or the age of majority in your jurisdiction if higher) to use the Service. We do not permit children below this age to register or use the Service.  
2. **Legal Capacity**: By using the Service, you represent and warrant that you are legally capable of entering into a binding contract.

---

### 3. Account Registration and Security

1. **Account Creation**: To access certain features, you must register by providing a valid email address and creating a password or using a supported Single Sign-On (SSO) method.  
2. **Accuracy of Information**: You must provide accurate and complete information when creating an account and keep such information up to date.  
3. **Responsibility**: You are responsible for maintaining the confidentiality of your account login credentials and for all activities that occur under your account.  
4. **Unauthorized Use**: If you suspect unauthorized use of your account, please contact us immediately at [${LEGAL_DATA.email}].

---

### 4. License and Restrictions

1. **Limited License**: We grant you a personal, non-exclusive, non-transferable, revocable license to use the Service for your own learning and conversational practice.  
2. **Prohibited Activities**: You agree not to:
   - Use the Service for any unlawful, harmful, or fraudulent purposes.  
   - Interfere with or disrupt the Service or servers/networks used to provide the Service.  
   - Reverse engineer, decompile, or otherwise access the Service’s source code (where not publicly provided).  
   - Upload or transmit any viruses or malicious code.  
   - Attempt to re-claim free balances or credits by creating multiple accounts or otherwise abusing our promotions.

---

### 5. Payments and Refunds

1. **Payment Processors**: We use third-party payment processors (e.g., Stripe, PayPal). Your payment details are collected and processed directly by these third parties in accordance with their terms and privacy policies.  
2. **Balance and Credits**: You may purchase or receive credits (including a possible free welcome balance) to use AI-based features within the Service.  
3. **Refund Policy**: Except where required by law, all credit purchases are final and non-refundable. If you believe you have been billed in error, please contact us at [${LEGAL_DATA.email}]. We will review refund requests on a case-by-case basis.

---

### 6. AI Conversations and Disclaimers

1. **Informational Purposes**: The AI-based content, including language tutoring responses, is for informational and educational purposes only. We do not guarantee the accuracy, completeness, or reliability of the information provided by the AI.  
2. **No Professional Advice**: The AI does not provide legal, medical, financial, or other professional advice. You should seek professional consultation where necessary.  
3. **User Responsibility**: You acknowledge that any reliance on the AI’s output is at your own risk and discretion. We are not liable for decisions made based on AI-generated responses.

---

### 7. User Content

1. **Conversations**: Transcripts and other content you share during AI conversations (“User Content”) remain yours. By using the Service, you grant us a non-exclusive, worldwide, royalty-free license to process and store your User Content solely for the purpose of providing the Service.  
2. **Removal of Content**: We reserve the right to remove or suspend access to any User Content that violates these Terms or applicable laws.  
3. **Data Retention**: We store conversation transcripts for a limited time (generally up to one year after your last platform visit), unless you request deletion or delete your account, subject to exceptions in our [Privacy Policy](/privacy).

---

### 8. Privacy Policy

Our [Privacy Policy](/privacy) describes how we collect, use, and protect your personal data, including your AI conversation transcripts and other information. By using our Service, you also agree to the terms outlined in our Privacy Policy.

---

### 9. Termination

1. **By You**: You may stop using the Service at any time or request account deletion.  
2. **By Us**: We may suspend or terminate your account if you violate these Terms, engage in fraud or misuse, or if we discontinue the Service.  
3. **Data Post-Termination**: After account deletion, we will remove most of your personal data as described in our Privacy Policy. Limited data may be retained to prevent re-claiming free balances.

---

### 10. Intellectual Property

1. **Ownership**: All materials, text, graphics, logos, and other content (“Company Content”) are the property of the Company or our licensors. Except as expressly granted, no license or right is granted to you by implication or otherwise.  
2. **Trademarks**: ${LEGAL_DATA.appName}, the Company’s name, and other related marks are trademarks of the Company. You may not use them without our prior written permission.

---

### 11. Disclaimer of Warranties

TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT WARRANTY OF ANY KIND. WE AND OUR LICENSORS DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.

---

### 12. Limitation of Liability

1. **Indirect Damages**: TO THE EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.  
2. **Maximum Liability**: OUR TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID US IN THE LAST 6 MONTHS OR [€100 / $100], WHICHEVER IS HIGHER, TO THE EXTENT PERMITTED BY LAW.

---

### 13. Indemnification

You agree to indemnify and hold harmless the Company, its affiliates, officers, directors, employees, and agents from any losses, liabilities, damages, costs, or expenses (including reasonable attorneys’ fees) arising out of or related to (a) your use or misuse of the Service, (b) your User Content, or (c) your violation of these Terms or applicable law.

---

### 14. Governing Law and Dispute Resolution

1. **Governing Law**: These Terms are governed by the laws of Poland, without regard to conflict-of-law principles.  
2. **Jurisdiction**: Any dispute arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts located in Poland, unless otherwise required by mandatory consumer protection laws.

---

### 15. Changes to These Terms

We may revise these Terms from time to time to reflect changes in our Service or legal requirements. When we do, we will post the updated Terms on our website and notify you of any significant changes. By continuing to use the Service after the changes become effective, you agree to the revised Terms.

---

### 16. Contact Us

If you have any questions, concerns, or feedback regarding these Terms, please contact:

**${LEGAL_DATA.companyName}**  
Warsaw, Pustelnica 1, Poland  
**Email**: [${LEGAL_DATA.email}]

---

## Acceptance of Terms

By accessing or using the ${LEGAL_DATA.appName}, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use as well as our Privacy Policy.


`}
        </Markdown>
      </Stack>
    </LegalContainer>
  );
};
