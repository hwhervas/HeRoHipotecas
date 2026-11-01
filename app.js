/* Hero Hipotecas · formulario «Pedir cita»
   -----------------------------------------------------------
   GitHub Pages es una web estática y no puede enviar correos por sí sola.
   Para recibir los formularios en tu correo, crea un formulario gratuito en
   https://formspree.io, copia su dirección (algo como
   https://formspree.io/f/abcdwxyz) y pégala aquí abajo.
   ----------------------------------------------------------- */
const FORM_ENDPOINT = "https://formspree.io/f/TU_CODIGO";

(function () {
  const TELEFONO = "654 83 01 23";

  const html = `
  <dialog class="cita" id="dialogo-cita" aria-labelledby="cita-titulo">
    <div class="cita-in">
      <button type="button" class="cerrar" aria-label="Cerrar formulario" data-cerrar>&times;</button>
      <div id="cita-formulario">
        <h2 id="cita-titulo">Pide tu cita</h2>
        <p class="sub">Déjanos tus datos y te llamamos en la franja que prefieras.</p>
        <form id="form-cita" novalidate>
          <input type="hidden" name="_subject" value="Nueva solicitud de cita · Hero Hipotecas">
          <div>
            <label class="t" for="c-nombre">Nombre y apellidos</label>
            <input type="text" id="c-nombre" name="nombre" autocomplete="name" required>
          </div>
          <div>
            <label class="t" for="c-movil">Móvil</label>
            <input type="tel" id="c-movil" name="movil" autocomplete="tel" inputmode="tel" placeholder="6xx xx xx xx" required>
          </div>
          <div>
            <label class="t" for="c-email">Correo electrónico</label>
            <input type="email" id="c-email" name="email" autocomplete="email" required>
          </div>
          <fieldset>
            <legend>Franja horaria preferida para llamarte</legend>
            <div class="franjas">
              <label><input type="radio" name="franja" value="Mañana · 09:00 a 13:00" required> Mañana · 09:00 a 13:00</label>
              <label><input type="radio" name="franja" value="Mediodía · 13:00 a 16:00"> Mediodía · 13:00 a 16:00</label>
              <label><input type="radio" name="franja" value="Tarde · 16:00 a 20:00"> Tarde · 16:00 a 20:00</label>
            </div>
          </fieldset>
          <label class="privacidad">
            <input type="checkbox" name="privacidad" value="Acepta" required>
            <span>He leído y acepto la <a href="politica-privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</span>
          </label>
          <p class="estado" id="cita-estado" role="status" aria-live="polite"></p>
          <button type="submit" class="btn btn-primary" id="cita-enviar">Enviar</button>
        </form>
      </div>
      <div class="gracias" id="cita-gracias" hidden>
        <div class="tic" aria-hidden="true">&check;</div>
        <h2>Recibido, gracias</h2>
        <p>Te llamaremos en la franja que has elegido.</p>
        <button type="button" class="btn btn-dark" data-cerrar>Cerrar</button>
      </div>
    </div>
  </dialog>`;

  document.body.insertAdjacentHTML("beforeend", html);

  const dialogo = document.getElementById("dialogo-cita");
  const formulario = document.getElementById("cita-formulario");
  const gracias = document.getElementById("cita-gracias");
  const form = document.getElementById("form-cita");
  const estado = document.getElementById("cita-estado");
  const enviar = document.getElementById("cita-enviar");
  let disparador = null;

  function abrir(e) {
    e.preventDefault();
    disparador = e.currentTarget;
    formulario.hidden = false;
    gracias.hidden = true;
    estado.textContent = "";
    estado.className = "estado";
    if (typeof dialogo.showModal === "function") {
      dialogo.showModal();
    } else {
      dialogo.setAttribute("open", "");
    }
    document.getElementById("c-nombre").focus();
  }

  function cerrar() {
    if (dialogo.open) dialogo.close();
    if (disparador) disparador.focus();
  }

  document.querySelectorAll("[data-cita]").forEach(function (b) {
    b.addEventListener("click", abrir);
  });
  dialogo.querySelectorAll("[data-cerrar]").forEach(function (b) {
    b.addEventListener("click", cerrar);
  });
  dialogo.addEventListener("click", function (e) {
    if (e.target === dialogo) cerrar();
  });

  function error(texto) {
    estado.textContent = texto;
    estado.className = "estado error";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    estado.className = "estado";
    estado.textContent = "";

    const datos = new FormData(form);
    const nombre = (datos.get("nombre") || "").trim();
    const movil = (datos.get("movil") || "").replace(/[\s.-]/g, "").replace(/^(\+34|0034)/, "");
    const email = (datos.get("email") || "").trim();

    if (nombre.split(/\s+/).length < 2) return error("Escribe tu nombre y apellidos.");
    if (!/^[679]\d{8}$/.test(movil)) return error("Escribe un móvil de 9 cifras, por ejemplo 654 83 01 23.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return error("Revisa el correo electrónico: parece que falta algo.");
    if (!datos.get("franja")) return error("Elige una franja horaria para que te llamemos.");
    if (!datos.get("privacidad")) return error("Marca la casilla de la política de privacidad para continuar.");

    if (FORM_ENDPOINT.indexOf("TU_CODIGO") !== -1) {
      return error("El formulario aún no está activado. Llámanos al " + TELEFONO + " y te atendemos enseguida.");
    }

    datos.set("nombre", nombre);
    datos.set("movil", movil);
    datos.set("email", email);

    enviar.disabled = true;
    enviar.textContent = "Enviando…";
    try {
      const resp = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: datos,
        headers: { Accept: "application/json" }
      });
      if (!resp.ok) throw new Error("respuesta " + resp.status);
      form.reset();
      formulario.hidden = true;
      gracias.hidden = false;
    } catch (err) {
      error("No hemos podido enviar tus datos. Inténtalo de nuevo o llámanos al " + TELEFONO + ".");
    } finally {
      enviar.disabled = false;
      enviar.textContent = "Enviar";
    }
  });
})();
