#!/bin/bash
node0=`host node0.deca.green | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node0}/tcp/4001/ipfs/Qmd4Cv2fNwixP6cabEnTVFkF57GUGD6VBEcDhUkqHPG4X9"
node2=`host node2.deca.green | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node2}/tcp/4001/ipfs/QmfBASmqe3Az9AUjCxx3dtomSmbZEiJCsXusPxznjNnjU5"
node4=`host node4.deca.green | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node4}/tcp/4001/ipfs/QmQAbhxMCjQpNrdU3xJYZjjmd7bHXUGcLx2o7wfpvvzJvc"
node5=`host node5.deca.green | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node5}/tcp/4001/ipfs/QmZL1otpiCzWMEJTHXbQ5Hb4aFE7TKLjAuuBAAet1WAgtD"
node6=`host node.neetsec.com | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node6}/tcp/4001/ipfs/QmYDVy4LE5wsNecmHPpyUp8MDuSRtpYtQuDjpLhvRjfKTj"
node7=`host node7.deca.green | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node7}/tcp/4001/ipfs/QmWeR6iiPSRU9V2qJBePRXNqh5foG6oGSXhnK72Pc4338q"
