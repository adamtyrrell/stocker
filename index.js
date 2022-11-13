require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const PORT = 8000;
const app = express();
const url = 'https://www.google.com/finance/quote/AMC:NYSE?hl=en';
const priceData = require('./jsonFile.json');
const dataDump = require('./dataDump.json');

function pullData(){
    axios(url)
        .then(response => {
            const html = response.data;
            const raw = cheerio.load(html);
            let prices = '';
            raw('.kf1m0', html).each(function() { 
                const price = raw(this).find('div').text();
                prices = price;
                
            })
            let json = {"id": 1,"price":prices};
            let str = JSON.stringify(json);
            let fs = require("fs");
            fs.writeFile("jsonFile.json", str, function(error){
                if(error) {
                    console.log('err');
                }else {
                    console.log('success');
                }
            })
            fetchStockInfo();
            console.log(prices);
        }).catch(err => console.log(err));

        async function fetchStockInfo(){
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.TWELVE_API_KEY,
                    'X-RapidAPI-Host': process.env.API_URL
                }
            };
            //Fetch Real-Time Price
            const response = await fetch('https://twelve-data1.p.rapidapi.com/price?symbol=AMC&format=json&outputsize=2', options);
            const data = await response.json();
            const rawPrice = data.price;
            const price = rawPrice.slice(0, -3);
            //Fetch Company Logo
            const logoResponse = await fetch('https://twelve-data1.p.rapidapi.com/logo?symbol=amc', options);
            const logoData = await logoResponse.json();
            const logo = logoData.url;
            //Fetch Open, High, Low, Close & Volume
            const priceSeriesResponse = await fetch('https://twelve-data1.p.rapidapi.com/time_series?symbol=amc&interval=1day&outputsize=30&format=json', options);
            const rawPriceSeries = await priceSeriesResponse.json();
            const previousClosePrice = rawPriceSeries.values[1].close.slice(0, -3);
            const todaysHighPrice = rawPriceSeries.values[0].high.slice(0, -3);
            const todaysLowPrice = rawPriceSeries.values[0].low.slice(0, -3);
            const todaysOpenPrice = rawPriceSeries.values[0].open.slice(0, -3);
            const todaysVolume = rawPriceSeries.values[0].volume;
            //Fetch SMA 13
            const sma13Response =  await fetch('https://twelve-data1.p.rapidapi.com/sma?interval=1day&symbol=AMC&time_period=9&outputsize=48&format=json&series_type=close', options);
            const rawSma13 = await sma13Response.json();
            const sma13 = rawSma13
            console.log(rawSma13);
            let json = {"id": 1,"logo":logo};
            let str = JSON.stringify(json);
            let fs = require("fs");
            fs.writeFile("dataDump.json", str, function(error){
                if(error) {
                    console.log('err2');
                }else {
                    console.log('success2');
                }
            })
        } 
    }

pullData();

app.get("/", (req, res) => {
 res.send("ello mate");
});

app.get("/price", (req, res) => {
    res.json(priceData);    
});

app.get("/moreData", (req, res) => {
    res.json(dataDump);    
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`) );

//11