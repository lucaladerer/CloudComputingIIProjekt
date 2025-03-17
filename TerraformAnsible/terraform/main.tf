# Terraform configuration
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# Azure provider configuration
provider "azurerm" {
  features {}
  resource_provider_registrations = "none"

  subscription_id = "50aa5193-f59f-4ae9-ae3b-f117e11060cb"
  client_id       = "3491f83b-61d9-468f-9d36-468ec0e487a2"
  client_secret   = "kGx8Q~oxMg2rBesGee2g8jeJVEyQ.vX-wBAbsaDW"
  tenant_id       = "e932d96a-c5aa-4f37-a68f-3722071530aa"
}

# Create resource group
resource "azurerm_resource_group" "rg" {
  name     = "myResourceGroup"
  location = "westeurope"
}

# Create virtual network
resource "azurerm_virtual_network" "vnet" {
  name                = "myVNet"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.0.0.0/16"]
}

# Create subnet
resource "azurerm_subnet" "subnet" {
  name                 = "mySubnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Create public IP
resource "azurerm_public_ip" "public_ip" {
  name                = "myPublicIP"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Dynamic"
  sku                 = "Basic"
}

# Create network interface
resource "azurerm_network_interface" "nic" {
  name                = "myNIC"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "myNicConfiguration"
    subnet_id                     = azurerm_subnet.subnet.id
    public_ip_address_id          = azurerm_public_ip.public_ip.id
    private_ip_address_allocation = "Dynamic"
  }
}

# Create Linux virtual machine
resource "azurerm_linux_virtual_machine" "vm" {
  name                = "jokes-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  size                = "Standard_DS1_v2"
  admin_username      = "azureuser"
  network_interface_ids = [azurerm_network_interface.nic.id]

  admin_ssh_key {
    username   = "azureuser"
    public_key = file("~./.ssh/keyForCC")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-focal"
    sku       = "20_04-lts"
    version   = "latest"
  }
}

## Docker
provider "docker" {
  host = "unix:///var/run/docker.sock"
}

# Image aus Deinem Dockerfile bauen
resource "docker_image" "app_image" {
  name = "my_app:latest"
  build {
    context    = "../WebApp"            # Pfad zum App-Code inklusive Dockerfile
    dockerfile = "../WebApp/dockerfile"
  }
}

# Container starten
resource "docker_container" "app_container" {
  name  = "my_app"
  image = docker_image.app_image.image_id

  ports {
    internal = 8080
    external = 8080
  }

    env = [
    "DB_PASSWORD=VfnMplqnE7iQJemc"
  ]
}


# Output the public IP of the VM
output "public_ip" {
  value       = azurerm_public_ip.public_ip.ip_address
  description = "Die öffentliche IP-Adresse der VM"
}
