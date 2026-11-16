/**
 * First-draft content.
 *
 * Two kinds of content live here:
 *  1. SAMPLE items (sample: true). Invented so the screens have something to show.
 *     They are labeled "Sample" in the app and must never ship in a store build.
 *  2. Curated items with a source and a "last checked" date (resources), and
 *     ecosystem articles marked status: 'draft' until a person verifies them.
 *
 * No real resident data belongs in this file.
 */
import type {
  Alert,
  Article,
  AssociationDoc,
  CapitalMeasure,
  CommunityEvent,
  DecisionContent,
  GardenFact,
  GardenStep,
  HelpIdea,
  Invite,
  MonthTip,
  Office,
  Opportunity,
  Poll,
  Resource,
  ShareItem,
  StatMeasure,
} from './types';

/** A date some days from now at a set hour, so the draft never looks stale. */
export function fromNow(days: number, hour = 9, minute = 0, base: Date = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function buildAlerts(base = new Date()): Alert[] {
  return [
    {
      id: 'a-trail',
      kind: 'urgent',
      title: { en: 'Creek trail closed after heavy rain', es: 'Sendero del arroyo cerrado por lluvia fuerte' },
      body: {
        en: 'Water is over the low crossing. Please stay off the trail until it reopens. Never walk or drive through moving water.',
        es: 'El agua cubre el cruce bajo. Por favor no use el sendero hasta que vuelva a abrir. Nunca camine ni maneje por agua en movimiento.',
      },
      postedAt: fromNow(0, 7, 30, base),
      expiresAt: fromNow(2, 18, 0, base),
      sample: true,
    },
    {
      id: 'a-bulk',
      kind: 'notice',
      title: { en: 'Bulk item pickup is next week', es: 'La recolección de artículos grandes es la próxima semana' },
      body: {
        en: 'Set large items at the curb by 6:30 in the morning on your pickup day. Check the City schedule for your street.',
        es: 'Ponga los artículos grandes en la banqueta antes de las 6:30 de la mañana el día de su recolección. Revise el calendario de la Ciudad para su calle.',
      },
      postedAt: fromNow(-1, 12, 0, base),
      expiresAt: fromNow(8, 18, 0, base),
      sample: true,
    },
    {
      id: 'a-garden',
      kind: 'good',
      title: { en: 'Thirty neighbors came to the garden meeting', es: 'Treinta vecinos vinieron a la reunión del huerto' },
      body: {
        en: 'Thank you. The next step is finding a nonprofit sponsor. You can still add your name to the interest list.',
        es: 'Gracias. El siguiente paso es encontrar una organización patrocinadora. Todavía puede agregar su nombre a la lista de interés.',
      },
      postedAt: fromNow(-3, 15, 0, base),
      expiresAt: fromNow(14, 18, 0, base),
      sample: true,
    },
  ];
}

export function buildEvents(base = new Date()): CommunityEvent[] {
  return [
    {
      id: 'e-meeting',
      title: { en: 'Neighborhood association meeting', es: 'Reunión de la asociación de vecinos' },
      summary: { en: 'Everyone is welcome. Join in person or online.', es: 'Todos son bienvenidos. Asista en persona o en línea.' },
      details: {
        en: 'We will share garden news, hear from neighbors and plan winter events. Spanish interpretation is available. Light snacks provided.',
        es: 'Compartiremos noticias del huerto, escucharemos a los vecinos y planearemos eventos de invierno. Hay interpretación en español. Habrá refrigerios.',
      },
      startsAt: fromNow(3, 18, 30, base),
      endsAt: fromNow(3, 20, 0, base),
      place: { en: 'School cafeteria (sample place)', es: 'Cafetería de la escuela (lugar de ejemplo)' },
      category: 'meeting',
      onlineLink: 'https://example.org/sample-meeting-link',
      phone: '512-555-0100',
      openToAll: true,
      capital: ['civic', 'social'],
      goingCount: 18,
      sample: true,
    },
    {
      id: 'e-creek',
      title: { en: 'Creek cleanup morning', es: 'Mañana de limpieza del arroyo' },
      summary: { en: 'Gloves and bags provided. All ages with an adult.', es: 'Damos guantes y bolsas. Todas las edades con un adulto.' },
      details: {
        en: 'Meet at the park entrance. Wear closed shoes and bring water. We will work for about two hours and sort what we find for recycling.',
        es: 'Nos vemos en la entrada del parque. Use zapatos cerrados y traiga agua. Trabajaremos unas dos horas y separaremos lo reciclable.',
      },
      startsAt: fromNow(6, 9, 0, base),
      endsAt: fromNow(6, 11, 0, base),
      place: { en: 'Park entrance (sample place)', es: 'Entrada del parque (lugar de ejemplo)' },
      category: 'nature',
      openToAll: true,
      capital: ['natural', 'social'],
      goingCount: 11,
      sample: true,
    },
    {
      id: 'e-garden',
      title: { en: 'Garden planning session', es: 'Sesión de planeación del huerto' },
      summary: { en: 'Help choose what to build first.', es: 'Ayude a decidir qué construir primero.' },
      details: {
        en: 'We will look at the drawings, talk about rain tanks and list the materials neighbors can donate. No gardening experience needed.',
        es: 'Veremos los planos, hablaremos de los tanques de lluvia y haremos una lista de materiales que los vecinos pueden donar. No necesita experiencia.',
      },
      startsAt: fromNow(10, 10, 0, base),
      endsAt: fromNow(10, 11, 30, base),
      place: { en: 'Proposed garden site on Hermitage Drive', es: 'Sitio propuesto del huerto en Hermitage Drive' },
      category: 'garden',
      openToAll: true,
      capital: ['natural', 'social', 'human'],
      goingCount: 9,
      sample: true,
    },
    {
      id: 'e-swap',
      title: { en: 'Seed and plant swap', es: 'Intercambio de semillas y plantas' },
      summary: { en: 'Bring seeds, cuttings or just yourself.', es: 'Traiga semillas, esquejes o solo venga.' },
      details: {
        en: 'Take home native plants and vegetable starts. Neighbors will show how to save seed. Free.',
        es: 'Llévese plantas nativas y plántulas de verduras. Los vecinos mostrarán cómo guardar semillas. Gratis.',
      },
      startsAt: fromNow(13, 16, 0, base),
      endsAt: fromNow(13, 18, 0, base),
      place: { en: 'Neighborhood park (sample place)', es: 'Parque del vecindario (lugar de ejemplo)' },
      category: 'community',
      openToAll: true,
      capital: ['natural', 'cultural'],
      goingCount: 14,
      sample: true,
    },
    {
      id: 'e-story',
      title: { en: 'Story hour in the park', es: 'Hora de cuentos en el parque' },
      summary: { en: 'Stories in English and Spanish for young children.', es: 'Cuentos en inglés y español para niños pequeños.' },
      details: {
        en: 'Bring a blanket. Books from the share shelf will be out to borrow. A parent or guardian stays with each child.',
        es: 'Traiga una cobija. Habrá libros del estante para compartir. Un padre o tutor se queda con cada niño.',
      },
      startsAt: fromNow(20, 17, 30, base),
      endsAt: fromNow(20, 18, 30, base),
      place: { en: 'Park pavilion (sample place)', es: 'Pabellón del parque (lugar de ejemplo)' },
      category: 'family',
      openToAll: true,
      capital: ['cultural', 'human'],
      goingCount: 7,
      sample: true,
    },
    {
      id: 'e-yule',
      title: { en: 'Yule Crawl', es: 'Recorrido de Yule' },
      summary: { en: 'A winter walk from porch to porch.', es: 'Un paseo de invierno de porche en porche.' },
      details: {
        en: 'Neighbors host warm drinks and treats on their porches. Walk the route at your own pace. Hosts sign up through an invite.',
        es: 'Los vecinos ofrecen bebidas calientes y bocadillos en sus porches. Camine la ruta a su ritmo. Los anfitriones se anotan con una invitación.',
      },
      startsAt: fromNow(33, 18, 0, base),
      endsAt: fromNow(33, 20, 30, base),
      place: { en: 'Starts at the park (sample place)', es: 'Empieza en el parque (lugar de ejemplo)' },
      category: 'community',
      openToAll: true,
      capital: ['social', 'cultural'],
      goingCount: 26,
      sample: true,
    },
  ];
}

/**
 * Ecosystem articles. General stewardship guidance for Central Texas, written
 * as drafts. Each needs a named local reviewer and a source before it is
 * marked verified. Do not add local facts or numbers without a source.
 */
export const articles: Article[] = [
  {
    id: 'creek',
    section: 'creek',
    title: { en: 'Our creek and where the rain goes', es: 'Nuestro arroyo y a dónde va la lluvia' },
    summary: { en: 'What runs off our streets ends up in the creek.', es: 'Lo que corre por nuestras calles termina en el arroyo.' },
    body: [
      {
        en: 'When it rains, water runs off roofs, driveways and streets into storm drains. Storm drains lead to the nearest creek. That water is not cleaned first.',
        es: 'Cuando llueve, el agua corre por techos, entradas y calles hacia las alcantarillas pluviales. Esas alcantarillas llevan al arroyo más cercano. Esa agua no se limpia antes.',
      },
      {
        en: 'Little Walnut Creek runs through our part of Austin. Everything that washes into it, from litter to lawn chemicals to motor oil, moves downstream to other neighborhoods and wildlife.',
        es: 'El arroyo Little Walnut pasa por nuestra parte de Austin. Todo lo que llega a él, desde basura hasta químicos de jardín y aceite de motor, sigue río abajo hacia otros vecindarios y la vida silvestre.',
      },
      {
        en: 'Plants along a creek bank hold the soil, slow floodwater and shade the water. A creek edge that looks a little wild is doing its job.',
        es: 'Las plantas en la orilla del arroyo sostienen la tierra, frenan las crecidas y dan sombra al agua. Una orilla que se ve un poco silvestre está haciendo su trabajo.',
      },
    ],
    action: { en: 'This week: pick up litter near one storm drain on your street.', es: 'Esta semana: recoja la basura cerca de una alcantarilla de su calle.' },
    sourceName: 'City of Austin Watershed Protection',
    sourceUrl: 'https://www.austintexas.gov/watershed-protection/programs/land-and-vegetation-management',
    status: 'draft',
  },
  {
    id: 'plants',
    section: 'plants',
    title: { en: 'Native plants belong here', es: 'Las plantas nativas son de aquí' },
    summary: { en: 'They need less water and feed local wildlife.', es: 'Necesitan menos agua y alimentan a la vida silvestre local.' },
    body: [
      {
        en: 'Native plants grew here long before our streets did. Once they settle in, most need little watering and no fertilizer.',
        es: 'Las plantas nativas crecían aquí mucho antes que nuestras calles. Una vez establecidas, la mayoría necesita poco riego y nada de fertilizante.',
      },
      {
        en: 'Local bees, butterflies and birds depend on them for food and shelter. A yard with even a few native plants becomes part of a larger habitat.',
        es: 'Las abejas, mariposas y aves locales dependen de ellas para comer y refugiarse. Un jardín con unas pocas plantas nativas ya forma parte de un hábitat más grande.',
      },
      {
        en: 'Plants in the community garden plan include agarita, sotol, coral honeysuckle, crossvine, Turk’s cap, American beautyberry and Mexican plum.',
        es: 'El plan del huerto comunitario incluye agarita, sotol, madreselva coral, bignonia, malvavisco (Turk’s cap), callicarpa americana y ciruelo mexicano.',
      },
    ],
    action: { en: 'This season: plant one native. Fall is the best planting time in Central Texas.', es: 'Esta temporada: plante una nativa. El otoño es la mejor época para plantar en el centro de Texas.' },
    status: 'draft',
  },
  {
    id: 'trees',
    section: 'trees',
    title: { en: 'Trees and shade', es: 'Árboles y sombra' },
    summary: { en: 'Shade cools our homes and streets.', es: 'La sombra refresca nuestras casas y calles.' },
    body: [
      {
        en: 'A shaded street can feel many degrees cooler than a bare one. Trees also slow rain, hold soil and give birds a place to nest.',
        es: 'Una calle con sombra se siente varios grados más fresca que una sin árboles. Los árboles también frenan la lluvia, sostienen la tierra y dan a las aves un lugar para anidar.',
      },
      {
        en: 'Young trees need deep watering through their first summers. Keep mulch a few inches back from the trunk.',
        es: 'Los árboles jóvenes necesitan riego profundo en sus primeros veranos. Mantenga el mantillo a unos centímetros del tronco.',
      },
      {
        en: 'To help prevent oak wilt, avoid pruning oak trees from February through June.',
        es: 'Para ayudar a prevenir el marchitamiento del roble, evite podar robles de febrero a junio.',
      },
    ],
    action: { en: 'This week: water a young tree slowly for ten minutes.', es: 'Esta semana: riegue un árbol joven despacio por diez minutos.' },
    status: 'draft',
  },
  {
    id: 'wildlife',
    section: 'wildlife',
    title: { en: 'Pollinators and wildlife', es: 'Polinizadores y vida silvestre' },
    summary: { en: 'Small changes make a yard a home for them.', es: 'Pequeños cambios hacen del jardín un hogar para ellos.' },
    body: [
      {
        en: 'Bees, butterflies and moths pollinate our gardens. They need flowers through the seasons and places to shelter.',
        es: 'Las abejas, mariposas y polillas polinizan nuestros jardines. Necesitan flores en cada estación y lugares para refugiarse.',
      },
      {
        en: 'Leaving some fallen leaves and a few dry stems over winter gives insects a place to rest. Skipping pesticides protects them and the birds that eat them.',
        es: 'Dejar algunas hojas caídas y unos tallos secos en invierno da a los insectos un lugar para descansar. Evitar pesticidas los protege a ellos y a las aves que se los comen.',
      },
      {
        en: 'Millions of birds fly over Texas at night in spring and fall. Turning off outdoor lights you do not need helps them stay on course.',
        es: 'Millones de aves vuelan sobre Texas de noche en primavera y otoño. Apagar las luces exteriores que no necesita les ayuda a mantener su rumbo.',
      },
    ],
    action: { en: 'Tonight: turn off one outdoor light you do not need.', es: 'Esta noche: apague una luz exterior que no necesite.' },
    status: 'draft',
  },
  {
    id: 'water',
    section: 'water',
    title: { en: 'Water wisely', es: 'Use el agua con cuidado' },
    summary: { en: 'Catch rain, water early, waste less.', es: 'Capture lluvia, riegue temprano, desperdicie menos.' },
    body: [
      {
        en: 'Watering early in the morning loses less to heat and wind. Deep watering less often grows stronger roots than a little every day.',
        es: 'Regar temprano en la mañana pierde menos agua por el calor y el viento. Regar profundo y con menos frecuencia da raíces más fuertes que un poco cada día.',
      },
      {
        en: 'A rain barrel or tank under a downspout stores free water for dry weeks. The proposed community garden is designed to run on rain alone, with about 5,200 gallons of storage.',
        es: 'Un barril o tanque bajo una bajante guarda agua gratis para las semanas secas. El huerto comunitario propuesto está diseñado para funcionar solo con lluvia, con unos 5,200 galones de almacenamiento.',
      },
      {
        en: 'Watering days and drought rules change. Check Austin Water for the current schedule.',
        es: 'Los días de riego y las reglas de sequía cambian. Consulte a Austin Water para el horario actual.',
      },
    ],
    action: { en: 'This week: check one outdoor faucet or hose for leaks.', es: 'Esta semana: revise si una llave o manguera exterior gotea.' },
    status: 'draft',
  },
  {
    id: 'soil',
    section: 'soil',
    title: { en: 'Soil and compost', es: 'Suelo y composta' },
    summary: { en: 'Healthy soil holds water and feeds plants.', es: 'Un suelo sano guarda agua y alimenta las plantas.' },
    body: [
      {
        en: 'Food scraps and yard trimmings can become compost instead of trash. Compost feeds soil life and helps soil hold water.',
        es: 'Los restos de comida y de jardín pueden volverse composta en lugar de basura. La composta alimenta la vida del suelo y le ayuda a guardar agua.',
      },
      {
        en: 'A layer of mulch or leaves over bare soil keeps it cooler and slows weeds.',
        es: 'Una capa de mantillo u hojas sobre la tierra descubierta la mantiene más fresca y frena las hierbas.',
      },
    ],
    action: { en: 'This week: cover one patch of bare soil with leaves or mulch.', es: 'Esta semana: cubra un pedazo de tierra descubierta con hojas o mantillo.' },
    status: 'draft',
  },
  {
    id: 'yard',
    section: 'yard',
    title: { en: 'Wildflower lawns, done right', es: 'Jardines de flores silvestres, bien hechos' },
    summary: { en: 'How to grow a meadow and stay within City rules.', es: 'Cómo cultivar una pradera y cumplir las reglas de la Ciudad.' },
    body: [
      {
        en: 'A lawn planted with native wildflowers and grasses uses less water and feeds pollinators. In Central Texas, sow wildflower seed in the fall.',
        es: 'Un jardín con flores y pastos nativos usa menos agua y alimenta a los polinizadores. En el centro de Texas, siembre semillas de flores silvestres en otoño.',
      },
      {
        en: 'City code can treat grass and weeds taller than 12 inches as a violation. There are exceptions for planned natural landscaping. Confirm the current rule with the City before you start.',
        es: 'El código de la Ciudad puede tratar el pasto y las hierbas de más de 12 pulgadas como una infracción. Hay excepciones para jardines naturales planeados. Confirme la regla actual con la Ciudad antes de empezar.',
      },
      {
        en: 'Show that your yard is cared for: mow a neat edge along the sidewalk, keep a clear path and add a small sign that says it is a wildflower or habitat garden.',
        es: 'Muestre que su jardín está cuidado: corte un borde limpio junto a la banqueta, mantenga un camino despejado y ponga un letrero pequeño que diga que es un jardín de flores silvestres o de hábitat.',
      },
      {
        en: 'Wait to mow in spring until the flowers have dropped their seed.',
        es: 'En primavera, espere a cortar hasta que las flores hayan soltado su semilla.',
      },
    ],
    action: { en: 'This month: choose one sunny strip to turn into a wildflower bed.', es: 'Este mes: elija una franja soleada para convertirla en un cantero de flores silvestres.' },
    status: 'draft',
  },
];

export const monthTips: MonthTip[] = [
  { month: 1, text: { en: 'Plant trees and shrubs while it is cool.', es: 'Plante árboles y arbustos mientras hace fresco.' } },
  { month: 1, text: { en: 'Finish pruning oak trees before February.', es: 'Termine de podar los robles antes de febrero.' } },
  { month: 1, text: { en: 'Plan your spring garden and order seeds.', es: 'Planee su huerto de primavera y pida semillas.' } },
  { month: 2, text: { en: 'Stop pruning oaks until July to help prevent oak wilt.', es: 'Deje de podar robles hasta julio para ayudar a prevenir el marchitamiento.' } },
  { month: 2, text: { en: 'Cut back last year’s dry stems late in the month.', es: 'Corte los tallos secos del año pasado a fin de mes.' } },
  { month: 2, text: { en: 'Check rain barrels and gutters before spring rains.', es: 'Revise barriles de lluvia y canaletas antes de las lluvias de primavera.' } },
  { month: 3, text: { en: 'Wildflowers are blooming. Wait to mow where they grow.', es: 'Las flores silvestres están floreciendo. Espere para cortar donde crecen.' } },
  { month: 3, text: { en: 'Turn off extra outdoor lights at night for migrating birds.', es: 'Apague luces exteriores de más en la noche para las aves migratorias.' } },
  { month: 3, text: { en: 'Check hoses and faucets for leaks.', es: 'Revise si las mangueras y llaves gotean.' } },
  { month: 4, text: { en: 'Let wildflowers drop their seed before you mow.', es: 'Deje que las flores silvestres suelten su semilla antes de cortar.' } },
  { month: 4, text: { en: 'Add mulch to garden beds before the heat.', es: 'Agregue mantillo a los canteros antes del calor.' } },
  { month: 4, text: { en: 'Keep outdoor lights off at night for migrating birds.', es: 'Mantenga apagadas las luces exteriores de noche para las aves migratorias.' } },
  { month: 5, text: { en: 'Water deeply and less often.', es: 'Riegue profundo y con menos frecuencia.' } },
  { month: 5, text: { en: 'Heavy rain can flood low crossings fast. Turn around, don’t drown.', es: 'La lluvia fuerte puede inundar los cruces bajos rápido. Dé la vuelta, no se ahogue.' } },
  { month: 5, text: { en: 'Clear litter from the storm drain on your street.', es: 'Quite la basura de la alcantarilla de su calle.' } },
  { month: 6, text: { en: 'Water early in the morning.', es: 'Riegue temprano en la mañana.' } },
  { month: 6, text: { en: 'Set out a shallow dish of water for birds and bees.', es: 'Ponga un plato poco profundo con agua para aves y abejas.' } },
  { month: 6, text: { en: 'Check on a neighbor during hot days.', es: 'Pregunte por un vecino en los días de calor.' } },
  { month: 7, text: { en: 'Let garden beds rest under a cover crop or mulch.', es: 'Deje descansar los canteros con un cultivo de cobertura o mantillo.' } },
  { month: 7, text: { en: 'Raise your mower blade. Taller grass shades its roots.', es: 'Suba la cuchilla de la podadora. El pasto más alto da sombra a sus raíces.' } },
  { month: 7, text: { en: 'Water young trees slowly and deeply.', es: 'Riegue los árboles jóvenes despacio y profundo.' } },
  { month: 8, text: { en: 'Plan your fall garden.', es: 'Planee su huerto de otoño.' } },
  { month: 8, text: { en: 'Keep water out for wildlife.', es: 'Siga dejando agua para la vida silvestre.' } },
  { month: 8, text: { en: 'Check on a neighbor during hot days.', es: 'Pregunte por un vecino en los días de calor.' } },
  { month: 9, text: { en: 'Plant fall vegetables.', es: 'Plante verduras de otoño.' } },
  { month: 9, text: { en: 'Turn off extra outdoor lights at night for migrating birds.', es: 'Apague luces exteriores de más en la noche para las aves migratorias.' } },
  { month: 9, text: { en: 'Clean gutters before fall rains.', es: 'Limpie las canaletas antes de las lluvias de otoño.' } },
  { month: 10, text: { en: 'Sow wildflower seed now for spring blooms.', es: 'Siembre semillas de flores silvestres ahora para que florezcan en primavera.' } },
  { month: 10, text: { en: 'Plant native trees and shrubs.', es: 'Plante árboles y arbustos nativos.' } },
  { month: 10, text: { en: 'Leave late flowers standing for migrating butterflies.', es: 'Deje las flores tardías en pie para las mariposas migratorias.' } },
  { month: 11, text: { en: 'Leave some fallen leaves. They shelter insects and feed the soil.', es: 'Deje algunas hojas caídas. Refugian insectos y alimentan el suelo.' } },
  { month: 11, text: { en: 'Plant a native tree while the soil is still warm.', es: 'Plante un árbol nativo mientras la tierra sigue tibia.' } },
  { month: 11, text: { en: 'Clean out rain barrels and gutters.', es: 'Limpie barriles de lluvia y canaletas.' } },
  { month: 12, text: { en: 'Cover tender plants on freezing nights.', es: 'Cubra las plantas delicadas en noches de helada.' } },
  { month: 12, text: { en: 'Add mulch around roots before hard freezes.', es: 'Ponga mantillo alrededor de las raíces antes de las heladas fuertes.' } },
  { month: 12, text: { en: 'Check on a neighbor during cold snaps.', es: 'Pregunte por un vecino durante las olas de frío.' } },
];

/**
 * Real programs. Each has an official link and the date it was last checked.
 * Re-check before launch; programs and amounts change.
 */
export const resources: Resource[] = [
  {
    id: 'r-hes',
    kind: 'rebate',
    title: { en: 'Home Energy Savings', es: 'Ahorro de energía en el hogar' },
    provider: 'Austin Energy',
    summary: {
      en: 'Rebates averaging $3,000 and 0% financing for whole-home energy improvements.',
      es: 'Reembolsos de $3,000 en promedio y financiamiento al 0% para mejoras de energía en toda la casa.',
    },
    who: { en: 'Austin Energy customers. See the program page for details.', es: 'Clientes de Austin Energy. Vea la página del programa para detalles.' },
    url: 'https://austinenergy.com/energy-efficiency/rebates-incentives/residential/home-improvements',
    verifiedOn: '2026-11-15',
    capital: 'financial',
  },
  {
    id: 'r-hes-essential',
    kind: 'rebate',
    title: { en: 'Home Energy Savings Essential', es: 'Ahorro de energía en el hogar: Esencial' },
    provider: 'Austin Energy',
    summary: {
      en: 'A lower-cost option with rebates averaging $1,500 to help your home use less energy.',
      es: 'Una opción de menor costo con reembolsos de $1,500 en promedio para que su casa use menos energía.',
    },
    who: { en: 'Austin Energy customers. See the program page for details.', es: 'Clientes de Austin Energy. Vea la página del programa para detalles.' },
    url: 'https://austinenergy.com/energy-efficiency/rebates-incentives/residential/home-improvements',
    verifiedOn: '2026-11-15',
    capital: 'financial',
  },
  {
    id: 'r-weather',
    kind: 'free',
    title: { en: 'Weatherization Assistance', es: 'Asistencia de climatización' },
    provider: 'Austin Energy',
    summary: {
      en: 'Free home energy improvements for customers who qualify.',
      es: 'Mejoras de energía gratis para clientes que califican.',
    },
    who: { en: 'Based on household income. Check the program page to see if you qualify.', es: 'Según el ingreso del hogar. Revise la página del programa para ver si califica.' },
    url: 'https://austinenergy.com/energy-efficiency/rebates-incentives/residential/home-improvements',
    verifiedOn: '2026-11-15',
    capital: 'financial',
  },
  {
    id: 'r-solar',
    kind: 'rebate',
    title: { en: 'Home solar rebate', es: 'Reembolso por paneles solares' },
    provider: 'Austin Energy',
    summary: {
      en: '$4,000 rebate per project for home solar systems larger than 3 kilowatts, since July 1, 2026.',
      es: 'Reembolso de $4,000 por proyecto para sistemas solares residenciales de más de 3 kilovatios, desde el 1 de julio de 2026.',
    },
    who: { en: 'Homeowners who install a qualifying system. See the announcement for rules.', es: 'Dueños de casa que instalen un sistema que califique. Vea el anuncio para las reglas.' },
    url: 'https://austinenergy.com/about/news/news-releases/2026/Austin-Energy-increases-solar-incentives-for-residential-and-commercial-customers',
    verifiedOn: '2026-11-15',
    capital: 'financial',
  },
  {
    id: 'r-screens',
    kind: 'rebate',
    title: { en: 'Solar screens rebate', es: 'Reembolso por mallas solares' },
    provider: 'Austin Energy',
    summary: {
      en: 'A rebate for installing energy-saving solar screens on your windows.',
      es: 'Un reembolso por instalar mallas solares que ahorran energía en sus ventanas.',
    },
    who: { en: 'Austin Energy customers. See the program page for details.', es: 'Clientes de Austin Energy. Vea la página del programa para detalles.' },
    url: 'https://austinenergy.com/energy-efficiency/rebates-incentives/residential/home-improvements',
    verifiedOn: '2026-11-15',
    capital: 'built',
  },
  {
    id: 'r-apf',
    kind: 'grant',
    title: { en: 'Neighborhood Grants for parks', es: 'Subvenciones vecinales para parques' },
    provider: 'Austin Parks Foundation',
    summary: {
      en: 'Grants of about $500 to $5,000 for community projects on City parkland.',
      es: 'Subvenciones de unos $500 a $5,000 para proyectos comunitarios en parques de la Ciudad.',
    },
    who: { en: 'Neighbor groups improving a City park.', es: 'Grupos de vecinos que mejoran un parque de la Ciudad.' },
    url: 'https://austinparks.org/neighborhood-grants/',
    verifiedOn: '2026-09',
    capital: 'natural',
  },
  {
    id: 'r-gardens',
    kind: 'program',
    title: { en: 'Community Gardens Program', es: 'Programa de huertos comunitarios' },
    provider: 'City of Austin Parks and Recreation',
    summary: {
      en: 'Helps residents start community gardens on City parkland. The permit has three phases and takes about a year.',
      es: 'Ayuda a los residentes a iniciar huertos comunitarios en parques de la Ciudad. El permiso tiene tres fases y toma cerca de un año.',
    },
    who: { en: 'Groups with at least four volunteer leaders from different households and a nonprofit sponsor.', es: 'Grupos con al menos cuatro líderes voluntarios de hogares distintos y una organización patrocinadora.' },
    url: 'https://www.austintexas.gov/parks-and-recreation/apply-start-community-garden-guide',
    verifiedOn: '2026-11-16',
    capital: 'natural',
  },
  {
    id: 'r-growzones',
    kind: 'program',
    title: { en: 'Grow Zones along creeks', es: 'Zonas de crecimiento junto a los arroyos' },
    provider: 'City of Austin Watershed Protection',
    summary: {
      en: 'A City program that lets plants grow back along creeks to protect the banks and the water.',
      es: 'Un programa de la Ciudad que deja crecer las plantas junto a los arroyos para proteger las orillas y el agua.',
    },
    who: { en: 'Everyone can learn about it. Ask the City about volunteering.', es: 'Todos pueden informarse. Pregunte a la Ciudad sobre el voluntariado.' },
    url: 'https://www.austintexas.gov/watershed-protection/programs/land-and-vegetation-management',
    verifiedOn: '2026-09',
    capital: 'natural',
  },
];

export const helpIdeas: HelpIdea[] = [
  { id: 'h1', time: 'minutes', text: { en: 'Say hello and learn one neighbor’s name.', es: 'Salude y aprenda el nombre de un vecino.' } },
  { id: 'h2', time: 'minutes', text: { en: 'Roll a neighbor’s trash cart back from the curb.', es: 'Regrese el bote de basura de un vecino desde la banqueta.' } },
  { id: 'h3', time: 'minutes', text: { en: 'Share this app with someone who is new on your street.', es: 'Comparta esta aplicación con alguien nuevo en su calle.' } },
  { id: 'h4', time: 'hour', text: { en: 'Offer a ride to an association meeting.', es: 'Ofrezca llevar a alguien a una reunión de la asociación.' } },
  { id: 'h5', time: 'hour', text: { en: 'Help a neighbor read a City notice or fill out a rebate form.', es: 'Ayude a un vecino a leer un aviso de la Ciudad o llenar un formulario de reembolso.' } },
  { id: 'h6', time: 'hour', text: { en: 'Lend a tool through the share shelf.', es: 'Preste una herramienta en el estante para compartir.' } },
  { id: 'h7', time: 'ongoing', text: { en: 'Become a block captain and deliver flyers on your street.', es: 'Sea capitán de cuadra y reparta volantes en su calle.' } },
  { id: 'h8', time: 'ongoing', text: { en: 'Deliver flowers with Flowers for Neighbors.', es: 'Entregue flores con Flores para Vecinos.' } },
  { id: 'h9', time: 'ongoing', text: { en: 'Translate notices so more neighbors can read them.', es: 'Traduzca avisos para que más vecinos puedan leerlos.' } },
];

export const shareItems: ShareItem[] = [
  { id: 's-drill', category: 'tool', title: { en: 'Cordless drill with bits', es: 'Taladro inalámbrico con brocas' }, condition: { en: 'Works well', es: 'Funciona bien' }, status: 'available', mine: false, sample: true },
  { id: 's-ladder', category: 'tool', title: { en: 'Six-foot step ladder', es: 'Escalera de tijera de seis pies' }, condition: { en: 'Sturdy', es: 'Firme' }, status: 'available', mine: false, sample: true },
  { id: 's-digger', category: 'tool', title: { en: 'Post-hole digger', es: 'Excavadora de hoyos para postes' }, condition: { en: 'Well used', es: 'Muy usada' }, status: 'lent', mine: false, sample: true },
  { id: 's-barrow', category: 'tool', title: { en: 'Wheelbarrow', es: 'Carretilla' }, condition: { en: 'Good', es: 'Buena' }, status: 'available', mine: false, sample: true },
  { id: 's-plants', category: 'book', title: { en: 'Guide to Texas native plants', es: 'Guía de plantas nativas de Texas' }, condition: { en: 'Like new', es: 'Como nueva' }, status: 'available', mine: false, sample: true },
  { id: 's-bilingual', category: 'book', title: { en: 'Bilingual picture books (set of 8)', es: 'Libros ilustrados bilingües (juego de 8)' }, condition: { en: 'Good', es: 'Buenos' }, status: 'available', mine: false, sample: true },
  { id: 's-cook', category: 'book', title: { en: 'Vegetable garden cookbook', es: 'Libro de cocina del huerto' }, condition: { en: 'Good', es: 'Bueno' }, status: 'lent', mine: false, sample: true },
  { id: 's-puzzle', category: 'toy', title: { en: '1,000-piece wildflower puzzle', es: 'Rompecabezas de flores silvestres de 1,000 piezas' }, condition: { en: 'All pieces', es: 'Completo' }, status: 'available', mine: false, sample: true },
  { id: 's-blocks', category: 'toy', title: { en: 'Wooden building blocks', es: 'Bloques de madera para construir' }, condition: { en: 'Good', es: 'Buenos' }, status: 'available', mine: false, sample: true },
  { id: 's-games', category: 'toy', title: { en: 'Family board games (3)', es: 'Juegos de mesa familiares (3)' }, condition: { en: 'Good', es: 'Buenos' }, status: 'available', mine: false, sample: true },
];

export const opportunities: Opportunity[] = [
  {
    id: 'v-flyers',
    title: { en: 'Walk flyers down your street', es: 'Reparta volantes en su calle' },
    summary: { en: 'Deliver welcome flyers with household codes to about 20 doors.', es: 'Entregue volantes de bienvenida con códigos de hogar en unas 20 puertas.' },
    when: { en: 'Any evening this month', es: 'Cualquier tarde de este mes' },
    duration: { en: 'About 45 minutes', es: 'Unos 45 minutos' },
    capital: 'social',
    sample: true,
  },
  {
    id: 'v-creek',
    title: { en: 'Creek cleanup crew', es: 'Equipo de limpieza del arroyo' },
    summary: { en: 'Pick up litter along the trail with other neighbors.', es: 'Recoja basura en el sendero con otros vecinos.' },
    when: { en: 'Saturday morning', es: 'Sábado en la mañana' },
    duration: { en: '2 hours', es: '2 horas' },
    capital: 'natural',
    sample: true,
  },
  {
    id: 'v-translate',
    title: { en: 'Translate a notice', es: 'Traduzca un aviso' },
    summary: { en: 'Help put one association notice into Spanish or Arabic.', es: 'Ayude a pasar un aviso de la asociación al español o al árabe.' },
    when: { en: 'From home, any time', es: 'Desde casa, a cualquier hora' },
    duration: { en: '30 minutes', es: '30 minutos' },
    capital: 'cultural',
    sample: true,
  },
  {
    id: 'v-welcome',
    title: { en: 'Welcome table at the meeting', es: 'Mesa de bienvenida en la reunión' },
    summary: { en: 'Greet neighbors and help them sign in.', es: 'Reciba a los vecinos y ayúdeles a registrarse.' },
    when: { en: 'Next association meeting', es: 'Próxima reunión de la asociación' },
    duration: { en: '1 hour', es: '1 hora' },
    capital: 'civic',
    sample: true,
  },
  {
    id: 'v-build',
    title: { en: 'Garden build day', es: 'Día de construcción del huerto' },
    summary: { en: 'Help build raised beds once the City permit is approved.', es: 'Ayude a construir los canteros cuando se apruebe el permiso de la Ciudad.' },
    when: { en: 'Date to be set', es: 'Fecha por definir' },
    duration: { en: 'Half a day', es: 'Medio día' },
    capital: 'natural',
    sample: true,
  },
];

export function buildInvites(base = new Date()): Invite[] {
  return [
    {
      id: 'i-playdate',
      title: { en: 'Saturday playdate at the park', es: 'Tarde de juegos el sábado en el parque' },
      host: { en: 'A neighbor on your block (sample)', es: 'Un vecino de su cuadra (ejemplo)' },
      startsAt: fromNow(5, 10, 0, base),
      place: { en: 'Park playground', es: 'Juegos del parque' },
      note: { en: 'Kids ages 5 to 9. Bring a snack to share.', es: 'Niños de 5 a 9 años. Traiga un bocadillo para compartir.' },
      sample: true,
    },
    {
      id: 'i-yule',
      title: { en: 'Host a porch stop on the Yule Crawl?', es: '¿Ser anfitrión de una parada en el Recorrido de Yule?' },
      host: { en: 'Events coordinator (sample)', es: 'Coordinación de eventos (ejemplo)' },
      startsAt: fromNow(33, 18, 0, base),
      place: { en: 'Your porch', es: 'Su porche' },
      note: { en: 'Offer a warm drink or a treat for an hour.', es: 'Ofrezca una bebida caliente o un bocadillo por una hora.' },
      sample: true,
    },
  ];
}

export const sampleDecisions: { daysAgo: number; content: DecisionContent }[] = [
  {
    daysAgo: 80,
    content: {
      summary: { en: 'Set a regular meeting every three months, with an online option.', es: 'Fijar una reunión cada tres meses, con opción en línea.' },
      outcome: { en: 'Approved', es: 'Aprobado' },
    },
  },
  {
    daysAgo: 52,
    content: {
      summary: { en: 'Send a letter of support for the community garden proposal.', es: 'Enviar una carta de apoyo a la propuesta del huerto comunitario.' },
      outcome: { en: 'Approved', es: 'Aprobado' },
    },
  },
  {
    daysAgo: 20,
    content: {
      summary: { en: 'Adopt privacy principles for the neighborhood app: opt-in sharing, no selling of data.', es: 'Adoptar principios de privacidad para la aplicación: compartir solo con permiso, sin venta de datos.' },
      outcome: { en: 'Approved', es: 'Aprobado' },
    },
  },
];

export function buildPolls(base = new Date()): Poll[] {
  return [
    {
      id: 'p-first',
      question: { en: 'Which should we organize first?', es: '¿Qué deberíamos organizar primero?' },
      options: [
        { en: 'Tool share kickoff', es: 'Inicio del préstamo de herramientas' },
        { en: 'Creek cleanup', es: 'Limpieza del arroyo' },
        { en: 'Seed and plant swap', es: 'Intercambio de semillas y plantas' },
      ],
      counts: [21, 34, 17],
      closesAt: fromNow(9, 20, 0, base),
      sample: true,
    },
  ];
}

/** Measures we plan to show. Values come from public data and are not filled in yet. */
export const statMeasures: StatMeasure[] = [
  {
    id: 'households',
    label: { en: 'Households', es: 'Hogares' },
    why: { en: 'Tells us how many neighbors the app should reach.', es: 'Nos dice a cuántos vecinos debe llegar la aplicación.' },
    action: { en: 'Become a block captain', es: 'Sea capitán de cuadra' },
  },
  {
    id: 'renters',
    label: { en: 'Homes rented and owned', es: 'Viviendas rentadas y propias' },
    why: { en: 'Renters and owners need different resources.', es: 'Quienes rentan y quienes son dueños necesitan recursos distintos.' },
    action: { en: 'See resources for renters and owners', es: 'Vea recursos para inquilinos y dueños' },
  },
  {
    id: 'languages',
    label: { en: 'Languages spoken at home', es: 'Idiomas que se hablan en casa' },
    why: { en: 'Shows which languages our notices should use.', es: 'Muestra en qué idiomas deben estar nuestros avisos.' },
    action: { en: 'Volunteer to translate', es: 'Ofrézcase para traducir' },
  },
  {
    id: 'income',
    label: { en: 'Typical household income', es: 'Ingreso típico del hogar' },
    why: { en: 'Helps match neighbors with rebates and free programs.', es: 'Ayuda a conectar a los vecinos con reembolsos y programas gratuitos.' },
    action: { en: 'See rebates and free programs', es: 'Vea reembolsos y programas gratuitos' },
  },
  {
    id: 'ages',
    label: { en: 'Children and older adults', es: 'Niños y adultos mayores' },
    why: { en: 'Guides events, safety and visiting programs.', es: 'Orienta los eventos, la seguridad y los programas de visitas.' },
    action: { en: 'Join Flowers for Neighbors', es: 'Únase a Flores para Vecinos' },
  },
  {
    id: 'canopy',
    label: { en: 'Tree shade', es: 'Sombra de árboles' },
    why: { en: 'Shade lowers heat and energy bills.', es: 'La sombra baja el calor y las cuentas de luz.' },
    action: { en: 'Read about trees and shade', es: 'Lea sobre árboles y sombra' },
  },
  {
    id: 'parks',
    label: { en: 'Homes near a park', es: 'Viviendas cerca de un parque' },
    why: { en: 'Green space supports health and community.', es: 'Los espacios verdes apoyan la salud y la comunidad.' },
    action: { en: 'See the garden project', es: 'Vea el proyecto del huerto' },
  },
  {
    id: 'energy',
    label: { en: 'Home energy use', es: 'Uso de energía en casa' },
    why: { en: 'Shows where efficiency programs could save the most.', es: 'Muestra dónde los programas de eficiencia podrían ahorrar más.' },
    action: { en: 'See energy rebates', es: 'Vea reembolsos de energía' },
  },
];

export const capitalMeasures: CapitalMeasure[] = [
  { id: 'c-events', capital: 'social', label: { en: 'Events held this year', es: 'Eventos este año' }, value: 14, unit: { en: 'events', es: 'eventos' }, how: { en: 'Come to the next one', es: 'Venga al próximo' }, sample: true },
  { id: 'c-hours', capital: 'human', label: { en: 'Volunteer hours offered', es: 'Horas de voluntariado ofrecidas' }, value: 186, unit: { en: 'hours', es: 'horas' }, how: { en: 'Offer one hour', es: 'Ofrezca una hora' }, sample: true },
  { id: 'c-traditions', capital: 'cultural', label: { en: 'Neighborhood traditions', es: 'Tradiciones del vecindario' }, value: 3, unit: { en: 'each year', es: 'cada año' }, how: { en: 'Help host one', es: 'Ayude a organizar una' }, sample: true },
  { id: 'c-natives', capital: 'natural', label: { en: 'Native plants planted together', es: 'Plantas nativas sembradas juntos' }, value: 60, unit: { en: 'plants', es: 'plantas' }, how: { en: 'Plant one this season', es: 'Plante una esta temporada' }, sample: true },
  { id: 'c-garden', capital: 'built', label: { en: 'Garden project steps finished', es: 'Pasos terminados del huerto' }, value: 1, unit: { en: 'of 5', es: 'de 5' }, how: { en: 'Join the interest list', es: 'Únase a la lista de interés' }, sample: true },
  { id: 'c-shared', capital: 'financial', label: { en: 'Items on the share shelf', es: 'Artículos en el estante para compartir' }, value: 23, unit: { en: 'items', es: 'artículos' }, how: { en: 'Lend something', es: 'Preste algo' }, sample: true },
  { id: 'c-meetings', capital: 'civic', label: { en: 'Association meetings held', es: 'Reuniones de la asociación' }, value: 4, unit: { en: 'this year', es: 'este año' }, how: { en: 'Come to the next meeting', es: 'Venga a la próxima reunión' }, sample: true },
];

/** From the garden proposal documents in the Project. It is a proposal, not an approved plan. */
export const gardenFacts: GardenFact[] = [
  { id: 'g1', text: { en: '12 raised plots. Two are wheelchair height.', es: '12 canteros elevados. Dos son a la altura de una silla de ruedas.' } },
  { id: 'g2', text: { en: 'Shared rows along the fence grow food for neighbors in need.', es: 'Los surcos compartidos junto a la cerca dan comida para vecinos que la necesitan.' } },
  { id: 'g3', text: { en: 'A flower border by the street that anyone may pick from.', es: 'Un borde de flores junto a la calle del que cualquiera puede cortar.' } },
  { id: 'g4', text: { en: 'Runs on rain. Roofs fill about 5,200 gallons of storage. No City water or electricity.', es: 'Funciona con lluvia. Los techos llenan unos 5,200 galones de almacenamiento. Sin agua de la Ciudad ni electricidad.' } },
  { id: 'g5', text: { en: 'Built mostly from salvaged materials. Every existing tree stays.', es: 'Construido en su mayoría con materiales recuperados. Todos los árboles existentes se quedan.' } },
  { id: 'g6', text: { en: 'Later phases restore native plants in the park around it.', es: 'Las fases siguientes restauran plantas nativas en el parque que lo rodea.' } },
  { id: 'g7', text: { en: 'Plots are sliding scale ($0 to $60 a year) or work-trade. Households without a yard come first.', es: 'Los canteros tienen costo según sus posibilidades ($0 a $60 al año) o intercambio por trabajo. Los hogares sin jardín tienen prioridad.' } },
];

export const gardenSteps: GardenStep[] = [
  { id: 'gs1', title: { en: 'Gather interest', es: 'Reunir interés' }, note: { en: 'The City needs four leaders from different households and a list of interested gardeners.', es: 'La Ciudad pide cuatro líderes de hogares distintos y una lista de personas interesadas.' }, state: 'now' },
  { id: 'gs2', title: { en: 'Find a nonprofit sponsor', es: 'Encontrar una organización patrocinadora' }, note: { en: 'The sponsor provides liability insurance for the garden.', es: 'La organización da el seguro de responsabilidad para el huerto.' }, state: 'next' },
  { id: 'gs3', title: { en: 'City permit', es: 'Permiso de la Ciudad' }, note: { en: 'Three phases. About a year on average.', es: 'Tres fases. Cerca de un año en promedio.' }, state: 'next' },
  { id: 'gs4', title: { en: 'Build days', es: 'Días de construcción' }, note: { en: 'Volunteers build beds, paths and the rain system.', es: 'Los voluntarios construyen canteros, caminos y el sistema de lluvia.' }, state: 'next' },
  { id: 'gs5', title: { en: 'Garden opens', es: 'El huerto abre' }, note: { en: 'Open to the public at least once a month.', es: 'Abierto al público al menos una vez al mes.' }, state: 'next' },
];

export const offices: Office[] = [
  { id: 'o-president', title: { en: 'President', es: 'Presidencia' } },
  { id: 'o-vice', title: { en: 'Vice President', es: 'Vicepresidencia' } },
  { id: 'o-secretary', title: { en: 'Secretary', es: 'Secretaría' } },
  { id: 'o-treasurer', title: { en: 'Treasurer', es: 'Tesorería' } },
];

export const associationDocs: AssociationDoc[] = [
  { id: 'd-bylaws', title: { en: 'Bylaws', es: 'Estatutos' }, available: false },
  { id: 'd-minutes', title: { en: 'Meeting minutes', es: 'Actas de reuniones' }, available: false },
  { id: 'd-guidelines', title: { en: 'Community guidelines', es: 'Normas de la comunidad' }, available: false },
  { id: 'd-privacy', title: { en: 'Privacy policy', es: 'Política de privacidad' }, available: false },
];
