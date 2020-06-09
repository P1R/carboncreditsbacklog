#!/bin/bash

./connectNodes.sh

# Receipts and Files to PIN
FilesHashList=("QmYw6JTNABDDfXvc3U2BfURjF5Zzx9eG3N43wJqHc4upDL" ) # \
    #"" \
    #"" \)
echo ""
echo "IPFS PIN DECA's Carbon Credits Receipts?:"

read -p "Enter Y for Yes, N for No:" choice
case "$choice" in
	Y | y) echo "Pinning Receipts by IPFS hash";
        for val in ${FilesHashList[*]}; do
            /usr/local/bin/ipfs pin add $val
        done
        ;;
	N | n) ;;
	
	*) echo "no option selected";;
esac

receiptsRoute=./receipts
echo ""
echo "IPFS GET(Download) DECA's Carbon Credits Receipts?:"

read -p "Enter Y for Yes, N for No:" choice
case "$choice" in
	Y | y) echo "Getting Receipts by IPFS hash";
        echo "Default receipts file is ./receipts..."
        mkdir $receiptsRoute
        for val in ${FilesHashList[*]}; do
            /usr/local/bin/ipfs get $val -o $receiptsRoute
        done
        ;;
	N | n) ;;
	
	*) echo "no option selected";;
esac

echo "Bye ;) $USERNAME"
