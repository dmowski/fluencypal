import { Stack, Typography } from "@mui/material";
import { LegalContainer } from "./LegalContainer";
import Markdown from "markdown-to-jsx";
import { SupportedLanguage } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";

interface PageProps {
  lang: SupportedLanguage;
}

export const CookiesPolicy = ({ lang }: PageProps) => {
  const i18n = getI18nInstance(lang);
  return (
    <LegalContainer page="cookies" lang={lang}>
      <Typography variant="h1">{i18n._(`Cookies Policy`)}</Typography>
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
**Cookies Policy**

Cookies are text files and are created automatically by web browsers when you visit or use websites. They are sent by the website and saved on the user's device. With their help, the administrator receives information that allows, among other things, to enable the proper operation of the website, ensure security and improve its operation.

**Data Controller**

The Data Controller is Fundacja Rozwoju Przedsiębiorczości "Twój StartUp" with its registered office in Warsaw (registered office address: ul. Żurawia 6/12, office 766, 00-503 Warsaw), entered into the Register of Entrepreneurs of the National Court Register by the District Court for the Capital City of Warsaw in Warsaw, 12th Commercial Division of the National Court Register under the number 0000442857; NIP: 5213641211; REGON: 146433467, contact details: telephone number \+48510260193, e-mail address: contact@fluencypal.com in connection with the organized part of the enterprise run by Aliaksandr Dmouski named FluencyPal.

**Types of cookies**

As part of our websites, we use the following types of cookies:

**Necessary/Technical:** These files are necessary for the proper functioning of the website. These files are installed in particular for the purpose of remembering login sessions or filling out forms, as well as for the purpose of remembering whether you have been informed about the use of cookies. 

**Functional:** They remember and adapt the platform to your choices, e.g. they allow you to automatically complete the e-mail address from which you have recently logged in to the platform.

**Analytical**: They allow you to check the number of visits and traffic sources. With their help, we are able to determine which pages are popular and which are not. We use them to study statistics and improve the performance of our websites. As part of our websites, we use, among others, solutions from Google, Mailerchimp and Hotjar.

**Marketing:** They allow you to adjust the displayed advertising content to the interests of the user, not only within our portal, but also outside it. They can be installed by advertising partners. Based on the information from these files and activity on other websites, your interest profile is built.

**Social media cookies:** These are cookies installed by our partners to match the displayed advertising content on social media. Based on them, a profile of the user's interests is built. This way the displayed content is tailored to the individual needs of the user. 

**Cookie Storage Time**

Session \- they are stored on the device used until leaving the website, e.g. by turning off the web browser.

Permanent \- exist until they are manually deleted or until the time specified in the browser expires.

**Type of data collected**

They include:

* user's device IP address  
* device type  
* time spent on the website  
* actions taken on the website  
* the location from which the call is made

**How to withdraw consent**

Some cookies are collected by the web browser when you access the website. In order to block the possibility of downloading cookies, the method for a given web browser should be used:

*  [Firefox](https://support.mozilla.org/pl/kb/wzmocniona-ochrona-przed-sledzeniem-firefox-desktop?redirectslug=W%C5%82%C4%85czanie+i+wy%C5%82%C4%85czanie+obs%C5%82ugi+ciasteczek&redirectlocale=pl)   
*  [Chrome](https://support.google.com/accounts/answer/61416?co=GENIE.Platform%3DDesktop&hl=pl)   
*  [Microsoft Edge](https://support.microsoft.com/pl-pl/help/17442/windows-internet-explorer-delete-manage-cookies)   
*  [Safari](https://support.apple.com/pl-pl/HT201265)

The inability to save/read cookies may result in incomplete and incorrect operation of the website, however, the use of the website will still be possible.

**Contact**

If you have questions regarding the processing of personal data or wish to exercise your rights, you can contact us at the addresses specified in point "**Data Controller**"

More information about us and your rights is available at the following address: [https://www.fluencypal.com/contacts](https://www.fluencypal.com/contacts)

In case of infringement of regulations on personal data protection, you can lodge a complaint to the Chairman of the Personal Data Protection Office at: [https://uodo.gov.pl](https://uodo.gov.pl/)

`}
        </Markdown>
      </Stack>
    </LegalContainer>
  );
};
