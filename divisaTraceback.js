let moment = require('moment');
require('dotenv').config();

// Source: https://apiv2.bitcoinaverage.com/

const divisaTraceback = async(timestamp, divisa, amount) => {
    let crypto = ['BTC', 'ETH', 'LTC']
    let normal = ['USD', 'GBP', 'CNY', 'EUR'];
    try {
        if((Date.now() - 7776000000) <= (timestamp * 1000)) {
            if(crypto.includes(divisa) || normal.includes(divisa)) {
                if(amount >= 0) {
                    let divisaTraceback = {};
                    let resolution = await getResolution(timestamp);

                    if(crypto.includes(divisa)) {
                        divisaTraceback[crypto.splice(crypto.indexOf(divisa), 1)[0]] = Number(amount);
                        Object.assign(divisaTraceback, await requestIteration(normal, divisa, true, timestamp, amount, resolution));
                        Object.assign(divisaTraceback, await requestIteration(crypto, 'USD', false, timestamp, divisaTraceback['USD'], resolution));
                    }
                    else {
                        divisaTraceback[normal.splice(normal.indexOf(divisa), 1)[0]] = Number(amount);
                        Object.assign(divisaTraceback, await requestIteration(crypto, divisa, false, timestamp, amount, resolution));
                        Object.assign(divisaTraceback, await requestIteration(normal, 'BTC', true, timestamp, divisaTraceback['BTC'], resolution));
                    }
                    return(divisaTraceback);
                } else return('The amount must be 1 or higher');
            } else return('Currency target invalid');
        } else return('Date out of range')
    } catch(e) {
        throw 'error';
    }
};

const requestIteration = async(set, divisa, flag, timestamp, amount, resolution) => {
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
            let { average } = await request(opt);
            res[set[element]] = average * amount; 
        }
        else {
            opt.uri = `https://apiv2.bitcoinaverage.com/indices/global/history/${set[element]}${divisa}?at=${timestamp}&resolution=${resolution}`;
            let { average } = await request(opt);
            res[set[element]] = amount / average;
        }
    }
    return res;
};

const getResolution = async(timestamp) => {
    let resolution = 'day';
    let momentTime = moment(timestamp);
    if(process.env.API_MODE == 'dev') {
        if(momentTime >= moment().subtract(2, 'hours')) resolution = 'minute';
        else if(momentTime >= moment().subtract(10, 'days')) resolution = 'hour';

    } else if(process.env.API_MODE == 'startup' || process.env.API_MODE == 'grow') {
        if(momentTime >= moment().subtract(24, 'hours')) resolution = 'minute';
        else if(momentTime >= moment().subtract(31, 'days')) resolution = 'hour';

    } else throw new Error('Bad config');

    return resolution;
}

module.exports = divisaTraceback;