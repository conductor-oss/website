// Google Analytics 4 (G-PZHG7RTQP5) for conductor-oss.org. Loaded by index.html
// and templates/use-cases.html; this file is the only copy of the tag.
//
// Consent matches orkes.io: no banner and no Consent Mode defaults. Like orkes.io,
// it fires only on the production hostnames, so previews, forks and local builds
// send nothing. To test locally, add "127.0.0.1" to the list in dist/ only.
(function () {
  var MEASUREMENT_ID = "G-PZHG7RTQP5";
  var HOSTS = ["conductor-oss.org", "www.conductor-oss.org"];
  if (HOSTS.indexOf(location.hostname) < 0) return;

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);
})();
