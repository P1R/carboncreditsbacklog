#!/bin/bash
node0=`host node0.deca.eco | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node0}/tcp/4001/ipfs/Qmd4Cv2fNwixP6cabEnTVFkF57GUGD6VBEcDhUkqHPG4X9"
node2=`host node2.deca.eco | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node2}/tcp/4001/ipfs/QmfBASmqe3Az9AUjCxx3dtomSmbZEiJCsXusPxznjNnjU5"
node4=`host node4.deca.eco | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node4}/tcp/4001/ipfs/QmQBAsbA49q7QrKhetJpbo5gKxQQiL6sxVXCep5skmuHsq"
node5=`host node5.deca.eco | grep -Eo '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}'`;/usr/local/bin/ipfs swarm connect "/ip4/${node5}/tcp/4001/ipfs/QmZL1otpiCzWMEJTHXbQ5Hb4aFE7TKLjAuuBAAet1WAgtD"

