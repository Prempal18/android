/* ============================================================
   Freebuff Español — Movie Spanish (10) + Popular Words (5)
   Mix of iconic movie lines and original movie-style scenes.
   Plain ES5/ES2015, no modules, runs from file://
   ============================================================ */
(function () {
  "use strict";

  var L = (window.LESSON_LIST = window.LESSON_LIST || []);
  var C = (window.COURSES = window.COURSES || []);

  function lesson(id, title, icon, exercises, scene) {
    var o = { id: id, title: title, icon: icon, exercises: exercises };
    if (scene) o.scene = scene;
    L.push(o);
  }
  function mc(q, c, a, sp) { return { t: "choice", q: q, c: c, a: a, sp: !!sp }; }
  function tr(q, a, from) { return { t: "translate", q: q, a: a, from: from || "en" }; }
  function ls(a, c) { var o = { t: "listen", a: a }; if (c) o.c = c; return o; }
  function mt(pairs) { return { t: "match", pairs: pairs }; }
  function bl(q, c, a) { return { t: "blank", q: q, c: c, a: a }; }

  /* ============ Unit M1 · Iconic Movie Lines ============ */

  lesson("mov-1", "“Hakuna Matata” — The Lion King", "🦁", [
    mc('What does "Hakuna matata" mean?', ["No worries / no problems", "Hello and welcome", "Good night, my friend"], "No worries / no problems"),
    ls(["Hakuna matata"]),
    mt([["problema", "problem"], ["preocupación", "worry"], ["amigo", "friend"], ["león", "lion"], ["la selva", "the jungle"]]),
    tr('It means "no problems"', ['Significa "no problemas"', "Significa que no hay problemas"]),
    mc('What is "el gusano"?', ["the worm", "the pig", "the rock"], "the worm"),
    tr("My best friend is here", ["Mi mejor amigo está aquí"]),
    ls(["No te preocupes"]),
    mc('What does "disfruta el momento" mean?', ["Enjoy the moment", "Run away now", "Be careful"], "Enjoy the moment", true),
    bl("Hakuna matata, no te ___.", ["preocupes", "comas", "duermas"], "preocupes"),
    mt([["mejor", "best"], ["momento", "moment"], ["preocuparse", "to worry"], ["disfrutar", "to enjoy"], ["siempre", "always"]])
  ], {
    film: "The Lion King · iconic line",
    quote: "Hakuna matata. Significa “no problemas”.",
    en: "Hakuna matata. It means “no problems”.",
    note: "A Swahili phrase made famous by Timon & Pumbaa — Spanish keeps it exactly as it sounds."
  });

  lesson("mov-2", "“Bajo el mar” — The Little Mermaid", "🧜", [
    mc('What does "Bajo el mar" mean?', ["Under the sea", "Over the mountain", "On the boat"], "Under the sea"),
    ls(["Bajo el mar"]),
    mt([["el mar", "the sea"], ["la sirena", "the mermaid"], ["el príncipe", "the prince"], ["cantar", "to sing"], ["las algas", "seaweed"], ["la canción", "the song"]]),
    tr("The song is beautiful", ["La canción es bonita"]),
    mc('What is "cantar"?', ["to sing", "to swim", "to dance"], "to sing"),
    ls(["Ella canta bajo el agua"]),
    tr("I want to be where the people are", ["Quiero estar donde está la gente"]),
    bl("Bajo el mar hay muchos ___.", ["peces", "árboles", "coches"], "peces"),
    mc('What is "la marea"?', ["the tide", "the rock", "the fish"], "the tide"),
    mt([["bajo", "under"], ["mejor", "better"], ["la gente", "the people"], ["el agua", "the water"], ["cantar una canción", "to sing a song"]])
  ], {
    film: "The Little Mermaid · iconic song line",
    quote: "Bajo el mar, todo es mejor.",
    en: "Under the sea, everything is better.",
    note: "The Spanish dub of “Under the Sea” keeps the same catchy rhythm: “Bajo el mar…”"
  });

  lesson("mov-3", "“Que la fuerza te acompañe” — Star Wars", "⭐", [
    tr("May the Force be with you", ["Que la fuerza te acompañe"]),
    ls(["Que la fuerza te acompañe"]),
    mt([["la fuerza", "the force"], ["acompañar", "to accompany"], ["el Jedi", "the Jedi"], ["la galaxia", "the galaxy"], ["el lado oscuro", "the dark side"]]),
    mc('What does "el lado oscuro" mean?', ["the dark side", "the bright side", "the other way"], "the dark side"),
    mc("In “Que la fuerza te acompañe”, which word is in the subjunctive?", ["acompañe", "acompaña", "acompañó"], "acompañe"),
    ls(["Usa la fuerza"]),
    tr("I am your father", ["Soy tu padre"]),
    bl("No tengas ___, Luke.", ["miedo", "hambre", "prisa"], "miedo"),
    mc('What is "una nave espacial"?', ["a spaceship", "a sword", "a storm"], "a spaceship"),
    mt([["volar", "to fly"], ["la espada", "the sword"], ["el universo", "the universe"], ["pelear", "to fight"], ["el héroe", "the hero"]])
  ], {
    film: "Star Wars · iconic line",
    quote: "Que la fuerza te acompañe.",
    en: "May the Force be with you.",
    note: "“Que + subjunctive” is how Spanish makes wishes — same structure you'll learn in Unit 6."
  });

  lesson("mov-4", "“Soy Iron Man” — Marvel", "🦾", [
    tr("I am Iron Man", ["Soy Iron Man"]),
    ls(["Vengadores, reúnanse"]),
    mt([["el héroe", "the hero"], ["el villano", "the villain"], ["el traje", "the suit / costume"], ["salvar al mundo", "to save the world"], ["el equipo", "the team"]]),
    mc('What does "salvar el mundo" mean?', ["to save the world", "to destroy the world", "to rule the world"], "to save the world"),
    mc('What does "reúnanse" mean?', ["assemble (come together)", "split up", "calm down"], "assemble (come together)", true),
    tr("We are a team", ["Somos un equipo"]),
    ls(["Él es un héroe"]),
    bl("El ___ salva al mundo.", ["héroe", "traje", "arma"], "héroe"),
    mc('What is "el arma"?', ["the weapon", "the shield", "the vehicle"], "the weapon"),
    tr("They are fighting the villain", ["Están luchando contra el villano"])
  ], {
    film: "Avengers: Endgame · iconic line",
    quote: "Soy Iron Man.",
    en: "I am Iron Man.",
    note: "Short, legendary, and one of the first sentences you can say perfectly in Spanish."
  });

  lesson("mov-5", "“Ogres son como cebollas” — Shrek", "🧅", [
    mc('What does "Los ogros son como cebollas" mean?', ["Ogres are like onions", "Onions are green", "Ogres eat onions"], "Ogres are like onions"),
    ls(["Los ogros son como cebollas"]),
    mt([["la cebolla", "the onion"], ["tener capas", "to have layers"], ["el castillo", "the castle"], ["el príncipe", "the prince"], ["el pantano", "the swamp"]]),
    tr("Ogres have layers", ["Los ogros tienen capas"]),
    mc('What is "el pantano"?', ["the swamp", "the castle", "the forest"], "the swamp"),
    ls(["Tengo muchas capas"]),
    tr("Once upon a time there was a princess", ["Érase una vez una princesa"]),
    bl("El príncipe vive en un ___.", ["castillo", "camino", "clima"], "castillo"),
    mc('What does "feo" mean?', ["ugly", "beautiful", "brave"], "ugly"),
    mt([["una vez", "once"], ["vivir", "to live"], ["decir", "to say"], ["reírse", "to laugh"], ["la historia", "the story"]])
  ], {
    film: "Shrek · iconic line",
    quote: "Los ogros son como cebollas: tienen capas.",
    en: "Ogres are like onions: they have layers.",
    note: "“Tener capas” = to have layers. Great vocabulary for describing people, not just onions."
  });

  /* ============ Unit M2 · Movie Scenes (original scripts) ============ */

  lesson("mov-6", "Scene: Superhero team-up", "🦹", [
    ls(["¡Esperad! Los necesitamos vivos."]),
    tr("We need them alive", ["Los necesitamos vivos"]),
    mc('What does "¡Esperad!" mean?', ["Wait!", "Run!", "Hide!"], "Wait!", true),
    mt([["vivos", "alive"], ["correr", "to run"], ["atacar", "to attack"], ["rescatar", "to rescue"], ["el plan", "the plan"]]),
    tr("Then run faster", ["Entonces corre más rápido"]),
    mc('What does "luchamos juntos" mean?', ["we fight together", "we run apart", "we rest now"], "we fight together"),
    ls(["Solo si luchamos juntos"]),
    bl("No vamos a ___.", ["rendirnos", "rendimos", "rendidos"], "rendirnos"),
    tr("Rescue the hostages", ["Rescata a los rehenes", "Rescaten a los rehenes"]),
    mt([["el traje", "the suit"], ["la misión", "the mission"], ["el enemigo", "the enemy"], ["la base", "the base"], ["el refugio", "the shelter"]])
  ], {
    film: "Original scene · Superhero team-up",
    quote: "—¡Esperad! Los necesitamos vivos. —Entonces corre más rápido.",
    en: "—Wait! We need them alive. —Then run faster.",
    note: "Original script written for this course: commands, direct objects (los) and short answers."
  });

  lesson("mov-7", "Scene: The road trip", "🚗", [
    ls(["¿Cuánto falta?"]),
    tr("I am hungry and tired", ["Tengo hambre y sueño"]),
    mc('What does "¿Nos hemos perdido?" mean?', ["Are we lost?", "Are we there yet?", "Is the car broken?"], "Are we lost?", true),
    mt([["el mapa", "the map"], ["la gasolinera", "the gas station"], ["perderse", "to get lost"], ["conducir", "to drive"], ["la carretera", "the highway"]]),
    tr("We are going to arrive late", ["Vamos a llegar tarde"]),
    bl("Para no perderse, sigue el ___.", ["mapa", "museo", "medio"], "mapa"),
    ls(["Hay que parar en la gasolinera"]),
    mc('What does "hicimos una parada" mean?', ["we made a stop", "we drove fast", "we lost the map"], "we made a stop"),
    tr("The road is beautiful", ["El camino es bonito"]),
    mt([["lleno", "full"], ["vacío", "empty"], ["cerca", "near"], ["lejos", "far"], ["rápido", "fast"]])
  ], {
    film: "Original scene · Buddy road trip",
    quote: "—¿Cuánto falta? —Como dos horas, si no nos perdemos.",
    en: "—How much longer? —About two hours, if we don't get lost.",
    note: "Original script written for this course: the road-trip phrases every traveler needs."
  });

  lesson("mov-8", "Scene: Meet-cute at a café", "☕", [
    ls(["¿Es esta tu taza?"]),
    tr("Sorry, is this your cup?", ["Perdón, ¿es esta tu taza?"]),
    mc('What does "¿Te invito a un café?" mean?', ["Shall I buy you a coffee?", "Do you want sugar?", "Is this seat taken?"], "Shall I buy you a coffee?", true),
    mt([["la taza", "the cup"], ["la cita", "the date / appointment"], ["quedar", "to meet up"], ["el número", "the phone number"], ["nervioso", "nervous"]]),
    tr("I am a little nervous", ["Estoy un poco nervioso", "Estoy algo nervioso"]),
    mc('What does "Me encantaría" mean?', ["I would love to", "I am busy", "Maybe next year"], "I would love to", true),
    ls(["¿Te llamo esta noche?"]),
    bl("¿Quieres ___ a tomar algo?", ["quedar", "quedado", "quedaré"], "quedar"),
    tr("See you tomorrow at eight", ["Nos vemos mañana a las ocho"]),
    mt([["bonito", "pretty / nice"], ["simpático", "likeable / kind"], ["cortés", "polite"], ["tímido", "shy"], ["divertido", "funny"]])
  ], {
    film: "Original scene · Meet-cute at a café",
    quote: "—Perdón, ¿es esta tu taza? —No, pero puede serlo.",
    en: "—Sorry, is this your cup? —No, but it could be.",
    note: "Original script written for this course: small talk, invitations and adjectives for personalities."
  });

  lesson("mov-9", "Scene: The heist", "💣", [
    ls(["Tres minutos antes de que vuelva la guardia."]),
    tr("Three minutes", ["Tres minutos"]),
    mc('What is "la guardia"?', ["the guard", "the key", "the door"], "the guard"),
    mt([["la caja fuerte", "the safe"], ["la llave", "the key"], ["el ascensor", "the elevator"], ["el sótano", "the basement"], ["el secuaz", "the henchman"]]),
    tr("Do not make noise", ["No hagas ruido"]),
    mc('In "antes de que vuelva", which mood is "vuelva"?', ["subjunctive", "indicative", "imperative"], "subjunctive"),
    ls(["Abre la puerta despacio"]),
    bl("El plan salió ___.", ["mal", "mañana", "rojo"], "mal"),
    tr("We have the money", ["Tenemos el dinero"]),
    mt([["despacio", "slowly"], ["rápidamente", "quickly"], ["en seguida", "right away"], ["todavía", "still / yet"], ["ya", "already"]])
  ], {
    film: "Original scene · The heist",
    quote: "—¿Cuánto tiempo tenemos? —Tres minutos antes de que vuelva la guardia.",
    en: "—How much time do we have? —Three minutes before the guard comes back.",
    note: "Original script written for this course: time pressure vocabulary plus a real subjunctive trigger."
  });

  lesson("mov-10", "Scene: The fantasy quest", "🐉", [
    ls(["La llama está al final del reino."]),
    tr("The flame is at the end of the kingdom", ["La llama está al final del reino"]),
    mc('What is "el reino"?', ["the kingdom", "the dragon", "the sword"], "the kingdom"),
    mt([["el dragón", "the dragon"], ["la llama", "the flame"], ["el mago", "the wizard"], ["el trono", "the throne"], ["la misión", "the quest / mission"]]),
    mc('What does "iremos juntos" mean?', ["we will go together", "we will stay here", "we are lost"], "we will go together", true),
    tr("We will go together", ["Iremos juntos"]),
    bl("El mago ___ una poción mágica.", ["prepara", "preparo", "preparó"], "prepara"),
    ls(["El dragón custodia el tesoro"]),
    tr("The dragon guards the treasure", ["El dragón custodia el tesoro"]),
    mt([["valiente", "brave"], ["sabio", "wise"], ["fuerte", "strong"], ["débil", "weak"], ["leal", "loyal"]])
  ], {
    film: "Original scene · The quest",
    quote: "—La llama está al final del reino. —Entonces iremos juntos.",
    en: "—The flame is at the end of the kingdom. —Then we will go together.",
    note: "Original script written for this course: fantasy vocabulary and the simple future tense."
  });

  /* ============ Unit W1 · Popular Words ============ */

  lesson("words-1", "Top function words", "🔤", [
    mc('What does "pero" mean?', ["but", "and", "or"], "but"),
    ls(["Voy en el coche"]),
    mt([["y", "and"], ["o", "or"], ["pero", "but"], ["de", "of / from"], ["sin", "without"], ["con", "with"]]),
    tr("Without money", ["Sin dinero"]),
    mc('"sobre" can mean:', ["about / on top of", "under", "behind"], "about / on top of"),
    tr("Between you and me", ["Entre tú y yo"]),
    mc('What does "porque" mean?', ["because", "although", "therefore"], "because"),
    bl("No sabía ___ decir.", ["qué", "quién", "dónde"], "qué"),
    ls(["Todo está bien"]),
    tr("Nothing is easy", ["Nada es fácil"])
  ]);

  lesson("words-2", "Core verbs", "🔁", [
    mc('Which is the most common verb for "to do / to make"?', ["hacer", "poner", "traer"], "hacer"),
    mt([["hacer", "to do / make"], ["poder", "can / to be able"], ["decir", "to say"], ["ver", "to see"], ["dar", "to give"], ["saber", "to know (facts)"]]),
    tr("I do not know", ["No sé"]),
    ls(["Puedo verlo desde aquí"]),
    mc('The "yo" form of "dar" is:', ["doy", "da", "damos"], "doy"),
    tr("She gives him the book", ["Le da el libro"]),
    mc('What does "¿Qué quiere decir?" mean?', ["What does it mean?", "What do you want?", "Who is speaking?"], "What does it mean?", true),
    bl("Yo ___ la televisión por la noche.", ["veo", "ves", "ve"], "veo"),
    ls(["Tengo que ir"]),
    tr("We see each other on Friday", ["Nos vemos el viernes"])
  ]);

  lesson("words-3", "Everyday nouns", "🗣️", [
    mc('"tiempo" can mean:', ["time / weather", "money", "food"], "time / weather"),
    mt([["el año", "the year"], ["el día", "the day"], ["la vida", "life"], ["la mano", "the hand"], ["la cosa", "the thing"], ["el lugar", "the place"]]),
    tr("I have no time", ["No tengo tiempo"]),
    ls(["Es una cosa importante"]),
    mc('"la gente" is grammatically:', ["singular (the people)", "plural (the peoples)", "a verb"], "singular (the people)"),
    tr("In that place", ["En ese lugar"]),
    mc("Which noun is feminine?", ["la vida", "el año", "el punto"], "la vida"),
    bl("La ___ de mi madre es bonita.", ["mano", "año", "lugar"], "mano"),
    ls(["Todos los días"]),
    tr("The whole world", ["Todo el mundo"])
  ]);

  lesson("words-4", "Slang & popular phrases", "😎", [
    mc('"Vale." (Spain) means:', ["OK / alright", "goodbye", "thank you"], "OK / alright"),
    mt([["o sea", "I mean / that is"], ["pues", "well / then"], ["genial", "great"], ["vamos", "come on / let's go"], ["ya ves", "you know"]]),
    tr("I mean, it is good", ["O sea, está bien"]),
    ls(["¿Qué onda?"]),
    mc('"¿Qué onda?" (LatAm) is a greeting meaning:', ["What's up?", "What time is it?", "Where are you?"], "What's up?", true),
    mc('In Spain, slang "tío/tía" means:', ["friend / dude", "uncle (only)", "teacher"], "friend / dude"),
    tr("Come on, we are late!", ["Vamos, estamos atrasados", "Vamos, llevamos retraso"]),
    ls(["¡Qué buena idea!"]),
    mc('"Chido", "guay" and "bacán" all mean:', ["cool / nice", "bad", "expensive"], "cool / nice"),
    bl("—¿Cómo estás? —Muy ___, ¡gracias!", ["bien", "noche", "rojo"], "bien")
  ]);

  lesson("words-5", "False cognates & tricky words", "⚠️", [
    mc('"actualmente" means:', ["currently / nowadays", "actually (in fact)", "actual (current)"], "currently / nowadays"),
    mt([["embarazada", "pregnant"], ["asistir", "to attend"], ["realizar", "to carry out"], ["largo", "long (not large)"], ["librería", "bookstore"]]),
    mc('"I am embarrassed" in Spanish is:', ["Estoy avergonzado.", "Estoy embarazado.", "Me da embarazoso."], "Estoy avergonzado."),
    tr("She works in a bookstore", ["Ella trabaja en una librería"]),
    mc('"Realizar una tarea" means:', ["to carry out a task", "to dream about a task", "to forget a task"], "to carry out a task"),
    ls(["Actualmente vivo en Barcelona"]),
    mc('"diez libros" means:', ["ten books", "ten pounds", "ten libraries"], "ten books"),
    bl("Mi hermana trabaja en una ___.", ["librería", "libra", "larga"], "librería"),
    tr("I attend class every day", ["Asisto a clase todos los días"]),
    mt([["confundir", "to confuse"], ["parecer", "to seem / to look like"], ["durante", "during"], ["además", "besides"], ["aunque", "although"]])
  ]);

  /* ============ Register the courses ============ */

  C.push({
    id: "movies",
    title: "Movie Spanish",
    desc: "Iconic movie lines + original scenes: learn from dialogue you already know",
    color: "#ce82ff",
    icon: "🎬",
    units: [
      { id: "m1", title: "Unit M1 · Iconic lines", sub: "Famous quotes, translated and drilled word by word", lessons: ["mov-1", "mov-2", "mov-3", "mov-4", "mov-5"] },
      { id: "m2", title: "Unit M2 · Original scenes", sub: "Superheroes, road trips, rom-coms, heists & quests", lessons: ["mov-6", "mov-7", "mov-8", "mov-9", "mov-10"] }
    ]
  });

  C.push({
    id: "words",
    title: "Popular Words",
    desc: "The highest-frequency Spanish words, slang and false cognates",
    color: "#ff9600",
    icon: "🔥",
    units: [
      { id: "w1", title: "Unit W1 · The words people actually use", sub: "Function words, core verbs, nouns, slang, cognates", lessons: ["words-1", "words-2", "words-3", "words-4", "words-5"] }
    ]
  });
})();
