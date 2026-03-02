/* ============================================
   Data Template Formatters
   ============================================ */

const Templates = {
  getText() {
    return document.getElementById('dataInput').value || '';
  },

  getWiFi() {
    const ssid = document.getElementById('wifiSSID').value;
    const security = document.getElementById('wifiSecurity').value;
    const password = document.getElementById('wifiPassword').value;
    const hidden = document.getElementById('wifiHidden').checked;
    if (!ssid) return '';
    let str = `WIFI:S:${ssid};T:${security};`;
    if (security !== 'nopass') str += `P:${password};`;
    if (hidden) str += 'H:true;';
    str += ';';
    return str;
  },

  getVCard() {
    const fn = document.getElementById('vcardFirstName').value;
    const ln = document.getElementById('vcardLastName').value;
    const org = document.getElementById('vcardOrg').value;
    const title = document.getElementById('vcardTitle').value;
    const phone = document.getElementById('vcardPhone').value;
    const email = document.getElementById('vcardEmail').value;
    const url = document.getElementById('vcardURL').value;
    const addr = document.getElementById('vcardAddress').value;

    if (!fn && !ln) return '';

    let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
    vcard += `N:${ln};${fn};;;\n`;
    vcard += `FN:${fn} ${ln}\n`;
    if (org) vcard += `ORG:${org}\n`;
    if (title) vcard += `TITLE:${title}\n`;
    if (phone) vcard += `TEL:${phone}\n`;
    if (email) vcard += `EMAIL:${email}\n`;
    if (url) vcard += `URL:${url}\n`;
    if (addr) vcard += `ADR:;;${addr};;;;\n`;
    vcard += 'END:VCARD';
    return vcard;
  },

  getEvent() {
    const title = document.getElementById('eventTitle').value;
    const location = document.getElementById('eventLocation').value;
    const start = document.getElementById('eventStart').value;
    const end = document.getElementById('eventEnd').value;
    const desc = document.getElementById('eventDescription').value;

    if (!title) return '';

    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n';
    ics += `SUMMARY:${title}\n`;
    if (location) ics += `LOCATION:${location}\n`;
    if (start) ics += `DTSTART:${Utils.formatICalDate(start)}\n`;
    if (end) ics += `DTEND:${Utils.formatICalDate(end)}\n`;
    if (desc) ics += `DESCRIPTION:${desc}\n`;
    ics += 'END:VEVENT\nEND:VCALENDAR';
    return ics;
  },

  getEmail() {
    const to = document.getElementById('emailTo').value;
    const subject = document.getElementById('emailSubject').value;
    const body = document.getElementById('emailBody').value;
    if (!to) return '';
    let mailto = `mailto:${to}`;
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    if (params.length) mailto += '?' + params.join('&');
    return mailto;
  },

  getSMS() {
    const phone = document.getElementById('smsPhone').value;
    const body = document.getElementById('smsBody').value;
    if (!phone) return '';
    let sms = `sms:${phone}`;
    if (body) sms += `?body=${encodeURIComponent(body)}`;
    return sms;
  },

  getPhone() {
    const phone = document.getElementById('phoneNumber').value;
    return phone ? `tel:${phone}` : '';
  },

  getCrypto() {
    const type = document.getElementById('cryptoType').value;
    const addr = document.getElementById('cryptoAddress').value;
    const amount = document.getElementById('cryptoAmount').value;
    const msg = document.getElementById('cryptoMessage').value;
    if (!addr) return '';
    let uri = `${type}:${addr}`;
    const params = [];
    if (amount) params.push(`amount=${amount}`);
    if (msg) params.push(`message=${encodeURIComponent(msg)}`);
    if (params.length) uri += '?' + params.join('&');
    return uri;
  },

  getGeo() {
    const lat = document.getElementById('geoLat').value;
    const lon = document.getElementById('geoLon').value;
    if (!lat || !lon) return '';
    return `geo:${lat},${lon}`;
  },

  // EPC QR (SEPA European payments)
  getEPCQR() {
    const name = document.getElementById('epcName').value;
    const iban = document.getElementById('epcIBAN').value;
    const bic = document.getElementById('epcBIC').value;
    const amount = document.getElementById('epcAmount').value;
    const ref = document.getElementById('epcReference').value;
    const text = document.getElementById('epcText').value;
    if (!name || !iban) return '';

    let epc = 'BCD\n002\n1\nSCT\n';
    epc += `${bic}\n`;
    epc += `${name}\n`;
    epc += `${iban.replace(/\s/g, '')}\n`;
    epc += amount ? `EUR${parseFloat(amount).toFixed(2)}\n` : '\n';
    epc += '\n'; // purpose
    epc += ref ? `${ref}\n` : '\n';
    epc += text ? `${text}\n` : '\n';
    return epc.trim();
  },

  // Swiss QR-Bill
  getSwissQR() {
    const name = document.getElementById('swissName').value;
    const iban = document.getElementById('swissIBAN').value;
    const amount = document.getElementById('swissAmount').value;
    const street = document.getElementById('swissStreet').value;
    const city = document.getElementById('swissCity').value;
    const country = document.getElementById('swissCountry').value || 'CH';
    const ref = document.getElementById('swissRef').value;
    const additional = document.getElementById('swissAdditional').value;
    if (!name || !iban) return '';

    let qr = 'SPC\n0200\n1\n';
    qr += `${iban.replace(/\s/g, '')}\n`;
    qr += `S\n${name}\n`;
    qr += `${street}\n`;
    qr += '\n'; // building number (combined)
    qr += `${city.split(' ')[0] || ''}\n`; // postal code
    qr += `${city.split(' ').slice(1).join(' ') || city}\n`; // city
    qr += `${country}\n`;
    // Ultimate debtor (empty)
    qr += '\n\n\n\n\n\n\n';
    qr += amount ? `${parseFloat(amount).toFixed(2)}\nCHF\n` : '\n\nCHF\n';
    // Payment reference
    if (ref) {
      qr += ref.length > 20 ? 'QRR\n' : 'SCOR\n';
      qr += `${ref}\n`;
    } else {
      qr += 'NON\n\n';
    }
    qr += additional ? `${additional}\n` : '\n';
    qr += 'EPD';
    return qr;
  },

  // UPI QR (India)
  getUPIQR() {
    const id = document.getElementById('upiID').value;
    const name = document.getElementById('upiName').value;
    const amount = document.getElementById('upiAmount').value;
    const note = document.getElementById('upiNote').value;
    if (!id) return '';

    let upi = `upi://pay?pa=${encodeURIComponent(id)}`;
    if (name) upi += `&pn=${encodeURIComponent(name)}`;
    if (amount) upi += `&am=${amount}`;
    if (note) upi += `&tn=${encodeURIComponent(note)}`;
    upi += '&cu=INR';
    return upi;
  },

  // PIX QR (Brazil)
  getPIXQR() {
    const key = document.getElementById('pixKey').value;
    const name = document.getElementById('pixName').value;
    const city = document.getElementById('pixCity').value;
    const amount = document.getElementById('pixAmount').value;
    const desc = document.getElementById('pixDescription').value;
    if (!key) return '';

    // Simplified EMV-based PIX payload
    const pad = (id, val) => {
      const v = String(val);
      return id + String(v.length).padStart(2, '0') + v;
    };

    let merchant = pad('00', 'br.gov.bcb.pix') + pad('01', key);
    if (desc) merchant += pad('02', desc);

    let payload = '';
    payload += pad('00', '01'); // Format Indicator
    payload += pad('01', '12'); // Static QR
    payload += pad('26', merchant); // Merchant Account
    payload += pad('52', '0000'); // MCC
    payload += pad('53', '986'); // Currency BRL
    if (amount) payload += pad('54', parseFloat(amount).toFixed(2));
    payload += pad('58', 'BR'); // Country
    payload += pad('59', (name || 'PIX').substring(0, 25));
    payload += pad('60', (city || 'BRASILIA').substring(0, 15));
    payload += pad('62', pad('05', '***')); // Additional data

    // CRC placeholder (field 63, 4 hex chars)
    payload += '6304';
    // Compute CRC-16 CCITT
    const crc = this._crc16(payload);
    payload = payload.slice(0, -4) + '63' + '04' + crc;

    return payload;
  },

  _crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
        else crc <<= 1;
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  },

  // Boarding Pass (BCBP — simplified)
  getBoardingPass() {
    const name = (document.getElementById('bpName').value || '').toUpperCase().padEnd(20, ' ');
    const pnr = (document.getElementById('bpPNR').value || '').toUpperCase().padEnd(7, ' ');
    const from = (document.getElementById('bpFrom').value || '').toUpperCase().padEnd(3, ' ');
    const to = (document.getElementById('bpTo').value || '').toUpperCase().padEnd(3, ' ');
    const airline = (document.getElementById('bpAirline').value || '').toUpperCase().padEnd(3, ' ');
    const flight = (document.getElementById('bpFlight').value || '').padStart(5, '0');
    const date = (document.getElementById('bpDate').value || '').padStart(3, '0');
    const cls = document.getElementById('bpClass').value || 'Y';
    const seat = (document.getElementById('bpSeat').value || '').toUpperCase().padEnd(4, ' ');

    if (!document.getElementById('bpName').value) return '';

    // IATA BCBP Type M format (simplified single leg)
    let bcbp = 'M';  // Format code
    bcbp += '1';     // Number of legs
    bcbp += name.substring(0, 20);
    bcbp += ' '; // Electronic ticket indicator
    bcbp += pnr.substring(0, 7);
    bcbp += from.substring(0, 3);
    bcbp += to.substring(0, 3);
    bcbp += airline.substring(0, 3);
    bcbp += flight.substring(0, 5);
    bcbp += date.substring(0, 3);
    bcbp += cls;
    bcbp += seat.substring(0, 4);
    bcbp += '0'; // Check-in sequence
    bcbp += '00'; // Passenger status

    return bcbp;
  },

  // GS1 Digital Link URL
  getGS1Digital() {
    const domain = document.getElementById('gs1Domain').value || 'id.gs1.org';
    const gtin = document.getElementById('gs1GTIN').value;
    const lot = document.getElementById('gs1Lot').value;
    const serial = document.getElementById('gs1Serial').value;
    const expiry = document.getElementById('gs1Expiry').value;
    if (!gtin) return '';

    let url = `https://${domain}/01/${gtin}`;
    const params = [];
    if (lot) params.push(`10/${lot}`);
    if (serial) params.push(`21/${serial}`);
    if (expiry) params.push(`17/${expiry}`);
    if (params.length) url += '/' + params.join('/');

    return url;
  },

  // Get data from current template
  getData() {
    const template = document.getElementById('dataTemplate').value;
    switch (template) {
      case 'text': return this.getText();
      case 'wifi': return this.getWiFi();
      case 'vcard': return this.getVCard();
      case 'event': return this.getEvent();
      case 'email': return this.getEmail();
      case 'sms': return this.getSMS();
      case 'phone': return this.getPhone();
      case 'crypto': return this.getCrypto();
      case 'geo': return this.getGeo();
      case 'epcqr': return this.getEPCQR();
      case 'swissqr': return this.getSwissQR();
      case 'upiqr': return this.getUPIQR();
      case 'pixqr': return this.getPIXQR();
      case 'boardingpass': return this.getBoardingPass();
      case 'gs1digital': return this.getGS1Digital();
      default: return this.getText();
    }
  }
};
