const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function scrapeWebsite(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.select('select[name="standard-dictionary-table_length"]', '300');
    await delay(2000)

    let data = [];
    let hasNextPage = true;
    let count = 1

    while (count>0) {
      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);
      count-=1

      // Extract data from the current page (FROM A TABLE)
      $('tbody tr').each((i, el) => {
        const row = $(el);
        const dataRow = {
          id: row.find('td').eq(0).text().trim(),
          // col2: row.find('td').eq(1).text().trim(),
          // col3: row.find('td').eq(2).text().trim(),
          Hans: row.find('td').eq(3).text().trim(),
          pinyin: row.find('td').eq(4).text().trim(),
          mean: row.find('td').eq(5).text().trim(),
          // col7: row.find('td').eq(6).text().trim(),
        };
        if (dataRow.pinyin!=="") data.push(dataRow);
      });

      // Check for the "Next" button
      hasNextPage = await page.evaluate(() => {
        const nextButton = document.querySelector('a.paginate_button.next');
        if (nextButton) {
          nextButton.click();
          return true;
        }
        return false;
      });

      // // Wait for the new page to load
      if (count>0) {
        await page.waitForSelector('tbody', { timeout: 1500 }); // Adjust timeout as needed
      }
    }

    // Save data to a JSON file
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

    await browser.close();
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
  }
}

// URL của trang web cần scrape
const url = 'YOUR_URL';
scrapeWebsite(url);
