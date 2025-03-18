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
  
  a) rules for the use of the Site;  
  
  b) terms and conditions for placing orders for Products available on the Site;  
  
  c) order processing time and rules;  
  
  d) terms and forms of payments  
  
  e) Customer's right to withdraw from the contract;  
  
  f) submission and examination of claims  
  
  g) special rights of the Customer who is a consumer.  

4. StartUp sells and provides Services through the Site using means of remote communication. Contracts concluded by the Customer with StartUp through the Site are distance contracts, as defined in the Act of May 30, 2014 on Consumer Rights.  
5. The Customer is entitled and obliged to use the Service in accordance with its purpose and the rules of social intercourse and good morals.  
6. Browsing the Site does not require registration, and Customer's independent ordering of Products does require registration of an account.  
7. The T\&C are available free of charge on the Site, in a form that allows their acquisition, reproduction and recording.  
8. The Customer is obliged to read the content of the Terms and Conditions. Use of the Site is possible only after reading and accepting the Terms and Conditions.  
9. The Customer must be a person with full legal capacity.  
10. Definitions used in these T\&C shall have the following meaning:

    a) Fundacja Rozwoju Przedsiębiorczości „Twój StartUp” (Fundacja Rozwoju Przedsiębiorczości „Twój StartUp”), based in Warsaw at ul. Żurawia 6/12 lok. 766, 00-503 Warsaw, address for delivery: Atlas Tower, Aleje Jerozolimskie 123A, 18th floor, 02-017  Warsaw, entered into the National Court Register (KRS) kept by the District Court for Capital City of Warsaw in Warsaw, 12th Commercial Division of the National Court Register (KRS) no. 0000442857, which has a following Tax Identification Number (NIP) assigned: 521-364-12-11 Business Registry Number (REGON): 146-433-467, Waste Database number (BDO): 000460502;

    b) Customer \- a person using the Site, purchasing Goods or Services, provided by StartUp on the Site;

    c) Consumer \- a natural person making a legal transaction with an entrepreneur that is not directly linked to its economic or professional activity;

    d) Services \- services provided by StartUp, offered to Customers through the Site, excluding Digital Services;

    e) Digital Service \- a digital service within the meaning of Article 2(5a) of the Law of May 30, 2014 on Consumer Rights, provided by StartUp, offered to Customers through the Site;

    f) Goods \- movable items sold by StartUp to Customers through the Site;

    g) Products \- Goods, Services or Digital Services;

    h) Site \- the website at the following address www.fluencypal.com, by means of which StartUp provides electronic services to the Customer, as well as offers Products to the Customers and enables them to conclude contracts;

    i) Contract \- an agreement concluded between StartUp and the Customer through the Site;

    j) Account \- Customer's individual account on the Website allowing them to use the Services and Digital Services and conclude Contracts after logging in;

    k) working days \- all days excluding Saturdays, Sundays and public holidays;

    l) Terms and Conditions \- these Terms and Conditions (T\&C).

11. In case of a reasonable suspicion that the Customer has provided false data, StartUp has the right to withdraw from Contract execution, notifying the Customer of this fact.  
12. If the Customer provides erroneous or inaccurate data, including, in particular, an erroneous or inaccurate address, StartUp shall not be liable for non-delivery or delay in delivery of the Goods or failure to provide the Service or Digital Service, to the fullest extent permitted by law.  
13. The information contained in the Service, including, in particular, advertisements, announcements and price lists, does not constitute an offer within the meaning of Article 66 of the Act of April 23, 1964, Civil Code. However, the information contained in the Service constitutes an invitation to conclude a Contract, described in Article 71 of the Civil Code.  
14. StartUp shall provide the Customer who is a Consumer, in a clear and conspicuous manner, immediately before the Customer places the order, with information about, in particular:  
    
    a) the main features of the service, taking into account the subject matter of the service and the method of communication with the customer,  
    
    b) the total price or remuneration for the performance including taxes, and when the nature of the subject of the performance does not allow, judging reasonably, to calculate their amount in advance \- the manner in which they will be calculated, as well as fees for transportation, delivery, postal services and other costs, and when the amount of these fees cannot be determined \- about the obligation to pay them;  
    
    c) the right to withdraw from the contract or the absence of this right,  
    
    d) the duration of the contract or about the manner and grounds for termination of the contract \- if the contract is concluded for an indefinite period or if it is to be automatically renewed;  
    
    e) the minimum duration of customer's obligations under the contract.  

15. Where StartUp provides for the possibility of accepting individual (customized) orders from Customers, such orders may be placed by Customers via StartUp's email address indicated on the Site. In such a case, StartUp prepares a quote and sends it to the e-mail address indicated by the Client.  
16. The lead time for an individual (custom) order is 30 days from the conclusion of the Contract, unless StartUp has informed the Customer, at the latest before placing the order, of a different period.  
17. The Site supports Customers on the territory of Poland and in the whole world, unless the StartUp offer on the Site contains different provisions.




## § 2 Technical requirements necessary to use the Site

1. To browse the Site, you need to have:  
   
  a)  a terminal device with access to the Internet,  
  
  b)  a web browser that allows you to accept cookies; for example, Internet Explorer, Microsoft Edge, Google Chrome, Mozilla Firefox, Opera or Safari in its current version;  
   
  c) necessary cookies accepted.

2. In order to use the functionalities of the Website, in particular to register on the Website or place orders for Products, an active electronic mail (e-mail) account is required.  
3. The Website uses cookies for the proper implementation of the Services, as well as to ensure security. Blocking cookies, as well as the use of third-party applications for blocking cookies, may result in malfunctioning of the Site, as well as prevent the proper implementation of the Service, which StartUp shall not be responsible for.



## § 3 Sale of Goods \- terms and conditions and order processing time

1. StartUp, through the Website, enters into contracts for the sale of Goods with Customers. Under the sales contract, StartUp shall to transfer ownership of the Goods to the Customer and deliver the Goods to them, and the Customer shall receive the Goods and pay StartUp the price.  
2. The Customer, in order to place an order, indicates the Goods which they are interested in, by using the "To cart” command or other equivalent wording located on the page of the given Goods, and then indicates the data, method of delivery and payment.  
3. In the shopping cart, the Customer may:  
  
  a) add and delete Goods and their quantities;  
  
  b) indicate the address which the Goods are to be delivered to and provide the data necessary for invoicing;  
  
  c) chose delivery method;  
  
  d) choose payment method;  
  
  e) add a discount code (if applicable).  

4. The Customer places an order by approving the order, selecting the button marked "order with obligation to pay" or other equivalent wording.  
5. Placing and approving an order entails the Customer's obligation to pay the price for the Goods and delivery costs. Once the order is confirmed by StartUp, the sales contract between StartUp and the Customer is also concluded.  
6. Shipping of the purchased Goods is carried out  within 30 working days from the moment of confirmation of payment on StartUp's bank account , unless the Terms and Conditions contain different provisions, or StartUp informed the Customer immediately before placing the order, about a different deadline.      
7. The Goods purchased on the Site are shipped to the address provided by the Customer.  
8. Orders through the Site can be placed 24 (in words: twenty-four) hours a day, 7 (in words: seven) days a week.  
9. In case it is possible to fulfill only a part of the order, StartUp may offer the Customer before confirming the order:  
  
  a) cancellation of the order in its entirety (if the customer chooses this option, StartUp will be released from the obligation to fulfill the order);  

  b) cancellation of the order in the part where fulfillment is not possible within the prescribed period (if the Customer chooses this option, the order will be fulfilled in part, with StartUp being relieved of the obligation to fulfill it to the remaining extent);  
  
  c) a replacement benefit to be agreed with the customer. The order for substitute benefit, once approved by the Customer, will be treated as final;  
  
  d) splitting the order and setting a new completion date for that part of the order, the completion of which is not possible within the originally set deadline (if the Customer chooses this option, the Goods comprising the order will be shipped in several separate shipments, and the Customer will incur additional costs associated with splitting the order into several shipments).  

10. If the Goods ordered by the Customer are not available or Customer's order cannot be fulfilled for other reasons, StartUp will inform the Customer by sending information to his/her e-mail address within 7 (in words: seven) days from the conclusion of the Agreement.  
11. If payment for the Goods, which cannot be delivered in whole or in part, was made in advance, StartUp will refund the amount paid (or the difference) to the Customer within 14 (in words: fourteen) days from the date of conclusion of the Agreement, under the terms and conditions detailed in the Terms and Conditions.  
12. StartUp may post on the Site, with respect to a given Goods, information about the number of working days within which the shipment with the purchased Goods will be sent. The information in question is the time counted from confirmation of the order to shipment of the ordered Goods. The lead time is given taking into account the deadline for completion of all ordered Goods.




## § 4 Liability for non-conformity of the Goods with the Contract

1. The provisions of this paragraph, in accordance with the provisions of Chapter 5a of the Act of May 30, 2014 on Consumer Rights, shall apply to StartUp's liability for non-compliance of the Goods with the Contract concluded with:

  a)  Consumer, or
  
  b)  a natural person entering into a contract directly related to his or her business activity, when it is clear from the content of the contract that it is not of a professional nature for that person, arising in particular from the subject of his or her business activity, made available on the basis of the provisions on the Central Register and Information on Business Activity.

2. StartUp undertakes to offer Goods are free from physical and legal defects.
3. The Customer has the right to file a complaint if the Goods do not comply with the Contract.
4. The Customer may submit the complaint in writing or document to the StartUp email address .
5. A complaint about defective Goods may include one of the demands:

  a) repair of Goods;
  
  b) replacement of Goods.

6. If the goods are inconsistent with the Contract, the Customer may submit a statement of price reduction or withdrawal from the Contract when:

  a) StartUp refused to bring the goods into conformity with the contract in accordance with Article 43d(b) of the May 30, 2014 Law on Consumer Rights;

  b) StartUp failed to bring the goods into conformity with the contract in accordance with Article 43d Paragraphs 4-6 of the Consumer Rights Act of May 30, 2014;
  
  c) the lack of conformity of the goods with the contract continues, even though StartUp tried to bring the goods into conformity with the contract;
  
  d) the lack of conformity of the goods with the contract is so significant that it justifies a reduction in price or withdrawal from the contract without first resorting to the means of protection set forth in Article 43d of the Law on Consumer Rights of May 30, 2014;
  
  e) it is clear from StartUp's statement or circumstances that it will not bring the goods into conformity with the contract within a reasonable time or without undue inconvenience to the consumer.

7. A complaint regarding defects in the Goods will be processed within 14 (in words: fourteen) days of receipt.
8. In the event that StartUp does not respond to the complaint within the deadline, it is assumed that the complaint has been accepted.
9. StartUp shall inform the Customer of the outcome of the complaint on paper or other durable medium.
10. If a complaint regarding the Goods is accepted, StartUp shall, depending on Customer's request, repair the Goods, replace the Goods, reduce the price or refund the entire amount paid by the Customer following withdrawal from the Contract.
11. StartUp shall return the amount due to the Customer using the same method of payment used by the Customer, unless the Customer has expressly agreed to a different method of return that does not involve any costs for the Customer. StartUp shall issue to the Customer a corresponding correction to the proof of purchase (corrective VAT invoice or corrective specification).
12. StartUp's liability is limited to the value of the Goods covered by the Contract. StartUp's liability for damage caused by the non-performance or improper performance of the Digital Service or failure to deliver digital content does not include lost profits.
13. To the extent not regulated in the Terms and Conditions, the relevant provisions of generally applicable law, in particular the Law on Consumer Rights and the Civil Code, shall apply to determine the rights and obligations of the Customer and StartUp in the event of a defect in the goods / non-performance / improper performance of the Contract by StartUp.
14. StartUp's liability for defects in Goods, Services and Digital Services, is excluded in the case of contracts concluded for the benefit of a Customer who is not:
    
  a) a Consumer;
  
  b) a natural person entering into a contract with StartUp directly related to his or her business activity, when it is clear from the content of the contract that it is not of a professional nature for that person, arising in particular from the subject of his or her business activity, made available on the basis of the provisions on the Central Register and Information on Business Activity.

15. Goods offered by StartUp may be covered by a manufacturer's warranty. The warranty is exercised under the terms of the warranty statement. StartUp does not provide its own warranty for the Goods offered.



## § 5 Provision of Services
  1. StartUp provides Customers with Services, the type, scope and detailed description of which are indicated in the Site. The activities consist in particular of: providing access to an AI-powered language tutoring platform (“FluencyPal”), where users can purchase a specific number of hours of AI-based language conversation and use those hours to engage in interactive language learning with an AI tutor, track progress, and review past conversations

  2. Services are provided in the manner indicated on the Site, in particular on the page pertaining to the particular Service.
  
  3. StartUp posts information on the Website on how the Customer may place an order for Services. In order to place an order, the Customer indicates the Services which he or she is interested in, and then enters the data necessary to conclude the Contract and perform the Service, including the method of performance of the Service (if applicable) and the method of payment.
  
  4. If to place an order on the Site, a button or similar function is used, they shall be marked in an easily readable manner with the words "order with obligation to pay" or other equivalent unambiguous wording.

5. Placing and approving an order entails Customer's obligation to pay the price for the Services and any additional costs. Once the order is confirmed by StartUp, the service contract between StartUp and the Customer is also concluded.

6. The Customer shall be informed of the start and end dates of the Services prior to the conclusion of the Contract, in particular through the Site.

7. If, at the express request of the Customer, performance of the Service is to begin before the expiration of the deadline for withdrawal from an off-premises contract, StartUp requires the Customer to make a statement:

    a) containing such an explicit request in a durable medium;

    b) that the Customer took note of the information about the loss of the right to withdraw from the contract upon its full performance by StartUp .

8. If the Customer does not consent to the commencement of the Service before the expiration of the term for withdrawal from the Contract, the Service shall be delivered after the expiration of the term for Custmer’s withdrawal from the Contract, unless StartUp on the Site does not offer Customers the possibility of concluding Contracts without such consent.

9. The Customer may terminate the Contract for the provision of Services, either in writing or document, with 1 (in words: one) month's notice period effective at the end of the calendar month.

10. StartUp may terminate a Contract for the provision of Services, in writing or document, with 1 month's notice effective at the end of the calendar month, for valid reasons. The parties consider valid reasons to be:

    a) discontinuance or StartUp's decision to discontinue the operation of the organized part of StartUp's enterprise , indicated in § 1;
    
    b) significant change or StartUp's decision to significantly change the object of activity of the organized part of StartUp's enterprise , indicated in § 1;

    c) significant reorganization at StartUp ;

    d) occurrence of failures or hindrances (especially technical ones), not attributable to StartUp, preventing or significantly impeding the provision of Services to the Customer;

    e) Customer's delay in payment of price to StartUp;

    f) material breach of the Contract or the Terms and Conditions by the Customer.



## § 6 Liability for non-conformity of the Services with the Contract

1. A complaint about Services provided not in accordance with the Contract should include a demand, depending on the nature of the Service.

2. A complaint regarding non-compliace of the Service with a Contract will be processed within 14 (in words: fourteen) days of receipt.

3. In the event that StartUp does not respond to the complaint within the deadline, it is assumed that the complaint has been accepted.

4. StartUp shall inform the Customer of the outcome of the complaint on paper or other durable medium.

5. If a complaint about the Service is accepted, StartUp shall perform the Service correctly, refund all or part of the price received to the Customer, or make other payments to the Customer, depending on the type of Service and the circumstances of the case.

6. StartUp's liability is limited to the value of the unperformed or improperly performed Service. StartUp's liability for damage caused by the non-performance or improper performance of the Service does not include lost profits.

7. StartUp's liability for defects in the Services, as well as for non-performance / improper performance of the contract concluded with the Customer, is excluded in the case of contracts concluded for the benefit of a Customer that is not:

  a) a Consumer;
    
  b) a natural person entering into a contract with StartUp directly related to his or her business activity, when it is clear from the content of the contract that it is not of a professional nature for that person, arising in particular from the subject of his or her business activity, made available on the basis of the provisions on the Central Register and Information on Business Activity.


## § 7 Digital Content or Digital Service Provision Contracts

1. The provisions of this paragraph and the following paragraph of the Terms and Conditions, in accordance with the provisions of Chapter 5b of the Consumer Rights Act of 30 May 2014, shall apply to Digital Content or Digital Service Provision Contract concluded with:
  a). Consumer, or
  b). a natural person entering into a contract directly related to his or her business activity, when it is clear from the content of the contract that it is not of a professional nature for that person, arising in particular from the subject of his or her business activity, made available on the basis of the provisions on the Central Register and Information on Business Activity.

2. StartUp posts information on the Website on how the Customer may place an order for Digital Services. In order to place an order, the Customer particularly indicates the Digital Services which he or she is interested in, and then enters the data necessary to conclude the Contract and perform the Digital Service, including the method of performance of the Service (if applicable) and the method of payment.

3. If to place an order on the Site, a button or similar function is used, they shall be marked in an easily readable manner with the words "order with obligation to pay" or other equivalent unambiguous wording.

4. Placing and approving an order entails Customer's obligation to pay the price for the Digital Services and any additional costs. Once the order is confirmed by StartUp, the digital service provision contract between StartUp and the Customer is also concluded.

5. StartUp shall deliver the digital content or digital service to the Customer immediately after the conclusion of the Contract, unless otherwise agreed by the parties, in particular, if a different date is indicated on the Site on the page of the respective Digital Service. The provision does not apply if the contract provides for the delivery of digital content via a tangible medium. If the Customer does not agree to the performance before the expiration of the deadline for withdrawal from the Contract, the service provided after the expiration of the deadline.

6. StartUp notifies that giving the consent referred to in the preceding paragraph shall result in the loss of Customer's right to withdraw from the contract.

7. StartUp may, for valid reasons, make a change to the digital content or digital service that is not necessary to comply with the Contract. Valid reasons are considered to be, in particular, important interests of the Customer or StartUp. StartUp shall inform the Customer in a clear and understandable manner about the change made. If the change materially and adversely affects Customer's access to or use of digital content or digital service, StartUp is obliged to inform the Customer in advance on a durable medium of the characteristics and date of the change and the right to terminate the contract without notice. The Customer may terminate the contract without notice within 30 days of the change.

8. The Customer may terminate the Contract for the provision of digital content or Digital Services in writing or in document form, subject to 1 (in words: one) month's notice period effective at the end of the calendar month.

9. StartUp may terminate a Contract for the provision of Digital Services, in writing or document, with 1 month's notice effective at the end of the calendar month, for valid reasons. The parties consider valid reasons to be:

  a) discontinuance or StartUp's decision to discontinue the operation of the organized part of StartUp's enterprise , indicated in § 1;

  b) significant change or StartUp's decision to significantly change the object of activity of the organized part of StartUp's enterprise , indicated in § 1;

  c) significant reorganization at StartUp ;

  d) occurrence of failures or significant hindrances (especially technical) in the functioning of the Site, not attributable to StartUp;

  e) Customer's delay in payment of price to StartUp;

  f) material breach of the Contract or the Terms and Conditions by the Customer.

10. To the extent not regulated in this paragraph, the provisions of Chapter 5b of the Law on Consumer Rights shall apply.




## § 8 Liability for non-conformity of the digital content or digital service with the Contract

1. If StartUp has not provided digital content or digital service, the Customer shall call on StartUp to provide it. If StartUp fails to deliver the digital content or digital service immediately or within an additional period of time expressly agreed upon by the parties, the Customer may cancel the contract. The provision does not apply if the contract provides for the delivery of digital content via a tangible medium.

2. StartUp shall be liable for non-compliance with the contract of digital content or digital service provided:
  
  a) at one time or in parts, which existed at the time of their delivery and came to light within two years of that time;
  
  b) on a continuous basis that occurred or came to light at the time they were to be delivered according to the contract.

3. If the digital content or digital service is not in conformity with the contract, the Customer may demand that it be brought into conformity with the contract.

4. StartUp may refuse to bring the digital content or digital service into compliance with the contract if bringing the digital content or digital service into compliance with the contract is impossible or would require excessive costs for StartUp.

5. If the digital content or digital service are inconsistent with the Contract, the Customer may submit a statement of price reduction or withdrawal from the Contract when:
    
  a) bringing the digital content or digital service into conformity with the contract is impossible or requires excessive costs pursuant to Article 43m (2) and (3) of the Law on Consumer Rights;
    
  b) StartUp failed to bring the digital content or digital service into compliance with the contract in accordance with Article 43m(4) of the Consumer Rights Act;
    
  c) the lack of compliance of the digital content or digital service with the contract continues even though StartUp has tried to bring the digital content or digital service into compliance with the contract;
    
  d) the lack of conformity of the digital contract or digital service with the contract is so significant that it justifies a reduction in price or withdrawal from the contract without first resorting to the means of protection set forth in Article 43m of the Law on Consumer Rights;
    
  e) it is clear from StartUp's statement or circumstances that it will not bring the digital services or digital content into conformity with the contract within a reasonable time or without undue inconvenience to the consumer.

6. The reduced price must remain in such proportion to the contract price as the value of the non-conforming digital content or digital service remains to the value of the conforming digital content or digital service. If the contract stipulates that the digital content or digital service is provided in parts or continuously, the price reduction shall take into account the time during which the digital content or digital service remained inconsistent with the contract.

7. The customer may not withdraw from the contract if the digital content or digital service is provided in exchange for payment of a price, and the lack of conformity of the digital content or digital service with the contract is immaterial.

8. If the Client withdraws from the contract, StartUp may demand the return of the tangible medium which it delivered the digital content on within 14 days from the date of receipt of the Customer's statement of withdrawal from the contract. The Customer shall return the carrier immediately.

9. If the Customer withdraws from the contract, StartUp shall refund the price only for the part corresponding to the digital content or service that does not comply with the contract, as well as the digital content or digital service, the obligation to provide which has fallen off as a result of the withdrawal.

10. StartUp shall return the amount due to the Customer using the same method of payment used by the Customer, unless the Customer has expressly agreed to a different method of return that does not involve any costs for the Customer.

11. StartUp's liability is limited to the value of the digital content or Digital Service that was to be provided. StartUp's liability for damage caused by the non-performance or improper performance of the Digital Service or failure to deliver digital content does not include lost profits.

12. A complaint regarding non-compliace of the digital service with a Contract will be processed within 14 (in words: fourteen) days of receipt.

13. In the event that StartUp does not respond to the complaint within the deadline, it is assumed that the complaint has been accepted.

14. StartUp shall inform the Customer of the outcome of the complaint on paper or other durable medium.

15. StartUp's liability for non-conformity of the digital content or Digital Service, as well as for non-performance / improper performance of the Contract concluded with the Customer, is excluded for Contracts concluded with a Customer that is not:
    
  a) a Consumer;
  
  b). a natural person entering into a contract with StartUp directly related to his or her business activity, when it is clear from the content of the contract that it is not of a professional nature for that person, arising in particular from the subject of his or her business activity, made available on the basis of the provisions on the Central Register and Information on Business Activity.


## § 9 Product prices and delivery cost

1. The prices posted next to the Products offered on the Site are gross prices, that is, they include Value Added Tax (VAT). Prices are quoted in Polish currency (zloty \- PLN).

2. The price listed next to the Product does not include shipping costs.

3. Shipping costs shall be borne by the Customer, unless the content of StartUp's offer on the Service states otherwise.

4. The total amount that the Customer must pay in connection with the purchase of the selected Product consists of the price of the Product and the cost of delivery.

5. Unless StartUp has specified otherwise in the Service on the page of the Product in question or in the course of the Customer's order, the methods of delivery of the Products are as follows:
 
  a) in the case of Goods \- shipment to the address provided by the Customer or by personal collection at StartUp’s premises;
  
  b) in the case of digital Services \- to the e-mail address provided by the Customer;
  
  c) in the case of other Services \- in the manner specified on the Site on the page of a given Service or in the course of placing an order by the Customer, resulting in particular from the type of Service.

6. On the StartUp Service, StartUp shall clearly indicate, at the latest at the beginning of the Customer's ordering process, clear and legible information about restrictions on the delivery of the Product.

## § 10 Payment methods

1. On the StartUp Website, StartUp shall clearly indicate, at the latest at the beginning of the Customer's order placement, clear and legible information about the accepted payment methods.

2. Unless StartUp has specified otherwise on the page of the Product in question or in the course of the Customer's order, the methods of delivery of the Products are as follows:

  a) by wire transfer using one of the electronic payment systems accepted by StartUp allowing to make quick payments for your order;
  
  b) by ordinary bank transfer, to the account indicated by StartUp.

3. In order to use one of the electronic payment systems, the customer must accept the terms and conditions of use of the electronic payment system in question. The list of electronic payment systems available on the Site is available during order finalization.

4. In the event of withdrawal from the contract, the refund shall be made in the same way in which the payment was made by the Customer, unless the Customer has expressly agreed to another way of return, which does not involve any costs for them.

5. StartUp does not allow customers to make payments in cash.





## § 11 Right to withdraw from the contract;

1. The provisions of this paragraph shall apply to the Customer who is a Consumer, or a natural person entering into a contract with StartUp directly related to his or her business activity, when it is clear from the content of the contract that it is not of a professional nature for that person, arising in particular from the subject of his or her business activity, made available on the basis of the provisions on the Central Register and Information on Business Activity.

2. The Customer referred to in paragraph 1 has the right to withdraw from the Contract without giving any reason or incurring any costs, unless the common law or the provisions of these Terms and Conditions provide otherwise. The contract which the customer indicated in paragraph 1 has withdrawn from is considered not concluded.

3. To withdraw from the contract, it is sufficient to submit a statement of withdrawal and send it to StartUp, within 14 (in words: fourteen) days.

4. The period for withdrawal from the contract begins:
    
  a) for an Contract in the performance of which StartUp delivers the Goods, being obliged to transfer their ownership \- from taking possession of the Goods by the Customer or a third party other than the carrier indicated by the Customer, and in the case of a Contract which:
   
    - includes multiple Goods that are delivered separately, in batches or in parts \- from taking possession of the last Goods, their batches or parts,
    
    - consists in the regular delivery of Goods for a fixed period of time \- from taking possession of the first of the Goods;
  
  b) for other Contracts \- from the date of conclusion of the Contract.

5. To meet the deadline for withdrawal from the contract it is sufficient to:

  a) send a written statement to StartUp's address indicated in the Terms and Conditions or the Site, or

  b) send the statement in documentary form to the StartUp's e-mail address indicated in the Terms and Conditions or the Site.

6. StartUp shall immediately send to the Customer, on a durable medium, an acknowledgment of receipt of the statement of withdrawal, submitted electronically.

7. If the Customer withdraws from the contract, the Customer shall return the purchased Product immediately, no later than within 14 (in words: fourteen) days of the withdrawal, unless StartUp offers to collect the Goods itself. To keep that date, it is enough to send a response before its expiry. The cost of returning the Goods shall be borne by the Customer.

8. If the Customer withdraws from the contract, StartUp shall reimburse the Customer for the amount paid for the Product and the shipping costs to the Customer, within no more than 14 (in words: fourteen) days from the date of receipt of the declaration of intent to withdraw from the contract. However, if the Customer has chosen a method of delivery of the Product other than the cheapest method offered on the Site for the order, StartUp is not obliged to reimburse the Customer for the additional costs incurred by the Customer.

9. StartUp shall refund the payment using the same method used by the Customer, unless the Customer agrees with StartUp on a different method of refund that does not incur any costs for the Customer.

10. StartUp may withhold reimbursement of payments, received from the Customer, until it receives the Product back or the Customer provides proof of its return, whichever event occurs first.

11. If the Customer has sent a cancellation statement before receiving an order confirmation from StartUp, the order is cancelled.

12. The Customer shall be liable for any diminution in the value of the Goods resulting from the use of the Goods beyond what is necessary to ascertain the nature, characteristics and properties of the Goods.

13. The right of withdrawal does not apply to the Customer in the cases indicated in the Law of May 30, 2014 on consumer rights, in particular with regard to contracts:

  a) for the provision of services which a consumer is obliged to pay the price for, if the trader has performed the service in full with the express and prior consent of the consumer who was informed before the start of the performance that after the performance by the trader he will lose the right to withdraw from the contract, and accepted it;

  b) in which the price or remuneration depends on fluctuations in the financial market which the trader has no control over and which may occur before the expiration of the deadline for withdrawal;

  c) in which the object of performance is a non-refabricated good, produced to the consumer's specifications or serving to meet their individualized needs;

  d) in which the object of performance is goods that are perishable or have a short shelf life;

  e) in which the object of performance is goods delivered in sealed packaging which cannot be returned after opening the packaging for health or hygiene reasons, if the packaging has been opened after delivery;

  f) in which the object of performance is goods which after delivery, due to their nature, become inseparable from other things;

  g) in which the object of performance is alcoholic beverages, the price of which was agreed upon at the conclusion of the contract of sale, the delivery of which can only take place after 30 days and the value of which depends on market fluctuations which the trader has no control over;

  h) in which the consumer expressly requested that the trader come to them for urgent repair or maintenance; if the trader provides additional services other than those requested by the consumer, or supplies goods other than the spare parts necessary for repair or maintenance, the consumer has the right of withdrawal with respect to the additional services or goods;

  i) in which the subject of performance is sound or visual recordings or computer programs delivered in sealed packaging, if the packaging was opened after delivery;

  j) for the supply of daily newspapers, periodicals or magazines, except for a subscription contract;

  k) concluded through a public auction;

  l) for the provision of accommodation services, other than for residential purposes, transportation of goods, car rental, catering, services related to leisure, entertainment, sports or cultural events, if the contract specifies the day or period of service;

  m) for providing digital content not delivered on a tangible medium which the consumer is liable to pay the price for, if the trader has started the performance with express and prior consent of the consumer who was informed before the start of the performance that after trader’s performance, they will lose the right to withdraw from the contract, and accepted it, and the trader has provided the consumer with the confirmation referred to in Article 15 (1) and (2) or Article 21 (1) of the Law on Consumer Rights.

  n) statement of services which the consumer is obliged to pay the price for, where the consumer expressly requested the trader to come to them for repair, and the service has already been fully performed with the express and prior consent of the consumer.

14. StartUp will also correct the proofs of purchase (corrective VAT invoice or corrective specification) previously provided to the Customer.


## § 12 Refund of the amount paid by the Customer

StartUp will refund the money, within 14 (in words: fourteen) calendar days, using the same means of payment that were used by the Customer at the time of payment, unless the Customer has expressly agreed to another way of return that does not involve any costs for them, in the case of:

  a) withdrawal from the contract in whole or in part (in which case the corresponding part of the price will be refunded) in the case of an order prepaid before its execution;

  b) acknowledging the complaint and the inability to repair the damaged Goods or replace them with new ones or provide the Service / Digital Service in accordance with the contract;

  c) recognizing the right to request a reduction in the price of the Product.


`}
        </Markdown>
      </Stack>
    </LegalContainer>
  );
};
