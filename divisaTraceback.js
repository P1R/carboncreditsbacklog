const request = require('request-promise');

require('dotenv').config()

// Source: https://apiv2.bitcoinaverage.com/

const divisaTraceback = async(timestamp, divisa, amount) => {
    let crypto = ['BTC', 'ETH', 'LTC']
    let normal = ['USD', 'GBP', 'CNY', 'EUR'];
    let opt = { method: 'GET', json: true };
    let cryptoHeaders = {
        'X-Testing': 'testing',
        'x-ba-key': process.env.APIKEY
    }
    try {
        if((Date.now() - 7776000000) <= (timestamp * 1000)) {
            if(crypto.includes(divisa) || normal.includes(divisa)) {
                if(amount > 0) {
                    opt.headers = cryptoHeaders;
                    let divisaTraceback = {};

                    if(crypto.includes(divisa)) {
                        divisaTraceback[crypto.splice(crypto.indexOf(divisa), 1)[0]] = Number(amount);
                        Object.assign(divisaTraceback, await requestIteration(normal, divisa, true, timestamp, amount));
                        Object.assign(divisaTraceback, await requestIteration(crypto, 'USD', false, timestamp, divisaTraceback['USD']));
                    }
                    else {
                        divisaTraceback[normal.splice(normal.indexOf(divisa), 1)[0]] = Number(amount);
                        Object.assign(divisaTraceback, await requestIteration(crypto, divisa, false, timestamp, amount));
                        Object.assign(divisaTraceback, await requestIteration(normal, 'BTC', true, timestamp, divisaTraceback['BTC']));
                    }
                    return(divisaTraceback);
                } else return('The amount must be greater that 0');
            } else return('Currency target invalid');
        } else return('Date out of range')
    } catch(e) {
        return(e);
    }
};

const requestIteration = async(set, divisa, flag, timestamp, amount) => {
    let opt = { 
        method: 'GET', 
        json: true,
        headers: {
            'X-Testing': 'testing',
            'x-ba-key': process.env.APIKEY
        }
    };
    let res = {};
    for (element in set) {
        if(flag) {
            opt.uri = `https://apiv2.bitcoinaverage.com/indices/global/history/${divisa}${set[element]}?at=${timestamp}&resolution=hour`;
            let { average } = await request(opt);
            res[set[element]] = average * amount; 
        }
        else {
            opt.uri = `https://apiv2.bitcoinaverage.com/indices/global/history/${set[element]}${divisa}?at=${timestamp}&resolution=hour`;
            let { average } = await request(opt);
            res[set[element]] = amount / average;
        }
    }
    return res;
};

module.exports = divisaTraceback;