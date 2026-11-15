/* Remplissage du livret ANNEXE 1 (AF VERSION 03) — 842 x 595 pt, tâches à partir de la page 7, 10 lignes par page.
   Deux modèles reconnus au nombre de pages : le livret d'origine (26 pages) et le livret fusionné exporté de Canva
   (plus de 26 pages, tâches jusqu'à la dernière page). Toutes les cotes sont mesurées depuis le haut de la page, en points. */
(function (root) {
  "use strict";
  var H = 595.22;
  var PREMIERE_PAGE = 7, DERNIERE_PAGE = 26, LIGNES = 10;
  var HAUT_L1 = 134.7, PAS = 40.8;
  var COL = { jour: 80.05, ata: 100.7, INS: 116.3, FOT: 131.9, SGH: 147.5, "R/I": 163.1, TS: 178.7, type: 596.3, immat: 665.65, date: 735.0 };

  function frDate(iso) { if (!iso) return ""; var p = iso.split("-"); return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso; }

  /* n° TRFX : dans le livret fusionné, le libellé est sur deux lignes et le numéro suit « (TRFX) : » sur la seconde */
  var TRFX = { origine: { x: 632, y: 30.8, s: 8.5 }, fusionne: { x: 589.5, y: 33.2, s: 7.5 } };
  function dernierePage(nbPages) { return Math.max(DERNIERE_PAGE, nbPages || 0); }
  function modele(nbPages) { return nbPages > DERNIERE_PAGE ? "fusionne" : "origine"; }

  /* Renvoie "" si le PDF convient, sinon le motif du refus. */
  function verifierModele(doc) {
    var n = doc.getPageCount();
    if (n < DERNIERE_PAGE) return "Ce PDF a " + n + " pages : le livret ANNEXE 1 version 03 en compte au moins 26.";
    var s = doc.getPage(PREMIERE_PAGE - 1).getSize();
    if (Math.abs(s.width - 842) > 3 || Math.abs(s.height - H) > 3) return "Ce PDF n'est pas au format du livret ANNEXE 1 version 03 (A4 paysage).";
    return "";
  }

  async function remplirLivret(PDFLib, octets, d) {
    var doc = await PDFLib.PDFDocument.load(octets);
    var nbPages = doc.getPageCount(), trfx = TRFX[modele(nbPages)];
    var dx = Number(d.dx) || 0, dy = Number(d.dy) || 0; // calage fin des lignes de tâches, en points (dy > 0 = vers le bas)
    var F = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    var B = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    var noir = PDFLib.rgb(0, 0, 0), blanc = PDFLib.rgb(1, 1, 1), gris = PDFLib.rgb(0.851, 0.851, 0.851);

    function propre(t, f) { // retire ce que la police ne sait pas écrire
      t = String(t == null ? "" : t).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/ /g, " ").replace(/[\r\n\t]+/g, " ");
      var out = "";
      for (var i = 0; i < t.length; i++) { var c = t[i]; try { f.encodeText(c); out += c; } catch (e) { out += "?"; } }
      return out.trim();
    }
    function ajuste(t, f, taille, largeur, mini) { // réduit la taille jusqu'à tenir dans la largeur
      while (taille > mini && f.widthOfTextAtSize(t, taille) > largeur) taille -= 0.25;
      while (t.length > 1 && f.widthOfTextAtSize(t, taille) > largeur) t = t.slice(0, -1);
      return { t: t, s: taille };
    }
    function centre(pg, t, xc, yc, taille, f, largeur) {
      f = f || F; t = propre(t, f); if (!t) return;
      var a = ajuste(t, f, taille, largeur || 999, 5);
      pg.drawText(a.t, { x: xc - f.widthOfTextAtSize(a.t, a.s) / 2, y: H - (yc + 0.359 * a.s), size: a.s, font: f, color: noir });
    }
    function gauche(pg, t, x, yc, taille, f, largeur) {
      f = f || F; t = propre(t, f); if (!t) return;
      var a = ajuste(t, f, taille, largeur || 999, 5);
      pg.drawText(a.t, { x: x, y: H - (yc + 0.359 * a.s), size: a.s, font: f, color: noir });
    }
    function couper(t, f, taille, largeur) {
      var mots = t.split(/\s+/), lignes = [], cur = "";
      mots.forEach(function (m) {
        var essai = cur ? cur + " " + m : m;
        if (f.widthOfTextAtSize(essai, taille) <= largeur) cur = essai;
        else { if (cur) lignes.push(cur); cur = m; while (f.widthOfTextAtSize(cur, taille) > largeur && cur.length > 1) { var k = cur.length - 1; while (k > 1 && f.widthOfTextAtSize(cur.slice(0, k), taille) > largeur) k--; lignes.push(cur.slice(0, k)); cur = cur.slice(k); } }
      });
      if (cur) lignes.push(cur);
      return lignes;
    }

    /* ----- pages 1 et 2 : identité ----- */
    var p = d.profil || {};
    if (d.ecrireIdentite) {
      var p1 = doc.getPage(0), p2 = doc.getPage(1);
      var nomComplet = [(p.nom || "").toUpperCase(), p.prenom || ""].join(" ").trim();
      gauche(p1, nomComplet, 312, 476.0, 15, B, 180);
      if (p.categorie === "B1") centre(p1, "X", 442.4, 255.8, 14, B);
      if (p.categorie === "B2") centre(p1, "X", 503.4, 255.8, 14, B);
      var xv = 191, lv = 134;
      gauche(p2, (p.nom || "").toUpperCase(), xv, 211.0, 9, F, lv);
      gauche(p2, p.prenom, xv, 226.0, 9, F, lv);
      gauche(p2, frDate(p.naissance), xv, 241.0, 9, F, lv);
      gauche(p2, p.nationalite, xv, 256.0, 9, F, lv);
      gauche(p2, p.compagnie, xv, 271.0, 9, F, lv);
      gauche(p2, p.matricule, xv, 286.0, 9, F, lv);
      if (p.categorie === "B1") centre(p2, "X", 243.5, 299.0, 9.5, B);
      if (p.categorie === "B2") centre(p2, "X", 283.3, 299.0, 9.5, B);
      centre(p2, frDate(p.debut), 397.9, 233.5, 9, F, 120);
      var it = p.interruptions || [];
      if (it[0]) { centre(p2, frDate(it[0].debut), 637.8, 226.0, 9, F, 100); centre(p2, frDate(it[0].fin), 734.5, 226.0, 9, F, 80); }
      if (it[1]) { centre(p2, frDate(it[1].debut), 637.8, 256.0, 9, F, 100); centre(p2, frDate(it[1].fin), 734.5, 256.0, 9, F, 80); }
      var motif = propre(p.motif, F);
      if (motif) couper(motif, F, 9, 425).slice(0, 5).forEach(function (l, i) { p2.drawText(l, { x: 341, y: H - (289 + i * 11.5), size: 9, font: F, color: noir }); });
      if (d.nbLivrets) centre(p2, String(d.nbLivrets), 521.2, 256.0, 9, F, 100);
    }

    /* ----- pages 7 à 26 : tâches ----- */
    (d.lignes || []).forEach(function (t) {
      if (t.page < PREMIERE_PAGE || t.page > doc.getPageCount() || t.ligne < 1 || t.ligne > LIGNES) return;
      var pg = doc.getPage(t.page - 1), T = HAUT_L1 + PAS * (t.ligne - 1) + dy, mil = T + PAS / 2;
      var preimprime = t.page === PREMIERE_PAGE && t.ligne === 1; // le « 1 » est déjà imprimé dans cette case
      if (preimprime && String(t.jour) !== "1") pg.drawRectangle({ x: 69 + dx, y: H - (mil + 7), width: 22.5, height: 14, color: gris });
      if (!(preimprime && String(t.jour) === "1")) centre(pg, String(t.jour), COL.jour + dx, mil, 7.5, B, 23);
      centre(pg, t.ata, COL.ata + dx, mil, 7.5, F, 14);
      (t.natures || []).forEach(function (n) { if (COL[n]) centre(pg, "X", COL[n] + dx, mil, 9, B); });
      /* référence : on masque les pointillés du modèle puis on écrit à leur place */
      var ref = propre(String(t.ref || "").replace(/^TASK REF\s*:\s*/i, ""), F);
      if (ref) {
        pg.drawRectangle({ x: 227.2 + dx, y: H - (T + 12.6), width: 333, height: 10.8, color: blanc });
        gauche(pg, ref, 228.2 + dx, T + 6.6, 8, F, 330);
      }
      /* titre : jusqu'à 3 lignes sous la référence, taille réduite si besoin */
      var titre = propre(t.titre, F);
      if (titre) {
        var haut = T + 14.2, place = 25.2, larg = 364, tailles = [8, 7.5, 7, 6.5, 6, 5.5], ok = null;
        for (var i = 0; i < tailles.length && !ok; i++) {
          var s = tailles[i], inter = s * 1.14, max = Math.min(3, Math.floor(place / inter)), ls = couper(titre, F, s, larg);
          if (ls.length <= max || i === tailles.length - 1) ok = { s: s, inter: inter, ls: ls.slice(0, max) };
        }
        var bloc = ok.ls.length * ok.inter, y0 = haut + (place - bloc) / 2;
        ok.ls.forEach(function (l, k) { pg.drawText(l, { x: 192.8 + dx, y: H - (y0 + k * ok.inter + ok.s * 0.86), size: ok.s, font: F, color: noir }); });
      }
      var hautMil = T + 10.4, basMil = T + trfx.y;
      centre(pg, t.type, COL.type + dx, hautMil, 8, F, 66);
      centre(pg, t.immat, COL.immat + dx, hautMil, 8, F, 66);
      centre(pg, frDate(t.date), COL.date + dx, hautMil, 8, F, 66);
      gauche(pg, t.trfx, trfx.x + dx, basMil, trfx.s, F, 770 - trfx.x);
    });

    return await doc.save();
  }

  var api = { remplirLivret: remplirLivret, verifierModele: verifierModele, dernierePage: dernierePage, modele: modele, PREMIERE_PAGE: PREMIERE_PAGE, DERNIERE_PAGE: DERNIERE_PAGE, LIGNES: LIGNES, CAPACITE: (DERNIERE_PAGE - PREMIERE_PAGE + 1) * LIGNES };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.LivretPDF = api;
})(typeof self !== "undefined" ? self : this);
