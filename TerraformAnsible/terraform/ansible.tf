# Configure inventory.ini
resource "local_file" "inventory" {
  filename = "../ansible/inventory.ini"
  content  = templatefile("../ansible/inventory.tpl", {
    ansible_host = azurerm_public_ip.public_ip.ip_address
  })
}