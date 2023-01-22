import { DefaultSeoProps } from "next-seo";

const seoDefaultConfig: DefaultSeoProps = {
  titleTemplate: "Next SEO | %s",
  defaultTitle: "Next SEO",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://www.url.ie/",
    siteName: "SiteName",
  },
  twitter: {
    handle: "@handle",
    site: "@site",
    cardType: "summary_large_image",
  },
};

export default seoDefaultConfig;
