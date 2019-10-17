function getParameterByName(name) {
  var match = new RegExp('[?&]' + name + '=([^&]*)', 'i').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getElt(id) {
  return document.getElementById(id);
}

function getElts(list) {
  return list.reduce((acc, key) => (acc[key] = getElt(key), acc), {});
}

let elts = getElts(["identityURL", "pubKey", "idStatus", "certStatus",
  "validationZone", "statusZone", "btnSub", "certDetailSubject", "certDetailIssuer",
  "address", "url", "certErrorContainer", "certError"]);

elts.identityURL.value = getParameterByName("identityURL");
elts.pubKey.value = getParameterByName("pubKey");
updateBtnSub();

function formatCertField(o) {
  return [o.CN, o.O, o.L, o.ST, o.C].join(' ')
}

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return !!pattern.test(str);
}

function validBitcoinAddress(str) {
  var pattern = new RegExp('^[a-zA-Z0-9]{34}$'); // fragment locator
  return !!pattern.test(str);
}

function updateBtnSub() {
  elts.btnSub.disabled = !canCheckIdentity();
}

function canCheckIdentity() {
  return validURL(elts.identityURL.value) && validBitcoinAddress(elts.pubKey.value);
}

function checkIdentity() {

  if (!canCheckIdentity())
    return;

  let i = elts.identityURL.value;
  let k = elts.pubKey.value;

  elts.statusZone.style.display = 'none';
  elts.validationZone.style.display = 'none';
  elts.certErrorContainer.style.display = 'none';

  Promise.all([
    woleet.signature.validateIdentity(i, k)
      .catch((e) => ({
        valid: false,
        reason: 'failed to verify the ownership of the bitcoin address by the identity URL'
      })),
    woleet.getJSON('/cert?target=' + i)
      .catch((e) => ({ error: 'failed to get the TLS certificate of the identity URL' }))
  ])
    .then((arr) => {
      let vIdentity = arr[0];
      let vCertificate = arr[1];

      if (!vCertificate.error && vIdentity.valid)
        elts.validationZone.style.display = 'block';
      else
        elts.statusZone.style.display = 'block';

      if (vIdentity.valid) {
        if (vIdentity) {
          elts.idStatus.innerText = 'valid';
          elts.idStatus.style = 'color: green';
        } else {
          elts.idStatus.innerText = 'invalid';
          elts.idStatus.style = 'color: red';
        }
        elts.address.innerText = k;
        elts.url.innerText = i;
        elts.url.setAttribute('href', i);
      } else {
        elts.idStatus.innerText = 'invalid: ' + vIdentity.reason;
        elts.idStatus.style = 'color: red';
      }

      if (!vCertificate.error) {
        if (vCertificate.authorized) {
          elts.certStatus.innerText = 'valid';
          elts.certStatus.style = 'color: green';
        } else {
          elts.certStatus.innerText = 'invalid';
          elts.certStatus.style = 'color: red';
        }

        if (!vCertificate.certificates.length) return;

        let cert = vCertificate.certificates[0];
        elts.certDetailIssuer.innerText = formatCertField(cert.issuer);
        elts.certDetailSubject.innerText = formatCertField(cert.subject);
      } else {
        elts.certStatus.innerText = 'invalid: ' + vCertificate.error;
        elts.certStatus.style = 'color: red';
      }
    })
    .catch((e) => {
      elts.certErrorContainer.style.display = 'block';
      elts.certError.innerText = e;
    })
}
