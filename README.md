# Welcome to the VendorPM BE Technical Assessment

This repo represents a basic shell of a Typescript app whose end goal will be for it to manage CRUD for users and
some related info.

The code is incomplete, and your task will be to take what is currently in the repo and add required functionality based
on a list of requirements in the project's README file. These requirements will be split into a few sections that
increase in difficulty based on what level of position you are applying to:

- Main (These are the base level tasks and everyone is expected to complete these)
- Intermediate
- Senior
- Bonus (Anyone can attempt these, and are *not* required to be completed)

You will be expected to complete only the sections according what level you are applying to and below. IE: If you are
applying to an Intermediate position you will be expected to complete the Main and Intermediate sections, you are *not*
expected to attempt the Senior requirements, but someone applying to a Senior position will be expected to complete
all 3.

In terms of the Bonus section, these tasks are *not* required to be completed for any level position, they are purely
there to give you additional ways to show off your skill set if you wish to.

## Prerequisites

- Read the **README** fully.
- This application is built using the following main tech:
  - [TypeORM](https://github.com/typeorm/typeorm)
  - [Serverless](https://www.serverless.com/)
  - [Zod](https://github.com/colinhacks/zod)

### Windows

If you are running a windows machine then note that you will have to set up and run this application out
of [WSL](https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux). Setting that up is left as an exercise for the
applicant as it is way out of scope of this assignment,
but [here are the instructions from microsoft](https://learn.microsoft.com/en-us/windows/wsl/install).

IDE/editor setup will also need to be changed to allow for WSL based development:

* Jetbrains (specifically webstorm link but should apply to all of them): https://www.jetbrains.com/help/webstorm/how-to-use-wsl-development-environment-in-product.html
* VSCode: https://code.visualstudio.com/blogs/2019/09/03/wsl2

### To run the application for the first time:

```bash
yarn
yarn migrate:run
yarn start
```

The `yarn start` command will hot-reload the code for you during development as well.

If you're wondering where to start, the `./handler.ts` file is the main entrypoint that serverless looks into to
reference handlers for specific URIs from the `serverless.yml` file.

## The Requirements

### Main Requirements

- Change `User` model from storing the `age` field as a number to instead storing a birthdate field
  - `User` model should still have an `age` getter that calculates the age in years, and this field ***must*** still
    exist in json output
  - You can assume that all existing user birthdays are on Jan 1st of the appropriate year based on their age
- Add a GET handler to output all available users in the system
- Add a handler to update a `User`
  - Only the firstName, lastName, and birthdate fields should be editable, attempts to edit other fields should result
    in a 400 response
  - either a PUT or PATCH based approach here will be accepted
- Add a DELETE handler to delete a `User`

### Intermediate Requirements

- Add a `Post` model representing text posts made by a `User`
  - Add all CRUD Routes for these `Post` objects
  - A `Post` should capture the following info:
    - Title
    - Post body
    - Post date
    - Last edited date (You can assume only the `User` that created the post can edit)
  - Setup a One-to-Many relationship between `Posts` and `Users` on each of their models
- Add a route to get all `Posts` for a specific `User` by their id
- For the endpoint you added to fetch all `Users`, add pagination to that endpoint
  - You can assume any query parameter structure for this as you need as long as the requester can specify
    - page size
    - current requested page #
  - The response body should include:
    - how many pages are left
    - the results themselves
- Add in [Winston](https://github.com/winstonjs/winston) as a logger and change all log points to output JSON logs
  - Also add logging instrumentation to all routes for error/warning cases.

### Senior Requirements

- Add a POST endpoint to search for `Posts` matching against their title.
  - Full fuzzy searching is not required, simple wildcard matching is acceptable
- Add a fake "Event Service" module
  - The fake event service should behave like kafka/eventstore in that events are raised in 'topics'
  - wire it up to each of the CUD (no R) handlers to raise events for each of these.
  - The api for raising events should enforce at the type level and **runtime** level that events raised have
    a `version` and `type` field.
  - The event service should export some kind of mock interface/mode that allows for integration tests to validate
    that events get raised for the correct topic

### Bonus Requirements

Completing these requirements is *not* required, and will only be counted against your evaluation assuming you have
completed the other requirements for your role.

You also don't have to complete **all** these bonus ones either, they are scored individually

- Update the data-source to allow loading either Postgres or Sqlite based on the `NODE_ENV` env variable
  - `production` = postgres mode
  - anything else = sqlite mode
  - Migrations should be changed from Raw sql to typeorm's generic create/update table statements to allow for
    migrations to run on both systems
  - Change the type of the User::id field to be a UUID
    - It's safe to assume you do not have to create a migration to handle the int -> uuid change here, just update
      the init migration.
- Add a GitHub Action that on commit checks to ensure the tests and lint checks are still passing
- Add a seeds setup for local development and you:
  - Should add a seed for every model
  - Should remove the existing "fake" seed setup for `Users` in the init migration
- Write a TS utility class that models the common "Result" type.
  - expected functionality includes:
    - a way of mapping over the success value
    - chaining map calls
    - a fromPromise helper
    - a way to extract the value out of the Result
    - Full TS type checking; ie solutions that have the extracted value typed as any/unknown will not be counted
  - You do not have to actually use it directly in any endpoints (unless you want to), but this ***must*** be
    extensively unit tested
  - If you've never heard of this type you can use the [Rust version](https://doc.rust-lang.org/std/result/) for
    inspiration (other approaches such as a monadic approach will be accepted as well)

`Note:` not all bonus tasks are weighted evenly, take that into account when choosing which ones to do

## Testing

The repo comes preconfigured with a testing setup that allows for integration testing of endpoints with an in-memory DB.
You will be expected to write integration style tests for the endpoints you add/edit. Please
see [getUserById.test.ts](./test/handlers/getUserById.test.ts) for an example setup/teardown.

The init migration also acts as a seed for the `User` model creating 4 dummy values that you can/should rely on being
there for the tests.

## Rules

- You can use any library that you want/need as long as you write out comments justifying your choices however:
  - You cannot pull in libraries that complete any of the bonus tasks automatically for you (ie you can't
    just import `@badrap/result` and claim you completed the Result type bonus task)
  - You cannot remove any already used libraries, IE: no converting away from TypeORM or Serverless to another tech
    stack
- All endpoints must be crafted in a RESTful manner and follow REST URI scheme rules as well as return JSON responses.
- TypeORM's migration style must be used, you cannot rely on or use the `syncronize` modes and *new* migrations must be
  generated for any DB changes you make
  - You can assume all migrations will be run before the app starts up
  - The "down" side of migrations must be generated as well. You should be able to run all the migrations up, then
    down, then up again without failure
  - Do not edit the `init` migration to include any changes, generate new ones as needed; EXCEPT in the case of the
    bonus tasks that mention editing the init migration directly.

## Considerations / Recommendations

- Treat this like you are building a feature for a pre-existing microservice that is being used by other services and
  all the considerations that brings.
- This is your opportunity to show what you can bring to our engineering team as a BE developer.
- Write clean, reusable and performant code.

## Evaluation

_The assessment will be evaluated based on the following:_

- Code
  - Quality
  - Structure
  - Consistency
  - Comments/Documentation
  - Readability
  - Performance
  - Test Coverage
- Bonus Tasks
