#!/bin/bash

set -e  # Stoppt bei Fehlern

echo "TerraformAnsible directory"
cd TerraformAnsible/terraform

echo "terraform init"
terraform init

echo "terraform plan"
terraform plan

echo "terraform apply"
terraform apply -auto-approve

echo "Ansible playbook"
cd ../ansible
ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i ../ansible/inventory.ini ../ansible/playbook.yml
