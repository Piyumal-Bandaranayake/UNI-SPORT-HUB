# UniSportHub – Change Log

All notable changes to this project are documented here, in reverse chronological order.

---

## [2026-03-25] – Staff Login Transition (Email Only, Removed Username)

### Files Changed
| File | Type |
|------|------|
| `src/models/SubAdmin.js` | Modified |
| `src/models/Coach.js` | Modified |
| `src/auth.js` | Modified |
| `src/app/api/admin/sub-admins/route.js` | Modified |
| `src/app/api/admin/coaches/route.js` | Modified |
| `src/components/CreateSubAdminForm.jsx` | Modified |
| `src/components/CreateCoachForm.jsx` | Modified |
| `src/app/login/page.jsx` | Modified |

### Description
- **Removed Usernames**: The `username` field has been completely removed from both Sub-Admin and Coach accounts.
- **Email-Only Staff Login**: Staff will now use their **Email Address** as their login ID.
- **Multi-Role Login Support**: The login page now accepts either a **University ID** (for Students/Admins) or an **Email Address** (for Sub-Admins/Coaches).
- **Form Simplification**: Updated the creation forms to only require Name, Email, and Password.
- **Conflict Prevention**: Updated all uniqueness checks to ensure staff emails do not conflict with other account identifiers.

---

## [2026-03-25] – Coach Requirement Update (Username & Email)

### Files Changed
| File | Type |
|------|------|
| `src/models/Coach.js` | Modified |
| `src/auth.js` | Modified |
| `src/app/api/admin/coaches/route.js` | Modified |
| `src/components/CreateCoachForm.jsx` | Modified |

### Description
- Applied the same structural update to **Coaches** as previously done for Sub-Admins:
  - **Model**: Replaced `universityId` with `username` and added a required `email` field.
  - **Authentication**: Updated NextAuth to allow Coaches to log in using their `username`.
  - **API**: Updated creation and listing endpoints to support name, email, and username.
  - **Form UI**: Updated the coach management interface with labels for **Full Name**, **Email Address**, and **Username**.

---

## [2026-03-25] – Sub-Admin Requirement Update (Username & Email)

### Files Changed
| File | Type |
|------|------|
| `src/models/SubAdmin.js` | Modified |
| `src/auth.js` | Modified |
| `src/app/api/admin/sub-admins/route.js` | Modified |
| `src/components/CreateSubAdminForm.jsx` | Modified |

### Description
- Updated the Sub-Admin structural requirements as requested:
  - **Model**: Replaced `universityId` with `username` and added a required `email` field.
  - **Authentication**: Updated NextAuth logic to allow Sub-Admins to log in using their `username` while other users continue using `universityId`.
  - **API**: Updated creation and listing logic to handle the new fields and enforce uniqueness for both username and email.
  - **Form UI**: Updated the sub-admin creation form in the admin dashboard with labels for **Full Name**, **Email Address**, and **Username**.

---

## [2026-03-25] – Placeholder Cleanup on Login Page

### Files Changed
| File | Type |
|------|------|
| `src/app/login/page.jsx` | Modified |

### Description
- Removed the specific `"Ex: ADMIN-001"` placeholder from the University ID field on the login page.
- Updated the placeholder to a more generic `"Enter your University ID"` for a neutral user experience.

---

## [2026-03-25] – Strong Password Enforcement

### Files Changed
| File | Type |
|------|------|
| `src/app/register/page.jsx` | Modified |
| `src/app/api/register/route.js` | Modified |

### Description
- Implemented robust password strength requirements:
  - Minimum 8 characters
  - At least one Uppercase and one Lowercase letter
  - At least one Number
  - At least one Special Character (`@$!%*?&`)
- **UI Enhancements**: Added a dynamic checklist under the password field that turns green as users meet each requirement.
- **API Security**: Server-side regex validation ensures no weak passwords can be registered even if frontend is bypassed.

---

## [2026-03-25] – Enhanced Duplicate Registration Prevention

### Files Changed
| File | Type |
|------|------|
| `src/app/api/register/route.js` | Modified |

### Description
- Refined the duplicate check logic to provide clearer feedback.
- If a student tries to register with an ID or Email that already exists, the system now returns: `"This University ID is already registered. Please login to your account."`
- This prevents multiple accounts for the same student and directs them toward the Login page.

---

## [2026-03-25] – University Email Format Validation (Must Match Registration Number)

### Files Changed
| File | Type |
|------|------|
| `src/app/register/page.jsx` | Modified |
| `src/app/api/register/route.js` | Modified |

### Description
- University email must exactly match `{registrationNumber}@my.sliit.lk` (e.g. `IT12345678@my.sliit.lk`).
- **Client-side**: real-time inline validation — border turns red with a hint message if the email doesn't match. Placeholder dynamically shows the expected email once the registration number is entered.
- **Server-side**: checks `universityEmail === universityId + "@my.sliit.lk"` and rejects mismatches with a clear error message.

---

## [2026-03-25] – Registration Number Format Validation (Faculty Prefix + 8 Digits)

### Files Changed
| File | Type |
|------|------|
| `src/app/register/page.jsx` | Modified |
| `src/app/api/register/route.js` | Modified |

### Description
- Registration number must follow the format `{FACULTY_CODE}{8 digits}` (e.g. `IT12345678`, `ENG12345678`).
- **Client-side**: real-time inline validation under the field — border turns red with a hint message if the ID prefix doesn't match the selected faculty. Placeholder updates dynamically to show the expected format.
- **Server-side**: regex check in the API (`^{faculty}\d{8}$`) so the rule is enforced even if the form is bypassed.

---

## [2026-03-25] – Faculty Dropdown on Registration Form

### Files Changed
| File | Type |
|------|------|
| `src/models/Student.js` | Modified |
| `src/app/api/register/route.js` | Modified |
| `src/app/register/page.jsx` | Modified |

### Description
- Added `faculty` field to the `Student` Mongoose schema with an enum constraint: `IT`, `BM`, `ENG`, `HM`, `AR`, `HU`, `FA`.
- Updated the `/api/register` POST route to extract, validate, and persist the `faculty` field.
- Added a "Faculty" `<select>` dropdown to the registration form UI in `register/page.jsx`.

---

## [2026-03-25] – Auth Session Duration (1 Hour)

### Files Changed
| File | Type |
|------|------|
| `src/auth.config.js` | Modified |
| `src/auth.js` | Modified |

### Description
- Set JWT `maxAge` and session `maxAge` to `3600` seconds (1 hour) in the auth configuration.

---

## [2026-03-24] – Instagram Footer Link Update

### Files Changed
| File | Type |
|------|------|
| `src/components/Footer.jsx` | Modified |

### Description
- Updated Instagram profile URL in the Footer component to the new link.

---

## [2026-03-24] – Loading Page Logo Size Increase

### Files Changed
| File | Type |
|------|------|
| `src/app/page.jsx` (or loading component) | Modified |

### Description
- Increased the logo image dimensions on the loading/splash screen.

---

## [2026-03-24] – Search Bar on Hotels & Packages Pages

### Files Changed
| File | Type |
|------|------|
| `src/components/SearchBar.jsx` | Added |
| Hotels page | Modified |
| Packages page | Modified |

### Description
- Created a reusable `SearchBar` component with premium styling.
- Integrated search/filter functionality on Hotels and Packages pages.

---

## [2026-03-24] – About Us Page & SEO Enhancements

### Files Changed
| File | Type |
|------|------|
| `src/app/about/page.jsx` | Added |
| `src/components/Navbar.jsx` | Modified |
| `src/components/Footer.jsx` | Modified |
| `src/app/layout.jsx` | Modified |

### Description
- Created "About Us" page with premium design.
- Integrated page into navigation and footer.
- Updated SEO metadata and sitemap.

---

## [2026-03-24] – Removed Scenic Spot Tags

### Files Changed
| File | Type |
|------|------|
| `src/components/DistrictPlaces.jsx` | Modified |

### Description
- Removed "SCENIC SPOT" tag rendering from card components.

---

## [2026-03-23] – Admin Dashboard Responsiveness

### Files Changed
| File | Type |
|------|------|
| `src/app/dashboard/**` | Modified |

### Description
- Fixed layout and mobile navigation issues in the admin dashboard for smaller screens.

---

## [2026-03-22] – Organized Famous Places Images

### Files Changed
| File | Type |
|------|------|
| `public/images/famous-places/**` | Reorganized |
| Multiple JS files | Modified |

### Description
- Moved famous places images into a dedicated directory.
- Updated all image path references across the project.
