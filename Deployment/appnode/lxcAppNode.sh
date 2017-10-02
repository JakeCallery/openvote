#!/usr/bin/env bash
# cp /openvote/Deployment/inventory/hosts /openvote/Deployment/inventory/hosts
ansible-playbook -i ../inventory/hosts appnode_lxc_playbook.yml