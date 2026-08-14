# MongoDB Schema Reference

Database: `hsotap`. All models live in `packages/server/src/models/`.

| Collection            | Purpose                                                                 | Key relations |
|------------------------|--------------------------------------------------------------------------|----------------|
| `students`             | Master student profile (identity, program, health flags)                | — |
| `vitalslogs`            | Every kiosk vitals reading (temp/height/weight/BMI) + secondary vitals   | → `students` |
| `queueentries`          | Live queue rows shown on the Nurse/Doctor Dashboard                       | → `students`, `vitalslogs` |
| `consultationrecords`   | SOAP notes, medication/relief, general inquiry — the "Active Session" tab | → `students`, `queueentries`, `users` |
| `externaldocuments`     | Files synced from Microsoft Forms (Health Declaration, X-Ray, etc.)       | → `students` |
| `formpipelines`         | Config for each connected MS Forms webhook (MF01, MF02...)                | — |
| `synclogs`              | Every inbound webhook attempt, matched/unmatched/exception                | → `students`, `formpipelines` |
| `users`                 | Staff/admin login accounts                                                | — |

## Indexing notes
- `students.studentId` and `students.rfidTagUid` are unique-indexed — these are your two lookup
  paths from the kiosk (manual entry vs. tap).
- `vitalslogs.student`, `queueentries.student`, `consultationrecords.student`,
  `externaldocuments.student` are all indexed for fast EMR-tab queries (`getFullEmr` does 3 parallel
  queries by student `_id`).

## Why separate `vitalslogs` from `consultationrecords`
The kiosk writes vitals *before* any human is involved (self-service screening). A consultation may
or may not happen afterward, and when it does, its `linkedVitals`-equivalent (referenced via
`queueEntry.linkedVitals`) lets the nurse pull the kiosk-captured temp/height/weight into the
session without re-measuring. Keeping them separate also makes the Data Analytics charts (illness
trends, BMI distribution) simple aggregations over `vitalslogs` alone.

## Seeding an admin user
There's no seed script in the scaffold yet — add one under `packages/server/src/scripts/seedAdmin.js`
that hashes a password with `bcryptjs` and inserts a `User` with `role: "admin"`.

## Master data bulk upload
`POST /api/students/bulk-upload` expects `{ rows: [...], mode }` where `rows` is already-parsed
JSON (parse the CSV/XLSX client-side in admin-portal with a library like `papaparse` or `xlsx`
before sending — keeps the server simple and gives you the "Data Preview & Mapping Validation"
step shown in the Admin screen for free, in the browser).
