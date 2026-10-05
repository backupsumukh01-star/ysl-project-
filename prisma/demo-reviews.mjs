/** Deterministic sample reviews for Rouge Sur Mesure. Not customer testimonials. */

const FAMILIES = ["Red", "Pink", "Orange", "Nude", "Warm Red", "Warm Nude", "Cool Nude"];

const pools = [
  {
    locale: "us",
    first: ["Emily", "Olivia", "Maya", "Sofia", "Ava", "Hannah", "Grace", "Nora", "Natalie", "Harper", "Ella", "Zoe", "Lily", "Abigail", "Stella", "Audrey"],
    last: ["Carter", "Bennett", "Thompson", "Martinez", "Mitchell", "Brooks", "Reed", "Foster", "Hughes", "Coleman", "Rivera", "Ward", "Price", "Barnes", "Powell", "Jenkins"],
  },
  {
    locale: "uk",
    first: ["Amelia", "Freya", "Sophie", "Isla", "Poppy", "Harriet", "Imogen", "Maisie", "Florence", "Matilda", "Esme", "Beatrice", "Phoebe", "Rosie", "Niamh", "Aoife"],
    last: ["Clarke", "Collins", "Morgan", "Harrison", "Walsh", "Byrne", "Murphy", "Doyle", "Shaw", "Atkinson", "Reid", "Fraser", "Gallagher", "O'Connor", "Quinn", "Murray"],
  },
  {
    locale: "fr",
    first: ["Camille", "Élodie", "Manon", "Claire", "Léa", "Chloé", "Inès", "Juliette", "Margaux", "Anaïs", "Pauline", "Louise", "Zoé", "Océane", "Agathe", "Victoire"],
    last: ["Laurent", "Martin", "Bernard", "Dubois", "Moreau", "Petit", "Roux", "Fontaine", "Chevalier", "Blanc", "Girard", "Mercier", "Faure", "Renard", "Lambert", "Bonnet"],
  },
  {
    locale: "it",
    first: ["Giulia", "Chiara", "Francesca", "Alessia", "Martina", "Giorgia", "Aurora", "Noemi", "Elisa", "Valentina", "Irene", "Gaia", "Bianca", "Serena", "Ludovica", "Greta"],
    last: ["Romano", "Conti", "Moretti", "Ricci", "Greco", "Lombardi", "Ferrari", "Esposito", "Bianchi", "Costa", "Gallo", "Rizzo", "Marino", "De Luca", "Vitale", "Serra"],
  },
  {
    locale: "es",
    first: ["Lucía", "Elena", "Carmen", "Marta", "Paula", "Alba", "Claudia", "Marina", "Natalia", "Raquel", "Nuria", "Inés", "Laia", "Vega", "Ainhoa", "Jimena"],
    last: ["García", "Navarro", "Torres", "Romero", "Sánchez", "Ortega", "Vargas", "Molina", "Iglesias", "Delgado", "Herrera", "Cruz", "Reyes", "Flores", "Cabrera", "Pardo"],
  },
  {
    locale: "de",
    first: ["Anna", "Leonie", "Clara", "Lena", "Marie", "Johanna", "Greta", "Emilia", "Lina", "Paula", "Luisa", "Amelie", "Frieda", "Mara", "Ida", "Marlene"],
    last: ["Schneider", "Weber", "Hoffmann", "Fischer", "Wagner", "Becker", "Schulz", "Keller", "Richter", "Wolf", "Krüger", "Neumann", "Schwarz", "Braun", "Vogel", "Lehmann"],
  },
  {
    locale: "uk",
    first: ["Sanne", "Lotte", "Fleur", "Noor", "Isa", "Julia", "Eva", "Anne", "Tess", "Roos", "Mila", "Nina", "Famke", "Bente", "Lieke", "Anouk"],
    last: ["de Vries", "Jansen", "Bakker", "Visser", "de Jong", "Smit", "Meijer", "de Boer", "Mulder", "Vos", "Dekker", "Bos", "van Dijk", "Hendriks", "Peters", "Kuipers"],
  },
  {
    locale: "us",
    first: ["Astrid", "Freja", "Elsa", "Ingrid", "Linnea", "Maja", "Alma", "Saga", "Eira", "Sigrid", "Tuva", "Klara", "Liv", "Hedda", "Signe", "Thea"],
    last: ["Larsen", "Nielsen", "Andersson", "Berg", "Lindström", "Hansen", "Johansen", "Dahl", "Holm", "Nyström", "Eriksen", "Virtanen", "Lindberg", "Solberg", "Aalto", "Strand"],
  },
  {
    locale: "us",
    first: ["Ananya", "Riya", "Aarushi", "Nisha", "Meera", "Isha", "Kavya", "Diya", "Aditi", "Saanvi", "Pooja", "Neha", "Tanvi", "Shruti", "Kiara", "Myra"],
    last: ["Mehta", "Shah", "Kapoor", "Patel", "Reddy", "Iyer", "Nair", "Gupta", "Joshi", "Banerjee", "Chopra", "Malhotra", "Desai", "Rao", "Kulkarni", "Bose"],
  },
  {
    locale: "us",
    first: ["Layla", "Mariam", "Nour", "Leila", "Amira", "Yasmin", "Dana", "Rania", "Farah", "Salma", "Dina", "Reem", "Huda", "Lama", "Tala", "Zeina"],
    last: ["Hassan", "Khalil", "Haddad", "Mansour", "Nasser", "Farouk", "Saleh", "Abboud", "Darwish", "Hamdan", "Aziz", "Karim", "Fadel", "Osman", "Sharif", "Nassar"],
  },
  {
    locale: "us",
    first: ["Amelia", "Siti", "Nurul", "Linh", "Dewi", "Priya", "Thao", "Nadia", "Putri", "Clarissa", "Jia", "Alya", "Intan", "Mai", "Hanh", "Wulan"],
    last: ["Tan", "Lim", "Rahma", "Santos", "Nguyen", "Wijaya", "Abdullah", "Ong", "Teo", "Bautista", "Tran", "Chua", "Pham", "Halim", "Chong", "Santoso"],
  },
  {
    locale: "us",
    first: ["Yuna", "Hana", "Mei", "Sora", "Hina", "Aoi", "Minji", "Eunji", "Xia", "Yui", "Haruka", "Jiwoo", "Sakura", "Nao", "Haeun", "Minseo"],
    last: ["Kim", "Park", "Lin", "Sato", "Takahashi", "Nakamura", "Choi", "Jung", "Wang", "Liu", "Yamamoto", "Kobayashi", "Kang", "Huang", "Ito", "Chen"],
  },
  {
    locale: "uk",
    first: ["Mia", "Charlotte", "Matilda", "Ruby", "Willow", "Evie", "Sienna", "Amber", "Lucy", "Harper", "Pippa", "Nell", "Tilly", "Bonnie", "Edie", "Lacey"],
    last: ["Wilson", "Anderson", "Taylor", "Campbell", "Walker", "Harris", "Young", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Kelly", "Bennett", "Ross"],
  },
  {
    locale: "us",
    first: ["Valentina", "Camila", "Isabela", "Mariana", "Beatriz", "Larissa", "Fernanda", "Juliana", "Gabriela", "Amanda", "Bruna", "Renata", "Carolina", "Luiza", "Helena", "Alice"],
    last: ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Rodrigues", "Almeida", "Ferreira", "Gomes", "Ribeiro", "Carvalho", "Araujo", "Barbosa", "Melo", "Dias", "Castro"],
  },
  {
    locale: "us",
    first: ["Amina", "Fatou", "Adwoa", "Kemi", "Tolu", "Ife", "Amara", "Ngozi", "Ada", "Efua", "Abena", "Zainab", "Nana", "Chiamaka", "Ayo", "Sefi"],
    last: ["Diallo", "Mensah", "Okonkwo", "Traoré", "Diop", "Boateng", "Adeyemi", "Owusu", "Kamara", "Bello", "Sow", "Conteh", "Jallow", "Sesay", "Abebe", "Balogun"],
  },
  {
    locale: "fr",
    first: ["Florence", "Maëlle", "Justine", "Rosalie", "Laurence", "Amélie", "Jeanne", "Agathe", "Émilie", "Margot", "Léonie", "Éva", "Colette", "Simone", "Aude", "Noémie"],
    last: ["Tremblay", "Gagnon", "Roy", "Côté", "Bouchard", "Gauthier", "Morin", "Lavoie", "Fortin", "Ouellet", "Pelletier", "Bélanger", "Lévesque", "Bergeron", "Leblanc", "Girard"],
  },
];

const lowReviews = {
  1: [
    { family: "", title: "More steps than I wanted", body: "I thought I would click a shade and go. The pairing and the first priming took long enough that I went back to the lipstick already in my bag. The case itself is handsome. The routine just did not suit me." },
    { family: "Nude", title: "Not the nude I had in mind", body: "I chose Nude because that is what I wear most days. On my mouth the mix looked cooler than the swatch I was aiming for, and I never landed on a tone I actually wanted to leave the house in." },
    { family: "", title: "The app slowed me down", body: "The device is fine in the hand. Getting the app to stay connected was the part I dreaded. I had to stand there with the cap off while it tried again, and I gave up before the shade was worth the wait." },
    { family: "Pink", title: "Hard to restock the one I liked", body: "Pink was the only family that looked right on me. When that set ran low I could not find a refill that matched what I was using, so the whole thing stalled. I do not want a second project just to replace a cartridge." },
    { family: "", title: "Fiddly to clean", body: "The brush puts the color on nicely. Cleaning it afterward is the part I kept postponing. It is a small thing, and it was still enough that the device stayed on the shelf." },
    { family: "", title: "The box arrived tired", body: "The parcel took a beating. The black box had a crushed corner and the lid did not sit flush. The device inside was unmarked, but the unboxing was the opposite of what the packaging is trying to be." },
    { family: "Orange", title: "I never got past the learning part", body: "Orange sounded fun until I had to learn the chambers, the app, and how much to mix. After three tries I still did not trust the result. I would rather a bullet I already understand." },
    { family: "Warm Nude", title: "Looked different once it was on", body: "Warm Nude read peach in the app and slightly muddy on me. I adjusted it twice. Neither pass looked like the color I had tapped. Maybe another person would love that shift. I did not." },
    { family: "", title: "Delivery dragged", body: "The order itself was clear. The parcel was not. It sat in transit longer than I had planned around, and by the time it showed up I was already annoyed. The product did not get a fair mood from me after that." },
    { family: "", title: "A lot of object for one mouth", body: "It is a considered object, and I can see the appeal if you like switching color. I do not. I want one reliable lip color and no cartridges to keep straight. This was the wrong kind of product for me." },
    { family: "Cool Nude", title: "My everyday tone was missing", body: "Cool Nude was the closest of the three I picked, and it still was not the beige-rose I wear to work. The other two families were pretty and useless to me. I should have chosen differently. I also wish the range felt wider." },
    { family: "Red", title: "Red never looked like my red", body: "I bought it mostly for Red. The mixes were either too sharp or too brown, and I could not coax out the blue-red I had in my head. After a week I stopped opening the app." },
  ],
  2: [
    { family: "", title: "Pretty object, awkward habit", body: "The monogram lid is lovely and it feels solid. Using it on a morning when I have ten minutes was awkward. I can imagine someone enjoying the ritual. I mostly felt behind." },
    { family: "Pink", title: "Pink was close, the rest less so", body: "One Pink mix was genuinely flattering. The other shades I tried from the same set wandered off what I asked for. I kept the one and ignored the rest, which is a lot of unused formula." },
    { family: "", title: "Setup asked for patience I did not have", body: "Nothing was broken. I was just impatient. Caps off, cartridges seated, app talking to the device, then a mix. By the end I had color on the brush and no desire to do it again tomorrow." },
    { family: "", title: "Price sits heavily", body: "I knew it was a premium device before I ordered. Living with it, the price still feels high for something I have to practice. The finish can look expensive. The habit has not earned that yet." },
    { family: "Nude", title: "Nude needed more range for me", body: "Nude covered a few beiges and then stopped where my skin actually sits. I got one wearable option and several that pulled gray. A traditional nude lipstick would have been simpler." },
    { family: "", title: "The brush is the fussy part", body: "Color comes out in a small portion, which I like. The brush then needs a proper clean or the next shade picks up the last one. I smeared two attempts together before I noticed." },
    { family: "Warm Red", title: "Warm Red was muddier than I hoped", body: "I wanted a brick that still looked red in daylight. Warm Red gave me brown-reds that were interesting and not mine. Packaging and the case were nicer than the shades I managed." },
    { family: "", title: "App was the weak step", body: "Once the device is connected, choosing a color is clear enough. Getting there took two evenings. Bluetooth dropped once mid-mix and I had to start that shade over." },
    { family: "Orange", title: "Fun for a weekend, not my week", body: "Orange made a cheerful coral I wore once to dinner. It is not a color I repeat, and the other families I chose did not become a daily either. I am left with a device I admire and rarely open." },
    { family: "", title: "Parcel was late and dented", body: "It arrived four days after I expected, with a crease in the outer box. Everything inside was intact. The delay plus the crumpled box made the first impression worse than the product deserved." },
    { family: "", title: "I wanted fewer decisions", body: "Three families sounded generous until I had to remember which set was in the device. I like makeup that does not ask me to administrate it. This one does." },
    { family: "Cool Nude", title: "Cool Nude almost worked", body: "There was a rosewood tone I wore twice and liked. The lighter mixes disappeared on me. I am glad I tried it. I am not glad I spent this much to find one maybe." },
  ],
  3: [
    { family: "", title: "Even, once I slowed down", body: "The finish can look soft and even, which I did not expect from something I mix myself. The first week was clumsy. I still think it is too many steps for a Tuesday, and I still like the result when I bother." },
    { family: "Red", title: "Red is the reason it stays", body: "Red gave me a berry I could not find in a normal bullet, and also two mixes I wiped off. The device looks serious on a dresser. I am halfway convinced, not all the way." },
    { family: "", title: "Good gift, odd for me", body: "I bought it as a gift and tried it first. The box is presentation-ready. I personally prefer a single lipstick. The person I gave it to was more excited about choosing shades than I was." },
    { family: "Pink", title: "Pink worked, price still stings", body: "Pink landed closer than I feared, especially a muted rose. I cannot pretend the price felt casual. It is a considered buy that does one job in a complicated way." },
    { family: "", title: "App is clear, connection is not", body: "The shade screen is easy to read. The connection is the uneven part. Some mornings it is instant. One evening it failed until I closed the app. Color was fine when it worked." },
    { family: "Nude", title: "A wearable nude, eventually", body: "Nude took the most experimenting. I found a beige that suits office light and a few that did not. Setup is slower than a twist-up. The one good nude is why this is not a lower score." },
    { family: "", title: "Brush yes, cleanup no", body: "I like the retractable brush more than I expected. It lays color down without dragging. Cleaning it well enough to switch shades is the step I resent." },
    { family: "Orange", title: "Orange is brighter than my life", body: "The coral I mixed was pretty in the mirror and loud outside. I enjoyed playing with it on a free afternoon. I have not found an everyday shade in that family, so the device is a sometimes thing." },
    { family: "", title: "Case is better than my first shades", body: "Quilted lid, gold rim, the weight of it: that part feels finished. My first four mixes were not. After I watched the priming instead of rushing, one shade finally looked like the tile I chose." },
    { family: "Warm Nude", title: "Warm Nude flatters, then stops", body: "Caramel tones in Warm Nude suit me. I wanted a deeper brown-nude in the same set and did not get there. Lovely for the shades it does make. Limited if your taste sits at the edge." },
    { family: "", title: "Learning curve is real", body: "Day one I thought I had done something wrong. Day four I had a repeatable shade. I still would not call it quick. If you like fiddling, that curve is part of the fun. I only partly do." },
    { family: "", title: "Delivery was ordinary", body: "The parcel came when it came, no tracking excitement, no disaster. The product is more interesting than the shipping was. I am neutral on the wait and mixed on how often I will use the device." },
    { family: "Cool Nude", title: "Cool Nude needs a light hand", body: "A little of the cooler mix looks expensive. A little more looks chalky on me. I am learning the amount. I have not decided whether I will keep practicing." },
    { family: "", title: "I like the idea more than the pace", body: "Choosing a color for an outfit is the part I enjoy. Waiting on the device and then mixing with the brush makes me late. Both things are true." },
    { family: "Pink", title: "Pretty pinks, small complaints", body: "Two pinks looked fresh and one pulled purple in daylight. The app photo of the shade was more accurate than my memory of it. I would buy it again only on a day I felt patient." },
    { family: "Red", title: "Took practice, then a decent red", body: "My notes from the first try say too dark. The second red was the one I wore out. I still think a classic lipstick is easier. This one wins when I want a red I cannot name yet." },
    { family: "", title: "Solid, not simple", body: "Nothing feels cheap. The lid, the click of a cartridge, the brush. Using all of it well is a small skill. I am average at it so far." },
    { family: "", title: "Wish the refills were easier to plan", body: "I understand refills are separate. I still wish I could tell, without a hunt, which of my three families I can restock. The shades I like are good. The planning is not." },
    { family: "Warm Red", title: "Warm Red for evenings", body: "A brick tone from Warm Red looked right with a brown coat and wrong with a white shirt. So it stays an evening option. The device is capable. My wardrobe only meets it halfway." },
    { family: "", title: "Packaging promised more calm than I felt", body: "The black box is tidy and the lid is satisfying. Then I was at the table with caps and the app and a brush to wash. The contrast made the setup feel louder than it is." },
    { family: "Nude", title: "One nude I trust", body: "Out of several Nude attempts I trust one in photographs. The others were close and slightly off. That single success keeps it in my drawer." },
    { family: "", title: "Fine if you already like gadgets", body: "If you like a device and a phone working together, this will feel normal. I do not, really. The color can still look polished, which is the reason for the middle score." },
    { family: "Orange", title: "A coral I did not know I wanted", body: "I picked Orange to complete a set of three and then liked a soft coral more than my usual pink. The deeper oranges were too much. Half a win." },
    { family: "", title: "It grew on me slowly", body: "First impression: complicated. Third week: I have two saved shades and a better sense of the brush. I still hesitate on busy days. I no longer think I wasted the money." },
    { family: "Pink", title: "Neither love nor regret", body: "Pink gives me a nice daytime rose. The case looks right on a shelf. I clean the brush less often than I should. That is the whole review." },
  ],
};

const fiveLead = [
  "Exactly the softness I was hoping for",
  "A calm way to change lip color",
  "The shade landed where I wanted",
  "Easier after the second evening",
  "I keep it on the dresser now",
  "Nice weight in the hand",
  "The mix looked finished, not patchy",
  "Good for days when I change my mind",
  "The brush is the part I use most",
  "It fits the way I already get ready",
  "A small ritual I ended up liking",
  "The color looked like itself outside",
  "I was unsure, then I wasn't",
  "Pretty without looking overdone",
  "The case is as nice as the color",
  "Useful when an outfit needs a different lip",
  "I found a daytime shade and a louder one",
  "Setup is a one-time bit of attention",
  "The lid makes it feel like an object, not a tube",
  "I take it with me more than I expected",
  "Quietly impressive once you learn it",
  "My usual lipstick looks flat beside it",
  "I like choosing the depth myself",
  "It made a shade I could not find in a shop",
  "The first mix taught me the second",
  "Simple black and gold, then the color",
  "I use it when I have a little time",
  "The result looks considered",
  "A gift I ended up keeping",
  "Better on the lips than in my doubts",
  "I like how small the portion is",
  "It stays in my bag on long days",
  "The custom part is the point",
  "I stopped guessing at the counter",
  "A flattering finish in daylight",
  "I enjoy the trial more than I thought",
  "Neat on a vanity",
  "The color feels like mine",
  "Worth learning the clicks",
  "I have two looks from one device",
];

const fiveTail = [
  "especially on workdays",
  "once the cartridges were seated",
  "after I stopped rushing the mix",
  "in ordinary daylight",
  "with the brush it comes with",
  "when I actually followed the app",
  "for a dinner and for errands",
  "without looking costumey",
  "even in a small mirror",
  "on a week I wore three different coats",
  "after the priming finished",
  "better than my first impatient try",
  "and the box is handsome too",
  "if you like a precise color",
  "more than a single bullet lets me",
  "without a drawer full of tubes",
  "in the shade I kept returning to",
  "once I learned how much to mix",
  "and it still feels portable",
  "when I want a softer edge",
  "for photos and for the office",
  "with less product than I feared",
  "after a calm first setup",
  "and the routine got shorter",
  "in a color I can repeat",
  "without staining the case",
  "on mornings I leave the house early",
];

const fourLead = [
  "Lovely result, with a caveat",
  "Almost exactly my color",
  "Pretty, and a little fussy",
  "I like it, I also paused at the price",
  "Good shade, slow first use",
  "The finish won me over",
  "Close to what I pictured",
  "A nice object with one annoyance",
  "Wearable once I practiced",
  "Better on day three",
  "The color is the easy part",
  "I am glad I tried it",
  "Polished, not instant",
  "A strong result after a clumsy start",
  "It looks expensive, and it is",
  "I found my shade and one complaint",
  "Satisfying when I am not rushed",
  "The mix is prettier than the setup",
];

const fourTail = [
  "I wish the first connection were quicker",
  "the price is still a decision",
  "cleaning the brush takes an extra minute",
  "I wanted one more depth in the family I chose",
  "the box was slightly scuffed at a corner",
  "I need a quiet ten minutes, not two",
];

const opens = {
  5: [
    "I bought it to stop owning a lipstick for every mood.",
    "The closed case is plain in a way I like, matte black with that gold rim.",
    "I was nervous about seating three cartridges.",
    "It took one evening to feel ordinary.",
    "I use it when my coat changes and my mouth should too.",
    "The portion that comes out is small, which suits me.",
    "I like that the color is mixed for that moment.",
    "My first shade was close, and my second was the one I wore out.",
    "The brush lays it on in a thin, even coat.",
    "I keep the device by the mirror rather than in a makeup bag.",
    "It looks like a finished product, not a kit spread across the counter.",
    "I tried it on a Sunday and wore the same shade to work.",
    "The app shows the color clearly enough that I stop second-guessing.",
    "I really did not want a gadget. I wanted a lip color I could adjust.",
    "There is a click when a cartridge sits properly, and then it is easy.",
    "I made a softer version of a red I already like.",
    "It travels better than a stack of bullets.",
    "The black box is simple and the lid shuts properly.",
    "I gave myself a week before judging the shades.",
    "Daylight was kinder than my bathroom bulb.",
    "I like saving a shade and coming back to it.",
    "The weight is enough that it does not feel hollow.",
    "I used the camera match on a scarf and got something wearable.",
    "Mixing with the included brush is the step that makes it look finished.",
    "I was skeptical of the app and then used it without thinking.",
    "A friend asked what I was wearing. I had mixed it that morning.",
    "It replaced two lipsticks, not my entire drawer.",
    "I like how quiet the color looks in person.",
    "The monogram on the lid is small. I notice it anyway.",
    "I can deepen a shade without buying another tube.",
    "Setup is mostly caps, cartridges, and waiting for priming.",
    "I trust it more now that I have repeated one shade.",
  ],
  4: [
    "The color itself is lovely.",
    "I got a shade I am happy to wear in daylight.",
    "It looks polished once it is on.",
    "The case is the part guests notice first.",
    "I found a repeatable mix on the third try.",
    "The brush is better than the disposable ones I usually travel with.",
    "I like the idea of one device instead of several bullets.",
    "My favorite result was softer than the tile I tapped, in a good way.",
    "It feels like a proper object on the table.",
    "I wore it to a long lunch and did not feel the need to fix it every hour.",
    "The app is readable. I am not confused about which shade I saved.",
    "I appreciate that I can stay inside one family and still vary it.",
    "The finish sits evenly if I use less than I think I need.",
    "I would buy this again for the color, with my eyes open about the price.",
    "It took a weekend to stop feeling clumsy.",
    "The result photographs well, which I did not expect.",
    "I like the retractable brush more than the device, if I am honest.",
    "A muted mix became my weekday shade.",
  ],
};

const mids = {
  5: [
    "The first priming felt long because I watched it. After that I just let it finish.",
    "Choosing among the families was the only decision that required a minute.",
    "I seat the cartridges, open the app, and the rest is choosing how deep to go.",
    "What I like is being able to shift a color instead of hoping the shop light was honest.",
    "It is not faster than a lipstick I already know, though it is more specific.",
    "I keep a lighter mix for day and a deeper one for anything after six.",
    "The brush tip lines the edge and then I fill in. That order stopped the patchiness.",
    "Nothing about the case squeaks or feels loose.",
    "I was worried the custom part would look like a craft project. It does not.",
    "Cartridges click in and the app recognizes the set. That was the step I had overthought.",
    "I like experimenting on a tissue first, then on my mouth.",
    "The gold rim catches the light and the rest stays matte. It is a nice balance.",
    "I can throw it in a coat pocket without a pile of caps falling out.",
    "Once I understood which family did what, I stopped swapping them around.",
    "The shade I saved is the one I remake without staring at the screen.",
    "It makes getting dressed feel a little more deliberate, which I wanted.",
    "I used it with a navy knit and then with a cream shirt. Different mixes, same device.",
    "The included brush means I am not hunting for a lip brush that is somehow always dirty.",
    "I thought I would use one family. I use two.",
    "A slightly sheer layer looks more like me than a full opaque coat.",
    "The routine is short now. It was not short on night one.",
    "I like that additional trios exist if I want another family later.",
    "It feels premium because of the fit of the lid, not because anyone told me it was.",
    "I have shown it to two people by handing them the closed case first.",
  ],
  4: [
    "I do wish the first Bluetooth connection had been instant.",
    "The price is the part I still explain to myself.",
    "Cleaning the brush between shades is a real step, not a theoretical one.",
    "I would have liked one deeper option in the family I reached for most.",
    "My box had a small scuff on a corner. The device was fine.",
    "Give it ten quiet minutes the first time. Two minutes is not enough.",
    "Refills are a separate purchase, so I am more careful with the cartridges I like.",
    "The app is good and also one more thing to unlock.",
    "Delivery was a day later than I had loosely expected. Not dramatic, just noted.",
    "I still prefer a plain lipstick when I am walking out the door in a hurry.",
    "One mix looked righter in warm indoor light than on the street.",
    "The learning part is short, and it is still a learning part.",
  ],
};

const ends = {
  5: [
    "I reach for it on days when a single tube would have been a compromise.",
    "It has stayed in the rotation, which is the only test I trust.",
    "I would give one as a gift to someone who actually likes choosing color.",
    "The shade I wear most is one I would not have found by reading a name on a box.",
    "I am glad I did not judge it on the first mix alone.",
    "It feels portable enough for a weekend bag.",
    "I like the look more each time I bother to do it properly.",
    "This is the lip color I use when I want the rest of my face left alone.",
    "I have a morning shade now. That was the goal.",
    "It earns the space it takes up.",
    "I will keep the families I chose and learn those well before adding more.",
    "The result is pretty in a plain way. That is what I wanted.",
  ],
  4: [
    "I still use it several times a week.",
    "The caveat is small beside the shade I kept.",
    "I would tell a friend to expect a short learning curve and a good finish.",
    "It stays, with that one reservation.",
    "I am glad the color worked even if the start was slower.",
    "Worth it for me, not a casual add-on.",
  ],
};

const familyLines = [
  "I have been using the {family} cartridges most.",
  "The {family} trio is the one that stayed in the device.",
  "{family} gave me the mix I actually wear.",
  "Of the three I chose, {family} is the useful one.",
  "I keep coming back to {family}.",
  "{family} was a better match than I guessed at checkout.",
];

const familyCaveats = [
  "I like {family}, and I still wish that set went a step deeper.",
  "{family} is flattering, though one mix looked duller outside than in the app.",
  "The {family} shades are the ones I use, when I can restock them without a hunt.",
];

function mulberry32(seed) {
  let value = seed >>> 0;
  return function next() {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

function ratingPlan() {
  const counts = { 5: Math.round(1200 * 0.86), 4: Math.round(1200 * 0.1), 3: Math.round(1200 * 0.02), 2: Math.round(1200 * 0.01), 1: Math.round(1200 * 0.01) };
  while (Object.values(counts).reduce((sum, count) => sum + count, 0) > 1200) counts[5] -= 1;
  while (Object.values(counts).reduce((sum, count) => sum + count, 0) < 1200) counts[5] += 1;
  const points = () => counts[5] * 5 + counts[4] * 4 + counts[3] * 3 + counts[2] * 2 + counts[1];
  while (points() < 5760 && counts[4] > 0) {
    counts[4] -= 1;
    counts[5] += 1;
  }
  while (points() > 5760 && counts[5] > 0) {
    counts[5] -= 1;
    counts[4] += 1;
  }
  if (points() !== 5760) throw new Error(`Sample rating plan averages ${points() / 1200}, not 4.8.`);
  return counts;
}

function reviewerName(index) {
  const pool = pools[index % pools.length];
  const slot = Math.floor(index / pools.length);
  const name = `${pool.first[slot % pool.first.length]} ${pool.last[Math.floor(slot / pool.first.length) % pool.last.length]}`;
  return { name, locale: pool.locale };
}

function localise(text, locale) {
  if (locale !== "uk") return text;
  return text
    .replace(/\bcolors\b/g, "colours")
    .replace(/\bcolor\b/g, "colour")
    .replace(/\bfavorite\b/g, "favourite");
}

function applyQuirk(text, index) {
  if (index % 43 === 0) return text.replace("really ", "realy ");
  if (index % 53 === 0) return text.replace("though ", "tho ");
  if (index % 61 === 0 && text.startsWith("I ")) return `Tbh ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  return text;
}

const spareLines = [
  "I leave it on the dresser between uses.",
  "The lid still shuts the way it did on day one.",
  "I only mix what I plan to wear that day.",
  "A tissue test saved me from one muddy attempt.",
  "I have stopped buying a new bullet every time I get bored.",
  "It lives in the same tray as my earrings.",
  "I wipe the brush before I put it away.",
  "The gold rim is the detail people comment on.",
  "I use less product than I did with a stick.",
  "My weekday shade is quieter than the one I save for evenings.",
  "I let the priming finish now instead of tapping the screen.",
  "The black box is still the thing I store the cartridges in.",
  "I have a lighter mix for camera days.",
  "It takes less space than the three lipsticks it replaced.",
  "I check the shade in the window, not only the mirror.",
  "The click of the cartridge is how I know it is seated.",
  "I keep the brush extended only while I am using it.",
  "One saved shade is enough for most Mondays.",
  "I tried a deeper pass and went back to the softer one.",
  "The case does not open in my bag.",
  "I like the color better once it has sat for a minute.",
  "I mix a little, look, then add a touch more.",
  "It is the only lip color in my work bag.",
  "I still use a pencil on days I want a sharper edge.",
  "The portion is small enough that I do not feel wasteful.",
  "I have shown the closed case to people before the shade.",
  "Daylight is where I decide if a mix stays.",
  "I rotate two families and leave the third for weekends.",
  "The app tile and the lip are close, not identical, and that is fine.",
  "I got better at the amount after a few stained tissues.",
  "It feels calm once the cartridges are already in.",
  "I do not travel with every family, just the one I am wearing.",
  "A thin coat looks more like skin than a heavy one.",
  "I remake the same shade more often than I chase a new one.",
  "The routine fits after a shower, not in a taxi.",
  "I judge it by the shade I repeat, not the first experiment.",
  "Caps go back on as soon as the mix is done.",
  "I like it most with a simple face and a strong coat.",
  "The device stays closed on my desk between meetings.",
  "I have one mix I could describe to a friend and one I could not.",
  "It is slower than a twist-up and more exact.",
  "I stopped rushing after the second muddy shade.",
  "The brush tip is what I use for the cupid's bow.",
  "I keep a note in my phone of the shade I liked.",
  "Warm indoor light flatters it. I still check outside.",
  "I use it on days when I want the lip to do the work.",
  "The weight feels right in a coat pocket.",
  "I have not needed a separate lip brush.",
  "One family is doing more for me than I expected.",
  "I let it dry a moment before I drink anything.",
  "The result looks neat in a phone photo.",
  "I am picky about nudes, and I found one I wear.",
  "It replaced the lipstick I was repurchasing out of habit.",
  "I like having a softer option without owning another tube.",
  "The setup is a habit now, not a project.",
  "I still get a little thrill from a new mix, then I go back to my usual.",
  "It looks finished without a heavy line around the mouth.",
  "I take the caps off only when the app is already open.",
  "The shade I wear to the office is not the one I wear out.",
  "I have learned to stop at a sheer layer.",
  "It earns a place in the bag I actually carry.",
  "I trust the mix I have repeated four times.",
  "A quick blot and it looks softer, which I prefer.",
  "I keep the extra families in the box, not loose in a drawer.",
];

function claim(text, used, extras) {
  let next = text.trim();
  if (!used.has(next)) {
    used.add(next);
    return next;
  }
  for (const extra of extras) {
    next = `${text.trim()} ${extra}`;
    if (!used.has(next)) {
      used.add(next);
      return next;
    }
  }
  throw new Error(`Could not make a unique sample line from: ${text.slice(0, 80)}`);
}

function familySentence(family, index, critical) {
  const bank = critical ? familyCaveats : familyLines;
  return bank[index % bank.length].replaceAll("{family}", family);
}

function composeBody(rating, n, index, family, locale) {
  const shape = index % 9;
  const open = opens[rating][(n * 5 + index) % opens[rating].length];
  const mid = mids[rating][(n * 3 + index * 2) % mids[rating].length];
  const end = ends[rating][(n * 7 + index) % ends[rating].length];
  const familyText = family ? familySentence(family, index, rating === 4 && n % 2 === 0) : "";
  let parts = [];
  if (shape === 0) parts = [open];
  else if (shape === 1) parts = [open, mid];
  else if (shape === 2) parts = [open, mid, end];
  else if (shape === 3) parts = [mid, end];
  else if (shape === 4) parts = [open, end];
  else if (shape === 5) parts = familyText ? [open, familyText] : [open, mid];
  else if (shape === 6) parts = [end, open];
  else if (shape === 7) parts = [mid, open, end];
  else parts = familyText ? [open, mid, familyText] : [open, mid, end];
  if (familyText && !parts.includes(familyText) && shape % 2 === 0) parts.push(familyText);
  let text = parts.filter(Boolean).join(" ");
  text = localise(text, locale);
  text = applyQuirk(text, index);
  return text;
}

function composeTitle(rating, n) {
  if (rating === 5) {
    const lead = fiveLead[n % fiveLead.length];
    const step = Math.floor(n / fiveLead.length);
    if (step === 0) return lead;
    return `${lead}, ${fiveTail[(step - 1) % fiveTail.length]}`;
  }
  const lead = fourLead[n % fourLead.length];
  const step = Math.floor(n / fourLead.length);
  if (step === 0) return lead;
  return `${lead}, ${fourTail[(step - 1) % fourTail.length]}`;
}

function mediaFor(id, index, reviewDate) {
  if (index % 10 !== 0) return [];
  const createdAt = reviewDate;
  const base = `/images/reviews/demo/${id}`;
  if (index % 50 === 0) {
    return [
      {
        id: `${id}-m1`,
        type: "video",
        url: `${base}.mp4`,
        thumbnailUrl: `${base}-thumb.jpg`,
        caption: "",
        status: "APPROVED",
        createdAt,
      },
    ];
  }
  const photos = [
    {
      id: `${id}-m1`,
      type: "photo",
      url: `${base}.jpg`,
      thumbnailUrl: `${base}-thumb.jpg`,
      caption: "",
      status: "APPROVED",
      createdAt,
    },
  ];
  if (index % 50 === 10) {
    photos.push({
      id: `${id}-m2`,
      type: "photo",
      url: `${base}-2.jpg`,
      thumbnailUrl: `${base}-2-thumb.jpg`,
      caption: "",
      status: "APPROVED",
      createdAt,
    });
  }
  return photos;
}

function sequencedReviewDates(count) {
  const rng = mulberry32(0x4e455731);
  const start = Date.UTC(2022, 9, 4, 6, 0, 0);
  const end = Date.UTC(2026, 9, 4, 12, 0, 0);
  const dates = Array.from({ length: count }, () => {
    const date = new Date(start + Math.floor(rng() * (end - start)));
    date.setUTCHours(8 + Math.floor(rng() * 10), Math.floor(rng() * 60), Math.floor(rng() * 60), 0);
    return date;
  });
  dates.sort((a, b) => b.getTime() - a.getTime());
  dates[0] = new Date(end);
  dates[dates.length - 1] = new Date(start);
  for (let index = 1; index < dates.length; index += 1) {
    if (dates[index].getTime() >= dates[index - 1].getTime()) {
      dates[index] = new Date(dates[index - 1].getTime() - 60 * 60 * 1000);
    }
  }
  return dates;
}

function helpfulCount(rng) {
  const roll = rng();
  if (roll < 0.64) return Math.floor(rng() * 6);
  if (roll < 0.88) return 6 + Math.floor(rng() * 22);
  if (roll < 0.97) return 28 + Math.floor(rng() * 70);
  return 98 + Math.floor(rng() * 153);
}

export function buildDemoReviews() {
  const rng = mulberry32(0x51534c52);
  const counts = ratingPlan();
  const ratings = shuffle(
    [5, 4, 3, 2, 1].flatMap((rating) => Array.from({ length: counts[rating] }, () => rating)),
    rng,
  );
  const usedNames = new Set();
  const usedTitles = new Set();
  const usedBodies = new Set();
  const seen = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const titleExtras = ["in daylight", "on a weekday", "after practice", "for evenings", "with the brush", "once it clicked"];
  const dates = sequencedReviewDates(ratings.length);

  return ratings.map((rating, index) => {
    const person = reviewerName(index);
    if (usedNames.has(person.name)) throw new Error(`Duplicate sample name ${person.name}`);
    usedNames.add(person.name);
    const n = seen[rating];
    seen[rating] += 1;
    rng();
    rng();
    rng();
    const date = dates[index];
    const id = `demo-rsm-${String(index + 1).padStart(4, "0")}`;
    let family = "";
    let title = "";
    let body = "";
    if (rating <= 3) {
      const written = lowReviews[rating][n];
      family = written.family;
      title = claim(written.title, usedTitles, titleExtras);
      body = claim(localise(written.body, person.locale), usedBodies, spareLines);
    } else {
      family = index % 100 < 36 ? FAMILIES[index % FAMILIES.length] : "";
      title = claim(composeTitle(rating, n), usedTitles, titleExtras);
      body = claim(composeBody(rating, n, index, family, person.locale), usedBodies, spareLines);
    }
    return {
      id,
      reviewerName: person.name,
      rating,
      title,
      body,
      reviewDate: date.toISOString(),
      cartridgeFamily: family,
      helpfulCount: helpfulCount(rng),
      isDemo: true,
      verifiedPurchase: false,
      media: mediaFor(id, index, date.toISOString()),
    };
  });
}

export function summarizeDemoReviews(reviews) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let photos = 0;
  let videos = 0;
  let withMedia = 0;
  const days = new Map();
  for (const review of reviews) {
    counts[review.rating] += 1;
    const photoItems = review.media.filter((item) => item.type === "photo").length;
    const videoItems = review.media.filter((item) => item.type === "video").length;
    photos += photoItems;
    videos += videoItems;
    if (review.media.length) withMedia += 1;
    const day = review.reviewDate.slice(0, 10);
    days.set(day, (days.get(day) || 0) + 1);
  }
  const total = reviews.length;
  const points = reviews.reduce((sum, review) => sum + review.rating, 0);
  const busiest = Math.max(...days.values());
  return {
    total,
    points,
    average: total ? points / total : 0,
    counts,
    withMedia,
    photos,
    videos,
    busiestDay: busiest,
    firstDay: [...days.keys()].sort()[0],
    lastDay: [...days.keys()].sort().at(-1),
  };
}

export function printDemoReviewStats(stats) {
  console.log(`total reviews: ${stats.total}`);
  console.log(`average rating: ${(stats.points / stats.total).toFixed(3)} / 5`);
  for (const rating of [5, 4, 3, 2, 1]) console.log(`${rating}-star count: ${stats.counts[rating]}`);
  console.log(`reviews with media: ${stats.withMedia}`);
  console.log(`photo count: ${stats.photos}`);
  console.log(`video count: ${stats.videos}`);
}
