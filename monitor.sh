#!/bin/bash

# Usage Script
usage() { 
    # Display Help
    echo "You need to use the options below to run the script"
    echo
    echo "Syntax: scriptTemplate [-d|h]"
    echo "options:"
    echo "-h     Print this Help."
    echo "-d     Your root directory for this script."
    echo
}

# Get options
while getopts ":hd:" option; do
    case $option in
        d) # Enter Directory
            Directory=$OPTARG;;
        h) # Help
            usage
            exit;;
        \?) # Invalid option
            usage
            exit;;
    esac
done

############################################################
# Scripts                                                  #
############################################################
echo $(free -m) > $Directory/memory.txt
echo $(mpstat -P ALL -o JSON) > $Directory/cpu.json