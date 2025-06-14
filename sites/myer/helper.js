import { decode } from "html-entities"

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fixImagePath = (path) => {
  return path.replace("{{size}}", "720x928");
};

export const descriptionFormating = (descriptions, longDescription) => {
  let res = "";

  descriptions.map((description) => {
    if (Number(description.sequence)) {
      res += description.name + ": " + description.values[0]?.value + '\n';
    }
  });

  return deletTags(longDescription) + '\n' + res;
};

const deletTags = (text) => {
  const noTags = text.replace(/<[^>]*>/g, '')

  return decode(noTags)
}