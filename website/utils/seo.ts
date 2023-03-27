import { DefaultSeoProps } from "next-seo";
import { WEBSITE_URL } from "./constants";

const seoDefaultConfig: DefaultSeoProps = {
  titleTemplate: "%s | Guess the Footballer",
  defaultTitle: "Guess the Footballer",
  description:
    "Guess the Footballer is the perfect game for anyone who loves soccer, the game allows players to guess the names of famous soccer players. Players can test their soccer knowledge in single player or multiplayer modes. Play now!",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: WEBSITE_URL,
    siteName: "Guess the Footballer",
  },
  additionalLinkTags: [
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "manifest",
      href: "/manifest.webmanifest",
    },
  ],
};

export default seoDefaultConfig;
