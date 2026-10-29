
"use strict";

/* =====================================
   ROXHENS & ORJANA
   WEDDING INVITATION
===================================== */


/* =====================================
   CONFIGURATION
===================================== */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwBuDgZHnY-34x9Qv7M8wWn_Ch_G5LxBwuNKt_T-cttjR2j4lfCyn4FXXsY13kRuQDj-g/exec";


/* =====================================
   WEDDING DATE
===================================== */

const WEDDING_DATE = new Date(
    "2027-08-29T19:00:00+02:00"
).getTime();


/* =====================================
   INTRO TRANSITION
===================================== */

const intro = document.getElementById("invitationIntro");

const openButton = document.getElementById("readMoreButton");

const website = document.getElementById("weddingWebsite");

let opened = false;

window.scrollTo(0, 0);

openButton.addEventListener("click", () => {

    if (opened) return;

    opened = true;

    openButton.disabled = true;

    intro.classList.add("intro-hidden");

    setTimeout(() => {

        website.classList.add("website-visible");

        website.inert = false;

    }, 300);

    setTimeout(() => {

        document.body.classList.remove("intro-active");

        window.scrollTo(0, 0);

    }, 850);

    setTimeout(() => {

        intro.remove();

    }, 1300);

});


/* =====================================
   SCROLL REVEAL ANIMATION
===================================== */

const revealObserver = new IntersectionObserver(

    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("is-visible");

                revealObserver.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.16
    }

);


document.querySelectorAll(".reveal").forEach((element) => {

    revealObserver.observe(element);

});


/* =====================================
   COUNTDOWN
===================================== */

function updateCountdown() {

    const remaining = Math.max(
        0,
        WEDDING_DATE - Date.now()
    );

    const units = {

        days: Math.floor(
            remaining / 86400000
        ),

        hours: Math.floor(
            remaining / 3600000
        ) % 24,

        minutes: Math.floor(
            remaining / 60000
        ) % 60,

        seconds: Math.floor(
            remaining / 1000
        ) % 60

    };

    Object.entries(units).forEach(([id, value]) => {

        const element = document.getElementById(id);

        if (element) {

            element.textContent = String(value).padStart(2, "0");

        }

    });

}


updateCountdown();

setInterval(updateCountdown, 1000);


/* =====================================
   RSVP FORM
===================================== */

const form = document.getElementById("rsvpForm");

const guestWrap = document.getElementById("guestWrap");

const guests = document.getElementById("guests");

const status = document.getElementById("status");

const submit = document.getElementById("submitButton");


/* =====================================
   ATTENDANCE SELECTION
===================================== */

if (form && guestWrap && guests) {

    form.querySelectorAll(
        'input[name="attendance"]'
    ).forEach((radio) => {

        radio.addEventListener("change", () => {

            const attending =
                form.elements.attendance.value === "Po";

            guestWrap.hidden = !attending;

            guests.required = attending;

            if (!attending) {

                guests.value = "";

            }

        });

    });

}


/* =====================================
   RSVP SUBMISSION
===================================== */

if (form && status && submit) {

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        status.textContent = "";

        status.style.color = "";


        if (!GOOGLE_SCRIPT_URL) {

            status.textContent =
                "Formulari nuk është lidhur ende me Google Sheets.";

            return;

        }


        const attendanceInput = form.elements.attendance;

        if (!attendanceInput || !attendanceInput.value) {

            status.style.color = "#a33b43";

            status.textContent =
                "Ju lutemi, zgjidhni nëse do të merrni pjesë.";

            return;

        }


        const payload = {

            name: form.elements.name.value.trim(),

            attendance: attendanceInput.value,

            guests: attendanceInput.value === "Po"
                ? guests.value
                : "0",

            message: form.elements.message.value.trim()

        };


        submit.disabled = true;

        submit.textContent = "DUKE DËRGUAR...";


        try {

            await fetch(GOOGLE_SCRIPT_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body: JSON.stringify(payload),

                mode: "no-cors"

            });


            status.style.color = "#386b4a";

            status.textContent =
                "Faleminderit! Përgjigjja juaj u dërgua. ♡";


            form.reset();

            if (guestWrap) {

                guestWrap.hidden = true;

            }

            if (guests) {

                guests.required = false;

            }

        }

        catch (error) {

            console.error("RSVP submission error:", error);

            status.style.color = "#a33b43";

            status.textContent =
                "Dërgimi nuk u realizua. Ju lutemi, provoni përsëri më vonë.";

        }

        finally {

            submit.disabled = false;

            submit.textContent = "DËRGO KONFIRMIMIN ♡";

        }

    });

}

