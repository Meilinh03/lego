const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL de la recherche Lego sur Dealabs
const url = 'https://www.dealabs.com/search?q=lego';

async function scrapeLegoDeals() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let deals = [];

    // Sélectionner chaque offre Lego
    $('div.js-threadList article > div.js-vue2').each((index, element) => {

      const data = JSON.parse($(element).attr('data-vue2'));
      const title = data.props.thread.title;
      const price = data.props.thread.price;
      const retailPrice = data.props.thread.nextBestPrice; // Prix d'origine
      const link = data.props.thread.link;
      const temperature = data.props.thread.temperature
      const image = `https://static-pepper.dealabs.com/threads/raw/${data.props.thread.mainImage.slotId}/${data.props.thread.mainImage.name}/re/300x300/qt/60/${data.props.thread.mainImage.name}.${data.props.thread.mainImage.extension}` ;     
      
      // Calcul du discount
      let discount = null;
      if (retailPrice && price) {
        discount = Math.round(((retailPrice - price) / retailPrice) * 100);
      }
      const comments = data.props.thread.commentCount;
      const published = new Date(data.props.thread.publishedAt * 1000);
      const id = data.props.thread.threadId;
      
      console.log(title);
      console.log(price);
      console.log(discount);
      console.log(link);      
      console.log(temperature);    
      console.log(image);
      console.log(comments);
      console.log(published);
      console.log(id);
    });
  } catch (error) {
    console.error(' Erreur de scraping:', error);
  }
}

// Lancer le scraping
scrapeLegoDeals();


module.exports.scrape = async url => {
  const response = await fetch(url);

  if (response.ok) {
    const body = await response.text();

    return parse(body);
  }

  console.error(response);

  return null;
};