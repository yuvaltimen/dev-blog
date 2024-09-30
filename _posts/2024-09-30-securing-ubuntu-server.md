---
layout: post
title:  "Securing a Linux Server for Production"
date:   2024-09-30 13:34:01 -0400
---

Let's be honest. Platform as a Service (PaaS) providers overcharge for a lot of their services. 
It makes sense - they need to make money _somehow_. But not on my dime! I'm going to set up my own
Virtual Private Server (VPS) for self-hosting, and I'm gonna do it on the cheap. 

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
Passwords are less secure than SSH-Keys, because they can be brute-forced. Or worse, you might be one of thsoe 
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

Now that I've added my public key, let's go ahead and disable password-based auth. I'll open up my sshd_config file:

```bash 
>> sudo vim /etc/ssh/sshd_config
```

and set the following options, making sure to save the file after editing:

- `PasswordAuthentication no`
- `PermitRootLogin no`
- `UsePAM no`