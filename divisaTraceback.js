const moment = require('moment');
const request = require('request-promise');
require('dotenv').config();

// Source: https://apiv2.bitcoinaverage.com/

const divisaTraceback = async(timestamp, divisa, amount) => {
    let crypto = ['BTC', 'ETH', 'LTC']
    let normal = ['USD', 'GBP', 'CNY', 'EUR'];
    if(amount > 0) {
        let divisaTraceback = {};
        let resolution = await getResolution(timestamp);
        if(crypto.includes(divisa)) {
            divisaTraceback[crypto.splice(crypto.indexOf(divisa), 1)[0]] = Number(amount);
            Object.assign(divisaTraceback, await requestIteration(normal, divisa, true, timestamp, amount, resolution));
            Object.assign(divisaTraceback, await requestIteration(crypto, 'USD', false, timestamp, divisaTraceback['USD'], resolution));
        }
        else if (normal.includes(divisa)) {
            divisaTraceback[normal.splice(normal.indexOf(divisa), 1)[0]] = Number(amount);
            Object.assign(divisaTraceback, await requestIteration(crypto, divisa, false, timestamp, amount, resolution));
            Object.assign(divisaTraceback, await requestIteration(normal, 'BTC', true, timestamp, divisaTraceback['BTC'], resolution));
        } else throw new Error('Currency target invalid');

        console.log(` Resolution: ${resolution}`);
        return(divisaTraceback);
    } else throw new Error('The amount must be 0 or higher');
};

const requestIteration = async(set, divisa, flag, timestamp, amount, resolution) => {
    timestamp = timestamp.format('X');
    let opt = { 
        method: 'GET', 
        json: true,
        headers: {
            'x-ba-key': process.env.APIKEY
        }
    };
    let res = {};
    for (element in set) {
        if(flag) {
            opt.uri = `https://apiv2.bitcoinaverage.com/indices/global/history/${divisa}${set[element]}?at=${timestamp}&resolution=${resolution}`;
            let { average, time } = await request(opt);
            res[set[element]] = average * amount; 
        }
        else {
            opt.uri = `https://apiv2.bitcoinaverage.com/indices/global/history/${set[element]}${divisa}?at=${timestamp}&resolution=${resolution}`;
            let { average, time } = await request(opt);
            res[set[element]] = amount / average;
        }
    }
    return res;
};

const getResolution = async(timestamp) => {
    let resolution = 'day';
    if(process.env.APIMODE == 'dev') {
        if(timestamp >= moment.utc().subtract(2, 'hours')) resolution = 'minute';
        else if(timestamp >= moment().subtract(10, 'days')) resolution = 'hour';
    } else if(process.env.APIMODE == 'startup' || process.env.APIMODE == 'grow') {
        if(timestamp >= moment.utc().subtract(24, 'hours')) resolution = 'minute';
        else if(timestamp >= moment.utc().subtract(31, 'days')) resolution = 'hour';
    } else throw new Error('Bad config at .env file');
    return resolution;
}

module.exports = divisaTraceback;