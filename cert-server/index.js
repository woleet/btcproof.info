const http = require('http');
const tls = require('tls');
const url = require('url');

/**
 *  @typedef {{
 *    subject: Certificate,
 *    issuer: Certificate,
 *    subjectaltname: string,
 *    infoAccess: DetailedPeerCertificate.infoAccess,
 *    modulus: string,
 *    exponent: string,
 *    valid_from: string,
 *    valid_to: string,
 *    fingerprint: string,
 *    ext_key_usage: DetailedPeerCertificate.ext_key_usage,
 *    serialNumber: string
 *  }} PrunedCertificate
 */

/**
 * @param cert
 * @param prev
 * @returns {Array.<PrunedCertificate>}
 */
function formatCerts(cert, prev) {
  if ((!cert) || (prev === cert)) return [];
  delete cert.raw;
  const sub = cert.issuerCertificate;
  delete cert.issuerCertificate;
  return [].concat(cert, formatCerts(sub, cert));
}

const getSslDetails = (host, port) => new Promise((resolve, reject) => {

  const sock = tls.connect({ rejectUnauthorized: false, servername: host, port, host }, () => {
    const certs = sock.getPeerCertificate(true);

    resolve({
      authorized: sock.authorized,
      error: sock.authorized ? undefined : sock.authorizationError,
      certificates: formatCerts(certs, null)
    });
  });

  sock.on('error', reject);
});

function send(res, status, content) {
  if (content) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(content));
  }
  else {
    res.writeHead(status);
    res.end();
  }
}

http.createServer((req, res) => {
  const _url = url.parse(req.url, true);

  if (req.method !== 'GET' || !_url.query.target)
    return send(res, 400);

  const target = url.parse(_url.query.target, true);

  getSslDetails(target.hostname, target.port || 443)
    .then((certs) => send(res, 200, Object.assign(certs, { target })))
    .catch((error) => {
      switch (error.code) {
        case 'ENOTFOUND':
          return send(res, 404, { error });
        default:
          console.error(error);
          return send(res, 500, { error });
      }
    })

}).listen(3000);
