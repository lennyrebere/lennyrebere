// ════════════════════════════════════════════════════════════════════
// STATISTIQUES (GoatCounter) : sans cookies, sans identifiant, donc sans bannière de consentement.
// Désactivées dans l'éditeur (iframe) et en local (localhost) pour ne pas fausser les chiffres.
// Pour couper : mettre GOATCOUNTER_URL = ''
// ════════════════════════════════════════════════════════════════════
var GOATCOUNTER_URL = 'https://lennyrebere.goatcounter.com/count';

(function () {
  if (!GOATCOUNTER_URL || window.self !== window.top) return;
  var h = location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '' || /\.local$/.test(h)) return;
  var s = document.createElement('script');
  s.async = true;
  s.setAttribute('data-goatcounter', GOATCOUNTER_URL);
  s.src = 'https://gc.zgo.at/count.js';
  document.head.appendChild(s);
})();

// ════════════════════════════════════════════════════════════════════
// FOND VIDÉO SUR TOUT LE SITE (essai) — interrupteur :
//   FOND_VIDEO = ['teaser-1.mp4', 'teaser-2.mp4']  → une vidéo tirée au hasard en arrière-plan
//   FOND_VIDEO = []                                → désactivé, le site redevient comme avant
// Pas de fond vidéo sur la grille Travaux ni sur la page de défilement (fond blanc).
// (la vidéo vient de assets/videos/ ; réglages visuels : variables --fond-video-* dans style.css)
// ════════════════════════════════════════════════════════════════════
var FOND_VIDEO = ['teaser-1.mp4', 'teaser-2.mp4'];

(function () {
  if (!FOND_VIDEO || !FOND_VIDEO.length || window.self !== window.top) return;   // pas dans l'éditeur (iframe)
  if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) return;   // pas de fond vidéo sur mobile
  document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('.page-porte')) return;    // la page d'entrée a déjà sa vidéo
    if (document.querySelector('.zone-bicolonne, .grille-travaux')) return;   // Travaux + défilement : fond blanc
    var scripts = document.querySelectorAll('script[src*="main.js"]');
    var src = scripts.length ? scripts[0].getAttribute('src') : 'assets/js/main.js';
    var base = src.replace(/js\/main\.js.*$/, '');
    var v = document.createElement('video');
    v.className = 'fond-video-site';
    v.src = base + 'videos/' + FOND_VIDEO[Math.floor(Math.random() * FOND_VIDEO.length)];
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    var panneau = document.createElement('div');
    panneau.className = 'fond-panneau-blanc';
    panneau.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(panneau, document.body.firstChild);
    document.body.insertBefore(v, document.body.firstChild);
    document.body.classList.add('fond-video');
    // Panneau blanc : du bord gauche jusqu'aux colonnes d'images (pages de défilement),
    // ou jusqu'au bord droit de la zone de contenu (autres pages)
    function ajusterPanneau() {
      var colD = document.querySelector('.zone-col-droite');
      var page = document.querySelector('.page-accueil');
      var droite = colD ? colD.getBoundingClientRect().left - 10
                        : (page ? page.getBoundingClientRect().right : window.innerWidth);
      panneau.style.width = Math.max(0, Math.min(window.innerWidth, droite)) + 'px';
    }
    ajusterPanneau();
    window.addEventListener('resize', ajusterPanneau);
    window.addEventListener('load', ajusterPanneau);
    v.play().catch(function () {});
  });
})();

document.addEventListener('DOMContentLoaded', function () {
  // ── Vidéo de la page d'entrée : boucle sur un extrait (data-debut / data-fin, en secondes) ──
  var vPorte = document.querySelector('video.video-porte');
  if (vPorte) {
    // Tirage au hasard parmi data-videos (séparées par |)
    var liste = (vPorte.getAttribute('data-videos') || '').split('|').filter(Boolean);
    if (liste.length > 1) {
      var choixV = liste[Math.floor(Math.random() * liste.length)];
      if (vPorte.getAttribute('src') !== choixV) {
        vPorte.setAttribute('src', choixV);
        vPorte.load();
        vPorte.play().catch(function () {});
      }
    }
    var debut = parseFloat(vPorte.getAttribute('data-debut'));
    var fin = parseFloat(vPorte.getAttribute('data-fin'));
    if (!isNaN(debut) && !isNaN(fin) && fin > debut) {
      vPorte.removeAttribute('loop');
      var aller = function () { try { vPorte.currentTime = debut; } catch (e) {} };
      if (vPorte.readyState >= 1) aller(); else vPorte.addEventListener('loadedmetadata', aller);
      var surveiller = function () {
        if (vPorte.currentTime >= fin || vPorte.ended) { vPorte.currentTime = debut; if (vPorte.paused) vPorte.play().catch(function () {}); }
        requestAnimationFrame(surveiller);
      };
      requestAnimationFrame(surveiller);
    }
  }

  // ── Adresse e-mail protégée : assemblée ici, jamais écrite en clair dans la page (anti-robots).
  //    Pas dans l'éditeur (iframe), pour ne pas enregistrer l'adresse dans le fichier. ──
  if (window.self === window.top) {
    document.querySelectorAll('a.mail-protege').forEach(function (a) {
      a.href = 'mailto:' + a.getAttribute('data-u') + '@' + a.getAttribute('data-d');
    });
  }

  // ── Image aléatoire (page d'accueil) : change de visuel à chaque chargement ──
  var imgAleatoire = document.querySelector('img[data-image-aleatoire]');
  var modeVideo = imgAleatoire && imgAleatoire.closest('figure[data-mode="video"]');
  if (imgAleatoire && !modeVideo && window.self === window.top) {
    var srcActuel = imgAleatoire.getAttribute('src') || '';
    var m = srcActuel.match(/^(.*assets\/)/);
    var base = m ? m[1] : 'assets/';
    fetch(base + 'images-liste.json')
      .then(function (r) { return r.json(); })
      .then(function (images) {
        if (images && images.length) {
          var choix = images[Math.floor(Math.random() * images.length)];
          imgAleatoire.src = base + 'images-aleatoires/' + choix;
        }
      })
      .catch(function () {});
  }

  document.querySelectorAll('.zone-bicolonne').forEach(function (zone) {
    var colG = zone.querySelector('.zone-col-gauche');
    var colD = zone.querySelector('.zone-col-droite');
    if (!colG || !colD) return;

    var textes = colG.querySelectorAll('.zone-texte-item[data-id]');
    var rows = colD.querySelectorAll('.zone-row[data-lien]');
    if (!textes.length || !rows.length) return;

    function activer(id) {
      textes.forEach(function (t) {
        t.classList.toggle('actif', t.dataset.id === id);
      });
    }

    // Espace en fin de colonne : permet à la dernière image de remonter à hauteur du texte
    // (rien d'autre ne dépasse en dessous). Créé à l'exécution, jamais dans l'éditeur (iframe).
    if (window.self === window.top && colD.querySelector('.zone-row')) {
      var espaceFin = document.createElement('div');
      espaceFin.className = 'zone-espace-fin';
      espaceFin.setAttribute('aria-hidden', 'true');
      colD.appendChild(espaceFin);
      var ajusterEspaceFin = function () {
        var dernieres = colD.querySelectorAll('.zone-row');
        var derniere = dernieres[dernieres.length - 1];
        var h = Math.max(0, colD.clientHeight - derniere.offsetHeight);
        espaceFin.style.height = h + 'px';
      };
      ajusterEspaceFin();
      window.addEventListener('load', ajusterEspaceFin);
      window.addEventListener('resize', ajusterEspaceFin);
      var lignesFin = colD.querySelectorAll('.zone-row');
      lignesFin[lignesFin.length - 1].querySelectorAll('img').forEach(function (im) { im.addEventListener('load', ajusterEspaceFin); });
    }

    // Mobile : chaque texte est placé juste avant la première image de son projet
    // (le mécanisme texte « actif » à côté des images n'existe pas en colonne unique)
    if (window.self === window.top && window.matchMedia && window.matchMedia('(max-width: 900px)').matches) {
      textes.forEach(function (t) {
        var premiere = colD.querySelector('.zone-row[data-lien="' + t.dataset.id + '"]');
        if (premiere) colD.insertBefore(t, premiere);
        else t.style.display = 'none';
      });
      return;
    }

    colG.classList.add('js-lien');
    activer(textes[0].dataset.id);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          activer(entry.target.dataset.lien);
        }
      });
    }, { root: colD, threshold: [0.5] });

    rows.forEach(function (row) { observer.observe(row); });
  });

  // ── Liste des projets sous le menu : ordre = ordre de défilement réel
  //    (celui des images dans la colonne droite), pas l'ordre des textes ──
  var idsOrdreDefilement = [];
  document.querySelectorAll('.zone-bicolonne').forEach(function (zone) {
    var colD = zone.querySelector('.zone-col-droite');
    if (!colD) return;
    colD.querySelectorAll('.zone-row[data-lien]').forEach(function (row) {
      var id = row.dataset.lien;
      if (id && idsOrdreDefilement.indexOf(id) === -1) idsOrdreDefilement.push(id);
    });
  });
  var zoneTextes = document.querySelectorAll('.zone-bicolonne .zone-texte-item[data-id]');
  var menu = document.getElementById('menu');
  if (idsOrdreDefilement.length && zoneTextes.length && menu) {
    var listeProjets = document.createElement('div');
    listeProjets.className = 'liste-projets-menu';
    idsOrdreDefilement.forEach(function (id) {
      var item = null;
      for (var k = 0; k < zoneTextes.length; k++) {
        if (zoneTextes[k].dataset.id === id) { item = zoneTextes[k]; break; }
      }
      if (!item) return;
      var lignes = item.querySelectorAll('.ligne-texte');
      var titre = '';
      for (var i = 0; i < lignes.length; i++) {
        var t = lignes[i].textContent.replace(/​/g, '').trim();
        if (t) { titre = t; break; }
      }
      titre = titre.replace(/^[«"'\s]+|[»"'\s]+$/g, '');
      if (!titre) return;
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = titre;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var cible = null;
        try { cible = document.querySelector('.zone-row[data-lien="' + CSS.escape(id) + '"]'); } catch (err) {}
        if (cible) cible.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
      listeProjets.appendChild(a);
    });
    if (listeProjets.children.length) menu.appendChild(listeProjets);
  }

  // ── Lien direct vers un projet : page.html#t1 fait défiler jusqu'à ses images ──
  if (location.hash.length > 1) {
    var idProjet = location.hash.slice(1);
    var premiereLigne = null;
    try {
      premiereLigne = document.querySelector('.zone-row[data-lien="' + CSS.escape(idProjet) + '"]');
    } catch (e) {}
    if (premiereLigne) {
      setTimeout(function () {
        premiereLigne.scrollIntoView({ block: 'start' });
      }, 50);
    }
  }

  // ── Aperçu image (lightbox) — uniquement pour les images des zones (page de défilement) ──
  if (document.querySelector('.zone-row-item img') && !document.querySelector('.lightbox-overlay')) {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<button class="lightbox-fermer" aria-label="Fermer">&times;</button>' +
      '<button class="lightbox-precedent" aria-label="Image précédente">&#8249;</button>' +
      '<button class="lightbox-suivant" aria-label="Image suivante">&#8250;</button>' +
      '<img class="lightbox-img" alt="">' +
      '<div class="lightbox-titre"></div>' +
      '<div class="lightbox-legende"></div>';
    document.body.appendChild(overlay);

    var lbImg = overlay.querySelector('.lightbox-img');
    var lbTitre = overlay.querySelector('.lightbox-titre');
    var lbLeg = overlay.querySelector('.lightbox-legende');
    var lbFermer = overlay.querySelector('.lightbox-fermer');
    var lbPrecedent = overlay.querySelector('.lightbox-precedent');
    var lbSuivant = overlay.querySelector('.lightbox-suivant');

    var galerieCourante = [];
    var indexCourant = -1;

    function trouverLegende(img) {
      var row = img.closest('.zone-row');
      if (row) {
        var legendeRow = row.querySelector('.zone-row-legende');
        if (legendeRow && legendeRow.textContent.trim()) return legendeRow.textContent.trim();
      }
      return '';
    }

    function trouverTitre(img) {
      var item = img.closest('.zone-row-item');
      if (item) {
        var titreEl = item.querySelector('.zone-row-titre');
        if (titreEl && titreEl.textContent.trim()) return titreEl.textContent.trim();
      }
      return img.alt ? img.alt.trim() : '';
    }

    function afficherIndex(i) {
      if (!galerieCourante.length) return;
      indexCourant = (i + galerieCourante.length) % galerieCourante.length;
      var img = galerieCourante[indexCourant];
      lbImg.src = img.currentSrc || img.src;
      lbImg.classList.remove('zoome');
      lbTitre.textContent = trouverTitre(img);
      lbLeg.textContent = trouverLegende(img);
      var plusieurs = galerieCourante.length > 1;
      lbPrecedent.style.display = plusieurs ? 'block' : 'none';
      lbSuivant.style.display = plusieurs ? 'block' : 'none';
    }

    function ouvrirLightbox(img) {
      var colD = img.closest('.zone-col-droite');
      galerieCourante = colD
        ? Array.prototype.slice.call(colD.querySelectorAll('.zone-row-item img'))
        : [img];
      afficherIndex(galerieCourante.indexOf(img));
      overlay.classList.add('actif');
    }

    function fermerLightbox() {
      overlay.classList.remove('actif');
      lbImg.classList.remove('zoome');
    }

    document.querySelectorAll('.zone-row-item img').forEach(function (img) {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function (e) {
        e.stopPropagation();
        ouvrirLightbox(img);
      });
    });

    lbImg.addEventListener('click', function (e) {
      e.stopPropagation();
      lbImg.classList.toggle('zoome');
    });
    lbLeg.addEventListener('click', function (e) { e.stopPropagation(); });
    lbFermer.addEventListener('click', function (e) { e.stopPropagation(); fermerLightbox(); });
    lbPrecedent.addEventListener('click', function (e) { e.stopPropagation(); afficherIndex(indexCourant - 1); });
    lbSuivant.addEventListener('click', function (e) { e.stopPropagation(); afficherIndex(indexCourant + 1); });
    overlay.addEventListener('click', fermerLightbox);
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('actif')) return;
      if (e.key === 'Escape') fermerLightbox();
      else if (e.key === 'ArrowLeft') afficherIndex(indexCourant - 1);
      else if (e.key === 'ArrowRight') afficherIndex(indexCourant + 1);
    });
  }
});
