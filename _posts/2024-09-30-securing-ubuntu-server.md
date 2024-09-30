---
layout: post
title:  "Securing a Linux Server for Production"
date:   2024-09-30 13:34:01 -0400
---

<!-- excerpt-start -->
Let's be honest. Platform as a Service (PaaS) providers overcharge for a lot of their services. 
It makes sense - they need to make money _somehow_. But not on my dime! I'm going to set up my own 
Virtual Private Server (VPS) for self-hosting, and I'm gonna do it on the cheap. 
<!-- excerpt-end -->

## Provisioning the Server
The first step is to provision the actual server. Normally, I'd use Terraform or the like, but for simplicity, 
I'm going to use Linode's UI to get this up and running. In the future, I may write an actual .tf file, but this 
blog post is about getting up and running. Securely, of course.

I created a "Nanode" with 1 GB RAM, 1 CPU Core, and 25 GB of storage. This is a tiny server, so I may have to re-do 
this process in the future using a bigger image. But for now, I'll take it. 


## Setting Up Users
Now that I've waited for the server to be provisioned, I can see that my new server's public IP address is `45.33.90.24`. 
I'm going to go ahead and SSH into it as the root user:

```bash
>> ssh root@45.33.90.24
```

Part of the setup process on Linode was setting a password and SSH public key for this user, so 
SSH'ing into this server for the first time, I'll go ahead and enter that password and confirm the 
fingerprint for the server. Now, upon future logins, it should use my SSH key to avoid re-entering the password. 

I'll go ahead and create a non-root user:

```bash
>> adduser ytimen
```

and follow the prompts for setting this new user's password and details. Next, I'll want to grant this user `sudo` 
permissions:

```bash
>> usermod -aG sudo ytimen
```

To test that the new user has the correct permissions, we can try to run a `sudo` command with the new user. 
We have 2 options for doing this:

1. Use the `su` command:
```bash
# substitute user with the new user
>> su ytimen
# list the contents of the root directory, will prompt for a password
>> sudo ls /
```

2. Exit from `root` and log back in with new user
```bash 
# Leave
>> exit
# Return
>> ssh ytimen@45.33.90.24
>> sudo ls /
```

It's been confirmed - the new user is all set!

## Setting up a Domain Name
I bought a domain name from [Namecheap.com](https://www.namecheap.com/).
Once I confirmed my information from their email, I was able to manage the DNS settings for the domain. 
I used Namecheap BasicDNS since it was the cheapest and most basic option, and then proceeded to their 
Advanced DNS tab to configure the settings. 

Under "Host Records", I added a new `A Record` with the "Host" set to `@` (denoting that no prefix should be used),
and I set the "Value" of the record to be equal to the Public IP Address of my VPS. I left the TTL on "Automatic", 
which typically defaults to 300 seconds (5 min). This TTL value dictates how long the DNS record will be cached 
in the DNS servers for, meaning that, if I add or change a DNS record, it may take up to 5 minutes to go into effect. 

I can test that this change took effect by seeing if my new hostname is resolved. In this case, the domain name that I 
bought was `yuvaltimen.xyz`. Let's see if it got updated to point to my VPS's IP Address:

```bash
>> ping yuvaltimen.xyz 

PING yuvaltimen.xyz (45.33.90.24): 56 data bytes
64 bytes from 45.33.90.24: icmp_seq=0 ttl=53 time=14.245 ms
64 bytes from 45.33.90.24: icmp_seq=1 ttl=53 time=21.427 ms
...
```

It worked! I can see my VPS's IP Address `45.33.90.24` returned from the `ping`, meaning that the Domain Name 
`yuvaltimen.xyz` was resolved to the IP Address `45.33.90.24`.


## Hardening the Server
Now that I have the server running with a Domain Name and a non-root user, I can go ahead configuring security 
measures to harden the server. There are countless measures that can be taken, and ultimately, anything connected to the 
internet (and even machines air-gapped from the internet) have vulnerabilities. But the goal is not to hermetically seal 
the server. The goal is to take common-sense measures to harden it against hackers' automated scripts. Since my server will 
_probably_ not contain national secrets or other ultra-sensitive information, my threat landscape will be pretty contained 
and I can focus on basic security measures. That being said, if your server contains high-value information, you may need to 
go to greater lengths to secure access to your machine. 

#### Getting Rid of Password-Based Logins
Passwords are less secure than SSH-Keys, because they can be brute-forced. Or worse, you might be one of those 
knuckleheads that uses a password like "password", which most hackers will try to guess first before even trying to 
brute-force anything else. Meanwhile, SSH-Keys are much harder to crack, and while they do have their weaknesses, they 
are considered more secure than password-based logins. 

Since I already have SSH Keys on my computer, I'll be using one of those. If you don't have keys, or if future 
me decides I need to access this server from a different machine, I'd have to generate a new key-pair and copy the public 
key to the server. This can be done through the `ssh-keygen` command, for example:

```bash
>>  ssh-keygen -t ed25519 -a 32 -f ~/.ssh/id_ed25519
```

This would create a key-pair. One private key at `~/.ssh/id_ed25519` whcih you should NEVER SHARE WITH ANYONE OR COPY 
ANYWHERE, and another public key at `~/.ssh/id_ed25519.pub` which is to be copied to the server using the following command:

```bash
>> ssh-copy-id -i ~/.ssh/id_ed25519 ytimen@yuvaltimen.xyz
```

This will SSH into the remote machine at `yuvaltimen.xyz` using the user `ytimen` and add the public key corresponding 
to `~/.ssh/id_ed25519` (in this case, `~/.ssh/authorized_keys.pub`) to the remote user's `~/.ssh/authorized_keys`. 

Now that I've added my public key, let's go ahead and disable password-based auth and non-root logins. I'll open up my 
sshd_config file:

```bash 
>> sudo vim /etc/ssh/sshd_config
```

and set the following options, making sure to save the file after editing:

- `PasswordAuthentication no`
- `PermitRootLogin no`
- `UsePAM no`

Now, I'll apply these changes by restarting the ssh service:

```bash
>> sudo systemctl reload ssh 
```

I can confirm that this works by attempting to ssh in as the root user:

```bash 
>> ssh root@yuvaltimen.xyz

root@45.33.90.24: Permission denied (publickey). 
```

Nice! Permission denied, just like we hoped for.

#### Setting Up a Firewall
Controlling incoming and outgoing network requests is an essential part of securing the server. Luckily, Ubuntu has a 
really easy solution pre-installed. Enter, `ufw`: The `U`ncomplicated `F`ire`W`all. This is the configuration I used:

```bash
# Disable all inbound network requests by default
>> sudo ufw default deny incoming

# Enable all outbound network requests by default
>> sudo ufw default allow outgoing

# Enable inbound requests to OpenSSH server, to allow SSH'ing into the VPS 
# Also enable inbound requests to the web server ports 80 and 8080
>> sudo ufw allow OpenSSH
>> sudo ufw allow 80
>> sudo ufw allow 8080

# Check all the firewall rules applied thus far
>> sudo ufw show added

# Enable the firewall - will prompt for confirmation (y|n)? 
>> sudo ufw enable

# Check the status of the firewall
>> sudo ufw status
```

This is all nice and good, but when eventually using Docker, it's important to note that there's a problem with using 
Docker with `ufw`, discussed in the section titled "Configuring Traefik as a Reverse Proxy and HTTPS Termination Proxy" 
later in this guide. For now, all we need to note is that exposing Docker ports will actually override `ufw`'s configs, 
so we need to be careful not to run Docker files with exposed ports on the server.

## Installing Docker 
Since I'm using Ubuntu, I'll follow the instructions on the 
[official Docker Docs](https://docs.docker.com/engine/install/ubuntu/) for installing Docker on Ubuntu systems. 
(I've slightly modified these commands for my own purposes):

1. Set up Docker's `apt` repository.
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

2. Install the Docker packages.
```bash
>> sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

3. I'll add my user to the Docker group to avoid needing to `sudo` every 
Docker command:
```bash
>> sudo usermod -aG docker ytimen
```

4. Verify that the Docker Engine and Docker Compose Plugin installations are successful.
```bash 
>> docker --version && docker compose version
>> docker run hello-world
```

## Configuring Traefik as a Reverse Proxy and HTTPS Termination Proxy
There's a weird little quirk when it comes to using Docker with `ufw`, and that is that using a Docker `EXPOSE <port>`
directive, or any port mappings in a docker-compose file will actually override the `ufw` firewall rules. There are many 
ways to get around this, but I'll go with configuring Traefik as a reverse proxy, so that I don't actually need to expose 
any Docker ports. This will have the added benefit of helping me down the road with HTTPS Certificate renewals, woohoo! 

```yaml
services:
  api-service:  
    image: <docker-image-version>
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api-service.rule=Host(`yuvaltimen.xyz`)"
      - "traefik.http.routers.api-service.entrypoints=websecure"
      - "traefik.http.routers.api-service.tls.certresolver=myresolver"
    ...
  reverse-proxy:
    image: traefik:v3.1
    command:
      # Allow the Web UI for Traefik dashboard to be accessed over HTTP
      - "--api.insecure=true"
      - "--providers.docker"
      # Prevents any Docker containers by being exposed by default
      - "--providers.docker.exposedbydefault=false"
      # Use the HTTPS port for secure connections entrypoint
      - "--entryPoints.websecure.address=:443"
      # Add arguments for Traefik to configure a certificate resolver called 'myresolver'
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=ytimen@yuvaltimen.xyz"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
      # Add arguments to forward any requests to default web port 80 to HTTPS port 443
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    ports:
      # HTTP(S) ports
      - "80:80"
      - "443:443"
      # The Web UI (enabled by api.insecure=true)
      - "8080:8080"
    volumes:
      - letsencrypt:/letsencrypt
      # Allows Traefik to listen to Docker events
      - /var/run/docker.sock:/var/run/docker.sock
volumes:
  letsencrypt:
  ...
```



## References
- Dreams of Code's [YouTube video](https://www.youtube.com/watch?v=F-9KWQByeU0&t=376s) on Setting up a production-ready VPS
- Docker's [guide](https://docs.docker.com/engine/install/ubuntu/) on setting up Docker Engine with Ubuntu
