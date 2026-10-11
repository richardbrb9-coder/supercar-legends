// Decades for the timeline, and the production-car speed records.
// Checked on 11 October 2026. Speed records follow Wikipedia's "Production car speed record" list,
// which only counts cars that were properly tested; other famous speed runs are listed separately with notes.

const DECADES = [
    { key: '1960s', from: 1960, to: 1969, color: '#00B8D9', title: 'The birth of the supercar',
      intro: "In the 1960s fast road cars still mostly had their engines at the front. Then, in 1966, the Lamborghini Miura put a V12 engine behind the driver, like a racing car, and the supercar was born. Britain built beautiful GTs like the Jaguar E-Type and Aston Martin DB5, and Ford took on Ferrari at Le Mans.",
      key_cars: ['Lamborghini Miura', 'Jaguar E-Type', 'Aston Martin DB5', 'Ferrari 250 GTO', 'Ford GT40', 'Porsche 911'],
      record: 'Fastest tested production car: Lamborghini Miura P400S, 179.3 mph (288 km/h), tested in 1970.',
      motorsport: 'Ford GT40s won the Le Mans 24 Hours four years in a row, from 1966 to 1969, after Enzo Ferrari refused to sell his company to Ford.' },
    { key: '1970s', from: 1970, to: 1979, color: '#FF7043', title: 'The age of the wedge',
      intro: "Designers like Marcello Gandini and Giorgetto Giugiaro drew sharp, flat, wedge-shaped cars that looked like doorstops from the future. The Lamborghini Countach became the ultimate poster car. In 1973 an oil crisis made petrol scarce and expensive, which was hard for supercar makers.",
      key_cars: ['Lamborghini Countach', 'Lancia Stratos', 'Lotus Esprit', 'Porsche 911 Turbo (930)', 'BMW M1', 'Ferrari 365 GT4 BB'],
      record: "No tested production car beat the Miura P400S's 179.3 mph during the 1970s. Some makers claimed higher speeds, but tests didn't match the claims.",
      motorsport: 'The Porsche 917 gave Porsche its first overall Le Mans wins in 1970 and 1971, and the Lancia Stratos won the World Rally Championship in 1974, 1975 and 1976.' },
    { key: '1980s', from: 1980, to: 1989, color: '#AB47BC', title: 'Turbos and Group B',
      intro: "Turbochargers arrived in a big way. Wild Group B rally cars led to road cars like the Ferrari 288 GTO and Porsche 959, and the Ferrari F40 became the first production car claimed to beat 200 mph. Big 1980s posters featured the Testarossa and Countach.",
      key_cars: ['Ferrari F40', 'Porsche 959', 'Ferrari Testarossa', 'Ferrari 288 GTO', 'Ruf CTR Yellowbird', 'Audi Sport Quattro'],
      record: 'Porsche 959, 198 mph (1986), then the Ruf CTR "Yellowbird", 342 km/h (212 mph), tested in 1988.',
      motorsport: "In 1981 the McLaren MP4/1 became the first Formula 1 car with a carbon-fibre chassis. Group B rallying was cancelled after 1986, because the cars had become too fast and dangerous." },
    { key: '1990s', from: 1990, to: 1999, color: '#26A69A', title: 'Carbon fibre and the McLaren F1',
      intro: "Gordon Murray's McLaren F1 used a carbon-fibre chassis, a BMW V12 and a central driving seat, and became the fastest car in the world. Honda's NSX showed that supercars could also be reliable, and GT1 racing created road-going racers like the Mercedes CLK GTR.",
      key_cars: ['McLaren F1', 'Ferrari F50', 'Honda NSX', 'Jaguar XJ220', 'Bugatti EB110', 'Pagani Zonda'],
      record: 'McLaren F1. In 1998 an F1 with its rev limiter raised reached 240.1 mph (386 km/h).',
      motorsport: 'The McLaren F1 GTR won Le Mans at its first try in 1995. Porsche won Le Mans in 1998 with the 911 GT1.' },
    { key: '2000s', from: 2000, to: 2009, color: '#5C6BC0', title: 'The 250 mph club',
      intro: "Supercars got faster than ever. The Bugatti Veyron arrived with over 1,000 PS and a top speed above 250 mph. Small new companies like Koenigsegg, Pagani, Noble, Spyker, Ascari and Gumpert joined the old names, and the Ferrari Enzo brought Formula 1 ideas to the road.",
      key_cars: ['Bugatti Veyron', 'Ferrari Enzo', 'Porsche Carrera GT', 'Koenigsegg CCX', 'SSC Ultimate Aero', 'Lamborghini Murciélago'],
      record: 'Bugatti Veyron, 253.81 mph (2005), then the SSC Ultimate Aero, 256.14 mph (2007).',
      motorsport: "Bentley won Le Mans in 2003 with the Speed 8, its first win there since 1930. The Maserati MC12 won the FIA GT Championship." },
    { key: '2010s', from: 2010, to: 2019, color: '#FFB300', title: 'The hybrid holy trinity',
      intro: "In 2013 three hybrid hypercars arrived at once: the McLaren P1, Ferrari LaFerrari and Porsche 918 Spyder. People called them the 'holy trinity'. They used electric motors, like Formula 1 cars, to add even more speed. Electric hypercars like the Rimac Concept One appeared too.",
      key_cars: ['McLaren P1', 'LaFerrari', 'Porsche 918 Spyder', 'Lexus LFA', 'Koenigsegg Agera RS', 'Bugatti Chiron'],
      record: 'Bugatti Veyron Super Sport, 267.86 mph (2010), then the Koenigsegg Agera RS, 277.87 mph (2017).',
      motorsport: 'The Porsche 918 Spyder became the first road car to lap the Nürburgring in under 7 minutes (2013). The Ford GT won its class at Le Mans in 2016, 50 years after the GT40.' },
    { key: '2020s', from: 2020, to: 2029, color: '#E10600', title: 'Electric and hybrid hypercars',
      intro: "Hypercars now use batteries and electric motors to reach amazing speeds. The Rimac Nevera is all-electric, the Mercedes-AMG One uses a real Formula 1 engine, and the Aston Martin Valkyrie was designed with Formula 1 genius Adrian Newey. Hypercars race again at Le Mans in the new Hypercar class.",
      key_cars: ['Rimac Nevera', 'Mercedes-AMG One', 'Aston Martin Valkyrie', 'Ferrari F80', 'Bugatti Tourbillon', 'Gordon Murray T.50'],
      record: 'SSC Tuatara, 282.9 mph (2021). In 2025 the electric Yangwang U9 Xtreme from China claimed 308.4 mph at a test track in Germany.',
      motorsport: 'The Ferrari 499P won Le Mans in 2023, 2024 and 2025. In June 2026 Toyota won, ending Ferrari\'s run.' }
];

// Production-car speed records (Wikipedia's list of properly tested production cars)
// [year, car, mph, note]
const SPEED_RECORDS = [
    [1960, 'Aston Martin DB4 GT Zagato', 153.5, 'Tested by Autocar magazine in 1962.'],
    [1963, 'Iso Grifo GL 365', 161, 'Tested by Autocar in 1966.'],
    [1965, 'AC Cobra Mk III 427', 165, 'Tested by Car and Driver magazine.'],
    [1967, 'Lamborghini Miura P400', 171, 'Tested by Motor magazine in 1967.'],
    [1968, 'Ferrari 365 GTB/4 Daytona', 174, 'Tested by Autocar in 1971.'],
    [1969, 'Lamborghini Miura P400S', 179.3, 'Tested by Sport Auto in 1970.'],
    [1982, 'Lamborghini Countach LP500 S', 182, 'Tested by Auto, Motor und Sport.'],
    [1983, 'Ruf BTR', 189.5, '305 km/h, tested by Auto, Motor und Sport.'],
    [1986, 'Porsche 959', 198, 'Tested by Road & Track in 1987.'],
    [1987, 'Ruf CTR "Yellowbird"', 212.5, '342 km/h, tested at the Nardò ring in Italy in 1988.'],
    [1992, 'McLaren F1', 221, 'Listed at 221 mph as standard. A car with its rev limiter raised reached 240.1 mph in 1998.'],
    [1993, 'Dauer 962 Le Mans', 251.4, 'A road-legal version of a Le Mans racing car, measured in 1998.'],
    [2005, 'Bugatti Veyron', 253.81, 'Checked by German inspection officials in 2005.'],
    [2007, 'SSC Ultimate Aero', 256.14, 'Verified by Guinness World Records in 2007.'],
    [2010, 'Bugatti Veyron Super Sport', 267.86, 'Two-way average, 2010. Customer cars were limited to 258 mph.'],
    [2017, 'Koenigsegg Agera RS', 277.87, 'Two-way average on a closed road in Nevada, USA.'],
    [2021, 'SSC Tuatara', 282.9, 'Set in January 2021.']
];

// Famous speed runs that don't count in the list above, with the reason
const OTHER_SPEED_RUNS = [
    ['Hennessey Venom GT', 270.49, 2014, 'Run in one direction only, on the Space Shuttle runway in Florida.'],
    ['Bugatti Chiron Super Sport 300+', 304.77, 2019, 'The first car over 300 mph, but in one direction only, so not an official record.'],
    ['Rimac Nevera', 258, 2022, 'A record for an electric production car at the time.'],
    ['Yangwang U9 Xtreme', 308.4, 2025, "An electric car from China. The maker's claim, set at a test track in Papenburg, Germany."]
];
