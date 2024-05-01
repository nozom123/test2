const websiteId = window.OxygenPixelData?.websiteId || "defaultId";
let pageLanded = false;

const retrieveAdditionalParameters = () => {
  return [...new URLSearchParams(window.location.search).entries()].reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key.toLowerCase()]: value.toLowerCase(),
    }),
    {}
  );
};

const appendParams = (url, params) => {
  const newUrl = new URL(url, window.location.origin);
  Object.keys(params).forEach((key) =>
    newUrl.searchParams.set(key, params[key])
  );
  return newUrl.toString();
};

const modifyElements = (selector, attribute, params) => {
  document.querySelectorAll(selector).forEach((element) => {
    if (element[attribute].startsWith(window.location.origin)) {
      element[attribute] = appendParams(element[attribute], params);
    }
  });
};

const getDomainFromUrl = (url) => {
  if (!url) return "";
  const hostname = new URL(url).hostname;
  return hostname.replace(/^www\./, ""); // Remove 'www.' prefix if exists
};

const sendDataToServer = (data, eventType) => {
  if (eventType === "landing" && pageLanded) return;

  fetch("https://api.ipify.org?format=json")
    .then((response) => response.json())
    .then(({ ip }) => {
      const referrer = document.referrer || "";
      const referrerDomain = getDomainFromUrl(referrer);
      const currentDomain = getDomainFromUrl(window.location.href);

      const combinedData = {
        eventType,
        websiteId,
        ipAddress: ip || "",
        referrer: referrerDomain === currentDomain ? "sameDomain" : referrer,
        additionalParams: retrieveAdditionalParameters(),
        ...data,
      };

      return fetch("https://miniature-space-fiesta-ppvwrqwr5r73rgrr-3000.app.github.dev/endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(combinedData),
      });
    })
    .then(() => {
      if (eventType === "landing") pageLanded = true;
    });
};

const handleInput = (event) => {
  const value = event.target.value.trim();
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
  const phoneRegex =
    /\b(?<![\d.])(?:\+\d{1,3}\s?)?(?:\(\d{1,}\)|\d{1,}[-.\s]?)?(?<!\d)\d{7,11}(?!\d)\b/;

  let data = {};
  if (emailRegex.test(value)) data.email = value;
  if (phoneRegex.test(value)) data.phoneNumber = value;
  if (Object.keys(data).length > 0) sendDataToServer(data, "input");
};

document.addEventListener("DOMContentLoaded", () => {
  const params = retrieveAdditionalParameters();
  modifyElements("a", "href", params);
  modifyElements("form", "action", params);
  sendDataToServer({ additionalParams: params }, "landing");
  document
    .querySelectorAll("input")
    .forEach((input) => input.addEventListener("focusout", handleInput));
});

const observer = new MutationObserver((mutations) => {
  const params = retrieveAdditionalParameters();
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches("a, form"))
          modifyElements(
            node.tagName.toLowerCase(),
            node.tagName === "A" ? "href" : "action",
            params
          );
        else
          node
            .querySelectorAll("input")
            .forEach((input) =>
              input.addEventListener("focusout", handleInput)
            );
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
