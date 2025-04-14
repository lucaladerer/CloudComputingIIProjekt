# CloudComputingIIProjekt

This repository contains a Web-App called "Joke App" which was developed as part of the CloudComputing II lecture a the DHBW Stuttgart using Terraform and Ansible. The means of the app is to get a random joke via a REST API call and rate it on a five star scale. You can then review the ranking on the ranking page.

## Execution
Two options available.

- ./start.sh in the root directory
- Enter every command by hand
   1. cd TerraformAnsible/terraform
   2. terraform init
   3. terraform plan
   4. terraform init (approve when asked with "yes")
   5. ansible-playbook -i ../ansible/inventory.ini ../ansible/playbook.yml

## Folder Structure
```
└── TerraformAnsible
    └── ansible
        └── database.yml
        └── deploy.yml
        └── install.yml
        └── inventory.tpl
        └── playbook.yml
        └── secrets.yml
        └── terraform.tfstate
    └── terraform
        └── ansible.tf
        └── azure.tf
        └── config.tf
        └── outputs.tf
        └── terraform.tfstate
        └── terraform.tfstate.backup
        └── terraform.tfvars
        └── variables.tf
        └── vm.tf
    └── terraform.tfstate
└── WebApp
    └── static
        └── script.js
        └── style.css
    └── templates
        └── index.html
        └── ranking.html
    └── tests
        └── conftest.py
        └── tests.py
    └── app.py
    └── dockerfile
    └── requirements.txt
    └── wsgi.py
└── .gitignore
└── start.sh
```
