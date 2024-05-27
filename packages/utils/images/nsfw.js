import axios from "axios";

const apiClient = axios.create({
 baseURL: "https://api.yurna.info",
 headers: {
  "Content-Type": "application/json",
 },
});

const baseUrl = "https://api.yurna.info/assets/";

const categories = {
 animals: {
  dog: "dog",
  cat: "cat",
  wolf: "wolf",
  tiger: "tiger",
  squirrel: "squirrel",
  panda: "panda",
  leopard: "leopard",
  husky: "husky",
 },
 anime: {
  naruto: "naruto",
  sasuke: "sasuke",
  sakura: "sakura",
  goku: "goku",
  vegeta: "vegeta",
 },
 wallpaper: {
  nature: "nature",
  city: "city",
  abstract: "abstract",
  space: "space",
  ocean: "ocean",
 },
};

async function getImageByTag(category, tag) {
 try {
  const categoryTags = categories[category.toLowerCase()];
  if (!categoryTags) {
   throw new Error("Invalid category provided.");
  }

  const tagKey = categoryTags[tag.toLowerCase()];
  if (!tagKey) {
   throw new Error("Invalid tag provided.");
  }

  const response = await apiClient.get(`/items/${category}`);
  const images = response.data.data;

  if (!images || images.length === 0) {
   throw new Error("Failed to retrieve images.");
  }

  const filteredImages = images.filter((image) => image.tags.includes(tagKey));

  if (filteredImages.length === 0) {
   throw new Error("No images found for the given tag.");
  }

  const randomImage = filteredImages[Math.floor(Math.random() * filteredImages.length)];

  const result = {
   imageUrl: `${baseUrl}${randomImage.image}`,
   imageId: randomImage.id,
   downloadUrl: `${baseUrl}${randomImage.image}`,
  };

  return result;
 } catch (error) {
  console.error("Error:", error.message);
  console.error("Full Response:", error.response?.data);
  return null;
 }
}

export { getImageByTag };
