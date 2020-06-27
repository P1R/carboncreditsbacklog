# DECASCarbonCreditsBacklog

DECA's Carbon Credits OrbitDB Code and configs, everything you need for setting up a node.

**IMPORTANT: Please verify that the database address matches the smart contract address**


# CarbonCreditsBacklog


<p align="center">
  <img src="images/diagram.png" width="720" />
</p>

## Carbon Credit Structure

```sh
/*
  CC - Carbon credits
  Unix Time is date and time based in the UTC 0
  example for the first carbon credit that is 1365209
*/
[
  {
    //CCID: unique Carbon Credit Hash in DECAs registry (used as receipt and control)
    CCID: 'a67178fa3cb20e49f748050871f4f10784693bde1b9ec805740ff9c63b93860d', 
    SerialNo: 'GS1-1-MX-GS2441-16-2018-17438-328-328',
    ccAddress: 'https://registry.goldstandard.org/credit-blocks/details/107995', //Address GS Registry
    issueDate: 1552953600, // CC creation UnixTime
    cancelDate: 1587168000, // CC cancelation cancelation UnixTime
    ccCategory: 'Energy Efficiency - Domestic', // CC category agricultural
    ccStandard: 'GS', // CC standard GoldStandard Carbon Credit
    cancelPrice: { qty: '19.5', divisa: 'USD' },
    ccProjectID: 'GS2441', // CC project ID in the original backlog
    countryCode: 'MX', // Country code
    cancelRemaks: 'Cancel by account 1067262',
    ccVintageEnd: 1546214400, // CC what end date it was created in UnixTime
    ccMeasurement: 'VER(TCO2e)', //CC Measurement
    ccVintageStart: 1514764800, // CC what date year it was created in UnixTime
    conversionPrice: {
      BTC: 0.0027239430402556876,
      CNY: 137.92740063195478,
      ETH: 0.10952545708624091,
      EUR: 17.93351483640976,
      GBP: 15.588145399888809,
      LTC: 0.45310691929120134,
      USD: 19.5
    },
    CCAdquisitionRecipt: 'QmYw6JTNABDDfXvc3U2BfURjF5Zzx9eG3N43wJqHc4upDL' //Recipt of CC in IPFS
  }
]
```

## Requirements

* Node.js >= 12
* IPFS Daemon

## Instalation

**Download and install Node.js v12.x and npm.**

* Node.js

> Using Ubuntu

```sh
  $ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
  $ sudo apt-get install -y nodejs
```
> Using Debian, as root

```sh
 $ curl -sL https://deb.nodesource.com/setup_12.x | bash - 
 $ apt-get install -y nodejs
```

* IPFS Daemon

> Go to and download for your platform https://dist.ipfs.io/#go-ipfs

```sh
 $ tar xvfz go-ipfs.tar.gz
 $ cd go-ipfs
 $ ./install.sh
```

> Test

```sh
 $ ipfs help
```

> Init your node 

```sh
 $ ipfs init
```

> Configure ipfs as a service, set your self in the repository directory and do as follows: 

```sh
 $ sudo cp services/ipfs.service /etc/systemd/system/
```

> Modify user and path to ipfs so that it matches with your system and user that runs ipfs: 

```sh
 $ sudo vim /etc/systemd/system/ipfs.service

[Unit]
Description=IPFS Daemon

[Service]
ExecStart=/usr/local/bin/ipfs daemon --enable-pubsub-experiment
User=nodemaster
Restart=always
LimitNOFILE=10240

[Install]
WantedBy=multi-user.target
```
**NOTE: in this example user that runs ipfs and orbitdb instance is nodemaster, also the ipfs location is at /usr/local/bin/ipfs**

> Enable the service

```sh
 $ sudo systemctl daemon-reload
 $ sudo systemctl enable ipfs.service
 $ sudo systemctl start publicNode.service
 $ sudo systemctl status ipfs.service
```
**NOTE: service must be set as active (running), if not please verify the preview steps**



# [OrbitDB](https://github.com/orbitdb/orbit-db)

OrbitDB is a **serverless, distributed, peer-to-peer database**. OrbitDB uses [IPFS](https://ipfs.io) as its data storage and [IPFS Pubsub](https://github.com/ipfs/go-ipfs/blob/master/core/commands/pubsub.go#L23) to automatically sync databases with peers. It's an eventually consistent database that uses [CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) for conflict-free database merges making OrbitDB an excellent choice for decentralized apps (dApps), blockchain applications and offline-first web applications.

## Usage local 

**Clone the repo**

```sh
 $ git clone https://gitlab.com/deca-currency/carboncreditsbacklog.git
 $ cd carboncreditsbacklog
```

**Install the dependencies:**

```sh
 $ npm install 
```

**Start IPFS Daemon** (Note: pubsub-experiment is necesary to work with OrbitDB)

```sh
 $ ipfs daemon --enable-pubsub-experiment
```

**Start the DecaCC Interface**

```sh
 $ node interfaz.js
```

**Note: With this you can use OrbitDB but only in your local node**

## Usage with replication

You need to do all the past steps.

Run index.js with uncomment line 24, 25, the first log is your orbitdb address (See the Wiki for more information), the second is your orbitDB address database copy this address and pass in index.js in line 6, and in interfaz.js in the same line.

**If you want to debug orbitdb in bash**

```sh
 $ export LOG="orbit*" node
```

**Start the DecaCC replicated**

```sh
 $ node index.js
```

Later in the nodes that will work like peers only, install the requeriments and run index.js with the new address.


**Start the DecaCC Interface**

```sh
 $ node interfaz.js
```

In the node that can write run interfaz.js and choose an option.

```sh
 $ Show Carbon Credit records
 $ Insert Carbon credit      
 $ Delete Carbon credit      
 $ Exit 
```

**Note: If the nodes will replicated you need connect before with IPFS Daemon (See Wiki).**

*Note 2: Remember dont lost your orbitdb folder because your identity.id change and cant write in a database another time*

## Connect Nodes

In order to connect nodes, we create a bash script which resolves the domain name of each node and ipfs swarms them,
this script should be configured in a crontab to run every 5 minutes. The crontab should be configured as the user
that holds this repository and that runs the orbitdb.

*Open the crontab as the user that holds the script*
```sh
 $ crontab -e
```
*Append the following line at the end of the editor and write it*

```sh
0,5,10,15,20,25,30,35,40,45,50,55 * * * * sleep 28 ; /home/nodemaster/carboncreditsbacklog/connectNodes.sh >> /tmp/NodeStatus.log  2>&1 &
```
**NOTE: in this example the path is nodemaster user directory, you should change it with your username and the path to the script connectNodes.sh**

*Finally verify the logs at /tmp/NodeStatus.log to verify that it is working, this should look similar to this:*
```sh
$ cat /tmp/NodeStatus.log

Error: connect Qmd4Cv2fNwixP6cabEnTVFkF57GUGD6VBEcDhUkqHPG4X9 failure: dial to self attempted
connect QmdcWqBmvAvdNY2gq14LTP6rAgSQAe1cBvnpwqWrJy8S2Y success
connect QmfBASmqe3Az9AUjCxx3dtomSmbZEiJCsXusPxznjNnjU5 success
connect QmPbDkCpSE9uQuiXTBnoWjnzRESpSe9p8P1de12nExA4fY success
connect QmQBAsbA49q7QrKhetJpbo5gKxQQiL6sxVXCep5skmuHsq success
connect QmZL1otpiCzWMEJTHXbQ5Hb4aFE7TKLjAuuBAAet1WAgtD success
```
**NOTE: it is possible that you won't connect at the first try with most of the nodes, so you can wait for 10 or 15 minutes to verify again**

# For Public NODES updater as service

## This is in case you want to have a node that is just for public access and constantly replicating the last data in orbit DB

> Configure public nodes updater service, set your self in the repository directory and do as follows: 

```sh
 $ sudo cp services/publicNode.service /etc/systemd/system/
```

> Modify user and path to node and the repository so that it matches with your system and user that runs ipfs and node: 

```sh
 $ sudo vim /etc/systemd/system/publicNode.service 
 
[Unit]
Description=Public Node Updater

[Service]
WorkingDirectory=/home/nodemaster/carboncreditsbacklog/
ExecStart=/usr/local/bin/node /home/nodemaster/carboncreditsbacklog/index.js
User=nodemaster
Restart=always
LimitNOFILE=10240

[Install]
WantedBy=multi-user.target

```
**NOTE: in this example user that runs ipfs, node and orbitdb instance is nodemaster, also the node location is at /usr/local/bin/node**

**NOTE1: set WorkingDirectory where is the repository, for this example /home/nodemaster/carboncreditsbacklog/**

**NOTE2: set where is index.js mostly in the repository as follow path to node path, for this example /home/nodemaster/carboncreditsbacklog/index.js**

> Enable the service

```sh
 $ sudo systemctl daemon-reload
 $ sudo systemctl enable publicNode.service 
 $ sudo systemctl start publicNode.service 
 $ sudo systemctl status publicNode.service 
```
**NOTE: service must be set as active (running), if not please verify the preview steps**

# IPFS pin projects receipts

**You can help us by pinning  DECA's project receipts into IPFS which will give deeper trust to DECA.**

We have a script in order to pin (replicate into your node) the projects receipts that DECA got, so that
any one can have a proof that we bought this receipts as public information. Also you can store a copy of this receipts which will be added by IPFS hash into this script. 

> run the IPFS pin script

```sh
 $ /receipts.sh 
connect Qmd4Cv2fNwixP6cabEnTVFkF57GUGD6VBEcDhUkqHPG4X9 success
connect QmfBASmqe3Az9AUjCxx3dtomSmbZEiJCsXusPxznjNnjU5 success
connect QmQBAsbA49q7QrKhetJpbo5gKxQQiL6sxVXCep5skmuHsq success
connect QmZL1otpiCzWMEJTHXbQ5Hb4aFE7TKLjAuuBAAet1WAgtD success

IPFS PIN DECA's Carbon Credits Receipts?:
Enter Y for Yes, N for No:Y
Pinning Receipts by IPFS hash
pinned QmYw6JTNABDDfXvc3U2BfURjF5Zzx9eG3N43wJqHc4upDL recursively

IPFS GET(Download) DECA's Carbon Credits Receipts?:
Enter Y for Yes, N for No:Y
Getting Receipts by IPFS hash
Default receipts file is ./receipts...
Saving file(s) to ./proyectsReceipts
 135.34 KiB / 135.34 KiB [======================================================================================================================================] 100.00% 0s
Bye ;) 

$ ls proyectsReceipts 
QmYw6JTNABDDfXvc3U2BfURjF5Zzx9eG3N43wJqHc4upDL
```

As you can see in the above example we pin the receipt by running " ./receipts.sh ", also we Download this receipt with should be allocated in the directory projects Receipts.
