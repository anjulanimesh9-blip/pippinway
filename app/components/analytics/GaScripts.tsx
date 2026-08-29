import Script from "next/script";
import { getGaMeasurementId } from "@/lib/analytics";
import GaPageViews from "./GaPageViews";

export default function GaScripts() {
  const measurementId = getGaMeasurementId();

  return (
    <>
      {measurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${measurementId}', {
                send_page_view: false,
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      ) : null}
      <GaPageViews />
    </>
  );
}
