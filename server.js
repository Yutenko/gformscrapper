const puppeteer = require('puppeteer');
const express = require('express');
const router = express();
const port = 3500;



router.get('/formsscrapper', (req,res) => {
  const { url } = req.query

  if (url) {
    scrapForms(url).then((data) => {
      res.json(data)
    })
  } else res.status(400).json({ msg: 'failed' })
})

router.get('*',(req,res) => {
  res.json({ msg: 'failed' })
})

router.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

let scrapForms = async (url) => {
  const browser = await puppeteer.launch({
     headless:true,
     args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
      ]
  });
  const page = await browser.newPage();
  await page.goto(url, {waitUntil: 'load'});
  await page.waitForNavigation({
   waitUntil: 'networkidle0',
  });


  const forms = await page.evaluate(() => Array.from(document.querySelectorAll('form'), element => element.action));
  let inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input'), element => element.name));
  //let questions = await page.evaluate(() => Array.from(document.querySelectorAll('.freebirdFormviewerComponentsQuestionBaseTitle'), element => element.innerText));
  let questions = await page.evaluate(() => Array.from(document.querySelectorAll('.M7eMe'), element => element.innerText));
  console.log(questions);
  inputs = await inputs.filter(el => {
    if (el.startsWith('entry.')) {
      return el.split('_')[0]
    }
  })
  let temp = []
  questions.map(el => {
    const split = el.split(';')
    if (split.length > 0) {
      return temp.push(split.map(entry => entry.trim()))
    }
  })

  browser.close();
  return { action: forms[0], inputs, questions:temp }
}
