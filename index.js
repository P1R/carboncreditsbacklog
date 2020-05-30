//Required ipfs and orbitdb
const IpfsClient = require('ipfs-http-client');
const OrbitDB = require('orbit-db');
//Instance of ipfs locally in ipfs daemon
const node = IpfsClient('http://localhost:5001');
const addressDB = 'decaCCDB';

//Async function to replicate or create a doc database
async function createReplicate() {
    //Instance of orbitdb with the node
    const orbitdb = await OrbitDB.createInstance(node)
    //Options to create or manage the DB
    const options = {
        indexBy: 'CCID',
        /*accessController:{
            //Set the nodes that can write
            //Default
            //write:[orbitdb.identity.id]
            write: [
                '038a6576a5cbca5eccc309543c34f0e3c1525fc98e984619d67987e593c1796ada', 
                '03ed275955675654f6de09b3955d52a721d62212165025b32b5f8cd9342a782916', 
                '0381c3ab247e3f4b41c160eef23869e491bacfb95afefc89fdc356d97104806a3c', 
                '033ffc8388edab523f1377ff8979a4807f402f01fd674eca883f36a92f6503a30b', 
             ]
        }*/
    }
    //Create or Replicate the DB with options
    const db = await orbitdb.docs(addressDB,options);
    //Load the entries in DB
    await db.load();
    //console.log(orbitdb.identity.id);
    //console.log(db.address.toString());
    //Emitted when the database has synced with another peer. 
    db.events.on('replicated', () => {
        //Put a message in log to verificated that the database is replicating
        console.log('replicated data');
    });
    //Note (Dont close the database but stop the replication)
}

//Call the async function
createReplicate();