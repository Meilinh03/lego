const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.dealabs.com/search?q=lego';

async function scrapeLegoDeals() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let deals = [];

    $('div.js-threadList article > div.js-vue2').each((index, element) => {
      const threadData = JSON.parse($(element).attr('data-vue2'));
      const thread = threadData.props.thread;

      const title = thread.title;
      const price = thread.price;
      const retailPrice = thread.nextBestPrice;
      const link = thread.link;
      const temperature = thread.temperature;
      const image = `https://static-pepper.dealabs.com/threads/raw/${thread.mainImage.slotId}/${thread.mainImage.name}/re/300x300/qt/60/${thread.mainImage.name}.${thread.mainImage.extension}`;
      
      let discount = null;
      if (retailPrice && price) {
        discount = Math.round(((retailPrice - price) / retailPrice) * 100);
      }
      
      const comments = thread.commentCount;
      const published = new Date(thread.publishedAt * 1000);
      const id = thread.threadId;
      
      deals.push({
        id,
        title,
        price,
        retailPrice,
        discount,
        link,
        temperature,
        image,
        comments,
        published
      });
    });

    fs.writeFileSync('lego_deals.json', JSON.stringify(deals, null, 2));
    console.log('Données enregistrées dans lego_deals.json');
  } catch (error) {
    console.error('Erreur de scraping:', error);
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