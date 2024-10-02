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

  traefik:
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

And we added a new service called `traefik`, with the following commands:
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
Traefik requires access to the Docker socket to get its dynamic configuration, and we've enabled this by mounting the 
Docker socket as a volume into the Traefik container. But this is in fact a security risk. There's a ton of articles 
yelling at their readers to avoid this at all costs, because it can give attackers root access to not just the 
container, but the host machine! That's... bad. Let's fix it.  

We'll go ahead and add a new service, called `docker-proxy`. Any Traefik requests to the Docker socket will be proxied 
through this service, which can filter out POST or other dangerous requests, and just limit it to GET-style requests.

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
    networks:
      - traefik-servicenet

  docker-proxy:
    image: tecnativa/docker-socket-proxy:edge
    networks:
      - docker-proxynet
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      LOG_LEVEL: DEBUG
      CONTAINERS: 1
      SERVICES: 1
      NODES: 1
      NETWORKS: 1
      TASKS: 1
      VERSION: 1

  traefik:
    image: traefik:v3.1
    command:
      - "--api.insecure=true"
      - "--providers.docker"
      - "--providers.docker.exposedByDefault=false"
      - "--providers.docker.endpoint=tcp://docker-proxy:2375"
      - "--providers.docker.network=docker-proxynet"
    depends_on:
      - docker-proxy
    read_only: true
    ports:
      - "80:80"
      - "8080:8080"
    networks:
      - traefik-servicenet
      - docker-proxynet

networks:
  traefik-servicenet:
    name: traefik-servicenet
  docker-proxynet:
    internal: true
    name: docker-proxynet
```

The image `tecnativa/docker-socket-proxy:edge` is built on top of HAProxy, which is proxying requests to the socket over 
tcp. We're still mounting the `/var/run/docker.sock`, but in this case, it's safer because the `docker-proxynet` network 
is internal, meaning the `docker-proxy` container won't be exposed to the public internet, whereas the `traefik` 
container will be. Great! No more mounting sockets to public containers. 

## Configuring Traefik For HTTPS
Now that we have Traefik set up as a reverse-proxy, and we also set up a docker-proxy to safeguard the Docker socket, 
it's time to talk about HTTPS. HTTPS is a protocol built on top of TCP. It works by encrypting the data of the 
connection over TCP, allowing only the client to decrypt this data, and this is achieved through certificates. 
Certificates are granted through a Certificate Authority (CA) which assert the authority of the certificate holder. 
There is a chain-of-trust, such that when the client receives the certificate from the HTTPS server, it will validate 
the certificate by following its issuers' certificates up the chain until the last link. If that link is valid, the 
whole chain is trustworthy, and the connection is good to proceed!

Traefik is nice, because it actually automatically renews its own certificates from Let's Encrypt, saving us, the users, 
time from doing this all manually. It's as simpe as adding a few extra configs to Traefik and our service:

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
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=myresolver"
      - "traefik.enable=true"
    networks:
      - traefik-servicenet
        
  docker-proxy:
    image: tecnativa/docker-socket-proxy:edge
    networks:
      - docker-proxynet
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      LOG_LEVEL: DEBUG
      CONTAINERS: 1
      SERVICES: 1
      NODES: 1
      NETWORKS: 1
      TASKS: 1
      VERSION: 1

  traefik:
    image: traefik:v3.1
    command:
      - "--api.insecure=true"
      - "--providers.docker"
      - "--providers.docker.exposedByDefault=false"
      - "--providers.docker.endpoint=tcp://docker-proxy:2375"
      - "--providers.docker.network=docker-proxynet"
      - "--entryPoints.web.address=:80"
      - "--entryPoints.websecure.address=:443"
      - "--entryPoints.web.http.redirections.entrypoint.to=websecure"
      - "--entryPoints.web.http.redirections.entrypoint.scheme=https"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=ytimen@yuvaltimen.xyz"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    depends_on:
      - docker-proxy
    read_only: true
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - letsencrypt:/letsencrypt
    networks:
      - traefik-servicenet
      - docker-proxynet

volumes:
  letsencrypt:

networks:
  traefik-servicenet:
    name: traefik-servicenet
  docker-proxynet:
    name: docker-proxynet
    internal: true
```

With that, our configs should be done! We want to just verify that everything works by checking the following few items: 
- Requests to https://test.domain.local work
- Requests to test.domain.local (without specifying protocol, will default to http) redirect to https
- The dashboard is still active at test.domain.local:8080

And there we have it! A fully functioning HTTPS service, behind a reverse-proxy, accessing the Docker API securely, on 
a remote host. I think we've earned a large piece of tiramisu, don't you think?

## References
- Traefik's [documentation](https://doc.traefik.io/traefik/) 
- Dreams of Code's [YouTube video](https://www.youtube.com/watch?v=F-9KWQByeU0&t=376s) on setting up a production-ready VPS
- Wollomatic's [repo](https://github.com/wollomatic/traefik-hardened/tree/master) describing securely accessing Docker sockets
- Chris Wiegman's [blog post](https://chriswiegman.com/2019/10/serving-your-docker-apps-with-https-and-traefik-2/) describing setting up Traefik and Docker with HTTPS