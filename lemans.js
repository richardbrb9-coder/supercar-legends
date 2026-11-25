// The Le Mans 24 Hours: the story of the race, the circuit, the records, how the race works and the famous cars.
// Checked against Wikipedia on 25 November 2026: "24 Hours of Le Mans", "Circuit de la Sarthe", "Mulsanne Straight",
// "List of 24 Hours of Le Mans records", the pages for each race mentioned (1923 to 2026) and the page for each car.
// Results are up to and including the 2026 race (13-14 June 2026).
// Notes on numbers that differ between sources:
//   - WM P88 top speed: officially timed at 405 km/h in the 1988 race; some pages give 407 km/h. 405 is used here.
//   - The 1966 Ford finish: the gap is given as 8 metres or 20 metres, so no number is given here.
// Photos are free-licence files from Wikimedia Commons (lemans-images/, credits in lemans-credits.js).
// Car and people names must match cars.js and people.js exactly, so they can open the existing cards.

const LE_MANS = {
    color: '#2979FF',

    sections: [
        { id: 'race', title: 'The race', sub: 'What is Le Mans?', color: '#2979FF', ink: 'light' },
        { id: 'story', title: 'The story', sub: '1923 to today', color: '#FFB300' },
        { id: 'circuit', title: 'The circuit', sub: 'Tap around the lap', color: '#43A047' },
        { id: 'records', title: 'Records', sub: 'Numbers to know', color: '#E10600', ink: 'light' },
        { id: 'raceday', title: 'Race day', sub: 'How it works now', color: '#00B8D9' },
        { id: 'cars', title: 'Famous cars', sub: '16 winners', color: '#7E57C2', ink: 'light' }
    ],

    // ---------------------------------------------------------------- 1. What is Le Mans?
    intro: {
        title: 'One race. One whole day and night.',
        text: [
            'The Le Mans 24 Hours is a car race in France that lasts a whole day and a whole night. It was first run in 1923, and it is the oldest endurance race in the world that is still held today.',
            'It is not won by the first car to finish a set number of laps. The winner is the car that has travelled the furthest when the clock reaches 24 hours. So a Le Mans car has to be fast, but it also has to keep going. A car that breaks down wins nothing.'
        ],
        photo: 'start', caption: 'The cars line up in front of packed grandstands before the start in 2008.',
        tiles: [
            ['24', 'hours of racing, without a break'],
            ['13.626 km', 'in one lap (8.467 miles)'],
            ['3', 'drivers share each car'],
            ['62', 'cars started in 2026'],
            ['3', 'classes race at the same time'],
            ['1923', 'the year of the first race']
        ],
        boxes: [
            ['🛣 A track made from real roads', 'The track is called the Circuit de la Sarthe. Part of it is a proper racetrack. The rest is ordinary public road, which is closed for the race. For most of the year, lorries and family cars drive along the famous Mulsanne Straight.'],
            ['👥 Three drivers, one car', 'Nobody could race for 24 hours alone, so three drivers take turns. The rules say one driver may not drive for more than 4 hours in any 6, or more than 14 hours in total.'],
            ['🌙 Racing in the dark', 'The race is held in the middle of June, when the nights are at their shortest. Even so, the cars race through hours of darkness with their headlights on, often in rain.'],
            ['🏁 Fast cars and faster cars', 'Three kinds of car race together: Hypercars, LMP2 prototypes and LMGT3 cars. Each class has its own winner. The fastest cars spend the whole race overtaking the slower ones.'],
            ['🔧 Why is it so hard?', 'Drivers have the accelerator pressed flat for up to 85% of the lap. The winners usually cover more than 5,000 km (3,100 miles). The record distance is as far as about 18 Formula 1 races, one after another.'],
            ['👑 The Triple Crown', 'Le Mans, the Monaco Grand Prix and the Indianapolis 500 are known as the Triple Crown of motorsport. Only one driver has ever won all three: Graham Hill of Britain, who won Le Mans in 1972.']
        ],
        more: [
            { photo: 'night', caption: 'A Hypercar at the Indianapolis corner during the night in 2026.' },
            { photo: 'ferris_wheel', caption: 'The big wheel lights up the night sky above the track.' }
        ],
        note: 'The race is run by a French car club, the Automobile Club de l’Ouest (ACO). In 2025, about 332,000 people came to watch.'
    },

    // ---------------------------------------------------------------- 2. The story
    // Each chapter: years, title, colour, paragraphs, optional photo, and the cars / people / stories it links to.
    storyIntro: 'More than 100 years of racing in eleven chapters. Tap a car or a person to open their card.',
    chapters: [
        { years: '1923', title: 'A new kind of race', color: '#90A4AE',
          text: [
              'In the early 1920s, the big motor races were Grand Prix races for special racing cars. A French car club, the Automobile Club de l’Ouest, wanted something different: a race to show which ordinary cars were strong enough to last. The cars would race for 24 hours, on public roads near the city of Le Mans.',
              'The first race was held on 26 and 27 May 1923. One lap was 17.26 km (10.7 miles) long and the roads were not even covered in tarmac. It rained hard. Stones thrown up from the road smashed a headlight on the only British car, a Bentley, and made a hole in its fuel tank.',
              'Thirty-three cars started and thirty finished. André Lagache and René Léonard went furthest in their French Chenard-Walcker: 2,209 km (1,373 miles), at an average of 57 mph (92 km/h). Almost every car was French, but that lone Bentley set the fastest lap of the race. Its maker, W. O. Bentley, would soon be back.'
          ],
          photo: 'race_1923', caption: 'The Chenard-Walcker team at Le Mans on 27 May 1923.',
          cars: [], people: ['W. O. Bentley'] },

        { years: '1924–1930', title: 'The Bentley Boys', color: '#2E7D32',
          text: [
              'In 1924 John Duff and Frank Clement won Le Mans in a Bentley 3 Litre. It was the first win for a British car, and it started a legend.',
              'The Bentley Boys were a group of rich British drivers who loved fast cars and adventure. They raced big, heavy, very strong Bentleys, and they won Le Mans four times in a row, from 1927 to 1930. Rival car maker Bugatti is said to have called the Bentleys "the world’s fastest lorries".',
              'The most successful Bentley Boy was Woolf Barnato, whose family had made a fortune from diamonds. He bought the Bentley company to keep it going, raced at Le Mans three times, and won all three, from 1928 to 1930. The last two wins came in the mighty Bentley Speed Six.'
          ],
          photo: 'grid_1929', caption: 'Cars lined up in front of the pits before the 1929 race.',
          cars: [], people: ['W. O. Bentley'] },

        { years: '1949–1955', title: 'The 1950s: faster and faster', color: '#EF6C00',
          text: [
              'There was no racing during the Second World War. When Le Mans returned in 1949, a new name won at its very first try: Ferrari. Soon the big car makers were all sending teams. Jaguar, Mercedes-Benz, Aston Martin and Ferrari fought for the win, and the cars got quicker every year. In 1953 a Jaguar C-Type, the first Le Mans car with disc brakes, won at an average of more than 100 mph (161 km/h) for the first time.',
              'But the track had been laid out for the slower cars of the 1920s, and it had not kept up. In 1955 there was a terrible accident. A car left the track near the pits and went into the crowd. The driver, Pierre Levegh, and more than 80 spectators lost their lives. It is still the worst accident in the history of motor racing.',
              'It changed racing for good. Several countries stopped all motor racing until their tracks were made safer. At Le Mans the whole pit area was pulled down and rebuilt further back, so that the track in front of it could be made wider. Ever since, keeping spectators safe has been one of the most important jobs at every racetrack.'
          ],
          cars: [], people: ['Enzo Ferrari'] },

        { years: '1955–1959', title: 'The Jaguar D-Type', color: '#00695C',
          text: [
              'The Jaguar D-Type was designed for one job: winning Le Mans. Its body was built like an aeroplane, with a light, strong shell of aluminium instead of a heavy frame. Even its fuel was carried in a rubber bag, as in aircraft. Some D-Types had a tall fin behind the driver’s head to keep the car steady at high speed.',
              'It worked. Mike Hawthorn and Ivor Bueb won in a D-Type in 1955. Then a small Scottish team called Ecurie Ecosse won with D-Types in 1956 and 1957, beating the big factory teams. That made three wins in a row for the D-Type.',
              'In 1959 it was Aston Martin’s turn. Carroll Shelby, a Texan who had once been a chicken farmer, shared the winning car with Britain’s Roy Salvadori. Remember his name: a few years later he would come back to Le Mans as a team boss.'
          ],
          cars: [], people: ['Carroll Shelby', 'David Brown'] },

        { years: '1960–1969', title: 'Ferrari, then Ford', color: '#1E88E5',
          text: [
              'Ferrari ruled the early 1960s, winning six times in a row from 1960 to 1965. Then came one of the most famous battles in racing. Henry Ford II, angry that Enzo Ferrari had refused to sell him his company, ordered a car to beat Ferrari at Le Mans. That car was the Ford GT40, and it won four times in a row, from 1966 to 1969. You can read the whole story in the Motorsport tab.',
              'In 1967 the winners were two Americans, Dan Gurney and A. J. Foyt. On the podium, Gurney shook his bottle of champagne and sprayed it over everyone nearby. Winning drivers still do it today.',
              'The 1969 race had one of the closest finishes ever. After 24 hours of racing, Jacky Ickx’s GT40 crossed the line only about 120 metres ahead of a Porsche. The very same GT40 had also won the year before.'
          ],
          cars: ['Ford GT40'], people: ['Henry Ford II', 'Enzo Ferrari', 'Carroll Shelby', 'Ken Miles', 'Bruce McLaren'],
          story: 'ford-v-ferrari' },

        { years: '1970–1981', title: 'Porsche and the mighty 917', color: '#C62828',
          text: [
              'Porsche had won its class at Le Mans many times, but it had never won the whole race. So it built the 917, with a huge flat-12 engine. The rules said 25 cars had to be made before it could race, which was a big gamble for a small company. The man in charge of the project was Ferdinand Piëch.',
              'In 1970 the gamble paid off. In a race so tough that only seven cars were counted as finishers, Hans Herrmann and Richard Attwood gave Porsche its first overall win. Herrmann had lost by 120 metres the year before. That same race was filmed for the Steve McQueen film Le Mans.',
              'In 1971 a 917 driven by Helmut Marko and Gijs van Lennep covered 5,335 km (3,315 miles). That distance record stood for 39 years. On the Mulsanne Straight, long-tailed 917s reached 225 mph (362 km/h). Porsche has kept on winning ever since, and its 19 wins are more than any other maker.'
          ],
          cars: ['Porsche 917'], people: ['Ferry Porsche', 'Ferdinand Piëch'] },

        { years: '1982–1993', title: 'Group C and 250 mph', color: '#7B1FA2',
          text: [
              'In 1982 new rules called Group C arrived. Teams could build almost any engine they liked, but every car was given a limited amount of fuel. To win, you had to be fast and waste nothing. Porsche’s new 956 finished first, second and third that year, and Porsche won Le Mans seven times in a row from 1981 to 1987.',
              'Then the others caught up. Jaguar won in 1988 with the V12 XJR-9, and Sauber-Mercedes won in 1989. In 1991 Mazda became the first Japanese maker to win, with the 787B. It is still the only winner with a rotary engine, which has spinning rotors instead of pistons.',
              'Group C cars were astonishingly fast on the Mulsanne Straight. In 1988 a small French team called WM taped over the cooling vents of its car to make it slip through the air, and turned up the engine power. Roger Dorchy was timed at 252 mph (405 km/h), the highest speed ever recorded at Le Mans. The engine, starved of cooling air, soon gave up. Speeds like that were too dangerous, so in 1990 two chicanes were built into the straight to slow the cars down.'
          ],
          photo: 'wm_p88', caption: 'The WM P88, the fastest car ever timed at Le Mans.',
          cars: [], people: [] },

        { years: '1994–1999', title: 'A road car wins', color: '#F57C00',
          text: [
              'In the 1990s, cars based on road-going supercars came back to Le Mans. Gordon Murray had designed the McLaren F1 as the ultimate road car, and he never planned to race it. But a racing version, the F1 GTR, was built anyway.',
              'In 1995 the McLarens went to Le Mans for the first time. Few people expected them to beat the purpose-built racing prototypes. Then it rained for about 17 hours. The prototypes hit trouble, and the McLarens kept going. JJ Lehto, Yannick Dalmas and Masanori Sekiya won, and McLarens took four of the first five places. Only Ferrari, in 1949, had also won at its first attempt.',
              'Other makers copied the idea and built ever wilder "road cars" for racing. One of them, the Porsche 911 GT1, won in 1998.'
          ],
          cars: ['McLaren F1', 'Porsche 911 GT1'], people: ['Gordon Murray', 'Bruce McLaren'] },

        { years: '2000–2014', title: 'Audi, Bentley and the diesel', color: '#B0BEC5',
          text: [
              'The new century belonged to Audi. Its R8 racing car won five times. In 2003 Bentley, by then part of the same company as Audi, came back with the Speed 8 and won for the first time since 1930.',
              'One driver was in the winning car again and again. Tom Kristensen of Denmark won nine times between 1997 and 2013, including six in a row. No one else has won more than six.',
              'In 2006 Audi tried something that sounded odd: a diesel racing car. The R10 TDI, with a V12 diesel engine, became the first diesel car to win Le Mans. Peugeot built a diesel too, and beat Audi in 2009. In 2010 an Audi set a distance record that still stands: 5,410.7 km (3,362 miles). And in 2012 an Audi became the first hybrid car to win.'
          ],
          cars: ['Bentley Speed 8'], people: ['Ferdinand Piëch'] },

        { years: '2014–2022', title: 'Hybrid heroes and heartbreak', color: '#D32F2F',
          text: [
              'Next came the great hybrid battle between Audi, Porsche and Toyota. Their cars saved energy every time they braked, then used it for a burst of electric power out of the corners. Porsche returned to the top class in 2014 and won three times in a row with the 919 Hybrid, from 2015 to 2017.',
              'Toyota had been trying to win Le Mans for years. In 2016 it finally looked certain. With about three minutes of the 24 hours left, Kazuki Nakajima’s Toyota was in the lead. Then it suddenly lost power, and it rolled to a stop right in front of the pits. A Porsche swept past to win on the very last lap. It was one of the most heartbreaking finishes racing has ever seen.',
              'Toyota did not give up. In 2018 it won at last, and Kazuki Nakajima was one of the winning drivers, along with Sébastien Buemi and Formula 1 champion Fernando Alonso. Toyota went on to win five times in a row, from 2018 to 2022.'
          ],
          cars: [], people: [] },

        { years: '2021–today', title: 'The Hypercar era', color: '#FFB300',
          text: [
              'Since 2021 the top class at Le Mans has been called Hypercar. The rules give designers more freedom and cost less than before, so lots of famous makers have joined in.',
              'In 2023 the race celebrated its 100th birthday, and Ferrari came back to fight for the overall win for the first time in 50 years. In front of 325,000 fans, Alessandro Pier Guidi, James Calado and Antonio Giovinazzi won in the Ferrari 499P. It was Ferrari’s first Le Mans win since 1965. Ferrari won again in 2024 and in 2025.',
              'The most recent race was held on 13 and 14 June 2026. Toyota ended Ferrari’s run. Mike Conway, Kamui Kobayashi and Nyck de Vries won in the number 7 Toyota TR010 Hybrid after 381 laps, with a BMW second. It was a close race: seven cars finished on the same lap as the winner. Genesis, from South Korea, raced at Le Mans for the first time. It was Toyota’s sixth win.'
          ],
          photo: 'toyota_tr010', caption: 'The number 7 Toyota TR010 Hybrid, winner in 2026, at the Ford Chicanes.',
          cars: ['Ferrari 499P', 'Aston Martin Valkyrie'], people: [] }
    ],

    // ---------------------------------------------------------------- 3. The circuit
    // The map is drawn in code (lemans-app.js) from the points in "track": x is metres east and y is metres north
    // of the start line. It is a simple drawing of the real shape, not an exact survey.
    circuitIntro: 'One lap is 13.626 km (8.467 miles), one of the longest laps in motor racing. The cars go round clockwise. Tap a number on the map to explore.',
    track: [
        [0, 0], [70, 220], [170, 480], [225, 590], [300, 650], [350, 770], [480, 900], [680, 930], [820, 850], [960, 830], [1150, 780],
        [1330, 660], [1420, 480], [1834, -1014], [1817, -1179], [1917, -1313], [2289, -2657], [2389, -2791], [2372, -2956], [2662, -4002],
        [2775, -4410], [2792, -4515], [2690, -4490], [2400, -4330], [400, -3200], [250, -3085], [150, -3040], [60, -3120], [-110, -3290],
        [-195, -3200], [-300, -2950], [-350, -2600], [-350, -2250], [-320, -1980], [-220, -1720], [-60, -1560], [10, -1380], [-30, -1180],
        [-110, -1020], [-150, -850], [-150, -650], [-140, -480], [-95, -420], [-130, -350], [-90, -270], [-55, -150]
    ],
    // id, number, name, position [x, y], label offset [dx, dy] and side, short line, text, optional photo
    points: [
        { id: 'start', name: 'Start and finish', at: [0, 0], label: [-230, 60, 'end'],
          line: 'Where the race begins and ends',
          text: 'The race starts and finishes here, in front of the main grandstands. The pit lane runs alongside, with a garage for every team. After 24 hours, marshals all around the track wave their flags to salute the cars on the last lap.',
          photo: 'start', caption: 'The start and finish straight, packed with fans.' },
        { id: 'dunlop', name: 'Dunlop Bridge', at: [350, 770], label: [-60, -280, 'end'],
          line: 'The most famous bridge in racing',
          text: 'A footbridge shaped like half of a giant tyre, and the best-known landmark at Le Mans. Cars used to fly underneath at 180 mph (290 km/h). In 1987 a chicane was added before it, which slowed them to about 110 mph (180 km/h).',
          photo: 'dunlop_bridge', caption: 'Marshals wave blue flags as cars come under the Dunlop Bridge in 2014.' },
        { id: 'tertre', name: 'Tertre Rouge', at: [1330, 660], label: [230, -60, 'start'],
          line: 'The corner before the long straight',
          text: 'The name is French for "red hillock". This right-hand corner leads onto the Mulsanne Straight, so drivers need to come out of it as fast as they can. Any speed lost here is lost all the way down the straight.' },
        { id: 'mulsanne', name: 'Mulsanne Straight', at: [2103, -1985], label: [-230, -60, 'end'],
          line: 'A public road, and two chicanes',
          text: 'The most famous straight in racing. Its real name is the Ligne Droite des Hunaudières, and for most of the year it is an ordinary main road. It used to be 6 km (3.7 miles) of flat-out driving, the longest straight on any racetrack. Since 1990 two chicanes have split it into three parts of about 2 km each. Cars still reach close to 200 mph (320 km/h) here.',
          photo: 'mulsanne', caption: 'One of the two chicanes on the Mulsanne Straight.' },
        { id: 'mulsannecorner', name: 'Mulsanne Corner', at: [2792, -4515], label: [-60, 420, 'end'],
          line: 'The biggest stop of the lap',
          text: 'At the end of the straight, near the village of Mulsanne, the track turns sharp right. Drivers brake from over 200 mph (322 km/h) to about 62 mph (100 km/h). It is a huge stop, and the brakes take a real pounding.' },
        { id: 'indianapolis', name: 'Indianapolis', at: [150, -3040], label: [210, -200, 'start'],
          line: 'A fast run into a left-hander',
          text: 'After a long, fast run comes this left-hand corner. It shares its name with the famous Indianapolis racetrack in America. At night, with only headlights to see by, it takes real courage.',
          photo: 'night', caption: 'A Hypercar at Indianapolis during the night in 2026.' },
        { id: 'arnage', name: 'Arnage', at: [-110, -3290], label: [0, 420, 'middle'],
          line: 'Slow in, fast out',
          text: 'A tight right-hand corner named after the nearby village of Arnage. It is one of the slowest corners on the lap, and it comes straight after one of the fastest parts. Brake too late and you will not make the corner.' },
        { id: 'porsche', name: 'Porsche Curves', at: [-60, -1560], label: [220, 30, 'start'],
          line: 'A fast, flowing set of bends',
          text: 'A series of quick, sweeping bends where the cars change direction again and again at high speed. They were built in 1972 to replace a dangerous fast kink called Maison Blanche, which means "White House".',
          photo: 'porsche_curves', caption: 'LMP2 cars in the Porsche Curves on the lap before the start in 2014.' },
        { id: 'ford', name: 'Ford Chicanes', at: [-130, -400], label: [-220, -40, 'end'],
          line: 'The last corners of the lap',
          text: 'Two tight chicanes that slow the cars down before they reach the pits and the finish line. The first Ford chicane was added in 1968. After 24 hours, this is the last corner the winner takes.',
          photo: 'toyota_tr010', caption: 'The 2026 winner at the Ford Chicanes.' }
    ],

    // ---------------------------------------------------------------- 4. Records and numbers
    recordsNote: 'Correct up to and including the 2026 race.',
    recordTiles: [
        ['9', 'wins for Tom Kristensen, the most by any driver'],
        ['19', 'wins for Porsche, the most by any maker'],
        ['5,410.7 km', 'the furthest any winner has gone (3,362 miles), in 2010'],
        ['94', 'races held between 1923 and 2026']
    ],
    makerWins: [['Porsche', 19, '#C62828'], ['Audi', 13, '#B0BEC5'], ['Ferrari', 12, '#E10600'], ['Jaguar', 7, '#00695C'], ['Bentley', 6, '#2E7D32'], ['Toyota', 6, '#D32F2F'], ['Alfa Romeo', 4, '#8E24AA'], ['Ford', 4, '#1E88E5']],
    driverWins: [['Tom Kristensen', 9, '🇩🇰'], ['Jacky Ickx', 6, '🇧🇪'], ['Derek Bell', 5, '🇬🇧'], ['Frank Biela', 5, '🇩🇪'], ['Emanuele Pirro', 5, '🇮🇹']],
    // [label, value, note, mph (if it is a speed, so the units switch can show it)]
    records: [
        ['Highest speed', null, 'Roger Dorchy in the WM P88 on the Mulsanne Straight, 1988. Some sources say 407 km/h.', 251.7],
        ['Fastest lap ever', '3 min 14.791 s', 'Kamui Kobayashi, Toyota TS050 Hybrid, in qualifying in 2017. That is an average of 156.5 mph (251.9 km/h) for the whole lap.'],
        ['Fastest lap in a race', '3 min 17.297 s', 'Mike Conway, Toyota TS050 Hybrid, 2019.'],
        ['Longest distance', '5,410.7 km', 'An Audi R15+ TDI covered 397 laps (3,362 miles) in 2010. It beat a record that had stood since 1971.'],
        ['Closest racing finish', 'About 120 m', 'In 1969 Jacky Ickx’s Ford GT40 beat Hans Herrmann’s Porsche by about 120 metres after 24 hours.'],
        ['A finish decided by seconds', '13.854 s', 'In 2011 an Audi beat a Peugeot by under 14 seconds after 355 laps.'],
        ['Biggest winning margin', '349.8 km', 'In 1927 the winning Bentley finished almost 350 km (217 miles) ahead of the next car.'],
        ['Most wins in a row by a maker', '7', 'Porsche, from 1981 to 1987.'],
        ['Most wins by one type of car', '5', 'The Audi R8 racing car: 2000, 2001, 2002, 2004 and 2005.'],
        ['Youngest winner', '22 years old', 'Alexander Wurz of Austria, in 1996.'],
        ['Youngest driver to start', '16 years old', 'Josh Pierson of the USA, in 2022.'],
        ['Oldest driver to start', '75 years old', 'Dominique Bastien of the USA, in 2021.'],
        ['Most races started', '33', 'Henri Pescarolo of France, who also won four times.'],
        ['Driving the whole race alone', '24 hours', 'In 1950 Eddie Hall of Britain drove the whole race by himself, the only driver ever to do it. It is not allowed today.'],
        ['Biggest crowd', '400,000', 'The number of people who came to watch in 1969.']
    ],
    recordPhotos: [
        { photo: 'tom_kristensen', caption: 'Tom Kristensen, nine-time winner, at the drivers’ parade in 2014.' },
        { photo: 'trophy', caption: 'The winners’ trophy from the 100th-birthday race in 2023.' }
    ],

    // ---------------------------------------------------------------- 5. How the race works today
    latest: {
        title: 'Latest result: 2026',
        date: '13 and 14 June 2026, the 94th Le Mans 24 Hours',
        rows: [
            ['Hypercar (overall winner)', 'Toyota TR010 Hybrid, number 7', 'Mike Conway, Kamui Kobayashi and Nyck de Vries'],
            ['LMP2', 'Oreca 07, number 43, Inter Europol Competition', 'Tom Dillmann, Jakub Śmiechowski and Nick Yelloly'],
            ['LMGT3', 'Chevrolet Corvette Z06 GT3.R, number 33, TF Sport', 'Nicky Catsburg, Jonny Edgar and Ben Keating']
        ]
    },
    classes: [
        { name: 'Hypercar', color: '#E10600', photo: 'toyota_tr010', count: '18 cars in 2026',
          text: 'The top class, and the cars that fight for the overall win. They are racing prototypes built by big car makers, and most are hybrids. In 2026, eight makers took part, including Toyota, Ferrari, BMW, Cadillac, Aston Martin and Genesis.' },
        { name: 'LMP2', color: '#1E88E5', photo: 'lmp2', count: '19 cars in 2026',
          text: 'Slightly slower prototypes for private teams. Every car uses the same 4.2-litre Gibson V8 engine, so the best team and drivers win, not the biggest budget.' },
        { name: 'LMGT3', color: '#FF7043', photo: 'lmgt3', count: '25 cars in 2026',
          text: 'Racing versions of sports cars you might see on the road, from makers such as Chevrolet, Ferrari, Porsche, Aston Martin, McLaren and Lexus. This class took over from the older GT classes in 2024.' }
    ],
    how: [
        ['🏃 The Le Mans start', 'For many years the race began with the cars parked in a row and the drivers standing on the other side of the track. When the French flag dropped, they sprinted across, jumped in and drove off. It looked exciting, but drivers were racing away without doing up their seat belts. In 1969 Jacky Ickx protested by walking slowly to his car and fastening his belts first. He started at the back, and still won. From 1970 the drivers started strapped in, and since 1971 the race has begun with a rolling start behind a safety car.'],
        ['⛽ Pit stops', 'The cars stop many times for fuel, fresh tyres and a new driver. At Le Mans the engine must be switched off while the car is refuelled, and the mechanics may not work on the car until the fuel hose is out. So every car has to restart again and again without fail.'],
        ['🔄 Driver changes', 'One driver climbs out and the next climbs in while the car is being refuelled. Drivers often stay at the wheel for more than two hours at a time. Between turns they eat and try to rest, even with engines roaring outside.'],
        ['🚨 Safety cars and slow zones', 'If there is an accident, the race is slowed down to keep the marshals safe. The lap is so long that Le Mans uses three safety cars at once. For smaller problems there are "slow zones", used since 2014, where the cars must keep to 50 mph (80 km/h) through one part of the track while racing carries on everywhere else.'],
        ['🌙 Through the night', 'Night is when Le Mans is at its hardest. Drivers can see only what their headlights show them, and the faster cars are forever catching slower ones. Rain is common too. And when the sun comes up on Sunday morning, there are still many hours left to race.'],
        ['🏁 Getting to the end', 'To be counted in the results, a car must be running at the finish and must have covered at least 70% of the winner’s distance. Just reaching the end of Le Mans is something to be proud of.'],
        ['🔬 Garage 56', 'Since 2012 there has been a special place on the grid for an experimental car that tests new technology. It is known as Garage 56. It is there to try out new ideas, not to win.']
    ],
    howPhoto: { photo: 'pit_stop', caption: 'A pit stop for an LMP2 car in 2019.' },

    // ---------------------------------------------------------------- 6. Famous cars
    // car: a name from cars.js, so the card opens the full car card. photo: a file in lemans-images/ (otherwise the car's own photo is used).
    gallery: [
        { name: 'Bentley Speed Six', won: '1929, 1930', photo: 'bentley_speed_six', flag: '🇬🇧',
          text: 'The greatest of the Bentley Boys’ cars, with a 6.5-litre six-cylinder engine. This very car, known as "Old Number One", won two years running.' },
        { name: 'Jaguar D-Type', won: '1955, 1956, 1957', photo: 'jaguar_d_type', flag: '🇬🇧',
          text: 'Built like an aeroplane and shaped to slip through the air. It won three times in a row.' },
        { name: 'Ford GT40', won: '1966, 1967, 1968, 1969', car: 'Ford GT40', flag: '🇺🇸',
          text: 'The car Ford built to beat Ferrari. Only 40 inches tall, and a winner four times in a row.' },
        { name: 'Porsche 917', won: '1970, 1971', car: 'Porsche 917', flag: '🇩🇪',
          text: 'The flat-12 monster that gave Porsche its first overall win, and reached 225 mph (362 km/h) on the Mulsanne Straight.' },
        { name: 'Porsche 956', won: '1982, 1983, 1984, 1985', photo: 'porsche_956', flag: '🇩🇪',
          text: 'The first Porsche to use the air flowing under the car to suck it onto the track. It won four times in a row. This is the car that won in 1985.' },
        { name: 'Sauber-Mercedes C9', won: '1989', photo: 'sauber_c9', flag: '🇨🇭',
          text: 'A silver prototype from the Swiss team Sauber, with a turbocharged Mercedes V8 engine. It reached 249 mph (400 km/h) in qualifying in 1989.' },
        { name: 'Mazda 787B', won: '1991', photo: 'mazda_787b', flag: '🇯🇵',
          text: 'The first Japanese winner, and the only winner with a rotary engine, which has spinning rotors instead of pistons. This is the winning car.' },
        { name: 'McLaren F1 GTR', won: '1995', photo: 'mclaren_f1_gtr', car: 'McLaren F1', flag: '🇬🇧',
          text: 'A racing version of a road car that beat the prototypes at its first try, in 17 hours of rain. This is the actual winning car.' },
        { name: 'Porsche 911 GT1', won: '1998', car: 'Porsche 911 GT1', flag: '🇩🇪',
          text: 'A Le Mans racer that had to be sold as a road car too. It won at its third attempt.' },
        { name: 'Audi R8', won: '2000, 2001, 2002, 2004, 2005', photo: 'audi_r8', flag: '🇩🇪',
          text: 'With five wins, this racing car has won more often than any other type of car. This one won in 2000.' },
        { name: 'Bentley Speed 8', won: '2003', car: 'Bentley Speed 8', flag: '🇬🇧',
          text: 'It brought Bentley back to the top step, 73 years after the Bentley Boys’ last win.' },
        { name: 'Audi R10 TDI', won: '2006, 2007, 2008', photo: 'audi_r10_tdi', flag: '🇩🇪',
          text: 'The first diesel car to win Le Mans. Its V12 diesel engine won three years in a row. This one won in 2006.' },
        { name: 'Porsche 919 Hybrid', won: '2015, 2016, 2017', photo: 'porsche_919_hybrid', flag: '🇩🇪',
          text: 'A small 2-litre V4 turbo engine, helped by electric power. It took Porsche’s total to 19 wins.' },
        { name: 'Toyota TS050 Hybrid', won: '2018, 2019, 2020', photo: 'toyota_ts050_hybrid', flag: '🇯🇵',
          text: 'The car that finally won Le Mans for Toyota, and the holder of the fastest lap ever set here. This one won in 2018.' },
        { name: 'Ferrari 499P', won: '2023, 2024, 2025', car: 'Ferrari 499P', flag: '🇮🇹',
          text: 'Ferrari’s Hypercar, which won the 100th-birthday race in 2023 and the next two as well.' },
        { name: 'Toyota GR010 and TR010 Hybrid', won: '2021, 2022, 2026', photo: 'toyota_tr010', flag: '🇯🇵',
          text: 'Toyota’s Hypercar. It was called the GR010 when it won in 2021 and 2022. With a new body and a new name, TR010, it won again in 2026.' }
    ]
};

// ---------------------------------------------------------------- 7. Le Mans Quiz (in the Games tab)
// Each question: [question, right answer, [three wrong answers], explanation]. Twelve are picked for each game.
const LEMANS_QUIZ = [
    ['In which year was the first Le Mans 24 Hours held?', '1923', ['1903', '1936', '1949'], 'The first race was on 26 and 27 May 1923.'],
    ['About how long is one lap of the Le Mans circuit today?', '13.6 km (8.5 miles)', ['4.3 km (2.7 miles)', '7 km (4.3 miles)', '21 km (13 miles)'], 'One lap is 13.626 km, one of the longest laps in motor racing.'],
    ['How is the winner of Le Mans decided?', 'The car that goes furthest in 24 hours', ['The car with the fastest single lap', 'The first car to finish 500 laps', 'The car that makes the fewest pit stops'], 'The race lasts 24 hours, and the car that has covered the greatest distance wins.'],
    ['Which driver has won Le Mans the most times?', 'Tom Kristensen', ['Jacky Ickx', 'Derek Bell', 'Fernando Alonso'], 'Tom Kristensen of Denmark won nine times between 1997 and 2013.'],
    ['Which car maker has won Le Mans the most times?', 'Porsche', ['Ferrari', 'Audi', 'Toyota'], 'Porsche has won 19 times. Audi has 13 wins and Ferrari has 12.'],
    ['What were the rich British drivers who won for Bentley in the 1920s called?', 'The Bentley Boys', ['The Flying Scotsmen', 'The Le Mans Lions', 'The Silver Arrows'], 'The Bentley Boys won four times in a row, from 1927 to 1930.'],
    ['Which British car won Le Mans three times in a row, from 1955 to 1957?', 'Jaguar D-Type', ['Bentley Speed Six', 'Aston Martin DB5', 'Lotus Elan'], 'The D-Type was built like an aeroplane and designed just to win Le Mans.'],
    ['How many times in a row did the Ford GT40 win Le Mans?', 'Four', ['Two', 'Three', 'Six'], 'GT40s won in 1966, 1967, 1968 and 1969.'],
    ['In 1969, how did Jacky Ickx protest about the dangerous running start?', 'He walked to his car', ['He started in reverse', 'He refused to race', 'He ran to the wrong car'], 'He walked across the track and did up his seat belts properly. He still won the race.'],
    ['Which car gave Porsche its first overall Le Mans win, in 1970?', 'Porsche 917', ['Porsche 911', 'Porsche 956', 'Porsche 959'], 'Hans Herrmann and Richard Attwood won in a 917.'],
    ['What was added to the Mulsanne Straight in 1990 to slow the cars down?', 'Two chicanes', ['A tunnel', 'A banked curve', 'Speed bumps'], 'The chicanes split the 6 km straight into three shorter parts.'],
    ['What is the highest speed ever recorded at Le Mans, set by the WM P88 in 1988?', '252 mph (405 km/h)', ['180 mph (290 km/h)', '213 mph (343 km/h)', '300 mph (483 km/h)'], 'Roger Dorchy was timed at 405 km/h on the Mulsanne Straight.'],
    ['Which car is the only Le Mans winner with a rotary engine?', 'Mazda 787B', ['Jaguar XJR-9', 'Audi R8', 'Toyota TS050 Hybrid'], 'The Mazda 787B won in 1991. It was also the first win for a Japanese maker.'],
    ['What was special about the McLaren F1 GTR’s win in 1995?', 'It was based on a road car and won at its first try', ['It was the first electric winner', 'It ran on diesel', 'It had only one driver'], 'It beat purpose-built racing prototypes in a very wet race.'],
    ['In 2006, the Audi R10 TDI became the first car with which kind of engine to win Le Mans?', 'Diesel', ['Electric', 'Rotary', 'Steam'], 'Its V12 diesel engine won three years in a row.'],
    ['Which maker won the 100th-birthday race in 2023?', 'Ferrari', ['Toyota', 'Porsche', 'Peugeot'], 'The Ferrari 499P won. It was Ferrari’s first Le Mans win since 1965.'],
    ['Which maker won the Le Mans 24 Hours in 2026?', 'Toyota', ['Ferrari', 'BMW', 'Cadillac'], 'The number 7 Toyota TR010 Hybrid won, ending three wins in a row for Ferrari.'],
    ['What is the top class of car at Le Mans called today?', 'Hypercar', ['LMGT3', 'LMP2', 'Group C'], 'Hypercar has been the top class since 2021.'],
    ['How many drivers share each car at Le Mans today?', 'Three', ['One', 'Two', 'Five'], 'They take turns, and no one may drive for more than 14 of the 24 hours.'],
    ['What must happen to the engine while a car is being refuelled in the pits?', 'It must be switched off', ['It must be kept at full revs', 'It must be covered with a blanket', 'It must be cooled with ice'], 'It is safer, and it means every car must be able to restart again and again.'],
    ['What is the speed limit in a "slow zone" at Le Mans?', '50 mph (80 km/h)', ['10 mph (16 km/h)', '100 mph (161 km/h)', '150 mph (241 km/h)'], 'Slow zones keep marshals safe while they clear up one part of the track.'],
    ['The Mulsanne Straight is unusual for a racetrack. Why?', 'For most of the year it is a public road', ['It is made of wood', 'It runs through a tunnel', 'It is paved with bricks'], 'Part of the Le Mans circuit is made of public roads that are closed for the race.']
];
