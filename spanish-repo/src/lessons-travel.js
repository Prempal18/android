/* ============================================================
   Habla Libre — Travel Spanish (5) + Conversation (5)
   Practical, real-world situations. Plain ES5, runs from file://
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

  /* ============ Unit T1 · Travel — Airport & Hotel ============ */

  lesson("travel-1", "At the airport", "✈️", [
    mc('How do you say "the flight"?', ["el vuelo", "el barco", "el tren"], "el vuelo"),
    ls(["Quiero un billete a Madrid"]),
    mt([["el aeropuerto", "the airport"], ["la maleta", "the suitcase"], ["la puerta de embarque", "the boarding gate"], ["el pasaporte", "the passport"], ["el equipaje", "the luggage"]]),
    tr("Where is the boarding gate?", ["¿Dónde está la puerta de embarque?"]),
    mc('What does "facturar el equipaje" mean?', ["to check in luggage", "to find the exit", "to board the plane"], "to check in luggage"),
    tr("I have one suitcase", ["Tengo una maleta"]),
    ls(["El vuelo sale a las ocho"]),
    mc('"el asiento" means:', ["the seat", "the window", "the ticket"], "the seat"),
    bl("___ el billete, por favor.", ["Necesito", "Tengo que", "Es"], "Necesito"),
    tr("My flight is delayed", ["Mi vuelo está retrasado", "Mi vuelo tiene retraso"])
  ], {
    film: "Airport check-in · Travel Spanish",
    quote: "—Buenos días, ¿tiene su pasaporte? —Sí, aquí lo tiene.",
    en: "—Good morning, do you have your passport? —Yes, here it is.",
    note: "“Aquí lo tiene” (here it is) is the polite you-form you'll hear constantly at Spanish check-in desks."
  });

  lesson("travel-2", "At the hotel", "🏨", [
    mc('How do you say "the room"?', ["la habitación", "el cuarto de casa", "la puerta"], "la habitación"),
    tr("I have a reservation", ["Tengo una reserva"]),
    mt([["la llave", "the key"], ["la recepción", "the front desk"], ["la planta baja", "the ground floor"], ["el ascensor", "the elevator"], ["la toalla", "the towel"]]),
    ls(["¿La habitación tiene wifi?"]),
    mc('"¿A qué hora es el desayuno?" asks:', ["What time is breakfast?", "Where is breakfast?", "Can I have breakfast?"], "What time is breakfast?"),
    tr("The room is on the third floor", ["La habitación está en la tercera planta", "La habitación está en el tercer piso"]),
    bl("Quisiera una habitación ___.", ["doble", "dos veces", "segundo"], "doble"),
    mc('"una habitación doble" is:', ["a double room", "a second room", "two keys"], "a double room"),
    tr("Is there a problem with the hot water?", ["¿Hay un problema con el agua caliente?"])
  ], {
    film: "Hotel reception · Travel Spanish",
    quote: "—Tengo una reserva a nombre de García. —Perfecto, habitación doble, dos noches.",
    en: "—I have a reservation under the name García. —Perfect, a double room, two nights.",
    note: "“A nombre de…” (under the name of…) is the exact phrase for picking up reservations."
  });

  lesson("travel-3", "At the restaurant", "🍽️", [
    mc('How do you ask for the menu?', ["¿Me trae la carta?", "¿Dónde está la cama?", "¿Tienen llave?"], "¿Me trae la carta?"),
    tr("A table for two, please", ["Una mesa para dos, por favor"]),
    mt([["el camarero", "the waiter"], ["la cuenta", "the bill"], ["el plato", "the dish"], ["la propina", "the tip"], ["el menú del día", "the set lunch menu"]]),
    ls(["De primero, quiero sopa"]),
    mc('"De primero / de segundo" refers to:', ["first / second course", "one / two people", "breakfast / dinner"], "first / second course"),
    tr("I am vegetarian", ["Soy vegetariano", "Soy vegetariana"]),
    bl("¿Nos trae ___, por favor?", ["la cuenta", "la llave", "la cama"], "la cuenta"),
    mc('What does "Está riquísimo" mean?', ["It's delicious", "It's expensive", "It's cold"], "It's delicious"),
    tr("Without onions, please", ["Sin cebolla, por favor"]),
    ls(["¿Me pone un café, por favor?"])
  ], {
    film: "Ordering at a restaurant · Travel Spanish",
    quote: "—¿Qué va a tomar? —De primero una ensalada y de segundo pescado.",
    en: "—What will you have? —A salad for the first course and fish for the second.",
    note: "“¿Me pone…?” (can you give me…?) is the everyday, polite way to ask for something at the table."
  });

  lesson("travel-4", "Directions & getting around", "🧭", [
    mc('How do you say "on the right"?', ["a la derecha", "a la izquierda", "de frente"], "a la derecha"),
    tr("How do I get to the station?", ["¿Cómo llego a la estación?"]),
    mt([["la calle", "the street"], ["la esquina", "the corner"], ["el semáforo", "the traffic light"], ["todo recto", "straight ahead"], ["cerca / lejos", "near / far"]]),
    ls(["Gire a la izquierda en el semáforo"]),
    mc('"Está a dos calles" means:', ["It's two blocks away", "It's two streets long", "It's closed"], "It's two blocks away"),
    tr("I am looking for the museum", ["Busco el museo"]),
    bl("Siga ___ y luego doble a la derecha.", ["todo recto", "atrás", "izquierda"], "todo recto"),
    mc('"¿Está muy lejos?" asks:', ["Is it very far?", "Is it very big?", "Is it open?"], "Is it very far?"),
    tr("The bus stop is near the park", ["La parada de autobús está cerca del parque"]),
    ls(["El metro es más rápido"])
  ], {
    film: "Asking for directions · Travel Spanish",
    quote: "—Perdone, ¿hay un banco por aquí? —Sí, todo recto y a la derecha.",
    en: "—Excuse me, is there a bank around here? —Yes, straight ahead and to the right.",
    note: "“Perdone” (excuse me) opens almost every question to a stranger politely in Spain."
  });

  lesson("travel-5", "Emergencies & help", "🆘", [
    mc('How do you say "help"?', ["¡Ayuda!", "¡Cuidado!", "¡Vale!"], "¡Ayuda!"),
    tr("I need a doctor", ["Necesito un médico", "Necesito un doctor"]),
    mt([["la farmacia", "the pharmacy"], ["el hospital", "the hospital"], ["la policía", "the police"], ["urgente", "urgent"], ["duele", "it hurts"]]),
    ls(["¡Llame a una ambulancia!"]),
    mc('"Me duele la cabeza" means:', ["My head hurts", "My head is hot", "I have a hat"], "My head hurts"),
    tr("I have lost my passport", ["He perdido mi pasaporte"]),
    bl("___ una emergencia, llame al 112.", ["En caso de", "Porque", "Antes de"], "En caso de"),
    mc('The emergency number in Spain & the EU is:', ["112", "911", "911 and 112"], "112"),
    tr("Can you help me, please?", ["¿Me puede ayudar, por favor?"]),
    ls(["No me siento bien"])
  ], {
    film: "Getting help · Travel Spanish",
    quote: "—¿Qué le pasa? —Me duele mucho el estómago.",
    en: "—What's wrong? —My stomach hurts a lot.",
    note: "“¿Qué le pasa?” (what's wrong?) is what a pharmacist or doctor will ask first."
  });

  /* ============ Register Travel course ============ */

  C.push({
    id: "travel",
    title: "Travel Spanish",
    desc: "Survive & thrive abroad: airport, hotel, restaurants, directions & emergencies",
    color: "#1cb0f6",
    icon: "✈️",
    units: [
      { id: "t1", title: "Unit T1 · Getting there", sub: "Airport & hotel check-in", lessons: ["travel-1", "travel-2"] },
      { id: "t2", title: "Unit T2 · Out and about", sub: "Eating out, getting around & getting help", lessons: ["travel-3", "travel-4", "travel-5"] }
    ]
  });
})();

