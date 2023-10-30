/*
Add here your JavaScript Code.
Note. the code entered here will be added in <head> tag


	Example:

	var x, y, z;
	x = 5;
	y = 6;
	z = x + y;

*/
/* Google analitics */
const script = document.createElement('script');
script.async = true;
script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9WMHZXCFMM';

document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag() {
  // eslint-disable-next-line no-undef
  dataLayer.push(arguments);
}
gtag('js', new Date());

gtag('config', 'G-9WMHZXCFMM');
/* Many Chat */
const manychatScript1 = document.createElement('script');
manychatScript1.src = '//widget.manychat.com/645524_ee909.js';
manychatScript1.defer = true;
document.head.appendChild(manychatScript1);

const manychatScript2 = document.createElement('script');
manychatScript2.src = 'https://mccdn.me/assets/js/widget.js';
manychatScript2.defer = true;
document.head.appendChild(manychatScript2);
/* referralhero */
!(function (m, a, i, t, r, e) {
  if (m.RH) return;
  (r = m.RH = {}),
    (r.uuid = t),
    (r.loaded = 0),
    (r.base_url = i),
    (r.queue = []);
  m.rht = function () {
    r.queue.push(arguments);
  };
  (e = a.getElementsByTagName('script')[0]), (c = a.createElement('script'));
  (c.async = !0),
    (c.src = i + '/widget/' + t + '.js'),
    e.parentNode.insertBefore(c, e);
})(window, document, 'https://app.referralhero.com', 'MF01e27fe65a');
