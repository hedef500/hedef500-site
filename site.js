/* Hedef500 sitesi — animasyonlar (dış kütüphane yok).
   - Canlı ürün penceresi: sahneler sırayla oynar (data-adim 0→4), görünmezken / sekme arka plandayken durur.
   - Bir haftanın akışı: kaydırdıkça etkin adım ve sağdaki görüntü değişir.
   - Öğrenci başına tutarlar görününce sayarak gelir; üst çubuk kaydırınca küçülür; listeler sırayla belirir.
   Hareketi azaltmayı seçen ziyaretçiye her şeyin son hâli durağan gösterilir. */
(function () {
  "use strict";
  var az = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kok = document.documentElement;
  kok.classList.add("js");
  if (az) kok.classList.add("az-hareket");

  /* ---- üst çubuk: kaydırınca küçülür ---- */
  var ust = document.querySelector(".ust");
  function ustDurum() { if (ust) ust.classList.toggle("kucuk", window.scrollY > 24); }
  window.addEventListener("scroll", ustDurum, { passive: true });
  ustDurum();

  /* ---- canlı ürün penceresi ---- */
  var canli = document.getElementById("canli");
  if (canli) {
    var sureler = [700, 2900, 3300, 3500, 2900];        // 0: hazırlık, 1: PDF, 2: netler, 3: program, 4: bildirim
    var adim = 0, zaman = null, gorunur = true;
    function oyna() {
      clearTimeout(zaman);
      if (!gorunur || document.hidden) return;
      canli.setAttribute("data-adim", String(adim));
      zaman = setTimeout(function () { adim = (adim + 1) % 5; oyna(); }, sureler[adim]);
    }
    if (az) {
      canli.setAttribute("data-adim", "4");           // son hâl: liste, program ve bildirim görünür
    } else {
      adim = 0; canli.setAttribute("data-adim", "0");
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (g) {
          gorunur = g[0].isIntersecting;
          if (gorunur) oyna(); else clearTimeout(zaman);
        }, { threshold: 0.25 }).observe(canli);
      } else { oyna(); }
      document.addEventListener("visibilitychange", function () { if (!document.hidden) oyna(); else clearTimeout(zaman); });
    }
  }

  /* ---- bir haftanın akışı: kaydırınca etkin adım ---- */
  var akis = document.querySelector(".akis");
  if (akis && "IntersectionObserver" in window) {
    var adimlar = akis.querySelectorAll(".adim");
    var kareler = akis.querySelectorAll(".sahne-kare");
    var cubuk = akis.querySelector(".akis-ilerleme i");
    function etkin(n) {
      adimlar.forEach(function (a) { a.classList.toggle("etkin", a.getAttribute("data-adim") === n); });
      kareler.forEach(function (k) { k.classList.toggle("etkin", k.getAttribute("data-adim") === n); });
      if (cubuk) cubuk.style.transform = "scaleX(" + (Number(n) / adimlar.length) + ")";
    }
    etkin("1");
    var gozcu = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) { if (g.isIntersecting) etkin(g.target.getAttribute("data-adim")); });
    }, { rootMargin: "-45% 0px -45% 0px" });                // ekranın ortasındaki adım etkin olur
    adimlar.forEach(function (a) { gozcu.observe(a); });
  }

  /* ---- sırayla belirme ve sayaçlar ---- */
  function gorununce(secici, isle, esik) {
    var ogeler = document.querySelectorAll(secici);
    if (!ogeler.length) return;
    if (az || !("IntersectionObserver" in window)) { ogeler.forEach(function (o) { isle(o, true); }); return; }
    var g = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (x) { if (x.isIntersecting) { isle(x.target, false); g.unobserve(x.target); } });
    }, { threshold: esik || 0.2 });
    ogeler.forEach(function (o) { g.observe(o); });
  }
  document.querySelectorAll(".ozellikler > div, .gizlilik-liste li, .dosyalar li").forEach(function (o, i) {
    o.classList.add("belir"); o.style.setProperty("--sira", String(i % 6));
  });
  gorununce(".belir", function (o) { o.classList.add("gorundu"); }, 0.15);

  gorununce(".ogrenci-basi b", function (o, hemen) {
    var hedef = parseInt(o.textContent, 10);
    if (!hedef || hemen) return;
    var bas = null, sure = 1100;
    function kare(t) {
      if (bas === null) bas = t;
      var p = Math.min(1, (t - bas) / sure), e = 1 - Math.pow(1 - p, 3);
      o.textContent = Math.round(hedef * e) + " TL";
      if (p < 1) requestAnimationFrame(kare);
    }
    o.textContent = "0 TL";
    requestAnimationFrame(kare);
  }, 0.6);

  /* ---- puan cetveli: göründüğünde kayar ---- */
  gorununce(".cetvel", function (o) { o.classList.add("oyna"); }, 0.4);
})();
