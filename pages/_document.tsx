import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <script
          defer
          noModule
          src="https://www.wakedt.cn/__polyfill__?features=es2022%2Ces2021%2Ces2020%2Ces2019%2Ces2018%2Ces2017%2Ces2016%2Ces2015%2Cdefault%2CglobalThis"
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
