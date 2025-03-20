import { appName, siteUrl } from "@/common/metadata";

export const templateConfig = {
  projectUrl: siteUrl,
  logoImgUrl: siteUrl + "logo.jpeg",

  logoGreyUrl: siteUrl + "logo.jpeg",

  logoWhiteImgUrl: siteUrl + "logo.jpeg",

  welcomeImageUrl: "https://images.prohiring.dev/emailImages/welcome.jpg",

  instagramImageUrl: "https://images.prohiring.dev/emailImages/instagram.jpg",
  instagramUrl: "https://www.instagram.com/dmowskii",
};

interface EmailTemplate {
  html: string;
  text: string;
}

export interface EmailProps {
  title: string;
  subtitle: string;
  messageContent: string;

  callToAction: string;
  callbackUrl: string;
}

export const getCommonMessageTemplate = ({
  title,
  subtitle,
  messageContent,

  callToAction,
  callbackUrl,
}: EmailProps): EmailTemplate => {
  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="x-ua-compatible" content="ie=edge" />
      <title>Email from ${appName}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style type="text/css">
        /**
         * Avoid browser level font resizing.
         * 1. Windows Mobile
         * 2. iOS / OSX
         */
        body,
        table,
        td,
        a {
          -ms-text-size-adjust: 100%; /* 1 */
          -webkit-text-size-adjust: 100%; /* 2 */
        }
  
        /**
         * Remove extra space added to tables and cells in Outlook.
         */
        table,
        td {
          mso-table-rspace: 0pt;
          mso-table-lspace: 0pt;
        }
  
        /**
         * Better fluid images in Internet Explorer.
         */
        img {
          -ms-interpolation-mode: bicubic;
        }
  
        /**
         * Remove blue links for iOS devices.
         */
        a[x-apple-data-detectors] {
          font-family: inherit !important;
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          color: inherit !important;
          text-decoration: none !important;
        }
  
        /**
         * Fix centering issues in Android 4.4.
         */
        div[style*="margin: 16px 0;"] {
          margin: 0 !important;
        }
  
        body {
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
  
        /**
         * Collapse table borders to avoid space between cells.
         */
        table {
          border-collapse: collapse !important;
        }
  
        a {
          color: #1a82e2;
        }
  
        img {
          height: auto;
          line-height: 100%;
          text-decoration: none;
          border: 0;
          outline: none;
        }
      </style>
    </head>
    <body style="background-color: #e9ecef">
      <!-- start body -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <!-- start hero -->
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px">
              <tr>
                <td align="left" bgcolor="#ffffff" valign="top" style="padding: 15px 40px">
                  <a href="${siteUrl}" target="_blank" style="display: inline-block">
                    <img
                      src="${templateConfig.logoImgUrl}"
                      alt=""
                      border="0"
                      width="30"
                      style="display: block; width: 98px"
                    />
                  </a>
                </td>
              </tr>
            </table>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px">
              <tr>
                <td align="center" bgcolor="#ffffff" valign="top" style="padding: 0px">
                  <img
                    src="${templateConfig.welcomeImageUrl}"
                    alt="Welcome image"
                    border="0"
                    style="display: block; height: 156px; width: 200px"
                  />
                </td>
              </tr>
            </table>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px">
              <tr>
                <td
                  align="center"
                  bgcolor="#ffffff"
                  style="
                    padding: 46px 24px 0;
                    font-family: Roboto, Helvetica, Arial, sans-serif;
                  "
                >
                  <h1
                    style="
                      margin: 0;
                      font-size: 32px;
                      font-weight: 700;
                      letter-spacing: -1px;
                      line-height: 48px;
                      color: #000000;
                    "
                  >
                  ${title}
                  </h1>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
          </td>
        </tr>
        <!-- end hero -->
  
        <tr>
          <td align="center" bgcolor="#e9ecef">
            <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
          <tr>
            <td align="center" valign="top" width="600">
        <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px">
              <!-- start copy -->
              <tr>
                <td
                  align="center"
                  bgcolor="#ffffff"
                  style="
                    margin: 0;
                    padding: 16px 60px 32px;
                    font-family: Roboto, Helvetica, Arial, sans-serif;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                  <p style="margin: 0; padding-bottom: 12px; color: #222222">
                  ${subtitle} <br />
                  ${messageContent}
                  </p>
                </td>
              </tr>
              <!-- end copy -->
  
              <!-- start button -->
              <tr>
                <td align="left" bgcolor="#ffffff">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" bgcolor="#ffffff" style="padding: 12px">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" bgcolor="#1a82e2" style="border-radius: 6px">
                              <a
                                href="${callbackUrl}"
                                target="_blank"
                                style="
                                  display: inline-block;
                                  padding: 16px 36px;
                                  font-family: Roboto, Helvetica, Arial, sans-serif;
                                  font-size: 16px;
                                  color: #ffffff;
                                  text-decoration: none;
                                  border-radius: 6px;
                                "
                                >${callToAction}</a
                              >
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- end button -->
  
              <!-- start copy -->
              <tr>
                <td
                  align="center"
                  bgcolor="#ffffff"
                  style="
                    padding: 0;
                    font-family: Roboto, Helvetica, Arial, sans-serif;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                </td>
              </tr>
              <!-- end copy -->
  
              <!-- start copy -->
              <tr>
                <td
                  align="center"
                  bgcolor="#ffffff"
                  style="
                    color: #c4c4c4;
                    padding: 24px;
                    font-family: Roboto, Helvetica, Arial, sans-serif;
                    font-size: 14px;
                    line-height: 20px;
                  "
                >
                  <p style="margin: 0">Do not familiar with ${appName}? </p>
                  <p style="margin: 0">You can ignore this email.</p>
                </td>
              </tr>
              <!-- end copy -->
            </table>
            <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
          </td>
        </tr>
        <!-- end copy block -->
  
        <!-- start footer -->
        <tr>
          <td align="center" style="background-color: rgb(233, 236, 239)">
            <!--[if (gte mso 9)|(IE)]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" valign="top" width="100%" >
        <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px">
              <tr style="background-color: #303d60; height: 60px; padding: 0 40px">
                <td align="left" style="padding: 0 40px">
                  <a href="${siteUrl}" target="_blank" style="display: inline-block;">
                    <img
                      src="${templateConfig.logoImgUrl}"
                      alt=""
                      border="0"
                      width="78"
                      style="width: 78px; height: 25px"
                    />
                  </a>
                </td>
                <td align="right" style="padding: 0 40px">
                  <a href="${
                    templateConfig.instagramUrl
                  }" target="_blank" style="display: inline-block;">
                    <img
                      src="${templateConfig.instagramImageUrl}"
                      alt="instagram"
                      border="0"
                      width="35"
                      style="width: 35px; height: 35px"
                    />
                  </a>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
          </td>
        </tr>
        <!-- end footer -->
      </table>
      <!-- end body -->
    </body>
  </html>
  `;

  const textTemplate = `
${title}: 

----

${subtitle}

${messageContent}

----

${callToAction}
${callbackUrl}


-----
Do not reply to this email. If you have any questions, please contact us at ${templateConfig.instagramUrl}.
`;

  return {
    html: htmlTemplate,
    text: textTemplate,
  };
};
