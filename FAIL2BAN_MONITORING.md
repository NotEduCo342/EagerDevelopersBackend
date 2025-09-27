# 🛡️ Fail2ban Monitoring Commands

## Check Fail2ban Status
```bash
# Overall status
sudo fail2ban-client status

# SSH jail status (most common)
sudo fail2ban-client status sshd

# All active jails
sudo fail2ban-client status | grep "Jail list"

# Check specific jail (replace 'sshd' with jail name)
sudo fail2ban-client status sshd
```

## View Banned IPs
```bash
# Currently banned IPs for SSH
sudo fail2ban-client get sshd banip

# All banned IPs (if you have multiple jails)
sudo iptables -L f2b-sshd -v -n

# Check ban logs
sudo tail -f /var/log/fail2ban.log

# Search for recent bans
sudo grep "Ban " /var/log/fail2ban.log | tail -10
```

## Unban an IP (if needed)
```bash
# Unban specific IP from SSH jail
sudo fail2ban-client set sshd unbanip 192.168.1.100

# Unban from all jails
sudo fail2ban-client unban 192.168.1.100
```

## Nginx Fail2ban Jail (Recommended Addition)
```bash
# Add to /etc/fail2ban/jail.local
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-req-limit]
enabled = true
port = http,https  
logpath = /var/log/nginx/access.log
maxretry = 10
findtime = 600
```

## Performance Impact Check
```bash
# Check how many IPs are currently banned
sudo iptables -L | grep -c "f2b"

# Monitor fail2ban CPU usage
top -p $(pgrep fail2ban-server)
```