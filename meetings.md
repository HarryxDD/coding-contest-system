# Meetings minutes

## Meeting 1.
* **DATE:** 06.02.2026, 09:55 - 10:20
* **PARTICIPANTS:** Vu Truong, Mubeen Khan, Eshmam Rayed
* **TEACHER:** Iván Sánchez Milara

### Action points
- Update the related work section with a better API example that properly follows REST principles including correct HTTP method usage
- The Eventbrite API was flagged as a weak example because it uses POST for updates instead of PATCH, which does not follow REST conventions properly
- Provide examples where PATCH and DELETE methods are used, or remove the classification claim and reconsider the API type
- Add a Use of AI tools section to the document

### Notes
- Instructor mentioned marks will be deducted for the related work section but can be recovered in the final meeting with a corrected example

## Meeting 2.
* **DATE:** 19.02.2026, 10:00 - 10:30
* **PARTICIPANTS:** Vu Truong, Mubeen Khan, Eshmam Rayed, Muhammad Abdur Rehman
* **TEACHER:** Iván Sánchez Milara

### Action points
- Overall database design was good but the project scope was flagged as too large and could be reduced
- Junction tables like team_members and judge_assignments were noted as having unnecessary extra columns. A pure junction table only needs the two foreign key IDs and a composite primary key, the additional fields like joined_at and assigned_at are not strictly necessary
- Add a Use of AI tools section to the document

### Notes
- Instructor was generally happy with the database structure and relationships

## Meeting 3.
* **DATE:** 11.03.2026, 10:30 - 11:00
* **PARTICIPANTS:** Vu Truong, Mubeen Khan, Eshmam Rayed, Muhammad Abdur Rehman
* **TEACHER:** Iván Sánchez Milara

### Action points
- Restructure API URLs to follow a proper resource hierarchy, for example team members should sit under `/teams/:id/members` rather than as a flat resource
- Judge assignments should be nested under contests rather than exposed as a separate root-level resource
- Check and improve authentication token handling
- Connectedness will be reviewed in the next deliverable
- Add a link to NestJS best practices in the project documentation
- Add code documentation to all public methods across the codebase
- Justify which files are excluded from test coverage, focusing on the fact that what needs testing is the API itself
- Document how URL converters are implemented and note that ParseUUIDPipe is supported by default in NestJS

### Notes
- Instructor reviewed the resource table and pointed out that the hierarchy was too flat with most resources connecting directly to root

## Meeting 4 (Midterm meeting)
* **DATE:** 16.04.2026, 09:30 - 10:00 AM
* **PARTICIPANTS:** Vu Truong, Mubeen Khan, Eshmam Rayed, Muhammad Abdur Rehman
* **TEACHER:** Iván Sánchez Milara

### Action points
- Add root element information to the Swagger documentation structure
- Add response body examples to the Swagger documentation, not just in the code
- Provide different response examples for mandatory and optional fields where applicable
- Connectedness will be reviewed again in this deliverable
- Verify that all 201 responses return the newly created resource in the response body or include a Location header with the resource URL
- Add error response codes to the Swagger documentation

### Notes
- Instructor noted that responses and error codes were implemented in the code but were not visible in the Swagger UI

## Final meeting
* **DATE:** 18.05.2026, 13:00 - 14:00
* **PARTICIPANTS:** Vu Truong, Mubeen Khan, Eshmam Rayed, Muhammad Abdur Rehman
* **TEACHER:** Iván Sánchez Milara

### Minutes
*Summary of what was discussed during the meeting*

### Notes
*Add here notes that you consider important. This is not mandatory*