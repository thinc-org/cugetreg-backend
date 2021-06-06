# CU Get Reg API Documentation

Last updated: 2/16/2021

## Table of contents

1. [GraphQL Queries and Mutations](#graphql-queries-and-mutations)
2. [Authentication Flow](#authentication-flow)
3. [Retrieving Google's Access Token](#retrieving-google's-access-token)

## GraphQL Queries and Mutations

### **Course**

#### Input Types

```graphql
input FilterInput {
  keyword: String
  genEdTypes: [GenEdType!]
  dayOfWeeks: [DayOfWeek!]
  limit: Int
  offset: Int
}

input CourseGroupInput {
  semester: String!
  academicYear: String!
  studyProgram: StudyProgram!
}
```

#### Queries

```graphql
courses: [Course!]!
```

Returns all courses stored on backend, fetched from scraper.

```graphql
course(courseNo: String!, courseGroup: CourseGroupInput!): Course!
```

Returns a single course with given courseNo and courseGroup (semester, academicYear, and studentProgram).

```graphql
search(filter: FilterInput!, courseGroup: CourseGroupInput!): [Course!]!
```

Returns a list of courses matching the given filter.  
Note: noConflict filter currently not implemented.

### **Review**

#### Input Types

```graphql
enum Interaction {
  L
  D
}

input CreateReviewInput {
  rating: Int!
  courseNo: String!
  semester: String!
  academicYear: String!
  studyProgram: StudyProgram!
  content: String
}
```

#### Queries

```graphql
reviews(courseNo: String!, studyProgram: StudyProgram!): [Review!]!
```

Returns all reviews of the course that matches the input.

#### Mutations

```graphql
createReview(createReviewInput: CreateReviewInput!): Review!
```

Creates a review with the given input. The review will have a `PENDING` status and must be approved by an admin.

```graphql
removeReview(reviewId: String!): Review!
```

Removes the review with the given `reviewId`. Only review owner can remove their own review.

```graphql
setInteraction(reviewId: String!, interaction: Interaction!): Review!
```

Likes or dislikes the given review, depending on `interaction`. To unlike or undislike, simple call the mutation again with the same interaction.

### **User**

#### Queries

```graphql
me: User
```

Returns the current user's info.

## Authentication Flow

> For full information about Google's OAuth 2.0 Authentication Flow, please see the [official documentation](https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient).

The backend API uses Google has the OAuth provider of choice. To summarize:

### 1. Initiate OAuth 2.0 request

Redirect to `https://accounts.google.com/o/oauth2/v2/auth` with the following query parameters:
| Parameters | Value |
| --- | --- |
| client_id | Must be set to `297489937770-g4p9q7jsmgaddbl074tbn9b6j2ba2kf4.apps.googleusercontent.com` (staging). |
| redirect_uri | Your frontend's callback URI which can handle the code in the query string and send to backend for verification. For Render PR Deployments, this value must be set to backend's callback URI which is `https://cugetreg.com/api/auth/callback` (production) or `https://<STAGING_HOST>/api/auth/callback` (staging).
| response_type | Must be set to `code`. |
| scope | Must be set to `openid+profile+email+https://www.googleapis.com/auth/drive.appdata`. |
| access_type | Must be set to `offline`. |
| include_granted_scopes | Should be `true`. See [Incremental Authorization](https://developers.google.com/identity/protocols/oauth2/web-server#incrementalAuth) |.
| state | Only set this parameter for PR Deployments. Use this parameter to set the `returnURI` so backend knows where to redirect after Google sends the authorization code to backend. For example: `returnURI=https://cugetreg-pr-x.render.com/auth/callback` |

For Render PR Deployments, normal authentication flow is impossible (as the domain will change every pr, and every redirect uri must be manually authorized in the Google Cloud Console).

To fix this, frontend must set the redirectURI to backend's callback endpoint (`/api/auth/callback`) and set the `returnURI` value in `state` parameter to the deployment's callback path. For example: `returnURI=https://cugetreg-pr-x.render.com/auth/callback`.

### 2. Google prompts user for consent.

Nothing to do here. Just wait for user to confirm the permissions we're asking.

### 3. Handle the OAuth 2.0 server response

Google redirects to the URI stated above (redirect_uri) containing the authorization code. In normal environments (staging and production), the redirect URI should be a frontend path that extracts the authorization code from the query parameter and send to backend for verification.

To send the code to backend for verification, use the following mutation and GraphQL variables.

```graphql
mutation verify($code: String!, $redirectURI: String!) {
  verify(code: $code, redirectURI: $redirectURI) {
    accessToken
    _id
    firstName
  }
}
```

| Variable    | Description                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------- |
| code        | The authorization code in the query parameter                                               |
| redirectURI | The same redirect URI used during OAuth [initiation request](#1-initiate-oauth-20-request). |

The verify mutation returns the following response
| Field | Description |
| --- | --- |
| accessToken | The JWT access token used to access protected or current-user-specific resources. The payload contains `_id` and `firstName`. |
| \_id | The user's ObjectId |
| firstName | The user's first name |

Store the accessToken somewhere safe and include this token in the header of every request.

## Retrieving Google's Access Token

To access Google Drive API for storing timetable data, you need the user's access token. Access token can be retrieved by calling `me` GraphQL query in `google.accessToken` field. The access token's expire date is stored in `google.expiresIn` field. To refresh the token, simply call `me` query again as backend already handles refreshing access tokens if token is already expired.

_Note: Don't forget to put our own JWT access token in the header to call `me` query._
