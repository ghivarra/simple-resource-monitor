#!/bin/bash

############################################################
# Variables                                                #
############################################################
UserName=webmaster
DomainName=monitor.test

############################################################
# Scripts                                                  #
############################################################
echo $(free -m) > /home/$UserName/www/$DomainName/memory.txt
echo $(mpstat -P ALL -o JSON) > /home/$UserName/www/$DomainName/cpu.json