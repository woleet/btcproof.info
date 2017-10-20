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

function formatCertField(o) {
    return [o.CN, o.O, o.L, o.ST, o.C].join(' ')
}

function checkIdentity() {
    let i = elts.identityURL.value;
    let k = elts.pubKey.value;

    elts.statusZone.style.display = 'none';
    elts.validationZone.style.display = 'none';
    elts.certErrorContainer.style.display = 'none';

    Promise.all([
        woleet.signature.validateIdentity(i, k)
            .catch((e) => {
                return {error: 'failed to verify the ownership of the bitcoin address by the identity URL'};
            }),
        woleet.getJSON('/cert?target=' + i)
            .catch((e) => {
                return {error: 'failed to verify the TLS certificate of the identity URL'};
            })
    ])
        .then((arr) => {
            let vIdentityURL = arr[0];
            let vCertificate = arr[1];

            if (!vCertificate.error && !vIdentityURL.error)
                elts.validationZone.style.display = 'block';
            else
                elts.statusZone.style.display = 'block';

            if (!vIdentityURL.error) {
                if (vIdentityURL) {
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
                elts.idStatus.innerText = 'invalid: ' + vIdentityURL.error;
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