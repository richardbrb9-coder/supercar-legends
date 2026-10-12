// Picture credits, written by tools/fetch_images.py. Every picture is a free-licence file from Wikimedia Commons.
// id: { file, author, license, url }
const PEOPLE_CREDITS = {
 "adrian_newey": {
  "file": "Adrian_Newey_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_(028A8662).jpg",
  "author": "Yu Chu Chin",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:Adrian_Newey_at_the_Melbourne_Walk_during_the_2026_Australian_Grand_Prix_(028A8662).jpg"
 },
 "bruce_mclaren": {
  "file": "McLarenBruce.jpg",
  "author": "Lothar Spurzem",
  "license": "CC BY-SA 2.0 de",
  "url": "https://commons.wikimedia.org/wiki/File:McLarenBruce.jpg"
 },
 "carroll_shelby": {
  "file": "CarrollShelbyVIR2007.jpg",
  "author": "Sherry Lambert Stapleton from No.. I live in Halifax VA., USA!",
  "license": "CC BY-SA 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:CarrollShelbyVIR2007.jpg"
 },
 "christian_von_koenigsegg": {
  "file": "40._St.Gallen_Symposium-Christian_von_Koenigsegg-HSGN_028-01971_(cropped).JPG",
  "author": "Marcel Giger",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:40._St.Gallen_Symposium-Christian_von_Koenigsegg-HSGN_028-01971_(cropped).JPG"
 },
 "colin_chapman": {
  "file": "Colin_Chapman_(1965).jpg",
  "author": "Joost Evers / Anefo;",
  "license": "CC0",
  "url": "https://commons.wikimedia.org/wiki/File:Colin_Chapman_(1965).jpg"
 },
 "enzo_ferrari": {
  "file": "Enzo_Ferrari_Monza_1967.jpg",
  "author": "Rainer W. Schlegelmilch",
  "license": "Public domain",
  "url": "https://commons.wikimedia.org/wiki/File:Enzo_Ferrari_Monza_1967.jpg"
 },
 "ferdinand_pi_ch": {
  "file": "Ferdinand Piech by Stuart Mentiply.jpg",
  "author": "Stuart Mentiply",
  "license": "GFDL 1.2",
  "url": "https://commons.wikimedia.org/wiki/File:Ferdinand_Piech_by_Stuart_Mentiply.jpg"
 },
 "ferruccio_lamborghini": {
  "file": "Ferruccio_Lamborghini.jpg",
  "author": "Unknown",
  "license": "Attribution",
  "url": "https://commons.wikimedia.org/wiki/File:Ferruccio_Lamborghini.jpg"
 },
 "ferry_porsche": {
  "file": "Ferry_Porsche_and_John_von_Neumann_in_Los_Angeles_(1960)_(cropped)(2).jpg",
  "author": "V. & P., Inc.",
  "license": "Public domain",
  "url": "https://commons.wikimedia.org/wiki/File:Ferry_Porsche_and_John_von_Neumann_in_Los_Angeles_(1960)_(cropped)(2).jpg"
 },
 "giorgetto_giugiaro": {
  "file": "GiorgettoGiugiaro_(cropped).jpg",
  "author": "Mitjagodnic",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:GiorgettoGiugiaro_(cropped).jpg"
 },
 "gordon_murray": {
  "file": "Gordon Murray chats in the paddock behind the pits at the 1996 Le Mans (51816281021).jpg",
  "author": "Martin Lee from London, UK",
  "license": "CC BY-SA 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:Gordon_Murray_chats_in_the_paddock_behind_the_pits_at_the_1996_Le_Mans_(51816281021).jpg"
 },
 "henry_ford_ii": {
  "file": "Henry_Ford_II_in_Nederland_om_zijn_jacht_te_bekijken._Hier_op_Schiphol,_Bestanddeelnr_914-9054_(cropped).jpg",
  "author": "Hugo van Gelderen / Anefo (originally uploaded to Wikimedia Commons by Mr. Nostalgic…",
  "license": "CC0",
  "url": "https://commons.wikimedia.org/wiki/File:Henry_Ford_II_in_Nederland_om_zijn_jacht_te_bekijken._Hier_op_Schiphol,_Bestanddeelnr_914-9054_(cropped).jpg"
 },
 "horacio_pagani": {
  "file": "Horacio-Pagani.jpg",
  "author": "RizwanRzaKhan",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:Horacio-Pagani.jpg"
 },
 "ian_callum": {
  "file": "Ian_Callum_in_Dubai.jpg",
  "author": "Jaguar MENA",
  "license": "CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:Ian_Callum_in_Dubai.jpg"
 },
 "ken_miles": {
  "file": "Dolphin_Mk_2_with_ken_MIles.tif",
  "author": "Raycrosthwaite",
  "license": "CC BY-SA 3.0",
  "url": "https://commons.wikimedia.org/wiki/File:Dolphin_Mk_2_with_ken_MIles.tif"
 },
 "marcello_gandini": {
  "file": "Marcello_Gandini_in_1976.jpg",
  "author": "Unknown photographer",
  "license": "Public domain",
  "url": "https://commons.wikimedia.org/wiki/File:Marcello_Gandini_in_1976.jpg"
 },
 "mate_rimac": {
  "file": "Rimac_(102)_(cropped).jpg",
  "author": "El monty",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:Rimac_(102)_(cropped).jpg"
 },
 "roland_gumpert": {
  "file": "Roland-Gumpert-next-apollo.jpg",
  "author": "Gumpertapollo",
  "license": "CC0",
  "url": "https://commons.wikimedia.org/wiki/File:Roland-Gumpert-next-apollo.jpg"
 },
 "victor_muller": {
  "file": "Victor_Muller.jpg",
  "author": "Kroum",
  "license": "CC BY-SA 3.0",
  "url": "https://commons.wikimedia.org/wiki/File:Victor_Muller.jpg"
 },
 "w_o_bentley": {
  "file": "OW Bentley (1921).jpg",
  "author": "Unknown author",
  "license": "Public domain",
  "url": "https://commons.wikimedia.org/wiki/File:OW_Bentley_(1921).jpg"
 }
};
