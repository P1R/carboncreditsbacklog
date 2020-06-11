//Required inquier, ipfsclient, moment, OrbitDB, fs
const IpfsClient = require('ipfs-http-client');
const OrbitDB = require('orbit-db');
let inquirer = require('inquirer');
let moment = require('moment');
let hasher = require('node-object-hash')
const fs = require('fs');

const addressDB = 'decaCCDB';

//A instance of ipfs locally in ipfs daemon
const ipfs = IpfsClient('http://localhost:5001');
//Required module divisaTraceback to get all the prices 
var divisaTraceback = require('./divisaTraceback');

const hashSortCoerce = hasher({ sort: true, coerce: true });

//Function to start application
const main = async () => {
    const orbitdb = await OrbitDB.createInstance(ipfs)
    const db = await orbitdb.docs(addressDB, { indexBy: 'CCID' });
    await db.load();
    while (true) {
        await init();
        let { mainMenu } = await inquirer.prompt([{
            type: 'list',
            name: 'mainMenu',
            message: 'Select an action',
            choices: [
                'Show carbon credit records',
                'Insert carbon credit',
                'Search carbon credits',
                'Delete carbon credit',
                'Exit'
            ]
        }]);
        if (mainMenu == 'Show carbon credit records') {
            let data = db.get('');
            while (true) {
                    let { showMenu } = await inquirer.prompt([{
                    type: 'list',
                    name: 'showMenu',
                    message: 'Select an option',
                    choices: [
                        'Show in terminal',
                        'Save as JSON',
                        'Save as CSV',
                        'Back to main menu'
                    ]
                }]);
                if (showMenu == 'Show in terminal') {
                    for (element in data) {
                        showData(data[element], 0);
                        console.log('-------------------------------------\n');
                    }
                } else if (showMenu == 'Save as JSON') {
                    fs.writeFileSync(`/tmp/${moment().format()}.json`, JSON.stringify(data));
                    console.log(`File saved in /tmp/${moment().format()}.json`);
                } else if (showMenu == 'Save as CSV') {
                    let csv = '';
                    for (element in data) csv += await JSONToCSV(data[element]);
                    fs.writeFileSync(`/tmp/${moment().format()}.csv`, csv);
                    console.log(`File saved in /tmp/${moment().format()}.csv`);
                }
                else if (showMenu == 'Back to main menu') {
                    break;
                }
            }
            console.clear();
        }
        else if (mainMenu == 'Insert carbon credit') {
            let carbonCredit = {
                cancelPrice: undefined,
                SerialNo: undefined,
                issueDate: undefined,
                cancelDate: undefined,
                ccVintageStart: undefined,
                ccVintageEnd: undefined,
                ccCategory: undefined,
                ccMeasurement: undefined,
                ccStandard: undefined,
                countryCode: undefined,
                ccProjectID: undefined,
                ccAddress: undefined,
                CCAdquisitionRecipt: undefined,
                cancelRemaks: undefined,
                cancelPrice: {
                    qty: undefined,
                    divisa: undefined
                }
            }
            while (true) {
                await init();
                console.clear();
                console.log('Select one to modify the field.\n');
                let carbonCreditMenu = await generateData(carbonCredit, 0);
                let { insertMenu } = await inquirer.prompt([{
                    type: 'list',
                    pageSize: 24,
                    name: 'insertMenu',
                    message: 'Select a field/action',
                    choices: carbonCreditMenu.concat([
                        new inquirer.Separator(),
                        {
                            name: 'Actions',
                            disabled: ' '
                        },
                        'Insert current register',
                        'Back to main menu'
                    ])
                }]);
                if (insertMenu == 'Insert current register') {
                    if (await validateInsertion(carbonCredit)) {
                        try{
                            carbonCredit.conversionPrice = await divisaTraceback(
                                moment.utc(carbonCredit.cancelDate, 'DD-MM-YYYY HH:mm Z'),
                                carbonCredit.cancelPrice.divisa,
                                carbonCredit.cancelPrice.qty
                            );
                            if(carbonCredit.conversionPrice === 'error') throw new Error('Error at getting currencies price.');
                            showData(carbonCredit, 0);
                            serialNoPart=carbonCredit.SerialNo.split('-');
                            serialFloor=serialNoPart[7];
                            serialTop=serialNoPart[8];
                            var totalCC = 1+parseInt(serialTop)-parseInt(serialFloor);
                            let { input } = await inquirer.prompt([{
                                type: 'input',
                                name: 'input',
                                message: 'Data is correct, you will insert '+ String(totalCC) +" carbon credits y | n:",
                            }]);
                            if (input == 'y') {
                                carbonCredit.issueDate = moment(carbonCredit.issueDate + ' +0000', 'DD-MM-YYYY HH:mm Z').unix();
                                carbonCredit.cancelDate = moment(carbonCredit.cancelDate + ' +0000', 'DD-MM-YYYY HH:mm Z').unix();
                                carbonCredit.ccVintageStart = moment(carbonCredit.ccVintageStart + ' +0000', 'DD-MM-YYYY HH:mm Z').unix();
                                carbonCredit.ccVintageEnd = moment(carbonCredit.ccVintageEnd + ' +0000', 'DD-MM-YYYY HH:mm Z').unix(); 
                                carbonCredit.CCID = await hashSortCoerce.hash(carbonCredit);
                                const hash = await db.put(carbonCredit);
                                console.log(`Successful insertion, CCID: ${carbonCredit.CCID}, hash: ${hash}.`);
                                for(var i=parseInt(serialFloor)+1; i<=serialTop; i++){
                                        var tempCarbonCredit = {...carbonCredit};
                                        tempCarbonCredit.SerialNo= await asyncCCSerialNo(serialNoPart,i)
                                        tempCarbonCredit.CCID = await hashSortCoerce.hash(tempCarbonCredit);
                                        const hash = await db.put(tempCarbonCredit);
                                        console.log(`Successful insertion, CCID: ${tempCarbonCredit.CCID}, hash: ${hash}.`);
                                }     
                                console.log(`Inserted ${totalCC} carbon credits.`);
                                break;
                            } else {
                                console.clear();
                                console.log('Insertion aborted');
                                continue;
                            }
                        } catch(e) { 
                            console.log(`Error at divisaTraceback: ${e.message}`);
                        }
                    }
                    else {
                        await showErrorData(carbonCredit);
                    }
                }
                else if (insertMenu == 'Back to main menu') {
                    console.clear();
                    break;
                }
                else {
                    let subValue = false;
                    if (insertMenu[0] == ' ') {
                        insertMenu = insertMenu.trimStart().split(" ")[0];
                        subValue = true;
                    } else insertMenu = insertMenu.split(" ")[0];

                    if (insertMenu == 'divisa') {
                        let { currency } = await inquirer.prompt([{
                            type: 'list',
                            name: 'currency',
                            message: 'Choose a currency',
                            choices: ['BTC', 'ETH', 'LTC', 'USD', 'GBP', 'CNY', 'EUR']
                        }]);
                        carbonCredit.cancelPrice[insertMenu] = currency;
                    }
                    else {
                        let { input } = await inquirer.prompt([{
                            type: 'input',
                            name: 'input',
                            message: insertMenu + ': ',
                        }]);
                        if (input == '') console.log('Input mustn\'t be empty');
                        else if (insertMenu == 'issueDate' || insertMenu == 'cancelDate' || insertMenu == 'ccVintageStart' || insertMenu == 'ccVintageEnd') {
                            const date = moment.utc(input + ' +0000', 'DD-MM-YYYY HH:mm');
                            console.log(date);
                            if(date.isValid() && moment.utc() >= date) {
                                if(insertMenu != 'cancelDate') carbonCredit[insertMenu] = date.format('DD-MM-YYYY HH:mm Z');
                                else if((date >= moment.utc().subtract(3, 'months') && process.env.APIMODE == 'dev') ||
                                        (date >= moment.utc().subtract(1, 'year') && process.env.APIMODE == 'startup') ||
                                        (date >= moment.utc().subtract(7, 'year') && process.env.APIMODE == 'grow')) {
                                            carbonCredit[insertMenu] = date.format('DD-MM-YYYY HH:mm Z');
                                } else console.error(' Date is too old to get pricing data');
                            } else console.error(' Date must follow next syntax: dd-mm-yyyy hh-mm and can\'t be in the future');
                        }
                        else if (insertMenu == 'qty') {
                            if (parseFloat(input)) carbonCredit.cancelPrice[insertMenu] = input;
                            else console.log('This must be a number');
                        }
                        else {
                            if (subValue) carbonCredit.cancelPrice[insertMenu] = input;
                            else carbonCredit[insertMenu] = input;
                        }
                    }
                }
            }
        }
        else if (mainMenu == 'Search carbon credits') {
            let { searchMenu } = await inquirer.prompt([{
                type: 'list',
                name: 'searchMenu',
                message: 'Search carbon credit by:',
                choices: [
                    'Category',
                    'CCID',
                    'Standard',
                    'Project Id',
                    'Vintage Date',
                    'Adquisition Recipt',
                    'Back to main menu'
                ]
            }]);
            if (searchMenu == 'Category') {
                let { input } = await inquirer.prompt([{
                    type: 'input',
                    name: 'input',
                    message: 'Category: ',
                }]);
                let { confirm } = await inquirer.prompt([{
                    type: 'input',
                    name: 'confirm',
                    message: 'Confirm y | n: ',
                }]);
                if (confirm == 'y') {
                    const all = db.query((doc) => doc.ccCategory == input);
                    if (all.length > 0) {
                        let choicesSearch = await elemSearch(all);
                        await inquirer.prompt([{
                            type: 'list',
                            name: 'CCID',
                            message: 'Select CCID',
                            choices: choicesSearch
                        }]).then(answer => {
                            console.log(db.get(answer.CCID))
                        })
                    } else {
                        console.clear();
                        console.log("No registries found")
                    }
                } else {
                    console.clear();
                    console.log('Search canceled');
                }
            }
            else if (searchMenu == 'CCID') {
                let { input } = await inquirer.prompt([{
                    type: 'input',
                    name: 'input',
                    message: 'CCID: ',
                }]);
                let { confirm } = await inquirer.prompt([{
                    type: 'input',
                    name: 'confirm',
                    message: 'Confirm y | n: ',
                }]);
                if (confirm == 'y') {
                    console.log(db.get(input))
                } else {
                    console.clear();
                    console.log('Search canceled');
                }
            }
            else if (searchMenu == 'Standard') {
                let { input } = await inquirer.prompt([{
                    type: 'input',
                    name: 'input',
                    message: 'Standard: ',
                }]);
                let { confirm } = await inquirer.prompt([{
                    type: 'input',
                    name: 'confirm',
                    message: 'Confirm y | n: ',
                }]);
                if (confirm == 'y') {
                    const all = db.query((doc) => doc.ccStandard == input);
                    if (all.length > 0) {
                        let choicesSearch = await elemSearch(all);
                        await inquirer.prompt([{
                            type: 'list',
                            name: 'CCID',
                            message: 'Select CCID',
                            choices: choicesSearch
                        }]).then(answer => {
                            console.log(db.get(answer.CCID))
                        })
                    } else {
                        console.clear();
                        console.log("No registries found")
                    }
                } else {
                    console.clear();
                    console.log('Search canceled');
                }
            }
            else if (searchMenu == 'Project Id') {
                let { input } = await inquirer.prompt([{
                    type: 'input',
                    name: 'input',
                    message: 'ProjectID: ',
                }]);
                let { confirm } = await inquirer.prompt([{
                    type: 'input',
                    name: 'confirm',
                    message: 'Confirm y | n: ',
                }]);
                if (confirm == 'y') {
                    const all = db.query((doc) => doc.ccProjectID == input);
                    if (all.length > 0) {
                        let choicesSearch = await elemSearch(all);
                        await inquirer.prompt([{
                            type: 'list',
                            name: 'CCID',
                            message: 'Select CCID',
                            choices: choicesSearch
                        }]).then(answer => {
                            console.log(db.get(answer.CCID))
                        })
                    } else {
                        console.clear();
                        console.log("No registries found")
                    }
                } else {
                    console.clear();
                    console.log('Search canceled');
                }
            }
            else if (searchMenu == 'Vintage Date') {
                let { vintageMenu } = await inquirer.prompt([{
                    type: 'list',
                    name: 'vintageMenu',
                    message: 'Search carbon credit by:',
                    choices: [
                        'Vintage Start',
                        'Vintage End',
                        'Back to main menu'
                    ]
                }]);
                if (vintageMenu == 'Vintage Start') {
                    let { input } = await inquirer.prompt([{
                        type: 'input',
                        name: 'input',
                        message: 'Vintage Start: ',
                    }]);
                    let { confirm } = await inquirer.prompt([{
                        type: 'input',
                        name: 'confirm',
                        message: 'Confirm y | n: ',
                    }]);
                    if (confirm == 'y') {
                        let date = moment.utc(input + ' +0000', 'DD-MM-YYYY HH:mm');
                        date = date.format('DD-MM-YYYY HH:mm Z')
                        const all = db.query((doc) => doc.ccVintageStart == moment(date + ' +0000', 'DD-MM-YYYY HH:mm Z').unix());
                        if (all.length > 0) {
                            let choicesSearch = await elemSearch(all);
                            await inquirer.prompt([{
                                type: 'list',
                                name: 'CCID',
                                message: 'Select CCID',
                                choices: choicesSearch
                            }]).then(answer => {
                                console.log(db.get(answer.CCID))
                            })
                        } else {
                            console.clear();
                            console.log("No registries found")
                        }
                    } else {
                        console.clear();
                        console.log('Search canceled');
                    }
                } else if (vintageMenu == 'Vintage End') {
                    let { input } = await inquirer.prompt([{
                        type: 'input',
                        name: 'input',
                        message: 'Vintage End: ',
                    }]);
                    let { confirm } = await inquirer.prompt([{
                        type: 'input',
                        name: 'confirm',
                        message: 'Confirm y | n: ',
                    }]);
                    if (confirm == 'y') {
                        let date = moment.utc(input + ' +0000', 'DD-MM-YYYY HH:mm');
                        date = date.format('DD-MM-YYYY HH:mm Z')
                        const all = db.query((doc) => doc.ccVintageEnd == moment(date + ' +0000', 'DD-MM-YYYY HH:mm Z').unix());
                        if (all.length > 0) {
                            let choicesSearch = await elemSearch(all);
                            await inquirer.prompt([{
                                type: 'list',
                                name: 'CCID',
                                message: 'Select CCID',
                                choices: choicesSearch
                            }]).then(answer => {
                                console.log(db.get(answer.CCID))
                            })
                        } else {
                            console.clear();
                            console.log("No registries found")
                        }
                    } else {
                        console.clear();
                        console.log('Search canceled');
                    }
                } else if (vintageMenu == 'Back to main menu') {
                    console.clear();
                    console.log('Search canceled');
                }
            }
            else if (searchMenu == 'Adquisition Recipt') {
                let { input } = await inquirer.prompt([{
                    type: 'input',
                    name: 'input',
                    message: 'Adquisition Recipt: ',
                }]);
                let { confirm } = await inquirer.prompt([{
                    type: 'input',
                    name: 'confirm',
                    message: 'Confirm y | n: ',
                }]);
                if (confirm == 'y') {
                    const all = db.query((doc) => doc.CCAdquisitionRecipt == input);
                    if (all.length > 0) {
                        let choicesSearch = await elemSearch(all);
                        await inquirer.prompt([{
                            type: 'list',
                            name: 'CCID',
                            message: 'Select CCID',
                            choices: choicesSearch
                        }]).then(answer => {
                            console.log(db.get(answer.CCID))
                        })
                    } else {
                        console.clear();
                        console.log("No registries found")
                    }
                } else {
                    console.clear();
                    console.log('Search canceled');
                }
            }
            else if (searchMenu == 'Back to main menu') {
                console.clear();
                console.log("Search Canceled");
            }
        }
        else if (mainMenu == 'Delete carbon credit') {
            let { input } = await inquirer.prompt([{
                type: 'input',
                name: 'input',
                message: 'CCID: ',
            }]);
            if (input.length > 0) {
                const all = db.query((doc) => doc.CCID == input)
                if (all.length > 0) {
                    console.log(all);
                    let { confirm } = await inquirer.prompt([{
                        type: 'input',
                        name: 'confirm',
                        message: 'Confirm y | n: ',
                    }]);
                    if (confirm == 'y') {
                        console.clear();
                        const hash = await db.del(input);
                        console.log(`${input} deleted succesfully`);
                    } else {
                        console.clear();
                        console.log('Delete aborted');
                    }
                } else {
                    console.clear();
                    console.log("Error not found registry")
                }
            } else {
                console.clear();
                console.log("Error")
            }
        }
        else if (mainMenu == 'Exit') {
            await orbitdb.disconnect();
            process.exit();
        }
        else {
            console.log(`Error. The option is invalid.`);
            process.exit();
        }
    }
};




const init = async () => {
    let output = '   ____           _       _   _       _____    ______    _____       _          _____    _____ \n';
    output += '  / __ \\         | |     (_) | |     |  __ \\  |  ____|  / ____|     / \\        / ____|  / ____|\n';
    output += ' | |  | |  _ __  | |__    _  | |_    | |  | | | |__    | |         /   \\      | |      | |     \n';
    output += ' | |  | | | \'__| | \'_ \\  | | | __|   | |  | | |  __|   | |        / /_\\ \\     | |      | |     \n';
    output += ' | |__| | | |    | |_) | | | | |_    | |__| | | |____  | |____   / _____ \\    | |____  | |____ \n';
    output += '  \\____/  |_|    |_.__/  |_|  \\__|   |_____/  |______|  \\_____| /_/     \\_\\    \\_____|  \\_____|\n';
    output += '									  	       Interfaz\n';
    console.log(output);
}

const elemSearch = async (objectSearch) => {
    let elems = [];
    for (let key in objectSearch) {
        elems.push(objectSearch[key]['CCID']);
    }
    return elems;
}

const generateData = async (data, n) => {
    let menu = [];
    let tab = '    '.repeat(n);
    for (element in data) {
        if (typeof (data[element]) == 'object') {
            menu.push({ name: element, disabled: ' ' });
            menu = menu.concat(await generateData(data[element], n + 1));
        } else {
            let space = ' '.repeat(25 - element.length);
            space = space.substring(0, space.length - tab.length);
            menu.push(`${tab}${element}${space}${data[element]}`);
        }
    }
    return menu;
}

const asyncCCSerialNo = async (serialNoPart, index) => {
    serialNoPart[7] = String(index);
    return serialNoPart.join('-');
}

//Show carbon credit data
const showData = async (data, n) => {
    for (element in data) {
        for (let i = 0; i < n; i++) process.stdout.write('\t');
        if (typeof (data[element]) == 'object') {
            console.log(` ${element}:`);
            showData(data[element], n + 1);
        }
        if (data[element] != undefined) console.log(` ${element}: ${data[element]}`);
    }
}

//Validate data received
const validateInsertion = async (data) => {
    for (element in data) {
        if (typeof (data[element]) == 'object') {
            validateInsertion(data[element]);
        }
        else if (data[element] == undefined) {
            return false;
        }
    }
    return true;
}

//Show error in field 
const showErrorData = async (data) => {
    let errorfields = '';
    for (element in data) {
        if (typeof (data[element]) == 'object') {
            validateInsertion(data[element]);
        }
        else if (data[element] == undefined) errorfields += element + '\n';
    }
    console.log('The following fields have not been filled correctly:');
    console.log(errorfields);
}

//Parse json to csv
const JSONToCSV = async (data, n) => {
    let csv = '';
    for (element in data) {
        if (typeof (data[element]) == 'object') {
            validateInsertion(data[element]);
        }
        else csv += `${data[element]}, `
    }
    if (n == 0) csv += '\n';
    return csv;
}

//Call index function
main();
