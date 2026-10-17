/* ============================================================
   Freebuff Español — Core course (30 lessons)
   Plain ES5/ES2015, no modules, runs from file://
   Helpers:
     mc(q, choices, answer, speak?)   multiple choice
     tr(q, answers, from)             typed translation ("en" = EN->ES)
     ls(answers, choices?)            listening (speech synthesis)
     mt(pairs)                        matching pairs [[es,en],...]
     bl(q, choices, answer)           fill-in-the-blank
   ============================================================ */
(function () {
  "use strict";

  var L = (window.LESSON_LIST = window.LESSON_LIST || []);
  var C = (window.COURSES = window.COURSES || []);

  function lesson(id, title, icon, exercises) {
    L.push({ id: id, title: title, icon: icon, exercises: exercises });
  }
  function mc(q, c, a, sp) { return { t: "choice", q: q, c: c, a: a, sp: !!sp }; }
  function tr(q, a, from) { return { t: "translate", q: q, a: a, from: from || "en" }; }
  function ls(a, c) { var o = { t: "listen", a: a }; if (c) o.c = c; return o; }
  function mt(pairs) { return { t: "match", pairs: pairs }; }
  function bl(q, c, a) { return { t: "blank", q: q, c: c, a: a }; }

  /* ============ Unit 1 · Basics I ============ */

  lesson("core-1", "Greetings", "👋", [
    mc('Which of these means "Hello"?', ["Hola", "Adiós", "Gracias"], "Hola"),
    ls(["Buenos días"]),
    mt([["Hola", "Hello"], ["Adiós", "Goodbye"], ["Gracias", "Thank you"], ["Por favor", "Please"], ["Buenas noches", "Good night"]]),
    tr("Good morning", ["Buenos días"]),
    mc('What does "¿Cómo estás?" mean?', ["How are you?", "What is your name?", "Where are you?"], "How are you?", true),
    tr("Thank you very much", ["Muchas gracias"]),
    ls(["Buenas tardes"]),
    mc('What does "¿Cómo te llamas?" mean?', ["What is your name?", "How old are you?", "Where are you from?"], "What is your name?", true),
    tr("See you later", ["Hasta luego", "Nos vemos"]),
    bl("Mucho ___ en conocerte.", ["gusto", "noche", "gracias"], "gusto")
  ]);

  lesson("core-2", "Introductions", "🙋", [
    tr("My name is Mark", ["Me llamo Mark", "Mi nombre es Mark"]),
    mc('What does "¿De dónde eres?" mean?', ["Where are you from?", "How old are you?", "What time is it?"], "Where are you from?", true),
    tr("I am from Mexico", ["Soy de México", "Vengo de México"]),
    ls(["Me llamo Carlos"]),
    mt([["Mucho gusto", "Nice to meet you"], ["Soy de Cuba", "I am from Cuba"], ["¿Cómo se llama?", "What is his/her name?"], ["Encantado", "Pleased to meet you"], ["Hasta luego", "See you later"]]),
    tr("Nice to meet you", ["Mucho gusto", "Encantado"]),
    mc('What does "¿Cómo se llama usted?" mean?', ["What is your name? (formal)", "How are you feeling?", "Where do you live?"], "What is your name? (formal)", true),
    ls(["Soy de España"]),
    tr("I speak a little Spanish", ["Hablo un poco de español"]),
    bl("Yo ___ de Colombia.", ["soy", "estás", "pone"], "soy")
  ]);

  lesson("core-3", "Ser & Estar", "🧍", [
    mc('Which verb means "to be" for identity and permanent traits?', ["ser", "estar", "tener"], "ser"),
    tr("She is tall", ["Ella es alta", "Es alta"]),
    bl("Yo ___ estudiante.", ["soy", "eres", "es"], "soy"),
    tr("The water is cold", ["El agua está fría"]),
    ls(["Soy profesor"]),
    mt([["soy", "I am"], ["eres", "you are"], ["es", "he/she/it is"], ["somos", "we are"], ["son", "they are"]]),
    mc('Complete: "Mi madre ___ médica."', ["es", "está", "soy"], "es"),
    tr("We are students", ["Somos estudiantes"]),
    bl("Ella ___ contenta hoy.", ["está", "es", "son"], "está"),
    mc("Which sentence correctly uses ser?", ["Mi hermano es alto.", "Mi hermano está alto.", "Mi hermano ser alto."], "Mi hermano es alto.")
  ]);

  lesson("core-4", "Numbers 0–20", "🔢", [
    mc('What is "quince"?', ["15", "12", "50"], "15"),
    ls(["cinco"]),
    mt([["uno", "one"], ["tres", "three"], ["siete", "seven"], ["diez", "ten"], ["quince", "fifteen"]]),
    tr("Eleven", ["once"]),
    mc('How do you say "twelve"?', ["doce", "diez", "veinte"], "doce"),
    tr("Twenty", ["veinte"]),
    ls(["catorce"]),
    mc("What is 18 in Spanish?", ["dieciocho", "diez y ocho", "octo"], "dieciocho"),
    tr("Nine", ["nueve"]),
    bl("Tengo ___ amigos aquí.", ["doce", "veinte", "treinta"], "doce")
  ]);

  lesson("core-5", "First Conversation", "💬", [
    ls(["¿Cómo estás?"]),
    tr("I am fine, thank you", ["Estoy bien, gracias"]),
    mc('Someone says "Buenas noches". What do you answer?', ["Buenas noches.", "Buenos días.", "¿Qué hora es?"], "Buenas noches."),
    mt([["¿Qué tal?", "How is it going?"], ["Bien, gracias.", "Good, thanks."], ["Muy mal.", "Very bad."], ["Hasta mañana.", "See you tomorrow."], ["De nada.", "You are welcome."]]),
    tr("What is your name?", ["¿Cómo te llamas?", "¿Cómo se llama usted?"]),
    mc('What does "Estoy cansado" mean?', ["I am tired", "I am hungry", "I am happy"], "I am tired", true),
    ls(["Mucho gusto"]),
    bl("—¿Cómo estás? —Muy ___, gracias.", ["bien", "noche", "gusto"], "bien"),
    tr("Goodbye, see you tomorrow", ["Adiós, hasta mañana"]),
    mc('What does "¿Dónde está el baño?" mean?', ["Where is the bathroom?", "Where is the hotel?", "What time is it?"], "Where is the bathroom?", true)
  ]);

  /* ============ Unit 2 · Basics II ============ */

  lesson("core-6", "Numbers 20–1000", "💯", [
    mc('What is "treinta"?', ["30", "13", "3"], "30"),
    tr("Fifty", ["cincuenta"]),
    ls(["setenta"]),
    mt([["cuarenta", "forty"], ["cincuenta", "fifty"], ["sesenta", "sixty"], ["ochenta", "eighty"], ["noventa", "ninety"]]),
    mc('How do you say 100?', ["cien", "ciento", "mil"], "cien"),
    tr("One thousand", ["mil"]),
    mc('What is "veinticinco"?', ["25", "22", "52"], "25", true),
    tr("Sixty-four", ["sesenta y cuatro"]),
    ls(["doscientos"]),
    bl("El libro cuesta ___ pesos.", ["cien", "mil", "veinte"], "cien")
  ]);

  lesson("core-7", "Days, Months & Dates", "📅", [
    mc('What is "miércoles"?', ["Wednesday", "Thursday", "Monday"], "Wednesday"),
    tr("Today is Monday", ["Hoy es lunes"]),
    ls(["sábado"]),
    mt([["lunes", "Monday"], ["martes", "Tuesday"], ["viernes", "Friday"], ["domingo", "Sunday"], ["jueves", "Thursday"]]),
    mc('How do you ask "What day is today?"', ["¿Qué día es hoy?", "¿Qué hora es?", "¿Cuántos años tienes?"], "¿Qué día es hoy?"),
    tr("My birthday is in May", ["Mi cumpleaños es en mayo"]),
    mc("Which word is a month?", ["enero", "lunes", "verano"], "enero"),
    ls(["marzo"]),
    tr("January and February", ["enero y febrero"]),
    bl("En diciembre hace ___.", ["frío", "hambre", "prisa"], "frío")
  ]);

  lesson("core-8", "Food & Drink", "🍎", [
    mc('What is "el pan"?', ["the bread", "the milk", "the fish"], "the bread"),
    tr("I want a coffee", ["Quiero un café"]),
    ls(["La manzana"]),
    mt([["el arroz", "the rice"], ["la leche", "the milk"], ["el pollo", "the chicken"], ["el queso", "the cheese"], ["la fruta", "the fruit"]]),
    mc('What does "Tengo hambre" mean?', ["I am hungry", "I am thirsty", "I am tired"], "I am hungry", true),
    tr("The food is delicious", ["La comida está deliciosa"]),
    mc('Which word means "breakfast"?', ["el desayuno", "el almuerzo", "la cena"], "el desayuno"),
    ls(["Quiero agua"]),
    tr("I drink water in the morning", ["Bebo agua por la mañana", "Bebo agua en la mañana"]),
    bl("El ___ está muy rico.", ["pollo", "mesa", "zapato"], "pollo")
  ]);

  lesson("core-9", "Regular Verbs", "⚙️", [
    mc('What is the "yo" form of "hablar"?', ["hablo", "hablas", "habla"], "hablo"),
    tr("They eat apples", ["Ellos comen manzanas"]),
    ls(["Yo vivo en Madrid"]),
    mt([["hablar", "to speak"], ["comer", "to eat"], ["vivir", "to live"], ["beber", "to drink"], ["escribir", "to write"]]),
    mc('Complete: "Nosotros ___ (vivir) aquí."', ["vivimos", "vivís", "viven"], "vivimos"),
    tr("She speaks French", ["Ella habla francés"]),
    mc('The "ellos/ustedes" form of "comer" is:', ["comen", "comes", "como"], "comen"),
    bl("Ellos ___ español todos los días.", ["estudian", "estudio", "estudias"], "estudian"),
    ls(["Tú comes pizza"]),
    tr("We write letters", ["Nosotros escribimos cartas"])
  ]);

  lesson("core-10", "Pronouns & Articles", "🧩", [
    mc('Which pronoun means "you" (informal, singular)?', ["tú", "usted", "vosotros"], "tú"),
    tr("The house", ["La casa"]),
    ls(["El libro es mío"]),
    mt([["yo", "I"], ["tú", "you (informal)"], ["nosotros", "we"], ["ellos", "they (male)"], ["ustedes", "you (plural)"]]),
    mc('Which article goes with "mesa" (feminine, singular)?', ["la", "el", "los"], "la"),
    tr("The books", ["Los libros"]),
    mc('Which word means "my"?', ["mi", "tu", "su"], "mi"),
    bl("___ son mis padres.", ["Ellos", "Nosotros", "Yo"], "Ellos"),
    ls(["Usted es médico"]),
    tr("Their house is big", ["Su casa es grande"])
  ]);

  /* ============ Unit 3 · Everyday ============ */

  lesson("core-11", "Family", "👨‍👩‍👧", [
    mc('What is "la madre"?', ["the mother", "the sister", "the grandmother"], "the mother"),
    tr("I have two brothers", ["Tengo dos hermanos"]),
    ls(["Mi abuela vive aquí"]),
    mt([["el padre", "the father"], ["la hermana", "the sister"], ["el hijo", "the son"], ["los padres", "the parents"], ["el tío", "the uncle"]]),
    mc('What does "Es mi prima" mean?', ["She is my cousin", "She is my aunt", "She is my daughter"], "She is my cousin", true),
    tr("My parents are from Peru", ["Mis padres son de Perú"]),
    mc('Which word means "grandmother"?', ["la abuela", "la tía", "la prima"], "la abuela"),
    ls(["Tengo una hermana menor"]),
    tr("Their family is big", ["Su familia es grande"]),
    bl("Este es mi ___, se llama Luis.", ["hermano", "hermana", "abuela"], "hermano")
  ]);

  lesson("core-12", "Colors & Descriptions", "🎨", [
    mc('What is "rojo"?', ["red", "blue", "green"], "red"),
    tr("The car is black", ["El coche es negro"]),
    ls(["La pelota es amarilla"]),
    mt([["azul", "blue"], ["verde", "green"], ["blanco", "white"], ["negro", "black"], ["naranja", "orange"]]),
    mc('What does "Es muy grande" mean?', ["It is very big", "It is very small", "It is very fast"], "It is very big", true),
    tr("A small white house", ["Una casa blanca pequeña", "Una casa pequeña blanca"]),
    mc('Which word means "small"?', ["pequeño", "grande", "alto"], "pequeño"),
    ls(["Mi camisa es azul"]),
    tr("They are tall", ["Ellos son altos"]),
    bl("El gato es ___ y la casa es blanca.", ["negro", "noche", "corre"], "negro")
  ]);

  lesson("core-13", "Telling Time", "🕐", [
    mc("It is 3 o'clock. What do you say?", ["Son las tres.", "Es la tres.", "Son el tres."], "Son las tres."),
    tr("It is one o'clock", ["Es la una"]),
    ls(["Son las cinco y media"]),
    mt([["¿Qué hora es?", "What time is it?"], ["en punto", "o'clock"], ["y media", "half past"], ["menos cuarto", "quarter to"], ["son las", "it is (plural hours)"]]),
    mc('How do you say "half past two"?', ["son las dos y media", "son las dos en punto", "son las media dos"], "son las dos y media"),
    tr("It is two fifteen", ["Son las dos y cuarto", "Son las dos y quince"]),
    ls(["Es la una y cuarto"]),
    mc("Which sentence is correct for 8 o'clock?", ["Son las ocho.", "Es las ocho.", "Son el ocho."], "Son las ocho."),
    tr("What time is it?", ["¿Qué hora es?"]),
    bl("La clase empieza ___ las nueve.", ["a", "en", "de"], "a")
  ]);

  lesson("core-14", "Shopping", "🛍️", [
    mc('What does "¿Cuánto cuesta?" mean?', ["How much does it cost?", "What do you sell?", "Where is the store?"], "How much does it cost?", true),
    tr("I want to buy a shirt", ["Quiero comprar una camisa"]),
    ls(["El libro cuesta diez dólares"]),
    mt([["la tienda", "the shop"], ["barato", "cheap"], ["caro", "expensive"], ["la talla", "the size"], ["el descuento", "the discount"]]),
    mc('Which word means "expensive"?', ["caro", "barato", "nuevo"], "caro"),
    tr("These shoes are very expensive", ["Estos zapatos son muy caros"]),
    mc('A customer says "¿Tiene una talla más grande?" — what do they want?', ["A bigger size", "A cheaper price", "Another color"], "A bigger size"),
    ls(["Quiero pagar con tarjeta"]),
    tr("How much do the oranges cost?", ["¿Cuánto cuestan las naranjas?"]),
    bl("No tengo ___, solo llevo efectivo.", ["dinero", "hermano", "mañana"], "dinero")
  ]);

  lesson("core-15", "Travel & Directions", "✈️", [
    mc('What does "¿Dónde está el baño?" mean?', ["Where is the bathroom?", "Where is the airport?", "When does it leave?"], "Where is the bathroom?", true),
    tr("The airport is far", ["El aeropuerto está lejos"]),
    ls(["Voy a la estación"]),
    mt([["a la derecha", "to the right"], ["a la izquierda", "to the left"], ["todo recto", "straight ahead"], ["la parada", "the stop"], ["el billete", "the ticket"]]),
    mc('How do you say "bus"?', ["el autobús", "el tren", "el avión"], "el autobús"),
    tr("I need a ticket to Seville", ["Necesito un billete a Sevilla", "Necesito un billete para Sevilla"]),
    mc('How do you say "turn left"?', ["Gire a la izquierda", "Gire a la derecha", "Siga recto"], "Gire a la izquierda"),
    ls(["¿Dónde está la estación de tren?"]),
    tr("The train leaves at nine", ["El tren sale a las nueve"]),
    bl("Para llegar al museo, siga ___ por esta calle.", ["recto", "hambre", "prisa"], "recto")
  ]);

  /* ============ Unit 4 · Intermediate grammar ============ */

  lesson("core-16", "Present vs Progressive", "🏃", [
    mc('Complete: "Ahora mismo ___ (comer) pizza."', ["estoy comiendo", "estoy como", "como"], "estoy comiendo"),
    tr("I am studying right now", ["Estoy estudiando ahora mismo"]),
    ls(["Está lloviendo"]),
    mt([["estoy comiendo", "I am eating"], ["estás corriendo", "you are running"], ["está hablando", "he is speaking"], ["estamos viendo", "we are watching"], ["están durmiendo", "they are sleeping"]]),
    mc("The progressive is formed with:", ["estar + -ando/-iendo", "tener + past participle", "ir + infinitive"], "estar + -ando/-iendo"),
    tr("They are waiting for the bus", ["Están esperando el autobús"]),
    mc("Which sentence is NOT progressive?", ["Yo hablo.", "Yo estoy hablando.", "Yo estoy comiendo."], "Yo hablo."),
    bl("Mi hermana ___ leyendo en su cuarto.", ["está", "tiene", "hace"], "está"),
    ls(["Nosotros estamos cocinando"]),
    tr("What are you doing?", ["¿Qué estás haciendo?"])
  ]);

  lesson("core-17", "Key Verbs", "🔑", [
    mc('What does "Tengo sed" mean?', ["I am thirsty", "I am hungry", "I am tired"], "I am thirsty", true),
    tr("I want to go home", ["Quiero ir a casa"]),
    ls(["Puedo hablar español"]),
    mt([["tener hambre", "to be hungry"], ["querer", "to want"], ["poder", "to be able to"], ["ir", "to go"], ["decir", "to say"]]),
    mc('Complete: "Ellos ___ (poder) venir mañana."', ["pueden", "puedo", "puede"], "pueden"),
    tr("We have time", ["Tenemos tiempo"]),
    mc('Which verb means "to do / to make"?', ["hacer", "tomar", "poner"], "hacer"),
    bl("Mañana ___ a la playa.", ["voy", "tengo", "hago"], "voy"),
    ls(["Tengo que estudiar"]),
    tr("Can you help me?", ["¿Puedes ayudarme?", "¿Puede ayudarme?"])
  ]);

  lesson("core-18", "Question Words", "❓", [
    mc('What does "¿Por qué?" ask about?', ["reason", "place", "person"], "reason"),
    tr("Where do you live?", ["¿Dónde vives?"]),
    ls(["¿Cuándo llegas?"]),
    mt([["qué", "what"], ["quién", "who"], ["dónde", "where"], ["cuándo", "when"], ["por qué", "why"]]),
    mc('What does "¿Cuál es tu teléfono?" mean?', ["Which one is your phone?", "What is your phone?", "Why is your phone?"], "Which one is your phone?", true),
    tr("How do you say this in Spanish?", ["¿Cómo se dice esto en español?"]),
    mc('What does "¿Quién es ella?" mean?', ["Who is she?", "Where is she?", "What is she?"], "Who is she?", true),
    bl("¿___ cuesta este? — Cuesta cinco euros.", ["Cuánto", "Quién", "Por qué"], "Cuánto"),
    ls(["¿Por qué no vienes?"]),
    tr("When is the exam?", ["¿Cuándo es el examen?"])
  ]);

  lesson("core-19", "Prepositions", "🔗", [
    mc('Complete: "Voy ___ la escuela." (to)', ["a", "en", "de"], "a"),
    tr("I live in Madrid", ["Vivo en Madrid"]),
    ls(["Vengo de Argentina"]),
    mt([["a", "to"], ["en", "in / at"], ["de", "of / from"], ["con", "with"], ["para", "for"]]),
    mc('Complete: "El gato está ___ la mesa."', ["debajo de", "durante", "hacia"], "debajo de"),
    tr("This gift is for you", ["Este regalo es para ti"]),
    mc('Which sentence correctly uses "con"?', ["Voy con mi amigo.", "Voy de mi amigo.", "Voy a mi amigo."], "Voy con mi amigo."),
    bl("Habla ___ teléfono con su madre.", ["por", "para", "sin"], "por"),
    ls(["Salimos sin ellos"]),
    tr("Walk through the park", ["Camina por el parque", "Pasea por el parque"])
  ]);

  lesson("core-20", "Reflexive Verbs", "🪞", [
    mc('What does "levantarse" mean?', ["to get up", "to go to bed", "to shower"], "to get up", true),
    tr("I wake up at seven", ["Me despierto a las siete"]),
    ls(["Me ducho por la mañana"]),
    mt([["levantarse", "to get up"], ["ducharse", "to shower"], ["acostarse", "to go to bed"], ["llamarse", "to be called"], ["ponerse", "to put on"]]),
    mc('Complete: "Ella ___ Sofía."', ["se llama", "me llama", "se llaman"], "se llama"),
    tr("We get dressed quickly", ["Nos vestimos rápidamente"]),
    mc("Which sentence is reflexive?", ["Me lavo las manos.", "Yo lavo el coche.", "Ella lava los platos."], "Me lavo las manos."),
    bl("Antes de dormir, me ___ los dientes.", ["lavo", "ducho", "visto"], "lavo"),
    ls(["Se acuesta tarde"]),
    tr("They put on their coats", ["Se ponen sus abrigos"])
  ]);

  /* ============ Unit 5 · Past & Future ============ */

  lesson("core-21", "Preterite (regular)", "⏮️", [
    mc('The preterite of "hablar" (yo) is:', ["hablé", "hablaba", "hablo"], "hablé"),
    tr("Yesterday I ate pizza", ["Ayer comí pizza"]),
    ls(["Hablé con mi jefe"]),
    mt([["hablé", "I spoke"], ["comió", "he ate"], ["vivieron", "they lived"], ["escribiste", "you wrote"], ["bebimos", "we drank"]]),
    mc('Complete: "Nosotros ___ (vivir) en Bogotá el año pasado."', ["vivimos", "vivíamos", "vivir"], "vivimos"),
    tr("She watched a movie last night", ["Ella vio una película anoche"]),
    mc("Which word usually signals the preterite?", ["anoche", "todos los días", "ahora mismo"], "anoche"),
    bl("La semana pasada ___ a mi abuela.", ["visité", "visito", "visitaría"], "visité"),
    ls(["Comimos en un restaurante"]),
    tr("We bought two tickets", ["Compramos dos billetes", "Compramos dos entradas"])
  ]);

  lesson("core-22", "Preterite (irregular)", "⚡", [
    mc('The preterite of "ir/ser" (yo) is:', ["fui", "iba", "voy"], "fui"),
    tr("I had a question", ["Tuve una pregunta"]),
    ls(["Fui al mercado"]),
    mt([["fui", "I went / I was"], ["tuve", "I had"], ["hice", "I did / made"], ["estuve", "I was (there)"], ["pude", "I could"]]),
    mc('Complete: "Ellos ___ (poder) entrar."', ["pudieron", "podrían", "pueden"], "pudieron"),
    tr("She made a cake", ["Ella hizo una tarta", "Ella hizo un pastel"]),
    mc('The irregular form "hice" comes from the verb:', ["hacer", "haber", "ir"], "hacer"),
    bl("Ayer ___ mis tareas.", ["hice", "hago", "haría"], "hice"),
    ls(["No pude venir ayer"]),
    tr("We went to the beach", ["Fuimos a la playa"])
  ]);

  lesson("core-23", "Imperfect", "🕰️", [
    mc('The imperfect of "hablar" (yo) is:', ["hablaba", "hablé", "hablo"], "hablaba"),
    tr("When I was a child, I played outside", ["Cuando era niño, jugaba afuera"]),
    ls(["Hacía mucho calor"]),
    mt([["hablaba", "I used to speak"], ["comía", "he used to eat"], ["vivíamos", "we used to live"], ["era", "was (ser)"], ["tenía", "had (tener)"]]),
    mc('Complete: "De pequeño, mi hermano ___ miedo a la oscuridad."', ["tenía", "tuvo", "tendrá"], "tenía"),
    tr("It was cold at night", ["Hacía frío por la noche"]),
    mc('The imperfect of "ir" (ellos) is:', ["iban", "fueron", "irán"], "iban"),
    bl("Antes, mi abuela ___ en el campo.", ["vivía", "vivió", "vivirá"], "vivía"),
    ls(["Siempre nos ayudaba"]),
    tr("They were happy", ["Ellos estaban contentos"])
  ]);

  lesson("core-24", "Preterite vs Imperfect", "⚖️", [
    mc("Which tense sets the background of a story?", ["imperfect", "preterite", "future"], "imperfect"),
    tr("I was walking when I saw her", ["Caminaba cuando la vi"]),
    ls(["Mientras estudiaba, sonó el teléfono"]),
    mt([["era niño", "background: I was a child"], ["vi un coche", "action: I saw a car"], ["hacía sol", "setting: the sun was shining"], ["llovió", "completed event: it rained"], ["nos conocimos", "event: we met"]]),
    mc('Complete: "Ella entró mientras nosotros ___."', ["hablábamos", "hablamos", "hablaremos"], "hablábamos"),
    tr("One day, we met at a café", ["Un día, nos conocimos en un café"]),
    mc("Which sentence uses the preterite for a completed action?", ["Comí a las dos.", "Comía a las dos.", "Comeré a las dos."], "Comí a las dos."),
    bl("El año pasado ___ a Cuba por primera vez.", ["fui", "iba", "iría"], "fui"),
    ls(["Ella leía cuando entré"]),
    tr("While we were eating, the lights went out", ["Mientras comíamos, se fueron las luces"])
  ]);

  lesson("core-25", "Future & Plans", "🔮", [
    mc('Complete: "Mañana ___ (hablar) con el jefe."', ["hablaré", "hablaba", "hablé"], "hablaré"),
    tr("I am going to travel next year", ["Voy a viajar el año que viene"]),
    ls(["La semana que viene tendré tiempo"]),
    mt([["mañana", "tomorrow"], ["el año que viene", "next year"], ["pronto", "soon"], ["más tarde", "later"], ["dentro de poco", "in a little while"]]),
    mc('What does "¿Vas a venir?" ask about?', ["an immediate plan (going to)", "a habit", "the past"], "an immediate plan (going to)"),
    tr("Will you call me tonight?", ["¿Me vas a llamar esta noche?", "¿Me llamarás esta noche?"]),
    mc('The future of "tener" (yo) is:', ["tendré", "tenía", "tuve"], "tendré"),
    bl("El próximo mes ___ estudiar más.", ["voy a", "fui", "iba"], "voy a"),
    ls(["Vamos a cocinar juntos"]),
    tr("They will arrive at eight", ["Llegarán a las ocho"])
  ]);

  /* ============ Unit 6 · Advanced ============ */

  lesson("core-26", "Comparatives & Superlatives", "📊", [
    mc('What does "más grande que" mean?', ["bigger than", "as big as", "the biggest"], "bigger than"),
    tr("This book is more interesting than that one", ["Este libro es más interesante que ese"]),
    ls(["María es la más alta de la clase"]),
    mt([["más...que", "more...than"], ["menos...que", "less...than"], ["tan...como", "as...as"], ["el mejor", "the best"], ["la peor", "the worst"]]),
    mc('What does "El coche es peor que la bicicleta" mean?', ["The car is worse than the bike.", "The car is better than the bike.", "The car is the worst."], "The car is worse than the bike.", true),
    tr("She is as smart as her sister", ["Ella es tan inteligente como su hermana"]),
    mc('The superlative of "bueno" is:', ["el mejor", "más bueno", "bueno"], "el mejor"),
    bl("Este es el ___ restaurante de la ciudad.", ["mejor", "mejores", "mejora"], "mejor"),
    ls(["Hoy hace más frío que ayer"]),
    tr("The fastest runner in the race", ["El corredor más rápido de la carrera"])
  ]);

  lesson("core-27", "Subjunctive", "✨", [
    mc('Complete: "Espero que ___ (venir) mañana."', ["vengas", "vienes", "viniste"], "vengas"),
    tr("I want you to be happy", ["Quiero que seas feliz"]),
    ls(["No creo que sea fácil"]),
    mt([["espero que", "I hope that"], ["quiero que", "I want that"], ["es posible que", "it is possible that"], ["dudo que", "I doubt that"], ["ojalá", "hopefully"]]),
    mc('"Es importante que..." requires which mood?', ["subjunctive", "indicative", "imperative"], "subjunctive"),
    tr("It is necessary that he study", ["Es necesario que él estudie"]),
    mc('Complete: "Ojalá ___ (llover) mañana."', ["llueva", "llovió", "lloverá"], "llueva"),
    bl("No estoy seguro de que ___ verdad.", ["sea", "es", "fue"], "sea"),
    ls(["Quiero que vengas a mi fiesta"]),
    tr("I doubt that she knows the answer", ["Dudo que ella sepa la respuesta"])
  ]);

  lesson("core-28", "Conditional & Politeness", "🙏", [
    mc('What does "Me gustaría" mean?', ["I would like", "I like", "I will like"], "I would like", true),
    tr("Could you help me, please?", ["¿Podrías ayudarme, por favor?"]),
    ls(["¿Podrías repetir eso?"]),
    mt([["me gustaría", "I would like"], ["podría", "I could"], ["debería", "I should"], ["sería", "it would be"], ["haría", "I would do / make"]]),
    mc('Complete: "Si tuviera tiempo, ___ (viajar) más."', ["viajaría", "viajé", "viajo"], "viajaría"),
    tr("I would buy a house near the sea", ["Compraría una casa cerca del mar"]),
    mc('The conditional of "tener" (yo) is:', ["tendría", "tendré", "tenía"], "tendría"),
    bl("¿___ usted decirme la hora?", ["Podría", "Tendría", "Debería"], "Podría"),
    ls(["Sería genial ir contigo"]),
    tr("It would be great to see you again", ["Sería genial verte otra vez"])
  ]);

  lesson("core-29", "Por vs Para", "🧭", [
    mc('Use "para" to express:', ["purpose or destination", "cause or reason", "movement through"], "purpose or destination"),
    tr("I am saving money for a trip", ["Ahorro dinero para un viaje"]),
    ls(["Estudio para aprender"]),
    mt([["por la mañana", "in the morning (during)"], ["para estudiar", "in order to study (purpose)"], ["por favor", "please"], ["voy para allá", "I am heading there (destination)"], ["lo hice por ti", "I did it for you (on your behalf)"]]),
    mc('Complete: "Gracias ___ tu ayuda."', ["por", "para", "sin"], "por"),
    tr("I walk through the city every day", ["Camino por la ciudad todos los días"]),
    mc('Which sentence correctly uses "para"?', ["Este tren es para Sevilla.", "Este tren es por Sevilla.", "Este tren es de Sevilla."], "Este tren es para Sevilla."),
    bl("Tengo que terminarlo ___ mañana.", ["para", "por", "en"], "para"),
    ls(["Lo hice por amor"]),
    tr("He traveled through all of Spain", ["Viajó por toda España"])
  ]);

  lesson("core-30", "Perfect Tenses & Advanced Vocab", "🎓", [
    mc("The present perfect is formed with:", ["haber + past participle", "ser + past participle", "tener + infinitive"], "haber + past participle"),
    tr("I have eaten", ["He comido"]),
    ls(["Hoy he hablado con el jefe"]),
    mt([["he comido", "I have eaten"], ["has visto", "you have seen"], ["hemos llegado", "we have arrived"], ["han tenido", "they have had"], ["he terminado", "I have finished"]]),
    mc('What does "sin embargo" mean?', ["however", "therefore", "although"], "however"),
    tr("Although it was late, we continued", ["Aunque era tarde, continuamos"]),
    mc('What does "el empleo" mean?', ["the job", "the industry", "the contract"], "the job"),
    bl("___ de las dificultades, no se rindió.", ["A pesar", "Aunque", "Porque"], "A pesar"),
    ls(["Estoy de acuerdo contigo"]),
    tr("On the other hand, the price is high", ["Por otro lado, el precio es alto"])
  ]);

  /* ============ Register the course ============ */

  C.push({
    id: "core",
    title: "Spanish Core",
    desc: "Beginner → advanced: greetings, numbers, verbs, grammar, subjunctive & more",
    color: "#58cc02",
    icon: "📚",
    units: [
      { id: "u1", title: "Unit 1 · Basics I", sub: "Greetings, introductions, ser & estar, 0–20", lessons: ["core-1", "core-2", "core-3", "core-4", "core-5"] },
      { id: "u2", title: "Unit 2 · Basics II", sub: "Numbers, dates, food, verbs, pronouns", lessons: ["core-6", "core-7", "core-8", "core-9", "core-10"] },
      { id: "u3", title: "Unit 3 · Everyday", sub: "Family, colors, time, shopping, travel", lessons: ["core-11", "core-12", "core-13", "core-14", "core-15"] },
      { id: "u4", title: "Unit 4 · Intermediate grammar", sub: "Progressive, key verbs, questions, prepositions, reflexives", lessons: ["core-16", "core-17", "core-18", "core-19", "core-20"] },
      { id: "u5", title: "Unit 5 · Past & Future", sub: "Preterite, imperfect, narrative, plans", lessons: ["core-21", "core-22", "core-23", "core-24", "core-25"] },
      { id: "u6", title: "Unit 6 · Advanced", sub: "Comparatives, subjunctive, conditional, por/para, perfect tenses", lessons: ["core-26", "core-27", "core-28", "core-29", "core-30"] }
    ]
  });
})();
