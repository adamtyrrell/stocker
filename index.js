const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const PORT = 8000;
const app = express();
const url = 'https://www.google.com/finance/quote/AMC:NYSE?hl=en';
const priceData = require('./jsonFile.json');
let run = true;

function pullData(){
    run = false;
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

            console.log(prices);
            run = true;
            initial();
        }).catch(err => console.log(err));
    }

function initial(){
    if(run){
        pullData();
    }
}
initial();

app.get("/", (req, res) => {
 res.send("ello mate");
});

app.get("/price", (req, res) => {
    res.json(priceData);    
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`) );
