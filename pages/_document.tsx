import { Html, Head, Main, NextScript } from 'next/document';

/**
 * 百度 统计
 * @returns
 */
const BaiduAnalyze = () => {
  if (!process.env.BD_ANALYZE_KEY) {
    return null;
  }

  return (
    <script
      id="baidu-analyze"
      defer
      dangerouslySetInnerHTML={{
        __html: `
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?${process.env.BD_ANALYZE_KEY}";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
  `,
      }}
    ></script>
  );
};

export default function Document() {
  return (
    <Html>
      <Head>
        <script
          defer
          noModule
          src="https://www.wakedt.cn/__polyfill__?features=es2022%2Ces2021%2Ces2020%2Ces2019%2Ces2018%2Ces2017%2Ces2016%2Ces2015%2Cdefault%2CglobalThis"
        ></script>
        <BaiduAnalyze />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
