// Motorsport stories: how racing created supercars. Each story has chapters and links to cars and people.
// Checked against Wikipedia and race reports on 11 October 2026.

const MOTORSPORT_STORIES = [
    { id: 'ford-v-ferrari', title: 'Ford v Ferrari', years: '1963–1969', color: '#1E88E5',
      intro: 'The richest car company in the world against the most famous racing team. A true story about pride, teamwork and a car that was only 40 inches tall.',
      chapters: [
        ['The deal that fell apart', 'In 1963 Henry Ford II tried to buy Ferrari. Ford wanted a famous racing name, and Enzo Ferrari needed money. But Enzo wanted to keep control of his racing team, so he pulled out of the deal. Henry Ford II was furious, and decided to beat Ferrari at its favourite race: the Le Mans 24 Hours, which Ferrari had won six years in a row, from 1960 to 1965.'],
        ['A head start from Lola', "Ford didn't start from nothing. Eric Broadley's small British company Lola had built the Lola Mk6, a low racing coupé with a Ford V8 in the middle. Ford used it as the starting point, and engineer Roy Lunn led the work on a new car: the GT40, named for its height of 40 inches."],
        ['Shelby and Miles', 'The first GT40s were fast but kept breaking. So Ford asked Carroll Shelby, who had won Le Mans as a driver, to take over. With his test driver and engineer Ken Miles, Shelby worked on the car until it could last 24 hours at full speed.'],
        ['1966: one, two, three', 'At Le Mans in 1966, GT40s finished first, second and third. Ford arranged for its cars to cross the line together for a photo. Because of the rules, the win went to Bruce McLaren and Chris Amon, and Ken Miles had to settle for second.'],
        ['Four in a row', 'Ford won again in 1967 with the GT40 Mk IV, which reached 213 mph on the long Mulsanne Straight. Then a private team, sponsored by Gulf Oil in its famous blue and orange, won in 1968 and 1969 with an older GT40. In 2019 the story became a film, Ford v Ferrari.']
      ],
      cars: ['Lola Mk6', 'Ford GT40', 'Ferrari 250 GTO', 'AC Shelby Cobra', 'Ford GT', 'Ford GT (2017)'],
      people: ['Henry Ford II', 'Enzo Ferrari', 'Eric Broadley', 'Roy Lunn', 'Carroll Shelby', 'Ken Miles', 'Bruce McLaren'] },

    { id: 'lotus', title: 'Colin Chapman and Lotus', years: '1952 to today', color: '#43A047',
      intro: '"Simplify, then add lightness." How one engineer showed the world that a light car can beat a powerful one.',
      chapters: [
        ['Building cars in a garage', 'Colin Chapman started Lotus in 1952, building racing cars in his spare time with a group of friends. He had studied engineering and knew how aircraft designers saved weight. He used the same ideas on cars.'],
        ['Light is fast', 'Chapman believed that a light car brakes later, corners faster and needs less power. He put it like this: adding power makes you faster on the straights, but adding lightness makes you faster everywhere. His Team Lotus won seven Formula 1 constructors’ titles.'],
        ['From the track to the road', 'Racing ideas went straight into Lotus road cars. The Elan of 1962 had a strong steel backbone with a light glass-fibre body. The wedge-shaped Esprit followed in 1976 and even became a James Bond submarine.'],
        ['The idea lives on', 'Chapman died in 1982, but his idea did not. The tiny Lotus Elise of 1996 used a frame of glued aluminium and weighed only about 725 kg. Today Lotus builds the Emira and the electric Evija.']
      ],
      cars: ['Lotus Elan', 'Lotus Esprit', 'Lotus Elise', 'Lotus Evora', 'Lotus Emira', 'Lotus Evija'],
      people: ['Colin Chapman'] },

    { id: 'homologation', title: 'Homologation specials', years: '1962–2004', color: '#7CB342',
      intro: 'Why do some of the wildest road cars exist? Because racing rules said they had to.',
      chapters: [
        ['What does homologation mean?', 'Many racing series were meant for cars that ordinary people could buy. So the rules said a car maker had to build a certain number of road versions before a racing version could compete. Making a car eligible like this is called homologation.'],
        ['Bending the rules', 'For the GT class in the early 1960s, 100 cars were meant to be built. Ferrari persuaded the officials to accept far fewer, and only 36 Ferrari 250 GTOs were made. The GTO won the GT world championship three years in a row.'],
        ['Rally monsters', 'The Lancia Stratos was built purely to win rallies, and about 492 road cars were made so it could compete. In the 1980s Group B rules needed 200 road cars, which gave us the Audi Sport Quattro, Ford RS200, Ferrari 288 GTO and Porsche 959. Group B was cancelled after 1986 because the cars had become too fast and dangerous.'],
        ['Le Mans racers on the road', 'In the 1990s the GT1 class allowed racing cars that looked almost like prototypes, as long as road versions existed. The result was road cars like the Mercedes CLK GTR and the Porsche 911 GT1, which won Le Mans in 1998. In 2004 the Maserati MC12 was built for the same reason.']
      ],
      cars: ['Ferrari 250 GTO', 'Lancia Stratos', 'BMW M1', 'Audi Sport Quattro', 'Ford RS200', 'Ferrari 288 GTO', 'Porsche 959', 'Nissan Skyline GT-R (R32)', 'Mercedes-Benz CLK GTR', 'Porsche 911 GT1', 'Maserati MC12'],
      people: ['Ferdinand Piëch', 'Roland Gumpert'] },

    { id: 'f1-to-road', title: 'Formula 1 on the road', years: '1981 to today', color: '#E10600',
      intro: 'Carbon fibre, paddle shifts, hybrid power and clever air flow. All of them were tested in Formula 1 before they reached supercars.',
      chapters: [
        ['Carbon fibre', 'In 1981 the McLaren MP4/1, designed by John Barnard, became the first Formula 1 car with a chassis made of carbon fibre: woven threads set in hard glue, very light but very strong. Ten years later, Gordon Murray used a carbon-fibre chassis for the McLaren F1 road car. Now almost every hypercar has one.'],
        ['Paddle shifts', 'Ferrari brought gear-change paddles behind the steering wheel to Formula 1 in 1989, so drivers could keep both hands on the wheel. Soon road cars had paddles too, like the Aston Martin Vanquish of 2001.'],
        ['Hybrid power', 'From 2009 Formula 1 cars could store energy when braking and use it again to speed up. This idea came to the road in the 2013 hybrid "holy trinity": the McLaren P1, Ferrari LaFerrari and Porsche 918 Spyder. The Mercedes-AMG One even uses a real Formula 1 hybrid engine.'],
        ['Air that pushes down', 'Racing cars use their shape to push themselves onto the road, which is called downforce. Formula 1 designer Adrian Newey helped design the Aston Martin Valkyrie, which has huge tunnels underneath. Gordon Murray’s T.50 uses a fan, an idea from his Brabham "fan car" of 1978.']
      ],
      cars: ['McLaren MP4/1', 'McLaren F1', 'Ferrari Enzo', 'McLaren P1', 'LaFerrari', 'Porsche 918 Spyder', 'Mercedes-AMG One', 'Aston Martin Valkyrie', 'Gordon Murray T.50', 'McLaren Senna'],
      people: ['Gordon Murray', 'Adrian Newey', 'Bruce McLaren'] },

    { id: 'le-mans', title: 'Winning Le Mans', years: '1970 to today', color: '#FFB300',
      intro: 'The Le Mans 24 Hours in France is the most famous endurance race in the world. Three drivers share one car and race through the day and night.',
      chapters: [
        ['Porsche’s first win', 'The mighty Porsche 917, with its flat-12 engine, gave Porsche its first overall win in 1970, and won again in 1971. Porsche has since won Le Mans more times than any other maker.'],
        ['A road car wins', 'In 1995 the McLaren F1 GTR, a racing version of a road car, won Le Mans at its first try and beat purpose-built prototypes. Three years later Porsche won with the 911 GT1.'],
        ['The Bentley Boys return', 'Bentley won Le Mans five times in the 1920s. In 2003 it came back with the Speed 8 and finished first and second.'],
        ['The Hypercar class', 'Since 2021 the top class at Le Mans has been called Hypercar. Ferrari returned with the 499P and won in 2023, 2024 and 2025. Aston Martin raced its Valkyrie there from 2025. In June 2026, Toyota won and ended Ferrari’s run.']
      ],
      cars: ['Porsche 917', 'McLaren F1', 'Porsche 911 GT1', 'Bentley Speed 8', 'Ford GT (2017)', 'Ferrari 499P', 'Aston Martin Valkyrie'],
      people: ['W. O. Bentley', 'Ferry Porsche', 'Ferdinand Piëch'] },

    { id: 'records', title: 'Lap times and top speeds', years: '1987 to today', color: '#00B8D9',
      intro: 'Car makers love to prove their cars are the fastest. Records are set on closed tracks or closed roads, by professional drivers with safety teams. Never try it on a normal road!',
      chapters: [
        ['The Green Hell', 'The Nürburgring Nordschleife in Germany is almost 21 km long, with more than 150 corners. Racing driver Jackie Stewart nicknamed it the Green Hell. A fast lap there proves a car can handle as well as go fast.'],
        ['Lap-time battles', 'In 2011 a Lexus LFA with the Nürburgring Package lapped in 7:14.64. In 2013 the Porsche 918 Spyder became the first road car under 7 minutes, with 6:57. Then the Mercedes-AMG One, with its Formula 1 engine, did 6:35.183 in 2022 and 6:29.090 in 2024.'],
        ['The race to 300 mph', 'The McLaren F1 reached 240.1 mph in 1998. The Bugatti Veyron beat 250 mph in 2005, and the Koenigsegg Agera RS averaged 277.87 mph in 2017. In 2019 a Bugatti Chiron became the first car past 300 mph, though only in one direction.'],
        ['The electric age', 'Electric hypercars are now some of the fastest cars of all. The Rimac Nevera set more than 20 records in a single day in 2023, and in 2025 the Chinese Yangwang U9 Xtreme claimed 308.4 mph.']
      ],
      cars: ['Lexus LFA', 'Porsche 918 Spyder', 'Mercedes-AMG One', 'McLaren F1', 'Bugatti Veyron', 'Koenigsegg Agera RS', 'Bugatti Chiron Super Sport 300+', 'Rimac Nevera'],
      people: ['Christian von Koenigsegg', 'Mate Rimac'] }
];
