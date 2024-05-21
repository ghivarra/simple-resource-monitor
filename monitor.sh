#!/bin/bash

# Default Options
UserName=$(whoami)
Directory=$(pwd)
Interval=5

# Usage Script
Help() { 
    # Display Help
    echo "You need to use the options below to run the script"
    echo
    echo "Syntax: [-d|h]"
    echo
    echo "options:"
    echo "-d     Your root directory for this script."
    echo "-h     Print this Help."
    echo "-i     Update interval (in seconds) for printing resource data."
    echo
}

# Get options
while getopts ":hd:" option; do
    case $option in
        d) # Enter Directory
            Directory=$OPTARG;;
        i) # Interval
            Interval=$OPTARG;;
        h) # Help
            Help
            exit;;
        \?) # Invalid option
            Help
            exit;;
    esac
done

############################################################
# Scripts                                                  #
############################################################
while [ 1 ]; do 
    echo $(free -m) > $Directory/memory.txt
    echo $(mpstat -P ALL -o JSON) > $Directory/cpu.json
    echo "Resource Usage Updated!"
    sleep $Interval; 
done