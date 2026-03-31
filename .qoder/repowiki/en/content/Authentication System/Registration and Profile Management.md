# Registration and Profile Management

<cite>
**Referenced Files in This Document**
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)
- [app/api/auth/me/route.ts](file://app/api/auth/me/route.ts)
- [models/User.ts](file://models/User.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)
- [middleware.ts](file://middleware.ts)
- [components/auth/register-form.tsx](file://components/auth/register-form.tsx)
- [components/auth/login-form.tsx](file://components/auth/login-form.tsx)
- [app/api/auth/login/route.ts](file://app/api/auth/login/route.ts)
- [app/api/auth/logout/route.ts](file://app/api/auth/logout/route.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document provides comprehensive documentation for user registration and profile management functionality. It covers the registration API endpoint, including user validation, duplicate email checking, and secure password hashing. It also explains the profile retrieval endpoint for authenticated users and data protection measures. The registration form implementation, input validation, and error handling are detailed, along with user role assignment, default permissions, and profile update capabilities. Examples of registration workflows, validation errors, and profile data structures are included to aid understanding and implementation.

## Project Structure
The registration and profile management system spans several layers:
- API routes handle HTTP requests for registration, login, logout, and profile retrieval.
- Authentication utilities manage password hashing, token signing, and verification.
- Middleware enforces session-based access control.
- Mongoose models define user data structures and constraints.
- Client-side components provide the registration and login forms.

```mermaid
graph TB
subgraph "Client"
RF["Register Form<br/>(components/auth/register-form.tsx)"]
LF["Login Form<br/>(components/auth/login-form.tsx)"]
end
subgraph "Server"
MW["Middleware<br/>(middleware.ts)"]
MH["Middleware Helpers<br/>(lib/middleware-helpers.ts)"]
AUTH["Auth Utils<br/>(lib/auth.ts)"]
DB["Database<br/>(models/User.ts)"]
end
subgraph "API Routes"
REG["Register Route<br/>(app/api/auth/register/route.ts)"]
ME["Profile Route<br/>(app/api/auth/me/route.ts)"]
LOGIN["Login Route<br/>(app/api/auth/login/route.ts)"]
LOGOUT["Logout Route<br/>(app/api/auth/logout/route.ts)"]
end
RF --> REG
LF --> LOGIN
MW --> MH
MH --> ME
REG --> AUTH
LOGIN --> AUTH
REG --> DB
LOGIN --> DB
ME --> DB
LOGOUT --> MH
```

**Diagram sources**
- [components/auth/register-form.tsx](file://components/auth/register-form.tsx)
- [components/auth/login-form.tsx](file://components/auth/login-form.tsx)
- [middleware.ts](file://middleware.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [models/User.ts](file://models/User.ts)
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)
- [app/api/auth/me/route.ts](file://app/api/auth/me/route.ts)
- [app/api/auth/login/route.ts](file://app/api/auth/login/route.ts)
- [app/api/auth/logout/route.ts](file://app/api/auth/logout/route.ts)

**Section sources**
- [components/auth/register-form.tsx](file://components/auth/register-form.tsx)
- [components/auth/login-form.tsx](file://components/auth/login-form.tsx)
- [middleware.ts](file://middleware.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [models/User.ts](file://models/User.ts)
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)
- [app/api/auth/me/route.ts](file://app/api/auth/me/route.ts)
- [app/api/auth/login/route.ts](file://app/api/auth/login/route.ts)
- [app/api/auth/logout/route.ts](file://app/api/auth/logout/route.ts)

## Core Components
- Registration API: Validates input, checks for duplicate emails, hashes passwords, creates users, and returns sanitized data.
- Profile Retrieval API: Authenticates requests via cookies, verifies tokens, and returns user data excluding sensitive fields.
- Authentication Utilities: Provides password hashing, password comparison, JWT signing, and token verification.
- Middleware: Enforces token presence for protected routes and redirects unauthenticated users.
- User Model: Defines schema, constraints, default roles, and indexes for efficient lookups.
- Registration Form: Client-side form with real-time validation and submission handling.
- Login Form: Client-side form for authentication and role-based redirection.

**Section sources**
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)
- [app/api/auth/me/route.ts](file://app/api/auth/me/route.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)
- [middleware.ts](file://middleware.ts)
- [models/User.ts](file://models/User.ts)
- [components/auth/register-form.tsx](file://components/auth/register-form.tsx)
- [components/auth/login-form.tsx](file://components/auth/login-form.tsx)

## Architecture Overview
The system follows a layered architecture:
- Presentation Layer: Client-side forms submit requests to API routes.
- Application Layer: API routes orchestrate validation, persistence, and response generation.
- Domain Layer: Authentication utilities encapsulate security logic.
- Infrastructure Layer: Middleware enforces access control; Mongoose models define persistence.

```mermaid
sequenceDiagram
participant Client as "Client Browser"
participant RegRoute as "Register Route"
participant AuthUtil as "Auth Utils"
participant DB as "User Model"
Client->>RegRoute : "POST /api/auth/register"
RegRoute->>RegRoute : "Validate input fields"
RegRoute->>RegRoute : "Validate email format"
RegRoute->>RegRoute : "Validate password length"
RegRoute->>DB : "Check duplicate email"
DB-->>RegRoute : "Existing user?"
alt "Duplicate email"
RegRoute-->>Client : "409 Conflict : User exists"
else "Unique email"
RegRoute->>AuthUtil : "Hash password"
AuthUtil-->>RegRoute : "Hashed password"
RegRoute->>DB : "Create user with defaults"
DB-->>RegRoute : "New user"
RegRoute-->>Client : "201 Created : User data (no password)"
end
```

**Diagram sources**
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [models/User.ts](file://models/User.ts)

**Section sources**
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [models/User.ts](file://models/User.ts)

## Detailed Component Analysis

### Registration API Endpoint
The registration endpoint performs:
- Input validation for required fields, email format, and password length.
- Duplicate email detection using database query.
- Secure password hashing using bcrypt.
- User creation with default role assignment and optional department.
- Response sanitization to exclude sensitive fields.

```mermaid
flowchart TD
Start(["POST /api/auth/register"]) --> Parse["Parse JSON body"]
Parse --> ValidateReq{"Required fields present?"}
ValidateReq --> |No| Err400Req["400 Bad Request: Missing fields"]
ValidateReq --> |Yes| ValidateEmail["Validate email format"]
ValidateEmail --> EmailValid{"Valid email?"}
EmailValid --> |No| Err400Email["400 Bad Request: Invalid email"]
EmailValid --> |Yes| ValidatePass["Validate password length"]
ValidatePass --> PassValid{"Length >= 6?"}
PassValid --> |No| Err400Pass["400 Bad Request: Weak password"]
PassValid --> |Yes| CheckDup["Check duplicate email"]
CheckDup --> Exists{"Email exists?"}
Exists --> |Yes| Err409["409 Conflict: User exists"]
Exists --> |No| Hash["Hash password"]
Hash --> Create["Create user with defaults"]
Create --> Success["201 Created: User data (no password)"]
```

**Diagram sources**
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)

**Section sources**
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)

### Profile Retrieval Endpoint
The profile retrieval endpoint authenticates requests by:
- Extracting and verifying the JWT token from cookies.
- Returning user data excluding sensitive fields.
- Handling missing authentication and user-not-found scenarios.

```mermaid
sequenceDiagram
participant Client as "Client Browser"
participant ProfileRoute as "Profile Route"
participant MH as "Middleware Helpers"
participant DB as "User Model"
Client->>ProfileRoute : "GET /api/auth/me"
ProfileRoute->>MH : "getAuthUser()"
MH-->>ProfileRoute : "JWTPayload or null"
alt "No token"
ProfileRoute-->>Client : "401 Unauthorized"
else "Valid token"
ProfileRoute->>DB : "Find user by ID"
DB-->>ProfileRoute : "User or null"
alt "User not found"
ProfileRoute-->>Client : "404 Not Found"
else "User found"
ProfileRoute-->>Client : "200 OK : User data (no password)"
end
end
```

**Diagram sources**
- [app/api/auth/me/route.ts](file://app/api/auth/me/route.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)
- [models/User.ts](file://models/User.ts)

**Section sources**
- [app/api/auth/me/route.ts](file://app/api/auth/me/route.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)
- [models/User.ts](file://models/User.ts)

### Authentication Utilities
Key responsibilities:
- Password hashing with bcrypt at 12 rounds.
- Password comparison for login verification.
- JWT signing with 7-day expiry and secure cookie attributes.
- JWT verification returning typed payload or null.

```mermaid
classDiagram
class AuthUtils {
+hashPassword(password) Promise~string~
+comparePassword(password, hash) Promise~boolean~
+signToken(payload) string
+verifyToken(token) JWTPayload|null
}
```

**Diagram sources**
- [lib/auth.ts](file://lib/auth.ts)

**Section sources**
- [lib/auth.ts](file://lib/auth.ts)

### Middleware and Access Control
- Middleware enforces token presence for protected routes and redirects unauthenticated users to login with a redirect parameter.
- Middleware Helpers extract and verify tokens, returning typed payloads or null.
- API routes perform role-based verification when needed.

```mermaid
flowchart TD
Req["Incoming Request"] --> PathCheck{"Path matches protected routes?"}
PathCheck --> |No| Allow["Allow request"]
PathCheck --> |Yes| TokenCheck{"Cookie 'token' present?"}
TokenCheck --> |No| Redirect["Redirect to /login?redirect=pathname"]
TokenCheck --> |Yes| Allow
```

**Diagram sources**
- [middleware.ts](file://middleware.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)

**Section sources**
- [middleware.ts](file://middleware.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)

### User Model and Schema
The User model defines:
- Required fields: name, email, password.
- Unique and indexed email field.
- Role enumeration with default "employee".
- Optional department field with trimming.
- Timestamps and hidden password selection by default.

```mermaid
erDiagram
USER {
string name
string email
string password
string role
string department
date createdAt
date updatedAt
}
```

**Diagram sources**
- [models/User.ts](file://models/User.ts)

**Section sources**
- [models/User.ts](file://models/User.ts)

### Registration Form Implementation
Client-side validation and submission:
- Real-time validation for name, email, password length, and password confirmation.
- Submission handling with error display and success redirection.
- Department selection via dropdown with optional values.

```mermaid
sequenceDiagram
participant User as "User"
participant Form as "Register Form"
participant API as "Register Route"
User->>Form : "Fill form and submit"
Form->>Form : "validateForm()"
alt "Validation fails"
Form-->>User : "Display error message"
else "Validation passes"
Form->>API : "POST /api/auth/register"
alt "API error"
API-->>Form : "Error response"
Form-->>User : "Display error message"
else "Success"
API-->>Form : "Success response"
Form-->>User : "Redirect to /login"
end
end
```

**Diagram sources**
- [components/auth/register-form.tsx](file://components/auth/register-form.tsx)
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)

**Section sources**
- [components/auth/register-form.tsx](file://components/auth/register-form.tsx)
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)

### Login Workflow and Role-Based Redirection
- Client-side form validates inputs and submits credentials.
- Server compares password with stored hash and signs a JWT.
- Cookie is set with secure attributes; response excludes sensitive data.
- Client redirects based on user role.

```mermaid
sequenceDiagram
participant User as "User"
participant LoginForm as "Login Form"
participant LoginRoute as "Login Route"
participant AuthUtil as "Auth Utils"
participant DB as "User Model"
User->>LoginForm : "Submit credentials"
LoginForm->>LoginRoute : "POST /api/auth/login"
LoginRoute->>DB : "Find user by email (+password)"
DB-->>LoginRoute : "User or null"
alt "User not found"
LoginRoute-->>LoginForm : "401 Unauthorized"
else "User found"
LoginRoute->>AuthUtil : "comparePassword()"
AuthUtil-->>LoginRoute : "boolean"
alt "Password invalid"
LoginRoute-->>LoginForm : "401 Unauthorized"
else "Valid credentials"
LoginRoute->>AuthUtil : "signToken()"
AuthUtil-->>LoginRoute : "JWT"
LoginRoute-->>LoginForm : "200 OK with cookie and user data"
LoginForm-->>User : "Redirect to /admin or /employee"
end
end
```

**Diagram sources**
- [components/auth/login-form.tsx](file://components/auth/login-form.tsx)
- [app/api/auth/login/route.ts](file://app/api/auth/login/route.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [models/User.ts](file://models/User.ts)

**Section sources**
- [components/auth/login-form.tsx](file://components/auth/login-form.tsx)
- [app/api/auth/login/route.ts](file://app/api/auth/login/route.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [models/User.ts](file://models/User.ts)

## Dependency Analysis
The system exhibits clear separation of concerns:
- API routes depend on authentication utilities and the User model.
- Middleware relies on cookie extraction and token verification.
- Client forms depend on API routes for submission and redirection logic.

```mermaid
graph LR
REG["Register Route"] --> AUTH["Auth Utils"]
REG --> DB["User Model"]
LOGIN["Login Route"] --> AUTH
LOGIN --> DB
ME["Profile Route"] --> MH["Middleware Helpers"]
ME --> DB
MH --> AUTH
MW["Middleware"] --> MH
RF["Register Form"] --> REG
LF["Login Form"] --> LOGIN
```

**Diagram sources**
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)
- [app/api/auth/login/route.ts](file://app/api/auth/login/route.ts)
- [app/api/auth/me/route.ts](file://app/api/auth/me/route.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)
- [middleware.ts](file://middleware.ts)
- [models/User.ts](file://models/User.ts)
- [components/auth/register-form.tsx](file://components/auth/register-form.tsx)
- [components/auth/login-form.tsx](file://components/auth/login-form.tsx)

**Section sources**
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)
- [app/api/auth/login/route.ts](file://app/api/auth/login/route.ts)
- [app/api/auth/me/route.ts](file://app/api/auth/me/route.ts)
- [lib/auth.ts](file://lib/auth.ts)
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)
- [middleware.ts](file://middleware.ts)
- [models/User.ts](file://models/User.ts)
- [components/auth/register-form.tsx](file://components/auth/register-form.tsx)
- [components/auth/login-form.tsx](file://components/auth/login-form.tsx)

## Performance Considerations
- Password hashing uses bcrypt with 12 rounds, balancing security and performance.
- Email lookups benefit from an index on the email field in the User model.
- Token verification occurs in API routes after middleware ensures token presence.
- Cookies are configured with secure attributes to minimize exposure risks.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Authentication required: Occurs when accessing protected endpoints without a valid token cookie. Ensure login succeeds and the cookie is set.
- Admin access required: Occurs when non-admin users attempt admin-only operations. Verify user role assignment.
- Invalid email or password: Occurs on login with incorrect credentials. Confirm email casing normalization and password strength.
- User with this email already exists: Registration fails if email is duplicated. Prompt user to use another email or log in.
- Internal server error: Indicates server-side failures. Check server logs and environment variables, especially JWT secret configuration.

**Section sources**
- [lib/middleware-helpers.ts](file://lib/middleware-helpers.ts)
- [middleware.ts](file://middleware.ts)
- [app/api/auth/register/route.ts](file://app/api/auth/register/route.ts)
- [app/api/auth/login/route.ts](file://app/api/auth/login/route.ts)
- [lib/auth.ts](file://lib/auth.ts)

## Conclusion
The registration and profile management system provides a secure, layered approach to user lifecycle management. It enforces robust validation, protects sensitive data, and offers clear client-server interactions. The modular design facilitates maintainability and extensibility while ensuring consistent behavior across authentication and profile operations.