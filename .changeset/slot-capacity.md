---
"@sereno-ds/ui": minor
---

`DateTimePicker`'s `times` slots now support `capacity`/`booked` (SS-64), for
group sessions and classes that hold more than one person. A slot with
`capacity` set shows "booked de capacity vagas"; once `booked` reaches
`capacity` it switches to a warning look and reads "Lotado" via the same
warning tone used by `Badge`/`Alert`.

A full slot is **not** the same as a disabled one — it stays clickable by
default, since reaching capacity is a state the caller may still choose to
allow (a deliberate overbook). Set `disabled: true` on top for the actual
hard block. Slots with no `capacity` render exactly as before — fully
backward compatible.
