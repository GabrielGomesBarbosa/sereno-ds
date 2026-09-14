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
hard block. Slots with no `capacity` render exactly as before, unless mixed
into a list where a sibling slot does track capacity — then they grow the
same two-line layout with a generic "Disponível"/"Available" filler instead
of looking short next to their neighbors. Fully backward compatible for a
`times` list with no capacity anywhere.

Also adds a `locale?: 'pt-BR' | 'en'` prop to `DateTimePicker` (and the
shared internal `CalendarGrid`), defaulting to `'pt-BR'` — the real Sereno
product always renders in Portuguese; `'en'` exists only so the docs
showcase can demo an English-speaking consumer without forking the
component.
