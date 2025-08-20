import axios from "axios";
import axiosRetry from "axios-retry";
import * as cheerio from "cheerio";
import { USE_PROXY, PROXY_PARAMS } from "./../config.js";

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount, error) => {
    const url = error?.config?.url || "unknown";
    console.warn(
      `Retry attempt ${retryCount} for ${url}: ${error.message || error}`
    );
    return 2000;
  },
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error)
    );
  },
});

export async function getPageDetails(url) {
  let html = null;
  try {
    const response = await axios.get(url, {
      headers: {
        "if-none-match": '"10w02c7x9xeqpwu"',
        priority: "u=0, i",
        referer:
          "https://www.kmart.com.au/product/led-ice-cream-desk-lamp-43417797/",
        "sec-ch-ua":
          '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
      },
      proxy: USE_PROXY ? PROXY_PARAMS : false,
    });

    html = response.data;
  } catch (initialError) {
    console.warn(
      `Initial retries failed for ${url}. Starting manual proxy fallback...`
    );

    // Спроба №2: ручні спроби з проксі
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.warn(`Manual proxy attempt ${attempt} for ${url}`);
        const response = await axios.get(url, {
          proxy: PROXY_PARAMS,
          timeout: 5000,
        });
        html = response.data;
        break; // успішно, вийти з циклу
      } catch (proxyError) {
        console.error(`Proxy attempt ${attempt} failed: ${proxyError.message}`);
        if (attempt < 5) {
          await new Promise((res) => setTimeout(res, 1000)); // 1 сек пауза
        }
      }
    }

    if (!html) {
      console.error(`All proxy fallback attempts failed for ${url}`);
      return {
        success: false,
        data: {
          Description: "N/A",
          Specification: "N/A",
          "Original store Category": "N/A",
        },
      };
    }
  }

  try {
    const $ = cheerio.load(html);
    const ldJsonScript = $('script[type="application/ld+json"]').html();
    if (!ldJsonScript) throw new Error(`LD+JSON not found on ${url}`);

    const ldJson = JSON.parse(ldJsonScript);

    const description = await parseDescription(ldJson.description ?? "");
    if (description.Description.trim().endsWith("Additional Details")) {
      description.Description = description.Description.slice(
        0,
        -"Additional Details".length
      ).trim();
    }

    const category = (await parseCategory($)) || "N/A";

    return {
      success: true,
      data: {
        ...description,
        "Original store Category": category,
      },
    };
  } catch (error) {
    console.error(
      `Extra data scrapping error for ${url}: ${error.message || error}`
    );
    return {
      success: false,
      data: {
        Description: "N/A",
        Specification: "N/A",
        "Original store Category": "N/A",
      },
    };
  }
}

async function tryWithProxy(url, maxAttempts = 5, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.warn(`Fallback attempt ${attempt} with proxy for ${url}`);
      const { data: html } = await axios.get(url, {
        proxy: PROXY_PARAMS,
        timeout: 5000,
      });
      return html;
    } catch (error) {
      console.error(`Proxy attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  return null;
}

async function parseCategory($) {
  try {
    const breadcrumbs = [];
    $('ol[itemtype="http://schema.org/BreadcrumbList"] li').each((_, el) => {
      const text = $(el).text().trim();
      if (text) breadcrumbs.push(text);
    });
    return breadcrumbs.join(" / ");
  } catch (err) {
    console.warn(`Error in parseCategory: ${err}`);
    return "N/A";
  }
}

export async function parseDescription(descriptionHTML) {
  try {
    const $ = cheerio.load(`<div>${descriptionHTML}</div>`);
    const nodes = $("div").contents().toArray();

    const blocks = [];
    let currentHeader = null;
    let currentContent = [];

    function isParagraphWithOnlyStrong(el) {
      const $el = $(el);
      return (
        el.tagName?.toLowerCase() === "p" &&
        $el.children().length === 1 &&
        $el.children().first().prop("tagName")?.toLowerCase() === "strong" &&
        $el.text().trim() === $el.children().text().trim()
      );
    }

    function isTopLevelStrong(el) {
      return (
        el.tagName?.toLowerCase() === "strong" &&
        el.parent.tagName?.toLowerCase() === "div"
      );
    }

    function pushBlock() {
      if (currentHeader !== null || currentContent.length) {
        blocks.push({
          header: currentHeader,
          content: [...currentContent],
        });
      }
    }

    for (const el of nodes) {
      const $el = $(el);
      const tagName = el.tagName?.toLowerCase() || "";

      if (tagName === "em" || tagName === "br") {
        continue;
      }

      const isHeaderTag = isTopLevelStrong(el) || isParagraphWithOnlyStrong(el);

      if (isHeaderTag) {
        pushBlock();

        if (isTopLevelStrong(el)) {
          currentHeader = $el.text().trim();
        } else {
          currentHeader = $el.find("strong").text().trim();
        }

        currentContent = [];
        continue;
      }

      if ($el.find("a").length > 0 || $el.is("a")) {
        continue;
      }

      const text = $el.text().trim();
      if (!text || text === ".") {
        continue;
      }

      if (tagName === "ul" || tagName === "ol") {
        $el.find("li").each((_, li) => {
          const liText = $(li).text().trim();
          if (liText) currentContent.push(liText);
        });
      } else {
        currentContent.push(text);
      }
    }

    pushBlock();

    const lowerHeaders = blocks.map((b) => (b.header || "").toLowerCase());
    let specIndex = lowerHeaders.findIndex((h) => h.includes("specification"));
    if (specIndex < 0) {
      specIndex = lowerHeaders.findIndex((h) => h.includes("detail"));
    }

    let specText = "N/A";
    if (specIndex >= 0) {
      const b = blocks[specIndex];
      specText = b.header ? b.header + "\n" : "";
      specText += b.content.join("\n");
    }

    const descLines = [];
    blocks.forEach((b, idx) => {
      if (idx === specIndex) return;
      if (b.header) descLines.push(b.header);
      b.content.forEach((line) => descLines.push(line));
      descLines.push("");
    });

    const descText = descLines.join("\n").trim() || "N/A";

    return {
      Description: descText,
      Specification: specText,
    };
  } catch (err) {
    console.warn(`Error in parseDescription: ${err}`);
    return {
      Description: "N/A",
      Specification: "N/A",
    };
  }
}

// console.log(await getPageDetails("https://www.kmart.com.au/product/braid-photo-frame-4in.-x-6in.-(10cm-x-15cm)-mint-43491599/"))
