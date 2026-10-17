/* ============================================================
   Habla Libre — reference data (no logic, just data)
   Loaded after the lessons files. Sets window.REFERENCE with:
     alphabet  [{ ch, name, sample, tip }]
     sounds    [{ combo, ipa, how }]
     glossary  [{ es, en, cat }]
     verbs     [{ inf, en, present, preterite, future }]
   Plain ES5, runs from file://
   ============================================================ */
(function () {
  "use strict";

  var alphabet = [
    { ch: "A", name: "a", sample: "avión (plane)", tip: "ah" },
    { ch: "B", name: "be", sample: "barco (ship)", tip: "soft b / v" },
    { ch: "C", name: "ce", sample: "casa (house)", tip: "k before a,o,u · th/s before e,i" },
    { ch: "D", name: "de", sample: "dedo (finger)", tip: "soft d between vowels" },
    { ch: "E", name: "e", sample: "elefante (elephant)", tip: "eh" },
    { ch: "F", name: "efe", sample: "foca (seal)", tip: "f" },
    { ch: "G", name: "ge", sample: "gato (cat)", tip: "hard g · harsh h before e,i" },
    { ch: "H", name: "hache", sample: "higo (fig)", tip: "always silent" },
    { ch: "I", name: "i", sample: "isla (island)", tip: "ee" },
    { ch: "J", name: "jota", sample: "jamón (ham)", tip: "harsh h" },
    { ch: "K", name: "ka", sample: "kilo", tip: "k (loanwords)" },
    { ch: "L", name: "ele", sample: "luna (moon)", tip: "l" },
    { ch: "M", name: "eme", sample: "mano (hand)", tip: "m" },
    { ch: "N", name: "ene", sample: "nube (cloud)", tip: "n" },
    { ch: "Ñ", name: "eñe", sample: "niño (child)", tip: "ny — like canyon" },
    { ch: "O", name: "o", sample: "ojo (eye)", tip: "oh" },
    { ch: "P", name: "pe", sample: "perro (dog)", tip: "p (no puff of air)" },
    { ch: "Q", name: "cu", sample: "queso (cheese)", tip: "k (always with u)" },
    { ch: "R", name: "erre", sample: "pero (but)", tip: "single tap of the tongue" },
    { ch: "S", name: "ese", sample: "sol (sun)", tip: "s" },
    { ch: "T", name: "te", sample: "tigre (tiger)", tip: "t (tongue on teeth)" },
    { ch: "U", name: "u", sample: "uva (grape)", tip: "oo" },
    { ch: "V", name: "uve", sample: "vaca (cow)", tip: "soft b / v" },
    { ch: "W", name: "uve doble", sample: "web", tip: "w (loanwords)" },
    { ch: "X", name: "equis", sample: "xilófono (xylophone)", tip: "ks" },
    { ch: "Y", name: "ye / i griega", sample: "yate (yacht)", tip: "y" },
    { ch: "Z", name: "zeta / ceta", sample: "zorro (fox)", tip: "th (Spain) · s (LatAm)" }
  ];

  var sounds = [
    { combo: "ñ", ipa: "/ɲ/", how: "Like the “ny” in canyon: niño = nee-nyo." },
    { combo: "rr", ipa: "/r/", how: "A trilled/rolled r: perro (dog) vs pero (but). Hold the tongue flutter." },
    { combo: "j · g(e,i)", ipa: "/x/", how: "A harsh raspy h from the throat: jamón, gente. Not an English j." },
    { combo: "z · c(e,i)", ipa: "/θ/ → /s/", how: "“th” in Spain (gracias), “s” in Latin America. Both are understood." },
    { combo: "b · v", ipa: "/b/ /β̞/", how: "Both are a soft b: hard at the start of a phrase, a gentle v between vowels." },
    { combo: "h", ipa: "—", how: "Always silent: hola = ola, hacer = acer." },
    { combo: "ll", ipa: "/ʝ/ → /dʒ/", how: "Usually a “y” (llave = ya-ve); in Argentina/Uruguay a “zh” sound." },
    { combo: "qu", ipa: "/k/", how: "The u is silent: queso = ke-so, que = ke." },
    { combo: "diphthongs", ipa: "ai au ei…", how: "Vowel pairs glide together as one syllable: aire = ai-re, causa = cau-sa." }
  ];

  function w(es, en, cat) { return { es: es, en: en, cat: cat }; }
  var glossary = [
    w("hola", "hello", "Greetings"), w("buenos días", "good morning", "Greetings"),
    w("buenas tardes", "good afternoon", "Greetings"), w("buenas noches", "good night", "Greetings"),
    w("adiós", "goodbye", "Greetings"), w("hasta luego", "see you later", "Greetings"),
    w("por favor", "please", "Greetings"), w("gracias", "thank you", "Greetings"),
    w("muchas gracias", "thank you very much", "Greetings"), w("de nada", "you're welcome", "Greetings"),
    w("perdón", "sorry / excuse me", "Greetings"), w("lo siento", "I'm sorry", "Greetings"),
    w("el hombre", "the man", "People"), w("la mujer", "the woman", "People"),
    w("el niño", "the child / boy", "People"), w("la niña", "the girl", "People"),
    w("el amigo", "the friend (m)", "People"), w("la amiga", "the friend (f)", "People"),
    w("la familia", "the family", "People"), w("la madre", "the mother", "People"),
    w("el padre", "the father", "People"), w("el hermano", "the brother", "People"),
    w("la hermana", "the sister", "People"), w("el hijo", "the son", "People"),
    w("la hija", "the daughter", "People"),
    w("el agua", "the water", "Food"), w("el café", "the coffee", "Food"),
    w("la leche", "the milk", "Food"), w("el pan", "the bread", "Food"),
    w("la manzana", "the apple", "Food"), w("la carne", "the meat", "Food"),
    w("el pescado", "the fish", "Food"), w("el pollo", "the chicken", "Food"),
    w("el arroz", "the rice", "Food"), w("las verduras", "the vegetables", "Food"),
    w("la fruta", "the fruit", "Food"), w("el desayuno", "breakfast", "Food"),
    w("el almuerzo", "lunch", "Food"), w("la cena", "dinner", "Food"),
    w("la cuenta", "the bill / check", "Food"),
    w("el aeropuerto", "the airport", "Travel"), w("el vuelo", "the flight", "Travel"),
    w("el billete", "the ticket", "Travel"), w("la maleta", "the suitcase", "Travel"),
    w("el hotel", "the hotel", "Travel"), w("la habitación", "the room", "Travel"),
    w("la llave", "the key", "Travel"), w("la reserva", "the reservation", "Travel"),
    w("la estación", "the station", "Travel"), w("el tren", "the train", "Travel"),
    w("el autobús", "the bus", "Travel"), w("el mapa", "the map", "Travel"),
    w("¿dónde está…?", "where is…?", "Travel"), w("la playa", "the beach", "Travel"),
    w("hoy", "today", "Time"), w("mañana", "tomorrow / morning", "Time"),
    w("ayer", "yesterday", "Time"), w("ahora", "now", "Time"),
    w("luego", "later", "Time"), w("temprano", "early", "Time"),
    w("tarde", "late / afternoon", "Time"), w("la hora", "the hour / time", "Time"),
    w("el día", "the day", "Time"), w("la semana", "the week", "Time"),
    w("el mes", "the month", "Time"), w("el año", "the year", "Time"),
    w("el reloj", "the clock / watch", "Time"),
    w("uno / una", "one", "Numbers"), w("dos", "two", "Numbers"), w("tres", "three", "Numbers"),
    w("cuatro", "four", "Numbers"), w("cinco", "five", "Numbers"), w("seis", "six", "Numbers"),
    w("siete", "seven", "Numbers"), w("ocho", "eight", "Numbers"), w("nueve", "nine", "Numbers"),
    w("diez", "ten", "Numbers"), w("veinte", "twenty", "Numbers"), w("cien", "one hundred", "Numbers"),
    w("mil", "one thousand", "Numbers"),
    w("la casa", "the house", "Places"), w("la ciudad", "the city", "Places"),
    w("la calle", "the street", "Places"), w("la tienda", "the shop", "Places"),
    w("el mercado", "the market", "Places"), w("la escuela", "the school", "Places"),
    w("el trabajo", "the work", "Places"), w("el parque", "the park", "Places"),
    w("el baño", "the bathroom", "Places"), w("la puerta", "the door", "Places"),
    w("bueno / buena", "good", "Everyday"), w("malo / mala", "bad", "Everyday"),
    w("grande", "big", "Everyday"), w("pequeño", "small", "Everyday"),
    w("nuevo", "new", "Everyday"), w("viejo", "old", "Everyday"),
    w("bonito", "pretty", "Everyday"), w("difícil", "difficult", "Everyday"),
    w("fácil", "easy", "Everyday"), w("mucho", "a lot", "Everyday"),
    w("poco", "a little", "Everyday"), w("muy", "very", "Everyday"),
    w("también", "also", "Everyday"), w("siempre", "always", "Everyday"),
    w("nunca", "never", "Everyday")
  ];

  var PRONOUNS = ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"];
  var verbs = [
    { inf: "ser", en: "to be (permanent)",
      present: ["soy", "eres", "es", "somos", "sois", "son"],
      preterite: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
      future: ["seré", "serás", "será", "seremos", "seréis", "serán"] },
    { inf: "estar", en: "to be (temporary / location)",
      present: ["estoy", "estás", "está", "estamos", "estáis", "están"],
      preterite: ["estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron"],
      future: ["estaré", "estarás", "estará", "estaremos", "estaréis", "estarán"] },
    { inf: "tener", en: "to have",
      present: ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"],
      preterite: ["tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron"],
      future: ["tendré", "tendrás", "tendrá", "tendremos", "tendréis", "tendrán"] },
    { inf: "hacer", en: "to do / to make",
      present: ["hago", "haces", "hace", "hacemos", "hacéis", "hacen"],
      preterite: ["hice", "hiciste", "hizo", "hicimos", "hicisteis", "hicieron"],
      future: ["haré", "harás", "hará", "haremos", "haréis", "harán"] },
    { inf: "ir", en: "to go",
      present: ["voy", "vas", "va", "vamos", "vais", "van"],
      preterite: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
      future: ["iré", "irás", "irá", "iremos", "iréis", "irán"] },
    { inf: "poder", en: "to be able / can",
      present: ["puedo", "puedes", "puede", "podemos", "podéis", "pueden"],
      preterite: ["pude", "pudiste", "pudo", "pudimos", "pudisteis", "pudieron"],
      future: ["podré", "podrás", "podrá", "podremos", "podréis", "podrán"] },
    { inf: "querer", en: "to want",
      present: ["quiero", "quieres", "quiere", "queremos", "queréis", "quieren"],
      preterite: ["quise", "quisiste", "quiso", "quisimos", "quisisteis", "quisieron"],
      future: ["querré", "querrás", "querrá", "queremos", "querréis", "querrán"] },
    { inf: "decir", en: "to say / to tell",
      present: ["digo", "dices", "dice", "decimos", "decís", "dicen"],
      preterite: ["dije", "dijiste", "dijo", "dijimos", "dijisteis", "dijeron"],
      future: ["diré", "dirás", "dirá", "diremos", "diréis", "dirán"] },
    { inf: "ver", en: "to see",
      present: ["veo", "ves", "ve", "vemos", "veis", "ven"],
      preterite: ["vi", "viste", "vio", "vimos", "visteis", "vieron"],
      future: ["veré", "verás", "verá", "veremos", "veréis", "verán"] },
    { inf: "dar", en: "to give",
      present: ["doy", "das", "da", "damos", "dais", "dan"],
      preterite: ["di", "diste", "dio", "dimos", "disteis", "dieron"],
      future: ["daré", "darás", "dará", "daremos", "daréis", "darán"] }
  ];

  window.REFERENCE = {
    alphabet: alphabet,
    sounds: sounds,
    glossary: glossary,
    pronouns: PRONOUNS,
    verbs: verbs
  };
})();

