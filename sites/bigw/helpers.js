import { decode } from "html-entities";

export const specificationFormating = (specifications) => {
  let res = "";

  specifications.map((specification) => {
    const name = specification.name;
    const description = specification.description;

    res = res + (name + ": " + description + "\n");
  });

  return res;
};

export const imagesFormating = (images) => {
  let res = "";

  images.forEach((image) => {
    res += "https://www.bigw.com.au/" + image.sources[0].url + "\n";
  });
  return res;
};

export const toSlug = (name, productId) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return "https://www.bigw.com.au/product/" + slug + "/p/" + productId;
};

export const categotysFormating = (categories) => {
  return categories.map((c) => c.name).join(" / ");
};

export const descriptionFormating = (description, summary) => {
  const noTagsDescription = description.replace(/<[^>]*>/g, "");
  const noTagsSummary = summary.replace(/<[^>]*>/g, "");

  return decode(noTagsDescription) + "\n" + decode(noTagsSummary);
};

export const getUniqueById = (arr) => {
  const seen = new Set();

  return arr.filter((item) => {
    if (seen.has(item["Product SKU"])) return false;
    seen.add(item["Product SKU"]);
    return true;
  });
};
