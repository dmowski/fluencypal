import { Stack, Typography } from "@mui/material";
import { LegalContainer } from "./LegalContainer";
import Markdown from "markdown-to-jsx";
import { SupportedLanguage } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";

interface PageProps {
  lang: SupportedLanguage;
}

export const PrivacyPolicy = ({ lang }: PageProps) => {
  const i18n = getI18nInstance(lang);
  return (
    <LegalContainer page="privacy" lang={lang}>
      <Typography variant="h1">{i18n._(`Privacy Policy`)}</Typography>
      <Typography>Effective Date: Mar 17, 2025</Typography>
      <Stack
        sx={{
          fontSize: "20px",
          boxSizing: "border-box",
          fontFamily: "Intel, Roboto, Arial, sans-serif",
          color: "rgba(222, 222, 222, 0.9)",
          hr: {
            opacity: 0.1,
          },
        }}
      >
        <Markdown>
          {`
**PRIVACY POLICY FluencyPal.** 

1. **Who is the controller of your data?**

The Controller of your personal data is Fundacja Rozwoju Przedsiębiorczości "Twój STartup" with its registered office in Warsaw (registered office address: ul. Żurawia 6/12, lok. 766, 00-503 Warsaw).

The above privacy policy applies to the Foundation's services provided by the organized part of the enterprise FluencyPal. contact details: telephone number \+48510260193., e-mail address: contact@fluencypal.com. carried out by Aliaksandr Dmouski.

2. **Why do we process your data?**

  A. In connection with the services provided through  FluencyPal consisting in enabling users to engage in real-time, interactive language learning conversations with an AI tutor, track learning progress, and purchase usage credits, i.e. for the purpose of concluding or performing a contract (Article 6 (1) (b) of the GDPR), your data will be stored until the contract is executed;  

  B. For marketing purposes and promotion of products offered by Fundacja Rozwoju Przedsiębiorczości "Twój StartUp" with its registered office in Warsaw, which are our legitimate interest (Article 6 (1) (f) of the Regulation). Your data will be processed until you object (if you do not send commercial information, please delete this point).   

  C. Fulfilment of any legal obligations incumbent on us in connection with the cooperation undertaken (Article 6 (1) (c) of the GDPR), this purpose is related to the legal obligations to keep certain documents for the time specified in the law, e.g.:  
   * the Accounting Act of 29.09.1994 (Journal of Laws of 2017, item 1858\)  
   * the Tax Ordinance of 29 August 1997, (Journal of Laws of 1997 No. 137, item 926);  
   * the Counteracting Money Laundering and Terrorist Financing Act of 1 March 2018 (Journal of Laws of 2018 item 723).  

  D. For the possible establishment, exercise or defence of claims, which is our legitimate interest (Article 6 (1) (f) of the GDPR). The data will be processed until the claims are submitted;  

  E. In the case of consent, your data will be processed within the limits and for the purpose indicated in the consent (legal basis: Article 6 (1) (a)).  The data will be processed until the consent is withdrawn

3. **What data is being processed?**

To conclude the contract, we require you to provide data on the contract / order form (if you do not provide them, we will not conclude the contract/complete the order). In addition, we may ask for optional data that does not affect the conclusion of the contract (if we do not receive it, we will not be able to, for example, call the contact number).  
During the term of the contract, when providing services, we come into possession of your other data. The appearance of your personal data with us is a consequence of the operation of our services that you use. 

4. **Who will the data be shared with?**

  A. Public authorities, to the extent that they do not receive data as part of a specific proceeding under the law, e.g. in connection with anti-money laundering;    
  
  B. Entities that process your personal data on behalf of the Foundation on the basis of a personal data processing agreement with the Foundation (so-called processors). These will include: Beneficiaries of the Foundation, IT specialists, archiving companies, hosting companies;  
  
  C. External data controllers (the so-called Parallel Controller to whom the data is made available, e.g. legal advisers and lawyers, entities conducting courier or postal activities, entities purchasing debts \- in the event of your failure to pay our invoices on time).  
  
  D. Entities located outside the EEA, but only if it is necessary and with an adequate level of protection, in particular by:  
   1. cooperation with entities processing personal data in countries for which an appropriate decision of the European Commission has been issued;  
   2. Application of standard contractual clauses issued by the European Commission.

   The administrator always informs at the collection stage about the intention to transfer personal data outside the EEA.

5. **Are Data Profiled?**

   Please be advised that your data will not be subject to profiling, i.e. automated analysis of your data and development of predictions about preferences or future behavior (profiling means, e.g. in the case of marketing profiling, determining which offer you may be most interested in based on your previous choices).

6.  **What are your rights?**

  A. Right of access to personal data processed by us (Article of the 15 GDPR);  

  B. Right to rectify entrusted personal data, including their correction (Article 16 of the GDPR);  

  C. Right to delete personal data from our systems, the so-called "right to be forgotten" \- if in your opinion there are no grounds for us to process your data, you can request that we delete it (Article 17 of the GDPR);  

  D. Right to restrict the processing of personal data \- you may request that we restrict the processing of personal data only to their storage or to the performance of activities agreed with you, if we have incorrect data about you or process them unjustifiably; or you do not want us to delete them because they are necessary for you to establish, pursue or defend claims; or for the duration of the objection to data processing (Article 18 of the GDPR);  

  E. Right to data portability – You have the right to receive from us, in a structured, commonly used and machine-readable format (e.g. “.csv” format), personal data relating to you held by us on the basis of a contract or consent.  This right will be granted when we have data in electronic format – if you have data only in paper form, you will not be able to use this right. You can commission us to transfer this data directly to another entity (Article 20 of the GDPR);  

  F. The right to withdraw consent to the processing of personal data \- at any time you have the right to withdraw consent to the processing of personal data that we process on the basis of consent – Article 7 item 3 of the Regulation. The withdrawal of consent shall not affect the lawfulness of any processing performed on the basis of your consent prior to its withdrawal. Withdrawal of consent occurs by sending an e-mail to the following address: contact@fluencypal.com  

  G. Right to object \- you may object to the processing of your data if the basis for the use of data is our legitimate interest \- article 21 of the Regulation. In such a situation, after examining your request, we will no longer be able to process the personal data subject to the objection on this basis, unless we demonstrate the existence of legitimate grounds for the processing that are considered to override your interests, rights and freedoms;  
  
  H. If, in your opinion, the processing of personal data violates the provisions of the Regulation, you have the right to lodge a complaint with the supervisory authority, i.e. President of the Personal Data Protection Office.  
     
7. **Contact**

If you need any additional information related to the personal data protection or would like to exercise your rights, please contact us at the e-mail address: **rodo@twojstartup.pl** 


`}
        </Markdown>
      </Stack>
    </LegalContainer>
  );
};
