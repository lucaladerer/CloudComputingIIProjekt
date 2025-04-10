# Output the public IP of the VM
output "public_ip" {
  value       = azurerm_public_ip.public_ip.ip_address
  description = "Public IP of the virtual machine"
}