# Product-domain components

These four cards — `ServiceCard`, `ProfessionalCard`, `AppointmentCard`,
`WeeklyScheduleEditor` — are **not** part of `@sereno-ds/ui`. They encode Sereno's
product domain (a service has a duration and price, a professional has a
credential, an appointment has a status lifecycle, availability is a working
week), which a generic Design System should not ship.

They live here as a **worked example**: this is how you build product components
on top of the DS — compose `@sereno-ds/ui` primitives (`Card`, `Badge`, `Avatar`,
`Switch`, `Select`), keep styles token-driven, reach for a local `sx` helper for
the loose style maps.

The real Sereno app (epic SS-104) builds its own on demand; treat these as a
starting point, not a contract.

`WeeklyScheduleEditor`'s one narrow-screen reflow rule lives in
`apps/demo/app/globals.css` (it moved out of `@sereno-ds/ui/styles.css` with the
component).
