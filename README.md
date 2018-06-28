# btcproof.info

This repository is the public git for the [btcproof.info](http://btcproof.info) web site.

[btcproof.info](http://btcproof.info) is a simple static web app embedding Woleet's widget. This widget allows you to:
- **verify** the **existence** and get the **timestamp** of a **file** anchored in the Bitcoin blockchain using any [Chainpoint](http://www.chainpoint.org/) compatible tool.</li>
- **verify** the **existence**, the **validity** and get the **timestamp** of a **signature** anchored in the Bitcoin blockchain using Woleet's <a href="https://medium.com/@woleet/beyond-data-anchoring-bee867d9be3a">signature anchoring</a> extension to [Chainpoint](http://www.chainpoint.org/#v1x) (the signee identity is also verified if provided)

[btcproof.info](http://btcproof.info) also provides a service to **verify the identity of signees**.
A signee claims his identify **by providing an identity URL**. This URL can be used to verify the control of a given bitcoin address, internet domain and related TLS certificate.
This verification includes:
- the **control of the ownership of the bitcoin address** by the internet domain of the identity URL (by asking the URL to sign some random data using the claimed bitcoin address)
- the **verification of the validity of the TLS certificate** associated to the identity URL
- the **extraction of the TLS certificate information to display the identity** of the owner of the domain, as certified by Certificate Authorities.

[btcproof.info](http://btcproof.info) demonstrates the use of [woleet-weblibs](https://github.com/woleet/woleet-weblibs) 
and [woleet-widget](https://github.com/woleet/woleet-widget) open source tools.

## Prerequesite

Node.js and Docker need to be installed on your system.

## Install the server

Clone the project or download its archive and uncompress it.

## Build the server

```shell
$ cd btcproof.info/
$ ./build.sh
```

## Run the server

```shell
$ cd btcproof.info/
$ ./start.sh
```

## Test the server

http://127.0.0.1
