/* ============================================================
   Habla Libre — Conversation (5)
   Real everyday dialogue: small talk, plans, opinions, phone,
   telling stories. Plain ES5, runs from file://
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

  /* ============ Unit C1 · Conversation ============ */

  lesson("conv-1", "Small talk & introductions", "👋", [
    mc('How do you ask "What is your name?" (formal)?', ["¿Cómo se llama usted?", "¿Qué tal?", "¿Cuántos años tiene?"], "¿Cómo se llama usted?"),
    tr("Nice to meet you", ["Mucho gusto", "Encantado / Encantada"]),
    mt([["¿De dónde eres?", "Where are you from?"], ["¿A qué te dedicas?", "What do you do for work?"], ["¿Cuántos años tienes?", "How old are you?"], ["¿Hablas español?", "Do you speak Spanish?"]]),
    ls(["Soy de los Estados Unidos"]),
    mc('"¿A qué te dedicas?" asks about:', ["your job", "your hobbies", "your family"], "your job"),
    tr("I am a student", ["Soy estudiante", "Estudio"]),
    bl("Mucho ___, me llamo Ana.", ["gusto", "gracias", "vale"], "gusto"),
    mc('"Encantado / Encantada" means:', ["Delighted to meet you", "Goodbye", "See you soon"], "Delighted to meet you"),
    tr("Where are you from?", ["¿De dónde eres?"]),
    ls(["¿Hablas inglés?"])
  ], {
    film: "Meeting someone new · Conversation",
    quote: "—¡Hola! Me llamo Carlos. ¿Y tú? —Mucho gusto, soy Lucía.",
    en: "—Hi! My name is Carlos. And you? —Nice to meet you, I'm Lucía.",
    note: "“¿Y tú?” (and you?) is the fastest way to bounce a question back in conversation."
  });

  lesson("conv-2", "Making plans & invitations", "📆", [
    mc('How do you invite someone casually?', ["¿Te apetece…?", "¿Qué pasa?", "No sé"], "¿Te apetece…?"),
    tr("Do you want to grab a coffee?", ["¿Quieres tomar un café?"]),
    mt([["quedar", "to meet up"], ["el plan", "the plan"], ["¿Nos vemos?", "Shall we meet?"], ["más tarde", "later"], ["mañana", "tomorrow"]]),
    ls(["¿Quedamos a las ocho?"]),
    mc('"Me encantaría, pero no puedo" means:', ["I'd love to, but I can't", "I don't want to", "Maybe later"], "I'd love to, but I can't"),
    tr("What are you doing this weekend?", ["¿Qué haces este fin de semana?"]),
    bl("___ ir al cine esta noche.", ["Podríamos", "Puedo", "Puedes"], "Podríamos"),
    mc('"Podríamos…" suggests:', ["we could…", "I can…", "you can…"], "we could…"),
    tr("I am free on Saturday", ["Estoy libre el sábado", "Tengo libre el sábado"]),
    ls(["¡Qué buen plan!"])
  ], {
    film: "Making plans · Conversation",
    quote: "—¿Te apetece cenar el viernes? —¡Me encantaría! ¿A qué hora?",
    en: "—Fancy dinner on Friday? —I'd love to! What time?",
    note: "“¿Te apetece…?” (do you feel like…?) is the most natural, low-pressure invitation in Spain."
  });

  lesson("conv-3", "Opinions & feelings", "💭", [
    mc('How do you say "I think…"?', ["Creo que…", "Digo que…", "Quiero que…"], "Creo que…"),
    tr("In my opinion, it is good", ["En mi opinión, es bueno", "Para mí, es bueno"]),
    mt([["estoy de acuerdo", "I agree"], ["no estoy de acuerdo", "I disagree"], ["me parece bien", "seems good to me"], ["tienes razón", "you're right"], ["no lo sé", "I don't know"]]),
    ls(["¿Qué te parece la idea?"]),
    mc('"¿Qué te parece…?" asks:', ["What do you think about…?", "What do you want…?", "What happened…?"], "What do you think about…?"),
    tr("I am very happy today", ["Estoy muy feliz hoy", "Hoy estoy muy contento"]),
    bl("No estoy de ___ contigo.", ["acuerdo", "gustar", "razón"], "acuerdo"),
    mc('"Estoy de acuerdo" means:', ["I agree", "I understand", "I remember"], "I agree"),
    tr("I feel tired", ["Estoy cansado", "Estoy cansada"]),
    ls(["Me parece una buena idea"])
  ], {
    film: "Sharing opinions · Conversation",
    quote: "—Creo que la película es buena. —Sí, estoy de acuerdo contigo.",
    en: "—I think the movie is good. —Yes, I agree with you.",
    note: "Use “creo que” + indicative for opinions; save the subjunctive for doubt and wishes."
  });

  lesson("conv-4", "Phone calls & messages", "📱", [
    mc('How do you answer the phone in Spanish?', ["¿Dígame? / ¿Bueno?", "¿Cómo estás?", "¿Dónde estás?"], "¿Dígame? / ¿Bueno?"),
    tr("Can I speak to María?", ["¿Puedo hablar con María?"]),
    mt([["el mensaje", "the message"], ["llamar", "to call"], ["colgar", "to hang up"], ["dejar un recado", "to leave a message"], ["el número", "the number"]]),
    ls(["Te llamo más tarde"]),
    mc('"Ahora no puede, ¿quién la llama?" asks:', ["Who is calling?", "Can she call?", "Is she there?"], "Who is calling?"),
    tr("I will send you a message", ["Te voy a enviar un mensaje", "Te mando un mensaje"]),
    bl("¿___ quién hablo?", ["Con", "A", "De"], "Con"),
    mc('"¿De parte de quién?" means:', ["Who is calling? (on whose behalf?)", "Which part?", "Where from?"], "Who is calling? (on whose behalf?)"),
    tr("The line is busy", ["La línea está ocupada", "Está comunicando"]),
    ls(["Un momento, por favor"])
  ], {
    film: "A phone call · Conversation",
    quote: "—Bueno, ¿dígame? —Hola, ¿puedo hablar con Marta? —Soy yo, ¿quién es?",
    en: "—Hello, go ahead? —Hi, can I speak to Marta? —Speaking. Who is this?",
    note: "“Soy yo” (it's me) is how you say you're the person being asked for on the phone."
  });

  lesson("conv-5", "Telling stories (the past)", "📖", [
    mc('Which past tense do you use for a completed action?', ["el pretérito", "el imperfecto", "el presente"], "el pretérito"),
    tr("Yesterday I went to the beach", ["Ayer fui a la playa"]),
    mt([["entonces", "then"], ["de repente", "suddenly"], ["al final", "in the end"], ["primero", "first"], ["después", "afterwards"]]),
    ls(["Fue un día increíble"]),
    mc('"Estaba lloviendo" (imperfect) describes:', ["ongoing background weather", "a sudden finished event", "a future plan"], "ongoing background weather"),
    tr("What happened next?", ["¿Qué pasó después?"]),
    bl("Ayer ___ un accidente en la calle.", ["hubo", "había mucho", "hay"], "hubo"),
    mc('"Había mucha gente" uses imperfect to mean:', ["there were lots of people (scene-setting)", "there was an event", "people arrived"], "there were lots of people (scene-setting)"),
    tr("We laughed a lot", ["Nos reímos mucho"]),
    ls(["Al final, todo salió bien"])
  ], {
    film: "Telling a story · Conversation",
    quote: "—¿Qué tal el viaje? —Increíble. Fuimos a la playa, comimos paella y al final vimos el atardecer.",
    en: "—How was the trip? —Amazing. We went to the beach, ate paella, and in the end watched the sunset.",
    note: "Native speakers weave pretérito (what happened) and imperfecto (the background) together in one story."
  });

  /* ============ Register Conversation course ============ */

  C.push({
    id: "conv",
    title: "Conversation",
    desc: "Speak from day one: small talk, plans, opinions, calls & real-life stories",
    color: "#ff4b8b",
    icon: "💬",
    units: [
      { id: "c1", title: "Unit C1 · Real conversations", sub: "Introductions to telling stories", lessons: ["conv-1", "conv-2", "conv-3", "conv-4", "conv-5"] }
    ]
  });
})();

