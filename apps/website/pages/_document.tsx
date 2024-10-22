import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-theme="dark">
      <Head />
      <script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
