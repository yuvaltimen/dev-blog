---
layout: post
title: Intro to APIs 
tags: tech
date: 2026-01-18 19:00:00
---

<img src="{{ site.baseurl }}/assets/images/urls.png" />

An API is a mechanism for accessing information. Consider a two party system: a Client requests data from a Server,
which responds to the client with the requested data. An API is the tool that the Server provides to the Client in 
order to best request data from the Server. 


```
Request:
Client |-------> Server

.
. (2sec.)
.

Response
Server |-------> Client

```

Accessing an API is based on URLs: each URL can model the data, because URLs can encode information.

ULSs can be very long and contain many nested sequences, so let's start with how they work. 

### A Closer Look At URLs

First let's look at how URLs are parsed. Here's what the Server sees when they look at a URL:

```
what-is-an-api.com/base/path/to/resource
```

- `what-is-an-api.com` - This the domain, which typically represents the Server's identity. Like how `facebook.com` belongs to Facebook.
- `/base/path/to/` - An arbitrary folder path encodes the context of the resource. For some forum website page it could be something like `forums_r_us.com/pages/community/areas/129839/`.  
- `resource` - The data "resource" you are accessing.


### Components
