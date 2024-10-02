---
layout: post
title:  "Configuring HTTPS on Linux for Production"
date:   2024-10-1 10:15:01 -0400
---

_This is Part 2 of [Securing a Linux Server for Production]({% link _posts/2024-09-30-securing-ubuntu-server.md %})._

In the last post, we looked at how to secure a Linux server for production by taking some common-sense measures against 
common vulnerabilities. In this post, I'm going to move forward with setting up HTTPS so that the client communication 
with the server is encrypted. Additionally, I'm going to set up a reverse-proxy for my server so that all requests can 
come in through a single entrypoint and get routed to the correct Docker container. As we'll soon see, this actually 
solves the problem with Docker overwriting `ufw`'s iptable routing rules. For both of these things, I'll be using a cool 
tool called Traefik.

<!-- excerpt-start -->
Traefik is a HTTP reverse-proxy and load balancer written in Go. Let's go ahead and use it to configure HTTPS, 
auto-renew SSL Certificates, and proxy incoming requests to our containers, avoiding exporting Docker ports. 
<!-- excerpt-end -->

There's a weird little quirk when it comes to using Docker with `ufw`, and that is that using a Docker `EXPOSE <port>`
directive, or any port mappings in a docker-compose file will actually override the `ufw` firewall rules. There are many 
ways to get around this, but I'll go with configuring Traefik as a reverse proxy. This way I don't actually need to expose 
any Docker ports. This will have the added benefit of helping me down the road with HTTPS Certificate renewals via a 
concept called TLS Termination Proxying - woohoo! 

## Configuring Traefik As A Reverse Proxy
Since exposing Docker ports overrides `ufw`'s configs, we can use Traefik to solve this. The goal would be to have just 
the Traefik service's port exposed on port 80, which would proxy all incoming traffic to the correct services, without 
having those services export ports themselves. Traefik handles this by having dynamic service discover through hooking 
into what it calls "providers", or anything that has service definitions. This could be things like YAML files with 
static service definitions, or dynamic service registries like Docker, Kubernetes, Etcd, or Zookeeper. Traefik has ways 
of hooking into each service definition, which makes its auto discovery feature really powerful. 

In this case, we're using Docker, so we'll be using the `docker` provider. Let's start with a basic `docker-compose.yml` 
file to illustrate everything. Since my super secret FastAPI endpoints are very secret, I'll be using a dummy service 
image to illustrate this. I'll call the image `myservice:latest`, to be generic. Let's look at an example:

```yaml
services:
  example_service:
    image: myservice:latest
    command: ["start", "--port", "8000"]
    env_file:
      .env.sample
```

This will be the base configuration we'll start with. Just a single service called `example_service` running an instance 
of `myservice:latest`, run with the "start" command on port 8000, and injected with environment variables from a file called 
`.env.sample`. Piece of cake. But it's missing port mappings, and this is intentional - we _don't_ want to expose ports, 
since this will expose port 8000 to incoming traffic, but we only want people using our app on port 80. Notice how the 
start command didn't actually expose any ports, but rather just ran the program on the port. Now, let's set up Traefik 
to proxy requests to `myservice`:

```yaml
services:
  example_service:
    image: myservice:latest
    command: ["start", "--port", "8000"]
    env_file:
      .env.sample
    labels:
      - "traefik.enable=true"
      - "traefik.http.services.example_service.loadbalancer.server.port=8000"
      - "traefik.http.routers.example_service.rule=Host(`test.domain.local`)"

  reverse-proxy:
    image: traefik:v3.1
    command:
      - "--api.insecure=true"
      - "--providers.docker"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

Ok, that looks like a good start! Let's break this down:

On the `example_service`, we added a few labels:
- `"traefik.enable=true"` - enables Traefik proxying to this service
- `"traefik.http.services.example_service.loadbalancer.server.port=8000"` - marks this service's port as 8000  
- ```"traefik.http.routers.example_service.rule=Host(`test.domain.localhost`)"``` - sets a rule to redirect requests to the host (in this case, `test.domain.localhost`) to this service

And we added a new service called `reverse-proxy`, with the following commands:
- "--api.insecure=true" - allows access the Web UI 
- "--providers.docker" - this signifies that we're using the Docker provider

Now that we have this config set, let's see that commands are proxied correctly. We'll run `docker compose up` and then 
try to hit our API. Hitting `test.domain.localhost` should show us the response!

One thing to be VERY mindful of is this:
```yaml
...
volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

In order for Traefik to autodiscover Docker services and route requests to them, it needs to hook into the Docker API. 
Traefik requires access to the docker socket to get its dynamic configuration, and we let it do this by mounting the 
Docker socket as a volume into the Traefik container. But this might not be the safest thing to do... in fact, there's a 
ton of articles yelling at their readers to avoid this at all costs, because it can give attackers root access to not 
just the container, but the host machine! That's... bad. Let's fix it.  

