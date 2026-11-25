// Picture credits for the Le Mans pages. Every picture is a free-licence file from Wikimedia Commons,
// downloaded on 25 November 2026, cropped and saved as .webp in lemans-images/.
// id: { title, file, author, license, url }
const LEMANS_CREDITS = {
 "start": {
  "title": "The start, 2008",
  "file": "24 Hours of Le Mans 2008 start.jpg",
  "author": "Wonker from London, United Kingdom",
  "license": "CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:24_Hours_of_Le_Mans_2008_start.jpg"
 },
 "dunlop_bridge": {
  "title": "Dunlop Bridge, 2014",
  "file": "Le Mans 2014 - Blue Flags at Dunlop Bridge (14438346795).jpg",
  "author": "Mark Seymour from UK",
  "license": "CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:Le_Mans_2014_-_Blue_Flags_at_Dunlop_Bridge_(14438346795).jpg"
 },
 "night": {
  "title": "Night at Indianapolis corner, 2026",
  "file": "24 Heures du Mans 2026 Hypercar No. 12 Cadillac V-Series.R (night).jpg",
  "author": "T GOUREAU",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:24_Heures_du_Mans_2026_Hypercar_No._12_Cadillac_V-Series.R_(night).jpg"
 },
 "pit_stop": {
  "title": "Pit stop, 2019",
  "file": "United-autosports-le-mans-race-053.jpg",
  "author": "United Autosports",
  "license": "CC BY-SA 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:United-autosports-le-mans-race-053.jpg"
 },
 "mulsanne": {
  "title": "Mulsanne Straight chicane",
  "file": "The Mulsanne Straight (5847759679).jpg",
  "author": "David Merrett from Daventry, England",
  "license": "CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:The_Mulsanne_Straight_(5847759679).jpg"
 },
 "porsche_curves": {
  "title": "Porsche Curves, 2014",
  "file": "Le Mans 2014 - LMP2s on Formation Lap at Porsche Curves (14252385317).jpg",
  "author": "Mark Seymour from UK",
  "license": "CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:Le_Mans_2014_-_LMP2s_on_Formation_Lap_at_Porsche_Curves_(14252385317).jpg"
 },
 "trophy": {
  "title": "Winners’ trophy, 2023",
  "file": "Ferrari Le Mans 2023 trophy (53048350384).jpg",
  "author": "Andrew Basterfield",
  "license": "CC BY-SA 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:Ferrari_Le_Mans_2023_trophy_(53048350384).jpg"
 },
 "race_1923": {
  "title": "Chenard-Walcker team, 1923",
  "file": "27-5-23, Le Mans, équipe Chenard Walcker (course automobile des 24 heures) - btv1b531077601.jpg",
  "author": "Agence Rol",
  "license": "Public domain",
  "url": "https://commons.wikimedia.org/wiki/File:27-5-23,_Le_Mans,_%C3%A9quipe_Chenard_Walcker_(course_automobile_des_24_heures)_-_btv1b531077601.jpg"
 },
 "grid_1929": {
  "title": "The pits, 1929",
  "file": "Grid at the 1929 24 Hours of Le Mans.jpg",
  "author": "Agence de presse Meurisse",
  "license": "Public domain",
  "url": "https://commons.wikimedia.org/wiki/File:Grid_at_the_1929_24_Hours_of_Le_Mans.jpg"
 },
 "ferris_wheel": {
  "title": "The big wheel at night, 2023",
  "file": "The Ferris wheel dominates the skyline at night during the 2023 Le Mans (53468676252).jpg",
  "author": "Martin Lee from London, UK",
  "license": "CC BY-SA 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:The_Ferris_wheel_dominates_the_skyline_at_night_during_the_2023_Le_Mans_(53468676252).jpg"
 },
 "wm_p88": {
  "title": "WM P88",
  "file": "IMG 6069-Le Mans Heritage Club.jpg",
  "author": "Éric Manesse",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:IMG_6069-Le_Mans_Heritage_Club.jpg"
 },
 "toyota_tr010": {
  "title": "Toyota TR010 Hybrid, 2026",
  "file": "24 Heures du Mans 2026 Hypercar No. 7 Toyota TR010 Hybrid.jpg",
  "author": "T GOUREAU",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:24_Heures_du_Mans_2026_Hypercar_No._7_Toyota_TR010_Hybrid.jpg"
 },
 "lmp2": {
  "title": "LMP2 Oreca 07, 2026",
  "file": "24 Heures du Mans 2026 LMP2 No. 43 Oreca 07-Gibson INTER EUROPOL COMPETITION.jpg",
  "author": "T GOUREAU",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:24_Heures_du_Mans_2026_LMP2_No._43_Oreca_07-Gibson_INTER_EUROPOL_COMPETITION.jpg"
 },
 "lmgt3": {
  "title": "LMGT3 Corvette, 2026",
  "file": "24 Heures du Mans 2026 LMGT3 No. 33 Corvette Z06 LMGT3.R TF SPORT.jpg",
  "author": "T GOUREAU",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:24_Heures_du_Mans_2026_LMGT3_No._33_Corvette_Z06_LMGT3.R_TF_SPORT.jpg"
 },
 "bentley_speed_six": {
  "title": "Bentley Speed Six",
  "file": "Bentley Speed Six \"Old Number One\", Hampton Court 2023.jpg",
  "author": "Mwsmith20",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:Bentley_Speed_Six_%22Old_Number_One%22,_Hampton_Court_2023.jpg"
 },
 "jaguar_d_type": {
  "title": "Jaguar D-Type",
  "file": "1955 Jaguar D-type Le Mans - 5425340043.jpg",
  "author": "kitmasterbloke",
  "license": "CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:1955_Jaguar_D-type_Le_Mans_-_5425340043.jpg"
 },
 "porsche_956": {
  "title": "Porsche 956",
  "file": "Porsche 956B 2018 Le Mans Classic (31881676398).jpg",
  "author": "David Merrett",
  "license": "CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:Porsche_956B_2018_Le_Mans_Classic_(31881676398).jpg"
 },
 "sauber_c9": {
  "title": "Sauber-Mercedes C9",
  "file": "Paris - Retromobile 2012 - Sauber Mercedes C9 - 1989 - 015.jpg",
  "author": "Thesupermat",
  "license": "CC BY-SA 3.0",
  "url": "https://commons.wikimedia.org/wiki/File:Paris_-_Retromobile_2012_-_Sauber_Mercedes_C9_-_1989_-_015.jpg"
 },
 "mazda_787b": {
  "title": "Mazda 787B",
  "file": "Mazda 787B No. 55 (front three-quarter view) at Mazda Museum.jpg",
  "author": "Aos.1905",
  "license": "CC BY 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:Mazda_787B_No._55_(front_three-quarter_view)_at_Mazda_Museum.jpg"
 },
 "mclaren_f1_gtr": {
  "title": "McLaren F1 GTR",
  "file": "Rétromobile 2018 - McLaren F1 GTR - 1995 - 001.jpg",
  "author": "Thesupermat",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:R%C3%A9tromobile_2018_-_McLaren_F1_GTR_-_1995_-_001.jpg"
 },
 "audi_r8": {
  "title": "Audi R8 racing car",
  "file": "Audi R8 LMP, Le Mans 2000 (museum mobile 2013-09-03).JPG",
  "author": "Lothar Spurzem",
  "license": "CC BY-SA 2.0 de",
  "url": "https://commons.wikimedia.org/wiki/File:Audi_R8_LMP,_Le_Mans_2000_(museum_mobile_2013-09-03).JPG"
 },
 "audi_r10_tdi": {
  "title": "Audi R10 TDI",
  "file": "2006 Audi R10 TDI Goodwood, 2009 (03).jpg",
  "author": "Bahnfrend",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:2006_Audi_R10_TDI_Goodwood,_2009_(03).jpg"
 },
 "porsche_919_hybrid": {
  "title": "Porsche 919 Hybrid",
  "file": "2016 Porsche 919 Hybrid Le Mans.jpg",
  "author": "MrWalkr",
  "license": "CC BY-SA 4.0",
  "url": "https://commons.wikimedia.org/wiki/File:2016_Porsche_919_Hybrid_Le_Mans.jpg"
 },
 "toyota_ts050_hybrid": {
  "title": "Toyota TS050 Hybrid",
  "file": "2018 Toyota Gazoo Racing's Toyota TS050 Hydrid (49379920151).jpg",
  "author": "David Merrett from Daventry, England",
  "license": "CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:2018_Toyota_Gazoo_Racing%27s_Toyota_TS050_Hydrid_(49379920151).jpg"
 },
 "tom_kristensen": {
  "title": "Tom Kristensen, 2014",
  "file": "Tom Kristensen 2014.jpg",
  "author": "David Merrett",
  "license": "CC BY 2.0",
  "url": "https://commons.wikimedia.org/wiki/File:Tom_Kristensen_2014.jpg"
 }
};
