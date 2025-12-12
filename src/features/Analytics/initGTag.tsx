"use client";

export const initGTag = () => {
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = "https://www.googletagmanager.com/gtag/js?id=G-K2X9LZJ50W";
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-K2X9LZJ50W'); 
      gtag('config', 'AW-16463260124');
    `;
  document.head.appendChild(script2);
};
