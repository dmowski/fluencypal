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
**TERMS AND CONDITIONS of FluencyPal**

## § 1 General provisions

1. The **FluencyPal** Internet site operating at [www.fluencypal.com](http://www.fluencypal.com) (hereinafter: **Service**) is run by: Fundacja Rozwoju Przedsiębiorczości „Twój StartUp” (Fundacja Rozwoju Przedsiębiorczości „Twój StartUp”), based in Warsaw at ul. Żurawia 6/12 lok. 766, 00-503 Warsaw, address for delivery: Atlas Tower, Al. Jerozolimskie 123a, 18th floor, 02-017 Warsaw, entered into the National Court Register kept by the District Court for Capital City of Warsaw in Warsaw, 12th Commercial Division of the National Court Register (KRS) no. 0000442857, Tax Identification Number (NIP): 521-364-12-11 Business Registry No. (REGON).: 146433467, Business Registry (BDO) number 000460502\.  
2. The provisions of these Terms and Conditions (T\&C) apply to activities performed for the benefit of the Fundacja Rozwoju Przedsiębiorczości „Twój StartUp” by the organized part of the enterprise named **FluencyPal** operating at the Fundacja Rozwoju Przedsiębiorczości „Twój StartUp” Branch, represented by Aliaksandr Dmouski (e-mail address: contact@fluencypal.com, tel.: \+48510260193). The person indicated in this paragraph is designated by the Fundacja Rozwoju Przedsiębiorczości „Twój StartUp”to contact with regards the implementation of the provisions of these T\&C.

3. These Terms and Conditions specify in particular:  
  A) rules for the use of the Site;  
  B) terms and conditions for placing orders for Products available on the Site;  
  C) order processing time and rules;  
  D) terms and forms of payments  
  E) Customer's right to withdraw from the contract;  
  F) submission and examination of claims  
  G) special rights of the Customer who is a consumer.  
4. StartUp sells and provides Services through the Site using means of remote communication. Contracts concluded by the Customer with StartUp through the Site are distance contracts, as defined in the Act of May 30, 2014 on Consumer Rights.  
5. The Customer is entitled and obliged to use the Service in accordance with its purpose and the rules of social intercourse and good morals.  
6. Browsing the Site does not require registration, and Customer's independent ordering of Products does require registration of an account.  
7. The T\&C are available free of charge on the Site, in a form that allows their acquisition, reproduction and recording.  
8. The Customer is obliged to read the content of the Terms and Conditions. Use of the Site is possible only after reading and accepting the Terms and Conditions.  
9. The Customer must be a person with full legal capacity.  
10. Definitions used in these T\&C shall have the following meaning:

    A) Fundacja Rozwoju Przedsiębiorczości „Twój StartUp” (Fundacja Rozwoju Przedsiębiorczości „Twój StartUp”), based in Warsaw at ul. Żurawia 6/12 lok. 766, 00-503 Warsaw, address for delivery: Atlas Tower, Aleje Jerozolimskie 123A, 18th floor, 02-017  Warsaw, entered into the National Court Register (KRS) kept by the District Court for Capital City of Warsaw in Warsaw, 12th Commercial Division of the National Court Register (KRS) no. 0000442857, which has a following Tax Identification Number (NIP) assigned: 521-364-12-11 Business Registry Number (REGON): 146-433-467, Waste Database number (BDO): 000460502;

    B) Customer \- a person using the Site, purchasing Goods or Services, provided by StartUp on the Site;

    C) Consumer \- a natural person making a legal transaction with an entrepreneur that is not directly linked to its economic or professional activity;

    D) Services \- services provided by StartUp, offered to Customers through the Site, excluding Digital Services;

    E) Digital Service \- a digital service within the meaning of Article 2(5a) of the Law of May 30, 2014 on Consumer Rights, provided by StartUp, offered to Customers through the Site;

    F) Goods \- movable items sold by StartUp to Customers through the Site;

    G) Products \- Goods, Services or Digital Services;

    H) Site \- the website at the following address www.fluencypal.com, by means of which StartUp provides electronic services to the Customer, as well as offers Products to the Customers and enables them to conclude contracts;

    I) Contract \- an agreement concluded between StartUp and the Customer through the Site;

    J) Account \- Customer's individual account on the Website allowing them to use the Services and Digital Services and conclude Contracts after logging in;

    K) working days \- all days excluding Saturdays, Sundays and public holidays;

    L) Terms and Conditions \- these Terms and Conditions (T\&C).

11. In case of a reasonable suspicion that the Customer has provided false data, StartUp has the right to withdraw from Contract execution, notifying the Customer of this fact.  
12. If the Customer provides erroneous or inaccurate data, including, in particular, an erroneous or inaccurate address, StartUp shall not be liable for non-delivery or delay in delivery of the Goods or failure to provide the Service or Digital Service, to the fullest extent permitted by law.  
13. The information contained in the Service, including, in particular, advertisements, announcements and price lists, does not constitute an offer within the meaning of Article 66 of the Act of April 23, 1964, Civil Code. However, the information contained in the Service constitutes an invitation to conclude a Contract, described in Article 71 of the Civil Code.  
14. StartUp shall provide the Customer who is a Consumer, in a clear and conspicuous manner, immediately before the Customer places the order, with information about, in particular:  
    A) the main features of the service, taking into account the subject matter of the service and the method of communication with the customer,  
    B) the total price or remuneration for the performance including taxes, and when the nature of the subject of the performance does not allow, judging reasonably, to calculate their amount in advance \- the manner in which they will be calculated, as well as fees for transportation, delivery, postal services and other costs, and when the amount of these fees cannot be determined \- about the obligation to pay them;  
    C) the right to withdraw from the contract or the absence of this right,  
    D) the duration of the contract or about the manner and grounds for termination of the contract \- if the contract is concluded for an indefinite period or if it is to be automatically renewed;  
    E) the minimum duration of customer's obligations under the contract.  
15. Where StartUp provides for the possibility of accepting individual (customized) orders from Customers, such orders may be placed by Customers via StartUp's email address indicated on the Site. In such a case, StartUp prepares a quote and sends it to the e-mail address indicated by the Client.  
16. The lead time for an individual (custom) order is 30 days from the conclusion of the Contract, unless StartUp has informed the Customer, at the latest before placing the order, of a different period.  
17. The Site supports Customers on the territory of Poland and in the whole world, unless the StartUp offer on the Site contains different provisions.

`}
        </Markdown>
      </Stack>
    </LegalContainer>
  );
};
